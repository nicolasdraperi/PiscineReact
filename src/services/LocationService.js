import * as Location from 'expo-location';

export class LocationService {
  static async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur permissions localisation:', error);
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permission de localisation refusée');
      }

      // Essayer d'abord avec une précision balancée (plus rapide)
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000, // Timeout de 5 secondes
          maximumAge: 60000, // Accepter une position d'il y a 1 minute max
        });
      } catch (fastError) {
        // Si ça échoue, essayer avec une précision plus faible
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          timeout: 3000,
          maximumAge: 300000, // 5 minutes
        });
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Erreur récupération localisation:', error);
      throw error;
    }
  }

  static async getLocationName(latitude, longitude) {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return `${address.city || address.district || address.subregion}, ${address.country}`;
      }
      return 'Lieu inconnu';
    } catch (error) {
      console.error('Erreur geocoding inverse:', error);
      return 'Lieu inconnu';
    }
  }
}