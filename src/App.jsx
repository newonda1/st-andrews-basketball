import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import Season2024_25 from './components/Season2024_25';
import Season2025_26 from './components/Season2025_26';   // ← NEW IMPORT
import SingleSeason from './components/SingleSeason';
import PlayerProfile from './components/PlayerProfile';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Existing seasons */}
          <Route path="/season/2024-25" element={<Season2024_25 />} />

          {/* NEW: 2025–26 season page */}
          <Route path="/season/2025-26" element={<Season2025_26 />} />

          {/* Your generic single-season template (if still used) */}
          <Route path="/season/:seasonId" element={<SingleSeason />} />

          {/* Player profile */}
          <Route path="/player/:playerId" element={<PlayerProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
