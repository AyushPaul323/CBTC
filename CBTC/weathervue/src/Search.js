import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Search.css';

const Search = ({ onSearch, country }) => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoFetched, setGeoFetched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchWeatherByGeoLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeatherData(latitude, longitude);
          setGeoFetched(true);
        },
        (error) => {
          setError('Failed to retrieve your location.');
          setLoading(false);
        }
      );
    };

    if (!geoFetched) {
      fetchWeatherByGeoLocation();
    }

    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(history);

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [geoFetched, onSearch]);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=b97c3e2f6d976ffb4bb3dc666ac63204`);
      if (!response.ok) {
        throw new Error('Weather data not found.');
      }
      const data = await response.json();
      onSearch(data.name, data.sys.country);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch weather data.');
      setLoading(false);
    }
  };

  const handleSearch = async (searchCity) => {
    setLoading(true);
    setError(null);

    try {
      const cityName = searchCity || city.trim();

      if (!cityName) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        await fetchWeatherData(latitude, longitude);
      } else {
        const response = await axios.get(`http://api.geonames.org/searchJSON`, {
          params: {
            q: cityName,
            maxRows: 1,
            country: country,
            username: 'ayush_paul_13'
          }
        });
        if (response.data.geonames.length > 0) {
          const { lat, lng } = response.data.geonames[0];
          await fetchWeatherData(lat, lng);
          setCity(response.data.geonames[0].name);
          updateSearchHistory(response.data.geonames[0].name);
        } else {
          setError('Location not found.');
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Unauthorized access. Please check your API credentials.');
      } else {
        setError('Failed to fetch weather data.');
      }
    } finally {
      setLoading(false);
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setCity(value);

    if (value.length > 2) {
      try {
        let params = {
          q: value,
          maxRows: 5,
          username: 'ayush_paul_13'
        };

        if (country) {
          params.country = country;
        } else {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude, longitude } = position.coords;

          const geoResponse = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);

          if (geoResponse.data.principalSubdivision) {
            params.adminCode1 = geoResponse.data.principalSubdivision.code;
          }

          if (geoResponse.data.countryCode) 
          {
            params.country=geoResponse.data.countryCode;
          }
        }
        const response=await axios.get(`http://api.geonames.org/searchJSON`, 
        {
          params: params
        });

        setSuggestions(response.data.geonames);
        setShowSuggestions(true);
        setShowHistory(false);
      } 
      catch (error) 
      {
        if (error.response && error.response.status===401) 
        {
          setError('Unauthorized access. Please check your API credentials.');
        } else 
        {
          setError('Failed to fetch location suggestions.');
        }
      }
    } 
    else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const updateSearchHistory=(newCity) => 
  {
    const updatedHistory = [newCity, ...searchHistory.filter(city => city!==newCity)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name); 
    handleSearch(suggestion.name);
  };

  const handleHistoryClick = async (historyItem) => {
    setCity(historyItem);
    await handleSearch(historyItem); 
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input">
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          placeholder={loading ? 'Loading...' : 'Enter Location'}
          disabled={loading}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (searchHistory.length > 0) {
              setShowHistory(true);
            }
          }}
        />
        <button onClick={() => handleSearch()} disabled={loading}>
          Search
        </button>
      </div>
      {showHistory && (
        <div className="autocomplete-dropdown-container">
          <div>
            <p className="dropdown-header">Search History</p>
            {searchHistory.map((historyItem, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleHistoryClick(historyItem)}
              >
                {historyItem}
              </div>
            ))}
          </div>
        </div>
      )}
      {showSuggestions && (
        <div className="autocomplete-dropdown-container">
          <div>
            <p className="dropdown-header">Suggestions</p>
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.geonameId}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.name}, {suggestion.countryName}
              </div>
            ))}
          </div>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Search;
