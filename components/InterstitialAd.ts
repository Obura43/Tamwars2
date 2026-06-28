import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-6621272459770552/7358278083';

let interstitial: InterstitialAd | null = null;
let loaded = false;

export function loadInterstitial() {
  interstitial = InterstitialAd.createForAdRequest(adUnitId);

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;

    // Load the next ad immediately
    loadInterstitial();
  });

  interstitial.load();
}

export function showInterstitial(onComplete: () => void) {
  if (!loaded || !interstitial) {
    onComplete();
    return;
  }

  const unsubscribeClosed = interstitial.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      unsubscribeClosed();
      unsubscribeError();
      onComplete();
    }
  );

  const unsubscribeError = interstitial.addAdEventListener(
    AdEventType.ERROR,
    () => {
      unsubscribeClosed();
      unsubscribeError();
      onComplete();
    }
  );

  interstitial.show();
}