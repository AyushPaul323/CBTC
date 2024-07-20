import React, { useState } from 'react';
import './App.css';
import Search from './Search';
import Map from './Map';
import WeatherInfo from './WeatherInfo';
import locationIcon from './Img/location-on-map.svg'; // Import the SVG image

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const fetchWeatherByCity = async (city) => {
    try {
      console.log(`Fetching weather data for: ${city}`);
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=b97c3e2f6d976ffb4bb3dc666ac63204`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching the weather data:', error);
    }
  };

  const handleMarkerMove = (markerPosition) => {
    fetchWeatherByCoords(markerPosition.lat, markerPosition.lng);
  };

  const fetchWeatherByCoords = (lat, lon) => {
    const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=b97c3e2f6d976ffb4bb3dc666ac63204`;

    fetch(weatherAPI)
      .then(response => response.json())
      .then(data => {
        setWeatherData(data);
        setIsPopupVisible(true);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
      });
  };

  const toggleMapVisibility = () => {
    setIsMapVisible(prevState => !prevState);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="app">
      <div className="gg">
        <h1>WeatherVue</h1>
        <div className="controls">
          {!isMapVisible && (
            <>
              <Search onSearch={fetchWeatherByCity} />
              <img 
                src={locationIcon} 
                alt="Toggle Map" 
                className="location-icon" 
                onClick={toggleMapVisibility}
              />
            </>
          )}
          {isMapVisible && (
            <img 
              src={locationIcon} 
              alt="Toggle Map" 
              className="location-icon" 
              onClick={toggleMapVisibility}
            />
          )}
        </div>
        {!isMapVisible && weatherData && <WeatherInfo weatherData={weatherData} />}
        {isMapVisible && (
          <div className="map-container">
            <Map onMarkerMove={handleMarkerMove} />
          </div>
        )}
        {isPopupVisible && (
          <div className="popup" onClick={closePopup}>
            <div className="popup-content">
              <WeatherInfo weatherData={weatherData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
