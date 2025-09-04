import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';

const AUTH_TOKEN_KEY = 'memorize_auth_token';
const USER_DATA_KEY = 'memorize_user_data';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    this.isAuthenticated = false;
  }

  // Inscription
  async register(userData) {
    try {
      console.log('📝 Inscription utilisateur...', userData.email);
      
      // Essayer d'abord avec le backend
      try {
        const response = await ApiService.post('/api/auth/register', {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        });

        // L'API de ton collègue renvoie juste un message de succès
        if (response.message === "Utilisateur créé avec succès") {
          // Faire un login automatique après inscription
          const loginResult = await this.login(userData.email, userData.password);
          if (loginResult.success) {
            console.log('✅ Inscription + connexion backend réussie');
            return { success: true, user: loginResult.user, source: 'backend' };
          }
        }
      } catch (backendError) {
        console.warn('⚠️ Backend indisponible, inscription locale');
      }

      // Fallback : inscription locale
      const localUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
        isLocal: true,
        synced: false
      };

      const localToken = `local_${Date.now()}`;
      await this.setAuthData(localToken, localUser);
      
      console.log('✅ Inscription locale réussie');
      return { success: true, user: localUser, source: 'local' };

    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Connexion
  async login(email, password) {
    try {
      console.log('🔑 Connexion utilisateur...', email);

      // Essayer d'abord avec le backend
      try {
        const response = await ApiService.post('/api/auth/login', {
          email,
          password,
        });

        if (response.token) {
          // Sauvegarder le token AVANT de faire l'appel /api/users/me
          await AsyncStorage.setItem('userToken', response.token);
          
          // Récupérer les infos utilisateur avec le token
          const userResponse = await ApiService.get('/api/users/me');
          const user = userResponse.user;
          
          await this.setAuthData(response.token, user);
          console.log('✅ Connexion backend réussie');
          return { success: true, user, source: 'backend' };
        }
      } catch (backendError) {
        console.warn('⚠️ Backend indisponible, vérification locale');
      }

      // Fallback : vérification locale
      const localUserData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (localUserData) {
        const user = JSON.parse(localUserData);
        if (user.email === email) {
          // Pour la démo, on accepte n'importe quel mot de passe en local
          const localToken = `local_${Date.now()}`;
          await this.setAuthData(localToken, user);
          
          console.log('✅ Connexion locale réussie');
          return { success: true, user, source: 'local' };
        }
      }

      return { success: false, error: 'Utilisateur non trouvé' };

    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Déconnexion
  async logout() {
    try {
      console.log('👋 Déconnexion...');
      
      // Nettoyer les données locales (pas besoin de notifier le backend)
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, 'userToken']);
      
      this.currentUser = null;
      this.authToken = null;
      this.isAuthenticated = false;

      console.log('✅ Déconnexion réussie');
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier si l'utilisateur est connecté
  async checkAuthStatus() {
    try {
      // Vérifier les deux emplacements possibles du token
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (token && userData) {
        this.authToken = token;
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;

        console.log('✅ Utilisateur connecté:', this.currentUser.email || this.currentUser.name);
        return { isAuthenticated: true, user: this.currentUser };
      }

      console.log('❌ Aucun utilisateur connecté');
      return { isAuthenticated: false, user: null };

    } catch (error) {
      console.error('❌ Erreur vérification auth:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  // Sauvegarder les données d'authentification
  async setAuthData(token, user) {
    this.authToken = token;
    this.currentUser = user;
    this.isAuthenticated = true;

    // Sauvegarder dans les deux emplacements pour compatibilité
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

    console.log('💾 Données auth sauvegardées pour:', user.email || user.name);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser;
  }

  // Obtenir le token
  getAuthToken() {
    return this.authToken;
  }

  // Vérifier si connecté
  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(updates) {
    try {
      console.log('📝 Mise à jour profil...');

      // Mise à jour locale uniquement (pas d'endpoint backend pour l'instant)
      this.currentUser = { ...this.currentUser, ...updates, synced: false };

      // Sauvegarder localement
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(this.currentUser));
      
      console.log('✅ Profil mis à jour (local)');
      return { success: true, user: this.currentUser };

    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      return { success: false, error: error.message };
    }
  }

  // Synchroniser l'utilisateur local avec le backend (désactivé - endpoint inexistant)
  async syncUserToBackend() {
    if (!this.currentUser || !this.currentUser.isLocal) return;

    // Pas de synchronisation automatique pour l'instant
    // L'endpoint /api/auth/sync-local-user n'existe pas dans le backend
    console.log('⚠️ Synchronisation utilisateur désactivée (endpoint manquant)');
    return false;
  }
}

export default new AuthService();
