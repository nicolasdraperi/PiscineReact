import ApiService from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tests spécifiques pour l'API de ton collègue
export const testBackendAPI = async () => {
  console.log('🧪 Test complet de l\'API backend...');
  
  const results = {
    connection: false,
    register: false,
    login: false,
    photos: false,
    userProfile: false,
    errors: []
  };

  try {
    // Test 1: Connexion de base
    console.log('1️⃣ Test de connexion...');
    try {
      await ApiService.get('/api/photos');
      results.connection = true;
      console.log('✅ Connexion OK');
    } catch (error) {
      results.errors.push('Connexion impossible: ' + error.message);
      console.log('❌ Connexion échouée');
    }

    // Test 2: Inscription
    console.log('2️⃣ Test inscription...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    };

    try {
      const registerResponse = await ApiService.post('/api/auth/register', testUser);
      if (registerResponse.message === "Utilisateur créé avec succès") {
        results.register = true;
        console.log('✅ Inscription OK');

        // Test 3: Connexion avec ce nouvel utilisateur
        console.log('3️⃣ Test connexion...');
        try {
          const loginResponse = await ApiService.post('/api/auth/login', {
            email: testUser.email,
            password: testUser.password
          });

          if (loginResponse.token) {
            results.login = true;
            console.log('✅ Connexion OK, token reçu');

            // Sauvegarder le token pour que l'intercepteur l'utilise automatiquement
            await AsyncStorage.setItem('userToken', loginResponse.token);

            // Test 4: Profil utilisateur
            console.log('4️⃣ Test profil utilisateur...');
            console.log('🔑 Token utilisé:', loginResponse.token.substring(0, 20) + '...');
            
            try {
              // Essayer plusieurs endpoints possibles
              let profileResponse;
              try {
                profileResponse = await ApiService.get('/api/users/me');
              } catch (firstError) {
                console.log('❌ /api/users/me échoué (401/400), essai autres endpoints...');
                try {
                  profileResponse = await ApiService.get('/api/user/me');
                } catch (secondError) {
                  console.log('❌ /api/user/me échoué, essai /api/auth/me...');
                  profileResponse = await ApiService.get('/api/auth/me');
                }
              }
              
              if (profileResponse && (profileResponse.user || profileResponse.name)) {
                results.userProfile = true;
                console.log('✅ Profil utilisateur OK');
                console.log('👤 Utilisateur:', profileResponse.user?.name || profileResponse.name);
              }
            } catch (error) {
              results.errors.push('Profil utilisateur: ' + error.message);
              console.log('❌ Tous les endpoints profil ont échoué');
              console.log('💡 Endpoints testés: /api/users/me, /api/user/me, /api/auth/me');
            }

            // Test 5: Liste des photos
            console.log('5️⃣ Test liste photos...');
            try {
              const photosResponse = await ApiService.get('/api/photos');
              results.photos = true;
              console.log('✅ Liste photos OK');
              console.log(`📸 ${photosResponse.length || 0} photos trouvées`);
            } catch (error) {
              results.errors.push('Liste photos: ' + error.message);
              console.log('❌ Liste photos échouée');
            }

          } else {
            results.errors.push('Connexion: Pas de token reçu');
          }
        } catch (error) {
          results.errors.push('Connexion: ' + error.message);
          console.log('❌ Connexion échouée');
        }
      } else {
        results.errors.push('Inscription: Réponse inattendue');
      }
    } catch (error) {
      // Si l'erreur est "Email déjà utilisé", c'est normal
      if (error.response?.data?.message === "Email déjà utilisé") {
        console.log('⚠️ Email déjà utilisé (normal pour un test)');
        results.register = true;
      } else {
        results.errors.push('Inscription: ' + error.message);
        console.log('❌ Inscription échouée');
      }
    }

  } catch (error) {
    results.errors.push('Erreur générale: ' + error.message);
    console.log('💥 Erreur générale:', error.message);
  }

  // Résumé
  console.log('\n📋 RÉSUMÉ DES TESTS:');
  console.log(`🔗 Connexion: ${results.connection ? '✅' : '❌'}`);
  console.log(`📝 Inscription: ${results.register ? '✅' : '❌'}`);
  console.log(`🔑 Login: ${results.login ? '✅' : '❌'}`);
  console.log(`👤 Profil: ${results.userProfile ? '✅' : '❌'}`);
  console.log(`📸 Photos: ${results.photos ? '✅' : '❌'}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERREURS:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  const allWorking = results.connection && results.register && results.login && results.userProfile && results.photos;
  console.log(`\n🎯 API Status: ${allWorking ? '✅ FONCTIONNELLE' : '⚠️ PROBLÈMES DÉTECTÉS'}`);

  return {
    success: allWorking,
    results,
    summary: {
      working: Object.values(results).filter(v => v === true).length - results.errors.length,
      total: 5,
      errors: results.errors.length
    }
  };
};

// Test rapide de ping
export const quickPing = async () => {
  try {
    console.log('🏓 Ping backend...');
    const start = Date.now();
    await ApiService.get('/api/photos');
    const duration = Date.now() - start;
    console.log(`✅ Pong! (${duration}ms)`);
    return { success: true, duration };
  } catch (error) {
    console.log('❌ Pas de réponse du backend');
    return { success: false, error: error.message };
  }
};
