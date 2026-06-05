import { ScrollView, Text, View, Pressable, Linking } from 'react-native';

export default function AccountDeletionPage() {
  const email = 'tamwar@poll.co.ke';

  const requestDeletion = () => {
    Linking.openURL(
      `mailto:${email}?subject=Delete My TamWar Account`
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111111' }}
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>
        Account Deletion
      </Text>

      <Text style={{ color: '#aaaaaa', fontSize: 14, marginBottom: 24 }}>
        Request deletion of your TamWar account and associated data.
      </Text>

      <Section title="How to Delete Your Account">
        If you would like to permanently delete your TamWar account, please send an email request
        to our support team using the email address associated with your TamWar account.
      </Section>

      <Section title="Deletion Request Email">
        Send your request to:
        {'\n\n'}
        tamwar@poll.co.ke
        {'\n\n'}
        Subject:
        {'\n'}
        Delete My TamWar Account
      </Section>

      <Section title="Information to Include">
        To help us verify ownership of the account, please include:
        {'\n\n'}
        • Your TamWar username
        {'\n'}
        • The email address used to register
        {'\n'}
        • A clear request to delete the account
      </Section>

      <Section title="What Will Be Deleted">
        Upon successful verification and processing, we may delete:
        {'\n\n'}
        • Your account profile
        {'\n'}
        • Username and profile information
        {'\n'}
        • Gameplay history
        {'\n'}
        • Tap session records
        {'\n'}
        • Supporter records
        {'\n'}
        • Associated account data stored by TamWar
      </Section>

      <Section title="Data That May Be Retained">
        Certain information may be retained where reasonably necessary for:
        {'\n\n'}
        • Fraud prevention
        {'\n'}
        • Security investigations
        {'\n'}
        • Legal compliance
        {'\n'}
        • Backup and disaster recovery processes
        {'\n'}
        • Resolving disputes or enforcing platform rules
      </Section>

      <Section title="Processing Time">
        Account deletion requests are typically processed within a reasonable period after identity
        verification. Processing times may vary depending on request volume and operational
        requirements.
      </Section>

      <Section title="Effect of Deletion">
        Once your account is deleted:
        {'\n\n'}
        • You may lose access to your account permanently.
        {'\n'}
        • Your gameplay history may no longer be available.
        {'\n'}
        • You may need to create a new account if you wish to use TamWar again.
      </Section>

      <Section title="Need Help?">
        If you have questions regarding account deletion or your personal data, please contact:
        {'\n\n'}
        tamwar@poll.co.ke
      </Section>

      <Pressable
        onPress={requestDeletion}
        style={{
          backgroundColor: '#dc2626',
          paddingVertical: 16,
          borderRadius: 12,
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          Request Account Deletion
        </Text>
      </Pressable>
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