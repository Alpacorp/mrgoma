import React, { FC } from 'react';

import Link from 'next/link';

import {
  InfoCardsSection,
  SearchContainer,
  ServicesGrid,
} from '@/app/ui/sections';
import { LocationsSlider } from '@/app/ui/sections/LocationsSlider/LocationsSlider';

const FEATURED_GUIDES = [
  {
    slug: 'how-to-buy-used-tires',
    title: 'How to Buy Used Tires: The Complete Guide',
    readTime: '7 min read',
    intro: 'Used tires can save you 30–70% compared to new, and when properly inspected they are just as safe.',
  },
  {
    slug: 'used-vs-new-tires',
    title: 'Used vs. New Tires: Which Should You Buy?',
    readTime: '6 min read',
    intro: 'The used-vs-new debate comes down to your budget, how many miles you drive, and what kind of driving you do.',
  },
  {
    slug: 'best-tires-for-uber-lyft-drivers',
    title: 'Best Tires for Uber and Lyft Drivers in Miami & Orlando',
    readTime: '6 min read',
    intro: 'Rideshare drivers in Florida go through tires twice as fast as average drivers — every dollar saved on tires goes to your pocket.',
  },
];

const STATS = [
  { n: '7', label: 'Locations in Miami & Orlando' },
  { n: '3,600+', label: 'Tires in stock' },
  { n: '180-day', label: 'Warranty on used tires' },
  { n: 'Free', label: 'Shipping on every order' },
];

const Home: FC = () => {
  return (
    <main className="bg-white">

      {/* ── Hero ── */}
      <section aria-labelledby="search-heading" className="px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          >
            <source src="/assets/images/banner-hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="relative">
          <SearchContainer />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-0 sm:divide-x sm:divide-white/10">
            {STATS.map(s => (
              <div key={s.n} className="text-center sm:px-8">
                <p className="text-4xl sm:text-5xl font-black text-[#9dfb40] leading-none">{s.n}</p>
                <p className="text-gray-400 text-sm mt-2 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <div id="services" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4">
          <p className="text-green-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">What we offer</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Our Services</h2>
        </div>
        <ServicesGrid />
      </div>

      {/* ── Why MrGoma ── */}
      <section id="about" className="bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
          <p className="text-[#9dfb40] text-xs font-bold tracking-[0.2em] uppercase mb-2">The MrGoma difference</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Why choose us</h2>
        </div>
        <InfoCardsSection className="bg-[#0a0a0a] pb-20" />
      </section>

      {/* ── Shop by Category ── */}
      <section className="bg-[#0a0a0a] border-t border-white/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#9dfb40] text-xs font-bold tracking-[0.2em] uppercase mb-2">Ready to shop?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Find your tire</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/tires/used"
              className="group relative rounded-2xl border border-amber-400/20 bg-amber-400/5 p-8 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all duration-200"
            >
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase block mb-3">Used Tires</span>
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">Quality Pre-Owned</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Inspected by ASE-certified techs. 180-day warranty included.</p>
              <span className="mt-6 inline-flex items-center text-amber-400 text-sm font-bold gap-1">Shop Used →</span>
            </Link>
            <Link
              href="/tires/new"
              className="group relative rounded-2xl border border-green-500/20 bg-green-500/5 p-8 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-200"
            >
              <span className="text-green-400 text-xs font-bold tracking-widest uppercase block mb-3">New Tires</span>
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-green-400 transition-colors">Brand New Stock</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Full manufacturer warranty. Free shipping nationwide.</p>
              <span className="mt-6 inline-flex items-center text-green-400 text-sm font-bold gap-1">Shop New →</span>
            </Link>
            <Link
              href="/tires"
              className="group relative rounded-2xl border border-[#9dfb40]/20 bg-[#9dfb40]/5 p-8 hover:border-[#9dfb40]/50 hover:bg-[#9dfb40]/10 transition-all duration-200"
            >
              <span className="text-[#9dfb40] text-xs font-bold tracking-widest uppercase block mb-3">All Tires</span>
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-[#9dfb40] transition-colors">Browse Catalog</h3>
              <p className="text-gray-500 text-sm leading-relaxed">3,600+ tires across 7 Miami & Orlando locations.</p>
              <span className="mt-6 inline-flex items-center text-[#9dfb40] text-sm font-bold gap-1">Browse All →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Guides ── */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-green-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">Learn & save</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">From our guides</h2>
            </div>
            <Link
              href="/guides"
              className="hidden sm:inline-flex items-center text-sm font-bold text-gray-400 hover:text-green-600 transition-colors"
            >
              All guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURED_GUIDES.map(guide => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group block rounded-xl border border-gray-200 p-6 hover:border-green-500 hover:shadow-md transition-all duration-200"
              >
                <p className="text-green-600 text-xs font-bold tracking-widest uppercase mb-3">{guide.readTime}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors leading-snug">{guide.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{guide.intro}</p>
                <span className="mt-4 inline-flex items-center text-green-600 text-sm font-bold">Read guide →</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/guides" className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">
              See all guides →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Locations ── */}
      <section id="locations" className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-2">
          <p className="text-green-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">Find us near you</p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Our Locations</h2>
        </div>
        <LocationsSlider />
      </section>

    </main>
  );
};

export default Home;
