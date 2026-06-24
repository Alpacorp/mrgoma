export interface ServiceConfig {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  whatIncluded: string[];
  faqs: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
  icon: string;
  relatedServices: string[];
}

export const servicesConfig: ServiceConfig[] = [
  {
    slug: 'tire-mounting-balancing',
    title: 'Tire Mounting & Balancing',
    shortDescription: 'Expert installation and high-speed balancing for a smooth, safe ride.',
    longDescription:
      'Our ASE-certified technicians mount and balance tires for all vehicle types — from sedans and SUVs to light trucks and vans. We use professional-grade equipment to ensure your tires are seated correctly and balanced to factory spec, eliminating vibration and extending tire life.',
    whatIncluded: [
      'Tire demounting from rim',
      'New tire mounting on rim',
      'High-speed dynamic balancing',
      'Valve stem inspection and replacement if needed',
      'Torque check on lug nuts',
      'Visual inspection of rim for damage',
    ],
    faqs: [
      {
        q: 'How long does tire mounting and balancing take?',
        a: 'For a standard 4-tire service, expect 45–60 minutes. Single tires take as little as 15 minutes.',
      },
      {
        q: 'Do I need balancing every time I mount new tires?',
        a: 'Yes. Even brand-new tires have minor weight variations that require balancing for a smooth ride and even wear.',
      },
      {
        q: 'Can you mount tires I purchased elsewhere?',
        a: 'Absolutely. We mount and balance tires purchased from any source, including online retailers.',
      },
      {
        q: 'How do I know if my tires need rebalancing?',
        a: 'Vibration in the steering wheel or seat, uneven tire wear, or pulling to one side are common signs that balancing is needed.',
      },
    ],
    metaTitle: 'Tire Mounting & Balancing in Miami & Orlando | MrGoma Tires',
    metaDescription:
      'Professional tire mounting and high-speed balancing at 7 locations in Miami and Orlando, FL. ASE-certified technicians. Visit us or call today.',
    icon: 'tire',
    relatedServices: ['tire-rotation', 'wheel-alignment', 'flat-tire-repair'],
  },
  {
    slug: 'wheel-alignment',
    title: 'Wheel Alignment',
    shortDescription:
      'Precise 2- or 4-wheel alignments using Hunter HawkEye Elite® technology.',
    longDescription:
      'Proper wheel alignment protects your tires from premature wear, improves fuel efficiency, and keeps your vehicle tracking straight. We use the Hunter HawkEye Elite® alignment system — the same technology trusted by dealerships and top shops nationwide — for precise 2-wheel and 4-wheel alignments on all vehicle types.',
    whatIncluded: [
      'Pre-alignment inspection of suspension and steering components',
      'Hunter HawkEye Elite® computerized alignment measurement',
      '2-wheel or 4-wheel alignment adjustment to manufacturer specs',
      'Caster, camber, and toe angle correction',
      'Post-alignment test drive verification',
      'Printed before-and-after alignment report',
    ],
    faqs: [
      {
        q: 'How often should I get a wheel alignment?',
        a: 'Most manufacturers recommend an alignment check every 12,000 miles or once a year, and always after hitting a large pothole or curb.',
      },
      {
        q: 'What is the Hunter HawkEye Elite®?',
        a: 'It\'s a top-of-the-line computerized alignment system that measures all four wheel angles simultaneously with laser precision — the industry gold standard.',
      },
      {
        q: 'What\'s the difference between 2-wheel and 4-wheel alignment?',
        a: '2-wheel alignment adjusts only the front axle, while 4-wheel alignment corrects all four wheels. Most modern vehicles benefit from 4-wheel alignment.',
      },
      {
        q: 'Will alignment fix my steering pull?',
        a: 'In most cases, yes. Incorrect toe or camber angles are the most common cause of steering pull and can be corrected during alignment.',
      },
    ],
    metaTitle: 'Wheel Alignment in Miami & Orlando | Hunter HawkEye Elite® | MrGoma Tires',
    metaDescription:
      'Professional 2 & 4-wheel alignment using Hunter HawkEye Elite® at 7 locations in Miami & Orlando. ASE-certified technicians. Call or visit today.',
    icon: 'alignment',
    relatedServices: ['tire-mounting-balancing', 'tire-rotation', 'tpms-service'],
  },
  {
    slug: 'oil-change',
    title: 'Oil Change',
    shortDescription:
      'Quick oil changes using premium full synthetic oil for maximum engine protection.',
    longDescription:
      'Regular oil changes are the single most important maintenance item for engine longevity. Our technicians use premium quality full synthetic oil and genuine OEM-spec filters to maximize protection for your engine. Fast, clean, and done right the first time.',
    whatIncluded: [
      'Drain and replace engine oil with premium full synthetic',
      'Replace oil filter',
      'Inspect and top off all fluid levels (coolant, brake, power steering, washer)',
      'Check air filter condition',
      'Inspect belts and hoses visually',
      'Affix oil change reminder sticker',
    ],
    faqs: [
      {
        q: 'How often should I change my oil?',
        a: 'With full synthetic oil, most modern vehicles can go 7,500–10,000 miles between changes. Check your owner\'s manual for your specific vehicle\'s recommendation.',
      },
      {
        q: 'Why full synthetic over conventional oil?',
        a: 'Full synthetic oil flows better in cold weather, resists breakdown at high temperatures, keeps the engine cleaner, and lasts longer between changes.',
      },
      {
        q: 'How long does an oil change take at MrGoma?',
        a: 'Typically 20–30 minutes for a standard oil change.',
      },
      {
        q: 'Can I wait at the shop during my oil change?',
        a: 'Yes, all our locations have a waiting area. You\'re welcome to wait or drop off your vehicle.',
      },
    ],
    metaTitle: 'Oil Change Service in Miami & Orlando | Full Synthetic | MrGoma Tires',
    metaDescription:
      'Fast, professional oil changes using premium full synthetic oil at 7 locations in Miami and Orlando, FL. ASE-certified technicians. No appointment needed.',
    icon: 'oil',
    relatedServices: ['brake-service', 'tire-rotation', 'tpms-service'],
  },
  {
    slug: 'brake-service',
    title: 'Brake Service',
    shortDescription:
      'Full brake inspections, repairs, and replacements to keep you safe on the road.',
    longDescription:
      'Your brakes are your most critical safety system. Our ASE-certified technicians perform comprehensive brake inspections and repairs — from brake pad and rotor replacement to brake fluid flushes and caliper service. We work on all makes and models and only use quality parts.',
    whatIncluded: [
      'Visual brake inspection (pads, rotors, calipers, lines)',
      'Brake pad thickness measurement',
      'Rotor measurement and inspection for warping',
      'Brake fluid level and condition check',
      'Brake pad replacement (if needed)',
      'Rotor resurfacing or replacement (if needed)',
      'Brake system road test',
    ],
    faqs: [
      {
        q: 'How do I know if my brakes need service?',
        a: 'Squealing, grinding, or squeaking sounds, a spongy brake pedal, vibration when braking, or a longer stopping distance are all signs to visit us promptly.',
      },
      {
        q: 'How long do brake pads last?',
        a: 'On average, 30,000–70,000 miles depending on driving habits and pad type. City driving wears pads faster than highway driving.',
      },
      {
        q: 'Do you service both front and rear brakes?',
        a: 'Yes, we service all four corners — disc brakes, drum brakes, and parking brakes on all vehicle types.',
      },
      {
        q: 'Is it safe to drive with worn brake pads?',
        a: 'No. Worn pads can damage rotors (a much more expensive repair) and significantly reduce your stopping ability. Come in as soon as possible.',
      },
    ],
    metaTitle: 'Brake Service in Miami & Orlando | Inspection & Repair | MrGoma Tires',
    metaDescription:
      'Professional brake inspections, pad replacement, and rotor service at 7 locations in Miami and Orlando, FL. ASE-certified. Visit or call today.',
    icon: 'brakes',
    relatedServices: ['oil-change', 'tire-rotation', 'wheel-alignment'],
  },
  {
    slug: 'flat-tire-repair',
    title: 'Flat Tire Repair',
    shortDescription:
      'Fast, affordable flat tire repair — or a replacement from our inventory if needed.',
    longDescription:
      'A flat tire doesn\'t have to ruin your day. Our technicians assess whether your tire can be safely repaired or needs to be replaced. We follow industry-standard repair procedures for punctures in the repairable zone and can pull from our 15,000+ tire inventory if a replacement is needed — often getting you back on the road faster than ordering elsewhere.',
    whatIncluded: [
      'Tire removal and inspection for damage',
      'Puncture location and severity assessment',
      'Professional plug-and-patch repair (where safe)',
      'Re-mounting and balancing after repair',
      'Torque check on lug nuts',
      'Replacement from inventory if repair is not safe',
    ],
    faqs: [
      {
        q: 'Can every flat tire be repaired?',
        a: 'No. Punctures in the sidewall or shoulder of the tire cannot be safely repaired and require replacement. Tread-zone punctures under 1/4 inch can typically be patched.',
      },
      {
        q: 'How much does a flat tire repair cost?',
        a: 'Visit any of our 7 locations for current pricing. Repairs are significantly less expensive than replacement when the damage allows it.',
      },
      {
        q: 'Can you repair a run-flat tire?',
        a: 'Most run-flat tires cannot be repaired after a puncture per manufacturer guidelines. We\'ll inspect it and advise on the safest course of action.',
      },
      {
        q: 'How long does a flat tire repair take?',
        a: 'A standard plug-and-patch repair takes about 20–30 minutes. If a replacement is needed from our inventory, we can usually complete the full swap in under an hour.',
      },
    ],
    metaTitle: 'Flat Tire Repair in Miami & Orlando | Fast Service | MrGoma Tires',
    metaDescription:
      'Fast flat tire repair at 7 locations in Miami and Orlando, FL. Professional plug-and-patch repairs or replacement from 15,000+ tire inventory. No appointment needed.',
    icon: 'repair',
    relatedServices: ['tire-mounting-balancing', 'tpms-service', 'tire-rotation'],
  },
  {
    slug: 'tire-rotation',
    title: 'Tire Rotation',
    shortDescription: 'Routine rotations to extend tread life and improve driving performance.',
    longDescription:
      'Tires wear unevenly based on their position on the vehicle — front tires carry more load and steer, while rear tires on front-wheel-drive cars barely work at all. Regular rotation moves tires to different positions to equalize wear, extending the life of your set and maintaining balanced handling.',
    whatIncluded: [
      'Remove all four tires',
      'Rotate to correct position per vehicle type and drive configuration',
      'Torque lug nuts to manufacturer specification',
      'Check and adjust tire pressure on all four tires',
      'Visual inspection of tires and rims during rotation',
    ],
    faqs: [
      {
        q: 'How often should I rotate my tires?',
        a: 'Every 5,000–7,500 miles, or every other oil change. Many shops combine both services for convenience.',
      },
      {
        q: 'Does tire rotation really extend tire life?',
        a: 'Yes — significantly. Proper rotation can add 10,000–20,000 miles to the life of a set of tires by evening out wear.',
      },
      {
        q: 'What is the correct rotation pattern for my vehicle?',
        a: 'It depends on your drivetrain (FWD, RWD, AWD) and whether your tires are directional or non-directional. Our technicians follow the correct pattern for your specific setup.',
      },
      {
        q: 'Can you rotate tires with different sizes front and rear?',
        a: 'Staggered fitments (different front/rear sizes) typically cannot be rotated side-to-side. We\'ll advise on the best approach for your vehicle.',
      },
    ],
    metaTitle: 'Tire Rotation Service in Miami & Orlando | MrGoma Tires',
    metaDescription:
      'Regular tire rotation at 7 locations in Miami and Orlando, FL. Extend tire life and maintain balanced handling. ASE-certified technicians. Visit us today.',
    icon: 'rotation',
    relatedServices: ['tire-mounting-balancing', 'wheel-alignment', 'tpms-service'],
  },
  {
    slug: 'nitrogen-inflation',
    title: 'Nitrogen Tire Inflation',
    shortDescription: 'More consistent pressure and better fuel efficiency with nitrogen fills.',
    longDescription:
      'Regular compressed air is about 78% nitrogen already — but pure nitrogen inflation offers measurable advantages. Nitrogen molecules are larger and escape through rubber more slowly than oxygen, meaning your tire pressure stays more consistent over time and across temperature changes. The result is more stable handling, less pressure maintenance, and marginally better fuel economy.',
    whatIncluded: [
      'Deflate existing air from all four tires',
      'Purge and refill with high-purity nitrogen',
      'Inflate to manufacturer-specified pressure',
      'Check and adjust all four tires',
      'Valve cap replacement with nitrogen-indicator caps',
    ],
    faqs: [
      {
        q: 'Is nitrogen inflation really better than regular air?',
        a: 'For most drivers, the difference is modest but real: nitrogen holds pressure longer and varies less with temperature changes, reducing the need for frequent top-offs.',
      },
      {
        q: 'Can I add regular air to nitrogen-filled tires in an emergency?',
        a: 'Yes, you can safely top off nitrogen tires with regular air in a pinch. It dilutes the nitrogen but won\'t harm your tires.',
      },
      {
        q: 'How often do nitrogen-filled tires need refilling?',
        a: 'Nitrogen-filled tires typically need pressure checks every 3–4 months vs. monthly for air-filled tires.',
      },
      {
        q: 'Is nitrogen inflation good for high-performance vehicles?',
        a: 'Absolutely — it\'s standard in motorsports, aviation, and heavy equipment for its thermal stability and consistency.',
      },
    ],
    metaTitle: 'Nitrogen Tire Inflation in Miami & Orlando | MrGoma Tires',
    metaDescription:
      'Pure nitrogen tire inflation at 7 locations in Miami and Orlando, FL. More consistent pressure, better fuel efficiency, and reduced maintenance.',
    icon: 'nitrogen',
    relatedServices: ['tire-rotation', 'tpms-service', 'tire-mounting-balancing'],
  },
  {
    slug: 'tpms-service',
    title: 'TPMS Service',
    shortDescription:
      'Diagnose, replace, and program TPMS sensors for all makes and models.',
    longDescription:
      'The Tire Pressure Monitoring System (TPMS) is a federally required safety feature on all vehicles manufactured after 2008. When your TPMS warning light comes on, it means one or more sensors are detecting low pressure — or the sensor itself may need service. Our technicians diagnose the issue, replace faulty sensors, and program new sensors to communicate with your vehicle\'s computer.',
    whatIncluded: [
      'TPMS system diagnostic scan',
      'Sensor identification and fault code reading',
      'TPMS sensor replacement (if faulty)',
      'Sensor programming and vehicle relearn procedure',
      'Tire pressure check and adjustment on all four tires',
      'TPMS warning light reset and verification',
    ],
    faqs: [
      {
        q: 'Why is my TPMS light on if my tires look fine?',
        a: 'The TPMS light activates at roughly 25% below recommended pressure — a tire can look fine to the eye while being dangerously under-inflated. It can also indicate a faulty sensor.',
      },
      {
        q: 'Do TPMS sensors need to be replaced when I get new tires?',
        a: 'Not always, but sensors have a battery life of 7–10 years. If sensors are older, replacing them during a tire change saves labor cost.',
      },
      {
        q: 'Can you program any brand of TPMS sensor?',
        a: 'Yes. We carry and program universal aftermarket sensors compatible with all major vehicle makes and models.',
      },
      {
        q: 'How long does TPMS service take?',
        a: 'A basic sensor diagnosis takes 15–20 minutes. Full sensor replacement and programming typically takes 30–45 minutes.',
      },
    ],
    metaTitle: 'TPMS Service & Sensor Replacement in Miami & Orlando | MrGoma Tires',
    metaDescription:
      'TPMS diagnosis, sensor replacement, and programming at 7 locations in Miami and Orlando, FL. All makes and models. ASE-certified technicians.',
    icon: 'tpms',
    relatedServices: ['tire-mounting-balancing', 'nitrogen-inflation', 'wheel-alignment'],
  },
];

export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return servicesConfig.find(s => s.slug === slug);
}
