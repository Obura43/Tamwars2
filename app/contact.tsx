import { ScrollView, Text, View, Pressable, Linking } from 'react-native';

export default function ContactPage() {
  const email = 'tamwar@poll.co.ke';

  const openEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111111' }}
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>
        Contact Us
      </Text>

      <Text style={{ color: '#aaaaaa', fontSize: 14, marginBottom: 24 }}>
        We'd love to hear from you.
      </Text>

      <Section title="Customer Support">
        If you experience issues with registration, login, email verification, gameplay,
        leaderboard rankings, account access, or any other TamWar feature, please contact our
        support team.
      </Section>

      <Section title="General Enquiries">
        For general questions, partnership opportunities, media enquiries, business proposals, or
        feedback about TamWar, please reach out using the contact details below.
      </Section>

      <Section title="Email Address">
        <Pressable onPress={openEmail}>
          <Text
            style={{
              color: '#22c55e',
              fontSize: 18,
              fontWeight: '600',
              textDecorationLine: 'underline',
            }}
          >
            {email}
          </Text>
        </Pressable>
      </Section>

      <Section title="Support Topics">
        We can assist with:
        {'\n\n'}
        • Account registration issues
        {'\n'}
        • Login and password reset problems
        {'\n'}
        • Email verification issues
        {'\n'}
        • Leaderboard disputes
        {'\n'}
        • Tap score verification
        {'\n'}
        • Account deletion requests
        {'\n'}
        • Bug reports
        {'\n'}
        • Feature suggestions
        {'\n'}
        • Advertising and partnership enquiries
      </Section>

      <Section title="Account Deletion Requests">
        To request account deletion, email:
        {'\n\n'}
        tamwar@poll.co.ke
        {'\n\n'}
        Subject:
        {'\n'}
        Delete My TamWar Account
        {'\n\n'}
        Include the email address associated with your TamWar account to help us verify ownership.
      </Section>

      <Section title="Response Time">
        We aim to respond to support enquiries within a reasonable timeframe. Response times may
        vary depending on the volume of requests received.
      </Section>

      <Section title="Community Feedback">
        TamWar is continuously improving. User feedback helps us improve gameplay, fairness,
        performance, security, and overall user experience.
      </Section>

      <View
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: '#1f1f1f',
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
          }}
        >
          Contact Email
        </Text>

        <Pressable onPress={openEmail}>
          <Text
            style={{
              color: '#22c55e',
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            tamwar@poll.co.ke
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: '#dddddd',
          fontSize: 16,
          lineHeight: 24,
        }}
      >
        {children}
      </Text>
    </View>
  );
}