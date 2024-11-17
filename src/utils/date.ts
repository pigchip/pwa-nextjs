// date.ts
import { format } from 'date-fns-tz';

export const getMexicoCityDateTime = () => {
  const mexicoCityTimeZone = 'America/Mexico_City';
  const currentDate = new Date();
  const date = format(currentDate, 'yyyy-MM-dd', { timeZone: mexicoCityTimeZone });
  const time = format(currentDate, 'HH:mm:ss', { timeZone: mexicoCityTimeZone });

  return { date, time };
};