// Environment configuration
const config = {
  development: {
    apiBaseUrl: 'http://192.168.18.4:8000',
    // Add other development-specific settings here
  },
  production: {
    apiBaseUrl: 'https://your-production-api.com',
    // Add other production-specific settings here
  },
  // Add more environments as needed
};

// Get current environment
const getEnv = () => {
  if (__DEV__) return 'development';
  return 'production';
};

// Get current configuration
export const getConfig = () => {
  return config[getEnv()];
};

// Get API base URL
export const getApiBaseUrl = () => {
  return getConfig().apiBaseUrl;
};

// Export all config
export default config; 