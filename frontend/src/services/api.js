import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const timezoneAPI = {
  // Get all available timezones
  getTimezones: async () => {
    try {
      const response = await apiClient.get('/timezones');
      return response.data;
    } catch (error) {
      console.error('Error fetching timezones:', error);
      throw error;
    }
  },

  // Convert timezone to IST
  convertToIST: async (sourceTimezone, targetDatetime = null) => {
    try {
      const response = await apiClient.post('/convert', {
        source_timezone: sourceTimezone,
        target_datetime: targetDatetime
      });
      return response.data;
    } catch (error) {
      console.error('Error converting timezone:', error);
      throw error;
    }
  },

  // Get current IST time
  getISTTime: async () => {
    try {
      const response = await apiClient.get('/ist-time');
      return response.data;
    } catch (error) {
      console.error('Error fetching IST time:', error);
      throw error;
    }
  },

  // Get saved timezones
  getSavedTimezones: async () => {
    try {
      const response = await apiClient.get('/saved-timezones');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved timezones:', error);
      throw error;
    }
  },

  // Add timezone to saved list
  addSavedTimezone: async (timezoneId, name) => {
    try {
      const response = await apiClient.post('/saved-timezones', {
        timezone_id: timezoneId,
        name: name
      });
      return response.data;
    } catch (error) {
      console.error('Error adding saved timezone:', error);
      throw error;
    }
  },

  // Remove timezone from saved list
  removeSavedTimezone: async (timezoneId) => {
    try {
      const response = await apiClient.delete(`/saved-timezones/${timezoneId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing saved timezone:', error);
      throw error;
    }
  },

  // Get current time for multiple timezones
  getTimezonesTimes: async (timezoneIds) => {
    try {
      const response = await apiClient.get('/timezone-times', {
        params: { timezone_ids: timezoneIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching timezone times:', error);
      throw error;
    }
  }
};

export default apiClient;