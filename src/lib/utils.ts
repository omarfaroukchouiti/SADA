import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumber(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
}

export function verseKey(surah: number, ayah: number) {
  return `${surah}:${ayah}`;
}
