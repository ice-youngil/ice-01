import React from 'react';
import 'assets/css/ShapeSelectionModal.css';

const ShapeSelectionModal = ({ isOpen, onClose, onSelectShape }) => {
  if (!isOpen) {
    return null;
  }

  // Close modal if clicking on the overlay
  const handleOverlayClick = (event) => {
    onClose();
  };

  // Stop event propagation to prevent modal from closing when clicking inside the content
  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="shape-modal-overlay" onClick={handleOverlayClick}>
      <div className="shape-modal-content" onClick={handleContentClick}>
        <h2>모양 선택</h2>
        <button onClick={() => onSelectShape('rectangle')}>직사각형</button>
        <button onClick={() => onSelectShape('ceramic')}>도자기모양</button>
        <button className="close-button" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default ShapeSelectionModal;