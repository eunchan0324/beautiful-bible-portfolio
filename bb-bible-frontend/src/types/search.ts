export interface SearchVerseItem {
  verseKey: string;
  bookCode: string;
  bookName: string;
  chapterNum: number;
  verseNum: number;
  verseText: string;
}

export interface SearchPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  empty: boolean;
}
