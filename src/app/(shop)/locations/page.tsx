import type { Metadata } from 'next';
import Link from 'next/link';

import { canonical } from '@/app/utils/seo';
import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';

export const metadata: Metadata = {
  title: 'Tire Shop Locations | Miami & Orlando, FL | MrGoma Tires',
  description:
    'Find MrGoma Tires near you. 7 locations across Miami and Orlando, FL — Coral Gables, Hialeah, Airport, South, North, West Colonial, and Semoran. Walk-ins welcome.',
  alternates: { canonical: canonical('/locations') },
};

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0 text-[#9dfb40]" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}

const miamis = locationsConfig.filter(l => l.city === 'Miami');
const orlandos = locationsConfig.filter(l => l.city === 'Orlando');

export default function LocationsPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">

      {/* Hero */}
      <section className="relative border-b border-white/8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #9dfb40 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[#9dfb40] inline-block" />
            <span className="text-[#9dfb40] text-xs font-bold tracking-[0.2em] uppercase">Find us</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            Our Locations
            <br />
            <span className="text-[#9dfb40]">Miami & Orlando</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            7 tire shops across South Florida and Central Florida. Walk in at any location — no appointment needed.
          </p>
        </div>
      </section>

      {/* Miami + Orlando locations */}
      <div className="bg-[#111]">
        <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-10">
            <MapPinIcon />
            <h2 className="text-2xl font-black tracking-tight">Miami, FL</h2>
            <span className="text-gray-600 text-sm font-medium">{miamis.length} locations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 border border-white/8 rounded-2xl overflow-hidden mb-4">
            {miamis.map(loc => (
              <LocationCard key={loc.slug} loc={loc} />
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-20">
          <div className="flex items-center gap-4 mb-10">
            <MapPinIcon />
            <h2 className="text-2xl font-black tracking-tight">Orlando, FL</h2>
            <span className="text-gray-600 text-sm font-medium">{orlandos.length} locations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/8 border border-white/8 rounded-2xl overflow-hidden">
            {orlandos.map(loc => (
              <LocationCard key={loc.slug} loc={loc} />
            ))}
          </div>
        </section>
      </div>

      {/* Trust bar */}
      <section className="border-t border-white/8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 flex flex-wrap justify-center gap-x-12 gap-y-4">
          {['Walk-ins Welcome', 'ASE-Certified Technicians', '3,600+ Tires in Stock', '180-Day Warranty'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="text-[#9dfb40] text-xs">✦</span>
              <span className="text-white/70 font-medium text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

function LocationCard({ loc }: { loc: (typeof locationsConfig)[0] }) {
  return (
    <article className="bg-[#0a0a0a] p-6 flex flex-col gap-4 group hover:bg-white/[0.04] transition-colors duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-base text-white leading-tight">{loc.name}</h3>
        <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest shrink-0 mt-0.5">
          {loc.city}
        </span>
      </div>

      <p className="text-gray-500 text-sm leading-relaxed">{loc.address}</p>

      <div className="flex flex-wrap gap-1.5">
        {loc.neighborhoods.slice(0, 3).map(n => (
          <span key={n} className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">
            {n}
          </span>
        ))}
      </div>

      <a href={loc.tel}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#9dfb40] transition-colors w-fit">
        <PhoneIcon />
        {loc.phone}
      </a>

      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/6">
        <Link href={`/locations/${loc.slug}`}
          className="text-xs font-semibold text-[#9dfb40] hover:underline">
          View details →
        </Link>
        <a href={loc.mapLink} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-white transition-colors">
          Get directions
        </a>
      </div>
    </article>
  );
}
