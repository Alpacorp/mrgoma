import type { PromoContent } from '@/app/ui/sections/PromoBanner/PromoBanner';

/**
 * Configuración central de banners promocionales por página.
 * Cambia `enabled` a true/false para mostrar u ocultar rápidamente.
 * Opcionalmente usa startDate/endDate (ISO) para activar por temporada.
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
    ctaHref:
      'https://wa.me/14073644016?text=Hi!%20I%20cant%20find%20my%20tires%20on%20the%20website.%20Could%20you%20help%20me%20check%20if%20you%20have%20my%20size%20in%20the%20new%20stock?',
    dismissible: true,
    bgColor: 'bg-zinc-900',
    textColor: 'text-white',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=100&w=2400', // Imagen de almacén/stock de llantas
  },
  searchResults: {
    enabled: true,
    title: 'Uber & Lyft Exclusive Driver Pricing 🚘',
    description:
      'Oil Change $65 | Alignment $75 | Rotation $25 | Patch $20 | Plug $10 Your car is your income — keep it earning.',
    ctaLabel: 'Check Discount',
    ctaHref:
      'https://wa.me/14073644016?text=Hi!%20Im%20an%20Uber/Lyft%20driver%20and%20I%20would%20like%20to%20know%20more%20about%20the%20special%20prices%20on%20tires.',
    dismissible: true,
    bgColor: 'bg-zinc-900',
    textColor: 'text-white',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=100&w=2400', // Imagen de llanta en carretera o ciudad
  },
  stockArrival: {
    enabled: true,
    title: 'New Stock Arrives Every Day!',
    description:
      "Didn't find your size? We update our inventory daily with quality new and used tires. Contact us to find what you need!",
    ctaLabel: 'Inquire via WhatsApp',
    ctaHref:
      'https://wa.me/14073644016?text=Hi!%20I%20checked%20the%20website%20but%20couldnt%20find%20my%20tire%20size.%20Do%20you%20have%20new%20arrivals?',
    dismissible: true,
    bgColor: 'bg-emerald-700',
    textColor: 'text-white',
  },
};
