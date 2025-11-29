import { API_CONFIG } from '../../config.js';

export function getFavorites() {
    try {
        const favorites = localStorage.getItem(API_CONFIG.FAV_STORAGE_KEY);
        return favorites ? JSON.parse(favorites) : [];
    } catch (e) {
        return [];
    }
}

export function saveFavorites(favorites) {
    try {
        localStorage.setItem(API_CONFIG.FAV_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
    }
}

export function getSettings() {
    try {
        const defaultSettings = {
            unit: 'C',
            theme: 'light'
        };
        const settings = localStorage.getItem(API_CONFIG.SETTINGS_STORAGE_KEY);
        return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (e) {
        return { unit: 'C', theme: 'light' };
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(API_CONFIG.SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
    }
}