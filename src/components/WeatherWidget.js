import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeatherIcon = (condition) => {
    // Simulation d'icônes météo basée sur l'heure
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return 'sunny';
    } else {
      return 'moon';
    }
  };

  const generateWeather = () => {
    // Simulation de données météo réalistes
    const conditions = ['Ensoleillé', 'Nuageux', 'Partiellement nuageux', 'Clair'];
    const temperatures = [15, 18, 22, 25, 28, 20, 16];
    
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: temperatures[Math.floor(Math.random() * temperatures.length)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    };
  };

  useEffect(() => {
    if (location) {
      setLoading(true);
      // Simuler un délai d'API
      setTimeout(() => {
        setWeather(generateWeather());
        setLoading(false);
      }, 1000);
    }
  }, [location]);

  if (!location) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="partly-sunny" size={20} color="#FF9800" />
        <Text style={styles.title}>Météo du lieu</Text>
      </View>
      
      {loading ? (
        <Text style={styles.loading}>Chargement...</Text>
      ) : weather ? (
        <View style={styles.weatherInfo}>
          <View style={styles.mainWeather}>
            <Ionicons name={getWeatherIcon()} size={24} color="#FF9800" />
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
          </View>
          <Text style={styles.condition}>{weather.condition}</Text>
          <Text style={styles.humidity}>Humidité: {weather.humidity}%</Text>
        </View>
      ) : (
        <Text style={styles.error}>Données indisponibles</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 5,
  },
  loading: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  weatherInfo: {
    alignItems: 'center',
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  temperature: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 8,
  },
  condition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  humidity: {
    fontSize: 10,
    color: '#999',
  },
  error: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});