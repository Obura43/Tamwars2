import { useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

export default function BackgroundMusic() {
  const player = useAudioPlayer(
    require('@/assets/audio/background.mp3')
  );

  useEffect(() => {
    async function startMusic() {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      player.loop = true;
      player.volume = 0.08;
      player.play();
    }

    startMusic();

    return () => {
      player.pause();
    };
  }, [player]);

  return null;
}