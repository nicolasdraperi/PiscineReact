import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import HybridPhotoService from '../services/HybridPhotoService';
import { LocationService } from '../services/LocationService';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState('back');
  const [photo, setPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    await requestPermission();
    await requestMediaPermission();
  };

  if (!permission) {
    return <View style={styles.container}><Text>Demande de permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nous avons besoin de votre permission pour utiliser la caméra
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isLoading) {
      try {
        console.log('📸 Prise de photo initiée...');
        setIsLoading(true);
        
        // Prendre la photo avec qualité optimisée
        const photoResult = await cameraRef.current.takePictureAsync({
          quality: 0.6, // Réduit pour plus de rapidité
          base64: false,
          skipProcessing: true, // Accélère la prise
        });

        console.log('✅ Photo prise:', photoResult.uri);

        // Préparer les données de base immédiatement
        const photoData = {
          uri: photoResult.uri,
          location: null, // On récupère la localisation en arrière-plan
        };

        setPhoto(photoData);
        setShowPreview(true);
        setIsLoading(false);

        // Récupérer la localisation en arrière-plan (non bloquant)
        LocationService.getCurrentLocation()
          .then(location => {
            setPhoto(prev => ({ ...prev, location }));
          })
          .catch(locationError => {
            console.warn('Localisation indisponible:', locationError);
          });
          
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de prendre la photo');
        console.error(error);
        setIsLoading(false);
      }
    }
  };

  const savePhoto = async () => {
    if (isLoading) {
      console.log('⚠️ Sauvegarde déjà en cours, ignorée');
      return;
    }

    try {
      console.log('💾 Sauvegarde photo initiée:', photo?.uri);
      setIsLoading(true);

      // Sauvegarder dans la galerie en arrière-plan
      if (mediaPermission?.granted) {
        MediaLibrary.saveToLibraryAsync(photo.uri).catch(console.warn);
      }

      // Sauvegarder dans notre service
      await HybridPhotoService.savePhoto(photo);
      console.log('✅ Photo sauvegardée dans HybridPhotoService');

      // Fermer la préview immédiatement
      setShowPreview(false);
      setPhoto(null);
      setIsLoading(false);

      // Notification discrète
      Alert.alert('✅', 'Photo sauvegardée !');

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
      console.error('❌ Erreur sauvegarde:', error);
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setShowPreview(false);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isLoading}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <View style={styles.placeholder} />
        </View>
      </CameraView>

      {/* Modal de prévisualisation */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.previewContainer}>
          {photo && (
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />
          )}
          
          <View style={styles.previewButtons}>
            <TouchableOpacity
              style={[styles.previewButton, styles.retakeButton]}
              onPress={retakePhoto}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.previewButtonText}>Reprendre</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.previewButton, styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={savePhoto}
              disabled={isLoading}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.previewButtonText}>
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  flipButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2196F3',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    backgroundColor: '#2196F3',
    borderRadius: 30,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  placeholder: {
    width: 60,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#ff5722',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});