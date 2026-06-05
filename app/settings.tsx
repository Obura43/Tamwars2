import { ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function SettingsPage() {
  const items = [
    { title: 'Privacy Policy', route: '/privacy-policy' },
    { title: 'Terms of Use', route: '/terms-of-use' },
    { title: 'Contact Support', route: '/contact' },
    { title: 'Account Deletion', route: '/account-deletion' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111111' }}
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold', marginBottom: 24 }}>
        Settings
      </Text>

      {items.map((item) => (
        <Pressable
          key={item.route}
          onPress={() => router.push(item.route as any)}
          style={{
            backgroundColor: '#1f1f1f',
            padding: 18,
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '600' }}>
            {item.title}
          </Text>
        </Pressable>
      ))}

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: '#777777', fontSize: 14 }}>
          TamWar © 2026
        </Text>
      </View>
    </ScrollView>
  );
}