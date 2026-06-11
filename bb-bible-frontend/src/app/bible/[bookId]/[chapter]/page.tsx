'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ChapterNavigation from '@/components/ChapterNavigation';
import ChapterSummaryCard from '@/components/ChapterSummaryCard';
import StickyHeader from '@/components/StickyHeader';
import VerseReader from '@/components/VerseReader';
import { findBookById } from '@/data/bible-books';
import { useAuth } from '@/hooks/use-auth';
import { useBibleStore } from '@/hooks/use-bible-store';
import {
  SpeechReaderRate,
  useSpeechSynthesisReader,
} from '@/hooks/use-speech-synthesis-reader';
import {
  ChapterSummaryResponse,
  completeReadingChapter,
  fetchChapterSummary,
  fetchMyReadingPlan,
  fetchPreferences,
  ReadingPlanItemResponse,
  ReadingPlanResponse,
  toPreferenceRequest,
  toReadingPreferences,
  updatePreferences,
} from '@/lib/api';
import { getApiErrorMessage, isApiError } from '@/lib/api-error';
import { createVerseKey, getChapterVerses } from '@/lib/bible-parser';
import {
  findReadingItem,
  getCompletedChapterKeys,
  getNextReadingItem,
  getRecommendedReadingItems,
  isReadingItemCompleted,
  toReadingHref,
} from '@/lib/reading-plan';
import { BibleVerse, CompareTranslation, FontSize, ResolvedTheme, ThemeMode } from '@/types/bible';

const FONT_SIZE_STORAGE_KEY = 'bb-bible-font-size';
const READING_THEME_STORAGE_KEY = 'bb-bible-reading-theme';
const COMPARE_TRANSLATION_STORAGE_KEY = 'bb-bible-compare-translation';
const PREFERENCE_SYNC_STORAGE_KEY_PREFIX = 'bb-bible-preferences-synced';
const DEFAULT_SHOW_VERSE_NUMBERS = true;
const PREVIOUS_CHAPTER_PULL_THRESHOLD = 48;
const NEXT_CHAPTER_PULL_DISTANCE = 420;
const NEXT_CHAPTER_WHEEL_DELTA_CAP = 80;
const NEXT_CHAPTER_TOUCH_DELTA_CAP = 40;
const NEXT_CHAPTER_PULL_VISUAL_MAX = 84;
const CURRENT_CHAPTER_HEADER_OFFSET = 128;

type LoadedChapter = {
  chapterNumber: number;
  verses: BibleVerse[];
};

type PendingSpeechCommand =
  | { type: 'play'; requestId: number }
  | { type: 'jump'; requestId: number; verseKey: string };

const READING_THEME_COLORS: Record<
  ResolvedTheme,
  {
    pageBackground: string;
    surfaceBackground: string;
    textPrimary: string;
    textSecondary: string;
    loadingBorder: string;
    buttonBackground: string;
  }
> = {
  light: {
    pageBackground: '#FFFFFF',
    surfaceBackground: '#FFFFFF',
    textPrimary: '#343434',
    textSecondary: '#6E6A63',
    loadingBorder: '#8D8881',
    buttonBackground: '#8D8881',
  },
  dark: {
    pageBackground: '#2F2F2F',
    surfaceBackground: '#2F2F2F',
    textPrimary: '#EAEAEA',
    textSecondary: '#EAEAEA',
    loadingBorder: '#C8BDAE',
    buttonBackground: '#C8BDAE',
  },
};

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function isFontSize(value: string | null): value is FontSize['size'] {
  return value === 'small' || value === 'large';
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isCompareTranslation(value: string | null): value is CompareTranslation {
  return value === 'none' || value === 'WEBP';
}

function resolveTheme(themeMode: ThemeMode): ResolvedTheme {
  return themeMode === 'system' ? getSystemTheme() : themeMode;
}

function loadLocalPreferences() {
  const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
  const savedThemeMode = localStorage.getItem(READING_THEME_STORAGE_KEY);

  return {
    fontSize: isFontSize(savedFontSize) ? savedFontSize : null,
    themeMode: isThemeMode(savedThemeMode) ? savedThemeMode : null,
  };
}

function saveLocalPreferences(fontSize: FontSize['size'], themeMode: ThemeMode) {
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize);
  localStorage.setItem(READING_THEME_STORAGE_KEY, themeMode);
}

function loadLocalCompareTranslation(): CompareTranslation {
  const savedCompareTranslation = localStorage.getItem(COMPARE_TRANSLATION_STORAGE_KEY);

  return isCompareTranslation(savedCompareTranslation) ? savedCompareTranslation : 'none';
}

function saveLocalCompareTranslation(compareTranslation: CompareTranslation) {
  localStorage.setItem(COMPARE_TRANSLATION_STORAGE_KEY, compareTranslation);
}

function getPreferenceSyncStorageKey(userId: string) {
  return `${PREFERENCE_SYNC_STORAGE_KEY_PREFIX}-${userId}`;
}

function getChapterUnit(bookName: string) {
  return bookName === '시편' ? '편' : '장';
}

