import React from 'react';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Social Proof & Trust Psychology Components
 * Converts visitor hesitation into buyer confidence
 */

export interface Testimonial {
  author: string;
  role: string;
  company: string;
  avatar: string;
  text: string;
  metric: string;
  rating: number;
}

export interface CompanyLogo {
  name: string;
  logo: string;
  industry: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    author: 'Raj Patel',
    role: 'CISO',
    company: 'TechCorp India',
    avatar: '👨‍💼',
    text: 'MirrorTrap caught 3 real attacks in our honeypots before they touched production. Invaluable.',
    metric: 'Prevented 3 breaches',
    rating: 5,
  },
  {
    author: 'Priya Sharma',
    role: 'Security Lead',
    company: 'FinServe Global',
    avatar: '👩‍💼',
    text: 'Replaced our ₹50Cr SIEM with MirrorTrap. Same results, 10x cheaper. Our team loves it.',
    metric: '10x cost savings',
    rating: 5,
  },
  {
    author: 'Aditya Kapoor',
    role: 'Head of Security',
    company: 'E-Commerce Plus',
    avatar: '👨‍💻',
    text: 'The ARS score gave us instant visibility into our attack surface. We went from unknown to protected in days.',
    metric: 'Reduced mean-time-to-detect by 95%',
    rating: 5,
  },
];

const COMPANY_LOGOS: CompanyLogo[] = [
  { name: 'TechCorp', logo: '🏢', industry: 'Enterprise SaaS' },
  { name: 'FinServe', logo: '🏦', industry: 'Financial Services' },
  { name: 'HealthPlus', logo: '🏥', industry: 'Healthcare' },
  { name: 'RetailHub', logo: '🛒', industry: 'E-Commerce' },
  { name: 'CloudFirst', logo: '☁️', industry: 'Infrastructure' },
  { name: 'DataGuard', logo: '🔐', industry: 'Data Protection' },
];

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="card flex flex-col gap-4 p-6">
      {/* Rating */}
      <div className="flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-brand-amber text-brand-amber"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm text-slate-300 leading-relaxed">"{testimonial.text}"</p>

      {/* Metric */}
      <div className="flex items-center gap-2 rounded-lg bg-brand-purple/10 border border-brand-purple/30 px-3 py-2">
        <TrendingUp className="h-4 w-4 text-brand-purple" />
        <span className="text-xs font-semibold text-brand-purple">
          {testimonial.metric}
        </span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
        <div className="text-2xl">{testimonial.avatar}</div>
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm">{testimonial.author}</div>
          <div className="text-xs text-slate-400">
            {testimonial.role} at {testimonial.company}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialCarousel() {
  const [current, setCurrent] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);

  React.useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            <div className="flex gap-4">
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.author} className="w-full flex-shrink-0">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setAutoPlay(false);
              }}
              className={cn(
                'h-2 rounded-full transition-all',
                i === current ? 'w-6 bg-brand-purple' : 'w-2 bg-slate-600'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrustedByLogos() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Trusted by 500+ security teams
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-6 lg:grid-cols-6">
        {COMPANY_LOGOS.map((logo) => (
          <div
            key={logo.name}
            className="card flex flex-col items-center justify-center gap-2 p-4 hover:border-brand-purple/60 transition-colors"
          >
            <div className="text-3xl">{logo.logo}</div>
            <div className="text-xs text-slate-400 text-center">{logo.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SocialProofStats() {
  const stats = [
    { label: 'Threats Caught', value: '12,432', icon: '🎯' },
    { label: 'Breaches Prevented', value: '347', icon: '✅' },
    { label: 'Active Users', value: '4,892', icon: '👥' },
    { label: 'Avg. Response Time', value: '2.4s', icon: '⚡' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-4 text-center">
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-brand-purple">{stat.value}</div>
          <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export function CertificationBadges() {
  const certs = [
    { name: 'SOC2 Type II', icon: '🛡️' },
    { name: 'ISO 27001', icon: '✓' },
    { name: 'OWASP', icon: '🔒' },
    { name: 'GDPR Compliant', icon: '📋' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {certs.map((cert) => (
        <div
          key={cert.name}
          className="card inline-flex items-center gap-2 px-3 py-2 bg-brand-success/10 border-brand-success/30"
        >
          <span className="text-lg">{cert.icon}</span>
          <span className="text-xs font-semibold text-brand-success">{cert.name}</span>
        </div>
      ))}
    </div>
  );
}

export default TESTIMONIALS;
