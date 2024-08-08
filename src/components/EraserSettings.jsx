// src/pages/EraserSettings.jsx
import React from 'react';

const EraserSettings = ({ eraserSize, onSizeChange }) => {
  return (
    <div className="eraser-settings">
      <input
        type="range"
        min="1"
        max="50"
        value={eraserSize}
        onChange={(e) => onSizeChange(e.target.value)}
        className="eraser-size-slider"
      />
    </div>
  );
};

export default EraserSettings;
