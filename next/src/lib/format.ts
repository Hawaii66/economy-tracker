export const formatCentSEK = (amount: number) => {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
};

export const formatLargeNumber = (number: number) => {
  return new Intl.NumberFormat("sv-SE", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
};
