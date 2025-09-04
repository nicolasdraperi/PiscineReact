// Configuration de l'application
export const Config = {
  // Configuration API - À MODIFIER selon ton setup
  API: {
    // IP de ta machine (backend) - Port 5000 selon le .env
    BASE_URL: 'http://192.168.1.154:5000', // Ton IP + port backend
    TIMEOUT: 10000,
    
    // Endpoints
    ENDPOINTS: {
      PHOTOS: '/api/photos',
      UPLOAD: '/api/photos/upload',
      USERS: '/api/users',
      AUTH: '/api/auth',
    }
  },

  // Mode développement
  DEV: {
    ENABLE_LOGS: true,
    USE_LOCAL_STORAGE: true, // Si true, utilise AsyncStorage en backup
    MOCK_API: false, // Si true, utilise des données mockées
  },

  // Configuration de l'app
  APP: {
    NAME: 'Memorize',
    VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@memorize.app',
  },

  // Limites et contraintes
  LIMITS: {
    MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_PHOTOS_PER_DAY: 50,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  }
};

// Fonction pour détecter l'IP automatiquement (pour développement)
export const getLocalIP = () => {
  // Cette fonction peut être utilisée pour détecter automatiquement l'IP
  // En développement, tu peux la modifier manuellement
  return '192.168.1.154'; // Ton IP détectée
};

// Fonction pour construire l'URL complète
export const buildApiUrl = (endpoint) => {
  return `${Config.API.BASE_URL}${endpoint}`;
};

// Vérifier si on est en mode développement
export const isDevelopment = () => {
  return __DEV__ || Config.DEV.ENABLE_LOGS;
};

// Configuration selon l'environnement
if (isDevelopment()) {
  console.log('🔧 Mode développement activé');
  console.log('🌐 API URL:', Config.API.BASE_URL);
}
