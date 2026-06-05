import { ScrollView, Text, View } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111111' }}
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>
        Privacy Policy
      </Text>

      <Text style={{ color: '#aaaaaa', fontSize: 14, marginBottom: 24 }}>
        Last updated: June 2026
      </Text>

      <Section title="1. Introduction">
        TamWar is a simple entertainment and competition app where users choose a side, tap during
        gameplay, and appear on leaderboards. This Privacy Policy explains how TamWar collects,
        uses, stores, displays, and protects your information when you use our website, mobile app,
        or related services.
      </Section>

      <Section title="2. Contact Information">
        If you have questions about this Privacy Policy or your data, contact us at:
        {'\n\n'}
        Email: tamwar@poll.co.ke
      </Section>

      <Section title="3. Information We Collect">
        We may collect the following information:
        {'\n\n'}
        • Account information such as email address and username.
        {'\n'}
        • Profile information such as county, university, and selected side.
        {'\n'}
        • Gameplay information such as tap count, scores, selected side, session duration, and
        leaderboard ranking.
        {'\n'}
        • Authentication information used to create, verify, and secure your account.
        {'\n'}
        • Device and technical information such as browser type, app version, operating system,
        device type, and basic usage logs.
        {'\n'}
        • Support information when you contact us by email.
      </Section>

      <Section title="4. How We Use Your Information">
        We use your information to:
        {'\n\n'}
        • Create and manage your TamWar account.
        {'\n'}
        • Verify your email and protect your account.
        {'\n'}
        • Save your selected side, profile details, and gameplay results.
        {'\n'}
        • Display leaderboard rankings and side totals.
        {'\n'}
        • Detect suspicious activity, cheating, spam, or misuse.
        {'\n'}
        • Improve the app, fix bugs, and understand usage.
        {'\n'}
        • Respond to support requests.
        {'\n'}
        • Comply with legal, security, and platform requirements.
      </Section>

      <Section title="5. Public Information">
        Some information may be visible to other users, including:
        {'\n\n'}
        • Username
        {'\n'}
        • Selected side
        {'\n'}
        • County
        {'\n'}
        • Tap score
        {'\n'}
        • Leaderboard rank
        {'\n\n'}
        Do not use a username or profile detail that you do not want displayed publicly.
      </Section>

      <Section title="6. Leaderboards and Gameplay Data">
        TamWar uses gameplay data to calculate rankings, side totals, supporters, and scores.
        Leaderboard information may be displayed publicly inside the app or website. We may remove,
        hide, or adjust scores that appear suspicious, invalid, automated, or abusive.
      </Section>

      <Section title="7. Email and Authentication">
        TamWar may use your email address for account registration, login, verification, password
        reset, security alerts, and support. We do not sell your email address.
      </Section>

      <Section title="8. Cookies and Similar Technologies">
        Our website or hosting platforms may use cookies, local storage, or similar technologies to
        keep you logged in, remember preferences, improve performance, and measure usage. You can
        control cookies through your browser settings, but some features may not work properly if
        cookies are disabled.
      </Section>

      <Section title="9. Analytics and Performance">
        We may collect basic analytics and performance data to understand how users interact with
        TamWar, identify errors, improve loading speed, and enhance the user experience. Analytics
        data is generally used in aggregated form.
      </Section>

      <Section title="10. Advertising">
        TamWar may display advertisements in the future. Advertising partners may use cookies,
        device identifiers, or similar technologies to show ads, measure performance, and prevent
        fraud. Where required, we will request consent or provide controls for personalized ads.
      </Section>

      <Section title="11. Third-Party Services">
        TamWar may rely on third-party services for hosting, authentication, database storage,
        analytics, email delivery, app distribution, or advertising. These services may process data
        only as needed to provide their services to us.
      </Section>

      <Section title="12. Data Storage and Security">
        We take reasonable steps to protect your information from unauthorized access, loss, misuse,
        or alteration. However, no internet service is completely secure. You are responsible for
        keeping your login details safe.
      </Section>

      <Section title="13. Data Retention">
        We keep your information for as long as your account is active or as needed to provide the
        service, maintain leaderboards, resolve disputes, prevent abuse, comply with legal
        obligations, and improve the app.
      </Section>

      <Section title="14. Account Deletion">
        You may request deletion of your account by emailing:
        {'\n\n'}
        tamwar@poll.co.ke
        {'\n\n'}
        Use the subject line: Delete My TamWar Account.
        {'\n\n'}
        We may ask you to verify ownership of the account before deletion. After deletion, some
        information may remain where required for legal, security, backup, fraud prevention, or
        legitimate operational reasons.
      </Section>

      <Section title="15. Your Rights">
        Depending on your location, you may have rights to access, correct, delete, restrict, or
        object to certain processing of your personal information. To make a request, contact us at
        tamwar@poll.co.ke.
      </Section>

      <Section title="16. Children’s Privacy">
        TamWar is not intended for children under 13. We do not knowingly collect personal
        information from children under 13. If you believe a child has provided us with personal
        information, contact us so we can review and delete it where appropriate.
      </Section>

      <Section title="17. Acceptable Use and Abuse Prevention">
        We may monitor activity to prevent cheating, automated tapping, fake accounts, spam,
        harassment, manipulation of leaderboards, or other misuse. Accounts or scores that violate
        our rules may be suspended, removed, or restricted.
      </Section>

      <Section title="18. International Users">
        Your information may be processed or stored in countries outside your own. By using TamWar,
        you understand that data may be transferred and processed where our service providers
        operate.
      </Section>

      <Section title="19. Changes to This Privacy Policy">
        We may update this Privacy Policy from time to time. Updates will be posted on this page
        with a revised “Last updated” date. Continued use of TamWar after changes means you accept
        the updated policy.
      </Section>

      <Section title="20. Summary">
        TamWar collects only the information needed to run accounts, gameplay, side totals,
        supporters, security, and leaderboards. Public leaderboard data may be visible to other
        users. For any privacy request, contact tamwar@poll.co.ke.
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ color: '#dddddd', fontSize: 16, lineHeight: 24 }}>{children}</Text>
    </View>
  );
}