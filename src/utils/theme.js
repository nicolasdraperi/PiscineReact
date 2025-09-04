// Thème unique pour Memorize - Palette Rouge/Corail cohérente
export const colors = {
  // Palette principale - Rouge/Corail moderne UNIQUEMENT
  primary: '#FF6B6B',        // Rouge corail moderne
  primaryLight: '#FFE8E8',   // Rouge très clair
  primaryDark: '#E85A5A',    // Rouge plus foncé
  
  // Couleurs secondaires - Tons rouge/rose uniquement
  secondary: '#FF8A95',      // Rose saumon
  secondaryLight: '#FFEFF0', // Rose très clair
  accent: '#FF4757',         // Rouge vif
  
  // Couleurs d'action - Tons chauds cohérents
  success: '#FF6B6B',        // Rouge (cohérent)
  warning: '#FF7675',        // Rouge orangé
  error: '#E17055',          // Rouge terre
  info: '#FF6B6B',           // Rouge (pas de bleu!)
  
  // Neutres modernes
  background: '#FAFBFC',     // Blanc cassé très doux
  surface: '#FFFFFF',        // Blanc pur
  card: '#FFF5F5',          // Blanc avec nuance rouge
  
  // Textes
  textPrimary: '#2D3436',    // Gris foncé moderne
  textSecondary: '#636E72',  // Gris moyen
  textLight: '#DDD',         // Gris clair
  
  // Couleurs pour les humeurs - Tons chauds cohérents
  mood: {
    happy: '#FDCB6E',        // Jaune chaud
    excited: '#E17055',      // Rouge orangé
    peaceful: '#FF7675',     // Rouge doux
    adventurous: '#FF6B6B',  // Rouge principal
    nostalgic: '#FD79A8',    // Rose tendre
  },
  
  // Gradients - Uniquement tons rouges
  gradients: {
    primary: ['#FF6B6B', '#FF8A95'],
    sunset: ['#FF8A95', '#FDCB6E'],
    warm: ['#E17055', '#FF7675'],
    coral: ['#FF6B6B', '#FD79A8'],
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  large: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12.84,
    elevation: 16,
  },
};
