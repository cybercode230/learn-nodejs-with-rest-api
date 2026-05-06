/**
 * Centralized environment configuration.
 * Avoid using import.meta.env directly in components.
 */

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'https://learn-nodejs-with-rest-api.onrender.com/api/v1',
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || '',
};
