import React from 'react';
import 'assets/css/SketchHome.css';

const SidebarButton = ({ icon, label, onClick }) => {
  return (
    <button className={label} onClick={onClick}>
      <img src={icon}></img>
    </button>    
  );
};

export default SidebarButton;
