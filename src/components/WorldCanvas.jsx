import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WorldCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    let renderer;

    try {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(60, 700 / 656, 0.1, 1000);
      camera.position.z = 2.5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(700, 656);

      if (!mountRef.current) return;
      mountRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.SphereGeometry(1, 64, 64);

      const material = new THREE.PointsMaterial({
        color: "#3b82f6",
        size: 0.02,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const animate = () => {
        requestAnimationFrame(animate);
        points.rotation.y += 0.002;
        renderer.render(scene, camera);
      };

      animate();

    } catch (error) {
      console.error("WebGL no disponible:", error);

      // 👉 fallback visual
      if (mountRef.current) {
        mountRef.current.innerHTML = `
          <div style="
            width:700px;
            height:656px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#3b82f6;
            font-size:14px;
            opacity:0.5;
          ">
            🌍 Animación no disponible
          </div>
        `;
      }
    }

    return () => {
      if (renderer && mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ marginTop: "3rem" }} />;
}