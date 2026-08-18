import type { PromoContent } from '@/app/ui/sections/PromoBanner/PromoBanner';
import { whatsAppLink } from '@/app/utils/whatsapp';

/**
 * Central configuration of promotional banners per page.
 * Set `enabled` to true/false to quickly show or hide.
 * Optionally, use startDate/endDate (ISO) for seasonal activation.
 */
export const promoBannerConfig: {
  home: PromoContent;
  searchResults: PromoContent;
  stockArrival: PromoContent;
} = {
  home: {
    enabled: true,
    title: 'New Stock Arriving Every Day!',
    description:
      "Can't find the tires you're looking for? Contact us. We are constantly processing new arrivals and can help you locate them immediately.",
    ctaLabel: 'Contact via WhatsApp',
    ctaHref: whatsAppLink(
      "Hi! I cant find my tires on the website. Could you help me check if you have my size in the new stock?"
    ),
    dismissible: true,
    bgColor: 'bg-zinc-900',
    textColor: 'text-white',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=75&w=1600', // Imagen de almacén/stock de llantas
  },
  searchResults: {
    enabled: true,
    title: 'Uber & Lyft Exclusive Driver Pricing 🚘',
    description:
      'Oil Change $65 | Alignment $75 | Rotation $25 | Patch $20 | Plug $10\nYour car is your income — keep it earning.',
    ctaLabel: 'WhatsApp to book',
    ctaHref: whatsAppLink(
      'Hi! Im an Uber/Lyft driver and I would like to know more about the special prices on tires.'
    ),
    dismissible: true,
    bgColor: 'bg-zinc-900',
    textColor: 'text-white',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=75&w=1600', // Imagen de llanta en carretera o ciudad
  },
  stockArrival: {
    enabled: true,
    title: 'New Stock Arrives Every Day!',
    description:
      "Didn't find your size? We update our inventory daily with quality new and used tires. Contact us to find what you need!",
    ctaLabel: 'Inquire via WhatsApp',
    ctaHref: whatsAppLink(
      'Hi! I checked the website but couldnt find my tire size. Do you have new arrivals?'
    ),
    dismissible: true,
    bgColor: 'bg-emerald-700',
    textColor: 'text-white',
  },
};
