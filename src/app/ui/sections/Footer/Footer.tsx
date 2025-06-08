import Link from 'next/link';

import type {
  FooterProps,
  FooterSection as FooterSectionType,
  SocialLink,
} from '@/app/ui/sections/Footer/footer-section';
import { FooterLogo } from '@/app/ui/sections/Footer/FooterLogo';
import { FooterSection } from '@/app/ui/sections/Footer/FooterSection';
import { SocialIcon } from '@/app/ui/sections/Footer/SocialIcons';

const defaultSections: FooterSectionType[] = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Shop', href: '/shop' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Warranties', href: '/warranties' },
      { label: 'Special Orders', href: '/special-orders' },
      { label: 'Find a Store', href: '/locations' },
    ],
  },
];

const defaultSocialLinks: SocialLink[] = [
  {
    platform: 'instagram',
    href: 'https://instagram.com/mrgomatires',
    icon: 'instagram',
  },
  {
    platform: 'facebook',
    href: 'https://facebook.com/mrgomatires',
    icon: 'facebook',
  },
];

export const Footer = ({
  className = '',
  sections = defaultSections,
  socialLinks = defaultSocialLinks,
  copyrightYear = new Date().getFullYear(),
  companyName = 'Mr. Goma TIRES',
}: FooterProps) => {
  return (
    <footer className={`bg-black relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-1">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/assets/images/background-footer.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <FooterLogo />
            </div>
            {sections.map(section => (
              <FooterSection key={section.title} section={section} />
            ))}
            <div className="lg:col-span-1">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                Follow us
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#9dfb40]"
                >
                  <path
                    d="M9 5L15 12L9 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </h3>
              <div className="flex gap-4">
                {socialLinks.map(social => (
                  <a
                    key={social.platform}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9dfb40] hover:text-[#7bc42d] transition-colors duration-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                    aria-label={`Follow us on ${social.platform}`}
                  >
                    <SocialIcon platform={social.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600" />
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm">
              All rights reserved{' '}
              <span className="text-[#9dfb40] font-semibold">{companyName}</span> {copyrightYear}
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-gray-300 hover:text-[#9dfb40] transition-colors duration-200 text-sm"
              >
                Terms and Conditions
              </Link>
              <Link
                href="#"
                className="text-gray-300 hover:text-[#9dfb40] transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
