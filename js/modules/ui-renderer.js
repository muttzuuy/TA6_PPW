import { getSettings, saveSettings } from './storage.js';

let currentSettings = getSettings();

function celsiusToFahrenheit(tempC) {
    return (tempC * 9/5) + 32;
}

function getTemp(temp) {
    const value = currentSettings.unit === 'C' ? temp : celsiusToFahrenheit(temp);
    const unit = currentSettings.unit === 'C' ? '°C' : '°F';
    return `${value.toFixed(1)}${unit}`;
}

function getWeatherIcon(iconCode) {
    switch (iconCode) {
        case '01d': return 'fas fa-sun text-warning';
        case '01n': return 'fas fa-moon text-info';
        case '02d':
        case '03d':
        case '04d': return 'fas fa-cloud-sun text-secondary';
        case '09d':
        case '09n': return 'fas fa-cloud-showers-heavy text-primary';
        case '10d':
        case '10n': return 'fas fa-cloud-rain text-primary';
        case '11d':
        case '11n': return 'fas fa-bolt text-warning';
        case '13d':
        case '13n': return 'fas fa-snowflake text-info';
        case '50d':
        case '50n': return 'fas fa-smog text-muted';
        default: return 'fas fa-question text-muted';
    }
}

export function renderCurrentWeather(data, isFavorite) {
    const currentWeatherDiv = document.getElementById('current-weather');
    const temp = getTemp(data.main.temp);
    const timestamp = new Date(data.dt * 1000).toLocaleString();

    const favButtonClass = isFavorite ? 'btn-danger' : 'btn-outline-secondary';
    const favIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';

    const html = `
        <h3 class="card-title text-center text-muted border-bottom pb-2">${data.name}, ${data.sys.country}</h3>
        <div class="current-widget-content pt-3">
            <div class="text-center">
                <div class="condition-icon">
                    <i class="${getWeatherIcon(data.weather[0].icon)}"></i>
                </div>
                <div class="temp-value">${temp}</div>
                <p class="lead fw-bold">${data.weather[0].description}</p>
                <button id="toggle-favorite-btn" 
                        class="btn btn-sm ${favButtonClass} mt-2" 
                        data-city="${data.name}">
                    <i class="${favIcon}"></i> ${isFavorite ? 'Remove from' : 'Add to'} Favorites
                </button>
            </div>

            <div class="weather-details-grid">
                <div class="detail-item">Humidity: <br><strong>${data.main.humidity}%</strong></div>
                <div class="detail-item">Wind Speed: <br><strong>${data.wind.speed} m/s</strong></div>
                <div class="detail-item">Min Temp: <br><strong>${getTemp(data.main.temp_min)}</strong></div>
                <div class="detail-item">Max Temp: <br><strong>${getTemp(data.main.temp_max)}</strong></div>
            </div>
        </div>
        <div class="text-end pt-3 text-muted border-top mt-3">
            <small>Last Updated: ${timestamp}</small>
        </div>
    `;

    currentWeatherDiv.innerHTML = html;
}

export function renderForecast(data) {
    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';
    
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyForecasts.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        const tempMin = getTemp(item.main.temp_min);
        const tempMax = getTemp(item.main.temp_max);

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item bg-light border shadow-sm';
        forecastItem.innerHTML = `
            <h5 class="fw-bold text-primary">${date}</h5>
            <i class="${getWeatherIcon(item.weather[0].icon)} mb-2 h3"></i>
            <p class="text-muted small">${item.weather[0].description}</p>
            <p class="mb-0">Min: ${tempMin}</p>
            <p>Max: ${tempMax}</p>
        `;
        forecastGrid.appendChild(forecastItem);
    });
}

export function renderFavoriteCities(citiesData) {
    const container = document.getElementById('favorite-list-container');
    container.innerHTML = '';
    
    if (citiesData.length === 0) {
        container.innerHTML = `<li class="list-group-item text-muted">No favorites saved yet.</li>`;
        return;
    }
    
    citiesData.forEach(city => {
        const temp = getTemp(city.main.temp);
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center favorite-item list-group-item-action';
        listItem.setAttribute('data-city', city.name);
        listItem.style.cursor = 'pointer';

        listItem.innerHTML = `
            <div>
                <i class="${getWeatherIcon(city.weather[0].icon)} me-2"></i>
                <span class="fw-bold">${city.name}</span>
                <span class="badge bg-primary rounded-pill ms-2">${temp}</span>
            </div>
            <button class="btn btn-sm btn-danger remove-fav-btn" data-city="${city.name}">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(listItem);
    });
}

export function setStatusMessage(message, type = 'loading') {
    const statusDiv = document.getElementById('status-message');
    let alertClass = 'alert-info'; 

    if (type === 'error') {
        alertClass = 'alert-danger';
    } else if (type === 'success') {
        alertClass = 'alert-success';
    } else if (type === 'warning') {
        alertClass = 'alert-warning';
    }

    statusDiv.className = `alert ${alertClass} text-center fw-bold`;
    statusDiv.textContent = message;
    
    if (type === 'loading') {
        document.getElementById('current-weather').innerHTML = `<div class="text-center text-muted">Loading weather data...</div>`;
        document.getElementById('forecast-grid').innerHTML = `<div class="text-center text-muted w-100">Loading forecast...</div>`;
    }
}

export function toggleTemperatureUnit() {
    currentSettings.unit = currentSettings.unit === 'C' ? 'F' : 'C';
    saveSettings(currentSettings);
    
    const toggleButton = document.getElementById('temp-toggle');
    toggleButton.textContent = currentSettings.unit === 'C' ? 'C / F' : 'F / C';

    return currentSettings.unit;
}

export function toggleTheme() {
    currentSettings.theme = currentSettings.theme === 'light' ? 'dark' : 'light';
    saveSettings(currentSettings);

    const isDark = currentSettings.theme === 'dark';
    
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('bg-light', !isDark);

    const toggleButton = document.getElementById('theme-toggle');
    toggleButton.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    toggleButton.className = isDark ? 'btn btn-outline-light' : 'btn btn-outline-dark';
}

export function initializeUI() {
    const isDark = currentSettings.theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    
    const themeButton = document.getElementById('theme-toggle');
    if (themeButton) {
        themeButton.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeButton.className = isDark ? 'btn btn-outline-light' : 'btn btn-outline-dark';
    }
    
    const tempButton = document.getElementById('temp-toggle');
    if (tempButton) {
        tempButton.textContent = currentSettings.unit === 'C' ? 'C / F' : 'F / C';
    }
}

export { currentSettings };