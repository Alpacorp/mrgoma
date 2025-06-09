import Link from 'next/link';

import type { FooterSection as FooterSectionType } from '@/app/ui/sections/Footer/footer-section';

interface FooterSectionProps {
  section: FooterSectionType;
}

export const FooterSection = ({ section }: FooterSectionProps) => {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">{section.title}</h3>
      <ul className="space-y-3">
        {section.links.map(link => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#9dfb40] transition-colors duration-200"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-gray-300 hover:text-[#9dfb40] transition-colors duration-200"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
