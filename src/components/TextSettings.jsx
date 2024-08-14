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
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트 입력"
        />
        <div className="text-select">
          <label>
            글자 크기 (px):
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 20)} // 기본값 설정
              step="1"
              min="1"
            />
          </label>
          <label>
            색상:
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          <label>
            폰트:
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </label>
        </div>
        <button onClick={handleAddText}>
          {selectedText ? '텍스트 수정' : '텍스트 추가'}
        </button>
        <button className="close-button" onClick={closeSettings}>
          닫기
        </button>
      </div>
  );
};

export default TextSettings;