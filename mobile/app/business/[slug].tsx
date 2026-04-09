import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

interface Business {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_name: string;
  category_icon: string;
  city: string;
  address: string | null;
  avg_rating: number;
  review_count: number;
  verified: number;
}

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/businesses/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Business not found');
        return r.json();
      })
      .then((data) => setBusiness(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (error || !business) {
    return <View style={styles.center}><Text style={styles.error}>{error ?? 'Not found'}</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.category}>{business.category_icon} {business.category_name}</Text>
      <Text style={styles.name}>{business.name}</Text>
      <Text style={styles.description}>{business.description}</Text>
      <Text style={styles.city}>📍 {business.city}{business.address ? ` — ${business.address}` : ''}</Text>

      {/* Reviews section — BONUS: implement ReviewList component here */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reseñas</Text>
        <View style={styles.reviewsPlaceholder}>
          <Text style={styles.placeholderText}>
            BONUS: Implementa la lista de reseñas aquí
          </Text>
          <Text style={styles.placeholderHint}>
            Crea un componente ReviewList que llame a{'\n'}
            GET /businesses/{'{slug}'}/reviews
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  category: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  city: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  reviewsSection: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  reviewsPlaceholder: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  placeholderText: { fontSize: 14, fontWeight: '500', color: '#9ca3af' },
  placeholderHint: { fontSize: 12, color: '#d1d5db', marginTop: 4, textAlign: 'center' },
  error: { color: '#dc2626' },
});
