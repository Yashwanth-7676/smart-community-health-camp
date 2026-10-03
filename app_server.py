"""Local SmartCare server with a server-side Gemini proxy for Yash AI.

This server intentionally binds to loopback only. It is suitable for the
fictional classroom demo, not as a production health-data service.
"""

import json
import os
import re
import threading
import time
from collections import defaultdict, deque
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
MAX_BODY_BYTES = 8_192
MAX_PROMPT_LENGTH = 1_000
SAFE_AGGREGATE_FIELDS = ("registrations", "waiting", "consultations", "referrals", "lowStock")
ALLOWED_STATIC_SUFFIXES = {".css", ".html", ".js", ".json", ".svg"}
FICTIONAL_DATA_NOTICE = "Generated from fictional SmartCare Camp demo data."
REQUEST_HISTORY = defaultdict(deque)
REQUEST_HISTORY_LOCK = threading.Lock()


def load_local_env():
    """Load a local .env without overriding real environment variables.

    The file is deliberately excluded from static serving and source control.
    A dependency-free loader keeps this demo simple; production deployments
    should inject secrets through their hosting platform's secret manager.
    """

    env_file = ROOT / ".env"
    if not env_file.is_file():
        return
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        name = name.strip()
        value = value.strip().strip('"').strip("'")
        if name and name not in os.environ:
            os.environ[name] = value


def get_int_env(name, default, minimum, maximum):
    try:
        return max(minimum, min(int(os.environ.get(name, default)), maximum))
    except (TypeError, ValueError):
        return default


load_local_env()
PORT = get_int_env("PORT", 8000, 1, 65535)
AI_TIMEOUT_SECONDS = get_int_env("AI_REQUEST_TIMEOUT_SECONDS", 12, 3, 30)
AI_RATE_LIMIT = get_int_env("AI_RATE_LIMIT", 10, 1, 60)
AI_RATE_WINDOW_SECONDS = get_int_env("AI_RATE_WINDOW_SECONDS", 60, 10, 3_600)
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash").strip() or "gemini-2.0-flash"

CLINICAL_REQUEST_PATTERN = re.compile(
    r"\b(diagnos(?:is|es|e)?|disease|symptom|prescrib(?:e|ing|ed)|"
    r"medicine\s+(?:should|for)|treatment|emergency|urgent(?:\s+treatment)?|"
    r"referral\s+decision|should\s+.*refer|individual\s+risk|predict\s+.*risk)\b",
    re.IGNORECASE,
)
SENSITIVE_REQUEST_PATTERN = re.compile(
    r"(?:[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s().-]{7,}\d|"
    r"\b(?:phone\s+number|mobile\s+number|home\s+address|aadhaar|government\s+id|"
    r"medical\s+history|patient\s+details?)\b)",
    re.IGNORECASE,
)


class ClientRequestError(ValueError):
    """Raised when a browser request violates the public API contract."""


def provider_is_configured():
    return bool(os.environ.get("GEMINI_API_KEY", "").strip())


def safe_aggregate(value):
    if not isinstance(value, dict):
        raise ClientRequestError("Aggregate data is required.")
    cleaned = {}
    for field in SAFE_AGGREGATE_FIELDS:
        item = value.get(field, 0)
        if isinstance(item, bool) or not isinstance(item, int) or not 0 <= item <= 100_000:
            raise ClientRequestError("Aggregate values must be whole-number counts.")
        cleaned[field] = item
    return cleaned


def safety_refusal(prompt):
    if CLINICAL_REQUEST_PATTERN.search(prompt):
        return (
            "I cannot diagnose, prescribe, recommend treatment, make referral decisions, "
            "predict individual risk, or provide emergency instructions. Please consult a "
            f"qualified healthcare professional. I can help with aggregate fictional camp operations.\n\n{FICTIONAL_DATA_NOTICE}"
        )
    if SENSITIVE_REQUEST_PATTERN.search(prompt):
        return (
            "I cannot process identifying or medical information. Remove names, contact details, "
            "identification numbers, and patient history, then ask for an aggregate fictional "
            f"operations summary instead.\n\n{FICTIONAL_DATA_NOTICE}"
        )
    return None


