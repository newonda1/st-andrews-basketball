import React from "react";
import { Routes, Route } from "react-router-dom";
import Season2025_26 from "./seasons/Season2025_26";

function GirlsBasketballApp() {
  return (
    <Routes>
      {/* Landing page for girls basketball */}
      <Route path="/" element={<Season2025_26 />} />
    </Routes>
  );
}

export default GirlsBasketballApp;
