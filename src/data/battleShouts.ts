export type BattleShoutSide = 'WANTAM' | 'TUTAM';

export interface BattleShoutPreset {
  id: string;
  text: string;
  side?: BattleShoutSide;
}

export const BATTLE_SHOUT_PRESETS: BattleShoutPreset[] = [
  { id: 'tap-harder', text: 'Tap harder!' },
  { id: 'catching-up', text: "We're catching up!" },
  { id: 'defend-lead', text: 'Defend the lead!' },
  { id: 'one-more-round', text: 'One more round!' },
  { id: 'leaderboard-push', text: 'Leaderboard push!' },
  { id: 'coins-grind', text: 'Coins grind!' },
  { id: 'who-online', text: 'Who is online?' },
  { id: 'respect-side', text: 'Respect the other side.' },
  { id: 'wantam-assemble', text: 'Wantam assemble!', side: 'WANTAM' },
  { id: 'wantam-moving', text: 'Wantam is moving!', side: 'WANTAM' },
  { id: 'tutam-assemble', text: 'Tutam assemble!', side: 'TUTAM' },
  { id: 'tutam-moving', text: 'Tutam is moving!', side: 'TUTAM' },
];

export function getBattleShoutText(messageId: string) {
  return BATTLE_SHOUT_PRESETS.find((preset) => preset.id === messageId)?.text ?? 'Battle shout!';
}
