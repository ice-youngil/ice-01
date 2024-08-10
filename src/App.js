import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SketchToolSelectScreen from 'pages/SketchToolSelectScreen';
import SketchToolHome from 'pages/SketchToolHome';
import ThreeDModel from 'services/threeD/ThreeDModelCopy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SketchToolSelectScreen />}/>
        <Route path="/sketchtoolhome" element={<SketchToolHome />} />
        <Route path="/threeD-modeling" element={<ThreeDModel />} />
      </Routes>
    </Router> 
  );
}

export default App;