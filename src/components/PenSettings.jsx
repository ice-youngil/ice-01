// ToolSettings.jsx
import React from 'react';
import 'assets/css/ToolSettings.css';
import penCloseButtonIcon from 'assets/icon/pen-close.png';

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
        <input
          id="pen-color"
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />
      </div>
      <div className="pen-close-button">
        <button className="pen-close" onClick={closeSettings}>
          <img src={penCloseButtonIcon} alt="penClose" />
        </button>
      </div>
    </div>
  );
};

export default PenSettings;