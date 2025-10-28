'use client';

import React, { FormEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { SearchByText } from '@/app/ui/components';

// Types
 type Condition = 'new' | 'used';

interface LeadForm {
  brand: string; // tire brand
  carBrand: string; // vehicle brand
  year: string;
  condition: Condition | '';
  name: string;
  email: string;
  phone: string;
}

const initialLead: LeadForm = {
  brand: '',
  carBrand: '',
  year: '',
  condition: '',
  name: '',
  email: '',
  phone: '',
};

const SectionCard: React.FC<{ step: number; title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({ step, title, subtitle, children, className = '' }) => (
  <section className={`mb-8 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm ${className}`}>
    <div className="flex items-start gap-3 border-b border-gray-100 px-4 sm:px-6 py-4">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime-400 text-neutral-900 font-semibold text-sm select-none">{step}</span>
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

const carBrandsList = [
  'Toyota','Honda','Ford','Chevrolet','Nissan','Hyundai','Kia','Volkswagen','BMW','Mercedes-Benz',
  'Audi','Mazda','Subaru','Jeep','Tesla','Dodge','Ram','GMC','Cadillac','Acura',
  'Infiniti','Lexus','Volvo','Porsche','Land Rover','Mini','Buick','Chrysler','Mitsubishi','Fiat'
];

const InstantQuote: React.FC = () => {
  const { selectedFilters } = useContext(SelectedFiltersContext);
  const [lead, setLead] = useState<LeadForm>(initialLead);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch brands (unfiltered)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingBrands(true);
    fetch('/api/brands')
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load brands');
        return (await res.json()) as string[];
      })
      .then(list => {
        if (!isMounted) return;
        setBrands(list);
      })
      .catch(() => {
        if (!isMounted) return;
        setBrands([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingBrands(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const sizeText = useMemo(() => {
    const { width, sidewall, diameter } = selectedFilters || {};
    if (!width && !sidewall && !diameter) return '';
    return [width, sidewall, diameter].filter(Boolean).join('/');
  }, [selectedFilters]);

  const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isPhoneValid = (phone: string) => /[0-9]{7,}/.test(phone.replace(/\D/g, ''));
  const isYearValid = (year: string) => {
    const y = Number(year);
    const now = new Date().getFullYear();
    return Number.isInteger(y) && y >= 1980 && y <= now + 1;
  };

  const allRequiredFilled =
    Boolean(sizeText) &&
    Boolean(lead.brand) &&
    Boolean(lead.carBrand) &&
    isYearValid(lead.year) &&
    (lead.condition === 'new' || lead.condition === 'used') &&
    lead.name.trim().length > 1 &&
    isEmailValid(lead.email) &&
    isPhoneValid(lead.phone);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLead(prev => ({ ...prev, [name]: value }));
  };

  // Focus feedback banners when they appear
  useEffect(() => {
    if (error) {
      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorRef.current?.focus();
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      requestAnimationFrame(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        successRef.current?.focus();
      });
    }
  }, [success]);

  const focusFirstInvalid = () => {
    const form = formRef.current;
    if (!form) return;
    const requiredIds = ['tireSize', 'brand', 'carBrand', 'year', 'condition', 'name', 'email', 'phone'];
    for (const id of requiredIds) {
      const el = form.querySelector<HTMLElement>(`#${id}`);
      if (!el) continue;
      if (id === 'tireSize' && !sizeText) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'brand' && !lead.brand) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'carBrand' && !lead.carBrand) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'year' && !isYearValid(lead.year)) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'condition' && !(lead.condition === 'new' || lead.condition === 'used')) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'name' && !(lead.name.trim().length > 1)) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'email' && !isEmailValid(lead.email)) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
      if (id === 'phone' && !isPhoneValid(lead.phone)) {
        el.focus();
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!allRequiredFilled) {
      setError('Please complete all required fields correctly.');
      focusFirstInvalid();
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/instant-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: sizeText,
          width: selectedFilters.width,
          sidewall: selectedFilters.sidewall,
          diameter: selectedFilters.diameter,
          tireBrand: lead.brand,
          carBrand: lead.carBrand,
          year: lead.year,
          condition: lead.condition,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          submittedAt: new Date().toISOString(),
          source: 'instant-quote',
        }),
      });
      if (!res.ok) {
        const m = await res.json().catch(() => ({}));
        throw new Error(m?.message || 'Failed to submit');
      }
      setSuccess(true);
      setLead(initialLead);
    } catch (err: any) {
      setError(err?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Instant Quote
          </h1>
          <p className="text-sm text-gray-600 mt-1">Get a quick quote by entering your tire size and basic vehicle details, then share your contact info. We&#39;ll reach out shortly.</p>
        </header>

        {/* Segment 1: Size + Brand + Year + Condition */}
        <SectionCard step={1} title="Vehicle & Tire" subtitle="Enter your tire size and basic vehicle details.">
          <div className="lg:col-span-2">
            <SearchByText showButton={false} enableSubmit={false} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="brand">
                Tire Brand
              </label>
              <select
                id="brand"
                name="brand"
                value={lead.brand}
                onChange={handleChange}
                aria-describedby="brandHelp"
                className={`w-full bg-white border rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm ${isLoadingBrands ? 'border-gray-200 text-gray-400' : 'border-gray-300'}`}
                required
                disabled={isLoadingBrands || brands.length === 0}
              >
                <option value="" disabled>
                  {isLoadingBrands ? 'Loading brands…' : 'Select brand'}
                </option>
                {brands.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <p id="brandHelp" className="text-xs text-gray-500 mt-1">Choose your tire brand.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="carBrand">
                Car Brand
              </label>
              <select
                id="carBrand"
                name="carBrand"
                value={lead.carBrand}
                onChange={handleChange}
                aria-describedby="carBrandHelp"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                required
              >
                <option value="" disabled>
                  Select car brand
                </option>
                {carBrandsList.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <p id="carBrandHelp" className="text-xs text-gray-500 mt-1">Choose your vehicle brand.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="year">
                Year Car Model
              </label>
              <input
                id="year"
                name="year"
                type="number"
                inputMode="numeric"
                value={lead.year}
                onChange={handleChange}
                placeholder="e.g. 2020"
                aria-describedby="yearHelp yearError"
                aria-invalid={lead.year !== '' && !isYearValid(lead.year)}
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                required
                min={1980}
                max={new Date().getFullYear() + 1}
              />
              <p id="yearHelp" className="text-xs text-gray-500 mt-1">Enter the model year (1980 to present).</p>
              {!isYearValid(lead.year) && lead.year !== '' && (
                <p id="yearError" className="text-xs text-red-600 mt-1">Enter a valid year.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="condition">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={lead.condition}
                onChange={handleChange}
                aria-describedby="conditionHelp"
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                required
              >
                <option value="" disabled>
                  Select condition
                </option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
              <p id="conditionHelp" className="text-xs text-gray-500 mt-1">Is the tire new or used?</p>
            </div>
          </div>

          {/* Helper showing current size captured */}
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Selected size:</span>{' '}
            {sizeText ? (
              <span className="text-gray-800">{sizeText}</span>
            ) : (
              <span className="text-red-600">Please enter tire size above.</span>
            )}
          </div>
        </SectionCard>

        {/* Segment 2: Lead info */}
        <SectionCard step={2} title="Contact information" subtitle="We will use this to send your quote.">
          <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={lead.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">First and last name.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={lead.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  aria-describedby="emailError"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                  required
                />
                {lead.email && !isEmailValid(lead.email) && (
                  <p id="emailError" className="text-xs text-red-600 mt-1">Enter a valid email.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={lead.phone}
                  onChange={handleChange}
                  placeholder="(555) 555-5555"
                  aria-describedby="phoneError"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                  required
                />
                {lead.phone && !isPhoneValid(lead.phone) && (
                  <p id="phoneError" className="text-xs text-red-600 mt-1">Enter a valid phone.</p>
                )}
              </div>
            </div>

            {/* Hidden fields mirroring Segment 1 to include in the same submitting */}
            <input type="hidden" name="brandHidden" value={lead.brand} readOnly />
            <input type="hidden" name="carBrandHidden" value={lead.carBrand} readOnly />
            <input type="hidden" name="yearHidden" value={lead.year} readOnly />
            <input type="hidden" name="conditionHidden" value={lead.condition} readOnly />

            {error && (
              <div
                ref={errorRef}
                tabIndex={-1}
                className="lg:col-span-2 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3"
                role="alert"
                aria-live="assertive"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM10 13a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="lg:col-span-2 flex flex-col sm:flex-row items-start gap-3 sm:items-center justify-between">
              <p className="text-xs text-gray-500">By sending, you agree to be contacted about your quote.</p>
              <button
                type="submit"
                disabled={!allRequiredFilled || submitting}
                className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 text-sm font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors ${
                  !allRequiredFilled || submitting
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {submitting ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Segment 3: Success notice */}
        {success && (
          <section
            ref={successRef}
            tabIndex={-1}
            aria-live="polite"
            className="rounded-md border border-green-200 bg-green-50 p-4 flex items-start gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600 mt-0.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L9 10.94 7.28 9.22a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700">
              Your information was sent successfully. We will contact you shortly.
            </p>
          </section>
        )}
      </div>
    </main>
  );
};

export default InstantQuote;