def gemini_response(prompt, aggregate):
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Real AI is not configured.")

    instruction = (
        "You are Yash AI for the fictional SmartCare Camp demonstration. Provide administrative "
        "and educational assistance only. Never diagnose, prescribe, recommend treatment, make "
        "referral decisions, predict individual risk, or provide emergency instructions. Use only "
        "the supplied aggregate fictional counts. Do not ask for or infer personal data. Clearly "
        "state that the response uses fictional SmartCare Camp demo data."
    )
    payload = {
        "system_instruction": {"parts": [{"text": instruction}]},
        "contents": [{"parts": [{"text": f"Aggregate fictional data: {json.dumps(aggregate)}\nUser request: {prompt}"}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 500},
    }
    request = Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{quote(GEMINI_MODEL, safe='-_.')}:generateContent",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    with urlopen(request, timeout=AI_TIMEOUT_SECONDS) as response:
        result = json.loads(response.read().decode("utf-8"))
    text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
    if not isinstance(text, str) or not text.strip():
        raise RuntimeError("The AI provider returned no response.")
    cleaned = text.strip()
    return cleaned if FICTIONAL_DATA_NOTICE.lower() in cleaned.lower() else f"{cleaned}\n\n{FICTIONAL_DATA_NOTICE}"


class SmartCareHandler(SimpleHTTPRequestHandler):
    server_version = "SmartCare"
    sys_version = ""

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob: https://images.unsplash.com https://api.qrserver.com; "
            "connect-src 'self'; worker-src 'self'; base-uri 'self'; "
            "form-action 'self'; frame-ancestors 'none'",
        )
        super().end_headers()

    def log_message(self, format, *args):
        # Keep server logs useful without storing prompts or aggregate request data.
        print(f"{self.client_address[0]} - {format % args}")

    def write_json(self, value, status=HTTPStatus.OK):
        encoded = json.dumps(value).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def request_is_same_origin(self):
        origin = self.headers.get("Origin")
        if not origin:
            return True  # Allows local command-line health checks; the server is loopback-only.
        parsed = urlparse(origin)
        return parsed.scheme == "http" and parsed.netloc in {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}

    def consume_rate_limit(self):
        now = time.monotonic()
        client = self.client_address[0]
        with REQUEST_HISTORY_LOCK:
            history = REQUEST_HISTORY[client]
            while history and now - history[0] >= AI_RATE_WINDOW_SECONDS:
                history.popleft()
            if len(history) >= AI_RATE_LIMIT:
                return False
            history.append(now)
        return True

    def read_json_body(self):
        if not self.headers.get("Content-Type", "").lower().startswith("application/json"):
            raise ClientRequestError("Content-Type must be application/json.")
        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError as error:
            raise ClientRequestError("A valid Content-Length header is required.") from error
        if not 1 <= content_length <= MAX_BODY_BYTES:
            raise ClientRequestError("Request body is too large.")
        try:
            body = json.loads(self.rfile.read(content_length))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ClientRequestError("Request body must be valid JSON.") from error
        if not isinstance(body, dict):
            raise ClientRequestError("Request body must be a JSON object.")
        return body

    def do_POST(self):
        if urlparse(self.path).path != "/api/yash-ai":
            self.write_json({"error": "API route not found."}, HTTPStatus.NOT_FOUND)
            return
        if not self.request_is_same_origin():
            self.write_json({"error": "Cross-origin requests are not allowed."}, HTTPStatus.FORBIDDEN)
            return
        if not self.consume_rate_limit():
            self.write_json({"error": "Too many AI requests. Please wait a minute and try again."}, HTTPStatus.TOO_MANY_REQUESTS)
            return
        try:
            body = self.read_json_body()
            prompt = body.get("prompt")
            if not isinstance(prompt, str) or not (prompt := prompt.strip()):
                raise ClientRequestError("Prompt is required.")
            if len(prompt) > MAX_PROMPT_LENGTH:
                raise ClientRequestError("Prompt is too long.")
            aggregate = safe_aggregate(body.get("aggregate"))
            refusal = safety_refusal(prompt)
            if refusal:
                self.write_json({"mode": "safety-refusal", "response": refusal})
                return
            text = gemini_response(prompt, aggregate)
            self.write_json({"mode": "real", "response": text})
        except ClientRequestError as error:
            self.write_json({"error": str(error)}, HTTPStatus.BAD_REQUEST)
        except RuntimeError:
            self.write_json({"mode": "demo-fallback", "error": "Real AI is not configured or did not return a response."}, HTTPStatus.SERVICE_UNAVAILABLE)
        except (HTTPError, URLError, TimeoutError):
            self.write_json({"mode": "demo-fallback", "error": "The AI provider is currently unavailable."}, HTTPStatus.BAD_GATEWAY)
        except Exception:
            self.write_json({"mode": "demo-fallback", "error": "The AI provider is currently unavailable."}, HTTPStatus.BAD_GATEWAY)

    def serve_static(self):
        parsed = urlparse(self.path)
        requested = "/index.html" if parsed.path in ("", "/") else parsed.path
        candidate = (ROOT / requested.lstrip("/")).resolve()
        try:
            candidate.relative_to(ROOT)
        except ValueError:
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if (
            not candidate.is_file()
            or any(part.startswith(".") for part in candidate.relative_to(ROOT).parts)
            or candidate.suffix.lower() not in ALLOWED_STATIC_SUFFIXES
        ):
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.path = requested
        super().do_GET()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/yash-ai/status":
            self.write_json({"mode": "real" if provider_is_configured() else "demo"})
            return
        if parsed.path == "/api/yash-ai":
            self.write_json({"error": "Use POST for this route."}, HTTPStatus.METHOD_NOT_ALLOWED)
            return
        self.serve_static()

    def do_HEAD(self):
        # Do not let HEAD expose files that GET deliberately keeps private.
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)


if __name__ == "__main__":
    os.chdir(ROOT)
    print(f"SmartCare server running at http://{HOST}:{PORT}")
    print("Yash AI mode:", "Real (server-side Gemini key)" if provider_is_configured() else "Demo fallback")
    ThreadingHTTPServer((HOST, PORT), SmartCareHandler).serve_forever()
