/**
 * Behavioral Email Sequences for MirrorTrap
 * Psychological triggers for engagement, retention, and upsell
 * 
 * These templates implement:
 * - Loss aversion (threats expiring, undetected risks)
 * - Achievement psychology (milestones, streaks)
 * - Social proof (peer benchmarking)
 * - FOMO (time-limited offers, exclusivity)
 * - Reciprocity (value given before ask)
 */

export const EMAIL_SEQUENCES = {
  // ===== ONBOARDING SEQUENCE (triggered after signup)
  onboarding: [
    {
      name: 'Welcome - Day 0',
      subject: 'See yourself through a hacker\'s eyes 👀',
      trigger: 'signup_complete',
      delay: '0 minutes',
      template: 'welcome',
      psychology: 'Loss aversion + Achievement hook',
      content: `
        Hi [FirstName],

        In the next 2.4 hours, attackers could be mapping your company's vulnerabilities.
        
        Your first scan takes 90 seconds. Let me show you what they already know:
        - Leaked credentials (HaveIBeenPwned)
        - Exposed services (Shodan)
        - DNS records (subdomains, tech stack)
        - GitHub leaks (code snippets with secrets)
        - SSL certificates (infrastructure mapping)

        One click. One score. Everything changes.

        [START FREE SCAN] ← Your unique link expires in 24h

        —
        P.S. If you scan today, you unlock the "Scout" achievement. 
        First of 8 badges. Collectors report 40% higher threat detection. 🎯
      `,
    },
    {
      name: 'Social Proof - Day 1',
      subject: '[Social Proof] 347 attacks caught this week',
      trigger: 'after_welcome_delay_24h',
      delay: '24 hours',
      template: 'social_proof',
      psychology: 'Social proof + FOMO',
      content: `
        Hi [FirstName],

        This week, MirrorTrap users caught 347 real attacks before they caused damage.

        Here's what happened:
        ✓ 47 IP addresses tried AWS credential theft
        ✓ 123 SQL injection attempts on admin portals
        ✓ 89 credential stuffing attacks on web apps
        ✓ 88 reconnaissance scans (early-stage attacks)

        Your company could be next. Or you could catch them first.

        [RUN YOUR SCAN NOW]

        Still unsure? Book a 5-min security call with our team:
        [SCHEDULE CALL]

        —
        P.S. Free users who complete a scan in the first 48h see 3x more value.
      `,
    },
    {
      name: 'Risk Quantification - Day 2',
      subject: 'How much is your company\'s data worth?',
      trigger: 'after_social_proof_delay_48h',
      delay: '48 hours',
      template: 'risk_quantification',
      psychology: 'Loss aversion + Economic incentive',
      content: `
        Hi [FirstName],

        A typical data breach costs:
        - ₹50-500 Crores in direct losses
        - 6-18 months of remediation
        - Permanent brand damage (80% customer trust loss)
        - Regulatory fines (up to 4% of revenue)

        For a company your size, that's potentially ₹[CALCULATED_RISK] at stake.

        MirrorTrap costs ₹999/month. The ROI math is simple:
        Preventing ONE breach = [X] years of MirrorTrap subscriptions.

        Before you leave this email:
        [GET YOUR RISK ASSESSMENT] (2 min quiz)

        You'll see:
        ✓ Your threat surface vs. your industry peers
        ✓ Estimated cost of inaction
        ✓ How long you're typically exposed before detection
        ✓ Your specific high-risk vectors

        —
        P.S. 73% of companies have active threats RIGHT NOW and don't know it.
      `,
    },
  ],

  // ===== ACTIVATION SEQUENCE (after first scan)
  activation: [
    {
      name: 'Results Delivered - Immediate',
      subject: '🎯 Your domain scan is ready. Results inside.',
      trigger: 'scan_complete',
      delay: 'immediate',
      template: 'scan_results',
      psychology: 'Achievement unlock + Threat visualization',
      content: `
        Hi [FirstName],

        Your scan is complete. Here's what we found:

        ARS SCORE: [SCORE]/100 ([THREAT_LEVEL])
        Estimated time to exploit: [TIME_TO_EXPLOIT]

        THREATS:
        ✓ [COUNT] leaked emails (HaveIBeenPwned)
        ✓ [COUNT] exposed services (Shodan)
        ✓ [COUNT] subdomains enumerated (crt.sh)
        ✓ [COUNT] code commits with secrets (GitHub)
        ✓ Tech stack identified: [TECH_STACK]

        ACHIEVEMENT UNLOCKED: "Scout" 🏅 (+10 pts)
        [View Full Report] → [VIEW DASHBOARD]

        Next: Deploy your first decoy. Catch attacks before they cause damage.
        [DEPLOY DECOY]

        —
        P.S. Pro users who deploy decoys catch 40% more attacks. One click now = real alerts later.
      `,
    },
    {
      name: 'Decoy Deployment - Day 1',
      subject: 'One decoy = 347 attacks caught this month',
      trigger: 'scan_complete_delay_24h',
      delay: '24 hours',
      template: 'decoy_deploy',
      psychology: 'Sense of control + Social proof',
      content: `
        Hi [FirstName],

        You found threats in your first scan. Now catch the attackers.

        The MirrorTrap difference: We don't wait for them to succeed. We trap them first.

        Deploy a PhantomShield decoy. Pick one:

        🔑 Fake AWS Key
           └─ The #1 target for attackers. 2.4s notification when used.

        🔐 Admin Portal
           └─ SQL injection honeypot. See every failed login attempt.

        🔗 Tracking URL
           └─ Know who clicks. Get IP, browser, location, OS.

        📋 S3 Bucket Listing
           └─ Fake data. Real alerts. Catches reconnaissance scans.

        [DEPLOY YOUR FIRST DECOY]

        This takes 30 seconds. When an attacker touches it, you'll know instantly.

        —
        P.S. Users with 4+ decoys deployed catch 89% of attacks before damage occurs.
      `,
    },
    {
      name: 'Upgrade Trigger - Day 3',
      subject: '[Limit Expiring] Free scans reset in 2 days',
      trigger: 'free_tier_limit_warning',
      delay: '72 hours',
      template: 'upgrade_nudge',
      psychology: 'Scarcity + Loss aversion',
      content: `
        Hi [FirstName],

        You've used your 1 free scan this month. Here's what you discovered:

        ✓ [COUNT] real threats in your infrastructure
        ✓ [COUNT] attackers can map your surface in [TIME]
        ✓ Potential exposure: [RISK_AMOUNT]

        With Pro (₹999/month), you get:
        ✓ Unlimited scans (run weekly/daily)
        ✓ Real-time alerts (when threats evolve)
        ✓ All 4 decoys deployed
        ✓ Executive reports (insurance-ready)
        ✓ Team SSO (everyone protected)

        Your next scan resets in 2 days. Lock in Pro pricing TODAY and:
        ✓ Run scans right now (don't wait for reset)
        ✓ Get this month FREE (when you lock in before [DATE])
        ✓ Catch threats before competitors discover them

        [UPGRADE TO PRO NOW] ← Limited time offer

        —
        P.S. Scan weekly to catch threats as they emerge. Most attackers take 2-3 weeks to exploit.
      `,
    },
  ],

  // ===== RETENTION SEQUENCE (weekly engagement loops)
  retention: [
    {
      name: 'Weekly Digest - Every Monday',
      subject: 'Your weekly threat intelligence: [FINDINGS] new risks',
      trigger: 'weekly_digest',
      delay: 'every Monday 9 AM',
      template: 'weekly_digest',
      psychology: 'Habit formation + Achievement + Peer comparison',
      content: `
        Hi [FirstName],

        This week in threat intelligence:

        📊 YOUR STATS:
        ├─ Scans run: [N]
        ├─ New threats found: [N]
        ├─ Decoy alerts: [N] (catching real attacks!)
        └─ ARS Score trend: ↓ [X]% (improving!)

        🏆 PEER BENCHMARK:
        ├─ You: [YOUR_PERCENTILE]th percentile (top [X]%)
        ├─ Industry avg: [SCORE]
        └─ You're [STATUS] than average

        🎯 TOP FINDING THIS WEEK:
        [DESCRIPTION] (Risk level: [HIGH/MEDIUM/LOW])
        → Quick fix: [REMEDIATION]
        → Estimated time: [TIME]

        🔐 ATTACK SIMULATION:
        We simulated an attack using your findings. Result: [CAUGHT_IN_X_SECONDS]
        Real attackers average [Y_SECONDS]. You're [BETTER/WORSE].

        [VIEW FULL REPORT]

        —
        P.S. Teams that run weekly scans prevent 3x more breaches. Start your next scan:
        [RUN SCAN NOW]
      `,
    },
    {
      name: 'Achievement Recognition - Monthly',
      subject: '🎉 New achievement unlocked: [BADGE_NAME]',
      trigger: 'achievement_unlocked',
      delay: 'on achievement',
      template: 'achievement',
      psychology: 'Gamification + Pride',
      content: `
        Hi [FirstName],

        Congratulations! You've unlocked:

        🏅 [BADGE_NAME]
        [BADGE_DESCRIPTION]

        Progress:
        ├─ Your total points: [POINTS]
        ├─ Next badge: [NEXT_BADGE] ([X] pts needed)
        └─ Team rank: [RANK] of [TOTAL_USERS]

        ELITE TIER (top 10%):
        ├─ 8/8 badges unlocked: [NAMES]
        ├─ Avg. threats caught: 342
        └─ Avg. response time: 2.1 seconds

        You're [X] points away from elite status. 

        [SEE LEADERBOARD]

        —
        P.S. Leaderboard reset this Sunday. You could be #1 this month.
      `,
    },
  ],

  // ===== REENGAGEMENT SEQUENCE (inactive users)
  reengagement: [
    {
      name: 'Win-Back - Day 7 (inactive)',
      subject: 'Your threats are still out there 👀',
      trigger: 'inactive_7_days',
      delay: '7 days after last activity',
      template: 'winback',
      psychology: 'Loss aversion + FOMO + Guilt reversal',
      content: `
        Hi [FirstName],

        It's been a week since your last scan. Here's what attackers are doing in that time:

        ⚠️ IN 7 DAYS:
        - 142 new credential leaks (from your domain)
        - 28 new Shodan services discovered
        - 12 new subdomains registered (possibly fake yours)
        - 4 GitHub repos with suspicious commits

        Your company is MORE exposed now than before.

        One 2-minute scan reveals everything. Then take one action (deploy a decoy, run remediation).

        [RUN QUICK SCAN]

        Come back this week. Win back your "Daily Vigilant" streak.
        [CHECK YOUR PROGRESS]

        —
        P.S. Users who scan weekly prevent 89% of successful breaches. Monthly? Only 34%.
      `,
    },
    {
      name: 'Premium Offer - Day 14 (inactive)',
      subject: 'Try Pro free for 30 days. No strings.',
      trigger: 'inactive_14_days',
      delay: '14 days after last activity',
      template: 'premium_trial',
      psychology: 'Risk reversal + Aspiration',
      content: `
        Hi [FirstName],

        You discovered [N] threats. Then... silence.

        We get it. Life's busy. But those threats? They're still there.

        Here's the deal:
        ✓ 30-day Pro trial. Free. No credit card.
        ✓ Run unlimited scans (instead of 1/month)
        ✓ Real-time alerts (sleep better at night)
        ✓ Deploy all 4 decoys (catch everything)
        ✓ If you don't catch a real attack in 30 days, full refund.

        [START 30-DAY FREE TRIAL]

        In 30 days, you'll either:
        1) Catch an attack (thank me later)
        2) Sleep better knowing you tried
        3) Cancel with $0 obligation

        What's to lose?

        —
        P.S. 73% of trial users convert because they catch real attacks. Will you?
      `,
    },
  ],

  // ===== EXPANSION SEQUENCE (upsell to higher tiers)
  expansion: [
    {
      name: 'Team Expansion - After 30 days Pro',
      subject: 'Your team needs to see this',
      trigger: 'pro_30_days_active',
      delay: '30 days after Pro signup',
      template: 'team_upsell',
      psychology: 'Social proof + Team efficacy + Shared responsibility',
      content: `
        Hi [FirstName],

        You've caught [N] threats in 30 days. Impressive.

        But here's the problem: You're the only one watching.

        Add your team:
        ├─ Security team: Shared alerting + collaboration
        ├─ DevOps: Automated remediation hooks
        ├─ C-suite: Executive dashboards + insurance compliance
        └─ Everyone: Real-time visibility into their own risks

        When your team sees the threats YOU found, they stop taking risks. That's culture change.

        [INVITE TEAM MEMBERS]
        (SSO available for Enterprise)

        Team users who convert to Pro spend 2.5x more time in the app.
        Team users report 3x fewer successful attacks.

        Ready to scale?

        —
        P.S. Invite 5 team members by [DATE] and unlock the "Team Lead" badge + 20% discount on next renewal.
      `,
    },
    {
      name: 'Enterprise Positioning - After 90 days Pro',
      subject: 'You\'re ready for Enterprise',
      trigger: 'pro_90_days_active',
      delay: '90 days after Pro signup',
      template: 'enterprise_upsell',
      psychology: 'Aspiration + Exclusivity + Status',
      content: `
        Hi [FirstName],

        You've been using MirrorTrap for 90 days. You've:
        ✓ Caught [N] real attacks
        ✓ Deployed [N] decoys
        ✓ Run [N] scans
        ✓ Prevented ₹[X] in potential losses

        You've outgrown Pro. It's time for Enterprise.

        ENTERPRISE UNLOCKS:
        ├─ Custom decoy engineering (your unique honeypots)
        ├─ Unlimited team members + SSO
        ├─ Incident response integrations (Slack, Jira, PagerDuty)
        ├─ Dedicated security analyst (on-call for you)
        ├─ Legal compliance (SOC2, HIPAA, GDPR reporting)
        ├─ API access + webhooks (full automation)
        └─ Custom SLAs + support

        Ready to talk?

        [SCHEDULE ENTERPRISE DEMO]
        (30 min, no pressure. We show you the unreleased features.)

        Enterprise customers average:
        - 89% faster threat response
        - 3.2x higher attack detection
        - Zero successful breaches in year 1

        Let's make you one of them.

        —
        P.S. First 10 Enterprise customers get lifetime 20% discount. Deadline: [DATE].
      `,
    },
  ],
};

/**
 * Personalization Variables (to inject into templates)
 */
export const PERSONALIZATION_VARIABLES = {
  firstName: '[FirstName]',
  domain: '[DOMAIN]',
  arsScore: '[SCORE]',
  threatsFound: '[COUNT]',
  decoyAlerts: '[N]',
  timeToExploit: '[TIME_TO_EXPLOIT]',
  peerPercentile: '[PERCENTILE]',
  riskAmount: '[RISK_AMOUNT]',
  estimatedBreach Cost: '[COST]',
  nextBadge: '[NEXT_BADGE]',
  pointsUntilNext: '[X]',
};

/**
 * A/B Testing Variants
 */
export const AB_TEST_VARIANTS = {
  subject_lines: {
    control: 'Your domain scan is ready.',
    variant_a: '🎯 [X] threats found in your scan',
    variant_b: '[X]% of your surface is exposed',
  },
  cta_text: {
    control: 'View Results',
    variant_a: 'See What Attackers Found',
    variant_b: 'Protect Yourself Now',
  },
  urgency_messaging: {
    control: 'Run your next scan',
    variant_a: 'Your scan expires in 24 hours',
    variant_b: 'Attackers are mapping you RIGHT NOW',
  },
};

export default EMAIL_SEQUENCES;
