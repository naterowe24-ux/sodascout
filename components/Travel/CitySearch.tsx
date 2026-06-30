import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants/theme';
import { searchCity } from '../../lib/maps';
import type { CitySuggestion } from '../../lib/maps';

interface CitySearchProps {
  onSelect: (suggestion: CitySuggestion) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function CitySearch({
  onSelect,
  autoFocus = false,
  placeholder = 'Search city…',
}: CitySearchProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string): Promise<void> => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setLoading(true);
    const results = await searchCity(q);
    setSuggestions(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { runSearch(query); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, runSearch]);

  function handleSelect(item: CitySuggestion): void {
    setQuery(item.name);
    setSuggestions([]);
    onSelect(item);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.grayLight}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {loading && <ActivityIndicator size="small" color={colors.teal} style={styles.spinner} />}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionName}>{item.name}</Text>
                <Text style={styles.suggestionDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
  spinner: {
    marginLeft: 4,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: 2,
  },
  suggestionName: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: '#1A1A1A',
  },
  suggestionDesc: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.grayMid,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grayLight,
    marginHorizontal: spacing.md,
  },
});
