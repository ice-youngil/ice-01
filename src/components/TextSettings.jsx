import React, { useState, useEffect } from 'react';
import 'assets/css/ToolSettings.css';

const TextSettings = ({ onAddText, selectedText, canvasWidth, canvasHeight, closeSettings}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(20); // 픽셀 단위로 설정
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');

  useEffect(() => {
    if (selectedText) {
      setText(selectedText.text || '');
      setFontSize(selectedText.fontSize || 20);
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
  };

  return (
      <div className="text-settings">
        <input 
          id="text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트를 입력하세요."
        />

        <div className="text-select">
          <input
            id="text-px"
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 20)} // 기본값 설정
            step="1"
            min="1"
          />
          <input
            id="text-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <select name="font" className="text-font"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        <div className="text-button">
          <button className="text-apply"onClick={handleAddText}>
            {selectedText ? '텍스트 수정' : '텍스트 추가'}
          </button>
          <button className="close-button" onClick={closeSettings}>
            닫기
          </button>
        </div>
      </div>
  );
};

export default TextSettings;