'use client';

const locations = [
  {
    id: '01',
    name: 'Miami – South (US-1)',
    address: '18200 S Dixie Hwy, Miami, FL 33157',
    phone: '(305)-278-4632',
    tel: 'tel:+13052784632',
    map: 'https://maps.app.goo.gl/RTpygmaN6vMcPxmX8',
    area: 'Cutler Bay · Palmetto Bay · Kendall',
  },
  {
    id: '02',
    name: 'Miami – Airport',
    address: '3251 NW 27th Ave, Miami, FL 33142',
    phone: '(305)-456-9588',
    tel: 'tel:+13054569588',
    map: 'https://maps.app.goo.gl/1gpRJFveeqs3hM7G9',
    area: 'Allapattah · Midtown · MIA Airport',
  },
  {
    id: '03',
    name: 'Miami – North (441)',
    address: '20282 NW 2nd Ave, Miami, FL 33169',
    phone: '(305)-770-1154',
    tel: 'tel:+13057701154',
    map: 'https://maps.app.goo.gl/G79tY9zNu7ETtru8A',
    area: 'Miami Gardens · Hollywood · Aventura',
  },
  {
    id: '04',
    name: 'Miami – Coral Gables',
    address: '900 South Le Jeune Rd, Miami, FL 33134',
    phone: '(305)-713-1258',
    tel: 'tel:+13057131258',
    map: 'https://maps.app.goo.gl/99HuCuuroqTVZRdz8',
    area: 'Coral Gables · Westchester · Near MIA',
  },
  {
    id: '05',
    name: 'Miami – Hialeah',
    address: '4040 E 10th Ct, Hialeah, FL 33013',
    phone: '(305)-836-4200',
    tel: 'tel:+13058364200',
    map: 'https://maps.app.goo.gl/oF6vhCsS7MdikcYX8',
    area: 'Hialeah · Miami Springs · East Hialeah',
  },
  {
    id: '06',
    name: 'Orlando – West Colonial',
    address: '4400 W Colonial Dr, Orlando, FL 32808',
    phone: '(407)-203-3912',
    tel: 'tel:+14072033912',
    map: 'https://maps.app.goo.gl/n32Upo4RiH9PWJVA7',
    area: 'Midtown · Wintergarden · West Orlando',
  },
  {
    id: '07',
    name: 'Orlando – Semoran',
    address: '575 N Semoran Blvd, Orlando, FL 32807',
    phone: '(407)-282-3100',
    tel: 'tel:+14072823100',
    map: 'https://maps.app.goo.gl/fuDXk1EAKZ5ZAvpu6',
    area: 'Azalea Park · Winter Park · East Orlando',
  },
];

const hours = [
  { day: 'Monday', time: '8:00 AM – 6:00 PM' },
  { day: 'Tuesday', time: '8:00 AM – 6:00 PM' },
  { day: 'Wednesday', time: '8:00 AM – 6:00 PM' },
  { day: 'Thursday', time: '8:00 AM – 6:00 PM' },
  { day: 'Friday', time: '8:00 AM – 6:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 6:00 PM' },
  { day: 'Sunday', time: '10:00 AM – 4:00 PM' },
];

