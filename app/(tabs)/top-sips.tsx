import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationCard } from '../../components/Location/LocationCard';
import { useTopLocations } from '../../hooks/useTopLocations';
import { colors, fonts, spacing } from '../../constants/theme';
import type { FilterChip, Location } from '../../types';

const FILTERS: { key: FilterChip; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'gas_station', label: '⛽ Gas Station' },
  { key: 'fast_food',   label: '🍔 Fast Food' },
  { key: 'soda_shop',   label: '🥤 Soda Shop' },
  { key: 'pebbled_ice', label: '❄ Pebble Ice' },
  { key: 'foam_cup',    label: '☕ Foam Cup' },
  { key: 'lime',        label: '🌿 Lime' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export default function TopSipsScreen(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const { locations, loading, refreshing, error, refresh } = useTopLocations(activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Top Sips</Text>
          <Text style={styles.sub}>Best fountain soda, ranked by SipScore</Text>
        </View>

        {/* Filter chips */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.centre}>
            <ActivityIndicator color={colors.teal} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centre}>
            <Text style={styles.errorText}>Couldn't load Top Sips</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList<Location>
            data={locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <LocationCard
                location={item}
                badge={index < 3 ? MEDAL[index] : undefined}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refresh}
            refreshing={refreshing}
            ListHeaderComponent={
              locations.length > 0 ? (
                <Text style={styles.count}>
                  {locations.length} spot{locations.length === 1 ? '' : 's'} with a SipScore
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏆</Text>
                <Text style={styles.emptyTitle}>No ranked spots yet</Text>
                <Text style={styles.emptyBody}>
                  {activeFilter === 'all'
                    ? 'Locations need at least 3 reviews before their SipScore activates.'
                    : 'No rated spots match this filter. Try a different one.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    backgroundColor: colors.gray,
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
    gap: 3,
  },
  heading: {
    fontFamily: fonts.display.extraBold,
    fontSize: 26,
    color: '#1A1A1A',
  },
  sub: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.grayMid,
  },

  // Filters
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.grayLight,
  },
  filtersRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  chipActive: {
    backgroundColor: colors.tealLight,
    borderColor: colors.teal,
  },
  chipText: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.grayMid,
  },
  chipTextActive: {
    color: colors.teal,
  },

  // List
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  count: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
    paddingHorizontal: spacing.md,
    paddingBottom: 4,
  },

  // States
  centre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.redDark,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: colors.teal,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.grayMid,
    textAlign: 'center',
    lineHeight: 20,
  },
});
