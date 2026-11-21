import { NextResponse } from 'next/server';
import type { Provenance } from './types';

export function apiOk<T>(data: T, provenance: Provenance, headers?: HeadersInit) {
  return NextResponse.json(
    { data, provenance },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', ...headers } },
  );
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function quranProvenance() {
  return {
    provider: 'Tanzil Project',
    sourceUrl: 'https://tanzil.net/download/',
    attribution: 'Quran text provided by Tanzil Project — https://tanzil.net',
    licenseStatus: 'verified' as const,
    fetchedAt: '2026-11-20T00:00:00.000Z',
    note: 'Uthmani v1.1، نص حرفي غير معدّل',
  };
}
