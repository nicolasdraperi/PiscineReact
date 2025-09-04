import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import HybridPhotoService from '../services/HybridPhotoService';
import TravelTimeline from '../components/TravelTimeline';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/theme';
import { useAuth } from '../contexts/AuthContext';
import { testBackendAPI, quickPing } from '../utils/testBackendAPI';

const { width } = Dimensions.get('window');

const USER_DATA_KEY = 'user_profile';

export default function ProfileScreen({ navigation }) {
  const { user: authUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    bio: '',
    joinDate: new Date().toISOString(),
  });
  const [stats, setStats] = useState({
    totalPhotos: 0,
    daysWithPhotos: 0,
    uniqueLocations: 0,
    firstPhoto: null,
    lastPhoto: null,
  });
  const [allPhotos, setAllPhotos] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    loadUserProfile();
    loadStats();
    loadAllPhotos();
  }, []);

  // Rafraîchir automatiquement quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
      loadAllPhotos();
      checkConnectionStatus();
    }, [])
  );

  const loadAllPhotos = async () => {
    try {
      const photos = await HybridPhotoService.getAllPhotos();
      setAllPhotos(photos);
    } catch (error) {
      console.error('Erreur chargement photos:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(USER_DATA_KEY);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const photoStats = await HybridPhotoService.getStats();
      setStats(photoStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const refreshAll = async () => {
    await loadStats();
    await loadAllPhotos();
    await checkConnectionStatus();
  };

  const checkConnectionStatus = async () => {
    try {
      await HybridPhotoService.checkBackendAvailability();
      const status = HybridPhotoService.getConnectionStatus();
      setConnectionStatus(status);
    } catch (error) {
      console.error('Erreur vérification connexion:', error);
    }
  };

  const runBackendTests = async () => {
    Alert.alert(
      'Test Backend',
      'Lancer les tests de l\'API backend ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tester',
          onPress: async () => {
            try {
              console.log('🚀 Lancement des tests backend...');
              const results = await testBackendAPI();
              
              Alert.alert(
                results.success ? 'Tests Réussis ✅' : 'Tests Échoués ❌',
                `${results.summary.working}/${results.summary.total} tests passés\n${results.summary.errors} erreurs`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de lancer les tests');
            }
          }
        }
      ]
    );
  };

  const saveUserProfile = async (profile) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profile));
      setUserProfile(profile);
      setShowEditModal(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    }
  };

  const openEditModal = () => {
    setEditingProfile({ ...userProfile });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysSinceJoin = () => {
    const joinDate = new Date(userProfile.joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPhotosPerDay = () => {
    const days = getDaysSinceJoin();
    return days > 0 ? (stats.totalPhotos / days).toFixed(1) : '0.0';
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setUserProfile({
                name: '',
                email: '',
                bio: '',
                joinDate: new Date().toISOString(),
              });
              loadStats();
              Alert.alert('Succès', 'Toutes les données ont été supprimées');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer les données');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#2196F3" />
        </View>
        
        <Text style={styles.name}>
          {authUser?.name || userProfile.name || 'Nom non défini'}
        </Text>
        
        {(authUser?.email || userProfile.email) && (
          <Text style={styles.email}>{authUser?.email || userProfile.email}</Text>
        )}
        
        {userProfile.bio && (
          <Text style={styles.bio}>{userProfile.bio}</Text>
        )}
        
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.refreshButton} onPress={refreshAll}>
            <Ionicons name="refresh" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques principales */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>📊 Statistiques</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="camera" size={30} color="#2196F3" />
            <Text style={styles.statNumber}>{stats.totalPhotos}</Text>
            <Text style={styles.statLabel}>Photos prises</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={30} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.daysWithPhotos}</Text>
            <Text style={styles.statLabel}>Jours actifs</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="location" size={30} color="#FF9800" />
            <Text style={styles.statNumber}>{stats.uniqueLocations}</Text>
            <Text style={styles.statLabel}>Lieux visités</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={30} color="#9C27B0" />
            <Text style={styles.statNumber}>{getPhotosPerDay()}</Text>
            <Text style={styles.statLabel}>Photos/jour</Text>
          </View>
        </View>
      </View>

      {/* Timeline des voyages - UNIQUE ! */}
      <TravelTimeline 
        photos={allPhotos} 
        onPhotoPress={(photo) => navigation.navigate('PhotoDetail', { photo })}
      />

      {/* Informations détaillées */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Membre depuis</Text>
            <Text style={styles.infoValue}>
              {formatJoinDate(userProfile.joinDate)} ({getDaysSinceJoin()} jours)
            </Text>
          </View>
        </View>
        
        {stats.firstPhoto && (
          <View style={styles.infoItem}>
            <Ionicons name="camera-outline" size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Première photo</Text>
              <Text style={styles.infoValue}>{formatDate(stats.firstPhoto)}</Text>
            </View>
          </View>
        )}
        
        {stats.lastPhoto && (
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Dernière photo</Text>
              <Text style={styles.infoValue}>{formatDate(stats.lastPhoto)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>⚙️ Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={loadStats}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Actualiser les statistiques</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={runBackendTests}>
          <Ionicons name="flask" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Tester l'API Backend</Text>
        </TouchableOpacity>

        {/* Statut de connexion backend */}
        {connectionStatus && (
          <View style={styles.connectionStatus}>
            <Ionicons 
              name={connectionStatus.backendAvailable ? "cloud-done" : "cloud-offline"} 
              size={20} 
              color={connectionStatus.backendAvailable ? colors.success : colors.warning} 
            />
            <Text style={[
              styles.connectionText,
              { color: connectionStatus.backendAvailable ? colors.success : colors.warning }
            ]}>
              {connectionStatus.mode}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={clearAllData}
        >
          <Ionicons name="trash" size={20} color="#ff5722" />
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            Supprimer toutes les données
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal d'édition */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.name}
                  onChangeText={(text) => setEditingProfile({...editingProfile, name: text})}
                  placeholder="Votre nom"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.email}
                  onChangeText={(text) => setEditingProfile({...editingProfile, email: text})}
                  placeholder="votre.email@exemple.com"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editingProfile.bio}
                  onChangeText={(text) => setEditingProfile({...editingProfile, bio: text})}
                  placeholder="Décrivez-vous en quelques mots..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveUserProfile(editingProfile)}
              >
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  refreshButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    padding: 10,
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 70) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionsContainer: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: '#ffebee',
  },
  dangerButtonText: {
    color: '#ff5722',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
    maxHeight: 300,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});