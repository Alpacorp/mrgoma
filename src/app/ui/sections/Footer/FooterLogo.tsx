import Link from "next/link";

import { ArrowsToRight } from '@/app/ui/icons';

export const FooterLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex items-center">
        <div className="flex items-center mr-2">
          <div className="flex">
            <ArrowsToRight className="w-20 h-6" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[#9dfb40] text-sm font-medium leading-none">Mr Goma</span>
          <span className="text-white text-xl font-bold leading-none">TIRES</span>
        </div>
      </div>
    </Link>
  );
};
