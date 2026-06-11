export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type CompareTranslation = 'none' | 'WEBP';

export interface Highlight {
  verseKey: string;
  color: HighlightColor;
  timestamp: string;
  note?: string;
}

export interface HighlightStorage {
  highlights: Record<string, Highlight>;
}

export interface BibleJsonData {
  [key: string]: string;
}

export interface ParsedBibleData {
  [book: string]: {
    [chapter: number]: {
      [verse: number]: string;
    };
  };
}

export interface FontSize {
  size: 'small' | 'large';
  className: string;
}

export interface NavigationState {
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number;
}
