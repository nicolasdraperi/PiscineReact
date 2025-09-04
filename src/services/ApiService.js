import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de base de l'API
class ApiService {
  constructor() {
    // Adresse IP de ta machine - Port 5000 selon .env
    this.baseURL = 'http://192.168.1.154:5000'; // Ton IP + port backend
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token JWT automatiquement
    this.api.interceptors.request.use(
      async (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Récupérer le token stocké et l'ajouter aux headers
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token && token !== 'local_token') {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token JWT ajouté:', token.substring(0, 20) + '...');
          }
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer le token:', error);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour logger les réponses
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  // Méthode pour changer l'URL de base (utile pour tests)
  setBaseURL(url) {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }

  // Méthodes CRUD génériques
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload de fichiers (photos)
  async uploadFile(endpoint, file, additionalData = {}) {
    try {
      const formData = new FormData();
      
      // Ajouter le fichier
      formData.append('photo', {
        uri: file.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      });

      // Ajouter les données supplémentaires
      Object.keys(additionalData).forEach(key => {
        formData.append(key, JSON.stringify(additionalData[key]));
      });

      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Gestion des erreurs
  handleError(error) {
    if (error.response) {
      // Erreur de réponse du serveur
      return {
        message: error.response.data?.message || 'Erreur serveur',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Pas de réponse du serveur
      return {
        message: 'Impossible de contacter le serveur',
        status: 0,
        data: null,
      };
    } else {
      // Erreur de configuration
      return {
        message: error.message || 'Erreur inconnue',
        status: -1,
        data: null,
      };
    }
  }

  // Test de connexion
  async testConnection() {
    try {
      // Utiliser un endpoint qui existe réellement dans ton backend
      const response = await this.get('/api/photos');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export default new ApiService();