const trust = [
  { label: 'ASE Certified', icon: '✦' },
  { label: '180-Day Warranty', icon: '✦' },
  { label: 'Free Shipping', icon: '✦' },
  { label: 'Est. Miami, FL', icon: '✦' },
];

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0"
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export default function Contact() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative border-b border-white/8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9dfb40]/30 to-transparent" />
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #9dfb40 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-8 h-px bg-[#9dfb40]" />
            <span className="text-[#9dfb40] text-xs font-semibold tracking-[0.2em] uppercase">
              Get In Touch
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            Contact
            <br />
            <span className="text-[#9dfb40]">MrGoma</span> Tires
          </h1>

          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Seven locations across Miami and Orlando, FL — all staffed with ASE-certified
            technicians ready to help you find the right tire at the right price.
          </p>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <ul className="flex flex-wrap items-center divide-x divide-white/8">
            {trust.map(item => (
              <li
                key={item.label}
                className="flex items-center gap-2.5 px-6 py-4 first:pl-0 last:pr-0"
              >
                <span className="text-[#9dfb40] text-xs">{item.icon}</span>
                <span className="text-sm font-medium text-white/80 whitespace-nowrap">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="bg-[#9dfb40] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-black/50 text-xs font-bold tracking-widest uppercase mb-1">
              Fastest response
            </p>
            <h2 className="text-black text-3xl sm:text-4xl font-black tracking-tight">
              Chat with us on WhatsApp
            </h2>
            <p className="text-black/70 mt-2 text-sm">
              Available Mon–Sat 8am–6pm · Usually replies in minutes
            </p>
          </div>
          <a
            href="https://wa.me/14073644016"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-black text-[#9dfb40] font-bold px-8 py-4 rounded-full text-base whitespace-nowrap hover:bg-zinc-900 transition-colors duration-200 shrink-0"
          >
            <WhatsAppIcon />
            Open WhatsApp
          </a>
        </div>
      </section>

      {/* ── Locations ── */}
      <section className="bg-[#111]">
       <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[#9dfb40] text-xs font-bold tracking-widest uppercase mb-2">
              Our Locations
            </p>
            <h2 className="text-3xl font-black tracking-tight">
              Find your nearest shop
            </h2>
          </div>
          <span className="text-6xl font-black text-white/5 select-none hidden sm:block">
            07
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 border border-white/8 rounded-2xl overflow-hidden">
          {locations.map(loc => (
            <article
              key={loc.id}
              className="bg-[#0a0a0a] p-6 flex flex-col gap-4 group hover:bg-white/[0.03] transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[#9dfb40] text-xs font-bold tracking-widest">
                  {loc.id}
                </span>
                <span className="text-[10px] text-white/30 font-medium text-right leading-tight">
                  {loc.area}
                </span>
              </div>

              <h3 className="font-bold text-base text-white leading-tight">
                {loc.name}
              </h3>

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-start gap-2 text-gray-400 text-sm">
                  <MapPinIcon />
                  <span>{loc.address}</span>
                </div>

                <a
                  href={loc.tel}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#9dfb40] transition-colors duration-150 w-fit"
                >
                  <PhoneIcon />
                  {loc.phone}
                </a>
              </div>

              <a
                href={loc.map}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9dfb40] hover:gap-2.5 transition-all duration-200 mt-auto w-fit"
              >
                Get Directions
                <ArrowIcon />
              </a>
            </article>
          ))}
        </div>
       </div>
      </section>

      {/* ── Hours + Email ── */}
      <section className="border-t border-white/8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Hours */}
          <div>
            <p className="text-[#9dfb40] text-xs font-bold tracking-widest uppercase mb-2">
              Store Hours
            </p>
            <h2 className="text-3xl font-black tracking-tight mb-8">
              When we're open
            </h2>

            <ul className="divide-y divide-white/8">
              {hours.map(row => {
                const isSunday = row.day === 'Sunday';
                return (
                  <li
                    key={row.day}
                    className="flex items-center justify-between py-3.5 gap-4"
                  >
                    <span className={`text-sm font-medium ${isSunday ? 'text-gray-400' : 'text-white'}`}>
                      {row.day}
                    </span>
                    <span className={`text-sm tabular-nums ${isSunday ? 'text-gray-500' : 'text-gray-300'}`}>
                      {row.time}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 text-xs text-gray-600 leading-relaxed">
              Hours may vary by location. Contact the specific shop before visiting.
            </p>
          </div>

          {/* Email + General contact */}
          <div className="flex flex-col justify-start gap-8">
            <div>
              <p className="text-[#9dfb40] text-xs font-bold tracking-widest uppercase mb-2">
                General Inquiries
              </p>
              <h2 className="text-3xl font-black tracking-tight mb-6">
                Other ways to reach us
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                  Email
                </span>
                <a
                  href="mailto:info@mrgomatires.com"
                  className="text-white hover:text-[#9dfb40] transition-colors font-medium text-lg"
                >
                  info@mrgomatires.com
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                  WhatsApp
                </span>
                <a
                  href="https://wa.me/14073644016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#9dfb40] transition-colors font-medium text-lg inline-flex items-center gap-2"
                >
                  <WhatsAppIcon />
                  +1 (407) 364-4016
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                  Coverage
                </span>
                <span className="text-white font-medium text-lg">
                  Miami & Orlando, FL
                </span>
                <span className="text-gray-500 text-sm">
                  Shipping available nationwide
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
