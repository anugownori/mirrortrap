# MirrorTrap Psychology: Quick Reference Card

## 🎯 Psychology Principles & Where to Use Them

| Principle | Component | Where to Use | Expected Lift |
|-----------|-----------|--------------|----------------|
| **Gamification** | AchievementSystem | Dashboard, Profile | +40% session time |
| **Social Proof** | SocialProof | Landing page, Pricing | +30% conversion |
| **Loss Aversion** | UrgencyPsychology | Dashboard email | +50% urgency CTR |
| **Scarcity** | UrgencyPsychology | Limited offers | +60% CTA clicks |
| **Achievement** | OnboardingPsychology | First-time UX | +45% completion |
| **Habit Loop** | EmailSequences | Weekly emails | +70% engagement |

---

## 🚀 Import These Components

```tsx
// Achievement badges
import { AchievementShowcase, AchievementBadge } from '@/components/AchievementSystem';

// Social proof
import { 
  TestimonialCarousel, 
  TrustedByLogos, 
  SocialProofStats,
  CertificationBadges 
} from '@/components/SocialProof';

// Urgency & scarcity
import { 
  UrgencyBanner, 
  TrialCountdown, 
  LimitedTimeOffer,
  PeerComparisonWidget 
} from '@/components/UrgencyPsychology';

// Onboarding
import { 
  OnboardingCard, 
  OnboardingChecklist,
  OnboardingGradient 
} from '@/components/OnboardingPsychology';

// Emails
import { EMAIL_SEQUENCES, AB_TEST_VARIANTS } from '@/lib/emailSequences';
```

---

## 💻 One-Minute Integration

### Add to Landing Page
```tsx
<TrustedByLogos />
<SocialProofStats />
<CertificationBadges />
<TestimonialCarousel />
```

### Add to Dashboard
```tsx
<TrialCountdown expiresAt={trialDate} />
<PeerComparisonWidget yourScore={42} averageScore={56} percentile={73} />
<AchievementShowcase unlockedIds={['first_scan', 'scan_master']} />
```

### Add to Onboarding
```tsx
<OnboardingCard step="scan" context={onboardingContext} />
```

### Add to Emails
```tsx
const email = EMAIL_SEQUENCES.onboarding[0];
// Send welcome email with personalized content
```

---

## 📊 Key Metrics to Track

**Daily**:
- Email open rate
- CTA click rate
- Trial signup rate

**Weekly**:
- Landing → Trial: __% (target: 12%+)
- Trial → Paid: __% (target: 10%+)
- Onboarding completion: __% (target: 75%+)
- Feature adoption: __% (target: 70%+)

**Monthly**:
- MRR growth: __% (target: +25%)
- Churn rate: __% (target: -10%)
- NPS score: __ (target: 50+)

---

## ✉️ Email Subject Lines (Copy-Paste)

**Onboarding**:
- "See yourself through a hacker's eyes 👀"
- "[Social Proof] 347 attacks caught this week"
- "How much is your company's data worth?"

**Activation**:
- "🎯 Your domain scan is ready. Results inside."
- "One decoy = 347 attacks caught this month"
- "[Limit Expiring] Free scans reset in 2 days"

**Retention**:
- "Your weekly threat intelligence: [X] new risks"
- "🎉 New achievement unlocked: [BADGE_NAME]"

**Reengagement**:
- "Your threats are still out there 👀"
- "Try Pro free for 30 days. No strings."

---

## 🎨 Color Codes (Tailwind)

```
Urgency/High Priority:   brand-danger (red)
Caution/Medium:          brand-amber (orange)
Success/Achievement:     brand-success (green)
Primary Action:          brand-purple (purple)
Background:              slate-900, slate-950
```

---

## ⏱️ Implementation Timeline

**Day 1 (4 hours)**:
- Add social proof to landing page
- Add urgency banner to pricing
- Add achievement badges to dashboard

**Day 2 (4 hours)**:
- Create onboarding flow
- Set up email triggers
- Add trial countdown timer

**Day 3 (4 hours)**:
- Deploy to production (with feature flag)
- Monitor metrics
- Iterate based on data

---

## 🧠 Psychology Cheat Sheet

**When visitor HESITATES:**
→ Show social proof (logos, testimonials, certifications)

**When visitor DELAYS action:**
→ Show urgency (countdown timer, limited offer, peer ranking)

**When visitor QUITS after signup:**
→ Send email (value first, then ask)

**When visitor IS overwhelmed:**
→ Simplify view (beginner mode, one CTA per screen)

**When user PLATEAUS:**
→ Show achievement (badge, points, leaderboard rank)

---

## 🚨 Common Mistakes to Avoid

❌ Don't show ALL metrics at once (cognitive overload)  
❌ Don't fake testimonials (credibility killer)  
❌ Don't set timer to < 24 hours (perceived as scam)  
❌ Don't over-email (leads to unsubscribe)  
❌ Don't ignore mobile view (40%+ of traffic)  

---

## 📱 Mobile Checklist

- [ ] Buttons are 44px+ (thumb-sized)
- [ ] Text is readable at 12px+
- [ ] Images load fast (<100ms)
- [ ] Modals close on back button
- [ ] Forms work on keyboard

---

## 🔍 Testing Checklist

- [ ] Social proof section loads
- [ ] Achievement badge unlocks after scan
- [ ] Trial timer counts down
- [ ] Email sends on trigger
- [ ] Urgency banner dismisses
- [ ] Links work (no 404s)
- [ ] Analytics events fire
- [ ] Mobile responsive

---

## 💰 ROI Calculation

```
Current Baseline:
- Visitors/month: 10,000
- Trial conversion: 5% = 500 trials
- Paid conversion: 4% = 20 customers
- MRR: ₹20,000

After Psychology Changes:
- Visitors/month: 10,000 (same traffic)
- Trial conversion: 12% = 1,200 trials (+140%)
- Paid conversion: 10% = 120 customers (+500%)
- MRR: ₹120,000 (+500%)

Payback period: < 2 weeks
```

---

## 📞 Quick Help

**Components not importing?**
→ Check that files are in correct folder (`src/components/`)

**Styling broken?**
→ Make sure Tailwind is configured (it is in your project)

**Email not sending?**
→ Check Supabase Functions are deployed + API key set

**Metrics not tracking?**
→ Verify analytics event names match in code + dashboard

---

## 🎓 Learn More

- Behavioral psychology: "Thinking, Fast and Slow" by Daniel Kahneman
- Conversion psychology: "Neuromarketing" by Roger Dooley
- SaaS growth: "Traction" by Gabriel Weinberg
- Gamification: "Actionable Gamification" by Yu-kai Chou

---

## 📌 Pin This Somewhere

**The Psychology Equation for Growth:**

```
Traffic × Conversion Rate × PSYCHOLOGY = Revenue

You can't control traffic as much.
You can't always improve product.
But PSYCHOLOGY? You can systematically improve it by 50-100%.
```

**Do that. Watch MRR explode. 🚀**

---

**Last updated**: April 25, 2026  
**Live URL**: https://mirror-trap.vercel.app  
**Docs**: See PSYCHOLOGY_AUDIT.md + IMPLEMENTATION_GUIDE.md
