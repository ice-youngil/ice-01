// ToolSettings.jsx
import React from 'react';

const ToolSettings = ({
  selectedTool,
  textSettings,
  handleTextSettingsChange,
  handleTextSettingsApply,
  toolSize,
  setToolSize,
  selectedColor,
  setSelectedColor,
  eraserSize,
  setEraserSize,
  setEmoji
}) => {
  return (
    <div>
         {selectedTool === 'pen' && (
            <div className="pen-settings-picker">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={toolSize} 
                onChange={(e) => setToolSize(e.target.value)} 
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
            </div>
          )}

          {selectedTool === 'eraser' && (
            <div className="eraser-settings-picker">
              <input 
                type="range" 
                min="5" 
                max="70" 
                value={eraserSize} 
                onChange={(e) => setEraserSize(e.target.value)} 
                className="tool-size-slider" 
              />
            </div>
          )}

          {selectedTool === 'text' && (
            <div className="text-settings-picker">
              <label>
                글꼴 크기:
                <input 
                  type="number" 
                  value={textSettings.fontSize} 
                  onChange={(e) => handleTextSettingsChange('fontSize', e.target.value)} 
                />
              </label>
              <label>
                색상:
                <input 
                  type="color" 
                  value={textSettings.color} 
                  onChange={(e) => handleTextSettingsChange('color', e.target.value)} 
                />
              </label>
              <label>
                글꼴:
                <select 
                  value={textSettings.fontFamily} 
                  onChange={(e) => handleTextSettingsChange('fontFamily', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </label>
              <button onClick={handleTextSettingsApply}>적용</button>
            </div>
          )}
    </div>
  );
};

export default ToolSettings;
