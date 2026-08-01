/** A single opening-hours span, in 24h `HH:MM`. */
export interface OpeningHours {
  /** Schema.org day names this span applies to. */
  days: string[];
  opens: string;
  closes: string;
}

/**
 * Store hours. Confirmed uniform across all seven stores (2026-07-31), but
 * modelled per store so a future divergence is an edit, not a refactor.
 */
export const DEFAULT_HOURS: OpeningHours[] = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '08:00',
    closes: '18:00',
  },
  { days: ['Sunday'], opens: '10:00', closes: '16:00' },
];

export interface LocationConfig {
  slug: string;
  name: string;
  address: string;
  phone: string;
  tel: string;
  mapLink: string;
  /**
   * Marker coordinates read from `mapLink`'s canonical Google Maps URL
   * (the `!3d<lat>!4d<lng>` segment, i.e. the pin — not the viewport centre).
   * Pending owner validation; a wrong pin sends a customer to the wrong store.
   */
  geo: { latitude: number; longitude: number };
  /** Opening hours for this store. Defaults to {@link DEFAULT_HOURS}. */
  hours: OpeningHours[];
  /** Background image for the home slider card and the location hero. */
  image: string;
  /** Short "areas served" tagline shown on the home slider card. */
  serving: string;
  neighborhoods: string[];
  city: 'Miami' | 'Orlando';
  h1: string;
  description: string;
}

