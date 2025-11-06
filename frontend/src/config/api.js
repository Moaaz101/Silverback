/**
 * API Configuration
 * Automatically uses the correct API URL based on environment
 */

// Vite exposes env variables that start with VITE_
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Build a complete API URL from an endpoint
 * @param {string} endpoint - API endpoint (with or without leading slash)
 * @returns {string} Complete API URL
 * @example buildApiUrl('/fighters') => 'http://localhost:4000/fighters'
 */
export const buildApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}

export default {
  API_URL,
  buildApiUrl
};
