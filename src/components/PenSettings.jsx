// src/pages/PenSettings.jsx
import React from 'react';
import ColorPickerComponent from 'components/ColorPickerComponent';

const PenSettings = ({ toolSize, onSizeChange, selectedColor, setSelectedColor }) => {
  return (
    <div className="pen-settings">
      <input
        type="range"
        min="1"
        max="20"
        value={toolSize}
        onChange={(e) => onSizeChange(e.target.value)}
        className="pen-size-slider"
      />
      <ColorPickerComponent
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />
    </div>
  );
};

export default PenSettings;
