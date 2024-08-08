// src/pages/TextSettings.jsx
import React from 'react';

const TextSettings = ({ textSettings, onChange, onApply }) => {
  return (
    <div className="text-settings">
      <input
        type="number"
        min="1"
        max="100"
        value={textSettings.fontSize}
        onChange={(e) => onChange('fontSize', e.target.value)}
        className="text-setting-input"
        placeholder="Font Size"
      />
      <input
        type="color"
        value={textSettings.color}
        onChange={(e) => onChange('color', e.target.value)}
        className="text-setting-input"
      />
      <select
        value={textSettings.fontFamily}
        onChange={(e) => onChange('fontFamily', e.target.value)}
        className="text-setting-input"
      >
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
      </select>
      <button className="apply-setting-button" onClick={onApply}>적용하기</button>
    </div>
  );
};

export default TextSettings;
