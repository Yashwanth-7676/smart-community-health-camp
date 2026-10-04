const canvas = document.getElementById("heroScene");
const hero = canvas?.closest(".hero");

if (canvas instanceof HTMLCanvasElement && hero) {
  const card = hero.querySelector(".overview-card");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const lowPowerDevice = navigator.connection?.saveData
    || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2);
  const context = canvas.getContext("2d", { alpha: true });

  let animationFrame = 0;
  let isVisible = false;
  let pointerX = 0;
  let pointerY = 0;
  let elapsed = 0;
  let previousTime = 0;
  let width = 0;
  let height = 0;
  let particles = [];

  hero.dataset.scene = "fallback";
  canvas.hidden = true;

  const resizeCanvas = () => {
    if (!context) return;
    const bounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = Array.from({ length: Math.min(52, Math.round(width / 20)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.7 + Math.random() * 1.4,
      alpha: 0.14 + Math.random() * 0.3,
      drift: 4 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
    }));
    if (!isVisible) drawScene(0);
  };

  const drawScene = (time) => {
    if (!context || !width || !height) return;

    const reduced = motionPreference.matches || document.body.classList.contains("reduce-motion");
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time || previousTime;
    if (!reduced) elapsed += delta;

    const centerX = width * 0.72 + pointerX * 12;
    const centerY = height * 0.47 + pointerY * 10 + Math.sin(elapsed * 0.7) * 5;
    const scale = Math.min(width / 900, height / 560, 1.05);
    const rotate = pointerX * 0.08 + Math.sin(elapsed * 0.24) * 0.035;

    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      const y = (particle.y + elapsed * particle.drift) % height;
      context.beginPath();
      context.arc(particle.x, y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(202, 255, 243, ${particle.alpha})`;
      context.fill();
    });

    context.save();
    context.translate(centerX, centerY);
    context.rotate(rotate);

    const orbitColors = [
      "rgba(129, 242, 218, .38)",
      "rgba(167, 173, 255, .35)",
      "rgba(114, 202, 239, .22)",
    ];
    [1, -1, 1].forEach((direction, index) => {
      context.save();
      context.rotate(direction * (0.32 + index * 0.28) + elapsed * (0.08 + index * 0.025));
      context.scale(1, 0.32 + index * 0.08);
      context.beginPath();
      context.ellipse(0, 0, (132 + index * 29) * scale, (132 + index * 29) * scale, 0, 0, Math.PI * 2);
      context.strokeStyle = orbitColors[index];
      context.lineWidth = index === 1 ? 1 : 1.4;
      context.setLineDash(index === 1 ? [3, 8] : []);
      context.stroke();
      context.restore();
    });

    context.scale(scale, scale);
    context.translate(pointerX * 9, pointerY * 6);

    const heartPath = new Path2D();
    heartPath.moveTo(0, 74);
    heartPath.bezierCurveTo(-14, 58, -68, 28, -68, -10);
    heartPath.bezierCurveTo(-68, -50, -17, -58, 0, -25);
    heartPath.bezierCurveTo(17, -58, 68, -50, 68, -10);
    heartPath.bezierCurveTo(68, 28, 14, 58, 0, 74);

    context.save();
    context.translate(0, 9);
    context.scale(1.02, 0.96);
    context.fillStyle = "rgba(4, 26, 40, .42)";
    context.shadowColor = "rgba(91, 237, 207, .4)";
    context.shadowBlur = 34;
    context.fill(heartPath);
    context.restore();

    context.save();
    context.translate(0, 7);
    context.scale(1.015, 0.98);
    context.fillStyle = "#287d90";
    context.fill(heartPath);
    context.restore();

    const heartGradient = context.createLinearGradient(-55, -54, 50, 62);
    heartGradient.addColorStop(0, "#c3ffe6");
    heartGradient.addColorStop(0.48, "#74e4d1");
    heartGradient.addColorStop(1, "#769ef2");
    context.fillStyle = heartGradient;
    context.strokeStyle = "rgba(239, 255, 250, .8)";
    context.lineWidth = 1.6;
    context.fill(heartPath);
    context.stroke(heartPath);

    context.beginPath();
    context.moveTo(-43, 1);
    context.lineTo(-22, 1);
    context.lineTo(-12, -17);
    context.lineTo(1, 23);
    context.lineTo(14, -4);
    context.lineTo(39, -4);
    context.strokeStyle = "rgba(16, 54, 79, .82)";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    context.restore();

    const nodes = [
      [centerX - 136 * scale, centerY - 52 * scale, 4],
      [centerX + 157 * scale, centerY - 47 * scale, 3.5],
      [centerX + 132 * scale, centerY + 70 * scale, 4.5],
      [centerX - 156 * scale, centerY + 60 * scale, 3],
    ];
    nodes.forEach(([x, y, radius], index) => {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = index % 2 ? "#a8b3ff" : "#ffe0a2";
      context.shadowColor = context.fillStyle;
      context.shadowBlur = 14;
      context.fill();
    });
    context.shadowBlur = 0;
  };

  const animate = (time) => {
    animationFrame = 0;
    if (!isVisible || document.hidden || !context) return;
    drawScene(time);
    animationFrame = window.requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (isVisible && !document.hidden && !animationFrame && !motionPreference.matches
      && !document.body.classList.contains("reduce-motion")) {
      animationFrame = window.requestAnimationFrame(animate);
    } else if (context && !animationFrame) {
      drawScene(0);
    }
  };

  const stopAnimation = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousTime = 0;
  };

  const updateMotionPreference = () => {
    if (motionPreference.matches || document.body.classList.contains("reduce-motion")) {
      stopAnimation();
      drawScene(0);
    } else {
      startAnimation();
    }
  };

  if (card && finePointer.matches) {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--card-tilt-x", `${(-vertical * 5).toFixed(2)}deg`);
      card.style.setProperty("--card-tilt-y", `${(horizontal * 7).toFixed(2)}deg`);
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--card-tilt-x");
      card.style.removeProperty("--card-tilt-y");
    });
  }

  if (context && !lowPowerDevice && !window.matchMedia("(max-width: 560px)").matches
    && !window.matchMedia("(pointer: coarse)").matches) {
    canvas.hidden = false;
    hero.dataset.scene = "ready";
    resizeCanvas();

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) startAnimation();
      else stopAnimation();
    }, { rootMargin: "180px 0px", threshold: 0 });
    observer.observe(hero);

    window.addEventListener("resize", resizeCanvas, { passive: true });
    hero.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    }, { passive: true });
    motionPreference.addEventListener?.("change", updateMotionPreference);
    const motionObserver = new MutationObserver(updateMotionPreference);
    motionObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAnimation();
      else updateMotionPreference();
    });
    window.addEventListener("pagehide", () => {
      stopAnimation();
      observer.disconnect();
      motionObserver.disconnect();
    }, { once: true });
  }
}
