import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'assets/css/Model.css';
import recorder from "react-canvas-recorder";

import html2canvas from "html2canvas";
import saveAs from "file-saver";

const ThreeDModal = ({ isOpen, onClose, image, shape }) => {
    const containerRef = useRef(null);
    const screenShotRef = useRef(null);
    const aRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const canvasRef = useRef();

    // const combinedRef = node => {
    //     containerRef.current = node;
    //     screenShotRef.current = node;
    // };
    
    useEffect(() => {
        if (!isOpen || !image) return;

        const container = screenShotRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        const a = renderer.domElement;
        aRef.current = a;
        aRef.current.className="aaa";
        container.appendChild(a);

        camera.position.z = 5;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const img = new Image();
        img.src = image;

        img.onload = () => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(image);

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

                const geometry = new THREE.LatheGeometry(points, 32);
                const material = new THREE.MeshBasicMaterial({ map: texture });
                const ceramic = new THREE.Mesh(geometry, material);
                scene.add(ceramic);

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

                const animate = () => {
                    requestAnimationFrame(animate);
                    ceramic.rotation.y -= 0.005;
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

                const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, 0.2);
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
            }
        };

        return () => {
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [isOpen, image, shape]);

    const handleSaveImage = async() => {
        if (!aRef.current) return;
    
        try {
          const div = aRef.current;
          const canvas = await html2canvas(div, { scale: 2 });
          canvas.toBlob((blob) => {
            if (blob !== null) {
              saveAs(blob, "result.png");
            }
          });
        } catch (error) {
          console.error("Error converting div to image:", error);
        }
      };

      const startRecording = useCallback(() => {
        recorder.createStream(aRef.current);
    
        recorder.start();
      }, [aRef]);
    
      const stopRecording = useCallback(() => {
        recorder.stop();
        
        const file = recorder.save();
        saveAs(file)
        // console.log("stopped", file);
        // const videoURL = URL.createObjectURL(file);
        // window.open(videoURL, "_blank");
        // Do something with the file
      }, []);

    return (
        <div className={`modal ${isOpen ? 'open' : 'closed'}`}>
          
            <div className="modal-content" ref={screenShotRef}>
              <canvas ref={canvasRef} />
                <button
                  className={`start-btn ${isRecording && "hidden"}`}
                  onClick={() => {
                    if (!isRecording) {
                      startRecording();
                    } else {
                      stopRecording();
                    }
                    setIsRecording((prev) => !prev);
                  }}
                >
                  {isRecording ? "Stop" : "Start"} Recording
                </button>
              
              <button className="ThreeD-save-button" onClick={handleSaveImage}>저장하기</button>
              <button className="ThreeD-close-button" onClick={onClose}>닫기</button>

            </div>
          
            
        </div>
    );
};

export default ThreeDModal;