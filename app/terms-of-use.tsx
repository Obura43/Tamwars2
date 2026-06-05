import { ScrollView, Text, View } from 'react-native';

export default function TermsOfUse() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111111' }}
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
    >
      <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: 'bold', marginBottom: 8 }}>
        Terms of Use
      </Text>

      <Text style={{ color: '#aaaaaa', fontSize: 14, marginBottom: 24 }}>
        Last updated: June 2026
      </Text>

      <Section title="1. Agreement to Terms">
        By accessing or using TamWar, you agree to be bound by these Terms of Use. If you do not
        agree with these terms, you must not use the application, website, or related services.
      </Section>

      <Section title="2. About TamWar">
        TamWar is an entertainment platform where users select a side, participate in tapping
        challenges, compete on leaderboards, and view community statistics. TamWar is intended for
        entertainment purposes only and does not represent official political polling, election
        results, or government data.
      </Section>

      <Section title="3. Eligibility">
        To use TamWar, you must:
        {'\n\n'}
        • Be at least 13 years old.
        {'\n'}
        • Provide accurate registration information.
        {'\n'}
        • Use the platform in compliance with applicable laws.
        {'\n'}
        • Not be prohibited from using online services under applicable laws.
      </Section>

      <Section title="4. User Accounts">
        Users may be required to create an account to access certain features.
        {'\n\n'}
        You are responsible for:
        {'\n'}
        • Maintaining the confidentiality of your login credentials.
        {'\n'}
        • All activity that occurs under your account.
        {'\n'}
        • Providing accurate information during registration.
        {'\n'}
        • Promptly notifying us of unauthorized account access.
      </Section>

      <Section title="5. Usernames and Profiles">
        You may choose a username when creating your account.
        {'\n\n'}
        Usernames must not:
        {'\n'}
        • Impersonate another person.
        {'\n'}
        • Contain offensive, hateful, illegal, or abusive content.
        {'\n'}
        • Mislead other users.
        {'\n\n'}
        TamWar reserves the right to change, remove, or restrict usernames that violate these
        rules.
      </Section>

      <Section title="6. Gameplay Rules">
        Users may participate in gameplay activities such as tapping challenges and leaderboard
        competitions.
        {'\n\n'}
        Users must not:
        {'\n'}
        • Use automated software, bots, scripts, or macros.
        {'\n'}
        • Manipulate scores or gameplay data.
        {'\n'}
        • Exploit bugs or technical weaknesses.
        {'\n'}
        • Create fake accounts to gain an unfair advantage.
        {'\n'}
        • Interfere with other users' experience.
      </Section>

      <Section title="7. Leaderboards">
        TamWar may publish rankings, scores, supporter counts, and side statistics.
        {'\n\n'}
        We reserve the right to:
        {'\n'}
        • Validate gameplay sessions.
        {'\n'}
        • Remove suspicious scores.
        {'\n'}
        • Recalculate rankings.
        {'\n'}
        • Suspend accounts involved in abuse.
        {'\n'}
        • Reset leaderboards when necessary.
      </Section>

      <Section title="8. Acceptable Use">
        You agree not to:
        {'\n\n'}
        • Violate any law or regulation.
        {'\n'}
        • Harass, threaten, or abuse others.
        {'\n'}
        • Upload harmful code or malware.
        {'\n'}
        • Attempt unauthorized access to systems.
        {'\n'}
        • Disrupt platform operations.
        {'\n'}
        • Use TamWar for fraudulent activities.
      </Section>

      <Section title="9. Intellectual Property">
        The TamWar name, branding, logos, designs, software, content, leaderboards, and related
        materials are owned by TamWar or its licensors.
        {'\n\n'}
        Users may not:
        {'\n'}
        • Copy the application.
        {'\n'}
        • Reverse engineer the software.
        {'\n'}
        • Redistribute platform assets without permission.
        {'\n'}
        • Use TamWar trademarks without authorization.
      </Section>

      <Section title="10. User Content">
        If TamWar allows users to submit content, comments, usernames, or profile information, you
        retain ownership of your content.
        {'\n\n'}
        However, you grant TamWar a non-exclusive license to display, process, and distribute such
        content as necessary to operate the platform.
      </Section>

      <Section title="11. Account Suspension and Termination">
        TamWar may suspend, restrict, or permanently terminate accounts that:
        {'\n\n'}
        • Violate these Terms.
        {'\n'}
        • Engage in cheating or automation.
        {'\n'}
        • Attempt to manipulate leaderboards.
        {'\n'}
        • Harm other users or the platform.
        {'\n'}
        • Engage in fraudulent activities.
      </Section>

      <Section title="12. Privacy">
        Your use of TamWar is also governed by our Privacy Policy. By using TamWar, you acknowledge
        that your information may be collected and processed as described in the Privacy Policy.
      </Section>

      <Section title="13. Availability of Service">
        TamWar is provided on an "as available" basis.
        {'\n\n'}
        We do not guarantee:
        {'\n'}
        • Continuous availability.
        {'\n'}
        • Error-free operation.
        {'\n'}
        • Uninterrupted access.
        {'\n'}
        • Compatibility with every device.
      </Section>

      <Section title="14. Disclaimer">
        TamWar is an entertainment platform.
        {'\n\n'}
        Side totals, supporter counts, rankings, and gameplay statistics are generated from user
        activity and should not be interpreted as official political polling, election forecasts,
        endorsements, or factual measurements of public opinion.
      </Section>

      <Section title="15. Limitation of Liability">
        To the maximum extent permitted by law, TamWar, its owners, operators, affiliates,
        employees, and partners shall not be liable for:
        {'\n\n'}
        • Lost profits.
        {'\n'}
        • Data loss.
        {'\n'}
        • Business interruption.
        {'\n'}
        • Indirect or consequential damages.
        {'\n'}
        • Damages arising from use of the platform.
      </Section>

      <Section title="16. Indemnification">
        You agree to defend, indemnify, and hold harmless TamWar from claims, liabilities, damages,
        costs, and expenses resulting from:
        {'\n\n'}
        • Your use of the platform.
        {'\n'}
        • Your violation of these Terms.
        {'\n'}
        • Your violation of any law or third-party rights.
      </Section>

      <Section title="17. Changes to the Service">
        We reserve the right to modify, suspend, discontinue, or replace any feature of TamWar at
        any time without prior notice.
      </Section>

      <Section title="18. Changes to These Terms">
        We may update these Terms periodically. Updated versions become effective upon publication.
        Continued use of TamWar constitutes acceptance of revised Terms.
      </Section>

      <Section title="19. Governing Law">
        These Terms shall be governed and interpreted in accordance with applicable laws without
        regard to conflict-of-law principles.
      </Section>

      <Section title="20. Contact Information">
        For questions regarding these Terms of Use, contact:
        {'\n\n'}
        tamwar@poll.co.ke
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
      <Text style={{ color: '#dddddd', fontSize: 16, lineHeight: 24 }}>
        {children}
      </Text>
    </View>
  );
}