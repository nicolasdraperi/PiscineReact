import BackendPhotoService from './BackendPhotoService';
import { PhotoService as LocalPhotoService } from './PhotoService';
import { testBackendConnection } from '../utils/testConnection';

// Service hybride qui utilise le backend ET le stockage local
class HybridPhotoService {
  constructor() {
    this.useBackend = false;
    this.backendAvailable = false;
    this.checkingConnection = false;
    this.photosCache = null;
    this.cacheTime = null;
    this.cacheDuration = 2000; // 2 secondes de cache
    this.pendingRequests = new Map(); // Pour éviter les appels parallèles
  }

  // Vérifier la disponibilité du backend
  async checkBackendAvailability() {
    if (this.checkingConnection) return this.backendAvailable;
    
    this.checkingConnection = true;
    console.log('🔍 Vérification de la connexion backend...');
    
    try {
      const result = await testBackendConnection();
      this.backendAvailable = result.success;
      this.useBackend = result.success;
      
      if (result.success) {
        console.log('✅ Backend disponible - Mode hybride activé');
      } else {
        console.log('⚠️ Backend indisponible - Mode local uniquement');
      }
    } catch (error) {
      console.log('❌ Erreur connexion backend:', error.message);
      this.backendAvailable = false;
      this.useBackend = false;
    }
    
    this.checkingConnection = false;
    return this.backendAvailable;
  }

  // Synchroniser les données locales vers le backend
  async syncLocalToBackend() {
    if (!this.backendAvailable) return false;

    try {
      console.log('🔄 Synchronisation vers le backend...');
      const localPhotos = await LocalPhotoService.getAllPhotos();
      
      let syncCount = 0;
      for (const photo of localPhotos) {
        try {
          // Vérifier si la photo existe déjà sur le backend
          if (!photo.synced) {
            await BackendPhotoService.uploadPhoto(photo);
            
            // Marquer comme synchronisée localement
            photo.synced = true;
            await LocalPhotoService.savePhoto(photo);
            syncCount++;
          }
        } catch (error) {
          console.warn('⚠️ Erreur sync photo:', photo.id, error.message);
        }
      }
      
      console.log(`✅ ${syncCount} photos synchronisées`);
      return true;
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      return false;
    }
  }

  // Sauvegarder une photo (backend + local)
  async savePhoto(photoData) {
    console.log('🔄 HybridPhotoService.savePhoto appelé avec:', photoData?.uri);
    await this.checkBackendAvailability();

    // Toujours sauvegarder en local d'abord
    console.log('📱 Sauvegarde locale...');
    const localResult = await LocalPhotoService.savePhoto(photoData);
    
    // Vider le cache après sauvegarde pour forcer le refresh
    this.clearCache();
    
    // Essayer de sauvegarder sur le backend si disponible
    if (this.useBackend) {
      try {
        console.log('☁️ Sauvegarde backend...');
        const backendResult = await BackendPhotoService.uploadPhoto(photoData);
        
        // Marquer comme synchronisé
        localResult.synced = true;
        localResult.backendId = backendResult.id;
        await LocalPhotoService.savePhoto(localResult);
        
        console.log('✅ Photo sauvegardée: Local + Backend');
        return { ...localResult, backendId: backendResult.id };
      } catch (error) {
        console.warn('⚠️ Sauvegarde backend échouée, photo en local uniquement');
        localResult.synced = false;
        return localResult;
      }
    }

    console.log('📱 Photo sauvegardée en local uniquement');
    return localResult;
  }

