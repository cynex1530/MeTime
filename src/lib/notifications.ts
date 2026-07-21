/**
 * Local notifications — currently just the "leave a review" reminder that fires
 * when a customer finishes an appointment. Uses Expo's local scheduler (works
 * in Expo Go); no remote push server is involved.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show the banner even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let androidChannelReady = false;

/** Ask for permission (remembered by the OS) and prepare the Android channel. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (granted && Platform.OS === 'android' && !androidChannelReady) {
    await Notifications.setNotificationChannelAsync('reviews', {
      name: 'Review reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    androidChannelReady = true;
  }
  return granted;
}

/** Params carried in the notification so tapping it opens the right review. */
export type ReviewReminderData = {
  kind: 'review';
  id: string;
  artist: string;
  service: string;
  salon: string;
  salonId: string;
  artistId: string;
};

/**
 * Schedule the "don't forget to leave a review" reminder. `body` is passed in
 * already-translated by the caller so the notification follows the app language.
 */
export async function scheduleReviewReminder(body: string, data: ReviewReminderData): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Me Time',
      body,
      data,
      ...(Platform.OS === 'android' ? { channelId: 'reviews' } : null),
    },
    // fire almost immediately, as a real banner rather than an in-place alert
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });
}
