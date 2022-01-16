/**
 * Picks a random value from an an array of type T.
 */
export const pickRandom = <T>(arr: T[] | readonly T[]): T | undefined => {
  const index = Math.floor(Math.random() * arr.length);
  return arr?.[index];
};

/**
 * Calculates the dates between two dates
 */
export const getDaysBetween = (dt2: Date, dt1: Date): number => {
  var diff = Math.abs(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60 * 24;
  return Math.abs(Math.round(diff));
};
