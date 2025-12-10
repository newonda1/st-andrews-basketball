import { Routes, Route } from "react-router-dom";
import Season2025_26 from "./seasons/Season2025_26";
import PlayerPage from "./pages/PlayerPage";
import GameDetail from "./pages/GameDetail";

function GirlsBasketballApp() {
  return (
    <Routes>
      {/* Landing page for the girls site */}
      <Route path="/" element={<Season2025_26 />} />

      {/* Individual game pages */}
      <Route path="/games/:gameId" element={<GameDetail />} />

      {/* Individual player pages */}
      <Route path="/players/:playerId" element={<PlayerPage />} />
    </Routes>
  );
}

export default GirlsBasketballApp;
