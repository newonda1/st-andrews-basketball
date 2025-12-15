import React from "react";
import { Routes, Route } from "react-router-dom";

import Season2025_26 from "./seasons/Season2025_26";
import GameDetail from "./pages/GameDetail";

function GirlsBasketballApp() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <Routes>
        {/* Landing page for girls basketball */}
        <Route index element={<Season2025_26 />} />

        {/* Game detail */}
        <Route path="games/:gameId" element={<GameDetail />} />
      </Routes>
    </div>
  );
}

export default GirlsBasketballApp;
