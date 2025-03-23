
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function playNotificationSound() {
  try {
    const audio = new Audio('/notification-sound.mp3');
    return audio.play().catch(e => {
      console.log('Error playing audio:', e);
      return false;
    });
  } catch (error) {
    console.error("Error creating audio object:", error);
    return Promise.resolve(false);
  }
}
