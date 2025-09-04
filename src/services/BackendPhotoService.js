import ApiService from './ApiService';
import { Config } from '../utils/config';

// Service pour gérer les photos avec le backend
class BackendPhotoService {
  
  // Endpoints selon l'API de ton collègue
  endpoints = {
    photos: '/api/photos',
    upload: '/api/photos', // POST vers /api/photos
    delete: '/api/photos',
    byDate: '/api/photos', // Filtrer côté client
    stats: '/api/users/me', // Stats via endpoint utilisateur
  };

  // Récupérer toutes les photos
  async getAllPhotos() {
    try {
      const photos = await ApiService.get(this.endpoints.photos);
      console.log('📡 Photos reçues du backend:', photos.length, 'photos');
      
      // Le backend DEVRAIT déjà filtrer par utilisateur, mais sécurité supplémentaire
      // Adapter le format backend vers notre format frontend
      const formattedPhotos = photos.map(photo => ({
        id: photo._id,
        uri: `${Config.API.BASE_URL}${photo.imageUrl}`, // URL complète de l'image
        date: photo.date,
        location: photo.location,
        userId: photo.userId,
        synced: true,
        backendId: photo._id
      }));
      
      console.log('📱 Photos formatées:', formattedPhotos.length, 'photos');
      return formattedPhotos;
    } catch (error) {
      console.error('Erreur récupération photos:', error);
      throw error;
    }
  }

  // Uploader une nouvelle photo
  async uploadPhoto(photoData) {
    try {
      // Préparer les données selon le format attendu par l'API
      const formData = new FormData();
      
      // Ajouter le fichier photo
      formData.append('photo', {
        uri: photoData.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      });

      // Ajouter les métadonnées
      if (photoData.location) {
        formData.append('location', JSON.stringify(photoData.location));
      }
      
      if (photoData.date) {
        formData.append('date', photoData.date);
      }

      const response = await ApiService.api.post(this.endpoints.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Adapter la réponse backend vers notre format
      const photo = response.data;
      return {
        id: photo._id,
        uri: `${Config.API.BASE_URL}${photo.imageUrl}`,
        date: photo.date,
        location: photo.location,
        userId: photo.userId,
        synced: true,
        backendId: photo._id
      };
    } catch (error) {
      console.error('Erreur upload photo:', error);
      throw error;
    }
  }

  // Récupérer les photos par date
  async getPhotosByDate(date) {
    try {
      // Récupérer toutes les photos et filtrer côté client
      const allPhotos = await this.getAllPhotos();
      const targetDate = new Date(date).toDateString();
      
      const photosForDate = allPhotos.filter(photo => {
        const photoDate = new Date(photo.date).toDateString();
        return photoDate === targetDate;
      });
      
      return photosForDate;
    } catch (error) {
      console.error('Erreur récupération photos par date:', error);
      throw error;
    }
  }

  // Supprimer une photo
  async deletePhoto(photoId) {
    try {
      await ApiService.delete(`${this.endpoints.delete}/${photoId}`);
      return true;
    } catch (error) {
      console.error('Erreur suppression photo:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStats() {
    try {
      const data = await ApiService.get(this.endpoints.stats);
      const photos = data.photos || [];
      
      // Calculer les stats côté client
      const dates = new Set();
      const locations = new Set();
      
      photos.forEach(photo => {
        dates.add(new Date(photo.date).toDateString());
        if (photo.location && photo.location.latitude && photo.location.longitude) {
          locations.add(`${photo.location.latitude},${photo.location.longitude}`);
        }
      });

      return {
        totalPhotos: photos.length,
        daysWithPhotos: dates.size,
        uniqueLocations: locations.size,
        firstPhoto: photos.length > 0 ? new Date(Math.min(...photos.map(p => new Date(p.date)))) : null,
        lastPhoto: photos.length > 0 ? new Date(Math.max(...photos.map(p => new Date(p.date)))) : null,
      };
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      // Retourner des stats par défaut en cas d'erreur
      return {
        totalPhotos: 0,
        daysWithPhotos: 0,
        uniqueLocations: 0,
        firstPhoto: null,
        lastPhoto: null,
      };
    }
  }

  // Mettre à jour une photo (mood, etc.)
  async updatePhoto(photoId, updates) {
    try {
      const response = await ApiService.put(`${this.endpoints.photos}/${photoId}`, updates);
      return response;
    } catch (error) {
      console.error('Erreur mise à jour photo:', error);
      throw error;
    }
  }

  // Rechercher des photos par critères
  async searchPhotos(criteria) {
    try {
      const data = await ApiService.get(`${this.endpoints.photos}/search`, criteria);
      return data.photos || data;
    } catch (error) {
      console.error('Erreur recherche photos:', error);
      throw error;
    }
  }

  // Récupérer les photos par géolocalisation
  async getPhotosByLocation(latitude, longitude, radius = 1000) {
    try {
      const data = await ApiService.get(`${this.endpoints.photos}/near`, {
        lat: latitude,
        lng: longitude,
        radius: radius
      });
      return data.photos || data;
    } catch (error) {
      console.error('Erreur récupération photos par localisation:', error);
      throw error;
    }
  }
}

export default new BackendPhotoService();
