export const formatTireSize = (numbers: string): string => {
  if (numbers.length <= 3) {
    return numbers;
  }
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 3)}/${numbers.slice(3, 5)}`;
  }
  return `${numbers.slice(0, 3)}/${numbers.slice(3, 5)}/${numbers.slice(5, 7)}`;
};
