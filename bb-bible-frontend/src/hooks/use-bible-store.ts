import { create } from 'zustand';
import { BibleJsonData, ParsedBibleData, FontSize } from '@/types/bible';
import { groupBibleByBook } from '@/lib/bible-parser';

interface BibleState {
  // 데이터
  rawData: BibleJsonData | null;
  parsedData: ParsedBibleData | null;
  compareRawData: BibleJsonData | null;
  compareParsedData: ParsedBibleData | null;
  isLoading: boolean;
  isCompareLoading: boolean;
  error: string | null;
  compareError: string | null;
  
  // 네비게이션 상태
  currentBook: string | null;
  currentChapter: number | null;
  currentVerse: number | null;
  
  // UI 상태
  fontSize: FontSize['size'];
  showVerseNumbers: boolean;
  
  // 액션들
  loadBibleData: () => Promise<void>;
  loadCompareBibleData: () => Promise<void>;
  setCurrentLocation: (book: string, chapter?: number, verse?: number) => void;
  setFontSize: (size: FontSize['size']) => void;
  toggleVerseNumbers: () => void;
  clearError: () => void;
}

export const useBibleStore = create<BibleState>((set, get) => ({
  // 초기 상태
  rawData: null,
  parsedData: null,
  compareRawData: null,
  compareParsedData: null,
  isLoading: false,
  isCompareLoading: false,
  error: null,
  compareError: null,
  
  currentBook: null,
  currentChapter: null,
  currentVerse: null,
  
  fontSize: 'large',
  showVerseNumbers: true,
  
  // 성경 데이터 로드
  loadBibleData: async () => {
    // 이미 로딩 중이거나 데이터가 있으면 중복 로딩 방지
    const currentState = get();
    if (currentState.isLoading || currentState.parsedData) {
      console.log('중복 로딩 방지:', { 
        isLoading: currentState.isLoading, 
        hasData: !!currentState.parsedData 
      });
      return;
    }

    set({ isLoading: true, error: null });
    console.log('성경 데이터 로딩 시작...');
    
    try {
      const response = await fetch('/bible.json');
      console.log('fetch 응답:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`성경 데이터 로드 실패: ${response.status}`);
      }
      
      const rawData: BibleJsonData = await response.json();
      console.log('rawData 로딩 완료, 키 개수:', Object.keys(rawData).length);
      
      const parsedData = groupBibleByBook(rawData);
      console.log('parsedData 파싱 완료, 책 개수:', Object.keys(parsedData).length);
      
      set({ 
        rawData, 
        parsedData, 
        isLoading: false,
        error: null 
      });
      
      console.log('Zustand 상태 업데이트 완료');
    } catch (error) {
      console.error('성경 데이터 로딩 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      set({ 
        isLoading: false, 
        error: errorMessage,
        rawData: null,
        parsedData: null 
      });
    }
  },

  loadCompareBibleData: async () => {
    const currentState = get();
    if (currentState.isCompareLoading || currentState.compareParsedData) {
      return;
    }

    set({ isCompareLoading: true, compareError: null });

    try {
      const response = await fetch('/bible-webp.json');

      if (!response.ok) {
        throw new Error(`WEBP 성경 데이터 로드 실패: ${response.status}`);
      }

      const compareRawData: BibleJsonData = await response.json();
      const compareParsedData = groupBibleByBook(compareRawData);

      set({
        compareRawData,
        compareParsedData,
        isCompareLoading: false,
        compareError: null,
      });
    } catch (error) {
      console.error('WEBP 성경 데이터 로딩 에러:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      set({
        compareRawData: null,
        compareParsedData: null,
        isCompareLoading: false,
        compareError: errorMessage,
      });
    }
  },
  
  // 현재 위치 설정
  setCurrentLocation: (book: string, chapter?: number, verse?: number) => {
    set({
      currentBook: book,
      currentChapter: chapter || null,
      currentVerse: verse || null,
    });
  },
  
  // 폰트 크기 변경
  setFontSize: (size: FontSize['size']) => {
    set({ fontSize: size });
  },
  
  // 절 번호 표시 토글
  toggleVerseNumbers: () => {
    set(state => ({ showVerseNumbers: !state.showVerseNumbers }));
  },
  
  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },
}));

// 폰트 크기별 CSS 클래스
export const FONT_SIZE_CLASSES: Record<FontSize['size'], string> = {
  small: 'text-sm leading-relaxed',
  large: 'text-lg leading-relaxed',
};

// 커스텀 훅: 현재 선택된 책 정보
export function useCurrentBook() {
  const { currentBook, parsedData } = useBibleStore();
  
  if (!currentBook || !parsedData) return null;
  
  return {
    book: currentBook,
    chapters: Object.keys(parsedData[currentBook] || {}).map(Number).sort((a, b) => a - b),
  };
}

// 커스텀 훅: 현재 선택된 장 정보  
export function useCurrentChapter() {
  const { currentBook, currentChapter, parsedData } = useBibleStore();
  
  if (!currentBook || !currentChapter || !parsedData) return null;
  
  const chapterData = parsedData[currentBook]?.[currentChapter];
  if (!chapterData) return null;
  
  return {
    book: currentBook,
    chapter: currentChapter,
    verses: Object.keys(chapterData).map(Number).sort((a, b) => a - b),
    verseTexts: chapterData,
  };
}
