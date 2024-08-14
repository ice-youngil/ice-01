import React, { useState, useEffect } from 'react';
import 'assets/css/ToolSettings.css';
import textApplyButtonIcon from 'assets/icon/text-apply.png';
import textColorIcon from 'assets/icon/text-color.png';

const TextSettings = ({ onAddText, selectedText, canvasWidth, canvasHeight, closeSettings}) => {
  const [text, setText] = useState('');
  const [fontSize] = useState(20); // 픽셀 단위로 설정
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('yeongdeok');

  useEffect(() => {
    if (selectedText) {
      setText(selectedText.text || '');
      setColor(selectedText.fill || '#000000');
      setFontFamily(selectedText.fontFamily || 'Arial');
    }
  }, [selectedText]);

  const handleAddText = () => {
    
    const validFontSize = parseInt(fontSize) || 20; // NaN 방지
    if (selectedText) {
      selectedText.set({
        text,
        fontSize: validFontSize,
        fill: color,
        fontFamily,
      });
      selectedText.canvas.renderAll();
    } else {
      const initialPosition = {
        top: (canvasHeight * 0.1) / canvasHeight * canvasHeight, // 위쪽 여백을 캔버스 높이의 10%로 설정
        left: (canvasWidth * 0.1) / canvasWidth * canvasWidth, // 왼쪽 여백을 캔버스 너비의 10%로 설정
      };

      onAddText({
        text,
        fontSize: validFontSize,
        color,
        fontFamily,
        left: initialPosition.left,
        top: initialPosition.top
      });
    }
    setText('');
    closeSettings();
  };

  return (
      <div className="text-settings">
         <div className="text-option">
          <div className="text-input-box">
            <input 
              id="text-input"
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='텍스트를 입력하세요'
              required
              />
            <label id="text-label">텍스트를 입력하세요</label> 
              <span id="text-span"></span>
          </div>

          <div className="text-select">
            <input
              id="text-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}/>

            <select name="font" className="text-font"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}>
              <option value="yeongdeok">영덕바다체</option>
              <option value="cookierun">쿠키런체</option>
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
        </div>

        <div className="text-button">
          <button className="text-apply"onClick={handleAddText}>
            <img src={textApplyButtonIcon} alt="textApply" />
            {/* {selectedText ? '텍스트 수정' : '텍스트 추가'} */}
          </button>
        </div>
      </div>
  );
};

export default TextSettings;