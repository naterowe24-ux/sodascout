import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SipPin } from './SipPin';
import type { LocationWithDistance } from '../../types';

// Use Google Maps on Android; Apple Maps on iOS during development.
// To use Google Maps on iOS in production, configure googleMapsApiKey in app.config.js
// and run an EAS build.
const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

const LATITUDE_DELTA = 0.08;
const LONGITUDE_DELTA = 0.08;

interface SodaMapProps {
  locations: LocationWithDistance[];
  userCoords: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelectPin: (location: LocationWithDistance) => void;
  style?: object;
}

export function SodaMap({
  locations,
  userCoords,
  selectedId,
  onSelectPin,
  style,
}: SodaMapProps): React.JSX.Element {
  const region = userCoords
    ? {
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    : undefined;

  return (
    <MapView
      provider={MAP_PROVIDER}
      style={[styles.map, style]}
      initialRegion={
        region ?? {
          latitude: 40.7608,
          longitude: -111.891,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }
      }
      region={region}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          coordinate={{ latitude: loc.lat, longitude: loc.lng }}
          onPress={() => onSelectPin(loc)}
          tracksViewChanges={false}
          anchor={{ x: 0.5, y: 1 }}
        >
          <SipPin score={loc.sip_score} selected={loc.id === selectedId} />
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
