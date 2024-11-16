import React from 'react';

export const WeatherStatus: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Hava Durumu</h2>
      <div className="p-2 rounded bg-yellow-50 text-yellow-800">
        Hava durumu servisi şu anda bakımda
      </div>
    </div>
  );
};