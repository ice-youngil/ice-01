import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarButton from 'components/SidebarButton';
import CanvasComponent from './CanvasComponent';
import ToolSettings from 'components/ToolSettings';
import ShapeSelectionModal from 'services/threeD/ShapeSelectionModal'
import 'assets/css/SketchToolHome.css';

// ====================== 아이콘 ==============================
import textButtonIcon from 'assets/images/text.png';
import eraserButtonIcon from 'assets/images/eraser.png';
import elementButtonIcon from 'assets/images/element.png';
import penButtonIcon from 'assets/images/pen.png';
import designButtonIcon from 'assets/images/design.png';
import backButtonIcon from 'assets/images/back.png';
import handIcon from 'assets/images/hand.png';

// ====================== 이미지 조작 라이브러리 ==============================
import html2canvas from "html2canvas";
import saveAs from "file-saver";

const SketchToolHome = () => {
  
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [toolSize, setToolSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [emoji, setEmoji] = useState(null);
  const [textSettings, setTextSettings] = useState({
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Arial',
  });
  const [isAltPressed, setIsAltPressed] = useState(false);
  const screenShotRef = useRef(null);
  
  // ====================== 이미지 업로드 및 삭제 ==============================
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        saveHistory(e.target.result);
        setToolSize(5);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async() => {
    if (!screenShotRef.current) return;

    try {
      const div = screenShotRef.current;
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

// ====================== 3D 모델링 적용 ==============================

    const handleApplyModel = () => {
      if (image) {
        setIsModalOpen(true); // 모달 열기
      } else {
        alert('이미지를 먼저 업로드해주세요.');
      }
    };
  const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    const handleSelectShape = (selectedShape) => {
      setIsModalOpen(false);

      navigate('/threeD-modeling', {
        state: {
          image: image, 
          shape: selectedShape
        }
      });
    };

  const saveHistory = (image) => {
    setHistory((prevHistory) => [...prevHistory.slice(0, currentStep + 1), image]);
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
      setImage(history[currentStep - 1]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Alt') {
      setIsAltPressed(true);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Alt') {
      setIsAltPressed(false);
    }
  };

  useEffect(() => {
    const htmlTitle = document.querySelector('title');
    htmlTitle.innerHTML = "영일도방 스케치 툴"
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="sketchtoolhome-container">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate('/')}>
          <span>&lt;</span>
        </button>
        <button className="home-button">
          <span>홈</span>
        </button>
        <div className="separator"></div>
        <div className="load-sketch-button">
          <label>
            <span>스케치<br />불러오기</span>
            <input type="file" onChange={handleImageUpload} />
          </label>
        </div>
        <button className="save-button" onClick={handleSaveImage}>
          저장하기
        </button>
        <button className="apply-button" onClick={handleApplyModel}>
          적용하기
        </button>
      </div>
      <div 
        ref={screenShotRef}>
        <CanvasComponent
          selectedTool={selectedTool}
          toolSize={toolSize}
          eraserSize={eraserSize}
          image={image}
          onSaveHistory={saveHistory}
          isAltPressed={isAltPressed}
          selectedColor={selectedColor}
        />
      </div>
      <div className="sidebar-buttons">
        <SidebarButton icon={textButtonIcon} label="텍스트" onClick={() => setSelectedTool('text')} />
        <SidebarButton icon={eraserButtonIcon} label="지우개" onClick={() => setSelectedTool('eraser')} />
        <SidebarButton icon={elementButtonIcon} label="요소" onClick={() => setSelectedTool('element')} />
        <SidebarButton icon={penButtonIcon} label="펜" onClick={() => setSelectedTool('pen')} />
        <SidebarButton icon={designButtonIcon} label="문패지정" onClick={() => setSelectedTool('design')} />
        <SidebarButton icon={backButtonIcon} label="되돌리기" onClick={handleUndo} />
        <SidebarButton icon={handIcon} onClick={() => setSelectedTool('hand')} />
      </div>
      <ToolSettings
        selectedTool={selectedTool}
        textSettings={textSettings}
        handleTextSettingsChange={(key, value) => setTextSettings({ ...textSettings, [key]: value })}
        handleTextSettingsApply={() => {}}
        toolSize={toolSize}
        setToolSize={setToolSize}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        setEmoji={setEmoji}
      />
      <ShapeSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectShape={handleSelectShape}
      />
    </div>
  );
};

export default SketchToolHome;
