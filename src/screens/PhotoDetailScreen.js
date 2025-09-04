import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhotoService } from '../services/PhotoService';
import { LocationService } from '../services/LocationService';
import WeatherWidget from '../components/WeatherWidget';
import PhotoMoodTracker from '../components/PhotoMoodTracker';

const { width, height } = Dimensions.get('window');

export default function PhotoDetailScreen({ route, navigation }) {
  const { photo } = route.params;
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (photo.location) {
      getLocationName();
    }
  }, []);

  const getLocationName = async () => {
    try {
      const name = await LocationService.getLocationName(
        photo.location.latitude,
        photo.location.longitude
      );
      setLocationName(name);
    } catch (error) {
      console.warn('Erreur récupération nom lieu:', error);
      setLocationName('Lieu inconnu');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openInMaps = () => {
    if (photo.location) {
      const { latitude, longitude } = photo.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const sharePhoto = async () => {
    try {
      const shareOptions = {
        title: 'Ma photo de voyage',
        message: `Photo prise le ${formatDate(photo.date)}${locationName ? ` à ${locationName}` : ''}`,
        url: photo.uri,
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la photo');
    }
  };

  const deletePhoto = () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await PhotoService.deletePhoto(photo.id);
              Alert.alert('Succès', 'Photo supprimée avec succès', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la photo');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image principale */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo.uri }} style={styles.image} />
        
        {/* Actions overlay */}
        <View style={styles.actionsOverlay}>
          <TouchableOpacity style={styles.actionButton} onPress={sharePhoto}>
            <Ionicons name="share" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={deletePhoto}
            disabled={isLoading}
          >
            <Ionicons name="trash" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Informations de la photo */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>📷 Informations</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color="#2196F3" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Date et heure</Text>
            <Text style={styles.infoValue}>{formatDate(photo.date)}</Text>
          </View>
        </View>

        {photo.location && (
          <>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#4CAF50" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Lieu</Text>
                <Text style={styles.infoValue}>
                  {locationName || 'Chargement...'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="navigate" size={20} color="#FF9800" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Coordonnées GPS</Text>
                <Text style={styles.infoValue}>
                  {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                </Text>
                {photo.location.accuracy && (
                  <Text style={styles.accuracyText}>
                    Précision: ±{Math.round(photo.location.accuracy)}m
                  </Text>
                )}
              </View>
            </View>
          </>
        )}

        <View style={styles.infoItem}>
          <Ionicons name="fingerprint" size={20} color="#9C27B0" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>ID de la photo</Text>
            <Text style={styles.infoValue}>{photo.id}</Text>
          </View>
        </View>
      </View>

      {/* Widget météo et humeur - FONCTIONNALITÉS UNIQUES ! */}
      {photo.location && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>🌤️ Contexte du moment</Text>
          <WeatherWidget location={photo.location} />
          <PhotoMoodTracker 
            selectedMood={photo.mood} 
            onMoodSelect={(mood) => {
              Alert.alert('Super !', `Humeur "${mood}" ajoutée à cette photo !`);
            }} 
          />
        </View>
      )}

      {/* Actions */}
      {photo.location && (
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>🎯 Actions</Text>
          
          <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
            <Ionicons name="map" size={20} color="white" />
            <Text style={styles.mapButtonText}>Voir sur Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Métadonnées techniques */}
      <View style={styles.metadataContainer}>
        <Text style={styles.sectionTitle}>🔧 Métadonnées</Text>
        
        <View style={styles.metadataGrid}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Timestamp</Text>
            <Text style={styles.metadataValue}>{photo.timestamp || 'N/A'}</Text>
          </View>
          
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Format</Text>
            <Text style={styles.metadataValue}>JPEG</Text>
          </View>
          
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Source</Text>
            <Text style={styles.metadataValue}>Caméra</Text>
          </View>
          
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Géolocalisation</Text>
            <Text style={styles.metadataValue}>
              {photo.location ? 'Oui' : 'Non'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  actionsOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
  },
  infoContainer: {
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  accuracyText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  metadataContainer: {
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
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metadataItem: {
    width: (width - 70) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});