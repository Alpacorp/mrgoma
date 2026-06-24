import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Link from 'next/link';

import { canonical } from '@/app/utils/seo';
import { servicesConfig } from '@/app/(shop)/services/servicesConfig';

export const metadata: Metadata = {
  title: 'Auto Services in Miami & Orlando | MrGoma Tires',
  description:
    'Professional tire and auto services at 7 locations in Miami and Orlando, FL. Tire mounting, wheel alignment, oil change, brake service, and more. ASE-certified technicians.',
  alternates: { canonical: canonical('/services') },
};

const iconMap: Record<string, ReactElement> = {
  tire: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  ),
  alignment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  oil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  brakes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  repair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  rotation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  nitrogen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  tpms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default function ServicesPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">

      {/* Hero */}
      <section className="relative border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#9dfb40 1px, transparent 1px), linear-gradient(90deg, #9dfb40 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[#9dfb40] inline-block" />
            <span className="text-[#9dfb40] text-xs font-bold tracking-[0.2em] uppercase">What we do</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            Auto Services
            <br />
            <span className="text-[#9dfb40]">Miami & Orlando</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            8 professional services at 7 locations — all performed by ASE-certified technicians
            with the tools and experience to get it right the first time.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-[#111]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesConfig.map((service, i) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group border border-white/8 rounded-2xl p-8 bg-[#0a0a0a] hover:border-[#9dfb40]/40 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-2xl" style={{ background: '#9dfb40' }} />
              <div className="text-[#9dfb40] shrink-0">
                {iconMap[service.icon] ?? iconMap.tire}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h2 className="text-lg font-bold text-white leading-tight group-hover:text-[#9dfb40] transition-colors duration-200">
                  {service.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">{service.shortDescription}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9dfb40] mt-auto">
                Learn more
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-white/8 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
          {['ASE-Certified Technicians', '7 Locations', '30-Day Warranty', 'No Appointment Needed'].map(item => (
            <div key={item} className="flex flex-col gap-1">
              <span className="text-[#9dfb40] font-bold text-sm">✦</span>
              <span className="text-white font-semibold text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
