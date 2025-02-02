import Image from 'next/image';
import { FC } from 'react';

const Footer: FC = () => {
  const locations = [
    {
      name: 'US1',
      phone: '(305)278-4632',
    },
    {
      name: '441',
      phone: '(305)770-1154',
    },
    {
      name: '27th',
      phone: '(786)703-4807',
    },
    {
      name: 'Coral Gables',
      phone: '(305)713-1258',
    },
  ];

  return (
    <footer className="relative mt-20">
      {/* Fondo oscuro con overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black z-10" />

      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/background-footer.png"
          alt="Tire background"
          width={1920}
          height={400}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      <div className="relative z-20 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo y descripción */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-green-500 text-3xl font-bold">»»</div>
              <h2 className="text-2xl font-bold text-white">
                Mr<span className="text-green-500">Goma</span>
                <span className="block text-white">TIRES</span>
              </h2>
            </div>
            <p className="text-gray-300 text-sm max-w-xs">
              Here, you&#39;ll find New Tires, Used Tires, Run Flat Tires and Tires for Off Lease
              Return, Mercedes Benz, Audi, BMW, Range Rover, Porsche, Corvette, Mustang, Volvo,
              Lexus, Infinity Tires.
            </p>
          </div>

          {/* Contact Us */}
          <div className="md:col-span-4">
            <h3 className="text-white font-semibold text-lg mb-6">CONTACT US</h3>
            <div className="space-y-6">
              {locations.map((location, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {/* Map Pin Icon */}
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">{location.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {/* Phone Icon */}
                      <svg
                        className="w-4 h-4 text-green-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <a
                        href={`tel:${location.phone.replace(/[()-]/g, '')}`}
                        className="text-gray-300 hover:text-green-500 transition-colors text-sm"
                      >
                        {location.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center space-x-3">
                {/* Mail Icon */}
                <svg
                  className="w-5 h-5 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:info@mrgomatires.com"
                  className="text-gray-300 hover:text-green-500 transition-colors text-sm"
                >
                  info@mrgomatires.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-green-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-green-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-300 hover:text-green-500 transition-colors"
                >
                  Services
                </a>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div className="md:col-span-3">
            <h3 className="text-white font-semibold text-lg mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              {/* Facebook Icon */}
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Twitter Icon */}
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              {/* Instagram Icon */}
              <a
                href="#"
                className="text-gray-300 hover:text-green-500 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Copyright {new Date().getFullYear()} - Mr Goma Tires. All Rights Reserved
            </p>
            <div className="mt-4 md:mt-0">
              <a
                href="/privacy"
                className="text-gray-400 hover:text-green-500 text-sm transition-colors"
              >
                Privacy & Terms of use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
