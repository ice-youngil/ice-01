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
import redoIcon from 'assets/icon/redo.png'; 

// Sidebar
import textIcon from 'assets/icon/text.png'; 
import elementIcon from 'assets/icon/element.png'; 
import penIcon from 'assets/icon/pen.png'; 
import threeDIcon from 'assets/icon/apply.png'; 
import undoIcon from 'assets/icon/undo.png'; 
import handIcon from 'assets/icon/hand.png'; // 새로 추가된 hand 아이콘

import EmojiSettings from 'components/EmojiSettings'; 

const SketchToolHome = () => {
  const canvasRef = useRef(null); 
  const [selectedTool, setSelectedTool] = useState('pen'); 
  const [image, setImage] = useState(null); 
  const [toolSize, setToolSize] = useState(5); 
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [emojiUrl, setEmojiUrl] = useState(null); 
  // 선택 창 표시 관련
  const [showTextTool, setShowTextTool] = useState(false); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const [showToolSettings, setShowToolSettings] = useState(false);
  // 재원이 3D Modal 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  // 파일 저장 
  const screenShotRef = useRef(null); 
  // 되돌리기, 복원하기 
  const [history, setHistory] = useState([]); 
  const [redoHistory, setRedoHistory] = useState([]); 

  // 이미지 업로드 
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // 파일 가져오기
    if (file) {
      const reader = new FileReader(); 
      reader.onload = (e) => {
        if (canvasRef.current) {
          canvasRef.current.clearCanvas(); // 캔버스 초기화 시키기
        }
        const newImage = e.target.result; // 새롭게 업로드 된 이미지
        setImage(newImage); // 이미지 바꾸기
      };
      reader.readAsDataURL(file); 
    }
  };

  const handleSaveImage = async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
  
      // 다운로드 로직
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Undo 버튼 
  const handleUndoClick = () => {
    if (history.length > 1) {
      const previousHistory = history.slice(0, -1); // 이전 상태로 히스토리 자르기
      setRedoHistory((prevRedoHistory) => [...prevRedoHistory, history[history.length - 1]]); // Redo 히스토리에 저장
      setHistory(previousHistory); // 히스토리 업데이트

      const lastState = previousHistory[previousHistory.length - 1]; // 마지막 상태 가져오기
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas(); // 캔버스 객체 가져오기
        canvas.loadFromJSON(lastState, () => {
          canvas.renderAll(); // 캔버스 렌더링
        });
      }
    }
  };

  // Redo 버튼
  const handleRedoClick = () => {
    if (redoHistory.length > 0) {
      const lastRedoState = redoHistory[redoHistory.length - 1]; // 마지막 Redo 상태 가져오기
      setRedoHistory(redoHistory.slice(0, -1)); // Redo 히스토리에서 제거
  
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas(); // 캔버스 객체 가져오기
        setHistory((prevHistory) => [...prevHistory, lastRedoState]); // Undo 히스토리에 저장
        canvas.loadFromJSON(lastRedoState, () => {
          canvas.renderAll(); // 캔버스 렌더링
        });
      }
    }
  };

  
  const handleApplyModel = () => {
    if (image) {
      setIsModalOpen(true); 
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

  // 도구 버튼 클릭 핸들러
  const handleButtonClick = (tool) => {
    setShowTextTool(false);
    setShowEmojiPicker(false);
    setShowToolSettings(false);

    
    if (tool === 'text') {
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

  // 설정 창 닫기 핸들러
  const closeSettings = () => {
    setShowToolSettings(false); 
    setShowTextTool(false); 
    setShowEmojiPicker(false); 
  };

  // Text 추가
  const handleAddText = (textSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addText(textSettings); 
    }
  };
  
  // Emoji 추가
  const handleSelectEmoji = (EmojiSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addEmoji(EmojiSettings); 
    }
  };

  // 히스토리 변경 핸들러
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
          ref={canvasRef} // CanvasComponent 참조 전달
          selectedTool={selectedTool} // 선택할 도구 = pen
          toolSize={toolSize} // pen 사이즈
          image={image} // BackGround image
          selectedColor={selectedColor} // pen 색상 SetColor랑 다름.
          onHistoryChange={handleHistoryChange} // History 변경
        />
        <button className="undo-button" onClick={handleUndoClick}>
          <img src={undoIcon} alt="Undo" /> 
        </button>
        <button className="redo-button" onClick={handleRedoClick}>
          <img src={redoIcon} alt="Redo" /> 
        </button>
      </div>
      <div className="side-bar">
        <div className="side-function">
          <SidebarButton icon={textIcon} label="side-text" onClick={() => handleButtonClick('text')} /> 
          <SidebarButton icon={elementIcon} label="side-elements" onClick={() => handleButtonClick('emoji')} /> 
          <SidebarButton icon={penIcon} label="side-pen" onClick={() => handleButtonClick('pen')} />
          <SidebarButton icon={handIcon} label="side-Hand" onClick={() => handleButtonClick('hand')} /> {/* 새로 추가된 Hand 버튼 */}
        </div>
        <SidebarButton icon={threeDIcon} label="side-apply" onClick={handleApplyModel} /> 
      </div>
      {(selectedTool === 'pen') && showToolSettings && (
        <ToolSettings
          selectedTool={selectedTool} // 선택된 도구 전달
          toolSize={toolSize} // 도구 크기 전달
          setToolSize={setToolSize} // 도구 크기 설정 함수 전달
          selectedColor={selectedColor} 
          setSelectedColor={setSelectedColor} 
          showEmojiPicker={showEmojiPicker}
          closeSettings={closeSettings} 
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
        <EmojiSettings
          selectedTool="emoji" // 이모지 도구 전달
          showEmojiPicker={showEmojiPicker} // Emoji 선택창
          closeSettings={closeSettings} 
          setEmojiUrl={setEmojiUrl}
          onAddEmoji={handleSelectEmoji} // Emoji 추가
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
