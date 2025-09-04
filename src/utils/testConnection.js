import ApiService from '../services/ApiService';

// Fonction de test de connexion au backend
export const testBackendConnection = async () => {
  console.log('🔍 Test de connexion au backend...');
  
  try {
    // Test simple de ping
    const result = await ApiService.testConnection();
    
    if (result.success) {
      console.log('✅ Connexion au backend réussie !');
      console.log('📡 Données reçues:', result.data);
      return { success: true, message: 'Backend connecté' };
    } else {
      console.log('❌ Connexion au backend échouée');
      console.log('🔧 Erreur:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log('💥 Erreur inattendue:', error);
    return { success: false, error };
  }
};

// Test d'endpoints spécifiques
export const testPhotoEndpoints = async () => {
  console.log('🔍 Test des endpoints photos...');
  
  const tests = [
    { name: 'GET /api/photos', endpoint: '/api/photos' },
    { name: 'GET /health', endpoint: '/health' },
    { name: 'GET /api/photos/stats', endpoint: '/api/photos/stats' },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const data = await ApiService.get(test.endpoint);
      results.push({
        test: test.name,
        success: true,
        data
      });
      console.log(`✅ ${test.name} - OK`);
    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        error: error.message
      });
      console.log(`❌ ${test.name} - Erreur:`, error.message);
    }
  }

  return results;
};
