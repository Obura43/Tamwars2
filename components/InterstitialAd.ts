import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-6621272459770552/7358278083';
const LAST_INTERSTITIAL_SHOWN_AT_KEY = 'lastInterstitialShownAt';
const INTERSTITIAL_INTERVAL_MS = 3 * 60 * 1000;

let interstitial: InterstitialAd | null = null;
let loaded = false;
let loading = false;
let showing = false;

export function loadInterstitial() {
  if (loading || loaded) return;

  loading = true;
  interstitial = InterstitialAd.createForAdRequest(adUnitId);

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
    loading = false;
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    loading = false;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    showing = false;

    loadInterstitial();
  });

  interstitial.load();
}

async function canShowInterstitial() {
  const lastShownAt = Number(await AsyncStorage.getItem(LAST_INTERSTITIAL_SHOWN_AT_KEY));
  return !lastShownAt || Date.now() - lastShownAt >= INTERSTITIAL_INTERVAL_MS;
}

export async function showInterstitial(onComplete: () => void) {
  if (showing || !(await canShowInterstitial())) {
    onComplete();
    return;
  }

  if (!loaded || !interstitial) {
    loadInterstitial();
    onComplete();
    return;
  }

  showing = true;

  const unsubscribeOpened = interstitial.addAdEventListener(
    AdEventType.OPENED,
    () => {
      AsyncStorage.setItem(LAST_INTERSTITIAL_SHOWN_AT_KEY, Date.now().toString());
    }
  );

  const unsubscribeClosed = interstitial.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
      onComplete();
    }
  );

  const unsubscribeError = interstitial.addAdEventListener(
    AdEventType.ERROR,
    () => {
      showing = false;
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
      onComplete();
    }
  );

  try {
    await interstitial.show();
  } catch {
    showing = false;
    unsubscribeOpened();
    unsubscribeClosed();
    unsubscribeError();
    onComplete();
  }
}
