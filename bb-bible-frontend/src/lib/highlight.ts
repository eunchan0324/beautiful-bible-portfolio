import { HighlightRequest, HighlightResponse } from '@/lib/api';
import { Highlight, HighlightColor, HighlightStorage } from '@/types/bible';

const HIGHLIGHT_STORAGE_KEY = 'bb-bible-highlights';

export const HIGHLIGHT_BACKGROUND_COLORS: Record<HighlightColor, string> = {
  yellow: '#D7C8B2',
  blue: '#D8E4F7',
  green: '#DCEBDD',
  pink: '#F2D9DE',
};

export const DARK_HIGHLIGHT_BACKGROUND_COLORS: Record<HighlightColor, string> = {
  yellow: '#5A4934',
  blue: '#334963',
  green: '#355443',
  pink: '#5B4048',
};

export function loadHighlights(): HighlightStorage {
  if (typeof window === 'undefined') {
    return { highlights: {} };
  }

  try {
    const stored = localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
    if (!stored) {
      return { highlights: {} };
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('하이라이트 데이터를 불러오지 못했습니다.', error);
    return { highlights: {} };
  }
}

export function saveHighlights(storage: HighlightStorage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(HIGHLIGHT_STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('하이라이트 데이터를 저장하지 못했습니다.', error);
  }
}

export function clearHighlights(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(HIGHLIGHT_STORAGE_KEY);
  } catch (error) {
    console.error('하이라이트 데이터를 비우지 못했습니다.', error);
  }
}

export function addHighlight(verseKey: string, color: HighlightColor, note?: string): void {
  const storage = loadHighlights();

  storage.highlights[verseKey] = {
    verseKey,
    color,
    timestamp: new Date().toISOString(),
    note: note?.trim() || undefined,
  };

  saveHighlights(storage);
}

export function removeHighlight(verseKey: string): void {
  const storage = loadHighlights();
  delete storage.highlights[verseKey];
  saveHighlights(storage);
}

export function getHighlight(verseKey: string): Highlight | undefined {
  return loadHighlights().highlights[verseKey];
}

export function getAllHighlights(): Highlight[] {
  return Object.values(loadHighlights().highlights);
}

export function toHighlightColorMap(
  highlights: Pick<Highlight, 'verseKey' | 'color'>[],
): Record<string, HighlightColor> {
  return Object.fromEntries(
    highlights.map((highlight) => [highlight.verseKey, highlight.color]),
  ) as Record<string, HighlightColor>;
}

export function toHighlightRequests(highlights: Highlight[]): HighlightRequest[] {
  return highlights.map((highlight) => ({
    verseKey: highlight.verseKey,
    color: highlight.color,
    note: highlight.note ?? null,
  }));
}

export function fromHighlightResponse(response: HighlightResponse): Highlight {
  return {
    verseKey: response.verseKey,
    color: response.color,
    timestamp: response.createdAt,
    note: response.note ?? undefined,
  };
}

export function toggleHighlight(verseKey: string, color: HighlightColor = 'yellow'): boolean {
  const existing = getHighlight(verseKey);

  if (existing) {
    removeHighlight(verseKey);
    return false;
  }

  addHighlight(verseKey, color);
  return true;
}

export function changeHighlightColor(verseKey: string, newColor: HighlightColor): void {
  const existing = getHighlight(verseKey);
  if (existing) {
    addHighlight(verseKey, newColor, existing.note);
  }
}

export function updateHighlightNote(verseKey: string, note: string): void {
  const existing = getHighlight(verseKey);
  if (existing) {
    addHighlight(verseKey, existing.color, note);
  }
}

export function getHighlightStats(): {
  total: number;
  byColor: Record<HighlightColor, number>;
} {
  const highlights = getAllHighlights();
  const byColor: Record<HighlightColor, number> = {
    yellow: 0,
    blue: 0,
    green: 0,
    pink: 0,
  };

  highlights.forEach((highlight) => {
    byColor[highlight.color] += 1;
  });

  return {
    total: highlights.length,
    byColor,
  };
}
