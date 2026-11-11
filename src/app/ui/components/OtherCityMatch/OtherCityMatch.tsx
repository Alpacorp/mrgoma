'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useVisitorCity } from '@/app/context/VisitorCityContext';
import type { VisitorCityName } from '@/app/utils/visitorCity';

/** The 041 query returns at most 60 tires; 60 means "60 or more". */
const QUERY_CAP = 60;

type Match = { count: number; href?: string };

/**
 * "· 3 like this in Miami →" (feature 043, FR5), appended **on the same line**
 * as "Located in Orlando", so the page does not move when it appears (AC8).
 * Asks the server only when the visitor's city differs from the tire's; says
 * nothing on no match, on error, or with no visitor city.
 */
const OtherCityMatch = ({ tireId, tireCity }: { tireId: string; tireCity: VisitorCityName }) => {
  const { city, status } = useVisitorCity();
  const [match, setMatch] = useState<Match | null>(null);
  const other = status === 'ready' && city && city !== tireCity ? city : null;

  useEffect(() => {
    setMatch(null);
    if (!other) return;
    let alive = true;
    fetch(
      `/api/tire-sets/elsewhere?id=${encodeURIComponent(tireId)}&city=${encodeURIComponent(other)}`
    )
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((data: Match | null) => {
        if (alive && data && data.count > 0 && data.href) setMatch(data);
      });
    return () => {
      alive = false;
    };
  }, [other, tireId]);

  if (!other || !match?.href) return null;
  const count = match.count >= QUERY_CAP ? `${QUERY_CAP}+` : String(match.count);

  return (
    <>
      {' · '}
      <Link
        href={match.href}
        data-track="city_match_open"
        data-track-category="visitor_city"
        data-track-label={other}
        className="font-semibold text-green-700 underline underline-offset-2 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-sm"
      >
        {`${count} like this in ${other} →`}
      </Link>
    </>
  );
};

export default OtherCityMatch;
