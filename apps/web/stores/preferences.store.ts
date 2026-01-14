import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeedDensity = 'compact' | 'comfortable' | 'spacious';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';

interface PreferencesState {
  // Theme
  fontSize: number;
  feedDensity: FeedDensity;
  accentColor: AccentColor;
  reducedMotion: boolean;
  highContrast: boolean;

  // Feed preferences
  showRecommendations: boolean;
  showAds: boolean;
  autoplayVideos: boolean;

  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;

  // Privacy
  showOnlineStatus: boolean;
  allowTagging: boolean;
  profileVisibility: 'public' | 'connections' | 'private';

  // Actions
  setFontSize: (size: number) => void;
  setFeedDensity: (density: FeedDensity) => void;
  setAccentColor: (color: AccentColor) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setShowRecommendations: (show: boolean) => void;
  setShowAds: (show: boolean) => void;
  setAutoplayVideos: (autoplay: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setDesktopNotifications: (enabled: boolean) => void;
  setShowOnlineStatus: (show: boolean) => void;
  setAllowTagging: (allow: boolean) => void;
  setProfileVisibility: (visibility: 'public' | 'connections' | 'private') => void;
  resetToDefaults: () => void;
}

const defaultPreferences = {
  fontSize: 16,
  feedDensity: 'comfortable' as FeedDensity,
  accentColor: 'blue' as AccentColor,
  reducedMotion: false,
  highContrast: false,
  showRecommendations: true,
  showAds: true,
  autoplayVideos: false,
  emailNotifications: true,
  pushNotifications: true,
  desktopNotifications: false,
  showOnlineStatus: true,
  allowTagging: true,
  profileVisibility: 'public' as const,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setFontSize: (size) => set({ fontSize: size }),
      setFeedDensity: (density) => set({ feedDensity: density }),
      setAccentColor: (color) => set({ accentColor: color }),
      setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      setShowRecommendations: (show) => set({ showRecommendations: show }),
      setShowAds: (show) => set({ showAds: show }),
      setAutoplayVideos: (autoplay) => set({ autoplayVideos: autoplay }),
      setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
      setPushNotifications: (enabled) => set({ pushNotifications: enabled }),
      setDesktopNotifications: (enabled) => set({ desktopNotifications: enabled }),
      setShowOnlineStatus: (show) => set({ showOnlineStatus: show }),
      setAllowTagging: (allow) => set({ allowTagging: allow }),
      setProfileVisibility: (visibility) => set({ profileVisibility: visibility }),
      resetToDefaults: () => set(defaultPreferences),
    }),
    {
      name: 'user-preferences',
    }
  )
);
