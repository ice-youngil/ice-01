import React, { useState, useRef } from 'react'; 
import SidebarButton from 'components/SidebarButton'; 
import CanvasComponent from './CanvasComponent'; 
import TextSettings from 'components/TextSettings'; 
import ToolSettings from 'components/ToolSettings'; 
import ShapeSelectionModal from 'services/threeD/ShapeSelectionModal'; 
import ThreeDModal from 'services/threeD/ThreeDModel'; 

// ======================= css ===============================
import 'assets/css/SketchHome.css'; 

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
  const [selectedTool, setSelectedTool] = useState('pen'); 
  const [image, setImage] = useState(null); 
  const [toolSize, setToolSize] = useState(5); 
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [emojiUrl, setEmojiUrl] = useState(null); 
  const [activeTool, setActiveTool] = useState(''); // 현재 활성화된 도구 상태 관리
  // 선택 창 표시 관련
  const [showTextTool, setShowTextTool] = useState(false); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const [showToolSettings, setShowToolSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState(null);
  const screenShotRef = useRef(null); 
  const [history, setHistory] = useState([]); 
  const [redoHistory, setRedoHistory] = useState([]); 
  const [imageUrl, setImageUrl] = useState(null);

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

  const handleZoom = (zoomIn) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas();

      if (canvas) {
        const currentZoom = canvas.getZoom();
        const zoomFactor = zoomIn ? 1.1 : 0.95;
        const newZoom = currentZoom * zoomFactor;
        canvas.setZoom(newZoom);
      }
    }
  };

  const handleUndoClick = () => {
    if (history.length > 1) {
      const previousHistory = history.slice(0, -1);
      setRedoHistory((prevRedoHistory) => [...prevRedoHistory, history[history.length - 1]]);
      setHistory(previousHistory);
  
      const lastState = previousHistory[previousHistory.length - 1];
      if (canvasRef.current) {
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
      const lastRedoState = redoHistory[redoHistory.length - 1];
      setRedoHistory(redoHistory.slice(0, -1));
    
      if (canvasRef.current) {
        const canvas = canvasRef.current.getCanvas();
        setHistory((prevHistory) => [...prevHistory, lastRedoState]);
        canvas.loadFromJSON(lastRedoState, () => {
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

  const handleButtonClick = (tool) => {
    setShowTextTool(false);
    setShowEmojiPicker(false);
    setShowToolSettings(false);

    setActiveTool(tool);

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
  
  const handleSelectEmoji = (EmojiSettings) => {
    if (canvasRef.current) {
      canvasRef.current.addEmoji(EmojiSettings); 
    }
  };

  const handleHistoryChange = (newHistory) => {
    setHistory((prevHistory) => [...prevHistory, newHistory]); 
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
          image={image} 
          selectedColor={selectedColor}
          onHistoryChange={handleHistoryChange}
          activeTool={activeTool} // activeTool을 CanvasComponent에 전달
        />
        <button className="undo-button" onClick={handleUndoClick}>
          <img src={undoIcon} /> 
        </button>
        <button className="redo-button" onClick={handleRedoClick}>
          <img src={redoIcon} /> 
        </button>
      </div>
      <div className="side-bar">
        <div className="side-function">
          <SidebarButton icon={textIcon} label="side-text" onClick={() => handleButtonClick('text')} /> 
          <SidebarButton icon={elementIcon} label="side-elements" onClick={() => handleButtonClick('emoji')} /> 
          <SidebarButton icon={penIcon} label="side-pen" onClick={() => handleButtonClick('pen')} />
          <SidebarButton icon={handIcon} label="side-Hand" onClick={() => handleButtonClick('hand')} />
          <SidebarButton icon={panningIcon} label="Panning" onClick={() => handleButtonClick('panning')} />
          <SidebarButton icon={OutIcon} label="Zoom-out" onClick={() => handleZoom(false)}/>
          <SidebarButton icon={InIcon} label="Zoom-in" onClick={() => handleZoom(true)}/>
        </div>
        <SidebarButton icon={threeDIcon} label="Apply 3D" onClick={handleApplyModel} /> 
      </div>
      {(selectedTool === 'pen') && showToolSettings && (
        <ToolSettings
          selectedTool={selectedTool}
          toolSize={toolSize}
          setToolSize={setToolSize}
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
          selectedTool="emoji"
          showEmojiPicker={showEmojiPicker}
          closeSettings={closeSettings} 
          setEmojiUrl={setEmojiUrl}
          onAddEmoji={handleSelectEmoji}
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
