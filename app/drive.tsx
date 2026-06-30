import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Car, ChevronLeft, Store } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { COLORS } from '@/lib/constants';
import { CAR_ITEMS } from '@/src/data/marketplaceCatalog';
import { claimDriveMissionReward, getClaimedDriveMissionIds, getOwnedVirtualAssets } from '@/src/services/walletService';

const { width } = Dimensions.get('window');
const CITY_VIEW_WIDTH = Math.min(width - 40, 420);
const CITY_WIDTH = 640;
const CITY_HEIGHT = 780;
const CAR_WIDTH = 34;
const CAR_HEIGHT = 54;
const MOVE_STEP = 24;

type Heading = 'up' | 'right' | 'down' | 'left';

const MISSIONS = [
  {
    id: 'cbd-westlands',
    title: 'CBD to Westlands',
    start: 'CBD',
    destination: 'Westlands',
    clue: 'Head north-west past Museum Hill.',
    target: { x: 472, y: 108, width: 112, height: 76 },
  },
  {
    id: 'ngara-park',
    title: 'Ngara to Uhuru Park',
    start: 'Ngara',
    destination: 'Uhuru Park',
    clue: 'Find the green zone south of the roundabout.',
    target: { x: 414, y: 460, width: 136, height: 86 },
  },
  {
    id: 'upperhill-cbd',
    title: 'Upper Hill to CBD',
    start: 'Upper Hill',
    destination: 'CBD',
    clue: 'Climb back toward the tall towers.',
    target: { x: 58, y: 96, width: 124, height: 108 },
  },
];

const BUILDINGS = [
  { id: 'cbd', label: 'CBD', x: 58, y: 96, width: 124, height: 108, tall: true, tone: '#59606B' },
  { id: 'museum', label: 'Museum Hill', x: 230, y: 66, width: 104, height: 74, tone: '#48525E' },
  { id: 'westlands', label: 'Westlands', x: 472, y: 108, width: 112, height: 76, tone: '#525D68' },
  { id: 'ngara', label: 'Ngara', x: 64, y: 382, width: 114, height: 88, tall: true, tone: '#4E5661' },
  { id: 'upperhill', label: 'Upper Hill', x: 92, y: 596, width: 132, height: 104, tall: true, tone: '#5B525F' },
  { id: 'kilimani', label: 'Kilimani', x: 404, y: 610, width: 122, height: 88, tone: '#56515C' },
  { id: 'estate', label: 'Estate', x: 476, y: 300, width: 102, height: 78, tone: '#4B5660' },
];

const ROAD_SEGMENTS = [
  { id: 'thika', type: 'vertical', left: 292, top: 0, width: 86, height: CITY_HEIGHT },
  { id: 'waiyaki', type: 'horizontal', left: 0, top: 210, width: CITY_WIDTH, height: 84 },
  { id: 'haile', type: 'horizontal', left: 0, top: 394, width: CITY_WIDTH, height: 78 },
  { id: 'uhuru', type: 'vertical', left: 162, top: 180, width: 74, height: 560 },
  { id: 'ring', type: 'horizontal', left: 120, top: 604, width: 440, height: 68 },
];

