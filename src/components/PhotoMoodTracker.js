import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

const MOODS = [
  { id: 'happy', icon: 'happy', color: colors.mood.happy, label: 'Heureux' },
  { id: 'excited', icon: 'flash', color: colors.mood.excited, label: 'Excité' },
  { id: 'peaceful', icon: 'leaf', color: colors.mood.peaceful, label: 'Paisible' },
  { id: 'adventurous', icon: 'trail-sign', color: colors.mood.adventurous, label: 'Aventureux' },
  { id: 'nostalgic', icon: 'heart', color: colors.mood.nostalgic, label: 'Nostalgique' },
];

export default function PhotoMoodTracker({ onMoodSelect, selectedMood }) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const handleMoodSelect = (mood) => {
    onMoodSelect(mood);
    setShowMoodPicker(false);
  };

  const getCurrentMoodData = () => {
    return MOODS.find(mood => mood.id === selectedMood) || null;
  };

  const currentMood = getCurrentMoodData();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.moodButton} 
        onPress={() => setShowMoodPicker(true)}
      >
        <Ionicons name="happy-outline" size={16} color="#666" />
        <Text style={styles.moodButtonText}>
          {currentMood ? `Humeur: ${currentMood.label}` : 'Ajouter une humeur'}
        </Text>
        {currentMood && (
          <Ionicons name={currentMood.icon} size={16} color={currentMood.color} />
        )}
      </TouchableOpacity>

      <Modal
        visible={showMoodPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMoodPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Comment vous sentez-vous ?</Text>
            
            <View style={styles.moodsGrid}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[styles.moodOption, { borderColor: mood.color }]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <Ionicons name={mood.icon} size={24} color={mood.color} />
                  <Text style={[styles.moodLabel, { color: mood.color }]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMoodPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  moodButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    flex: 1,
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  moodOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    margin: 5,
    width: '40%',
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
});