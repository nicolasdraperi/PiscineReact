import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const PHOTOS_KEY = 'travel_photos';

export class PhotoService {
  // Obtenir la clé de stockage pour un utilisateur spécifique
  static getUserPhotosKey(userId) {
    if (!userId) {
      return PHOTOS_KEY; // Fallback pour la compatibilité
    }
    return `travel_photos_${userId}`;
  }

  // Obtenir l'ID utilisateur actuel
  static async getCurrentUserId() {
    try {
      const userData = await AsyncStorage.getItem('memorize_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id || user.email; // Flexible sur l'ID
      }
      return null;
    } catch (error) {
      console.warn('Impossible de récupérer l\'ID utilisateur:', error);
      return null;
    }
  }
  // Sauvegarder une photo avec ses métadonnées
  static async savePhoto(photoData) {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = this.getUserPhotosKey(userId);
      const photos = await this.getAllPhotos();
      
      const newPhoto = {
        id: Date.now().toString(),
        uri: photoData.uri,
        date: new Date().toISOString(),
        location: photoData.location,
        timestamp: Date.now(),
        userId: userId, // Associer à l'utilisateur
      };
      
      photos.push(newPhoto);
      await AsyncStorage.setItem(storageKey, JSON.stringify(photos));
      console.log('📱 Photo sauvée localement pour utilisateur:', userId);
      return newPhoto;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  // Récupérer toutes les photos
  static async getAllPhotos() {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = this.getUserPhotosKey(userId);
      const photosData = await AsyncStorage.getItem(storageKey);
      const photos = photosData ? JSON.parse(photosData) : [];
      console.log('📱 Photos locales récupérées pour utilisateur:', userId, '→', photos.length, 'photos');
      return photos;
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return [];
    }
  }

  // Récupérer les photos par date
  static async getPhotosByDate(date) {
    try {
      const photos = await this.getAllPhotos();
      return photos.filter(photo => {
        const photoDate = new Date(photo.date).toDateString();
        const targetDate = new Date(date).toDateString();
        return photoDate === targetDate;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération par date:', error);
      return [];
    }
  }

  // Supprimer une photo
  static async deletePhoto(photoId) {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = this.getUserPhotosKey(userId);
      const photos = await this.getAllPhotos();
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedPhotos));
      console.log('🗑️ Photo supprimée localement pour utilisateur:', userId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }

  // Supprimer toutes les photos (pour reset)
  static async clearAllPhotos() {
    try {
      const userId = await this.getCurrentUserId();
      const storageKey = this.getUserPhotosKey(userId);
      await AsyncStorage.removeItem(storageKey);
      console.log('🗑️ Photos locales supprimées pour utilisateur:', userId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }

  // Obtenir les statistiques
  static async getStats() {
    try {
      const photos = await this.getAllPhotos();
      const dates = new Set();
      const locations = new Set();
      
      photos.forEach(photo => {
        dates.add(new Date(photo.date).toDateString());
        if (photo.location) {
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
      console.error('Erreur lors du calcul des stats:', error);
      return {
        totalPhotos: 0,
        daysWithPhotos: 0,
        uniqueLocations: 0,
        firstPhoto: null,
        lastPhoto: null,
      };
    }
  }
}