import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import type { Location } from '../../types';
import type { CategoryAverage } from '../../hooks/useLocationDetail';

type CardStatus = 'green' | 'amber' | 'gray';

interface WhatYouGetCard {
  icon: string;
  title: string;
  subtitle: string;
  status: CardStatus;
}

const STATUS_BG: Record<CardStatus, string> = {
  green: colors.greenLight,
  amber: colors.amberLight,
  gray:  colors.gray,
};
const STATUS_TEXT: Record<CardStatus, string> = {
  green: colors.green,
  amber: colors.amberDark,
  gray:  colors.grayMid,
};
const STATUS_ICON_BG: Record<CardStatus, string> = {
  green: colors.greenMid,
  amber: colors.amber,
  gray:  colors.grayLight,
};

function buildCards(
  location: Location,
  averages: CategoryAverage[],
): WhatYouGetCard[] {
  const crispAvg = averages.find((a) => a.key === 'crispiness');

  // Ice
  const iceCard: WhatYouGetCard = location.has_pebbled_ice === true
    ? { icon: '❄️', title: 'Pebble Ice',    subtitle: 'The good stuff',        status: 'green' }
    : location.has_pebbled_ice === false
    ? { icon: '🧊', title: 'Crushed / Cubed', subtitle: 'Standard ice',         status: 'amber' }
    : { icon: '🧊', title: 'Ice Unknown',   subtitle: 'No data yet',           status: 'gray' };

  // Cup
  const cupCard: WhatYouGetCard = location.has_foam_cup === true
    ? { icon: '☕', title: 'Foam Cup',      subtitle: 'Keeps it cold longer',   status: 'green' }
    : location.has_foam_cup === false
    ? { icon: '🥤', title: 'Plastic Cup',   subtitle: 'Standard cup',           status: 'amber' }
    : { icon: '🥤', title: 'Cup Unknown',   subtitle: 'No data yet',            status: 'gray' };

  // Lime
  const limeCard: WhatYouGetCard = location.has_lime === true
    ? { icon: '🌿', title: 'Lime Available', subtitle: 'On request',            status: 'green' }
    : location.has_lime === false
    ? { icon: '🌿', title: 'No Lime',        subtitle: 'Not offered here',      status: 'gray' }
    : { icon: '🌿', title: 'Lime Unknown',   subtitle: 'No data yet',           status: 'gray' };

  // Carbonation (from crispiness avg)
  let carbonCard: WhatYouGetCard;
  if (crispAvg?.score !== null && crispAvg?.score !== undefined) {
    if (crispAvg.score >= 8)
      carbonCard = { icon: '💨', title: 'Crispy',       subtitle: 'High carbonation',    status: 'green' };
    else if (crispAvg.score >= 6)
      carbonCard = { icon: '💨', title: 'Decent',       subtitle: 'Average carbonation', status: 'amber' };
    else
      carbonCard = { icon: '💨', title: 'Flat',         subtitle: 'Low carbonation',     status: 'gray' };
  } else {
    carbonCard = { icon: '💨', title: 'Carbonation',  subtitle: 'No data yet',         status: 'gray' };
  }

  // Price
  const priceCard: WhatYouGetCard =
    location.price_range === '$'
      ? { icon: '💰', title: 'Budget',      subtitle: 'Under $2',              status: 'green' }
      : location.price_range === '$$'
      ? { icon: '💰', title: 'Moderate',    subtitle: '$2–$4',                 status: 'amber' }
      : location.price_range === '$$$'
      ? { icon: '💰', title: 'Pricey',      subtitle: '$4+',                   status: 'gray' }
      : { icon: '💰', title: 'Price',       subtitle: 'No data yet',           status: 'gray' };

  // Drive-thru
  const dtCard: WhatYouGetCard = location.has_drive_thru
    ? { icon: '🚗', title: 'Drive-Thru',   subtitle: 'Skip the line',         status: 'green' }
    : { icon: '🚗', title: 'Walk-In Only', subtitle: 'No drive-thru',         status: 'gray' };

  return [iceCard, cupCard, limeCard, carbonCard, priceCard, dtCard];
}

interface WhatYouGetProps {
  location: Location;
  averages: CategoryAverage[];
}

export function WhatYouGet({ location, averages }: WhatYouGetProps): React.JSX.Element {
  const cards = buildCards(location, averages);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>What You're Getting</Text>
      <View style={styles.grid}>
        {cards.map((card, i) => (
          <WYGCard key={i} card={card} />
        ))}
      </View>
    </View>
  );
}

function WYGCard({ card }: { card: WhatYouGetCard }): React.JSX.Element {
  return (
    <View style={[styles.card, { backgroundColor: STATUS_BG[card.status] }]}>
      <View style={[styles.iconBubble, { backgroundColor: STATUS_ICON_BG[card.status] }]}>
        <Text style={styles.icon}>{card.icon}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: STATUS_TEXT[card.status] }]}>{card.title}</Text>
      <Text style={[styles.cardSub, { color: STATUS_TEXT[card.status] }]}>{card.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  heading: {
    fontFamily: fonts.display.bold,
    fontSize: 17,
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '31%',
    borderRadius: radius.md,
    padding: 10,
    gap: 5,
    minHeight: 90,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  cardTitle: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    lineHeight: 15,
  },
  cardSub: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    lineHeight: 13,
    opacity: 0.8,
  },
});
