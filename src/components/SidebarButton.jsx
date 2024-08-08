import React from 'react';
import 'assets/css/SidebarButton.css';

const SidebarButton = ({ icon, label, onClick }) => {
  return (
    <li className="sidebar-button" onClick={onClick}>
      <img className="button-icon" src={icon} alt={label} />
      <span className="button-label">{label}</span>
    </li>
  );
};

export default SidebarButton;
