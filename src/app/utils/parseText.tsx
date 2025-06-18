import React from 'react';

export const parseText = (description: string): React.ReactNode[] => {
  const parts = description.split(/(<strong>|<\/strong>)/g);
  const result: React.ReactNode[] = [];

  let isStrong = false;

  for (const part of parts) {
    if (part === '<strong>') {
      isStrong = true;
    } else if (part === '</strong>') {
      isStrong = false;
    } else if (part) {
      result.push(
        isStrong ? (
          <strong key={result.length} className="font-semibold text-black">
            {part}
          </strong>
        ) : (
          <span key={result.length}>{part}</span>
        )
      );
    }
  }

  return result;
};
