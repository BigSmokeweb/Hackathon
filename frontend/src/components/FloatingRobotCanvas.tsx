'use client';

import { useEffect, useRef, useState } from 'react';

export function FloatingRobotCanvas({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isDisposed = false;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let mixer: any = null;
    let clock: any = null;
    let modelGroup: any = null;
    let reqId: number;

    async function initThree() {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

        if (isDisposed || !mountRef.current) return;

        const container = mountRef.current;
        const width = 112;
        const height = 112;

        // Scene
        scene = new THREE.Scene();

        // Camera - centered on robot
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 3.4);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.borderRadius = '50%';

        container.appendChild(renderer.domElement);

        // Pure neutral white studio lighting (no blue tint)
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
        keyLight.position.set(2, 3, 3);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1.6);
        fillLight.position.set(-2, -1, 2);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0xffffff, 1.8, 10);
        rimLight.position.set(0, -1, -2);
        scene.add(rimLight);

        clock = new THREE.Clock();

        // Load GLTF Model
        const loader = new GLTFLoader();
        loader.load(
          '/models/robot/scene.gltf',
          (gltf) => {
            if (isDisposed) return;

            const robotScene = gltf.scene;

            // Hide the wide horizontal projection waves under the robot
            robotScene.traverse((child: any) => {
              if (child.name && child.name.toLowerCase().includes('wave')) {
                child.visible = false;
              }
            });

            // Update world matrix to calculate exact bounding box of the robot body
            robotScene.updateMatrixWorld(true);
            const box = new THREE.Box3();
            robotScene.traverse((child: any) => {
              if (child.isMesh && child.visible && !child.name.toLowerCase().includes('wave')) {
                box.expandByObject(child);
              }
            });

            // Fallback if empty box
            if (box.isEmpty()) {
              box.setFromObject(robotScene);
            }

            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // Center robot inside a pivot group so its physical center is at (0, 0, 0)
            robotScene.position.set(-center.x, -center.y, -center.z);

            const pivotGroup = new THREE.Group();
            pivotGroup.add(robotScene);

            // Scale to prominently fill circle while staying comfortably within bounds
            const targetSize = 2.15;
            const scale = targetSize / (maxDim || 1);
            pivotGroup.scale.set(scale, scale, scale);
            pivotGroup.position.set(0, 0, 0);

            scene.add(pivotGroup);
            modelGroup = pivotGroup;

            // Handle animations if present
            if (gltf.animations && gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(robotScene);
              gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
              });
            }

            setIsLoaded(true);
          },
          undefined,
          (err) => {
            console.warn('GLTF loading error, falling back to stylistic avatar', err);
            setLoadError(true);
          }
        );

        // Render loop
        const animate = () => {
          reqId = requestAnimationFrame(animate);
          const delta = clock ? clock.getDelta() : 0.016;
          const time = clock ? clock.getElapsedTime() : 0;

          if (mixer) mixer.update(delta);

          if (modelGroup) {
            const hoverY = Math.sin(time * 2.5) * 0.035;
            modelGroup.position.y = hoverY;
          }

          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };

        animate();
      } catch (e) {
        console.warn('Three.js failed to initialize', e);
        setLoadError(true);
      }
    }

    initThree();

    return () => {
      isDisposed = true;
      if (reqId) cancelAnimationFrame(reqId);
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      onClick={onClick}
      className="relative w-36 h-36 cursor-pointer select-none group flex items-center justify-center active:scale-95 transition-transform"
      title="Chat with Celene AI Assistant"
    >
      {/* Circular Background */}
      <div className="absolute inset-0 rounded-full bg-[#347F8C] shadow-xl shadow-[#347F8C]/40 group-hover:bg-[#2A6772] transition-colors" />

      {/* 3D WebGL Canvas mount */}
      <div
        ref={mountRef}
        className={`relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Stylistic Fallback Avatar if GLTF is loading or fails */}
      {(!isLoaded || loadError) && (
        <div className="absolute inset-0 rounded-full bg-[#347F8C] border-2 border-white/90 flex flex-col items-center justify-center shadow-lg">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg animate-bounce">
            🤖
          </div>
          <span className="text-[8px] font-mono text-[#F7F4EA] uppercase tracking-wider font-bold mt-0.5">
            Celene
          </span>
        </div>
      )}

      {/* Hover tooltip when closed */}
      {!isOpen && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#3E4541] text-[#F7F4EA] font-mono text-[11px] px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#D8D4C8]/30 flex items-center gap-1.5">
          <span>Ask Celene</span>
          <span className="text-[#4FA3D1] font-bold">&rarr;</span>
        </div>
      )}
    </div>
  );
}
