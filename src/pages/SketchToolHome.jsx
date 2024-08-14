import React, { useState, useRef } from 'react'; 
import SidebarButton from 'components/SidebarButton'; 
import CanvasComponent from './CanvasComponent'; 
import TextSettings from 'components/TextSettings'; 
import PenSettings from 'components/PenSettings'; 
import ShapeSelectionModal from 'services/threeD/ShapeSelectionModal'; 
import ThreeDModal from 'services/threeD/ThreeDModel'; 

// ======================= css ===============================
import 'assets/css/SketchHome.css';
import 'assets/css/ToolSettings.css'
// ====================== 아이콘 ==============================
// Topbar
import homeIcon from 'assets/icon/home.png'; 
import imageLoadButtoIcon from 'assets/icon/load.png';
import imageSaveButtonIcon from 'assets/icon/save.png'; 

// Sidebar
import textIcon from 'assets/icon/text.png'; 
import elementIcon from 'assets/icon/element.png'; 
import penIcon from 'assets/icon/pen.png'; 
import threeDIcon from 'assets/icon/apply.png'; 
import undoIcon from 'assets/icon/undo.png'; 
import redoIcon from 'assets/icon/redo.png'; 
import handIcon from 'assets/icon/hand.png';
import InIcon from 'assets/icon/plus.png';
import OutIcon from 'assets/icon/minus.png';
import panningIcon from 'assets/icon/panning.png'; // 패닝 아이콘

import EmojiSettings from 'components/EmojiSettings'; 

const SketchToolHome = () => {
  const canvasRef = useRef(null); 
  const [selectedTool, setSelectedTool] = useState(null); 
  const [image, setImage] = useState(null); 
  const [toolSize, setToolSize] = useState(5); 
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [emojiUrl, setEmojiUrl] = useState(null); 
  // 선택 창 표시 관련
  const [showTextTool, setShowTextTool] = useState(false); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const [showPenSettings, setShowPenSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  const screenShotRef = useRef(null); 
  const [history, setHistory] = useState([]); 
  const [redoHistory, setRedoHistory] = useState([]); 
  const [imageUrl, setImageUrl] = useState(null);
  const [isWrapperOpen, setIsWrapperOpen] = useState(false);

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

  const handleSaveImage = async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
  
      if (canvas) {
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
        });

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Canvas object is not available');
      }
    } else {
      console.error('canvasRef.current is not available');
    }
  };
  
 // handleZoom의 기능은 CanvasComponent로 옮김.
  const handleZoom = (zoomIn) => {
    if (canvasRef.current) {
      canvasRef.current.handleZoom(zoomIn);
    }
  };
  const handleHistoryChange = (newHistory) => {
    setHistory((prevHistory) => [...prevHistory, newHistory]); // history에 새 상태 추가
    setRedoHistory([]); // 새로운 작업이 발생하면 redoHistory 초기화
  };
  
  const handleUndoClick = () => {
    if (history.length > 0) {
      const currentState = history[history.length - 1]; // history의 마지막 상태 가져오기
      setRedoHistory((prevRedoHistory) => [...prevRedoHistory, currentState]); // 현재 상태를 redoHistory에 추가
      const newHistory = history.slice(0, -1); // history에서 마지막 상태 제거
      setHistory(newHistory); // history 업데이트
  
      const lastState = newHistory[newHistory.length - 1];
      if (canvasRef.current && lastState) {
        const canvas = canvasRef.current.getCanvas();
        canvas.loadFromJSON(lastState, () => {
          canvas.getObjects('image').forEach((img) => {
            img.set({
              selectable: false,
              evented: false,
            });
          });
          canvas.renderAll();
        });
      }
    }
  };
  
  const handleRedoClick = () => {
    if (redoHistory.length > 0) {
      const redoState = redoHistory[redoHistory.length - 1]; // redoHistory의 마지막 상태 가져오기
      setRedoHistory(redoHistory.slice(0, -1)); // redoHistory에서 마지막 상태 제거
      setHistory((prevHistory) => [...prevHistory, redoState]); // redo 상태를 history에 추가
  
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas();
        canvas.loadFromJSON(redoState, () => {
          canvas.getObjects('image').forEach((img) => {
            img.set({
              selectable: false,
              evented: false,
            });
          });
          canvas.renderAll();
        });
      }
    }
  };
  const handleApplyModel = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();
  
      if (canvas) {
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
        });        
        setIsModalOpen(true); 
        setImageUrl(dataURL);
      }
      else {
        alert('이미지를 먼저 업로드해주세요.'); 
      }
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

  const handleEmojiButtonClick = () => {
    setIsWrapperOpen(false);
    setShowEmojiPicker(true);
  }

  const handleButtonClick = (tool) => {
    
    setIsWrapperOpen(true);
    setShowTextTool(false);
    setShowPenSettings(false);
    setShowEmojiPicker(false);

    setSelectedTool(tool); 
      if (tool === 'text') {
        setShowTextTool(true); 
      } 
      else if (tool === 'pen') {
        setShowPenSettings(true); 
      }
    }


  const closeSettings = () => {
    setIsWrapperOpen(false);
    setShowPenSettings(false); 
    setShowTextTool(false); 
    setShowEmojiPicker(false); 
  };

  const handleAddText = (textSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addText(textSettings); 
    }
  };
  
  const handleSelectEmoji = (EmojiSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addEmoji(EmojiSettings); 
    }
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
        <CanvasComponent
          ref={canvasRef} 
          selectedTool={selectedTool}
          toolSize={toolSize}
          image={image} 
          selectedColor={selectedColor}
          onHistoryChange={handleHistoryChange}
          activeTool={selectedTool} // activeTool을 CanvasComponent에 전달
        />
        <div className="control-button">
          <button className="redo-button" onClick={handleRedoClick}>
            <img src={redoIcon} /> 
          </button>
          <button className="undo-button" onClick={handleUndoClick}>
            <img src={undoIcon} /> 
          </button>
        </div>
      <div className="side-bar">
        <div className="side-function">
          <SidebarButton icon={textIcon} label="side-text" onClick={() => handleButtonClick('text')} /> 
          <SidebarButton icon={elementIcon} label="side-elements" onClick={() => handleEmojiButtonClick()} /> 
          <SidebarButton icon={penIcon} label="side-pen" onClick={() => handleButtonClick('pen')} />
          <SidebarButton icon={handIcon} label="side-handdler" onClick={() => setSelectedTool('hand')} />
          <SidebarButton icon={panningIcon} label="side-panning" onClick={() => setSelectedTool('panning')} />
          <SidebarButton icon={OutIcon} label="side-zoom-out" onClick={() => handleZoom(false)}/>
          <SidebarButton icon={InIcon} label="side-zoom-in" onClick={() => handleZoom(true)}/>
        </div>
        <SidebarButton icon={threeDIcon} label="side-apply" onClick={handleApplyModel} /> 
      </div>
      

      {isWrapperOpen && <div className = "wrapper">
        {showPenSettings && (
          <PenSettings
            toolSize={toolSize}
            setToolSize={setToolSize}
            selectedColor={selectedColor} 
            setSelectedColor={setSelectedColor}
            closeSettings={closeSettings}
          />
        )}
        {showTextTool && (
          <TextSettings 
            onAddText={handleAddText}
            closeSettings={closeSettings}
          />
        )}       
      </div>  }

      
      {showEmojiPicker && (
          <EmojiSettings
            setEmojiUrl={setEmojiUrl}
            onAddEmoji={handleSelectEmoji}
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
        image={imageUrl}
        shape={selectedShape} 
      />
    </div>
  );
};

export default SketchToolHome;