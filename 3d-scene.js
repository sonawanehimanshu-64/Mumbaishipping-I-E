
import * as THREE from "three";

const canvas = document.getElementById("shippingCanvas");
const fallback = document.getElementById("sceneFallback");

if (canvas) {
  try {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      1,
      0.1,
      100
    );

    camera.position.set(5.5, 4.2, 7.5);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Lighting.
    scene.add(new THREE.AmbientLight(0x9ecbff, 2.0));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const blueLight = new THREE.PointLight(0x168fff, 35);
    blueLight.position.set(-4, 2, -3);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x62d9ff, 18);
    cyanLight.position.set(2, 3, 4);
    scene.add(cyanLight);

    // Ground and platform.
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b2138,
      metalness: 0.45,
      roughness: 0.4
    });

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 0.22, 3.5),
      groundMaterial
    );

    platform.position.y = -0.12;
    platform.receiveShadow = true;
    platform.castShadow = true;
    scene.add(platform);

    // Create a detailed cargo container.
    function createContainer(color, x, y, z, scale = 1) {
      const group = new THREE.Group();

      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.35,
        roughness: 0.47
      });

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.92, 1.15),
        material
      );

      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Raised ribs along the front and back faces.
      const ribMaterial = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.45,
        roughness: 0.4
      });

      for (let i = 0; i < 13; i++) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.035, 0.84, 0.035),
          ribMaterial
        );

        rib.position.set(-0.76 + i * 0.127, 0, 0.585);
        rib.castShadow = true;
        group.add(rib);

        const backRib = rib.clone();
        backRib.position.z = -0.585;
        group.add(backRib);
      }

      // Corner posts.
      const postMaterial = new THREE.MeshStandardMaterial({
        color: 0xc3d6e6,
        metalness: 0.7,
        roughness: 0.3
      });

      for (const px of [-0.78, 0.78]) {
        for (const pz of [-0.55, 0.55]) {
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.96, 0.07),
            postMaterial
          );

          post.position.set(px, 0, pz);
          group.add(post);
        }
      }

      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      scene.add(group);

      return group;
    }

    createContainer(0x1687d5, -1.25, 0.55, 0.15, 1.05);
    createContainer(0xeaa34c, 0.6, 0.55, -0.5, 0.95);
    createContainer(0x20b89a, 0.7, 1.48, -0.5, 0.95);
    createContainer(0x4768cf, 0.25, 0.55, 1.05, 0.75);

    // Decorative floating lights.
    const particles = new THREE.Group();

    for (let i = 0; i < 35; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x62d9ff : 0x2387f5
        })
      );

      dot.position.set(
        (Math.random() - 0.5) * 6,
        Math.random() * 3,
        (Math.random() - 0.5) * 5
      );

      particles.add(dot);
    }

    scene.add(particles);

    const group = new THREE.Group();

    // Place the assembled container scene inside a movable parent.
    const movableObjects = [...scene.children].filter(
      (object) =>
        object.isMesh ||
        object.isGroup
    );

    movableObjects.forEach((object) => {
      scene.remove(object);
      group.add(object);
    });

    scene.add(group);

    // The ground and containers now move together subtly.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let frameId;
    let isVisible = true;

    function resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible) {
        startAnimation();
      } else {
        cancelAnimationFrame(frameId);
      }
    });

    visibilityObserver.observe(canvas);

    const clock = new THREE.Clock();

    function animate() {
      if (!isVisible) return;

      frameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      if (!reducedMotion) {
        group.rotation.y = Math.sin(time * 0.22) * 0.12;
        group.position.y = Math.sin(time * 0.8) * 0.035;
        particles.rotation.y = time * 0.025;
      }

      renderer.render(scene, camera);
    }

    function startAnimation() {
      cancelAnimationFrame(frameId);
      animate();
    }

    if (fallback) fallback.style.display = "none";
    startAnimation();

    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      renderer.dispose();
    });
  } catch (error) {
    console.error("Unable to initialize the 3D scene:", error);

    if (fallback) fallback.style.display = "flex";
  }
}
