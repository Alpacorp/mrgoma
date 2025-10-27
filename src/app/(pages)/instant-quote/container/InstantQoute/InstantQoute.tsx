'use client';

import React, { FormEvent, useContext, useEffect, useMemo, useState } from 'react';

import { SelectedFiltersContext } from '@/app/context/SelectedFilters';
import { SearchByText } from '@/app/ui/components';

type Condition = 'new' | 'used';

interface LeadForm {
  brand: string;
  year: string;
  condition: Condition | '';
  name: string;
  email: string;
  phone: string;
}

const initialLead: LeadForm = {
  brand: '',
  year: '',
  condition: '',
  name: '',
  email: '',
  phone: '',
};

const InstantQuote: React.FC = () => {
  const { selectedFilters } = useContext(SelectedFiltersContext);
  const [lead, setLead] = useState<LeadForm>(initialLead);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    sizeText &&
    lead.brand &&
    isYearValid(lead.year) &&
    (lead.condition === 'new' || lead.condition === 'used') &&
    lead.name.trim().length > 1 &&
    isEmailValid(lead.email) &&
    isPhoneValid(lead.phone);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLead(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!allRequiredFilled) {
      setError('Please complete all required fields correctly.');
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
          brand: lead.brand,
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Instant Quote
        </h1>

        {/* Segmento 1: Size + Brand + Year + Condition */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicle & Tire</h2>

          <div className="lg:col-span-2">
            <SearchByText showButton={false} enableSubmit={false} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-12">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="brand">
                Brand Car
              </label>
              <select
                id="brand"
                name="brand"
                value={lead.brand}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                required
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
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                required
                min={1980}
                max={new Date().getFullYear() + 1}
              />
              {!isYearValid(lead.year) && lead.year !== '' && (
                <p className="text-xs text-red-600 mt-1">Enter a valid year.</p>
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
                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                required
              >
                <option value="" disabled>
                  Select condition
                </option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
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
        </section>

        {/* Segmento 2: Lead info */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact information</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                  required
                />
                {lead.email && !isEmailValid(lead.email) && (
                  <p className="text-xs text-red-600 mt-1">Enter a valid email.</p>
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
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm"
                  required
                />
                {lead.phone && !isPhoneValid(lead.phone) && (
                  <p className="text-xs text-red-600 mt-1">Enter a valid phone.</p>
                )}
              </div>
            </div>

            {/* Hidden fields mirroring Segment 1 to include in the same submitting */}
            <input type="hidden" name="brandHidden" value={lead.brand} readOnly />
            <input type="hidden" name="yearHidden" value={lead.year} readOnly />
            <input type="hidden" name="conditionHidden" value={lead.condition} readOnly />

            {error && (
              <div className="lg:col-span-2 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={!allRequiredFilled || submitting}
                className={`w-full sm:w-auto px-6 py-2 text-sm font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors ${
                  !allRequiredFilled || submitting
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {submitting ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </section>

        {/* Segmento 3: Aviso de envío correcto */}
        {success && (
          <section
            aria-live="polite"
            className="rounded-md border border-green-200 bg-green-50 p-4"
          >
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
