import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { Ionicons } from '@expo/vector-icons';
import HybridPhotoService from '../services/HybridPhotoService';
import TravelTimeline from '../components/TravelTimeline';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [photosForDate, setPhotosForDate] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [datesWithPhotos, setDatesWithPhotos] = useState(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadPhotosForDate(selectedDate);
    }
  }, [selectedDate]);

  // Rafraîchir automatiquement quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
    }, [])
  );

  const loadPhotos = async () => {
    try {
      const photos = await HybridPhotoService.getAllPhotos();
      setAllPhotos(photos);
      
      // Créer un Set des dates qui ont des photos
      const photosDates = new Set();
      photos.forEach(photo => {
        const photoDate = new Date(photo.date);
        const dateString = photoDate.toDateString();
        photosDates.add(dateString);
      });
      setDatesWithPhotos(photosDates);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les photos');
    }
  };

  const loadPhotosForDate = async (date) => {
    try {
      const photos = await HybridPhotoService.getPhotosByDate(date);
      setPhotosForDate(photos);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les photos pour cette date');
    }
  };

  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  const formatSelectedDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPhotoTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const customDatesStyles = () => {
    const styles = [];
    datesWithPhotos.forEach(dateString => {
      const date = new Date(dateString);
      styles.push({
        date: date,
        style: { 
          backgroundColor: colors.secondary,
          borderRadius: 15,
        },
        textStyle: { 
          color: 'white', 
          fontWeight: 'bold',
          fontSize: 16,
        },
      });
    });
    return styles;
  };

  const openPhotoDetail = (photo) => {
    navigation.navigate('PhotoDetail', { photo });
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const getStatsForMonth = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const photosThisMonth = allPhotos.filter(photo => {
      const photoDate = new Date(photo.date);
      return photoDate >= monthStart && photoDate <= monthEnd;
    });

    const daysWithPhotos = new Set();
    photosThisMonth.forEach(photo => {
      const photoDate = new Date(photo.date);
      daysWithPhotos.add(photoDate.getDate());
    });

    return {
      totalPhotos: photosThisMonth.length,
      daysWithPhotos: daysWithPhotos.size,
    };
  };

  const monthStats = getStatsForMonth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête avec statistiques */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Calendrier des Photos</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPhotos}>
            <Ionicons name="refresh" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{monthStats.totalPhotos}</Text>
            <Text style={styles.statLabel}>photos ce mois</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{monthStats.daysWithPhotos}</Text>
            <Text style={styles.statLabel}>jours avec photos</Text>
          </View>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Ionicons name="today" size={16} color="#2196F3" />
            <Text style={styles.todayButtonText}>Aujourd'hui</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {/* Calendrier */}
      <View style={styles.calendarContainer}>
        <CalendarPicker
          onDateChange={onDateChange}
          selectedDayColor={colors.primary}
          selectedDayTextColor="#FFFFFF"
          todayBackgroundColor={colors.primaryLight}
          todayTextStyle={{ color: colors.primary, fontWeight: 'bold' }}
          customDatesStyles={customDatesStyles()}
          textStyle={{
            fontSize: 16,
            color: '#333',
          }}
          monthTitleStyle={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 10,
          }}
          yearTitleStyle={{
            fontSize: 16,
            color: '#666',
          }}
          previousTitle="←"
          nextTitle="→"
          previousTitleStyle={{
            fontSize: 20,
            color: colors.primary,
          }}
          nextTitleStyle={{
            fontSize: 20,
            color: colors.primary,
          }}
          dayLabelsWrapper={{
            borderTopWidth: 0,
            borderBottomWidth: 0,
          }}
          onMonthChange={(date) => setCurrentMonth(date)}
        />
        
        {/* Légende */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
            <Text style={styles.legendText}>Jours avec photos</Text>
          </View>
        </View>
      </View>
  
      {/* Photos pour la date sélectionnée */}
      <View style={styles.photosSection}>
        {selectedDate ? (
          <>
            <Text style={styles.selectedDateTitle}>
              {formatSelectedDate(selectedDate)}
            </Text>
            {photosForDate.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.photosScrollView}
              >
                {photosForDate.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.photoItem}
                    onPress={() => openPhotoDetail(photo)}
                  >
                    <Image 
                      source={{ uri: photo.uri }} 
                      style={styles.photoThumbnail} 
                    />
                    <Text style={styles.photoTime}>
                      {formatPhotoTime(photo.date)}
                    </Text>
                    {photo.location && (
                      <View style={styles.locationBadge}>
                        <Ionicons name="location" size={12} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noPhotosContainer}>
                <Ionicons name="camera-outline" size={48} color="#ccc" />
                <Text style={styles.noPhotosText}>
                  Aucune photo pour cette date
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.selectDateContainer}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.selectDateText}>
              Sélectionnez une date pour voir vos photos
            </Text>
          </View>
        )}
      </View>

      {/* Mini Timeline - Vue d'ensemble */}
      {allPhotos.length > 0 && (
        <View style={{ maxHeight: 250, overflow: 'hidden' }}>
          <TravelTimeline 
            photos={allPhotos.slice(0, 10)} 
            onPhotoPress={openPhotoDetail}
          />
        </View>
      )}
    </ScrollView>
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
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  todayButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legend: {
    marginTop: 15,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  photosSection: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 200,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  photosScrollView: {
    flexDirection: 'row',
  },
  photoItem: {
    marginRight: 15,
    alignItems: 'center',
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  photoTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  locationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    justifyContent: 'center',
    flex: 1,
  },
  noPhotosText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  selectDateContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    justifyContent: 'center',
    flex: 1,
  },
  selectDateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});