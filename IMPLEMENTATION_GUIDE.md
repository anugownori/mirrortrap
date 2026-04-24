# MirrorTrap: Psychology Implementation Guide

## Quick Start - How to Integrate Components

This guide shows you exactly where and how to use the new psychology components in your existing MirrorTrap application.

---

## 1. LANDING PAGE ENHANCEMENTS

### Add Social Proof Section

**File: `src/pages/LandingPage.tsx`**

```tsx
import { TrustedByLogos, SocialProofStats, CertificationBadges, TestimonialCarousel } from '@/components/SocialProof';

function LandingPage() {
  // After your hero section, add:
  return (
    <>
      {/* Existing Hero */}
      <HeroTerminal />
      
      {/* NEW: Social Proof Stats */}
      <section className="py-12">
        <SocialProofStats />
      </section>

      {/* NEW: Testimonials */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Trusted by Security Leaders</h2>
        <TestimonialCarousel />
      </section>

      {/* NEW: Certification Badges */}
      <section className="py-12 text-center">
        <h3 className="text-xl font-semibold mb-6">Security & Compliance</h3>
        <CertificationBadges />
      </section>

      {/* NEW: Company Logos */}
      <section className="py-12">
        <TrustedByLogos />
      </section>

      {/* Existing Pricing */}
      <PricingSection />
    </>
  );
}
```

### Add Urgency Banner

**File: `src/pages/LandingPage.tsx`**

```tsx
import { UrgencyBanner } from '@/components/UrgencyPsychology';

function LandingPage() {
  // Add at the top of the page (before hero):
  const urgencyNotification = {
    type: 'offer_ending' as const,
    message: 'Spring Sale: 50% off annual plans. Ends in 5 days.',
    urgency: 'high' as const,
    timeRemaining: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
    action: { label: 'Lock in Price', href: '/pricing' },
  };

  return (
    <>
      <UrgencyBanner notification={urgencyNotification} />
      {/* Rest of page */}
    </>
  );
}
```

---

## 2. DASHBOARD ENHANCEMENTS

### Add Dashboard Mode Toggle

**File: `src/pages/DashboardHome.tsx`**

```tsx
import { useState } from 'react';

type DashboardMode = 'beginner' | 'professional' | 'expert';

function DashboardHome() {
  const [mode, setMode] = useState<DashboardMode>('beginner');

  if (mode === 'beginner') {
    return (
      <div className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex gap-2">
          {(['beginner', 'professional', 'expert'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold',
                mode === m
                  ? 'bg-brand-purple text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* BEGINNER: One big insight + one CTA */}
        <div className="card p-8 border-brand-danger/40">
          <h2 className="text-3xl font-bold text-white mb-4">
            🚨 Biggest Threat: AWS Key Exposure
          </h2>
          <p className="text-slate-300 mb-6">
            Attackers could access your production S3 buckets in under 2 hours.
            Deploy a decoy now to catch them before it happens.
          </p>
          <a href="/protect" className="btn btn-lg btn-danger">
            Deploy Decoy Now
          </a>
        </div>

        {/* BEGINNER: Achievement progress */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-success transition-all"
              style={{ width: '60%' }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">3 of 5 quick wins completed</p>
        </div>
      </div>
    );
  }

  // For professional and expert modes, show existing dashboards
  return <ExistingDashboard />;
}
```

### Add Achievement Badge Showcase

**File: `src/pages/DashboardHome.tsx` (or new `/profile` page)**

```tsx
import { AchievementShowcase } from '@/components/AchievementSystem';

function ProfilePage() {
  const unlockedAchievements = ['first_scan', 'scan_master', 'pro_subscriber'];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Security Journey</h1>
      <AchievementShowcase unlockedIds={unlockedAchievements} />
    </div>
  );
}
```

### Add Urgency Countdown

**File: `src/pages/DashboardHome.tsx`**

```tsx
import { TrialCountdown, PeerComparisonWidget } from '@/components/UrgencyPsychology';

function DashboardHome() {
  // If user is on free trial:
  const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  return (
    <>
      {/* Trial countdown (if applicable) */}
      {isFreeTrialUser && (
        <TrialCountdown expiresAt={trialExpiresAt} />
      )}

      {/* Peer comparison */}
      <PeerComparisonWidget
        yourScore={42}
        averageScore={56}
        percentile={73}
      />
    </>
  );
}
```

---

## 3. ONBOARDING FLOW

### New User Onboarding (First Visit)

**File: `src/pages/OnboardingPage.tsx` (create new)**

