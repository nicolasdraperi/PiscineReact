import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HybridPhotoService from '../services/HybridPhotoService';
import { LocationService } from '../services/LocationService';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadPhotos();
    getCurrentLocation();
  }, []);

  // Rafraîchir automatiquement quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
    }, [])
  );

  const getCurrentLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.warn('Impossible de récupérer la position actuelle');
    }
  };

  const loadPhotos = async () => {
    try {
      const allPhotos = await HybridPhotoService.getAllPhotos();
      // Filtrer seulement les photos avec géolocalisation
      const photosWithLocation = allPhotos.filter(photo => 
        photo.location && 
        photo.location.latitude && 
        photo.location.longitude
      );
      setPhotos(photosWithLocation);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les photos');
    }
  };

  const onPhotoPress = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const closeModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  const viewPhotoDetails = () => {
    setShowPhotoModal(false);
    navigation.navigate('PhotoDetail', { photo: selectedPhoto });
  };

  const openInMaps = (photo) => {
    const { latitude, longitude } = photo.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLocationName = async (latitude, longitude) => {
    try {
      return await LocationService.getLocationName(latitude, longitude);
    } catch (error) {
      return 'Lieu inconnu';
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec informations */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Carte des Photos</Text>
            <Text style={styles.subtitle}>
              📸 {photos.length} photo{photos.length > 1 ? 's' : ''} avec géolocalisation
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPhotos}>
            <Ionicons name="refresh" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
        {userLocation && (
          <Text style={styles.userLocationText}>
            📍 Position actuelle: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Liste des photos avec localisation */}
      <ScrollView style={styles.photosList} showsVerticalScrollIndicator={false}>
        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucune photo avec géolocalisation</Text>
            <Text style={styles.emptySubtext}>
              Prenez des photos avec la caméra pour les voir apparaître ici
            </Text>
          </View>
        ) : (
          photos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoCard}
              onPress={() => onPhotoPress(photo)}
            >
              <Image source={{ uri: photo.uri }} style={styles.cardImage} />
              
              <View style={styles.cardContent}>
                <Text style={styles.cardDate}>
                  📅 {formatDate(photo.date)}
                </Text>
                
                <Text style={styles.cardLocation}>
                  📍 {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                </Text>
                
                <TouchableOpacity
                  style={styles.mapsButton}
                  onPress={() => openInMaps(photo)}
                >
                  <Ionicons name="map" size={16} color="#2196F3" />
                  <Text style={styles.mapsButtonText}>Ouvrir dans Maps</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal pour afficher la photo */}
      <Modal
        visible={showPhotoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedPhoto && (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>

                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={styles.modalImage}
                />

                <View style={styles.photoInfo}>
                  <Text style={styles.photoDate}>
                    📅 {formatDate(selectedPhoto.date)}
                  </Text>
                  
                  <Text style={styles.photoLocation}>
                    📍 {selectedPhoto.location.latitude.toFixed(6)}, {selectedPhoto.location.longitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => openInMaps(selectedPhoto)}
                  >
                    <Ionicons name="map" size={20} color="white" />
                    <Text style={styles.modalButtonText}>Voir sur la carte</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.detailButton]}
                    onPress={viewPhotoDetails}
                  >
                    <Ionicons name="information-circle" size={20} color="white" />
                    <Text style={styles.modalButtonText}>Détails</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  refreshButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  userLocationText: {
    fontSize: 14,
    color: '#2196F3',
  },
  photosList: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  mapsButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  modalImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 10,
    resizeMode: 'cover',
    marginTop: 20,
  },
  photoInfo: {
    marginTop: 15,
    alignItems: 'center',
  },
  photoDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  photoLocation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  detailButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});