import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

function sportHintFromPath(pathname) {
  if (pathname.includes("/boys/basketball/")) return "boys-basketball";
  if (pathname.includes("/girls/basketball/")) return "girls-basketball";
  if (pathname.includes("/football/")) return "football";
  if (pathname.includes("/boys/soccer/")) return "boys-soccer";
  if (pathname.includes("/girls/soccer/")) return "girls-soccer";
  if (pathname.includes("/golf/")) return "golf";
  if (pathname.includes("/cross-country/")) return "cross-country";
  if (pathname.includes("/volleyball/")) return "volleyball";
  return "";
}

export default function AthleteProfileRedirect() {
  const { playerId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sportHint = params.get("sport") || sportHintFromPath(location.pathname);
  const search = sportHint ? `?sport=${encodeURIComponent(sportHint)}` : "";

  return <Navigate to={`/athletics/players/${playerId}${search}`} replace />;
}
