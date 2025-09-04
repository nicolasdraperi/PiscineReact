import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TravelTimeline({ photos, onPhotoPress }) {
  const createTimeline = () => {
    const timeline = [];
    const photosByMonth = {};
    
    photos.forEach(photo => {
      const date = new Date(photo.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!photosByMonth[monthKey]) {
        photosByMonth[monthKey] = {
          month: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          photos: [],
        };
      }
      photosByMonth[monthKey].photos.push(photo);
    });
    
    return Object.values(photosByMonth).reverse();
  };

  const timelineData = createTimeline();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ Timeline de vos voyages</Text>
      
      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {timelineData.map((period, index) => (
          <View key={index} style={styles.timelinePeriod}>
            <View style={styles.timelineHeader}>
              <View style={styles.timelineDot} />
              <Text style={styles.periodTitle}>{period.month}</Text>
              <Text style={styles.photoCount}>
                {period.photos.length} photo{period.photos.length > 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.timelineContent}>
              {period.photos.slice(0, 3).map((photo, photoIndex) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.timelineItem}
                  onPress={() => onPhotoPress(photo)}
                >
                  <Ionicons name="camera" size={16} color="#2196F3" />
                  <Text style={styles.photoDate}>
                    {new Date(photo.date).toLocaleDateString('fr-FR')}
                  </Text>
                  {photo.location && (
                    <Ionicons name="location" size={12} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
              {period.photos.length > 3 && (
                <Text style={styles.morePhotos}>
                  +{period.photos.length - 3} autres photos
                </Text>
              )}
            </View>
            
            {index < timelineData.length - 1 && <View style={styles.timelineLine} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeline: {
    maxHeight: 300,
  },
  timelinePeriod: {
    position: 'relative',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginRight: 10,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textTransform: 'capitalize',
  },
  photoCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timelineContent: {
    marginLeft: 22,
    marginBottom: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  photoDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  morePhotos: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 30,
    bottom: -15,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
});