```tsx
import { OnboardingCard, OnboardingChecklist } from '@/components/OnboardingPsychology';
import { useState } from 'react';

export function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('scan');
  const [completed, setCompleted] = useState<OnboardingStep[]>([]);

  const handleStepComplete = () => {
    setCompleted([...completed, step]);
    // Move to next step
    const steps: OnboardingStep[] = ['scan', 'results', 'decoy', 'celebrate', 'invite'];
    const nextIdx = steps.indexOf(step) + 1;
    if (nextIdx < steps.length) {
      setStep(steps[nextIdx]);
    } else {
      // All done - redirect to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 py-12">
      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Left: Progress */}
        <div>
          <OnboardingChecklist completed={completed} />
        </div>

        {/* Center: Current Step */}
        <div className="col-span-2">
          <OnboardingCard
            step={step}
            context={{
              currentStep: step,
              scanCompleted: completed.includes('scan'),
              threatsFound: 8,
              arsScore: 64,
              decoysDeployed: completed.filter(s => s === 'decoy').length,
            }}
          />
          <button
            onClick={handleStepComplete}
            className="mt-6 w-full btn btn-lg btn-primary"
          >
            {step === 'invite' ? 'Complete Onboarding' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Redirect New Users to Onboarding

**File: `src/components/DashboardShell.tsx` or `src/App.tsx`**

```tsx
import { useApp } from '@/lib/useApp';

function AppRouter() {
  const { user, isFirstLogin } = useApp();

  if (user && isFirstLogin) {
    return <Navigate to="/onboarding" />;
  }

  return <Dashboard />;
}
```

---

## 4. EMAIL INTEGRATION

### Set Up Email Service (Recommended: SendGrid + Supabase Functions)

**File: `supabase/functions/send-email/index.ts` (create new)**

```typescript
import { Resend } from "https://esm.sh/resend@2.0.0";
import { EMAIL_SEQUENCES } from "../../src/lib/emailSequences.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  const { event_type, user_email, user_id, context } = await req.json();

  // Map event to email sequence
  const emailSequences: Record<string, any> = EMAIL_SEQUENCES as any;

  const sequences = Object.values(emailSequences).flat() as any[];
  const emailConfig = sequences.find((e) => e.trigger === event_type);

  if (!emailConfig) {
    return new Response(JSON.stringify({ error: "No email for this event" }), {
      status: 404,
    });
  }

  // Personalize content
  let body = emailConfig.content
    .replace(/\[FirstName\]/g, context.firstName || "User")
    .replace(/\[SCORE\]/g, context.arsScore || "N/A")
    .replace(/\[COUNT\]/g, context.threatsFound || "0")
    .replace(/\[DOMAIN\]/g, context.domain || "your domain");

  // Send email
  const { data, error } = await resend.emails.send({
    from: "MirrorTrap <security@mirrortrap.app>",
    to: user_email,
    subject: emailConfig.subject,
    html: formatEmailHTML(body),
  });

  return new Response(JSON.stringify({ data, error }), {
    headers: { "Content-Type": "application/json" },
  });
});

function formatEmailHTML(content: string) {
  return `
    <html>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6;">
          ${content}
        </pre>
      </body>
    </html>
  `;
}
```

### Trigger Emails in Your App

**File: `src/lib/appContext.ts` or `src/hooks/useApp.ts`**

```typescript
async function triggerEmail(event: string, context: any) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
      },
      body: JSON.stringify({
        event_type: event,
        user_email: user.email,
        user_id: user.id,
        context,
      }),
    }
  );
  return response.json();
}

// Usage:
function onScanComplete(scanResult) {
  triggerEmail('scan_complete', {
    firstName: user.email.split('@')[0],
    arsScore: scanResult.ars_score,
    threatsFound: scanResult.findings.length,
    domain: scanResult.domain,
  });
}
```

---

## 5. ANALYTICS & TRACKING

### Create Psychology Metrics Dashboard

**File: `src/pages/AnalyticsPage.tsx` (for admins)**

```tsx
function PsychologyMetricsPage() {
  const metrics = {
    // Conversion metrics
    landing_to_trial: '14.2%',
    trial_to_paid: '8.7%',
    free_to_pro: '4.2%',
    
    // Engagement metrics
    onboarding_completion: '67%',
    feature_adoption_decoys: '73%',
    weekly_active_users: '62%',
    
    // Email metrics
    email_open_rate: '31.4%',
    email_ctr: '4.8%',
    trial_email_ctr: '12.1%',
    
    // Retention metrics
    day_7_retention: '58%',
    day_30_retention: '42%',
    day_90_retention: '31%',
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="card p-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            {key.replace(/_/g, ' ')}
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{value}</div>
        </div>
      ))}
    </div>
  );
}
```

### Track Events in Segment/Mixpanel

**File: `src/lib/analytics.ts` (create new)**

```typescript
import { AnalyticsClient } from 'https://esm.sh/segment@1.0.0';

