import type { PromoContent } from '@/app/ui/sections/PromoBanner/PromoBanner';

/**
 * Central configuration of promotional banners per page.
 * Set `enabled` to true/false to quickly show or hide.
 * Optionally use startDate/endDate (ISO) for seasonal activation.
 */
export const promoBannerConfig: {
  home: PromoContent;
  searchResults: PromoContent;
} = {
  home: {
    enabled: true,
    title: 'New Stock Arriving Every Day!',
    description:
      "Can't find the tires you're looking for? Contact us. We are constantly processing new arrivals and can help you locate them immediately.",
    ctaLabel: 'Contact via WhatsApp',
    ctaHref:
      'https://wa.me/14073644016?text=Hi!%20I%20cant%20find%20my%20tires%20on%20the%20website.%20Could%20you%20help%20me%20check%20if%20you%20have%20my%20size%20in%20the%20new%20stock?',
    dismissible: true,
    bgColor: 'bg-zinc-900',
    textColor: 'text-white',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=100&w=2400', // Warehouse/tire stock image
    startDate: '2024-01-01',
    endDate: '2026-12-31',
  },
  searchResults: {
    enabled: true,
    title: 'Special Prices for Uber & Lyft Drivers',
    description:
      'Working on ride-share platforms? We have exclusive discounts and savings plans to keep your work tool always ready with the best tires.',
    ctaLabel: 'Check Discount',
    ctaHref:
      'https://wa.me/14073644016?text=Hi!%20Im%20an%20Uber/Lyft%20driver%20and%20I%20would%20like%20to%20know%20more%20about%20the%20special%20prices%20on%20tires.',
    dismissible: true,
    bgColor: 'bg-zinc-900',
    textColor: 'text-white',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=100&w=2400', // Tire on road or city image
    startDate: '2024-01-01',
    endDate: '2026-12-31',
  },
};
