import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Gym Log',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'DARK',
    },
    SystemBars: {
      insetsHandling: 'disable',
    },
    EdgeToEdge: {
      statusBarColor: '#1e293b', // your color
    },
    Keyboard: {
      resizeOnFullScreen: false, // you have @capacitor/keyboard installed — this must stay false or it fights the plugin
    },
  },
};

export default config;