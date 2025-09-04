import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalendarPicker from 'react-native-calendar-picker';
import HybridPhotoService from '../services/HybridPhotoService';
import { LocationService } from '../services/LocationService';
import VoiceSearch from '../components/VoiceSearch';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3; // 3 colonnes avec marges

export default function PhotosScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, date, location
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [photos, selectedFilter, selectedDate, selectedLocation]);

  // Rafraîchir automatiquement quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
    }, [])
  );

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const allPhotos = await HybridPhotoService.getAllPhotos();
      setPhotos(allPhotos.reverse()); // Plus récentes en premier
      
      // Extraire les lieux uniques
      const uniqueLocations = [];
      const locationSet = new Set();
      
      for (const photo of allPhotos) {
        if (photo.location) {
          const locationKey = `${photo.location.latitude.toFixed(3)},${photo.location.longitude.toFixed(3)}`;
          if (!locationSet.has(locationKey)) {
            locationSet.add(locationKey);
            try {
              const locationName = await LocationService.getLocationName(
                photo.location.latitude,
                photo.location.longitude
              );
              uniqueLocations.push({
                key: locationKey,
                name: locationName,
                coords: photo.location,
                photoCount: allPhotos.filter(p => 
                  p.location && 
                  p.location.latitude.toFixed(3) === photo.location.latitude.toFixed(3) &&
                  p.location.longitude.toFixed(3) === photo.location.longitude.toFixed(3)
                ).length
              });
            } catch (error) {
              console.warn('Erreur récupération nom lieu:', error);
            }
          }
        }
      }
      
      setLocations(uniqueLocations);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les photos');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...photos];

    if (selectedFilter === 'date' && selectedDate) {
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.date).toDateString();
        const filterDate = selectedDate.toDateString();
        return photoDate === filterDate;
      });
    } else if (selectedFilter === 'location' && selectedLocation) {
      filtered = filtered.filter(photo => {
        if (!photo.location) return false;
        const photoLocationKey = `${photo.location.latitude.toFixed(3)},${photo.location.longitude.toFixed(3)}`;
        return photoLocationKey === selectedLocation.key;
      });
    }

    setFilteredPhotos(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter('all');
    setSelectedDate(null);
    setSelectedLocation(null);
    setShowDatePicker(false);
    setShowLocationFilter(false);
  };

  const onDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedFilter('date');
    setShowDatePicker(false);
  };

  const onLocationSelect = (location) => {
    setSelectedLocation(location);
    setSelectedFilter('location');
    setShowLocationFilter(false);
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

  const openPhotoDetail = (photo) => {
    navigation.navigate('PhotoDetail', { photo });
  };

  const handleVoiceSearch = (searchTerm) => {
    // Simulation de recherche vocale
    if (searchTerm.toLowerCase().includes('septembre')) {
      const septemberPhotos = photos.filter(photo => {
        const photoDate = new Date(photo.date);
        return photoDate.getMonth() === 8; // Septembre = index 8
      });
      setFilteredPhotos(septemberPhotos);
      setSelectedFilter('voice');
    } else if (searchTerm.toLowerCase().includes('géolocalisation')) {
      const geoPhotos = photos.filter(photo => photo.location);
      setFilteredPhotos(geoPhotos);
      setSelectedFilter('voice');
    } else {
      // Recherche par défaut : photos récentes
      setFilteredPhotos(photos.slice(0, 6));
      setSelectedFilter('voice');
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => openPhotoDetail(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoDate}>
          {new Date(item.date).toLocaleDateString('fr-FR')}
        </Text>
        {item.location && (
          <Ionicons name="location" size={16} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement des photos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête avec statistiques */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Mes Photos</Text>
            <Text style={styles.subtitle}>
              {filteredPhotos.length} photo{filteredPhotos.length > 1 ? 's' : ''} 
              {selectedFilter !== 'all' && ` (filtrée${filteredPhotos.length > 1 ? 's' : ''})`}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPhotos}>
            <Ionicons name="refresh" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={clearFilters}
          >
            <Ionicons name="apps" size={16} color={selectedFilter === 'all' ? 'white' : '#2196F3'} />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive
            ]}>
              Toutes ({photos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'date' && styles.filterButtonActive
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={16} color={selectedFilter === 'date' ? 'white' : '#2196F3'} />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'date' && styles.filterButtonTextActive
            ]}>
              {selectedDate ? selectedDate.toLocaleDateString('fr-FR') : 'Par date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'location' && styles.filterButtonActive
            ]}
            onPress={() => setShowLocationFilter(true)}
          >
            <Ionicons name="location" size={16} color={selectedFilter === 'location' ? 'white' : '#2196F3'} />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'location' && styles.filterButtonTextActive
            ]}>
              {selectedLocation ? selectedLocation.name : 'Par lieu'}
            </Text>
          </TouchableOpacity>

          <VoiceSearch onSearch={handleVoiceSearch} />

          {(selectedDate || selectedLocation) && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Ionicons name="close-circle" size={20} color="#ff5722" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Liste des photos */}
      {filteredPhotos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {selectedFilter === 'all' 
              ? 'Aucune photo disponible' 
              : 'Aucune photo pour ce filtre'
            }
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedFilter === 'all' 
              ? 'Prenez des photos avec la caméra !' 
              : 'Essayez un autre filtre'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.photosList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal sélecteur de date */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <CalendarPicker
              onDateChange={onDateSelect}
              selectedDayColor="#2196F3"
              selectedDayTextColor="#FFFFFF"
              todayBackgroundColor="#e3f2fd"
            />
          </View>
        </View>
      </Modal>

      {/* Modal sélecteur de lieu */}
      <Modal
        visible={showLocationFilter}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un lieu</Text>
              <TouchableOpacity onPress={() => setShowLocationFilter(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.locationsList}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.key}
                  style={styles.locationItem}
                  onPress={() => onLocationSelect(location)}
                >
                  <View style={styles.locationInfo}>
                    <Ionicons name="location" size={20} color="#2196F3" />
                    <Text style={styles.locationName}>{location.name}</Text>
                  </View>
                  <Text style={styles.photoCount}>
                    {location.photoCount} photo{location.photoCount > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
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
  },
  refreshButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  photosList: {
    padding: 15,
  },
  photoItem: {
    width: imageSize,
    height: imageSize,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  locationsList: {
    maxHeight: 300,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
});