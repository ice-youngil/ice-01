import React, { useState, useRef } from 'react';
import SidebarButton from 'components/SidebarButton';
import CanvasComponent from './CanvasComponent2';
import TextSettings from 'components/TextSettings';
import ToolSettings from 'components/ToolSettings';
import ShapeSelectionModal from 'services/threeD/ShapeSelectionModal';
import ThreeDModal from 'services/threeD/ThreeDModel';
import 'assets/css/SketchHome.css';

// ====================== 아이콘 ==============================

// Topbar
import homeIcon from 'assets/icon/home.png';
import imageLoadButtoIcon from 'assets/icon/load.png';
import imageSaveButtonIcon from 'assets/icon/save.png';
import redoIcon from 'assets/icon/redo.png'; // Redo 아이콘 추가

// Sidebar
import textIcon from 'assets/icon/text.png';
import elementIcon from 'assets/icon/element.png';
import penIcon from 'assets/icon/pen.png';
import threeDIcon from 'assets/icon/apply.png';
import undoIcon from 'assets/icon/undo.png';

import html2canvas from "html2canvas";
import saveAs from "file-saver";

const SketchToolHome = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('pen');
  const [image, setImage] = useState(null);
  const [toolSize, setToolSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showTextTool, setShowTextTool] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToolSettings, setShowToolSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null); 
  const screenShotRef = useRef(null);
  const [history, setHistory] = useState([]); // Undo 히스토리 상태 관리
  const [redoHistory, setRedoHistory] = useState([]); // Redo 히스토리 상태 관리

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

  const handleUndoClick = () => {
    if (history.length > 1) {
      const previousHistory = history.slice(0, -1);
      setRedoHistory((prevRedoHistory) => [...prevRedoHistory, history[history.length - 1]]); // Redo 히스토리에 저장
      setHistory(previousHistory);

      const lastState = previousHistory[previousHistory.length - 1];
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas();
        canvas.loadFromJSON(lastState, () => {
          canvas.renderAll();
        });
      }
    }
  };

  const handleRedoClick = () => {
    if (redoHistory.length > 0) {
      const lastRedoState = redoHistory[redoHistory.length - 1];
      setRedoHistory(redoHistory.slice(0, -1)); // Redo 히스토리에서 제거
  
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas(); // fabric.Canvas 객체 가져오기
        setHistory((prevHistory) => [...prevHistory, lastRedoState]); // Undo 히스토리에 저장
        canvas.loadFromJSON(lastRedoState, () => {
          canvas.renderAll();
        });
      }
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
    setIs3DModalOpen(false);
  };

  const handleSelectShape = (shape) => {
    setSelectedShape(shape);
    setIsModalOpen(false);
    setIs3DModalOpen(true);
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
      } else if (tool === 'pen') {
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
    }
  };
  
  const handleSelectEmoji = (element) => {
    if (canvasRef.current) {
      canvasRef.current.addEmoji(element);
    }
  };

  const handleHistoryChange = (newHistory) => {
    setHistory((prevHistory) => [...prevHistory, newHistory]); // 새로운 히스토리를 상태로 설정
  };

  return (
    <div className="sketchtoolhome-container">
      <div className="top-bar">
        <button className="top-home">
          <img src={homeIcon} alt="Home" />
        </button>
        <div className="top-function">
          <button className="top-load" onClick={() => document.getElementById('fileupload').click()}>
            <img src={imageLoadButtoIcon} alt="Load" />
            <input 
              id="fileupload" 
              type="file" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
            />
          </button>
          <button className="top-save" onClick={handleSaveImage}>
            <img src={imageSaveButtonIcon} alt="Save" />
          </button>
        </div>
      </div>
      <div ref={screenShotRef}>
        <CanvasComponent
          ref={canvasRef}
          selectedTool={selectedTool}
          toolSize={toolSize}
          eraserSize={eraserSize}
          image={image}
          selectedColor={selectedColor}
          onHistoryChange={handleHistoryChange} // 히스토리 변경사항을 CanvasComponent로 전달
        />
        <button className="undo-button" onClick={handleUndoClick}>
          <img src={undoIcon} alt="Undo" />
        </button>
        <button className="redo-button" onClick={handleRedoClick}> {/* Redo 버튼 추가 */}
          <img src={redoIcon} alt="Redo" />
        </button>
      </div>
      <div className="side-bar">
        <div className="side-function">
          <SidebarButton icon={textIcon} label="side-text" onClick={() => handleButtonClick('text')} />
          <SidebarButton icon={elementIcon} label="side-elements" onClick={() => handleButtonClick('emoji')} />
          <SidebarButton icon={penIcon} label="side-pen" onClick={() => handleButtonClick('pen')} />
        </div>
        <SidebarButton icon={threeDIcon} label="side-apply" onClick={handleApplyModel} />
      </div>
      {(selectedTool === 'pen') && showToolSettings && (
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
      <ThreeDModal
        isOpen={is3DModalOpen}
        onClose={handleCloseModal}
        image={image}
        shape={selectedShape}
      />
    </div>
  );
};

export default SketchToolHome;