  // Récupérer toutes les photos avec cache et protection contre appels multiples
  async getAllPhotos() {
    const cacheKey = 'getAllPhotos';
    
    // Vérifier le cache
    if (this.photosCache && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration) {
      console.log('📋 Photos depuis le cache (évite appels multiples)');
      return this.photosCache;
    }

    // Si un appel est déjà en cours, attendre le résultat
    if (this.pendingRequests.has(cacheKey)) {
      console.log('⏳ Attente de l\'appel en cours...');
      return await this.pendingRequests.get(cacheKey);
    }

    // Créer une nouvelle promesse pour cet appel
    const promise = this._fetchAllPhotos();
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      
      // Déduplication de sécurité basée sur l'ID/URI
      const deduplicatedResult = this.deduplicatePhotos(result);
      
      // Mettre en cache le résultat
      this.photosCache = deduplicatedResult;
      this.cacheTime = Date.now();
      return deduplicatedResult;
    } finally {
      // Nettoyer la promesse en cours
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Méthode privée pour récupérer les photos
  async _fetchAllPhotos() {
    console.log('🔄 Récupération photos (nouvel appel)');
    await this.checkBackendAvailability();

    if (this.useBackend) {
      try {
        // Essayer le backend d'abord
        const backendPhotos = await BackendPhotoService.getAllPhotos();
        console.log('✅ Photos récupérées depuis le backend:', backendPhotos.length, 'photos');
        
        // Pour éviter les doublons, ne retourner QUE les photos backend
        // Le backend contient déjà toutes les photos synchronisées de l'utilisateur
        return backendPhotos;
      } catch (error) {
        console.warn('⚠️ Backend indisponible, utilisation du local');
        this.useBackend = false;
      }
    }

    // Fallback sur le stockage local
    const localPhotos = await LocalPhotoService.getAllPhotos();
    console.log('📱 Photos récupérées depuis le stockage local');
    return localPhotos;
  }

  // Récupérer les photos par date
  async getPhotosByDate(date) {
    await this.checkBackendAvailability();

    if (this.useBackend) {
      try {
        return await BackendPhotoService.getPhotosByDate(date);
      } catch (error) {
        console.warn('⚠️ Erreur backend, fallback local');
      }
    }

    return await LocalPhotoService.getPhotosByDate(date);
  }

  // Supprimer une photo
  async deletePhoto(photoId) {
    await this.checkBackendAvailability();

    // Supprimer en local
    const localResult = await LocalPhotoService.deletePhoto(photoId);
    
    // Vider le cache après suppression
    this.clearCache();

    // Supprimer sur le backend si possible
    if (this.useBackend) {
      try {
        await BackendPhotoService.deletePhoto(photoId);
        console.log('✅ Photo supprimée: Local + Backend');
      } catch (error) {
        console.warn('⚠️ Suppression backend échouée');
      }
    }

    return localResult;
  }

  // Récupérer les statistiques
  async getStats() {
    await this.checkBackendAvailability();

    if (this.useBackend) {
      try {
        return await BackendPhotoService.getStats();
      } catch (error) {
        console.warn('⚠️ Stats backend indisponibles, calcul local');
      }
    }

    return await LocalPhotoService.getStats();
  }

  // Forcer la synchronisation
  async forcSync() {
    await this.checkBackendAvailability();
    if (this.backendAvailable) {
      return await this.syncLocalToBackend();
    }
    return false;
  }

  // État de la connexion
  getConnectionStatus() {
    return {
      backendAvailable: this.backendAvailable,
      useBackend: this.useBackend,
      mode: this.useBackend ? 'Hybride (Backend + Local)' : 'Local uniquement'
    };
  }

  // Vider le cache (après sauvegarde/suppression)
  clearCache() {
    this.photosCache = null;
    this.cacheTime = null;
    console.log('🗑️ Cache photos vidé');
  }

  // Déduplication basée sur l'ID et l'URI
  deduplicatePhotos(photos) {
    const seen = new Set();
    const unique = [];
    
    for (const photo of photos) {
      // Utiliser l'ID ou l'URI comme clé unique
      const key = photo.backendId || photo.id || photo.uri;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(photo);
      } else {
        console.log('🗑️ Photo dupliquée supprimée:', key);
      }
    }
    
    console.log(`✨ Déduplication: ${photos.length} → ${unique.length} photos`);
    return unique;
  }
}

export default new HybridPhotoService();
