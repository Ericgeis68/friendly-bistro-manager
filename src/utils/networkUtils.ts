import { Network } from '@capacitor/network';

export async function checkNetworkStatus() {
  const status = await Network.getStatus();
  console.log('Network status:', status);
  return status.connected;
}

export async function initNetworkListeners() {
  // Listen for network status changes
  Network.addListener('networkStatusChange', status => {
    console.log('Network status changed:', status);
  });
}