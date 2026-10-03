const canvas = document.getElementById("heroScene");
const hero = canvas?.closest(".hero");

if (canvas instanceof HTMLCanvasElement && hero) {
  const overviewCard = hero.querySelector(".overview-card");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || document.body.classList.contains("reduce-motion");
  const lowPowerDevice = navigator.connection?.saveData
    || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2)
    || window.matchMedia("(max-width: 560px)").matches
    || window.matchMedia("(pointer: coarse)").matches;

  hero.dataset.scene = "fallback";
  canvas.hidden = true;

  if (overviewCard && !reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    overviewCard.addEventListener("pointermove", (event) => {
      const bounds = overviewCard.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      overviewCard.style.setProperty("--card-tilt-x", `${(-vertical * 5).toFixed(2)}deg`);
      overviewCard.style.setProperty("--card-tilt-y", `${(horizontal * 7).toFixed(2)}deg`);
    }, { passive: true });
    overviewCard.addEventListener("pointerleave", () => {
      overviewCard.style.removeProperty("--card-tilt-x");
      overviewCard.style.removeProperty("--card-tilt-y");
    });
  }

  if (!reducedMotion && !lowPowerDevice) {
    let renderer;
    let scene;
    let camera;
    let sculpture;
    let frameId = 0;
    let isVisible = false;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let clock;

    const showFallback = (error) => {
      hero.dataset.scene = "fallback";
      canvas.hidden = true;
      renderer?.dispose();
      renderer = undefined;
      scene = undefined;
      camera = undefined;
      sculpture = undefined;
      clock = undefined;
      if (error) console.info("Using the lightweight 3D hero fallback.", error);
    };

    const stopAnimation = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const resizeScene = () => {
      if (!renderer || !camera) return;
      const { width, height } = hero.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const renderScene = () => {
      frameId = 0;
      if (!renderer || !scene || !camera || !isVisible || document.hidden) return;

      const elapsed = clock.getElapsedTime();
      currentX += (pointerY * 0.16 - currentX) * 0.035;
      currentY += (pointerX * 0.2 - currentY) * 0.035;
      sculpture.rotation.x = Math.sin(elapsed * 0.42) * 0.075 + currentX;
      sculpture.rotation.y = Math.sin(elapsed * 0.3) * 0.16 + currentY;
      sculpture.rotation.z = Math.sin(elapsed * 0.2) * 0.045;
      sculpture.position.y = Math.sin(elapsed * 0.7) * 0.09;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderScene);
    };

    const startAnimation = () => {
      if (isVisible && !document.hidden && !frameId && clock) {
        clock.start();
        frameId = requestAnimationFrame(renderScene);
      }
    };

    const initializeScene = (THREE) => {
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      if (!width || !height) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0, 11.6);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      scene.add(new THREE.AmbientLight(0xa7f7e8, 2.1));

      const keyLight = new THREE.PointLight(0x70f0ca, 38, 18);
      keyLight.position.set(-3.6, 3.4, 5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x5a9dff, 32, 16);
      rimLight.position.set(4, -2, -1);
      scene.add(rimLight);

      sculpture = new THREE.Group();
      scene.add(sculpture);

      const heart = new THREE.Shape();
      heart.moveTo(0, -1.08);
      heart.bezierCurveTo(-0.25, -0.8, -1.72, 0.03, -1.72, 0.94);
      heart.bezierCurveTo(-1.72, 2.02, -0.15, 2.07, 0, 1.13);
      heart.bezierCurveTo(0.15, 2.07, 1.72, 2.02, 1.72, 0.94);
      heart.bezierCurveTo(1.72, 0.03, 0.25, -0.8, 0, -1.08);

      const heartGeometry = new THREE.ExtrudeGeometry(heart, {
        depth: 0.48,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.1,
        bevelThickness: 0.1,
        curveSegments: 24,
        steps: 1,
      });
      heartGeometry.center();

      const heartMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x86f0d2,
        metalness: 0.32,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
        emissive: 0x07534e,
        emissiveIntensity: 0.3,
      });
      const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
      heartMesh.scale.setScalar(0.79);
      sculpture.add(heartMesh);

      const wireframe = new THREE.Mesh(
        heartGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xe1fff4,
          wireframe: true,
          transparent: true,
          opacity: 0.075,
        }),
      );
      wireframe.scale.copy(heartMesh.scale);
      wireframe.rotation.copy(heartMesh.rotation);
      sculpture.add(wireframe);

      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x83f1dc,
        transparent: true,
        opacity: 0.35,
      });
      const orbitSpecs = [
        [2.65, 0.018, 0.76, 0.2, -0.27],
        [3.08, 0.012, 1.1, -0.43, 0.16],
        [3.45, 0.01, 0.44, 0.29, 0.38],
      ];
      orbitSpecs.forEach(([radius, tube, rotateX, rotateY, rotateZ]) => {
        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(radius, tube, 8, 128),
          orbitMaterial,
        );
        orbit.rotation.set(rotateX, rotateY, rotateZ);
        sculpture.add(orbit);
      });

      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffdfa0,
        emissive: 0x8a5420,
        emissiveIntensity: 0.4,
        metalness: 0.12,
        roughness: 0.3,
      });
      [
        [-3.25, 1.45, 0.35, 0.09],
        [3.15, 1.18, -0.2, 0.065],
        [2.85, -1.68, 0.4, 0.11],
        [-2.9, -1.4, -0.3, 0.07],
      ].forEach(([x, y, z, radius]) => {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 20, 14),
          nodeMaterial,
        );
        node.position.set(x, y, z);
        sculpture.add(node);
      });

      const positions = new Float32Array(360);
      for (let index = 0; index < positions.length; index += 3) {
        positions[index] = (Math.random() - 0.5) * 14;
        positions[index + 1] = (Math.random() - 0.5) * 9;
        positions[index + 2] = -2 - Math.random() * 5;
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      scene.add(new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0xc2fff0,
          size: 0.018,
          transparent: true,
          opacity: 0.45,
          sizeAttenuation: true,
        }),
      ));

      clock = new THREE.Clock();
      hero.dataset.scene = "ready";
      canvas.hidden = false;
      resizeScene();
      startAnimation();
    };

    let isLoading = false;
    const loadScene = async () => {
      if (isLoading) return;
      isLoading = true;
      try {
        const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");
        initializeScene(THREE);
      } catch (error) {
        showFallback(error);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) {
        if (!renderer) void loadScene();
        else startAnimation();
      } else {
        stopAnimation();
      }
    }, { rootMargin: "280px 0px", threshold: 0 });

    observer.observe(hero);
    window.addEventListener("resize", resizeScene, { passive: true });
    window.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    });
    window.addEventListener("pagehide", () => {
      stopAnimation();
      observer.disconnect();
      renderer?.dispose();
    }, { once: true });
  }
}
