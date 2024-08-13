// ToolSettings.jsx
import React from 'react';
import 'assets/css/ToolSettings.css';

const PenSettings = ({
  toolSize,
  setToolSize,
  selectedColor,
  setSelectedColor,
  closeSettings
}) => {

  return (
    <div className="pen-settings">
      <input
        type="range"
        min="1"
        max="20"
        value={toolSize}
        onChange={(e) => setToolSize(Number(e.target.value))}
        className="tool-size-slider"
      />
      <div className="color-picker-container">
        <label>색상</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />
      </div>
      <button className="close-button" onClick={closeSettings}>
        닫기
      </button>
    </div>
  );
};

export default PenSettings;