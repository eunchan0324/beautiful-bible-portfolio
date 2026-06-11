import { BibleJsonData, ParsedBibleData, BibleVerse } from '@/types/bible';

// JSON 키 파싱 함수 (한글 + 범위 구절 지원)
export function parseVerseKey(key: string): { book: string; chapter: number; verse: number } {
  // 범위 구절 처리: "신16:18-19" → "신16:18"로 변환 (시작 구절만 사용)
  const normalizedKey = key.replace(/(\d+):(\d+)-\d+/, '$1:$2');
  
  // 한글과 영문만 매칭 (숫자는 제외)
  const match = normalizedKey.match(/^([가-힣a-zA-Z]+)(\d+):(\d+)$/);
  if (!match) {
    throw new Error(`Invalid verse key format: ${key} (normalized: ${normalizedKey})`);
  }
  
  return {
    book: match[1],
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10)
  };
}

// 원본 JSON 데이터를 구조화된 형태로 변환
export function groupBibleByBook(bibleData: BibleJsonData): ParsedBibleData {
  const books: ParsedBibleData = {};
  
  Object.entries(bibleData).forEach(([key, text]) => {
    const { book, chapter, verse } = parseVerseKey(key);
    
    if (!books[book]) books[book] = {};
    if (!books[book][chapter]) books[book][chapter] = {};
    
    books[book][chapter][verse] = text;
  });
  
  return books;
}

// 특정 책의 장 수 계산
export function getChapterCount(bibleData: ParsedBibleData, book: string): number {
  if (!bibleData[book]) return 0;
  return Math.max(...Object.keys(bibleData[book]).map(Number));
}

// 특정 장의 절 수 계산
export function getVerseCount(bibleData: ParsedBibleData, book: string, chapter: number): number {
  const bookData = bibleData[book];
  if (!bookData) return 0;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapterData = (bookData as any)[chapter] || (bookData as any)[String(chapter)];
  if (!chapterData) return 0;
  
  const verseNumbers = Object.keys(chapterData).map(Number);
  return Math.max(...verseNumbers);
}

// 특정 장의 모든 구절 가져오기
export function getChapterVerses(bibleData: ParsedBibleData, book: string, chapter: number): BibleVerse[] {
  // 숫자와 문자열 키 모두 처리
  const bookData = bibleData[book];
  if (!bookData) return [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapterData = (bookData as any)[chapter] || (bookData as any)[String(chapter)];
  if (!chapterData) return [];
  
  const verses: BibleVerse[] = [];
  Object.entries(chapterData).forEach(([verseNum, text]) => {
    verses.push({
      book,
      chapter,
      verse: parseInt(verseNum, 10),
      text: String(text).trim()
    });
  });
  
  return verses.sort((a, b) => a.verse - b.verse);
}

// 구절 키 생성 함수
export function createVerseKey(book: string, chapter: number, verse: number): string {
  return `${book}${chapter}:${verse}`;
}

// 구절 검색 함수
export function searchVerses(bibleData: BibleJsonData, query: string): BibleVerse[] {
  const results: BibleVerse[] = [];
  const lowerQuery = query.toLowerCase();
  
  Object.entries(bibleData).forEach(([key, text]) => {
    if (text.toLowerCase().includes(lowerQuery)) {
      const { book, chapter, verse } = parseVerseKey(key);
      results.push({ book, chapter, verse, text: text.trim() });
    }
  });
  
  return results;
}

// 랜덤 구절 가져오기 (메인 화면용)
export function getRandomVerse(bibleData: BibleJsonData): BibleVerse | null {
  const keys = Object.keys(bibleData);
  if (keys.length === 0) return null;
  
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const { book, chapter, verse } = parseVerseKey(randomKey);
  
  return {
    book,
    chapter,
    verse,
    text: bibleData[randomKey].trim()
  };
}