export const analytics = new AnalyticsClient({
  writeKey: import.meta.env.VITE_SEGMENT_KEY,
});

// Track psychological events
export function trackPsychologyEvent(
  event: string,
  userId: string,
  properties: Record<string, any>
) {
  analytics.track({
    userId,
    event,
    properties: {
      timestamp: new Date(),
      ...properties,
    },
  });
}

// Usage:
function onAchievementUnlocked(achievementId: string) {
  trackPsychologyEvent('Achievement Unlocked', user.id, {
    achievement_id: achievementId,
    total_points: userPoints,
  });
}

function onUpgradeClicked() {
  trackPsychologyEvent('Upgrade CTA Clicked', user.id, {
    source: 'urgency_banner',
    context: 'trial_expiring',
  });
}
```

---

## 6. A/B TESTING SETUP

### Implement A/B Test Variants

**File: `src/hooks/useABTest.ts`**

```typescript
import { useApp } from '@/lib/useApp';

export function useABTest(testName: string) {
  const { user } = useApp();
  
  // Deterministic variant based on user ID
  const variant = user?.id?.charCodeAt(0) % 2 === 0 ? 'control' : 'variant_a';
  
  return { variant };
}
```

### Use in Components

```tsx
import { useABTest } from '@/hooks/useABTest';
import { AB_TEST_VARIANTS } from '@/lib/emailSequences';

function PricingCTA() {
  const { variant } = useABTest('cta_text');
  const ctaText = AB_TEST_VARIANTS.cta_text[variant as keyof typeof AB_TEST_VARIANTS.cta_text];

  return (
    <button className="btn btn-primary">
      {ctaText}
    </button>
  );
}
```

---

## 7. PSYCHOLOGY CHECKLIST

### Phase 1: Quick Wins (Week 1)
- [ ] Add social proof testimonials to landing page
- [ ] Add social proof stats cards
- [ ] Add urgency banner (pricing offer)
- [ ] Add achievement badges to profile
- [ ] Set up email trigger on signup

### Phase 2: Medium Lift (Week 2-3)
- [ ] Create onboarding flow with psychology steps
- [ ] Add dashboard mode toggle (beginner/pro/expert)
- [ ] Add trial countdown timer
- [ ] Add peer comparison widget
- [ ] Implement email sequences (SendGrid)

### Phase 3: Advanced (Week 4+)
- [ ] Set up full analytics tracking (Segment)
- [ ] Create admin analytics dashboard
- [ ] Implement A/B testing framework
- [ ] Create leaderboard system
- [ ] Add referral/affiliate program

---

## 8. COPY TEMPLATES (Copy-Paste Ready)

### Homepage Hero
```
"See yourself through a hacker's eyes."
[Subheading] "Attackers are mapping your infrastructure right now. 
Most find a way in within 2.4 hours. MirrorTrap finds it first."
```

### CTA Button (Primary)
```
"Get Started Free" / "Run Scan Now" / "Try Risk-Free"
```

### CTA Button (Urgency)
```
"Upgrade Now - Offer Expires in [N] Days"
```

### Email Subject (Urgency)
```
"🎯 Your domain scan is ready. [X] threats found."
OR
"⏰ Your trial expires in 2 days"
OR
"347 attacks caught this week. You could be next."
```

---

## 9. RESOURCES & TOOLS

**Email Service:**
- Resend (easiest, works with Supabase)
- SendGrid (enterprise)
- Mailgun (flexible API)

**Analytics:**
- Segment (unified events)
- Mixpanel (funnel analysis)
- Amplitude (behavioral analytics)

**A/B Testing:**
- LaunchDarkly (feature flags)
- Optimizely (experimentation)
- VWO (visual editor)

**Psychology Testing:**
- Use Google Forms for quick user feedback
- Conduct session recordings (Hotjar/Clarity)
- Run weekly user interviews

---

## 10. NEXT METRICS TO TRACK

```
Weekly Tracking Sheet:

CONVERSION:
- Landing page CTR: __%
- Trial signup rate: __%
- Free-to-paid conversion: __%

ENGAGEMENT:
- Onboarding completion: __%
- Decoy deployment rate: __%
- Avg. scans per user/month: __

RETENTION:
- Day 7 retention: __%
- Day 30 retention: __%
- Churn rate: __%

EMAIL:
- Open rate: __%
- Click rate: __%
- Unsubscribe rate: __%

USER SENTIMENT:
- NPS score: __
- Support tickets: __
- Feature requests: __
```

---

**End of Implementation Guide. Start with Phase 1 this week. Good luck!**
