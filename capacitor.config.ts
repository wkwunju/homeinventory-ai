import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maisonstock.app',
  appName: 'MaisonStock',
  webDir: '.next',
  server: { url: 'https://maisonstock.vercel.app' } // <-- replace with your URL
};

export default config;