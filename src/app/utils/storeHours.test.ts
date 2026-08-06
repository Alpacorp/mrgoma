import { describe, expect, it } from 'vitest';

import { DEFAULT_HOURS, locationsConfig } from '@/app/(shop)/locations/locationsConfig';

import { formatDays, formatHours, formatSpan, formatTime, weeklyHours } from './storeHours';

describe('formatTime', () => {
  it('renders the config 24h values as customers read them', () => {
    expect(formatTime('08:00')).toBe('8:00 AM');
    expect(formatTime('18:00')).toBe('6:00 PM');
    expect(formatTime('10:00')).toBe('10:00 AM');
    expect(formatTime('16:00')).toBe('4:00 PM');
  });

  it('keeps noon and midnight on the right side of the clock', () => {
    // The classic off-by-twelve: `12 % 12` is 0, which reads as "0:00 PM".
    expect(formatTime('12:00')).toBe('12:00 PM');
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('12:30')).toBe('12:30 PM');
  });
});

describe('formatDays', () => {
  it('collapses a consecutive run', () => {
    expect(formatDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])).toBe(
      'Mon–Sat'
    );
  });

  it('lists the days out when the run has a gap', () => {
    // "Mon–Sat" for a shop closed on Wednesday sends someone to a locked door,
    // so a gap must never be smoothed into a range.
    expect(formatDays(['Monday', 'Tuesday', 'Thursday', 'Friday'])).toBe('Mon, Tue, Thu, Fri');
  });

  it('leaves one or two days alone', () => {
    expect(formatDays(['Sunday'])).toBe('Sun');
    expect(formatDays(['Saturday', 'Sunday'])).toBe('Sat, Sun');
  });
});

describe('formatHours', () => {
  it('joins the spans the way the store card reads them', () => {
    expect(formatHours(DEFAULT_HOURS)).toBe('Mon–Sat: 8:00 AM – 6:00 PM | Sun: 10:00 AM – 4:00 PM');
  });

  it('uses one spacing for a span everywhere it appears', () => {
    // Three surfaces used to render this independently. One shape now, so a
    // reader moving between them sees the same string.
    expect(formatSpan({ days: ['Monday'], opens: '08:00', closes: '18:00' })).toBe(
      '8:00 AM – 6:00 PM'
    );
  });
});

describe('weeklyHours', () => {
  it('returns the seven days in order', () => {
    const week = weeklyHours(DEFAULT_HOURS);
    expect(week.map(d => d.day)).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]);
  });

  it('spells out a day no span covers rather than dropping it', () => {
    // A missing row reads as an oversight; "Closed" answers the question the
    // visitor arrived with.
    const week = weeklyHours([
      {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ]);
    expect(week.find(d => d.day === 'Saturday')).toEqual({ day: 'Saturday', time: 'Closed' });
    expect(week.find(d => d.day === 'Monday')).toEqual({
      day: 'Monday',
      time: '8:00 AM – 6:00 PM',
    });
  });
});

describe('the contact page assumption', () => {
  it('holds only while every store keeps the shared hours', () => {
    // /contact speaks for the chain and renders DEFAULT_HOURS. The config
    // models hours per store so one may diverge — on the day one does, this
    // fails, and whoever made the change has to decide what that page should
    // say instead of silently misinforming a customer.
    for (const store of locationsConfig) {
      expect(store.hours, `${store.name} no longer uses the shared hours`).toEqual(DEFAULT_HOURS);
    }
  });
});
