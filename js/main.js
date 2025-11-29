import { API_CONFIG } from '../config.js';
import { fetchCurrentWeather, fetchFiveDayForecast, fetchWeatherForMultipleCities } from './modules/api.js';
import { getFavorites, saveFavorites } from './modules/storage.js';
import { 
    renderCurrentWeather, 
    renderForecast, 
    renderFavoriteCities,
    toggleTemperatureUnit, 
    toggleTheme, 
    setStatusMessage,
    initializeUI,
    currentSettings
} from './modules/ui-renderer.js';

let currentCity = API_CONFIG.DEFAULT_CITY; 
let updateInterval = null;

async function loadWeatherData(city) {
    if (!city) {
        setStatusMessage('Please enter a city name.', 'warning');
        return;
    }
    
    setStatusMessage(`Fetching weather for ${city}...`, 'loading');

    try {
        const unit = currentSettings.unit === 'C' ? 'metric' : 'imperial';

        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(city, unit),
            fetchFiveDayForecast(city, unit)
        ]);

        const favorites = getFavorites();
        const isFavorite = favorites.includes(city);

        renderCurrentWeather(currentData, isFavorite);
        renderForecast(forecastData);

        currentCity = city;
        setStatusMessage(`Weather loaded successfully for ${city}. Last updated: ${new Date().toLocaleTimeString()}`, 'success');
        
        startAutoUpdates(); 

    } catch (error) {
        setStatusMessage(`Error: ${error.message}`, 'error');
    }
}

async function loadFavoriteData() {
    const favorites = getFavorites();
    
    const unit = currentSettings.unit === 'C' ? 'metric' : 'imperial';

    try {
        const favoriteData = await fetchWeatherForMultipleCities(favorites, unit);
        renderFavoriteCities(favoriteData);
    } catch (error) {
        console.error('Failed to load favorite data:', error);
    }
}

function startAutoUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    if (currentCity) {
        updateInterval = setInterval(() => {
            console.log('Auto-updating data...');
            loadWeatherData(currentCity);
            loadFavoriteData(); 
        }, API_CONFIG.AUTO_UPDATE_DELAY);
        console.log(`Auto updates started for ${currentCity} every 5 minutes.`);
    }
}

function handleSearch() {
    const cityInput = document.getElementById('city-input').value.trim();
    document.getElementById('city-input').value = ''; 

    if (cityInput) {
        loadWeatherData(cityInput);
    } else {
        setStatusMessage('City name cannot be empty.', 'warning');
    }
}

function handleRefresh() {
    if (currentCity) {
        loadWeatherData(currentCity); 
    } else {
        setStatusMessage('Please search for a city first.', 'warning');
    }
}

function handleTempToggle() {
    const newUnit = toggleTemperatureUnit(); 
    
    if (currentCity) loadWeatherData(currentCity);
    loadFavoriteData();
    setStatusMessage(`Temperature unit switched to ${newUnit}.`, 'info');
}

function handleThemeToggle() {
    toggleTheme();
}

function handleToggleFavorite(e) {
    const city = e.target.closest('#toggle-favorite-btn').dataset.city;
    if (!city) return;

    let favorites = getFavorites();
    const cityIndex = favorites.indexOf(city);

    if (cityIndex > -1) {
        favorites.splice(cityIndex, 1); 
        setStatusMessage(`Removed ${city} from favorites.`, 'info');
    } else {
        favorites.push(city);
        setStatusMessage(`Added ${city} to favorites.`, 'success');
    }
    
    saveFavorites(favorites);
    loadWeatherData(city); 
    loadFavoriteData(); 
}

function handleFavoriteClick(e) {
    const listItem = e.target.closest('.favorite-item');
    if (listItem && !e.target.closest('.remove-fav-btn')) {
        const city = listItem.dataset.city;
        loadWeatherData(city);
    }
}

function handleRemoveFavorite(e) {
    const button = e.target.closest('.remove-fav-btn');
    const city = button.dataset.city;
    if (city) {
        let favorites = getFavorites();
        favorites = favorites.filter(fav => fav !== city);
        saveFavorites(favorites);
        loadFavoriteData();
        setStatusMessage(`Removed ${city} from favorites.`, 'info');
        
        if (currentCity === city) {
            currentCity = getFavorites()[0] || API_CONFIG.DEFAULT_CITY;
            loadWeatherData(currentCity);
        }
    }
}

function setupEventListeners() {
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('refresh-btn').addEventListener('click', handleRefresh);
    document.getElementById('temp-toggle').addEventListener('click', handleTempToggle);
    document.getElementById('theme-toggle').addEventListener('click', handleThemeToggle);
    
    document.getElementById('city-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    document.getElementById('current-weather').addEventListener('click', (e) => {
        if (e.target.closest('#toggle-favorite-btn')) {
            handleToggleFavorite(e);
        }
    });
    document.getElementById('favorites-list').addEventListener('click', handleFavoriteClick);
    document.getElementById('favorites-list').addEventListener('click', (e) => {
        if (e.target.closest('.remove-fav-btn')) {
            handleRemoveFavorite(e);
        }
    });
}

function initializeApp() {
    initializeUI();
    setupEventListeners();

    const initialCity = getFavorites()[0] || API_CONFIG.DEFAULT_CITY;
    currentCity = initialCity;
    
    loadFavoriteData();
    loadWeatherData(currentCity);
}

document.addEventListener('DOMContentLoaded', initializeApp);