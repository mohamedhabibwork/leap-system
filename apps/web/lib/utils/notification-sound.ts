/**
 * Play notification sound
 * Uses Web Audio API to play a simple notification beep
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;

  try {
    // Check if sound is enabled in localStorage
    const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    if (!soundEnabled) return;

    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound (gentle notification tone)
    oscillator.frequency.value = 800; // 800Hz
    oscillator.type = 'sine'; // Smooth sine wave
    
    // Volume envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
    // Clean up
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

/**
 * Play sound from audio file (alternative method)
 * Requires notification.mp3 file in public/sounds/
 */
export function playNotificationSoundFromFile() {
  if (typeof window === 'undefined') return;

  try {
    const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    if (!soundEnabled) return;

    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.error('Failed to play notification sound:', error);
    });
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

/**
 * Check if notification permissions are granted
 */
export function hasNotificationPermission(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
