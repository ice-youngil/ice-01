import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarButton from 'components/SidebarButton';
import CanvasComponent from './CanvasComponent';
import TextSettings from 'components/TextSettings'
import ToolSettings from 'components/ToolSettings';
import ShapeSelectionModal from 'services/threeD/ShapeSelectionModal'
import 'assets/css/SketchHome.css';

// ====================== 아이콘 ==============================

// Topbar
import homeIcon from 'assets/icon/home.png';
import imageLoadButtoIcon from 'assets/icon/load.png';
import imageSaveButtonIcon from 'assets/icon/save.png';

// Sidebar
import textIcon from 'assets/icon/text.png';
import eraserIcon from 'assets/icon/eraser.png';
import elementIcon from 'assets/icon/element.png';
import penIcon from 'assets/icon/pen.png';
import threeDIcon from 'assets/icon/apply.png';
import undoIcon from 'assets/icon/undo.png';

// ====================== 이미지 조작 라이브러리 ==============================
import html2canvas from "html2canvas";
import saveAs from "file-saver";

const SketchToolHome = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [image, setImage] = useState(null);
  const [toolSize, setToolSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showTextTool, setShowTextTool] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToolSettings, setShowToolSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const screenShotRef = useRef(null);


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (canvasRef.current) {
          canvasRef.current.clearCanvas();
        }
        const newImage = e.target.result;
        setImage(newImage);
        setHistory([newImage]);
        setCurrentStep(0);
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

  const saveHistory = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getMergedImage();
      setHistory((prevHistory) => [...prevHistory.slice(0, currentStep + 1), dataUrl]);
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
      const previousImage = history[currentStep];
      setImage(previousImage);
    } else if (currentStep === 0 && history.length > 1) {
      setImage(history[0]);
    } else if (currentStep === 0 && history.length === 1) {
      setImage(history[0]);
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

  const handleButtonClick = (tool) => {
    // 모든 설정 창 닫기
    setShowTextTool(false);
    setShowEmojiPicker(false);
    setShowToolSettings(false);

    // 선택된 도구에 따라 동작 설정
    if (tool === 'text') {
      // 텍스트 도구를 선택할 때 다른 도구 비활성화
      setSelectedTool('text');
      setShowTextTool(true);
    } else {
      setSelectedTool(tool);

      if (tool === 'emoji') {
        setShowEmojiPicker(true);
      } else if (tool === 'pen' || tool === 'eraser') {
        setShowToolSettings(true);
      }
    }
  };

  const closeSettings = () => {
    setShowToolSettings(false);
    setShowTextTool(false);
    setShowEmojiPicker(false);
  };

  const handleAddText = (textSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addText(textSettings);
      saveHistory();
    }
  };
  
  const handleSelectEmoji = (emoji) => {
    if (canvasRef.current) {
      canvasRef.current.addEmoji(emoji);
      saveHistory();
    }
  };

  return (
    <div className="sketchtoolhome-container">
      <div class="top-bar">
            <button class="top-home">
              <img src={homeIcon} />
            </button>
            <div class="top-function">
              <button class="top-load">
                <img src={imageLoadButtoIcon}/>
                <input type="file" onChange={handleImageUpload} />
              </button>
              <button class="top-save" onClick={handleSaveImage}><img src={imageSaveButtonIcon} /></button>
            </div>
        </div>
      <div 
        ref={screenShotRef}>
        <CanvasComponent
        ref={canvasRef}
        selectedTool={selectedTool}
        toolSize={toolSize}
        eraserSize={eraserSize}
        image={image}
        onSaveHistory={saveHistory}
        selectedColor={selectedColor}
      />
      </div>
      <div className="side-bar">
        <div className="side-function">
          <SidebarButton icon={textIcon} label="side-text" onClick={() => handleButtonClick('text')} />
          <SidebarButton icon={eraserIcon} label="side-eraser" onClick={() => handleButtonClick('eraser')} />
          <SidebarButton icon={elementIcon} label="side-elements" onClick={() => handleButtonClick('element')} />
          <SidebarButton icon={penIcon} label="side-pen" onClick={() => handleButtonClick('pen')} />
        </div>
        <SidebarButton icon={threeDIcon} label="side-apply" onClick={handleApplyModel} />
      </div>
      {(selectedTool === 'pen' || selectedTool === 'eraser') && showToolSettings && (
        <ToolSettings
          selectedTool={selectedTool}
          toolSize={toolSize}
          setToolSize={setToolSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          showEmojiPicker={showEmojiPicker}
          closeSettings={closeSettings}
          addEmojiToCanvas={handleSelectEmoji}
        />
      )}
      {showTextTool && (
        <div className="text-tool-container">
          <TextSettings onAddText={handleAddText} />
          <button className="cancel-button" onClick={closeSettings}>
            닫기
          </button>
        </div>
      )}
      {showEmojiPicker && (
        <ToolSettings
          selectedTool="emoji"
          showEmojiPicker={showEmojiPicker}
          closeSettings={closeSettings}
        />
      )}
      <ShapeSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectShape={handleSelectShape}
      />
      <SidebarButton icon={undoIcon} label="undo-button" onClick={handleUndo} />
    </div>
  );
};

export default SketchToolHome;
