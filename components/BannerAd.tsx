import React from 'react';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const adUnitId = 'ca-app-pub-6621272459770552/9110533400';

export default function BannerAdvertisement() {
  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
}
