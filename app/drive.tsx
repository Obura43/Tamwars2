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
const CITY_SIZE = Math.min(width - 40, 420);
const CAR_WIDTH = 28;
const CAR_HEIGHT = 44;
const MOVE_STEP = 18;

type Heading = 'up' | 'right' | 'down' | 'left';

const MISSIONS = [
  {
    id: 'cbd-westlands',
    title: 'CBD to Westlands',
    start: 'CBD',
    destination: 'Westlands',
    target: { x: CITY_SIZE - 116, y: 34, width: 92, height: 58 },
  },
  {
    id: 'ngara-park',
    title: 'Ngara to Uhuru Park',
    start: 'Ngara',
    destination: 'Uhuru Park',
    target: { x: CITY_SIZE - 126, y: CITY_SIZE / 2 + 48, width: 92, height: 54 },
  },
  {
    id: 'upperhill-cbd',
    title: 'Upper Hill to CBD',
    start: 'Upper Hill',
    destination: 'CBD',
    target: { x: 22, y: 24, width: 92, height: 86 },
  },
];

export default function DriveScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams<{ carId?: string }>();
  const { user } = useAuth();
  const [ownedCarIds, setOwnedCarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(carId ?? null);
  const [position, setPosition] = useState({
    x: CITY_SIZE / 2 - CAR_WIDTH / 2,
    y: CITY_SIZE - 78,
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

      next.x = Math.max(18, Math.min(CITY_SIZE - CAR_WIDTH - 18, next.x));
      next.y = Math.max(18, Math.min(CITY_SIZE - CAR_HEIGHT - 18, next.y));

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

    setMissionNotice(`${missionTitle} complete: +${result.amount.toLocaleString()} TWS`);
  };

  const carRotation = heading === 'up' ? '0deg' : heading === 'right' ? '90deg' : heading === 'down' ? '180deg' : '270deg';

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
          <Text style={styles.emptyText}>Buy toy luxury cars with TWS, then drive them through TamWar City.</Text>
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
          Drive from {activeMission.start} to the marked {activeMission.destination} zone for a TWS reward.
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

      <View style={[styles.city, { width: CITY_SIZE, height: CITY_SIZE }]}>
        <View style={[styles.roadVertical, { left: CITY_SIZE / 2 - 35 }]} />
        <View style={[styles.roadHorizontal, { top: CITY_SIZE / 2 - 35 }]} />
        <View style={[styles.roundabout, { left: CITY_SIZE / 2 - 44, top: CITY_SIZE / 2 - 44 }]} />

        <View style={[styles.block, styles.blockTall, { left: 22, top: 24 }]}>
          <Text style={styles.blockText}>CBD</Text>
        </View>
        <View style={[styles.block, { right: 24, top: 34 }]}>
          <Text style={styles.blockText}>Westlands</Text>
        </View>
        <View style={[styles.block, { left: 26, bottom: 34 }]}>
          <Text style={styles.blockText}>Upper Hill</Text>
        </View>
        <View style={[styles.block, styles.blockTall, { right: 26, bottom: 28 }]}>
          <Text style={styles.blockText}>Ngara</Text>
        </View>
        <View style={[styles.park, { right: 34, top: CITY_SIZE / 2 + 48 }]}>
          <Text style={styles.parkText}>Uhuru Park</Text>
        </View>

        <View
          style={[
            styles.destinationMarker,
            {
              left: activeMission.target.x + activeMission.target.width / 2 - 14,
              top: activeMission.target.y + activeMission.target.height / 2 - 14,
            },
          ]}
        >
          <Text style={styles.destinationMarkerText}>GO</Text>
        </View>

        <View
          style={[
            styles.toyCar,
            {
              left: position.x,
              top: position.y,
              backgroundColor: activeCar.color === 'Volcano Red' ? COLORS.wantam : activeCar.color === 'Champagne Gold' ? COLORS.gold : COLORS.white,
              transform: [{ rotate: carRotation }],
            },
          ]}
        >
          <View style={styles.carWindow} />
          <View style={styles.carNose} />
        </View>
      </View>

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
  city: {
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#162018',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    width: 70,
    height: '100%',
    backgroundColor: '#303436',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 70,
    backgroundColor: '#303436',
  },
  roundabout: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#465046',
    borderWidth: 12,
    borderColor: '#303436',
  },
  block: {
    position: 'absolute',
    width: 92,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#4B4F57',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  blockTall: {
    height: 86,
  },
  blockText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
  },
  park: {
    position: 'absolute',
    width: 92,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.tutam,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parkText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
  },
  destinationMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  destinationMarkerText: {
    fontFamily: 'Inter-Black',
    fontSize: 9,
    color: COLORS.background,
  },
  toyCar: {
    position: 'absolute',
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  carWindow: {
    width: 14,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#6AB7FF',
    marginTop: 8,
  },
  carNose: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.28)',
    marginTop: 13,
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
