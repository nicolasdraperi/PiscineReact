# 📸 Memorize - Journal de Voyage Interactif

Une application mobile React Native Expo pour créer un journal de voyage avec photos géolocalisées.

## 🌟 Fonctionnalités

### 📱 Core Features
- **📸 Prise de photos** avec géolocalisation automatique
- **🗺️ Carte interactive** des photos avec localisation
- **📅 Calendrier** avec marquage des jours avec photos
- **🖼️ Galerie photos** avec filtres par date et lieu
- **👤 Profil utilisateur** avec statistiques personnalisées

### 🔐 Authentification
- **Connexion/Inscription** avec backend sécurisé
- **Mode hybride** : Backend + stockage local de fallback
- **Isolation des données** par utilisateur
- **Synchronisation automatique** des photos

### ✨ Fonctionnalités Uniques
- **🌤️ Widget météo** contextuel pour chaque photo
- **😊 Tracker d'humeur** pour associer des émotions aux photos
- **🎵 Timeline de voyage** chronologique interactive
- **🎤 Recherche vocale** dans la galerie
- **📊 Statistiques avancées** (jours actifs, lieux visités, etc.)

## 🎨 Design

- **Thème rouge moderne** cohérent
- **Interface intuitive** avec navigation par onglets
- **Composants personnalisés** pour une expérience unique
- **Responsive design** optimisé mobile

## 🛠️ Technologies

### Frontend (Cette branche)
- **React Native** avec Expo
- **React Navigation** (Tabs + Stack)
- **Expo Camera** pour la prise de photos
- **Expo Location** pour la géolocalisation
- **AsyncStorage** pour le stockage local
- **Axios** pour les appels API

### Backend (Branche séparée)
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **API REST** complète

## 📦 Installation

### Prérequis
- Node.js (v16+)
- Expo CLI
- Un émulateur Android/iOS ou l'app Expo Go

### Installation Backend
```bash
# Cloner le projet
git clone https://github.com/nicolasdraperi/PiscineReact.git
cd PiscineReact

# Basculer sur la branche Nicolas (Backend)
git checkout Nicolas
cd Backend

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

### Installation Frontend
```bash
# Cloner le projet
git clone https://github.com/nicolasdraperi/PiscineReact.git
cd PiscineReact

# Basculer sur la branche Hugo (Frontend)
git checkout Hugo

# Installer les dépendances
npm install

# Configurer l'IP du backend
# Éditer src/utils/config.js avec l'IP de votre machine

# Lancer l'application
npm start
```

### Configuration Backend
1. Lancer le backend sur le port 5000
2. Modifier `src/utils/config.js` avec votre IP locale
3. Le backend doit avoir le dossier `uploads/` créé

## 🚀 Utilisation

1. **Lancer l'app** avec `npm start`
2. **Scanner le QR code** avec Expo Go
3. **Créer un compte** ou se connecter
4. **Prendre des photos** avec géolocalisation
5. **Explorer** la carte, le calendrier et la galerie
6. **Consulter** les statistiques dans le profil

## 📁 Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── AppHeader.js
│   ├── PhotoMoodTracker.js
│   ├── TravelTimeline.js
│   ├── VoiceSearch.js
│   └── WeatherWidget.js
├── contexts/            # Contextes React
│   └── AuthContext.js
├── screens/             # Écrans principaux
│   ├── AuthScreen.js
│   ├── CameraScreen.js
│   ├── MapScreen.js
│   ├── CalendarScreen.js
│   ├── PhotosScreen.js
│   ├── ProfileScreen.js
│   └── PhotoDetailScreen.js
├── services/            # Services métier
│   ├── AuthService.js
│   ├── PhotoService.js
│   ├── BackendPhotoService.js
│   ├── HybridPhotoService.js
│   └── LocationService.js
└── utils/               # Utilitaires
    ├── config.js
    ├── theme.js
    ├── testBackendAPI.js
    └── testConnection.js
```

## 🔧 Configuration

### API Configuration
Éditer `src/utils/config.js` :
```javascript
export const Config = {
  API: {
    BASE_URL: 'http://VOTRE_IP:5000',
    TIMEOUT: 10000,
  },
  // ...
};
```

### Thème
Le thème est centralisé dans `src/utils/theme.js` avec une palette rouge moderne cohérente.

## 🐛 Débogage

### Tests Backend
- Bouton "Tester l'API Backend" dans le profil
- Logs détaillés dans la console
- Vérification automatique de la connectivité

### Modes de Fonctionnement
- **Mode Hybride** : Backend + Local (recommandé)
- **Mode Local** : Fallback automatique si backend indisponible

## 👥 Équipe

- **Frontend** : Hugo (cette branche)
- **Frontend** : Nail (branche séparée) 
- **Backend** : Nicolas (branche séparée)

## 📄 Licence

Projet étudiant - École Piscine React Native

---

## 🎯 Fonctionnalités Techniques Avancées

### 💾 Gestion des Données
- **Cache intelligent** pour éviter les appels API redondants
- **Déduplication automatique** des photos
- **Synchronisation hybride** backend/local
- **Protection contre les clics multiples**

### 🔒 Sécurité
- **Isolation des données** par utilisateur
- **Tokens JWT** sécurisés
- **Validation des formulaires**
- **Gestion des erreurs** robuste

### ⚡ Performance
- **Optimisation caméra** (qualité réduite, skipProcessing)
- **Géolocalisation en arrière-plan**
- **Cache photos** avec invalidation intelligente
- **Refresh automatique** des écrans

---

*Application développée dans le cadre de la Piscine React Native 2025*
