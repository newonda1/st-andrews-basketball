import React from "react";
import { Navigate, useParams } from "react-router-dom";

export default function AthleteProfileRedirect() {
  const { playerId } = useParams();

  return <Navigate to={`/athletics/players/${playerId}`} replace />;
}
