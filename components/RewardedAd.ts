import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

const adUnitId = 'ca-app-pub-6621272459770552/2913694675';

let rewardedAd: RewardedAd | null = null;
let loaded = false;
let loading = false;
let showing = false;

export function loadRewardedAd() {
  if (loading || loaded) return;

  loading = true;
  rewardedAd = RewardedAd.createForAdRequest(adUnitId);

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    loaded = true;
    loading = false;
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    loading = false;
    showing = false;
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    showing = false;
    loadRewardedAd();
  });

  rewardedAd.load();
}

export async function showRewardedAd(): Promise<boolean> {
  if (showing) return false;

  if (!loaded || !rewardedAd) {
    loadRewardedAd();
    return false;
  }

  showing = true;

  return new Promise((resolve) => {
    let rewardEarned = false;

    const cleanup = () => {
      unsubscribeRewarded();
      unsubscribeClosed();
      unsubscribeError();
    };

    const unsubscribeRewarded = rewardedAd!.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardEarned = true;
      }
    );

    const unsubscribeClosed = rewardedAd!.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        cleanup();
        resolve(rewardEarned);
      }
    );

    const unsubscribeError = rewardedAd!.addAdEventListener(
      AdEventType.ERROR,
      () => {
        showing = false;
        cleanup();
        resolve(false);
      }
    );

    rewardedAd!.show().catch(() => {
      showing = false;
      cleanup();
      resolve(false);
    });
  });
}
