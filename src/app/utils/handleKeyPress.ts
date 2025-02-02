import React from 'react';

export const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = /^[0-9/]$/;
  if (!allowedKeys.test(e.key) && e.key !== 'Backspace') {
    e.preventDefault();
  }
};
