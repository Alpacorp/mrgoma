import type { PromoContent } from '@/app/ui/sections/PromoBanner/PromoBanner';

/**
 * Configuración central de banners promocionales por página.
 * Cambia `enabled` a true/false para mostrar u ocultar rápidamente.
 * Opcionalmente usa startDate/endDate (ISO) para activar por temporada.
 */
export const promoBannerConfig: {
  home: PromoContent;
  searchResults: PromoContent;
} = {
  home: {
    enabled: true,
    title: 'Black Friday Special – MrGoma Tires',
    description:
      'Limited-time offers! Full Synthetic Oil Change $55 • Alignment $70 • Rotation $30 • FREE Brake Inspection. Appointment required.',
    ctaLabel: 'Chat on WhatsApp',
    ctaHref:
      'https://wa.me/14073644016?text=Hi!%20I%27m%20interested%20in%20the%20Black%20Friday%20Special%20(Full%20Synthetic%20Oil%20Change%20$55%2C%20Alignment%20$70%2C%20Rotation%20$30%2C%20FREE%20Brake%20Inspection).%20I%27d%20like%20to%20book%20an%20appointment.',
    dismissible: true,
    bgColor: 'bg-black',
    textColor: 'text-lime-400',
    startDate: '2025-11-25',
    endDate: '2025-12-02',
  },
  searchResults: {
    enabled: true,
    title: 'Black Friday Special – MrGoma Tires',
    description:
      'Full Synthetic Oil Change $55 • Alignment $70 • Rotation $30 • FREE Brake Inspection. Black Friday week – book now!',
    ctaLabel: 'Book via WhatsApp',
    ctaHref:
      'https://wa.me/14073644016?text=Hello!%20I%20found%20the%20Black%20Friday%20Special%20on%20your%20website%20and%20want%20to%20schedule.%20Can%20you%20help%20me%20book%20an%20appointment%3F',
    dismissible: true,
    bgColor: 'bg-black',
    textColor: 'text-lime-400',
    startDate: '2025-11-25',
    endDate: '2025-12-02',
  },
};
