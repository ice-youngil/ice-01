import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SketchToolHome from 'pages/SketchToolHome';
import ThreeDModel from 'services/threeD/ThreeDModel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SketchToolHome />}/>
        <Route path="/sketchtoolhome" element={<SketchToolHome />} />
        <Route path="/threeD-modeling" element={<ThreeDModel />} />
      </Routes>
    </Router> 
  );
}

export default App;