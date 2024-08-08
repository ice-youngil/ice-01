import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import 'assets/css/Model.css';

const Model = () => {
  // useLocation 훅을 사용하여 SketchToolHome에서 전달된 이미지 데이터를 받음
  const location = useLocation();
  // useNavigate 훅을 사용하여 SketchToolHome으로 돌아가는 네비게이션 설정
  const navigate = useNavigate();
  const { image } = location.state || {}; // location state에서 이미지 데이터를 구조 분해 할당
  const containerRef = useRef(null); // Three.js 렌더러가 배치될 컨테이너 참조
  const rendererRef = useRef(null); // Three.js 렌더러 참조
  const cameraRef = useRef(null); // Three.js 카메라 참조
  const sceneRef = useRef(null); // Three.js 씬 참조

  useEffect(() => {
    // 이미지가 전달되지 않으면 아무 것도 하지 않음
    if (!image) return;

    // 이미 렌더러가 존재하면 이전 렌더러를 정리함
    if (rendererRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    // 새로운 Three.js 씬 생성
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 원근 투영으로 새로운 카메라 생성
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5); // 카메라 위치 조정
    cameraRef.current = camera;

    // 새로운 WebGL 렌더러 생성
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0xffffff); // 배경색을 흰색으로 설정
    containerRef.current.appendChild(renderer.domElement); // 렌더러를 컨테이너에 추가
    rendererRef.current = renderer;

    // 카메라와의 사용자 상호작용을 위한 궤도 제어 생성
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 감속(관성) 활성화
    controls.dampingFactor = 0.05; // 감속 계수
    controls.screenSpacePanning = false; // 화면 공간 팬닝 비활성화

    // 이미지를 텍스처로 로드하고 도자기 형상에 적용
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      // 이미지의 종횡비 계산
      const aspectRatio = imgWidth / imgHeight;

      // 도자기 모양의 윤곽을 정의하는 점들 설정, 종횡비를 기준으로 스케일 조정
      const points = [];
      for (let i = 0; i <= 20; i++) {
        const x = (Math.sin(i * 0.1) * 0.5 + 0.5) * aspectRatio;
        const y = (i - 10) * 0.2;
        points.push(new THREE.Vector2(x, y));
      }

      // 점들을 Y축을 중심으로 회전하여 선반 형상 생성
      const geometry = new THREE.LatheGeometry(points, 32);

      // 이미지를 텍스처로 로드
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(image);

      // 로드된 텍스처로 재질 생성
      const material = new THREE.MeshBasicMaterial({ map: texture });

      // 선반 형상과 재질로 메시 생성
      const pottery = new THREE.Mesh(geometry, material);
      scene.add(pottery); // 메시를 씬에 추가

      // 도자기 바닥을 막기 위해 원형 기하학 생성
      const bottomGeometry = new THREE.CircleGeometry(points[0].x, 32);
      const bottomMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.DoubleSide }); // 양면 모두 갈색으로 설정
      const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
      bottom.rotation.x = Math.PI / 2; // 평면을 수직으로 회전
      bottom.position.y = points[0].y; // 도자기 바닥 위치에 맞추어 설정
      scene.add(bottom); // 바닥 메시를 씬에 추가

      // 도자기보다 약간 큰 윤곽 형상 생성하여 테두리 효과 추가
      const outlinePoints = points.map(p => new THREE.Vector2(p.x * 1.05, p.y));
      const outlineGeometry = new THREE.LatheGeometry(outlinePoints, 32);
      // 다른 색상의 윤곽을 위한 재질 생성
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.BackSide });

      // 윤곽 형상과 재질로 윤곽 메시 생성
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      scene.add(outline); // 윤곽 메시를 씬에 추가

      // 씬을 애니메이션으로 만들기 위한 함수, 도자기와 윤곽 회전 포함
      const animate = () => {
        requestAnimationFrame(animate); // 다음 프레임 요청

        // 도자기와 윤곽을 매 프레임마다 약간씩 회전
        pottery.rotation.y -= 0.005;
        outline.rotation.y -= 0.005;

        // 카메라 관점에서 씬을 렌더링
        renderer.render(scene, camera);
      };

      animate(); // 애니메이션 루프 시작
    };
  }, [image]); // 의존성 배열에 이미지 포함; 이미지가 변경되면 이 효과를 다시 실행

  useEffect(() => {
    // 창 크기 조정을 처리하는 함수
    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // 창 크기 조정 시 렌더러와 카메라 크기/종횡비 업데이트
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 빈 의존성 배열은 이 효과가 마운트될 때 한 번만 실행됨

    // "Close" 버튼 클릭 시 SketchToolHome으로 돌아가는 함수
    const handleClose = () => {
      navigate(-1); // SketchToolHome 컴포넌트로 네비게이트
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