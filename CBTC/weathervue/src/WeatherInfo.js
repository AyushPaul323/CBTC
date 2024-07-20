import React from 'react';

const WeatherInfo = ({weatherData }) => {
  if (!weatherData || !weatherData.sys) {
    return null;
  }

  return (
    <div id="weather-info">
      <h2>Weather Information</h2>
      <div>
        <p>Location:{weatherData.name},{weatherData.sys.country}</p>
        <p>Temperature:{weatherData.main.temp}°C</p>
        <p>Description:{weatherData.weather[0].description}</p>
      </div>
    </div>
  );
};

export default WeatherInfo;