export const locationsConfig: LocationConfig[] = [
  {
    slug: 'cutler-bay',
    name: 'Cutler Bay',
    address: '18200 S Dixie Hwy, Miami, FL 33157',
    phone: '(305)-278-4632',
    tel: 'tel:+13052784632',
    mapLink: 'https://maps.app.goo.gl/RTpygmaN6vMcPxmX8',
    geo: { latitude: 25.6004443, longitude: -80.3537512 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/18200.jpg',
    serving: 'Cutler Bay • Palmetto Bay • South Miami • Kendall • Pinecrest',
    neighborhoods: ['Cutler Bay', 'Palmetto Bay', 'South Miami', 'Kendall', 'Pinecrest'],
    city: 'Miami',
    h1: 'Cutler Bay',
    description:
      'Our South Dixie Highway location serves the communities of Cutler Bay, Palmetto Bay, South Miami, Kendall, and Pinecrest. Stop in for new or used tires, wheel alignment, oil changes, brake service, and more — no appointment needed.',
  },
  {
    slug: 'miami-airport',
    name: 'Miami Airport',
    address: '3251 NW 27th Ave, Miami, FL 33142',
    phone: '(305)-456-9588',
    tel: 'tel:+13054569588',
    mapLink: 'https://maps.app.goo.gl/1gpRJFveeqs3hM7G9',
    geo: { latitude: 25.8060487, longitude: -80.2398748 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/3251.webp',
    serving: 'Allapattah • Midtown • Near Miami Int’l Airport',
    neighborhoods: ['Allapattah', 'Midtown Miami', 'Wynwood', 'Near Miami International Airport'],
    city: 'Miami',
    h1: 'Miami Airport',
    description:
      'Conveniently located near Miami International Airport on NW 27th Ave, this location serves Allapattah, Midtown Miami, and Wynwood. We carry new and used tires for all makes and models, plus a full menu of automotive services.',
  },
  {
    slug: 'miami-gardens',
    name: 'Miami Gardens',
    address: '20282 NW 2nd Ave, Miami, FL 33169',
    phone: '(305)-770-1154',
    tel: 'tel:+13057701154',
    mapLink: 'https://maps.app.goo.gl/G79tY9zNu7ETtru8A',
    geo: { latitude: 25.9613344, longitude: -80.2062047 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/20282.jpg',
    serving: 'Miami Gardens • Hollywood • Aventura',
    neighborhoods: ['Miami Gardens', 'Hollywood', 'Aventura', 'Opa-locka', 'North Miami'],
    city: 'Miami',
    h1: 'Miami Gardens',
    description:
      'Our North Miami location on NW 2nd Ave serves Miami Gardens, Hollywood, Aventura, and North Miami. With 15,000+ tires across our 7 locations, we can quickly find the right tire for your vehicle.',
  },
  {
    slug: 'coral-gables',
    name: 'Coral Gables',
    address: '900 South Le Jeune Rd, Miami, FL 33134',
    phone: '(305)-713-1258',
    tel: 'tel:+13057131258',
    mapLink: 'https://maps.app.goo.gl/99HuCuuroqTVZRdz8',
    geo: { latitude: 25.7633216, longitude: -80.2635377 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/900.jpg',
    serving: 'Coral Gables • Westchester • Near MIA Airport',
    neighborhoods: ['Coral Gables', 'Westchester', 'West Miami', 'Near Miami International Airport'],
    city: 'Miami',
    h1: 'Coral Gables',
    description:
      'Located on South Le Jeune Road, our Coral Gables shop serves the upscale communities of Coral Gables, Westchester, and West Miami. Quality tire service from ASE-certified technicians.',
  },
  {
    slug: 'hialeah',
    name: 'Hialeah',
    address: '4040 E 10th Ct, Hialeah, FL 33013',
    phone: '(305)-836-4200',
    tel: 'tel:+13058364200',
    mapLink: 'https://maps.app.goo.gl/oF6vhCsS7MdikcYX8',
    geo: { latitude: 25.8598175, longitude: -80.2616707 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/4040.webp',
    serving: 'Hialeah • Miami Springs • East Hialeah',
    neighborhoods: ['Hialeah', 'Miami Springs', 'East Hialeah', 'Medley'],
    city: 'Miami',
    h1: 'Hialeah',
    description:
      'Our Hialeah location on E 10th Court serves Hialeah, Miami Springs, and East Hialeah. We offer the same full menu of tire and automotive services as all our locations — with the same ASE-certified technicians and 30-day warranty on used tires.',
  },
  {
    slug: 'orlando-west-colonial',
    name: 'Orlando West Colonial',
    address: '4400 W Colonial Dr, Orlando, FL 32808',
    phone: '(407)-203-3912',
    tel: 'tel:+14072033912',
    mapLink: 'https://maps.app.goo.gl/n32Upo4RiH9PWJVA7',
    geo: { latitude: 28.5522005, longitude: -81.4342076 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/4400.jpg',
    serving: 'Winter Garden • Metrowest • West Orlando',
    neighborhoods: ['Winter Garden', 'Metrowest', 'West Orlando'],
    city: 'Orlando',
    h1: 'Orlando West Colonial',
    description:
      'Our West Colonial Drive location serves Winter Garden, Metrowest, and West Orlando. Same quality tires and services as our Miami locations — now serving Central Florida drivers.',
  },
  {
    slug: 'east-orlando',
    name: 'East Orlando',
    address: '575 N Semoran Blvd, Orlando, FL 32807',
    phone: '(407)-282-3100',
    tel: 'tel:+14072823100',
    mapLink: 'https://maps.app.goo.gl/fuDXk1EAKZ5ZAvpu6',
    geo: { latitude: 28.5519878, longitude: -81.3103062 },
    hours: DEFAULT_HOURS,
    image: '/assets/images/Locations/575.jpg',
    serving: "Azalea Park • Winter Park • East Orlando • Near Orlando Int'l Airport",
    neighborhoods: ['Azalea Park', 'Winter Park', 'East Orlando', 'Near Orlando International Airport'],
    city: 'Orlando',
    h1: 'East Orlando',
    description:
      'Located on N Semoran Blvd near Orlando International Airport, our East Orlando location serves Azalea Park, Winter Park, and surrounding communities. Walk in for new or used tires, mounting, balancing, alignment, and more.',
  },
];

export function getLocationBySlug(slug: string): LocationConfig | undefined {
  return locationsConfig.find(l => l.slug === slug);
}
