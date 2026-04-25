import React from 'react';
import { useParams } from 'react-router-dom';

function SeasonPlaceholder() {
  const { seasonId } = useParams();

  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold">Season {seasonId}</h2>
      <p>This page will show the stats for the {seasonId} season.</p>
    </div>
  );
}

export default SeasonPlaceholder;
