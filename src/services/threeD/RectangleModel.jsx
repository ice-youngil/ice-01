import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'assets/css/Model.css';

const Model = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { image } = location.state || {};
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    if (rendererRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 3.5); // 카메라 위치 조정
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0xffffff);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0x404040); // 주변광
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 방향광
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true; // 그림자 활성화
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      const aspectRatio = imgWidth / imgHeight;
      const boxWidth = 2 * aspectRatio;
      const boxHeight = 2;

      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 0.2);
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(image);

      const materials = [
        new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
        new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
        new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
        new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
        new THREE.MeshBasicMaterial({ map: texture }),
        new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
      ];

      const box = new THREE.Mesh(geometry, materials);
      scene.add(box);

      const outlineGeometry = new THREE.BoxGeometry(boxWidth + 0.2, boxHeight + 0.2, 0.2);
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.BackSide });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      scene.add(outline);

      const animate = () => {
        requestAnimationFrame(animate);

        box.rotation.y -= 0.005;
        outline.rotation.y -= 0.005;

        renderer.render(scene, camera);
      };

      animate();
    };
  }, [image]);

  useEffect(() => {
    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    const renderer = rendererRef.current;
    if (renderer) {
      const imgData = renderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'model_image.png';
      link.click();
    }
  };

  return (
    <div className="model-popup">
      <div className="button-container">
        <button className="save-button" onClick={handleSave}>저장하기</button>
        <button className="close-button" onClick={handleClose}>닫기</button>
      </div>
      <div className="model-popup-content" ref={containerRef}></div>
    </div>
  );
};

export default Model;