export default function ChapterReadPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = params.bookId as string;
  const chapterNumber = parseInt(params.chapter as string, 10);
  const startVerse = searchParams.get('startVerse') ? parseInt(searchParams.get('startVerse')!, 10) : 1;
  const readingPlanId = searchParams.get('readingPlanId')
    ? Number(searchParams.get('readingPlanId'))
    : null;
  const isReadingPlanMode = Boolean(readingPlanId);

  const [loadedChapters, setLoadedChapters] = useState<LoadedChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize['size']>('small');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<ResolvedTheme>('light');
  const [showVerseNumbers, setShowVerseNumbers] = useState(DEFAULT_SHOW_VERSE_NUMBERS);
  const [compareTranslation, setCompareTranslation] = useState<CompareTranslation>('none');
  const [chapterSummaries, setChapterSummaries] = useState<Record<number, ChapterSummaryResponse>>({});
  const [currentHeaderChapter, setCurrentHeaderChapter] = useState(chapterNumber);
  const [showPreviousPullButton, setShowPreviousPullButton] = useState(false);
  const [nextChapterPullOffset, setNextChapterPullOffset] = useState(0);
  const [readingPlan, setReadingPlan] = useState<ReadingPlanResponse | null>(null);
  const [readingPlanError, setReadingPlanError] = useState<string | null>(null);
  const [completionSheet, setCompletionSheet] = useState<CompletionSheetState | null>(null);
  const [speechRate, setSpeechRate] = useState<SpeechReaderRate>(1);
  const [speechTargetChapterNumber, setSpeechTargetChapterNumber] = useState(chapterNumber);
  const [pendingSpeechCommand, setPendingSpeechCommand] =
    useState<PendingSpeechCommand | null>(null);
  const chapterSectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const nextChapterButtonRef = useRef<HTMLDivElement | null>(null);
  const pullStartYRef = useRef<number | null>(null);
  const nextChapterPullDistanceRef = useRef(0);
  const nextChapterTouchYRef = useRef<number | null>(null);

  const { authMode, user } = useAuth();
  const {
    loadBibleData,
    loadCompareBibleData,
    parsedData,
    compareParsedData,
    isLoading: storeLoading,
    isCompareLoading,
    error: storeError,
    compareError,
  } = useBibleStore();

  useEffect(() => {
    setCompareTranslation(loadLocalCompareTranslation());
  }, []);

  useEffect(() => {
    if (authMode === 'loading') {
      return;
    }

    const localPreferences = loadLocalPreferences();

    if (authMode === 'guest') {
      const nextFontSize = localPreferences.fontSize ?? 'small';
      const nextThemeMode = localPreferences.themeMode ?? 'system';

      setFontSize(nextFontSize);
      setThemeMode(nextThemeMode);
      setEffectiveTheme(resolveTheme(nextThemeMode));
      setShowVerseNumbers(DEFAULT_SHOW_VERSE_NUMBERS);
      return;
    }

    if (!user) {
      return;
    }

    const syncStorageKey = getPreferenceSyncStorageKey(user.id);
    const shouldSyncLocalPreferences =
      !localStorage.getItem(syncStorageKey) &&
      Boolean(localPreferences.fontSize || localPreferences.themeMode);

    fetchPreferences()
      .then(async (response) => {
        let preferences = toReadingPreferences(response);

        if (shouldSyncLocalPreferences) {
          const nextPreferences = {
            fontSize: localPreferences.fontSize ?? preferences.fontSize,
            themeMode: localPreferences.themeMode ?? preferences.themeMode,
            showVerseNumbers: preferences.showVerseNumbers,
          };

          preferences = toReadingPreferences(
            await updatePreferences(toPreferenceRequest(nextPreferences)),
          );
          localStorage.setItem(syncStorageKey, 'true');
        }

        if (isFontSize(preferences.fontSize)) {
          setFontSize(preferences.fontSize);
        }

        setThemeMode(preferences.themeMode);
        setEffectiveTheme(resolveTheme(preferences.themeMode));
        setShowVerseNumbers(preferences.showVerseNumbers);
        saveLocalPreferences(
          isFontSize(preferences.fontSize) ? preferences.fontSize : 'small',
          preferences.themeMode,
        );
      })
      .catch((preferenceError) => {
        console.error('설정 로딩 오류:', preferenceError);

        const nextFontSize = localPreferences.fontSize ?? 'small';
        const nextThemeMode = localPreferences.themeMode ?? 'system';

        setFontSize(nextFontSize);
        setThemeMode(nextThemeMode);
        setEffectiveTheme(resolveTheme(nextThemeMode));
        setShowVerseNumbers(DEFAULT_SHOW_VERSE_NUMBERS);
      });
  }, [authMode, user]);

  useEffect(() => {
    if (themeMode !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setEffectiveTheme(event.matches ? 'dark' : 'light');
    };

    setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [themeMode]);

  const handleFontSizeChange = (size: FontSize['size']) => {
    setFontSize(size);
    saveLocalPreferences(size, themeMode);

    if (authMode === 'authenticated') {
      updatePreferences(
        toPreferenceRequest({
          fontSize: size,
          themeMode,
          showVerseNumbers,
        }),
      ).catch((preferenceError) => {
        console.error('글자 크기 저장 오류:', preferenceError);
      });

      if (user) {
        localStorage.setItem(getPreferenceSyncStorageKey(user.id), 'true');
      }
    }
  };

  const handleThemeModeChange = (nextThemeMode: ThemeMode) => {
    setThemeMode(nextThemeMode);
    saveLocalPreferences(fontSize, nextThemeMode);
    setEffectiveTheme(resolveTheme(nextThemeMode));

    if (authMode === 'authenticated') {
      updatePreferences(
        toPreferenceRequest({
          fontSize,
          themeMode: nextThemeMode,
          showVerseNumbers,
        }),
      ).catch((preferenceError) => {
        console.error('테마 저장 오류:', preferenceError);
      });

      if (user) {
        localStorage.setItem(getPreferenceSyncStorageKey(user.id), 'true');
      }
    }
  };

  const handleCompareTranslationChange = (nextCompareTranslation: CompareTranslation) => {
    setCompareTranslation(nextCompareTranslation);
    saveLocalCompareTranslation(nextCompareTranslation);
  };

  const decodedBookId = decodeURIComponent(bookId);
  const book = findBookById(decodedBookId);

  useEffect(() => {
    setSpeechTargetChapterNumber(chapterNumber);
    setPendingSpeechCommand(null);
  }, [bookId, chapterNumber]);

  useEffect(() => {
    if (!readingPlanId || authMode === 'loading') {
      setReadingPlan(null);
      setReadingPlanError(null);
      return;
    }

    if (authMode === 'guest') {
      setReadingPlan(null);
      setReadingPlanError('로그인하면 통독 완료를 저장할 수 있어요.');
      return;
    }

    let isActive = true;

    fetchMyReadingPlan()
      .then((plan) => {
        if (!isActive) {
          return;
        }

        if (!plan || plan.id !== readingPlanId) {
          setReadingPlan(null);
          setReadingPlanError('진행 중인 통독 계획을 찾지 못했어요.');
          return;
        }

        setReadingPlan(plan);
        setReadingPlanError(null);
      })
      .catch((planError) => {
        console.error('통독 계획을 불러오지 못했어요.', planError);
        if (isActive) {
          setReadingPlan(null);
          setReadingPlanError(getApiErrorMessage(planError, '통독 계획을 불러오지 못했어요.'));
        }
      });

    return () => {
      isActive = false;
    };
  }, [authMode, readingPlanId]);

  useEffect(() => {
    if (!parsedData && !storeLoading && !storeError) {
      loadBibleData();
    }
  }, [parsedData, storeLoading, storeError, loadBibleData]);

  useEffect(() => {
    if (
      compareTranslation === 'WEBP' &&
      !compareParsedData &&
      !isCompareLoading &&
      !compareError
    ) {
      loadCompareBibleData();
    }
  }, [
    compareError,
    compareParsedData,
    compareTranslation,
    isCompareLoading,
    loadCompareBibleData,
  ]);

  const appendChapter = useCallback(
    (targetChapterNumber: number) => {
      if (
        isReadingPlanMode ||
        !parsedData ||
        !book ||
        targetChapterNumber < 1 ||
        targetChapterNumber > book.chapters
      ) {
        return;
      }

      nextChapterPullDistanceRef.current = 0;
      nextChapterTouchYRef.current = null;
      setNextChapterPullOffset(0);

      const targetVerses = getChapterVerses(parsedData, book.id, targetChapterNumber);

      setLoadedChapters((currentChapters) => {
        if (currentChapters.some((chapter) => chapter.chapterNumber === targetChapterNumber)) {
          return currentChapters;
        }

        return [...currentChapters, { chapterNumber: targetChapterNumber, verses: targetVerses }];
      });
    },
    [book, isReadingPlanMode, parsedData],
  );

  useEffect(() => {
    if (parsedData && book) {
      try {
        setIsLoading(true);
        const chapterVerses = getChapterVerses(parsedData, book.id, chapterNumber);
        setLoadedChapters([{ chapterNumber, verses: chapterVerses }]);
        setChapterSummaries({});
        setCurrentHeaderChapter(chapterNumber);
        setShowPreviousPullButton(false);
        setNextChapterPullOffset(0);
        setError(null);
      } catch (loadError) {
        console.error('구절 로딩 오류:', loadError);
        setError('구절을 불러오는 중 문제가 발생했어요.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [parsedData, book, chapterNumber]);

  useEffect(() => {
    if (!book) {
      setChapterSummaries({});
      return;
    }

    let isActive = true;
    const missingSummaryChapters = loadedChapters
      .map((chapter) => chapter.chapterNumber)
      .filter((loadedChapterNumber) => !chapterSummaries[loadedChapterNumber]);

    missingSummaryChapters.forEach((loadedChapterNumber) => {
      fetchChapterSummary(book.id, loadedChapterNumber)
        .then((summary) => {
          if (!isActive || !summary) {
            return;
          }

          setChapterSummaries((currentSummaries) => ({
            ...currentSummaries,
            [loadedChapterNumber]: summary,
          }));
        })
        .catch((summaryError) => {
          console.error('장 요약 로딩 오류:', summaryError);
        });
    });

    return () => {
      isActive = false;
    };
  }, [book, loadedChapters, chapterSummaries]);

  useEffect(() => {
    if (isReadingPlanMode || !book || chapterNumber <= 1) {
      setShowPreviousPullButton(false);
      return;
    }

    const handleTouchStart = (event: TouchEvent) => {
      pullStartYRef.current = window.scrollY <= 2 ? event.touches[0]?.clientY ?? null : null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (pullStartYRef.current === null || window.scrollY > 2) {
        return;
      }

      const currentY = event.touches[0]?.clientY;
      if (currentY && currentY - pullStartYRef.current > PREVIOUS_CHAPTER_PULL_THRESHOLD) {
        setShowPreviousPullButton(true);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (window.scrollY <= 2 && event.deltaY < -PREVIOUS_CHAPTER_PULL_THRESHOLD) {
        setShowPreviousPullButton(true);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowPreviousPullButton(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [book, chapterNumber, isReadingPlanMode]);

  useEffect(() => {
    if (!book || loadedChapters.length === 0) {
      return;
    }

    let animationFrameId: number | null = null;

    const updateCurrentHeaderChapter = () => {
      animationFrameId = null;

      let activeChapter = loadedChapters[0].chapterNumber;

      loadedChapters.forEach((chapter) => {
        const section = chapterSectionRefs.current[chapter.chapterNumber];
        if (!section) {
          return;
        }

        if (section.getBoundingClientRect().top <= CURRENT_CHAPTER_HEADER_OFFSET) {
          activeChapter = chapter.chapterNumber;
        }
      });

      setCurrentHeaderChapter((currentChapter) =>
        currentChapter === activeChapter ? currentChapter : activeChapter,
      );
    };

    const scheduleCurrentHeaderChapterUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateCurrentHeaderChapter);
    };

    updateCurrentHeaderChapter();
    window.addEventListener('scroll', scheduleCurrentHeaderChapterUpdate, { passive: true });
    window.addEventListener('resize', scheduleCurrentHeaderChapterUpdate);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener('scroll', scheduleCurrentHeaderChapterUpdate);
      window.removeEventListener('resize', scheduleCurrentHeaderChapterUpdate);
    };
  }, [book, loadedChapters]);

  useEffect(() => {
    if (isReadingPlanMode) {
      nextChapterPullDistanceRef.current = 0;
      nextChapterTouchYRef.current = null;
      setNextChapterPullOffset(0);
      return;
    }

    const lastLoadedChapter =
      loadedChapters[loadedChapters.length - 1]?.chapterNumber ?? chapterNumber;
    const nextChapterNumber = book && lastLoadedChapter < book.chapters
      ? lastLoadedChapter + 1
      : null;

    if (!book || !nextChapterNumber) {
      nextChapterPullDistanceRef.current = 0;
      nextChapterTouchYRef.current = null;
      setNextChapterPullOffset(0);
      return;
    }

    const isNextChapterPullReady = () => {
      const buttonElement = nextChapterButtonRef.current;
      if (!buttonElement) {
        return false;
      }

      const rect = buttonElement.getBoundingClientRect();
      const isButtonVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const isNearPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;

      return isButtonVisible && isNearPageBottom;
    };

    const resetNextChapterPull = () => {
      nextChapterPullDistanceRef.current = 0;
      nextChapterTouchYRef.current = null;
      setNextChapterPullOffset(0);
    };

    const addNextChapterPull = (delta: number) => {
      if (delta <= 0 || !isNextChapterPullReady()) {
        resetNextChapterPull();
        return;
      }

      nextChapterPullDistanceRef.current += delta;
      setNextChapterPullOffset(
        Math.min(
          NEXT_CHAPTER_PULL_VISUAL_MAX,
          (nextChapterPullDistanceRef.current / NEXT_CHAPTER_PULL_DISTANCE) *
            NEXT_CHAPTER_PULL_VISUAL_MAX,
        ),
      );

      if (nextChapterPullDistanceRef.current >= NEXT_CHAPTER_PULL_DISTANCE) {
        appendChapter(nextChapterNumber);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      addNextChapterPull(Math.min(event.deltaY, NEXT_CHAPTER_WHEEL_DELTA_CAP));
    };

    const handleTouchStart = (event: TouchEvent) => {
      nextChapterTouchYRef.current = isNextChapterPullReady()
        ? event.touches[0]?.clientY ?? null
        : null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isNextChapterPullReady()) {
        resetNextChapterPull();
        return;
      }

      const currentY = event.touches[0]?.clientY;
      const previousY = nextChapterTouchYRef.current;
      nextChapterTouchYRef.current = currentY ?? null;

      if (currentY === undefined || previousY === null) {
        return;
      }

      addNextChapterPull(Math.min(previousY - currentY, NEXT_CHAPTER_TOUCH_DELTA_CAP));
    };

    const handleScroll = () => {
      if (!isNextChapterPullReady()) {
        resetNextChapterPull();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [appendChapter, book, chapterNumber, isReadingPlanMode, loadedChapters]);

  const getVisibleSpeechChapter = useCallback(() => {
    const fallbackChapter =
      loadedChapters.find((loadedChapter) => (
        loadedChapter.chapterNumber === currentHeaderChapter
      )) ??
      loadedChapters.find((loadedChapter) => loadedChapter.chapterNumber === chapterNumber) ??
      loadedChapters[0];

    if (typeof window === 'undefined') {
      return fallbackChapter;
    }

    const viewportTop = CURRENT_CHAPTER_HEADER_OFFSET;
    const viewportBottom = Math.max(viewportTop, window.innerHeight - 140);
    let visibleChapter = fallbackChapter;
    let maxVisibleHeight = 0;

    loadedChapters.forEach((loadedChapter) => {
      const section = chapterSectionRefs.current[loadedChapter.chapterNumber];

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const visibleHeight =
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        visibleChapter = loadedChapter;
      }
    });

    return visibleChapter;
  }, [chapterNumber, currentHeaderChapter, loadedChapters]);

  const activeSpeechChapter =
    loadedChapters.find((loadedChapter) => (
      loadedChapter.chapterNumber === speechTargetChapterNumber
    )) ??
    loadedChapters.find((loadedChapter) => loadedChapter.chapterNumber === chapterNumber);
  const speechChapterNumber = activeSpeechChapter?.chapterNumber ?? chapterNumber;
  const speechChapterKey = book
    ? `${book.id}-${speechChapterNumber}${activeSpeechChapter ? '' : '-loading'}`
    : 'unknown';
  const speechChapterLabel = book && activeSpeechChapter
    ? `${book.name} ${activeSpeechChapter.chapterNumber}${getChapterUnit(book.name)}`
    : undefined;
  const speechReader = useSpeechSynthesisReader({
    verses: activeSpeechChapter?.verses ?? [],
    chapterKey: speechChapterKey,
    rate: speechRate,
  });
  const playSpeech = speechReader.play;
  const jumpToSpeechVerse = speechReader.jumpToVerse;
  const isSpeechActive = speechReader.status === 'playing' || speechReader.status === 'paused';

  useEffect(() => {
    if (!pendingSpeechCommand || !activeSpeechChapter) {
      return;
    }

    const command = pendingSpeechCommand;

    setPendingSpeechCommand(null);

    if (command.type === 'play') {
      playSpeech();
      return;
    }

    jumpToSpeechVerse(command.verseKey);
  }, [activeSpeechChapter, jumpToSpeechVerse, pendingSpeechCommand, playSpeech]);

  const handleSpeechToggle = () => {
    if (speechReader.status === 'playing') {
      speechReader.pause();
      return;
    }

    if (speechReader.status === 'paused') {
      speechReader.resume();
      return;
    }

    const visibleChapter = getVisibleSpeechChapter();

    if (!visibleChapter) {
      return;
    }

    setSpeechTargetChapterNumber(visibleChapter.chapterNumber);
    setPendingSpeechCommand({
      type: 'play',
      requestId: Date.now(),
    });
  };
  const handleSpeechRateChange = (nextRate: SpeechReaderRate) => {
    setSpeechRate(nextRate);
  };
  const handleSpeechVerseSelect = (verse: BibleVerse) => {
    setSpeechTargetChapterNumber(verse.chapter);
    setPendingSpeechCommand({
      type: 'jump',
      requestId: Date.now(),
      verseKey: createVerseKey(verse.book, verse.chapter, verse.verse),
    });
  };

  const colors = READING_THEME_COLORS[effectiveTheme];

  if (!book) {
    return (
      <StateScreen
        backgroundColor={colors.surfaceBackground}
        titleColor={colors.textPrimary}
        bodyColor={colors.textSecondary}
        buttonColor={colors.buttonBackground}
        title="책을 찾을 수 없어요"
        body="요청한 성경 책이 존재하지 않습니다."
        buttonLabel="성경 목록으로 돌아가기"
        onClick={() => router.push('/bible')}
      />
    );
  }

  if (chapterNumber < 1 || chapterNumber > book.chapters) {
    return (
      <StateScreen
        backgroundColor={colors.surfaceBackground}
        titleColor={colors.textPrimary}
        bodyColor={colors.textSecondary}
        buttonColor={colors.buttonBackground}
        title="장을 찾을 수 없어요"
        body={`${book.name}${book.chapters}장까지 있습니다.`}
        buttonLabel={`${book.name} 목록으로 돌아가기`}
        onClick={() => router.push(`/bible/${bookId}`)}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 flex items-center justify-center"
        style={{ backgroundColor: colors.surfaceBackground }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.loadingBorder }}
          />
          <p style={{ color: colors.textSecondary }}>성경을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <StateScreen
        backgroundColor={colors.surfaceBackground}
        titleColor={colors.textPrimary}
        bodyColor={colors.textSecondary}
        buttonColor={colors.buttonBackground}
        title="오류가 발생했어요"
        body={error}
        buttonLabel="다시 시도"
        onClick={() => window.location.reload()}
      />
    );
  }

  const handleBookChapterSelect = () => {
    if (isReadingPlanMode) {
      router.push('/reading');
      return;
    }

    router.push('/bible');
  };

  const chapterUnit = getChapterUnit(book.name);

  const getPrevNextUrls = () => {
    let prevUrl: string | undefined;
    let nextUrl: string | undefined;
    let prevLabel: string | undefined;
    let nextLabel: string | undefined;

    if (chapterNumber > 1) {
      prevUrl = `/bible/${bookId}/${chapterNumber - 1}`;
      prevLabel = `${chapterNumber - 1}${chapterUnit} 보기`;
    }

    if (chapterNumber < book.chapters) {
      nextUrl = `/bible/${bookId}/${chapterNumber + 1}`;
      nextLabel = `${chapterNumber + 1}${chapterUnit} 보기`;
    }

    return { prevUrl, nextUrl, prevLabel, nextLabel };
  };

  const { prevUrl, prevLabel } = getPrevNextUrls();
  const hasPreviousChapter = Boolean(prevUrl);
  const lastLoadedChapterNumber =
    loadedChapters[loadedChapters.length - 1]?.chapterNumber ?? chapterNumber;
  const nextAppendChapterNumber =
    !isReadingPlanMode && lastLoadedChapterNumber < book.chapters
      ? lastLoadedChapterNumber + 1
      : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.pageBackground }}>
      <StickyHeader
        bookName={book.name}
        chapterNumber={currentHeaderChapter}
        chapterUnit={chapterUnit}
        effectiveTheme={effectiveTheme}
        onBookChapterSelect={handleBookChapterSelect}
        rightContent={isReadingPlanMode ? <ReadingPlanModeBadge effectiveTheme={effectiveTheme} /> : null}
      />

      <div className="px-[30px] pb-[160px] pt-[106px]">
        {showPreviousPullButton && hasPreviousChapter && prevUrl && (
          <ChapterViewButton
            label={prevLabel ?? ''}
            onClick={() => router.push(prevUrl)}
            effectiveTheme={effectiveTheme}
          />
        )}

        {loadedChapters.map((loadedChapter, index) => (
          <section
            key={loadedChapter.chapterNumber}
            ref={(element) => {
              chapterSectionRefs.current[loadedChapter.chapterNumber] = element;
            }}
            data-chapter-number={loadedChapter.chapterNumber}
            className={index === 0 ? (showPreviousPullButton ? 'mt-[36px]' : 'mt-0') : 'mt-[72px]'}
          >
            <div className="mb-[20px] flex items-center justify-between gap-[12px]">
              <h1
                style={{
                  color: colors.textPrimary,
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '24px',
                  fontWeight: 500,
                  lineHeight: '36px',
                }}
              >
                {book.name} {loadedChapter.chapterNumber}{chapterUnit}
              </h1>

              <ChapterSummaryCard
                summary={chapterSummaries[loadedChapter.chapterNumber]?.summary ?? ''}
                effectiveTheme={effectiveTheme}
              />
            </div>

            <VerseReader
              verses={loadedChapter.verses}
              compareVerses={
                compareTranslation === 'WEBP' && compareParsedData
                  ? getChapterVerses(compareParsedData, book.id, loadedChapter.chapterNumber)
                  : []
              }
              compareTranslationLabel={compareTranslation === 'WEBP' ? 'WEB' : undefined}
              fontSize={fontSize}
              effectiveTheme={effectiveTheme}
              selectionActionBarBottomOffset={0}
              onFontSizeChange={handleFontSizeChange}
              startVerse={index === 0 ? startVerse : undefined}
              showVerseNumbers={showVerseNumbers}
              currentSpeechVerseKey={speechReader.currentVerseKey}
              isSpeechActive={isSpeechActive}
              onSpeechVerseSelect={handleSpeechVerseSelect}
            />

            {readingPlanId && book && (
              <ReadingCompletionCTA
                plan={readingPlan}
                errorMessage={readingPlanError}
                bookCode={book.id}
                bookName={book.name}
                chapterNum={loadedChapter.chapterNumber}
                effectiveTheme={effectiveTheme}
                onPlanChange={setReadingPlan}
                onOpenSheet={setCompletionSheet}
              />
            )}
          </section>
        ))}

        {nextAppendChapterNumber && (
          <div
            className="relative mt-[30px] flex justify-center"
            style={{
              transform: `translateY(-${nextChapterPullOffset}px)`,
              transition: nextChapterPullOffset === 0 ? 'transform 180ms ease-out' : 'none',
            }}
          >
            <div ref={nextChapterButtonRef}>
              <ChapterViewButton
                label={`${nextAppendChapterNumber}${chapterUnit} 보기`}
                onClick={() => appendChapter(nextAppendChapterNumber)}
                effectiveTheme={effectiveTheme}
              />
            </div>
            <div
              className="pointer-events-none absolute left-0 right-0 top-full mt-[22px] text-center"
              style={{
                color: colors.textPrimary,
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '24px',
                fontWeight: 500,
                lineHeight: '36px',
                opacity: Math.min(0.72, nextChapterPullOffset / NEXT_CHAPTER_PULL_VISUAL_MAX),
                transform: `translateY(${Math.max(0, 28 - nextChapterPullOffset * 0.45)}px)`,
              }}
              aria-hidden="true"
            >
              {book.name} {nextAppendChapterNumber}{chapterUnit}
            </div>
          </div>
        )}
      </div>

      <ChapterNavigation
        fontSize={fontSize}
        themeMode={themeMode}
        effectiveTheme={effectiveTheme}
        compareTranslation={compareTranslation}
        speechStatus={speechReader.status}
        speechRate={speechRate}
        speechChapterLabel={speechChapterLabel}
        speechCurrentVerseIndex={speechReader.currentVerseIndex}
        speechTotalVerses={speechReader.totalVerses}
        isCompareLoading={isCompareLoading}
        compareError={compareError}
        onFontSizeChange={handleFontSizeChange}
        onThemeModeChange={handleThemeModeChange}
        onCompareTranslationChange={handleCompareTranslationChange}
        onSpeechToggle={handleSpeechToggle}
        onSpeechStop={speechReader.stop}
        onSpeechRateChange={handleSpeechRateChange}
        onSpeechPrevious={speechReader.skipPrevious}
        onSpeechNext={speechReader.skipNext}
      />

      {completionSheet && (
        <CompletionSheet
          state={completionSheet}
          effectiveTheme={effectiveTheme}
          onClose={() => setCompletionSheet(null)}
        />
      )}
    </div>
  );
}

function ReadingPlanModeBadge({
  effectiveTheme,
}: {
  effectiveTheme: ResolvedTheme;
}) {
  const isDark = effectiveTheme === 'dark';

  return (
    <span
      className="inline-flex h-7 items-center rounded-full px-3 text-[12px] font-bold"
      style={{
        backgroundColor: isDark ? '#3A3732' : '#F4EEE6',
        color: isDark ? '#C8BDAE' : '#8A6D4E',
      }}
    >
      통독 중
    </span>
  );
}

type CompletionSheetState = {
  title: string;
  primaryLabel: string;
  primaryHref: string;
};

interface ReadingCompletionCTAProps {
  plan: ReadingPlanResponse | null;
  errorMessage: string | null;
  bookCode: string;
  bookName: string;
  chapterNum: number;
  effectiveTheme: ResolvedTheme;
  onPlanChange: (plan: ReadingPlanResponse) => void;
  onOpenSheet: (state: CompletionSheetState) => void;
}

function ReadingCompletionCTA({
  plan,
  errorMessage,
  bookCode,
  bookName,
  chapterNum,
  effectiveTheme,
  onPlanChange,
  onOpenSheet,
}: ReadingCompletionCTAProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isDark = effectiveTheme === 'dark';

  if (errorMessage) {
    return (
      <div
        className="mt-[48px] rounded-[18px] px-4 py-4 text-center"
        style={{
          backgroundColor: isDark ? '#3A3732' : '#F7F1EA',
          color: isDark ? '#EAEAEA' : '#8A6D4E',
        }}
      >
        <p className="break-keep text-[14px] font-bold leading-relaxed">{errorMessage}</p>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const item = findReadingItem(plan, bookCode, chapterNum);

  if (!item) {
    return null;
  }

  const completedKeys = getCompletedChapterKeys(plan);
  const isCompleted = isReadingItemCompleted(item, completedKeys);

  const handleComplete = async () => {
    if (isSubmitting || isCompleted) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const recommendedItemsBeforeComplete = getRecommendedReadingItems(plan);
    const nextItem = getNextReadingItem(plan, item);
    const isLastRecommendedItem =
      recommendedItemsBeforeComplete.at(-1)?.itemOrder === item.itemOrder;
    const isLastPlanItem = !nextItem;

    try {
      const response = await completeReadingChapter(plan.id, {
        bookCode,
        chapterNum,
      });
      const nextPlan: ReadingPlanResponse = {
        ...plan,
        status: isLastPlanItem ? 'COMPLETED' : plan.status,
        completedChapters: [
          ...plan.completedChapters,
          {
            bookCode: response.bookCode,
            chapterNum: response.chapterNum,
            completedAt: response.completedAt,
          },
        ],
      };

      onPlanChange(nextPlan);
      onOpenSheet(getCompletionSheetState(nextPlan, item, nextItem, isLastRecommendedItem, isLastPlanItem));
    } catch (error) {
      if (isApiError(error) && error.code === 'CONFLICT') {
        const nextPlan: ReadingPlanResponse = {
          ...plan,
          completedChapters: [
            ...plan.completedChapters,
            {
              bookCode,
              chapterNum,
              completedAt: new Date().toISOString(),
            },
          ],
        };

        onPlanChange(nextPlan);
        setMessage('이미 읽음 처리된 장이에요.');
        return;
      }

      setMessage(getApiErrorMessage(error, '읽음 완료를 저장하지 못했어요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-[48px]">
      <p
        className="mb-3 text-center text-[15px] font-bold"
        style={{ color: isDark ? '#EAEAEA' : '#6E6A63' }}
      >
        {bookName} {chapterNum}장을 다 읽었어요
      </p>
      <button
        type="button"
        onClick={handleComplete}
        disabled={isSubmitting || isCompleted}
        className="flex h-14 w-full items-center justify-center rounded-full text-[17px] font-bold transition active:scale-[0.98] disabled:active:scale-100"
        style={{
          backgroundColor: isCompleted
            ? isDark ? '#4B4B4B' : '#D8D1C3'
            : isDark ? '#C8BDAE' : '#A88A63',
          color: isDark && !isCompleted ? '#2F2F2F' : '#FFFFFF',
        }}
      >
        {isSubmitting ? '저장 중...' : isCompleted ? '이미 읽었어요' : '읽기 완료'}
      </button>
      {message && (
        <p
          className="mt-3 break-keep text-center text-[13px] font-bold leading-relaxed"
          style={{ color: isDark ? '#E5B9A9' : '#A35F4D' }}
        >
          {message}
        </p>
      )}
    </div>
  );

  function getCompletionSheetState(
    updatedPlan: ReadingPlanResponse,
    completedItem: ReadingPlanItemResponse,
    nextItem: ReadingPlanItemResponse | undefined,
    isLastRecommendedItem: boolean,
    isLastPlanItem: boolean,
  ): CompletionSheetState {
    if (isLastPlanItem) {
      return {
        title: `${updatedPlan.title}을 완료했어요`,
        primaryLabel: '통독 마치기',
        primaryHref: '/reading',
      };
    }

    if (isLastRecommendedItem) {
      return {
        title: '오늘 읽을 말씀을 다 읽었어요',
        primaryLabel: '다음 장 읽기',
        primaryHref: nextItem ? toReadingHref(nextItem, updatedPlan.id) : '/reading',
      };
    }

    return {
      title: `${bookName} ${completedItem.chapterNum}장을 읽었어요`,
      primaryLabel: '다음 장 읽기',
      primaryHref: nextItem ? toReadingHref(nextItem, updatedPlan.id) : '/reading',
    };
  }
}

function CompletionSheet({
  state,
  effectiveTheme,
  onClose,
}: {
  state: CompletionSheetState;
  effectiveTheme: ResolvedTheme;
  onClose: () => void;
}) {
  const router = useRouter();
  const isDark = effectiveTheme === 'dark';

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/45 px-4 pb-4" onClick={onClose}>
      <section
        className="mx-auto w-full max-w-sm rounded-[28px] px-5 pb-5 pt-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
        style={{ backgroundColor: isDark ? '#3A3A3A' : '#FFFFFF' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-7 h-1.5 w-14 rounded-full bg-[#E2DED8]" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFE8DC] text-[#8A6D4E]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9">
            <path
              d="M5 12.5l4.2 4.2L19 7"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.8"
            />
          </svg>
        </div>
        <h2
          className="mt-7 break-keep text-center text-[26px] font-bold leading-snug"
          style={{ color: isDark ? '#F3EFE8' : '#343434' }}
        >
          {state.title}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push('/reading')}
            className="h-[52px] rounded-[16px] text-[16px] font-bold"
            style={{
              backgroundColor: isDark ? '#4B4B4B' : '#F0EEE7',
              color: isDark ? '#EAEAEA' : '#8A6D4E',
            }}
          >
            나의 통독
          </button>
          <button
            type="button"
            onClick={() => router.push(state.primaryHref)}
            className="h-[52px] rounded-[16px] text-[16px] font-bold text-white"
            style={{ backgroundColor: isDark ? '#8A6D4E' : '#A88A63' }}
          >
            {state.primaryLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

interface ChapterViewButtonProps {
  label: string;
  effectiveTheme: ResolvedTheme;
  onClick: () => void;
}

function ChapterViewButton({
  label,
  effectiveTheme,
  onClick,
}: ChapterViewButtonProps) {
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex min-h-[30px] min-w-[85px] items-center justify-center rounded-[99px] border px-[20px] py-[8px] transition-opacity hover:opacity-75"
      style={{
        backgroundColor: isDark ? '#2F2F2F' : '#FFFFFF',
        borderColor: isDark ? '#4B4B4B' : '#DFD4C4',
        borderWidth: '1px',
        color: isDark ? '#EAEAEA' : '#2A2A2A',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '14px',
      }}
    >
      {label}
    </button>
  );
}

interface StateScreenProps {
  backgroundColor: string;
  titleColor: string;
  bodyColor: string;
  buttonColor: string;
  title: string;
  body: string;
  buttonLabel: string;
  onClick: () => void;
}

function StateScreen({
  backgroundColor,
  titleColor,
  bodyColor,
  buttonColor,
  title,
  body,
  buttonLabel,
  onClick,
}: StateScreenProps) {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor }}>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: titleColor }}>
          {title}
        </h2>
        <p className="mb-4" style={{ color: bodyColor }}>
          {body}
        </p>
        <button
          onClick={onClick}
          className="px-4 py-2 text-white rounded-lg transition-colors"
          style={{ backgroundColor: buttonColor }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