export default function DriveScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams<{ carId?: string }>();
  const { user } = useAuth();
  const [ownedCarIds, setOwnedCarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(carId ?? null);
  const [position, setPosition] = useState({
    x: CITY_WIDTH / 2 - CAR_WIDTH / 2,
    y: CITY_HEIGHT - 92,
  });
  const [heading, setHeading] = useState<Heading>('up');
  const [distance, setDistance] = useState(0);
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [missionNotice, setMissionNotice] = useState('');

  const loadCars = useCallback(async () => {
    if (!user) {
      setOwnedCarIds([]);
      setLoading(false);
      return;
    }

    const [assets, claimedMissionIds] = await Promise.all([
      getOwnedVirtualAssets(user.id),
      getClaimedDriveMissionIds(user.id),
    ]);
    setOwnedCarIds(assets.filter((asset) => asset.asset_type === 'car').map((asset) => asset.asset_id));
    setCompletedMissionIds(claimedMissionIds);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  useEffect(() => {
    if (ownedCarIds.length === 0) return;

    if (!selectedCarId || !ownedCarIds.includes(selectedCarId)) {
      setSelectedCarId(ownedCarIds[0]);
    }
  }, [ownedCarIds, selectedCarId]);

  const ownedCars = useMemo(
    () => CAR_ITEMS.filter((car) => ownedCarIds.includes(car.id)),
    [ownedCarIds]
  );

  const activeCar = useMemo(() => {
    const selected = CAR_ITEMS.find((car) => car.id === selectedCarId && ownedCarIds.includes(car.id));
    if (selected) return selected;

    return CAR_ITEMS.find((car) => ownedCarIds.includes(car.id)) ?? null;
  }, [ownedCarIds, selectedCarId]);

  const activeMission = MISSIONS[activeMissionIndex];
  const carCenter = {
    x: position.x + CAR_WIDTH / 2,
    y: position.y + CAR_HEIGHT / 2,
  };
  const destinationCenter = {
    x: activeMission.target.x + activeMission.target.width / 2,
    y: activeMission.target.y + activeMission.target.height / 2,
  };
  const destinationDistance = Math.hypot(carCenter.x - destinationCenter.x, carCenter.y - destinationCenter.y);
  const destinationVisible = destinationDistance < 190 || completedMissionIds.includes(activeMission.id);

  const carReachedTarget = (nextPosition: { x: number; y: number }) => {
    const carCenterX = nextPosition.x + CAR_WIDTH / 2;
    const carCenterY = nextPosition.y + CAR_HEIGHT / 2;

    return (
      carCenterX >= activeMission.target.x &&
      carCenterX <= activeMission.target.x + activeMission.target.width &&
      carCenterY >= activeMission.target.y &&
      carCenterY <= activeMission.target.y + activeMission.target.height
    );
  };

  const moveCar = (direction: Heading) => {
    setHeading(direction);
    setMissionNotice('');
    setPosition((current) => {
      const next = { ...current };

      if (direction === 'up') next.y -= MOVE_STEP;
      if (direction === 'down') next.y += MOVE_STEP;
      if (direction === 'left') next.x -= MOVE_STEP;
      if (direction === 'right') next.x += MOVE_STEP;

      next.x = Math.max(18, Math.min(CITY_WIDTH - CAR_WIDTH - 18, next.x));
      next.y = Math.max(18, Math.min(CITY_HEIGHT - CAR_HEIGHT - 18, next.y));

      if (next.x !== current.x || next.y !== current.y) {
        setDistance((value) => value + 1);
      }

      if (!completedMissionIds.includes(activeMission.id) && carReachedTarget(next)) {
        setCompletedMissionIds((ids) => [...ids, activeMission.id]);
        setMissionNotice(`${activeMission.title} complete`);
        claimMissionReward(activeMission.id, activeMission.title);
      }

      return next;
    });
  };

  const selectMission = (index: number) => {
    setActiveMissionIndex(index);
    setMissionNotice('');
  };

  const claimMissionReward = async (missionId: string, missionTitle: string) => {
    const result = await claimDriveMissionReward(missionId);

    if (!result.success) {
      setMissionNotice(`${missionTitle} complete. Reward claim failed.`);
      return;
    }

    if (result.amount === 0) {
      setMissionNotice(`${missionTitle} already rewarded.`);
      return;
    }

    setMissionNotice(`${missionTitle} complete: +${result.amount.toLocaleString()} Coins`);
  };

  const carRotation = heading === 'up' ? '0deg' : heading === 'right' ? '90deg' : heading === 'down' ? '180deg' : '270deg';
  const activeCarColor =
    activeCar?.color === 'Volcano Red'
      ? COLORS.wantam
      : activeCar?.color === 'Champagne Gold'
      ? COLORS.gold
      : activeCar?.color === 'Midnight Black'
      ? '#1E2228'
      : '#F4F6F8';
  const activeCarAccent = activeCar?.color === 'Pearl White' ? '#B9C4D1' : 'rgba(255,255,255,0.72)';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading garage...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Car color={COLORS.gold} size={44} />
          <Text style={styles.emptyTitle}>Sign in to drive</Text>
          <Text style={styles.emptyText}>Buy toy luxury cars with Coins, then drive them through TamWar City.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/signup')} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeCar) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Car color={COLORS.gold} size={44} />
          <Text style={styles.emptyTitle}>No car yet</Text>
          <Text style={styles.emptyText}>Buy a toy luxury car in the TW Store to unlock Nairobi City driving.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push({ pathname: '/marketplace', params: { tab: 'cars' } } as any)}
            activeOpacity={0.8}
          >
            <Store color={COLORS.background} size={18} />
            <Text style={styles.primaryButtonText}>Open TW Store</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <ChevronLeft color={COLORS.white} size={24} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Nairobi City Drive</Text>
          <Text style={styles.subtitle}>{activeCar.name} - {activeCar.className}</Text>
        </View>
      </View>

      {ownedCars.length > 1 && (
        <View style={styles.carSelector}>
          {ownedCars.map((car) => (
            <TouchableOpacity
              key={car.id}
              style={[styles.carChip, car.id === activeCar.id && styles.carChipActive]}
              onPress={() => setSelectedCarId(car.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.carChipText, car.id === activeCar.id && styles.carChipTextActive]} numberOfLines={1}>
                {car.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Trips</Text>
          <Text style={styles.statValue}>{distance}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Speed</Text>
          <Text style={styles.statValue}>{activeCar.speed}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Handling</Text>
          <Text style={styles.statValue}>{activeCar.handling}</Text>
        </View>
      </View>

      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View>
            <Text style={styles.missionLabel}>Active Route</Text>
            <Text style={styles.missionTitle}>{activeMission.title}</Text>
          </View>
          <Text style={styles.missionProgress}>
            {completedMissionIds.length}/{MISSIONS.length}
          </Text>
        </View>
        <Text style={styles.missionText}>
          {activeMission.clue} The destination marker appears when you get close enough.
        </Text>
        <Text style={styles.destinationStatus}>
          {destinationVisible ? `${activeMission.destination} revealed` : `${activeMission.destination} hidden`}
        </Text>
        {missionNotice ? <Text style={styles.missionNotice}>{missionNotice}</Text> : null}
        <View style={styles.missionTabs}>
          {MISSIONS.map((mission, index) => {
            const completed = completedMissionIds.includes(mission.id);
            const active = index === activeMissionIndex;

            return (
              <TouchableOpacity
                key={mission.id}
                style={[styles.missionTab, active && styles.missionTabActive, completed && styles.missionTabComplete]}
                onPress={() => selectMission(index)}
                activeOpacity={0.8}
              >
                <Text style={[styles.missionTabText, active && styles.missionTabTextActive]}>
                  {completed ? 'Done' : `${index + 1}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityScrollContent}
      >
        <View style={[styles.city, { width: CITY_WIDTH, height: CITY_HEIGHT }]}>
          <View style={styles.grassGrid} />
          {ROAD_SEGMENTS.map((road) => (
            <View
              key={road.id}
              style={[
                styles.road,
                road.type === 'vertical' ? styles.roadVertical : styles.roadHorizontal,
                {
                  left: road.left,
                  top: road.top,
                  width: road.width,
                  height: road.height,
                },
              ]}
            >
              <View style={road.type === 'vertical' ? styles.laneLineVertical : styles.laneLineHorizontal} />
            </View>
          ))}
          <View style={[styles.roundabout, { left: 278, top: 376 }]} />

          <View style={[styles.park, { left: 414, top: 460 }]}>
            <Text style={styles.parkText}>Uhuru Park</Text>
          </View>
          <View style={[styles.park, styles.smallPark, { left: 410, top: 32 }]}>
            <Text style={styles.parkText}>Karura Edge</Text>
          </View>

          {BUILDINGS.map((building) => (
            <View
              key={building.id}
              style={[
                styles.building,
                building.tall && styles.buildingTall,
                {
                  left: building.x,
                  top: building.y,
                  width: building.width,
                  height: building.height,
                  backgroundColor: building.tone,
                },
              ]}
            >
              <View style={styles.buildingRoof} />
              <Text style={styles.blockText}>{building.label}</Text>
            </View>
          ))}

          <View style={[styles.cityLabel, { left: 294, top: 20 }]}>
            <Text style={styles.cityLabelText}>THIKA ROAD</Text>
          </View>
          <View style={[styles.cityLabel, { left: 402, top: 400 }]}>
            <Text style={styles.cityLabelText}>HAILE SELASSIE</Text>
          </View>

          {destinationVisible ? (
            <View
              style={[
                styles.destinationMarker,
                {
                  left: activeMission.target.x + activeMission.target.width / 2 - 18,
                  top: activeMission.target.y + activeMission.target.height / 2 - 18,
                },
              ]}
            >
              <Text style={styles.destinationMarkerText}>GO</Text>
            </View>
          ) : (
            <View style={[styles.hiddenMarker, { left: 306, top: 338 }]}>
              <Text style={styles.hiddenMarkerText}>?</Text>
            </View>
          )}

          <View
            style={[
              styles.carShadow,
              {
                left: position.x - 4,
                top: position.y + CAR_HEIGHT - 10,
                transform: [{ rotate: carRotation }],
              },
            ]}
          />
          <View
            style={[
              styles.toyCar,
              {
                left: position.x,
                top: position.y,
                backgroundColor: activeCarColor,
                borderColor: activeCarAccent,
                transform: [{ rotate: carRotation }],
              },
            ]}
          >
            <View style={[styles.carRoof, { backgroundColor: activeCarAccent }]} />
            <View style={styles.carWindow} />
            <View style={styles.carHood} />
            <View style={styles.carLightRow}>
              <View style={styles.carLight} />
              <View style={styles.carLight} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => moveCar('up')} activeOpacity={0.8}>
          <ArrowUp color={COLORS.white} size={24} />
        </TouchableOpacity>
        <View style={styles.controlMiddleRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => moveCar('left')} activeOpacity={0.8}>
            <ArrowLeft color={COLORS.white} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => moveCar('down')} activeOpacity={0.8}>
            <ArrowDown color={COLORS.white} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => moveCar('right')} activeOpacity={0.8}>
            <ArrowRight color={COLORS.white} size={24} />
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 34,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Black',
    fontSize: 24,
    color: COLORS.white,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  carSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  carChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  carChipText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
  },
  carChipTextActive: {
    color: COLORS.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  missionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  missionLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  missionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  missionProgress: {
    fontFamily: 'Inter-Black',
    fontSize: 15,
    color: COLORS.gold,
  },
  missionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  destinationStatus: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.gold,
    marginBottom: 12,
  },
  missionNotice: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.success,
    marginBottom: 12,
  },
  missionTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  missionTab: {
    flex: 1,
    minHeight: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  missionTabActive: {
    borderColor: COLORS.gold,
  },
  missionTabComplete: {
    backgroundColor: COLORS.tutam,
    borderColor: COLORS.tutam,
  },
  missionTabText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.white,
  },
  missionTabTextActive: {
    color: COLORS.gold,
  },
  cityScrollContent: {
    paddingHorizontal: Math.max((CITY_VIEW_WIDTH - CITY_WIDTH) / 2, 0),
  },
  city: {
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#172319',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  grassGrid: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#182B1D',
    opacity: 0.9,
  },
  road: {
    position: 'absolute',
    backgroundColor: '#303436',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roadVertical: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadHorizontal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  laneLineVertical: {
    width: 2,
    height: '92%',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  laneLineHorizontal: {
    width: '94%',
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  roundabout: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#52624D',
    borderWidth: 14,
    borderColor: '#303436',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  building: {
    position: 'absolute',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 7,
    shadowOffset: { width: 6, height: 8 },
    elevation: 6,
  },
  buildingTall: {
    borderTopWidth: 6,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  buildingRoof: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  blockText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
  },
  park: {
    position: 'absolute',
    width: 136,
    height: 86,
    borderRadius: 12,
    backgroundColor: COLORS.tutam,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  smallPark: {
    width: 118,
    height: 62,
    backgroundColor: '#087B4F',
  },
  parkText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
  },
  destinationMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.65,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  destinationMarkerText: {
    fontFamily: 'Inter-Black',
    fontSize: 10,
    color: COLORS.background,
  },
  hiddenMarker: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenMarkerText: {
    fontFamily: 'Inter-Black',
    fontSize: 17,
    color: COLORS.textSecondary,
  },
  cityLabel: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  cityLabelText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.72)',
  },
  carShadow: {
    position: 'absolute',
    width: CAR_WIDTH + 8,
    height: 14,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  toyCar: {
    position: 'absolute',
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.48,
    shadowRadius: 7,
    shadowOffset: { width: 2, height: 5 },
    elevation: 8,
  },
  carRoof: {
    width: 20,
    height: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  carWindow: {
    width: 16,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#7BC6FF',
    marginTop: -12,
    opacity: 0.9,
  },
  carHood: {
    width: 22,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.18)',
    marginTop: 11,
  },
  carLightRow: {
    width: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  carLight: {
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF2A8',
  },
  controls: {
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  controlMiddleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 58,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.background,
  },
});
