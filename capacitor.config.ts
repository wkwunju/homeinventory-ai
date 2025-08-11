import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homeinventory.app',
  appName: 'HomeInventory',
  webDir: '.next',
  server: { url: 'https://homeinventory-ai.vercel.app' } // <-- replace with your URL
};

export default config;