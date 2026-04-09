import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

interface Business {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_name: string;
  category_icon: string;
  city: string;
  avg_rating: number;
  review_count: number;
  verified: number;
}

export default function BusinessListScreen() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/businesses`)
      .then((r) => r.json())
      .then((data) => setBusinesses(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.hint}>¿Está corriendo el worker? pnpm dev:worker</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={businesses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/business/${item.slug}`)}
        >
          <Text style={styles.category}>
            {item.category_icon} {item.category_name}
          </Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.city}>📍 {item.city}</Text>
            {item.review_count > 0 && (
              <Text style={styles.rating}>
                ★ {item.avg_rating.toFixed(1)} ({item.review_count})
              </Text>
            )}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  category: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  description: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  city: { fontSize: 12, color: '#9ca3af' },
  rating: { fontSize: 12, color: '#d97706', fontWeight: '500' },
  errorText: { color: '#dc2626', marginBottom: 8 },
  hint: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
