'use client';

import { type ChangeEvent, useState } from 'react';

// Función que limpia el input y devuelve solo números
const cleanInput = (input: string): string => input.replace(/\D/g, '');

// Función que formatea el número según el patrón XXX/XX RXX
const formatTireSize = (numbers: string): string => {
  if (numbers.length <= 3) {
    return numbers;
  }
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 3)}/${numbers.slice(3, 5)}`;
  }
  return `${numbers.slice(0, 3)}/${numbers.slice(3, 5)} R${numbers.slice(5, 7)}`;
};

// Función de validación de formato
const isValidTireSize = (value: string): boolean => {
  return /^\d{3}\/\d{2}\sR\d{2}$/.test(value);
};

export const TireSearchInput = () => {
  const [value, setValue] = useState('');

  // Lógica para manejar el cambio del input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const cleanedInput = cleanInput(rawInput);
    const formattedInput = formatTireSize(cleanedInput);
    setValue(formattedInput);
  };

  // Lógica para permitir solo ciertos caracteres
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = /^[0-9/ R]$/;
    if (!allowedKeys.test(e.key) && e.key !== 'Backspace') {
      e.preventDefault();
    }
  };

  // Lógica para la búsqueda, validando el formato del valor
  const handleSearch = () => {
    if (!isValidTireSize(value)) {
      alert('Please enter a valid tire size (e.g. 255/55 R18)');
      return;
    }
    console.log('Searching for:', value);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-10 w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Enter tire size (e.g. 255/55 R18)"
        className="flex-1 px-4 py-2 border w-full border-gray-300 rounded focus:outline-none focus:border-[#00B207]"
      />
      <button
        onClick={handleSearch}
        className="px-6 py-2 bg-[#00B207] hover:bg-[#009606] text-white rounded transition-colors"
      >
        Search
      </button>
    </div>
  );
};
