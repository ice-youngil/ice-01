import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'assets/css/Model.css';
import { saveAs } from 'file-saver';

const ThreeDModal = ({ isOpen, onClose, image, shape }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [imageBlob, setImageBlob] = useState(null);

    useEffect(() => {
        if (!isOpen || !image) return;

        const container = containerRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff, 1);
        const canvas = renderer.domElement;
        canvasRef.current = canvas;
        canvas.className="threeD-canvas";
        container.appendChild(canvas);

        camera.position.z = 5;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const img = new Image();
        img.crossOrigin = 'Anonymous'; // CORS 문제 방지를 위해 설정
        img.src = image;

        img.onload = () => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(image);

            let geometry, material, mesh;

            if (shape === 'ceramic') {
                const imgWidth = img.width;
                const imgHeight = img.height;
                const aspectRatio = imgWidth / imgHeight;

                const points = [];
                for (let i = 0; i <= 20; i++) {
                    const x = (Math.sin(i * 0.1) * 0.5 + 0.5) * aspectRatio;
                    const y = (i - 10) * 0.2;
                    points.push(new THREE.Vector2(x, y));
                }

                geometry = new THREE.LatheGeometry(points, 32);
                material = new THREE.MeshBasicMaterial({ map: texture });
                mesh = new THREE.Mesh(geometry, material);

                const bottomGeometry = new THREE.CircleGeometry(points[0].x, 32);
                const bottomMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
                const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
                bottom.rotation.x = Math.PI / 2;
                bottom.position.y = points[0].y;
                scene.add(bottom);

                const outlinePoints = points.map(p => new THREE.Vector2(p.x * 1.05, p.y));
                const outlineGeometry = new THREE.LatheGeometry(outlinePoints, 32);
                const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.BackSide });
                const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
                scene.add(outline);

                scene.add(mesh);

                const animate = () => {
                    requestAnimationFrame(animate);
                    mesh.rotation.y -= 0.005;
                    outline.rotation.y -= 0.005;
                    renderer.render(scene, camera);
                };

                animate();
            } else if (shape === 'rectangle') {
                const imgWidth = img.width;
                const imgHeight = img.height;
                const aspectRatio = imgWidth / imgHeight;
                const boxWidth = 2 * aspectRatio;
                const boxHeight = 2;

                geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 0.2);
                const materials = [
                    new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
                    new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
                    new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
                    new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
                    new THREE.MeshBasicMaterial({ map: texture }),
                    new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
                ];

                mesh = new THREE.Mesh(geometry, materials);

                const outlineGeometry = new THREE.BoxGeometry(boxWidth + 0.2, boxHeight + 0.2, 0.2);
                const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.BackSide });
                const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
                scene.add(outline);

                scene.add(mesh);

                const animate = () => {
                    requestAnimationFrame(animate);
                    mesh.rotation.y -= 0.005;
                    outline.rotation.y -= 0.005;
                    renderer.render(scene, camera);
                };

                animate();
            }

            // 이미지 데이터 캡처
            const captureImage = () => {
                renderer.render(scene, camera);
                canvas.toBlob((blob) => {
                    if (blob) {
                        setImageBlob(blob);
                    }
                }, 'image/png');
            };

            // 렌더링 후 캡처
            setTimeout(captureImage, 1000); // 렌더링 시간이 필요한 경우 조정
        };

        return () => {
            container.removeChild(canvas);
            renderer.dispose();
        };
    }, [isOpen, image, shape]);

    const handleSaveImage = () => {
        if (imageBlob) {
            saveAs(imageBlob, 'result.png');
        }
    };

    return (
        <div className={`modal-${isOpen ? 'overlay' : 'closed'}`}>
            <div className="modal-content" ref={containerRef}>
                <button className="threeD-save-button" onClick={handleSaveImage}>저장하기</button>
                <button className="threeD-close-button" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default ThreeDModal;
