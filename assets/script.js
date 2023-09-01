var searchButton = document.querySelector('.search-btn');
var cityInput = document.querySelector('.city-input');
var apiKey = 'dfa2497b099e70bc958d481fac004b86';

// Function to fetch city coordinates from OpenWeather API based on city name
var getCityCoordinates = () => {
  var cityName = cityInput.value.trim();
  if (!cityName) return;

  var apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      // Handle the retrieved city coordinates data (data) here
      // For example, you could extract latitude and longitude from the data and use them for further API requests or processing
    })
    .catch(() => {
      alert('Error: City not found!');
    });
}

// Attach event listener to search button to fetch city coordinates
searchButton.addEventListener('click', getCityCoordinates);

// Array to store search history
var searchHistory = [];

// Function to fetch weather data for a city using OpenWeather API
async function getWeatherData(city) {
  try {
    var weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    var forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);

    var weatherData = await weatherResponse.json();
    var forecastData = await forecastResponse.json();

    return { weatherData, forecastData };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

// Function to get current position using Geolocation API
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject('Geolocation is not supported by this browser.');
    }
  });
}

// Function to fetch weather data for the user's current location
async function getWeatherDataForCurrentLocation() {
  try {
    var position = await getCurrentPosition();
    var { latitude, longitude } = position.coords;

    var weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
    var forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);

    var weatherData = await weatherResponse.json();
    var forecastData = await forecastResponse.json();

    return { weatherData, forecastData };
  } catch (error) {
    console.error('Error fetching weather data for current location:', error);
    return null;
  }
}


// Function to update the display with current weather data
function updateCurrentWeather(data) {
  var currentWeatherSection = document.querySelector('.current-weather');

  // Used object destructuring to directly extract properties
  var {
    name: cityName = 'N/A',
    dt: timestamp = null,
    main: {
      temp: temperature = 'N/A',
      humidity = 'N/A',
    } = {},
    wind: {
      speed: windSpeed = 'N/A',
    } = {},
    weather: [
      {
        icon: weatherIcon = '',
        description: weatherDescription = 'N/A',
      } = {},
    ] = [],
  } = data;

  var date = (timestamp ? new Date(timestamp * 1000).toLocaleDateString() : 'N/A');

  // Convert temperature to Fahrenheit
  var temperature_F = (temperature * 9/5) + 32;

  var detailsDiv = currentWeatherSection.querySelector('.details');
  var iconDiv = currentWeatherSection.querySelector('.icon');

  detailsDiv.innerHTML = `
    <h2>${cityName} (${date})</h2>
    <p>Temperature: ${temperature_F}°F</p>
    <p>Wind: ${windSpeed} MPH</p>
    <p>Humidity: ${humidity}%</p>
  `;

  iconDiv.innerHTML = `
    <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="weather-icon">
    <p>${weatherDescription}</p>
  `;
}

// Function to update 5-day forecast
function updateForecast(data) {
  var forecastSection = document.querySelector('.days-forecast');
  var weatherCards = forecastSection.querySelector('.weather-cards');
  var forecastData = data.list; // Use the list property from the forecast data

  // Clear existing forecast data
  weatherCards.innerHTML = '';

  // Only display forecast for the next 5 days
  for (var i = 0; i < forecastData.length; i += 8) {
    var forecast = forecastData[i];
    var date = new Date(forecast.dt * 1000).toLocaleDateString();
    var weatherIcon = forecast.weather[0].icon;
    var temperature = forecast.main.temp;
    var windSpeed = forecast.wind.speed;
    var humidity = forecast.main.humidity;

    var card = document.createElement('li');
    card.classList.add('card');

    // Convert temperature to Fahrenheit
  var temperature_F = (temperature * 9/5) + 32;

  card.innerHTML = `
    <h3>${date}</h3>
    <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="weather-icon">
    <p>Temp: ${temperature_F}°F</p>
    <p>Wind: ${windSpeed} MPH</p>
    <p>Humidity: ${humidity}%</p>
  `;

    weatherCards.appendChild(card);
  }
}

// Function to handle search button click
async function handleSearch() {
  var cityInput = document.querySelector('.city-input');
  var cityName = cityInput.value.trim();

  if (cityName === '') {
    return;
  }

  var { weatherData, forecastData } = await getWeatherData(cityName);

  if (weatherData && forecastData) {
    updateCurrentWeather(weatherData);
    updateForecast(forecastData);
    
    // Add the searched city to search history
    if (!searchHistory.includes(cityName)) {
      searchHistory.push(cityName);
      updateSearchHistory();
    }
  } else {
    // Handle error case
    alert('Error fetching weather data. Please try again later.');
  }
}

// Function to update search history display
function updateSearchHistory() {
  var searchHistoryList = document.querySelector('.history-btn');
  searchHistoryList.innerHTML = '';

  for (var i = 0; i < searchHistory.length; i++) {
    var li = document.createElement('li');
    li.textContent = searchHistory[i];
    li.addEventListener('click', function(event) {
      var clickedCity = event.target.textContent;
      cityInput.value = clickedCity;
      handleSearch();
    });
    searchHistoryList.appendChild(li);
  }
}

// Attach event listener to search button
var searchButton = document.querySelector('.search-btn');
searchButton.addEventListener('click', handleSearch);

// Attach event listener to "Use Current Location" button
var locationButton = document.querySelector('.location-btn');
locationButton.addEventListener('click', async function () {
  try {
    var { weatherData, forecastData } = await getWeatherDataForCurrentLocation();

    if (weatherData && forecastData) {
      updateCurrentWeather(weatherData);
      updateForecast(forecastData);
    } else {
      // Handle error case
      alert('Error fetching weather data for current location. Please try again later.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Attach event listener to "History" button
var historyButton = document.querySelector('.history-btn');
historyButton.addEventListener('click', function() {
  var searchHistoryList = document.querySelector('.list-group');
  searchHistoryList.classList.toggle('show');
});