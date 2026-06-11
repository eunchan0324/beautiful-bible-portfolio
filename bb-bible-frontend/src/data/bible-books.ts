import { BibleBook } from '@/types/bible';

// 성경 66권 메타데이터
export const BIBLE_BOOKS: BibleBook[] = [
  // 구약 39권
  { id: '창', name: '창세기', chapters: 50, testament: 'old' },
  { id: '출', name: '출애굽기', chapters: 40, testament: 'old' },
  { id: '레', name: '레위기', chapters: 27, testament: 'old' },
  { id: '민', name: '민수기', chapters: 36, testament: 'old' },
  { id: '신', name: '신명기', chapters: 34, testament: 'old' },
  { id: '수', name: '여호수아', chapters: 24, testament: 'old' },
  { id: '삿', name: '사사기', chapters: 21, testament: 'old' },
  { id: '룻', name: '룻기', chapters: 4, testament: 'old' },
  { id: '삼상', name: '사무엘상', chapters: 31, testament: 'old' },
  { id: '삼하', name: '사무엘하', chapters: 24, testament: 'old' },
  { id: '왕상', name: '열왕기상', chapters: 22, testament: 'old' },
  { id: '왕하', name: '열왕기하', chapters: 25, testament: 'old' },
  { id: '대상', name: '역대상', chapters: 29, testament: 'old' },
  { id: '대하', name: '역대하', chapters: 36, testament: 'old' },
  { id: '스', name: '에스라', chapters: 10, testament: 'old' },
  { id: '느', name: '느헤미야', chapters: 13, testament: 'old' },
  { id: '에', name: '에스더', chapters: 10, testament: 'old' },
  { id: '욥', name: '욥기', chapters: 42, testament: 'old' },
  { id: '시', name: '시편', chapters: 150, testament: 'old' },
  { id: '잠', name: '잠언', chapters: 31, testament: 'old' },
  { id: '전', name: '전도서', chapters: 12, testament: 'old' },
  { id: '아', name: '아가', chapters: 8, testament: 'old' },
  { id: '사', name: '이사야', chapters: 66, testament: 'old' },
  { id: '렘', name: '예레미야', chapters: 52, testament: 'old' },
  { id: '애', name: '예레미야애가', chapters: 5, testament: 'old' },
  { id: '겔', name: '에스겔', chapters: 48, testament: 'old' },
  { id: '단', name: '다니엘', chapters: 12, testament: 'old' },
  { id: '호', name: '호세아', chapters: 14, testament: 'old' },
  { id: '욜', name: '요엘', chapters: 3, testament: 'old' },
  { id: '암', name: '아모스', chapters: 9, testament: 'old' },
  { id: '옵', name: '오바댜', chapters: 1, testament: 'old' },
  { id: '욘', name: '요나', chapters: 4, testament: 'old' },
  { id: '미', name: '미가', chapters: 7, testament: 'old' },
  { id: '나', name: '나훔', chapters: 3, testament: 'old' },
  { id: '합', name: '하박국', chapters: 3, testament: 'old' },
  { id: '습', name: '스바냐', chapters: 3, testament: 'old' },
  { id: '학', name: '학개', chapters: 2, testament: 'old' },
  { id: '슥', name: '스가랴', chapters: 14, testament: 'old' },
  { id: '말', name: '말라기', chapters: 4, testament: 'old' },

  // 신약 27권
  { id: '마', name: '마태복음', chapters: 28, testament: 'new' },
  { id: '막', name: '마가복음', chapters: 16, testament: 'new' },
  { id: '눅', name: '누가복음', chapters: 24, testament: 'new' },
  { id: '요', name: '요한복음', chapters: 21, testament: 'new' },
  { id: '행', name: '사도행전', chapters: 28, testament: 'new' },
  { id: '롬', name: '로마서', chapters: 16, testament: 'new' },
  { id: '고전', name: '고린도전서', chapters: 16, testament: 'new' },
  { id: '고후', name: '고린도후서', chapters: 13, testament: 'new' },
  { id: '갈', name: '갈라디아서', chapters: 6, testament: 'new' },
  { id: '엡', name: '에베소서', chapters: 6, testament: 'new' },
  { id: '빌', name: '빌립보서', chapters: 4, testament: 'new' },
  { id: '골', name: '골로새서', chapters: 4, testament: 'new' },
  { id: '살전', name: '데살로니가전서', chapters: 5, testament: 'new' },
  { id: '살후', name: '데살로니가후서', chapters: 3, testament: 'new' },
  { id: '딤전', name: '디모데전서', chapters: 6, testament: 'new' },
  { id: '딤후', name: '디모데후서', chapters: 4, testament: 'new' },
  { id: '딛', name: '디도서', chapters: 3, testament: 'new' },
  { id: '몬', name: '빌레몬서', chapters: 1, testament: 'new' },
  { id: '히', name: '히브리서', chapters: 13, testament: 'new' },
  { id: '약', name: '야고보서', chapters: 5, testament: 'new' },
  { id: '벧전', name: '베드로전서', chapters: 5, testament: 'new' },
  { id: '벧후', name: '베드로후서', chapters: 3, testament: 'new' },
  { id: '요일', name: '요한일서', chapters: 5, testament: 'new' },
  { id: '요이', name: '요한이서', chapters: 1, testament: 'new' },
  { id: '요삼', name: '요한삼서', chapters: 1, testament: 'new' },
  { id: '유', name: '유다서', chapters: 1, testament: 'new' },
  { id: '계', name: '요한계시록', chapters: 22, testament: 'new' },
];

// 구약 성경 목록
export const OLD_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(book => book.testament === 'old');

// 신약 성경 목록
export const NEW_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(book => book.testament === 'new');

// 책 ID로 책 정보 찾기
export function findBookById(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(book => book.id === id);
}

// 책 이름으로 책 정보 찾기
export function findBookByName(name: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(book => book.name === name);
}

// 모든 책 ID 목록
export const BOOK_IDS = BIBLE_BOOKS.map(book => book.id);

// 책 ID 맵 (빠른 검색용)
export const BOOK_MAP = Object.fromEntries(
  BIBLE_BOOKS.map(book => [book.id, book])
);
