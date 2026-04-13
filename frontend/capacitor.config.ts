import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nimbus.pos',
  appName: 'Nimbus POS',
  webDir: 'public',
  server: {
    url: "https://nimbus-pos-seven.vercel.app",
    cleartext: true
  }
};

export default config;
