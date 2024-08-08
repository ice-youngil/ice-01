import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SketchToolSelectScreen from 'pages/SketchToolSelectScreen';
import SketchToolHome from 'pages/SketchToolHome';
import RectangleModel from 'services/threeD/RectangleModel';
import CeramicModel from 'services/threeD/CeramicModel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SketchToolSelectScreen />} />
        <Route path="/sketchtoolhome" element={<SketchToolHome />} />
        <Route path="/rectangle-model" element={<RectangleModel />} />
        <Route path="/ceramic-model" element={<CeramicModel />} />
      </Routes>
    </Router> 
  );
}

export default App;