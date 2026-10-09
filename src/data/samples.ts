import { SampleConversation } from '../types';

export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  {
    id: 'incident-outage',
    title: 'Prod Incident #409: Checkout Failure',
    tagline: 'High-urgency outage, rollback decision, root-cause tasks & deadlines',
    category: 'Urgent Ops',
    content: `[02:14 PM] Marcus Vance: @channel Urgent: checkout error rate just spiked to 24% after the v2.4.1 deployment!
[02:15 PM] Elena Rostova: Seeing massive 504 gateway timeouts on /api/v1/payments. Database connection pool is exhausted.
[02:16 PM] Marcus Vance: @sarah please check the database replication lag immediately. This is a P0 blocker for the Europe region.
[02:17 PM] Sarah Chen: On it. Lag is at 45 seconds, worker processes are stalling.
[02:18 PM] David Kim: We decided to rollback release v2.4.1 immediately to restore the checkout service.
[02:19 PM] Marcus Vance: Approved: proceed with the rollback now.
[02:20 PM] Sarah Chen: I will execute the rollback script and restart the celery workers by 2:30 PM.
[02:28 PM] Sarah Chen: Rollback complete. Error rate dropped back to 0.02%. Payments are processing cleanly.
[02:30 PM] David Kim: Great job team. Action item: @marcus needs to write the postmortem draft by tomorrow 10:00 AM.
[02:31 PM] Elena Rostova: I will investigate the SQL query migration issue and prepare a patch by EOD Friday.
[02:33 PM] Marcus Vance: Decision: we have agreed to freeze all production deployments until the database index fix is verified by QA.`,
  },
  {
    id: 'sprint-planning',
    title: 'Sprint 34: Mobile Auth & Performance',
    tagline: 'Scope trade-offs, architecture decisions, assigned action items',
    category: 'Sprint & Tech',
    content: `[10:00 AM] Priya Patel: Morning everyone! Let's lock in the deliverables for Sprint 34.
[10:02 AM] Jordan Lee: We need to finalize the mobile authentication migration. Should we keep SMS OTP or switch entirely to WebAuthn / Passkeys?
[10:04 AM] Priya Patel: SMS pricing in EU is skyrocketing. The consensus is to deprecate SMS and go with Passkeys as default.
[10:05 AM] Jordan Lee: Approved: let's go with Passkeys with email magic link fallback.
[10:07 AM] Alex Rivera: Action item: @jordan will update the mobile SDK auth spec by Thursday 5:00 PM.
[10:09 AM] Priya Patel: @alex can you review the Figma components for biometric prompt by tomorrow noon?
[10:10 AM] Alex Rivera: I will review the designs and leave comments before tomorrow 12:00 PM.
[10:12 AM] Maya Lin: What about the offline sync bug reported in ticket #882?
[10:13 AM] Priya Patel: That is critical for retail users. We decided to include ticket #882 in this sprint and push the CSV export feature to Sprint 35.
[10:15 AM] Jordan Lee: I will create the Jira subtasks and assign sprint story points before end of day.`,
  },
  {
    id: 'security-client-review',
    title: 'Enterprise SOC2 Compliance Audit',
    tagline: 'Audit evidence, data retention sign-off, external audit deadlines',
    category: 'Compliance & Legal',
    content: `[11:00 AM] Carlos Mendez: Team, the external auditor requested evidence for SOC2 Trust Services criteria.
[11:02 AM] Hannah Abbott: Have we updated our KMS key rotation policy document?
[11:04 AM] Carlos Mendez: Not yet. Action item: @hannah please upload the AWS KMS audit logs by Wednesday 3 PM.
[11:06 AM] Hannah Abbott: I will pull the CloudTrail exports and format the report by Wednesday afternoon.
[11:08 AM] Carlos Mendez: Decision: we decided to enforce 90-day automatic log archival to S3 Glacier cold storage.
[11:10 AM] Liam Gallagher: Approved: sign-off on the 90-day retention schedule from legal.
[11:12 AM] Liam Gallagher: Please make sure all S3 buckets have MFA delete enabled before Thursday morning.
[11:15 AM] Carlos Mendez: @liam I will verify the bucket policies and send confirmation to the auditors by EOD today.`,
  },
];
