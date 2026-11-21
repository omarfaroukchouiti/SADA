export type Surah = {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation?: string;
  revelationPlace: string;
  revelationOrder: number;
  bismillahPre: boolean;
  versesCount: number;
  pages: [number, number];
};

export type Verse = {
  surah: number;
  ayah: number;
  text: string;
  juz?: number;
};

export type Reciter = {
  id: number;
  name: string;
  nameArabic: string;
  style: string;
};

export type AudioTrack = {
  reciterId: number;
  reciterName: string;
  reciterNameArabic: string;
  style: string;
  audioUrl: string;
};

export type TafsirSource = {
  key: string;
  name: string;
  language: string;
  author: string;
};

export type TafsirEntry = {
  verseKey: string;
  source: TafsirSource;
  text: string;
};

export type LicenseStatus = 'verified' | 'permission_required' | 'unknown';

export type Provenance = {
  provider: string;
  sourceUrl: string;
  attribution: string;
  licenseStatus: LicenseStatus;
  fetchedAt: string;
  note?: string;
};

export type ApiEnvelope<T> = {
  data: T;
  provenance: Provenance;
};
