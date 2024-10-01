import {
    ShieldCheckIcon,
    PhoneIcon,
    TruckIcon,
    WrenchIcon,
  } from '@heroicons/react/24/outline';

export const benefits = [
    {
        icon: <ShieldCheckIcon
        aria-hidden="true"
        className="w-10 h-10 mx-auto text-green-primary"
        />,
        title: "Guaranteed tires",
        description: "High-quality tires with up to 180 days warranty on used tires. Specializing in luxury brands."
    },
    {
        icon: <PhoneIcon
        aria-hidden="true"
        className="w-10 h-10 mx-auto text-green-primary"
        />,
        title: "After sales suport",
        description: "Rely on our after-sales support for troubleshooting and inquiries to ensure your satisfaction"
    },
    {
        icon: <TruckIcon
        aria-hidden="true"
        className="w-10 h-10 mx-auto text-green-primary"
        />,
        title: "Fast shipping",
        description: "Free US shipping, same-day before 4 p.m., insurance included. Canada, Hawaii, Puerto Rico, request a quote"
    },
    {
        icon: <WrenchIcon
        aria-hidden="true"
        className="w-10 h-10 mx-auto text-green-primary"
        />,
        title: "Certified technicians",
        description: "Trust certified ASE technicians at MrGoma Tires for professional service."
    }
]