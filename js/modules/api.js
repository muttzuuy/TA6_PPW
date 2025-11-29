import { API_CONFIG } from '../../config.js';

const { API_KEY, BASE_URL } = API_CONFIG;

export async function fetchCurrentWeather(city, unit = 'metric') {
    const url = `${BASE_URL}/weather?q=${city}&units=${unit}&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City '${city}' not found. Please try a different name.`);
            }
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); 
        return data; 
        
    } catch (error) {
        throw new Error(`Failed to retrieve weather data: ${error.message}`);
    }
}

export async function fetchFiveDayForecast(city, unit = 'metric') {
    const url = `${BASE_URL}/forecast?q=${city}&units=${unit}&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error(`Forecast for '${city}' is unavailable.`);
            }
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
        
    } catch (error) {
        throw new Error(`Failed to retrieve forecast data: ${error.message}`);
    }
}

export async function fetchWeatherForMultipleCities(cityNames, unit = 'metric') {
    if (cityNames.length === 0) return [];
    
    const promises = cityNames.map(city => 
        fetchCurrentWeather(city, unit).catch(e => {
            console.warn(`Skipping failed fetch for favorite city: ${city}`);
            return null; 
        })
    );
    
    const results = await Promise.all(promises);
    return results.filter(data => data !== null);
}