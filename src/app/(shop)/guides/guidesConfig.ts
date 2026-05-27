export type GuideSection = {
  heading?: string;
  type: 'text' | 'list' | 'keyFacts' | 'callout';
  content?: string;
  items?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  category: 'buying-guide' | 'rideshare' | 'maintenance';
  categoryLabel: string;
  readTime: string;
  publishDate: string;
  intro: string;
  keyFacts: string[];
  sections: GuideSection[];
  faqs: Array<{ question: string; answer: string }>;
};

export const guides: Guide[] = [
  {
    slug: 'how-to-buy-used-tires',
    title: 'How to Buy Used Tires: The Complete Guide',
    headline: 'The Complete Buyer\'s Guide to Used Tires',
    metaTitle: 'How to Buy Used Tires: Complete Guide',
    metaDescription:
      'Learn how to safely buy used tires. Inspection checklist, what to avoid, and how to find quality used tires in Miami. Expert advice from ASE-certified technicians.',
    category: 'buying-guide',
    categoryLabel: 'Buying Guide',
    readTime: '7 min read',
    publishDate: '2026-05-01',
    intro:
      'Used tires can save you 30 to 70 percent compared to new, and when properly inspected they are just as safe. The key word is inspected. Here is everything you need to know before you buy.',
    keyFacts: [
      'Used tires should have at least 4/32" of remaining tread — the legal minimum is 2/32"',
      'Check the DOT code on the sidewall: avoid any tire manufactured more than 6 years ago',
      'Reject tires with sidewall cracks, bulges, uneven wear, or visible cord damage',
      "MrGoma's 180-day warranty is the longest on used tires in Florida — 6x the 30-day industry standard",
      'All MrGoma used tires are inspected by ASE-certified technicians before sale',
    ],
    sections: [
      {
        heading: 'Why Used Tires Are Worth Considering',
        type: 'text',
        content:
          "A brand-new set of tires for an average car costs between $400 and $800. Quality used tires for the same vehicle can cost $80 to $200 — with the same tread life remaining as a tire that was just mounted at the factory. The savings are real, and for drivers who cover a lot of miles (commuters, rideshare drivers, delivery workers), used tires can be rotated through two or three sets in the time it takes a typical driver to wear out one set of new tires.",
      },
      {
        heading: 'What to Look for When Buying Used Tires',
        type: 'text',
        content:
          'The most important things to check are tread depth, tire age, and visible physical condition.',
      },
      {
        type: 'list',
        items: [
          'Tread depth: Use a quarter or a tread depth gauge. 4/32" or more is good; below 2/32" is illegal in most states.',
          'Sidewall condition: No cracks, bulges, blisters, or cuts. Even small sidewall damage can lead to a blowout.',
          'DOT date code: The last four digits show week and year of manufacture. "2223" means week 22 of 2023. Avoid tires older than 6 years, even if tread looks fine.',
          'Even tread wear: Uneven wear patterns indicate alignment or suspension problems — and the same tire problem will continue on your car.',
          'No patching or plugs: Interior repairs are acceptable; exterior plug-only repairs on the shoulder or sidewall are not.',
        ],
      },
      {
        heading: 'The DOT Code: How to Check Tire Age',
        type: 'text',
        content:
          'Every tire sold in the US has a DOT code molded into one sidewall. It starts with "DOT" and ends with four digits. Those four digits are the manufacture date: the first two are the week (01–52), the last two are the year. A tire stamped "1219" was made in the 12th week of 2019 — it is now seven years old and should be replaced regardless of tread depth. Rubber oxidizes and the internal structure breaks down over time, invisible to the eye.',
      },
      {
        heading: 'Questions to Ask Before Buying',
        type: 'list',
        items: [
          'What is the tread depth? (Ask for a measurement, not just a visual estimate)',
          'Can I see the DOT code?',
          'Were these tires inspected? By whom?',
          'Is there a warranty?',
          'Were the tires in an accident or driven on flat?',
        ],
      },
      {
        heading: 'Where to Buy Used Tires Safely',
        type: 'text',
        content:
          'Buy from shops that inspect every tire before sale and offer a written warranty. Avoid buying used tires from online marketplaces where you cannot physically inspect the tire or verify the DOT date. A tire that arrives with a sidewall crack or wrong DOT date is a headache and a safety risk. At MrGoma Tires, every used tire in our inventory passes an ASE-certified technician inspection — and we only list tires online that have at least 50% remaining life.',
      },
      {
        heading: 'MrGoma\'s Inspection Process',
        type: 'callout',
        content:
          'Every tire sold at MrGoma passes a multi-point inspection: tread depth measurement, visual sidewall check, DOT date verification, and an internal inspection. We back each used tire with a 180-day warranty — the longest in Florida. If a tire fails within 180 days of normal use, we replace it.',
      },
    ],
    faqs: [
      {
        question: 'Is it safe to buy used tires?',
        answer:
          'Yes, when the tires have been properly inspected by certified technicians. The key factors are tread depth (at least 4/32"), tire age (under 6 years from DOT date), and no sidewall damage. Buying from a reputable shop that inspects tires before sale significantly reduces risk.',
      },
      {
        question: 'What is the minimum tread depth for used tires?',
        answer:
          'The legal minimum in the US is 2/32", but most safety experts recommend replacing tires at 4/32" for adequate wet-road performance. At MrGoma, we only sell used tires online that have at least 50% remaining life.',
      },
      {
        question: 'How do I know if a used tire is too old?',
        answer:
          'Check the DOT code on the sidewall — the last 4 digits show the week and year of manufacture. Avoid tires older than 6 years, regardless of tread depth. Rubber degrades over time and can fail without visible warning signs.',
      },
      {
        question: 'Do used tires come with a warranty?',
        answer:
          'Most used tire shops offer 30 days or no warranty. MrGoma Tires backs every used tire with a 180-day warranty — six times the industry standard — because we only sell tires we stand behind.',
      },
    ],
  },
  {
    slug: 'used-tire-safety-checklist',
    title: 'Used Tire Safety Checklist: 8 Things to Check Before You Buy',
    headline: 'Used Tire Safety: 8-Point Inspection Checklist',
    metaTitle: 'Used Tire Safety Checklist: 8 Things to Check Before Buying',
    metaDescription:
      'Before buying used tires, run through this 8-point safety checklist. Learn how to check tread depth, DOT age code, sidewall damage, and more.',
    category: 'buying-guide',
    categoryLabel: 'Buying Guide',
    readTime: '5 min read',
    publishDate: '2026-05-05',
    intro:
      'Not all used tires are created equal. A tire that looks fine from across the lot can have hidden damage that causes a blowout at highway speed. Use this checklist before you buy — or verify that your tire shop checks all of these for you.',
    keyFacts: [
      'Minimum safe tread depth: 4/32" for adequate wet-road performance (legal minimum is 2/32")',
      'DOT age limit: reject tires manufactured more than 6 years ago',
      'Sidewall cracks or bulges are grounds for immediate rejection',
      'Exposed cord or steel belt is dangerous — never buy or mount that tire',
      'ASE-certified inspection before purchase eliminates most risk',
    ],
    sections: [
      {
        heading: '1. Tread Depth',
        type: 'text',
        content:
          'Use a tread depth gauge or the quarter test (insert a quarter into the tread groove — if you can see all of George Washington\'s head, the tread is below 4/32"). For wet-road safety, 4/32" is the practical minimum. The legal limit in Florida is 2/32", but at that depth you have almost no wet-weather grip.',
      },
      {
        heading: '2. Even Tread Wear',
        type: 'text',
        content:
          'Run your hand across the tread from shoulder to shoulder. Uneven wear — heavy on one edge, cupping patterns, or diagonal patches — means the tire was run on a misaligned or improperly inflated vehicle. That wear pattern will continue on your car, and it shortens the remaining life significantly.',
      },
      {
        heading: '3. Sidewall Condition',
        type: 'list',
        items: [
          'Cracks (even small ones): rubber oxidation that can deepen and fail suddenly',
          'Bulges or blisters: internal structural damage — a blowout waiting to happen',
          'Cuts or gouges deeper than 1/4": penetration risk',
          'Abrasion marks from curb rash: cosmetic only if shallow, structural concern if deep',
        ],
      },
      {
        heading: '4. DOT Age Code',
        type: 'text',
        content:
          'Find the DOT code on the sidewall. The last four digits are the week and year of manufacture. A stamp reading "4521" means week 45 of 2021 — nearly 5 years old. Rubber compounds harden and degrade with age regardless of mileage. The industry consensus is to replace tires at 6 years, and to not use any tire older than 10 years.',
      },
      {
        heading: '5. Interior Repairs',
        type: 'text',
        content:
          'A tire that was previously repaired can be safe — or not. The only acceptable repair is a patch applied from the inside to the tread area (not the shoulder or sidewall). Plug-only repairs (the external rubber string kind) are considered temporary by tire manufacturers. Ask if the tire has been repaired and how.',
      },
      {
        heading: '6. Bead and Wheel Seating Area',
        type: 'text',
        content:
          'The bead is the inner rim of the tire that seats against the wheel. Check for damage, corrosion, or deformation. A damaged bead will not seal properly and the tire will slowly or rapidly lose pressure.',
      },
      {
        heading: '7. No Exposed Cord or Belt',
        type: 'text',
        content:
          'If you can see any fabric, steel wire, or steel belt showing through the tread or sidewall, reject the tire immediately. There is no safe way to use a tire with exposed reinforcement.',
      },
      {
        heading: '8. Matching Specification for Your Vehicle',
        type: 'text',
        content:
          "Verify the size matches your vehicle's requirement (check the door jamb sticker or owner's manual). Also confirm the load index and speed rating are equal to or greater than the original specification — never downgrade these two ratings.",
      },
      {
        heading: 'What MrGoma Checks Before Every Sale',
        type: 'callout',
        content:
          'All eight of the above points, plus an internal inspection for liner damage. Our ASE-certified technicians reject tires that do not meet our standard before they ever reach the inventory. Every tire listed on our site has at least 50% remaining life. Backed by a 180-day warranty.',
      },
    ],
    faqs: [
      {
        question: 'How do you check if a used tire is safe to buy?',
        answer:
          'Check tread depth (at least 4/32"), inspect the sidewall for cracks or bulges, verify the DOT date (under 6 years old), confirm even tread wear, and ensure no exposed cord or structural damage. Buying from a shop that inspects tires before sale is the safest option.',
      },
      {
        question: 'What tread depth is unsafe on a used tire?',
        answer:
          'The legal minimum in Florida is 2/32", but tires at that depth have significantly reduced wet-road traction. Most safety experts recommend replacing tires at 4/32". MrGoma\'s minimum for online sales is 50% remaining life.',
      },
      {
        question: 'Can you tell if a used tire has been in an accident?',
        answer:
          'Not always from the outside. Impact damage can be internal — that is why inspecting tires with trained technicians matters. Visible clues include irregular sidewall deformation, unusual tread wear, and bead damage.',
      },
    ],
  },
  {
    slug: 'how-to-read-tire-size',
    title: 'How to Read Tire Size: A Simple Guide to Sidewall Markings',
    headline: 'How to Read Tire Size Numbers',
    metaTitle: 'How to Read Tire Size Numbers: Sidewall Markings Explained',
    metaDescription:
      'Learn to decode tire size codes like 215/55R17. Understand width, aspect ratio, rim diameter, load index, speed rating, and DOT date codes.',
    category: 'buying-guide',
    categoryLabel: 'Buying Guide',
    readTime: '4 min read',
    publishDate: '2026-05-08',
    intro:
      'The string of numbers and letters on your tire sidewall contains everything you need to find the right replacement. Here is how to read it in under 5 minutes.',
    keyFacts: [
      'The main size code (e.g., 215/55R17) tells you width, aspect ratio, and rim diameter',
      'The first three digits are the section width in millimeters (215mm)',
      'The two digits after the slash are the aspect ratio — sidewall height as a percentage of width (55%)',
      'The number at the end (17) is the rim diameter in inches',
      'The DOT code last 4 digits show manufacture week and year (e.g., 2223 = week 22 of 2023)',
    ],
    sections: [
      {
        heading: 'Breaking Down the Main Size Code: 215/55R17',
        type: 'list',
        items: [
          '215 — Section width in millimeters. The width of the tire measured from sidewall to sidewall when mounted.',
          '55 — Aspect ratio. The sidewall height is 55% of the section width (215 × 0.55 = 118mm sidewall height).',
          'R — Construction type. R = Radial (virtually all modern passenger tires are radial).',
          '17 — Rim diameter in inches. This must match your wheel exactly.',
        ],
      },
      {
        heading: 'Service Description: Load Index and Speed Rating',
        type: 'text',
        content:
          'After the size code you will see a number and a letter, such as "94V". The number is the load index — a code that represents the maximum weight the tire can support (94 = 670 kg per tire). The letter is the speed rating — the maximum sustained speed the tire is designed for (V = 149 mph / 240 km/h). Never replace a tire with one that has a lower load index or speed rating than the original specification.',
      },
      {
        heading: 'The DOT Code: Manufacturer and Age',
        type: 'text',
        content:
          'Every US-market tire has a DOT code starting with "DOT" followed by a series of letters and numbers. The last four digits are the most important: they are the week and year of manufacture. "2223" means the tire was made in week 22 of 2023. The rest of the code identifies the plant and tire line — useful for recalls but not for everyday buying decisions.',
      },
      {
        heading: 'Specialty Markings to Know',
        type: 'list',
        items: [
          'M+S or M&S: Mud and Snow rated — usable in light winter conditions',
          '3PMSF (Three Peak Mountain Snowflake): Severe winter service rated',
          'ROF, SSR, EMT, RFT: Run-flat tire designations (vary by manufacturer)',
          'XL or Extra Load: Reinforced sidewall for higher load capacity',
          'P (before size): Passenger car tire specification (US market)',
          'LT (before size): Light Truck specification — load range marked separately',
        ],
      },
      {
        heading: 'Finding the Right Replacement Tire',
        type: 'text',
        content:
          "Your vehicle's door jamb sticker (driver's side door edge) shows the recommended tire size. You can also find it in the owner's manual. When searching for replacements, match all three parts of the size code exactly. Load index and speed rating should match or exceed the original. If you are not sure, our team at any MrGoma location can look up the correct specification for your vehicle.",
      },
    ],
    faqs: [
      {
        question: 'What do the numbers on a tire sidewall mean?',
        answer:
          'The main size code (e.g., 215/55R17) tells you: 215 = width in mm, 55 = aspect ratio (sidewall height as % of width), R = radial construction, 17 = rim diameter in inches. After the size you see a load index and speed rating (e.g., 94V).',
      },
      {
        question: 'How do I know what size tire I need?',
        answer:
          'Check the sticker on your driver\'s side door jamb — it shows the recommended tire size, load index, and speed rating for your vehicle. You can also find this in your owner\'s manual or by checking the sidewall of your current tires.',
      },
      {
        question: 'What does the R mean in a tire size?',
        answer:
          'R stands for Radial, which describes the internal construction of the tire. Nearly all modern passenger and light truck tires are radial. You may also see B (Bias-ply) on older tires or specialty applications.',
      },
      {
        question: 'Can I put a different size tire on my car?',
        answer:
          'Small variations are sometimes acceptable (like going from a 215 to a 225 in width), but major changes affect speedometer accuracy, load capacity, and handling. Always consult with a tire professional before changing tire size.',
      },
    ],
  },
  {
    slug: 'how-long-do-used-tires-last',
    title: 'How Long Do Used Tires Last? What to Expect and When to Replace',
    headline: 'Used Tire Lifespan: What to Expect',
    metaTitle: 'How Long Do Used Tires Last? Lifespan Guide',
    metaDescription:
      'Find out how long used tires last based on tread depth, age, and driving conditions. Learn when to replace used tires and how to extend their life.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    readTime: '5 min read',
    publishDate: '2026-05-12',
    intro:
      'Used tire life depends on three things: how much tread is left, how old the tire is, and how you drive. Here is a practical guide to setting expectations and knowing when to replace.',
    keyFacts: [
      'A used tire with 6/32" of remaining tread can last 15,000 to 25,000 miles under normal driving',
      'Tire age matters as much as tread — replace tires older than 6 years regardless of appearance',
      'Florida heat accelerates rubber degradation; inspect used tires monthly',
      'Proper inflation extends tire life by up to 20% — check pressure monthly',
      'MrGoma only lists used tires online with at least 50% remaining tread life',
    ],
    sections: [
      {
        heading: 'Tread Depth and Mileage Expectations',
        type: 'text',
        content:
          'New tires typically come with 10/32" to 11/32" of tread. A tire at 6/32" (purchased used) has roughly 50-60% of its useful tread life remaining. Under average US driving conditions (12,000-15,000 miles per year), that represents 1 to 2 years of service. Aggressive driving, high-speed driving, and Florida\'s heat all reduce that estimate.',
      },
      {
        heading: 'Approximate Remaining Life by Tread Depth',
        type: 'list',
        items: [
          '8/32" remaining: 20,000-30,000 more miles under normal conditions',
          '6/32" remaining: 12,000-20,000 more miles',
          '4/32" remaining: 5,000-10,000 more miles (adequate for dry conditions; reduced wet grip)',
          '2/32" remaining: Replace immediately — this is the legal minimum in Florida',
        ],
      },
      {
        heading: 'How Driving Style Affects Tire Life',
        type: 'list',
        items: [
          'Hard braking and acceleration: wears tread 30-50% faster than smooth driving',
          'Sharp cornering: causes feathering and uneven shoulder wear',
          'Highway driving at legal speeds: gentler on tires than stop-and-go city driving',
          'Rideshare and delivery driving: expect to replace tires twice as often as a typical driver',
        ],
      },
      {
        heading: 'The Role of Tire Age',
        type: 'text',
        content:
          'Rubber is an organic compound that oxidizes and hardens over time. After 6 years from the manufacture date (check the DOT code), the tire\'s internal structure begins to degrade in ways that are invisible to the naked eye — even if the tread depth is acceptable. This is why the tire industry recommends replacing all tires over 6 years old, and why buying a used tire that is already 5 years old is a short-term solution at best.',
      },
      {
        heading: 'Proper Inflation: The Biggest Factor You Control',
        type: 'text',
        content:
          'Running tires at the correct PSI (found on your door jamb sticker, not the tire sidewall maximum) distributes wear evenly across the tread and reduces heat buildup. Underinflation causes shoulder wear and heat damage. Overinflation causes center-line wear. Check pressure at least monthly — Florida\'s temperature swings cause pressure to fluctuate.',
      },
      {
        heading: 'When to Replace Used Tires Immediately',
        type: 'list',
        items: [
          'Tread depth reaches 2/32" (legal minimum) — or 4/32" for safer wet-weather stopping',
          'Any sidewall crack, bulge, or blister appears',
          'The tire is 6 or more years old from the DOT manufacture date',
          'You experience persistent vibration, pulling, or loss of pressure',
          'After any significant impact (pothole, curb strike) — have the tire inspected',
        ],
      },
    ],
    faqs: [
      {
        question: 'How many miles can you get from a used tire?',
        answer:
          'It depends on the remaining tread depth. A used tire at 6/32" can typically last 12,000 to 20,000 more miles under normal driving conditions. Florida heat and high mileage (rideshare, deliveries) will reduce that estimate.',
      },
      {
        question: 'Should I replace used tires even if they look fine?',
        answer:
          'Yes, if the DOT code shows they are 6 or more years old. Rubber degrades internally over time regardless of how the tread looks. A tire that is 7 years old with 6/32" of tread is still a safety risk.',
      },
      {
        question: 'How can I make my used tires last longer?',
        answer:
          'Keep them properly inflated (check monthly), rotate every 5,000-7,000 miles, get a wheel alignment annually, and drive smoothly. Avoid hard braking, sharp turns, and curb strikes.',
      },
    ],
  },
  {
    slug: 'used-vs-new-tires',
    title: 'Used vs. New Tires: Which Should You Buy?',
    headline: 'Used Tires vs. New: Which Is Right for You?',
    metaTitle: 'Used vs. New Tires: Which Should You Buy? (2026 Guide)',
    metaDescription:
      'Compare used vs. new tires on cost, safety, warranty, and value. Find out when used tires are the smart choice and when you should buy new.',
    category: 'buying-guide',
    categoryLabel: 'Buying Guide',
    readTime: '6 min read',
    publishDate: '2026-05-15',
    intro:
      'The used-vs-new debate comes down to your budget, how many miles you drive, and what kind of driving you do. Here is an honest breakdown of both options.',
    keyFacts: [
      'Quality used tires cost 30-70% less than new tires in the same size',
      'Used tires from reputable shops are safe when properly inspected by ASE-certified technicians',
      'New tires offer full manufacturer warranty and maximum expected lifespan',
      'For high-mileage drivers (rideshare, delivery), used tires offer the best cost-per-mile value',
      'MrGoma\'s 180-day warranty on used tires reduces the risk gap vs. new',
    ],
    sections: [
      {
        heading: 'Cost Comparison',
        type: 'text',
        content:
          'A set of four new mid-range tires (e.g., 215/55R17) typically costs $400 to $700 installed. Used tires in the same size from a reputable shop: $80 to $200 for a set of four. The price difference is real — and on a car with 3-4 years of life left in it, paying $600 for new tires may not make financial sense when used tires at $120 will outlast the car.',
      },
      {
        heading: 'Safety: The Honest Answer',
        type: 'text',
        content:
          'Used tires that pass a rigorous inspection are safe to drive on. The risk with used tires is not the condition of a properly inspected tire — it is buying from sources that do not inspect. A new tire from a reputable manufacturer carries zero unknown history; a properly inspected used tire from a certified shop carries very low risk. The inspection is what matters.',
      },
      {
        heading: 'When Used Tires Make the Most Sense',
        type: 'list',
        items: [
          'You drive a high-mileage or older vehicle that will not outlast a set of new tires',
          'You need tires immediately and your budget is limited',
          'You are a rideshare or delivery driver who goes through tires quickly',
          'You want a cost-effective spare or temporary replacement',
          'You are replacing one or two tires to match an existing set',
        ],
      },
      {
        heading: 'When You Should Buy New Tires',
        type: 'list',
        items: [
          'You drive a new or high-value vehicle and want full manufacturer peace of mind',
          'You drive in severe weather where maximum tread performance matters',
          'You do a lot of highway driving at sustained high speeds',
          'You want a 50,000+ mile treadwear warranty',
          'You are setting up a new vehicle and want matched tires from the start',
        ],
      },
      {
        heading: 'The Warranty Gap — and How MrGoma Closes It',
        type: 'callout',
        content:
          "New tires come with manufacturer warranties covering defects. Most used tire shops offer 30 days or nothing. MrGoma's 180-day warranty on used tires narrows that gap significantly. If a tire fails within 180 days of normal use, we replace it — no questions asked.",
      },
      {
        heading: 'The Bottom Line',
        type: 'text',
        content:
          'If your vehicle is in good shape and you plan to keep it for several years, new tires are the right long-term investment. If your budget is tight, you drive a lot of miles, or your vehicle is older, quality used tires from a reputable shop are a smart, safe choice — especially with a 180-day warranty backing them.',
      },
    ],
    faqs: [
      {
        question: 'Are used tires as safe as new tires?',
        answer:
          'Used tires that pass a proper ASE-certified inspection are safe to drive on. The risk comes from buying uninspected tires. Reputable shops like MrGoma inspect every tire for tread depth, age, sidewall condition, and structural integrity before sale.',
      },
      {
        question: 'How much cheaper are used tires compared to new?',
        answer:
          'Typically 30 to 70 percent less. A set of four new mid-range tires might cost $500-$700 installed; quality used tires in the same size can be $80-$200 for the set. The savings vary by brand, size, and condition.',
      },
      {
        question: 'Can used tires pass a vehicle inspection in Florida?',
        answer:
          'Florida does not require periodic vehicle safety inspections, so there is no state inspection to pass. However, for rideshare platforms like Uber and Lyft, you will need tires with at least 4/32" of tread — which any MrGoma used tire will have, since we require at least 50% remaining life.',
      },
    ],
  },
  {
    slug: 'best-tires-for-uber-lyft-drivers',
    title: 'Best Tires for Uber and Lyft Drivers in Miami & Orlando',
    headline: 'Best Tires for Rideshare Drivers in Florida',
    metaTitle: 'Best Tires for Uber and Lyft Drivers in Miami',
    metaDescription:
      'Find the best tires for Uber and Lyft drivers in Miami and Orlando. High-mileage options, cost-per-mile value, and rideshare pricing at MrGoma Tires.',
    category: 'rideshare',
    categoryLabel: 'Rideshare',
    readTime: '6 min read',
    publishDate: '2026-05-18',
    intro:
      'Rideshare drivers in Florida go through tires twice as fast as average drivers — and every dollar spent on tires comes out of your earnings. Here is how to find the best tires for the way you actually drive.',
    keyFacts: [
      'Rideshare drivers average 30,000-50,000 miles per year vs. 15,000 for typical drivers',
      'Florida\'s heat accelerates tire wear — expect to replace tires more often than colder climates',
      'Uber and Lyft require minimum 4/32" tread depth during vehicle inspections',
      'Used tires offer the best cost-per-mile value for high-mileage rideshare driving',
      'MrGoma offers special rideshare pricing at all 7 Miami and Orlando locations',
    ],
    sections: [
      {
        heading: 'The Unique Demands of Rideshare Driving',
        type: 'text',
        content:
          'A typical US driver puts on 12,000-15,000 miles per year. A full-time Uber or Lyft driver in a major market can hit 40,000-60,000 miles annually. In Miami, add Florida\'s summer heat, frequent stop-and-go traffic, and the occasional airport run at highway speed. Tires that last two years on a normal car may wear out in 8-12 months on a rideshare vehicle.',
      },
      {
        heading: 'What to Look for in a Rideshare Tire',
        type: 'list',
        items: [
          'High mileage rating: Look for tires rated 50,000+ miles. This indicates durable compound.',
          'UTQG treadwear rating above 400: Higher number = harder compound = more miles.',
          'Good wet traction: Miami rain is intense. A tire with high treadwear but poor wet grip is dangerous.',
          'Low road noise: Your passengers will notice a noisy tire. It affects ratings.',
          'Consistent performance: Avoid ultra-performance summer tires that wear fast on hot pavement.',
        ],
      },
      {
        heading: 'Used Tires for Rideshare: The Smart Financial Move',
        type: 'text',
        content:
          'At the miles rideshare drivers cover, tires are a recurring operating cost — not a one-time purchase. Paying $600 for new tires that last 8 months costs more per mile than paying $150 for quality used tires that last 6 months. Quality used tires from MrGoma with 50-70% remaining life are often the best value for drivers who need to manage their cost per mile. Our rideshare pricing makes them even more affordable.',
      },
      {
        heading: 'Uber and Lyft Vehicle Requirements',
        type: 'text',
        content:
          'Both platforms require vehicles to be in safe operating condition, which includes tires with adequate tread. Uber\'s guidelines specify no bald tires and no visible damage. Lyft inspectors specifically check that tread depth is at least 4/32". MrGoma\'s minimum for online sales is 50% remaining life — well above both platforms\' requirements.',
      },
      {
        heading: 'MrGoma\'s Rideshare Program',
        type: 'callout',
        content:
          'MrGoma offers special pricing for Uber and Lyft drivers at all 7 locations in Miami and Orlando. Walk in, show your rideshare app, and ask about our rideshare rate. No appointment needed. We also offer same-day mounting and balancing so you can get back on the road fast.',
      },
    ],
    faqs: [
      {
        question: 'What tires are best for Uber drivers in Florida?',
        answer:
          'High-mileage, all-season tires with a UTQG treadwear rating of 400 or higher work best for Florida rideshare driving. In Miami, wet traction is critical given heavy summer rain. Used tires with 50%+ remaining life offer the best cost-per-mile value for full-time drivers.',
      },
      {
        question: 'How often should Uber and Lyft drivers replace their tires?',
        answer:
          'Full-time rideshare drivers typically need new tires every 6-12 months, depending on mileage. At 40,000 miles per year, you can expect to replace tires 2-3 times annually. Rotate tires every 5,000 miles to extend their life and ensure even wear.',
      },
      {
        question: 'Does Uber or Lyft check tire tread depth?',
        answer:
          'Yes. Lyft inspectors specifically check tread depth and require at least 4/32". Uber requires tires to be in safe condition with no bald spots or visible damage. At MrGoma, all used tires listed online have at least 50% remaining life — well above both platforms\' minimums.',
      },
    ],
  },
  {
    slug: 'rideshare-tire-maintenance-schedule',
    title: 'Rideshare Driver Tire Maintenance Schedule: When to Rotate and Replace',
    headline: 'Rideshare Tire Maintenance: Rotation & Replacement Schedule',
    metaTitle: 'Tire Maintenance Schedule for Uber and Lyft Drivers',
    metaDescription:
      'How often should rideshare drivers rotate and replace tires? A practical maintenance schedule for Uber and Lyft drivers in Miami and Orlando, FL.',
    category: 'rideshare',
    categoryLabel: 'Rideshare',
    readTime: '5 min read',
    publishDate: '2026-05-20',
    intro:
      'Your tires are your most important operating expense as a rideshare driver. A simple maintenance schedule keeps your vehicle platform-compliant, safe for passengers, and your cost-per-mile as low as possible.',
    keyFacts: [
      'Rideshare drivers should rotate tires every 5,000 miles (vs. 7,500 for typical drivers)',
      'Replace tires when tread reaches 4/32" — do not wait for the 2/32" legal minimum',
      'At 40,000 miles per year, expect to replace tires 2-4 times annually',
      'Monthly visual inspection is recommended for Florida rideshare vehicles',
      'Both Uber and Lyft can deactivate your account for unsafe vehicle condition',
    ],
    sections: [
      {
        heading: 'Why Rideshare Vehicles Need More Frequent Maintenance',
        type: 'text',
        content:
          'A typical American driver covers 15,000 miles per year and should rotate tires every 6-12 months. A full-time Miami rideshare driver doing 40,000 miles annually should rotate every 6-8 weeks. The math is simple: more miles equals faster wear equals more frequent attention. Florida\'s heat also means tires heat cycle more often, which accelerates rubber degradation.',
      },
      {
        heading: 'The Rideshare Tire Maintenance Schedule',
        type: 'list',
        items: [
          'Every 5,000 miles: Tire rotation. Moves front tires to rear and vice versa to even out wear patterns.',
          'Every 10,000 miles: Wheel alignment check. Misalignment is the top cause of premature tire wear.',
          'Monthly: Visual inspection. Check for cracks, bulges, and tread depth using the quarter test.',
          'Monthly: Tire pressure check. Miami heat causes significant pressure fluctuation.',
          'At 4/32" tread: Replace immediately. Do not wait for 2/32" — wet-weather performance degrades sharply below 4/32".',
        ],
      },
      {
        heading: 'The True Cost of Ignoring Tire Maintenance',
        type: 'text',
        content:
          'A misaligned vehicle wearing tires unevenly could cost you $200 in tires every 3 months instead of every 6. A platform deactivation for an unsafe vehicle (which does happen) costs you days of income while you resolve it. Tire maintenance is one of the few operating expenses where spending a small amount regularly actually reduces your total annual cost.',
      },
      {
        heading: 'What Uber and Lyft Inspect',
        type: 'list',
        items: [
          'Tread depth: Minimum 4/32" (Lyft explicitly measures this)',
          'No bald spots, cupping, or severe uneven wear',
          'No sidewall damage, bulges, or exposed cord',
          'Spare tire present and properly inflated (on some inspection checklists)',
        ],
      },
      {
        heading: 'Managing Costs: Used Tires for Rideshare',
        type: 'callout',
        content:
          'At 40,000+ annual miles, new tires that cost $600 and last 8 months cost more per mile than quality used tires at $150 that last 6 months. MrGoma\'s rideshare pricing makes this math work in your favor. Ask about our rideshare discount at any of our 7 locations in Miami and Orlando — or contact us via WhatsApp at +1 (407) 364-4016.',
      },
      {
        heading: 'Quick Monthly Inspection: 5-Minute Checklist',
        type: 'list',
        items: [
          'Check all four tire pressures with a gauge (door jamb sticker has correct PSI)',
          'Walk around the car and look at each tire sidewall for cracks or bulges',
          'Do the quarter test on all four tires — insert a quarter into the tread; Washington\'s head should be covered',
          'Check for any vibration or pulling while driving — may indicate alignment or balance issue',
        ],
      },
    ],
    faqs: [
      {
        question: 'How often do Uber drivers need to replace tires?',
        answer:
          'Full-time Uber drivers doing 40,000+ miles per year typically replace tires every 6-12 months. It depends on tire quality, driving style, road conditions, and proper maintenance. Rotating tires every 5,000 miles and keeping them properly inflated extends their life significantly.',
      },
      {
        question: 'What is the minimum tread depth for Uber and Lyft vehicles?',
        answer:
          'Lyft inspectors require at least 4/32" of tread depth. Uber requires tires to be in safe condition with no bald spots or visible damage. Florida state law requires a minimum of 2/32", but 4/32" is the practical safety minimum for wet-road performance in Miami\'s rainy season.',
      },
      {
        question: 'Can Uber and Lyft drivers use used tires?',
        answer:
          'Yes — both platforms require tires to be safe, not necessarily new. Used tires with adequate tread depth (at least 4/32") and no structural damage are compliant with both Uber and Lyft vehicle requirements. MrGoma\'s used tires all exceed this minimum.',
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(g => g.slug === slug);
}
