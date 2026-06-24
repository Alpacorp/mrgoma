export interface LocationConfig {
  slug: string;
  name: string;
  address: string;
  phone: string;
  tel: string;
  mapLink: string;
  /** Background image for the home slider card and the location hero. */
  image: string;
  /** Short "areas served" tagline shown on the home slider card. */
  serving: string;
  neighborhoods: string[];
  city: 'Miami' | 'Orlando';
  metaTitle: string;
  metaDescription: string;
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
    image: '/assets/images/Locations/18200.jpg',
    serving: 'Cutler Bay • Palmetto Bay • South Miami • Kendall • Pinecrest',
    neighborhoods: ['Cutler Bay', 'Palmetto Bay', 'South Miami', 'Kendall', 'Pinecrest'],
    city: 'Miami',
    metaTitle: 'MrGoma Tires Cutler Bay | Used & New Tires on S Dixie Hwy',
    metaDescription:
      'MrGoma Tires on S Dixie Hwy serving Cutler Bay, Palmetto Bay, Kendall, and South Miami. Used and new tires, wheel alignment, oil change, and more. ASE-certified.',
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
    image: '/assets/images/Locations/3251.webp',
    serving: 'Allapattah • Midtown • Near Miami Int’l Airport',
    neighborhoods: ['Allapattah', 'Midtown Miami', 'Wynwood', 'Near Miami International Airport'],
    city: 'Miami',
    metaTitle: 'MrGoma Tires Miami Airport | Used & New Tires near MIA',
    metaDescription:
      'MrGoma Tires on NW 27th Ave near Miami International Airport, serving Allapattah, Midtown, and Wynwood. New and used tires, fast service. No appointment needed.',
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
    image: '/assets/images/Locations/20282.jpg',
    serving: 'Miami Gardens • Hollywood • Aventura',
    neighborhoods: ['Miami Gardens', 'Hollywood', 'Aventura', 'Opa-locka', 'North Miami'],
    city: 'Miami',
    metaTitle: 'MrGoma Tires Miami Gardens | Used & New Tires on NW 2nd Ave',
    metaDescription:
      'MrGoma Tires on NW 2nd Ave serving Miami Gardens, Hollywood, and Aventura. New and used tires, mounting, balancing, and more. ASE-certified technicians.',
    h1: 'Miami Gardens',
    description:
      'Our North Miami location on NW 2nd Ave serves Miami Gardens, Hollywood, Aventura, and North Miami. With 15,000+ tires in stock across our network, we can quickly find the right tire for your vehicle.',
  },
  {
    slug: 'coral-gables',
    name: 'Coral Gables',
    address: '900 South Le Jeune Rd, Miami, FL 33134',
    phone: '(305)-713-1258',
    tel: 'tel:+13057131258',
    mapLink: 'https://maps.app.goo.gl/99HuCuuroqTVZRdz8',
    image: '/assets/images/Locations/900.jpg',
    serving: 'Coral Gables • Westchester • Near MIA Airport',
    neighborhoods: ['Coral Gables', 'Westchester', 'West Miami', 'Near Miami International Airport'],
    city: 'Miami',
    metaTitle: 'MrGoma Tires Coral Gables | Used & New Tires on Le Jeune Rd',
    metaDescription:
      'MrGoma Tires on S Le Jeune Rd in Coral Gables. Serving Coral Gables, Westchester, and West Miami with new and used tires, wheel alignment, and automotive services.',
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
    image: '/assets/images/Locations/4040.webp',
    serving: 'Hialeah • Miami Springs • East Hialeah',
    neighborhoods: ['Hialeah', 'Miami Springs', 'East Hialeah', 'Medley'],
    city: 'Miami',
    metaTitle: 'MrGoma Tires Hialeah | Used & New Tires on E 10th Ct',
    metaDescription:
      'MrGoma Tires in Hialeah on E 10th Ct. Serving Hialeah, Miami Springs, and East Hialeah with new and used tires, oil changes, brake service, and more.',
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
    image: '/assets/images/Locations/4400.jpg',
    serving: 'Winter Garden • Metrowest • West Orlando',
    neighborhoods: ['Winter Garden', 'Metrowest', 'West Orlando'],
    city: 'Orlando',
    metaTitle: 'MrGoma Tires Orlando West Colonial | Used & New Tires on W Colonial Dr',
    metaDescription:
      'MrGoma Tires on W Colonial Dr in Orlando. Serving Winter Garden, Metrowest, and West Orlando. New and used tires, wheel alignment, oil change. ASE-certified.',
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
    image: '/assets/images/Locations/575.jpg',
    serving: "Azalea Park • Winter Park • East Orlando • Near Orlando Int'l Airport",
    neighborhoods: ['Azalea Park', 'Winter Park', 'East Orlando', 'Near Orlando International Airport'],
    city: 'Orlando',
    metaTitle: 'MrGoma Tires East Orlando | Used & New Tires on N Semoran Blvd',
    metaDescription:
      'MrGoma Tires on N Semoran Blvd in Orlando. Serving Azalea Park, Winter Park, and East Orlando. New and used tires, wheel alignment, and more near Orlando International Airport.',
    h1: 'East Orlando',
    description:
      'Located on N Semoran Blvd near Orlando International Airport, our East Orlando location serves Azalea Park, Winter Park, and surrounding communities. Walk in for new or used tires, mounting, balancing, alignment, and more.',
  },
];

export function getLocationBySlug(slug: string): LocationConfig | undefined {
  return locationsConfig.find(l => l.slug === slug);
}
