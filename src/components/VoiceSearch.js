import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceSearch({ onSearch }) {
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    setIsListening(true);
    
    // Simulation de recherche vocale
    setTimeout(() => {
      const searches = [
        'photos de septembre',
        'photos avec géolocalisation', 
        'mes dernières photos',
        'photos de voyage'
      ];
      const randomSearch = searches[Math.floor(Math.random() * searches.length)];
      
      Alert.alert(
        '🎤 Recherche vocale',
        `Recherche simulée: "${randomSearch}"`,
        [
          { text: 'Annuler' },
          { text: 'Rechercher', onPress: () => onSearch(randomSearch) }
        ]
      );
      setIsListening(false);
    }, 2000);
  };

  return (
    <TouchableOpacity 
      style={[styles.voiceButton, isListening && styles.listening]} 
      onPress={startVoiceSearch}
      disabled={isListening}
    >
      <Ionicons 
        name={isListening ? "mic" : "mic-outline"} 
        size={20} 
        color={isListening ? "#FF5722" : "#2196F3"} 
      />
      <Text style={[styles.voiceText, isListening && styles.listeningText]}>
        {isListening ? 'Écoute...' : 'Recherche vocale'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginLeft: 10,
  },
  listening: {
    backgroundColor: '#ffebee',
    borderColor: '#FF5722',
  },
  voiceText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listeningText: {
    color: '#FF5722',
  },
});