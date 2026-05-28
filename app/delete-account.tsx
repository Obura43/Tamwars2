export default function DeleteAccount() {
  return (
    <main className="min-h-screen h-screen overflow-y-auto bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="space-y-3">
          <h1 className="text-4xl font-bold">
            Account & Data Deletion Policy
          </h1>

          <p className="text-slate-400">
            Last updated: May 28, 2026
          </p>

          <p className="text-slate-300 leading-7">
            This Account & Data Deletion Policy explains how users of
            TamWar may request deletion of their account, what
            information may be deleted, what information may be
            retained, and how deletion requests are processed.
          </p>

          <p className="text-slate-300 leading-7">
            TamWar respects user privacy and provides users with the
            ability to request deletion of their personal information
            associated with the platform, subject to certain legal,
            security, operational, and fraud-prevention obligations.
          </p>
        </div>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            1. How to Request Account Deletion
          </h2>

          <p className="text-slate-300 leading-7">
            Users may request deletion of their TamWar account and
            associated personal data at any time by contacting our
            support team through email.
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <p>
              <strong>Email Address:</strong>
            </p>

            <a
              href="mailto:tamwar@poll.co.ke"
              className="text-green-400 underline break-all"
            >
              tamwar@poll.co.ke
            </a>

            <p className="pt-3">
              <strong>Required Subject Line:</strong>
            </p>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 font-semibold">
              Delete My TamWar Account
            </div>
          </div>

          <p className="text-slate-300 leading-7">
            For security and identity verification purposes, users may
            be required to provide additional information before a
            deletion request can be processed.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            2. Information Required for Verification
          </h2>

          <p className="text-slate-300 leading-7">
            To help us verify ownership of the account and prevent
            unauthorized deletion requests, users should include the
            following information in their request:
          </p>

          <ul className="list-disc pl-6 space-y-3 text-slate-300">
            <li>Registered email address</li>
            <li>Username or display name</li>
            <li>Approximate date account was created (if known)</li>
            <li>County or region associated with the account (if applicable)</li>
            <li>
              A short confirmation clearly stating that the user wants
              the account permanently deleted
            </li>
          </ul>

          <p className="text-slate-300 leading-7">
            TamWar reserves the right to deny deletion requests that
            cannot be reasonably verified for security reasons.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            3. What Information Will Be Deleted
          </h2>

          <p className="text-slate-300 leading-7">
            Subject to applicable legal and operational requirements,
            deletion requests may result in removal of:
          </p>

          <ul className="list-disc pl-6 space-y-3 text-slate-300">
            <li>User account profile information</li>
            <li>Email address associated with the account</li>
            <li>Authentication records</li>
            <li>Gameplay-related personal activity</li>
            <li>Personal profile preferences</li>
            <li>User-generated profile metadata</li>
            <li>Associated identifiers linked to the account</li>
          </ul>

          <p className="text-slate-300 leading-7">
            Once deleted, certain information may no longer be
            recoverable.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            4. Information That May Be Retained
          </h2>

          <p className="text-slate-300 leading-7">
            Certain limited information may be retained after account
            deletion where necessary for legitimate business,
            operational, security, or legal purposes.
          </p>

          <p className="text-slate-300 leading-7">
            This may include:
          </p>

          <ul className="list-disc pl-6 space-y-3 text-slate-300">
            <li>Fraud prevention records</li>
            <li>Security monitoring information</li>
            <li>Abuse-prevention systems</li>
            <li>Legal compliance obligations</li>
            <li>Tax or regulatory obligations</li>
            <li>Backup and disaster recovery systems</li>
            <li>Anonymous or aggregated statistical records</li>
            <li>Leaderboard integrity and anti-cheat systems</li>
          </ul>

          <p className="text-slate-300 leading-7">
            Any retained information will only be kept for purposes
            reasonably necessary under applicable laws or operational
            requirements.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            5. Leaderboards and Public Rankings
          </h2>

          <p className="text-slate-300 leading-7">
            TamWar may maintain anonymous or non-identifiable gameplay
            statistics for operational, analytical, or historical
            purposes even after account deletion.
          </p>

          <p className="text-slate-300 leading-7">
            Where possible, personally identifiable information will be
            removed or anonymized from leaderboard systems after
            deletion processing is completed.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            6. Processing Time
          </h2>

          <p className="text-slate-300 leading-7">
            Most verified deletion requests are processed within 7 to
            30 business days.
          </p>

          <p className="text-slate-300 leading-7">
            Processing times may vary depending on:
          </p>

          <ul className="list-disc pl-6 space-y-3 text-slate-300">
            <li>Verification requirements</li>
            <li>System maintenance schedules</li>
            <li>Operational or legal obligations</li>
            <li>Technical limitations or backup systems</li>
          </ul>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            7. Revoking a Deletion Request
          </h2>

          <p className="text-slate-300 leading-7">
            Users may revoke a deletion request before processing has
            been completed by contacting support immediately.
          </p>

          <p className="text-slate-300 leading-7">
            Once deletion has been finalized, account recovery may not
            be possible.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            8. Security and Abuse Prevention
          </h2>

          <p className="text-slate-300 leading-7">
            TamWar reserves the right to investigate suspicious,
            fraudulent, abusive, or malicious activity associated with
            accounts before processing deletion requests.
          </p>

          <p className="text-slate-300 leading-7">
            Deletion requests submitted in connection with suspected
            abuse, fraud, platform manipulation, or illegal activity
            may be delayed, restricted, or denied where permitted by
            applicable law.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            9. Contact Information
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p>
              <strong>Support Email:</strong>
            </p>

            <a
              href="mailto:tamwar@poll.co.ke"
              className="text-green-400 underline break-all"
            >
              tamwar@poll.co.ke
            </a>

            <p className="pt-3">
              <strong>Website:</strong>
            </p>

            <a
              href="https://tamwar.poll.co.ke"
              className="text-green-400 underline break-all"
            >
              https://tamwar.poll.co.ke
            </a>
          </div>

          <p className="text-slate-300 leading-7">
            By using TamWar, users acknowledge that they have read and
            understood this Account & Data Deletion Policy.
          </p>
        </section>

      </div>
    </main>
  );
}

