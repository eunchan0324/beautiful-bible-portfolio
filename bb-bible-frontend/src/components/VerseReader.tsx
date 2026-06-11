'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SelectionActionBar from '@/components/SelectionActionBar';
import ToastMessage from '@/components/ToastMessage';
import { useAuth } from '@/hooks/use-auth';
import { createVerseKey } from '@/lib/bible-parser';
import {
  addHighlight,
  clearHighlights,
  DARK_HIGHLIGHT_BACKGROUND_COLORS,
  HIGHLIGHT_BACKGROUND_COLORS,
  loadHighlights,
  removeHighlight,
  toHighlightRequests,
  toHighlightColorMap,
} from '@/lib/highlight';
import {
  createHighlight,
  createSavedVerse,
  deleteHighlight,
  fetchHighlights,
  syncHighlights,
  updateHighlight,
} from '@/lib/api';
import { getApiErrorMessage, isApiError } from '@/lib/api-error';
import { formatSelectedReference, formatSelectedText } from '@/lib/verse-selection';
import { BibleVerse, FontSize, HighlightColor, ResolvedTheme } from '@/types/bible';

interface VerseReaderProps {
  verses: BibleVerse[];
  compareVerses?: BibleVerse[];
  compareTranslationLabel?: string;
  fontSize: FontSize['size'];
  effectiveTheme: ResolvedTheme;
  selectionActionBarBottomOffset?: number;
  onFontSizeChange?: (size: FontSize['size']) => void;
  startVerse?: number;
  showVerseNumbers?: boolean;
  currentSpeechVerseKey?: string | null;
  isSpeechActive?: boolean;
  onSpeechVerseSelect?: (verse: BibleVerse) => void;
}

type ToastState = {
  id: number;
  message: string;
} | null;

type PendingAction = 'save' | 'highlight' | null;

type HighlightMutation = {
  key: string;
  previousColor?: HighlightColor;
  nextColor?: HighlightColor;
};

const READER_THEME_COLORS: Record<
  ResolvedTheme,
  {
    verseNumber: string;
    verseText: string;
    compareVerseText: string;
    selectionUnderline: string;
    speechBackground: string;
  }
> = {
  light: {
    verseNumber: '#3C3C3C',
    verseText: '#2A2A2A',
    compareVerseText: '#6F765F',
    selectionUnderline: '#55524F',
    speechBackground: '#F4EEE6',
  },
  dark: {
    verseNumber: '#C8BDAE',
    verseText: '#F3EFE8',
    compareVerseText: '#C3CBB8',
    selectionUnderline: '#D8CCBD',
    speechBackground: '#3A3732',
  },
};

function isConflictApiError(error: unknown) {
  return isApiError(error) && error.code === 'CONFLICT';
}

function rollbackFailedHighlightChanges(
  currentHighlights: Record<string, HighlightColor>,
  mutations: HighlightMutation[],
  results: PromiseSettledResult<unknown>[],
) {
  const nextHighlights = { ...currentHighlights };

  results.forEach((result, index) => {
    if (result.status !== 'rejected') {
      return;
    }

    const mutation = mutations[index];
    const currentColor = nextHighlights[mutation.key];
    const stillMatchesOptimisticState =
      mutation.nextColor === undefined
        ? currentColor === undefined
        : currentColor === mutation.nextColor;

    if (!stillMatchesOptimisticState) {
      return;
    }

    if (mutation.previousColor) {
      nextHighlights[mutation.key] = mutation.previousColor;
    } else {
      delete nextHighlights[mutation.key];
    }
  });

  return nextHighlights;
}

export default function VerseReader({
  verses,
  compareVerses = [],
  compareTranslationLabel,
  fontSize,
  effectiveTheme,
  selectionActionBarBottomOffset = 16,
  startVerse,
  showVerseNumbers = true,
  currentSpeechVerseKey = null,
  isSpeechActive = false,
  onSpeechVerseSelect,
}: VerseReaderProps) {
  const [selectedVerses, setSelectedVerses] = useState<Set<string>>(new Set());
  const [highlightedVerses, setHighlightedVerses] = useState<Record<string, HighlightColor>>({});
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const { authMode, isAuthenticated } = useAuth();

  const hasSelection = selectedVerses.size > 0 && !isSpeechActive;
  const selectedVerseList = verses.filter((verse) =>
    selectedVerses.has(createVerseKey(verse.book, verse.chapter, verse.verse)),
  );
  const selectedVerseNumbers = selectedVerseList.map((verse) => verse.verse).sort((a, b) => a - b);
  const selectedReference = formatSelectedReference(verses, selectedVerseNumbers);
  const selectedText = formatSelectedText(selectedVerseList);
  const colors = READER_THEME_COLORS[effectiveTheme];
  const highlightColors =
    effectiveTheme === 'dark' ? DARK_HIGHLIGHT_BACKGROUND_COLORS : HIGHLIGHT_BACKGROUND_COLORS;
  const isSelectionActionPending = pendingAction !== null;
  const compareVerseTexts = useMemo(() => {
    return compareVerses.reduce<Record<string, string>>((acc, verse) => {
      acc[createVerseKey(verse.book, verse.chapter, verse.verse)] = verse.text;
      return acc;
    }, {});
  }, [compareVerses]);

  useEffect(() => {
    if (startVerse && verseRefs.current[startVerse]) {
      setTimeout(() => {
        verseRefs.current[startVerse]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [startVerse, verses]);

  useEffect(() => {
    if (!currentSpeechVerseKey) {
      return;
    }

    const currentVerse = verses.find((verse) =>
      createVerseKey(verse.book, verse.chapter, verse.verse) === currentSpeechVerseKey,
    );

    if (!currentVerse) {
      return;
    }

    verseRefs.current[currentVerse.verse]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [currentSpeechVerseKey, verses]);

  useEffect(() => {
    if (!isSpeechActive) {
      return;
    }

    setSelectedVerses(new Set());
    setIsColorPickerOpen(false);
  }, [isSpeechActive]);

  useEffect(() => {
    if (authMode === 'loading') {
      return;
    }

    if (!isAuthenticated) {
      setHighlightedVerses(toHighlightColorMap(Object.values(loadHighlights().highlights)));
      return;
    }

    let isMounted = true;

    async function loadUserHighlights() {
      const localHighlights = Object.values(loadHighlights().highlights);

      if (localHighlights.length === 0) {
        return fetchHighlights();
      }

      const syncedHighlights = await syncHighlights({
        highlights: toHighlightRequests(localHighlights),
      });

      clearHighlights();

      return syncedHighlights;
    }

    loadUserHighlights()
      .then((highlights) => {
        if (!isMounted) {
          return;
        }

        setHighlightedVerses(toHighlightColorMap(highlights));
      })
      .catch((error) => {
        console.error('하이라이트를 불러오지 못했어요.', error);
        if (isMounted) {
          setHighlightedVerses({});
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authMode, isAuthenticated]);

  useEffect(() => {
    if (!hasSelection) {
      setIsColorPickerOpen(false);
    }
  }, [hasSelection]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === toast.id ? null : currentToast));
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (message: string) => {
    setToast({
      id: Date.now(),
      message,
    });
  };

  const handleVerseClick = (verse: BibleVerse) => {
    if (isSpeechActive && onSpeechVerseSelect) {
      onSpeechVerseSelect(verse);
      return;
    }

    const verseKey = createVerseKey(verse.book, verse.chapter, verse.verse);

    setSelectedVerses((prev) => {
      const next = new Set(prev);

      if (next.has(verseKey)) {
        next.delete(verseKey);
      } else {
        next.add(verseKey);
      }

      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedVerses(new Set());
    setIsColorPickerOpen(false);
  };

  const handleCopySelection = async () => {
    if (!selectedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedText);
      showToast('선택한 구절을 복사했어요.');
      handleClearSelection();
    } catch (error) {
      console.error('복사에 실패했습니다.', error);
      showToast('복사하지 못했어요. 다시 시도해보세요.');
    }
  };

  const handleShareSelection = async () => {
    if (!selectedText) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedReference,
          text: selectedText,
        });
        showToast('공유 시트를 열었어요.');
      } else {
        await navigator.clipboard.writeText(selectedText);
        showToast('공유를 지원하지 않아 복사로 대신했어요.');
      }

      handleClearSelection();
    } catch (error) {
      console.error('공유에 실패했습니다.', error);
      showToast('공유하지 못했어요. 다시 시도해보세요.');
    }
  };

  const handleSaveSelection = async () => {
    if (isSelectionActionPending) {
      showToast('처리 중이에요. 잠시만 기다려 주세요.');
      return;
    }

    const selectedKeys = selectedVerseList.map((verse) =>
      createVerseKey(verse.book, verse.chapter, verse.verse),
    );

    if (selectedKeys.length === 0) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인하면 말씀을 저장할 수 있어요.');
      handleClearSelection();
      return;
    }

    setPendingAction('save');

    try {
      const results = await Promise.allSettled(
        selectedKeys.map((key) => createSavedVerse(key)),
      );
      const savedCount = results.filter((result) => result.status === 'fulfilled').length;
      const skippedCount = selectedKeys.length - savedCount;
      const rejectedResults = results.filter((result) => result.status === 'rejected');
      const isAlreadySavedOnly =
        savedCount === 0 &&
        rejectedResults.length > 0 &&
        rejectedResults.every((result) => isConflictApiError(result.reason));
      const firstRejected = rejectedResults[0];

      if (isAlreadySavedOnly) {
        showToast(
          selectedKeys.length === 1
            ? '이미 저장한 말씀이에요.'
            : '선택한 말씀은 이미 저장되어 있어요.',
        );
        handleClearSelection();
        return;
      }

      if (savedCount === 0 && firstRejected) {
        showToast(getApiErrorMessage(firstRejected.reason, '말씀을 저장하지 못했어요. 다시 시도해 주세요.'));
        return;
      }

      if (savedCount > 0 && skippedCount > 0) {
        showToast(`${savedCount}개 말씀을 저장했어요. 이미 저장된 말씀은 그대로 두었어요.`);
      } else if (savedCount > 0) {
        showToast(
          savedCount === 1
            ? '말씀을 저장했어요.'
            : `${savedCount}개 말씀을 저장했어요.`,
        );
      } else {
        showToast(
          selectedKeys.length === 1
            ? '이미 저장한 말씀이에요.'
            : '선택한 말씀은 이미 저장되어 있어요.',
        );
      }

      handleClearSelection();
    } catch (error) {
      console.error('말씀을 저장하지 못했어요.', error);
      showToast(getApiErrorMessage(error, '말씀을 저장하지 못했어요. 다시 시도해 주세요.'));
    } finally {
      setPendingAction(null);
    }
  };

  const handleHighlightColorSelect = async (color: HighlightColor) => {
    if (isSelectionActionPending) {
      showToast('처리 중이에요. 잠시만 기다려 주세요.');
      return;
    }

    const selectedKeys = selectedVerseList.map((verse) =>
      createVerseKey(verse.book, verse.chapter, verse.verse),
    );

    if (selectedKeys.length === 0) {
      return;
    }

    const previousHighlights = highlightedVerses;
    const mutations = selectedKeys.map((key) => {
      const previousColor = previousHighlights[key];

      return {
        key,
        previousColor,
        nextColor: previousColor === color ? undefined : color,
      };
    });
    const nextHighlights = { ...previousHighlights };

    mutations.forEach((mutation) => {
      if (mutation.nextColor) {
        nextHighlights[mutation.key] = mutation.nextColor;
      } else {
        delete nextHighlights[mutation.key];
      }
    });

    setHighlightedVerses(nextHighlights);
    handleClearSelection();

    if (!isAuthenticated) {
      mutations.forEach((mutation) => {
        if (mutation.nextColor) {
          addHighlight(mutation.key, mutation.nextColor);
        } else {
          removeHighlight(mutation.key);
        }
      });
      return;
    }

    const results = await Promise.allSettled(
      mutations.map((mutation) => {
        if (!mutation.nextColor) {
          return deleteHighlight(mutation.key);
        }

        const request = { verseKey: mutation.key, color: mutation.nextColor, note: null };

        return mutation.previousColor
          ? updateHighlight(mutation.key, request)
          : createHighlight(request);
      }),
    );
    const failedResult = results.find((result) => result.status === 'rejected');

    if (failedResult?.status === 'rejected') {
      setHighlightedVerses((currentHighlights) =>
        rollbackFailedHighlightChanges(currentHighlights, mutations, results),
      );
      console.error('하이라이트를 저장하지 못했어요.', failedResult.reason);
      showToast(getApiErrorMessage(failedResult.reason, '하이라이트를 저장하지 못했어요. 다시 시도해 주세요.'));
    }
  };

  const handleHighlightRemove = async () => {
    if (isSelectionActionPending) {
      showToast('처리 중이에요. 잠시만 기다려 주세요.');
      return;
    }

    const selectedKeys = selectedVerseList.map((verse) =>
      createVerseKey(verse.book, verse.chapter, verse.verse),
    );

    if (selectedKeys.length === 0) {
      return;
    }

    const previousHighlights = highlightedVerses;
    const mutations = selectedKeys.map((key) => ({
      key,
      previousColor: previousHighlights[key],
      nextColor: undefined,
    }));
    const nextHighlights = { ...previousHighlights };

    selectedKeys.forEach((key) => {
      delete nextHighlights[key];
    });

    setHighlightedVerses(nextHighlights);
    handleClearSelection();

    if (!isAuthenticated) {
      selectedKeys.forEach(removeHighlight);
      return;
    }

    const results = await Promise.allSettled(selectedKeys.map((key) => deleteHighlight(key)));
    const failedResult = results.find((result) => result.status === 'rejected');

    if (failedResult?.status === 'rejected') {
      setHighlightedVerses((currentHighlights) =>
        rollbackFailedHighlightChanges(currentHighlights, mutations, results),
      );
      console.error('하이라이트를 삭제하지 못했어요.', failedResult.reason);
      showToast(getApiErrorMessage(failedResult.reason, '하이라이트를 삭제하지 못했어요. 다시 시도해 주세요.'));
    }
  };

  return (
    <div>
      {toast && <ToastMessage message={toast.message} effectiveTheme={effectiveTheme} />}

      {hasSelection && (
        <SelectionActionBar
          selectedReference={selectedReference}
          effectiveTheme={effectiveTheme}
          bottomOffset={selectionActionBarBottomOffset}
          isColorPickerOpen={isColorPickerOpen}
          onClearSelection={handleClearSelection}
          onToggleColorPicker={() => setIsColorPickerOpen((prev) => !prev)}
          onSaveVerse={handleSaveSelection}
          onShare={handleShareSelection}
          onCopy={handleCopySelection}
          onHighlightRemove={handleHighlightRemove}
          onHighlightColorSelect={handleHighlightColorSelect}
          isActionPending={isSelectionActionPending}
        />
      )}

      <div>
        {verses.map((verse, index) => {
          const verseKey = createVerseKey(verse.book, verse.chapter, verse.verse);
          const compareText = compareVerseTexts[verseKey];
          const isSelected = selectedVerses.has(verseKey);
          const isSpeaking = currentSpeechVerseKey === verseKey;
          const highlightColor = highlightedVerses[verseKey];

          const prevVerse = verses[index - 1];
          const prevVerseKey = prevVerse
            ? createVerseKey(prevVerse.book, prevVerse.chapter, prevVerse.verse)
            : null;
          const isPrevSelected = prevVerseKey ? selectedVerses.has(prevVerseKey) : false;
          const isConsecutiveWithPrev =
            isSelected && isPrevSelected && prevVerse && verse.verse === prevVerse.verse + 1;
          const hasHighlight = Boolean(highlightColor);
          const hasEmphasisBackground = hasHighlight || isSpeaking;
          const hasVerticalEmphasis = hasEmphasisBackground;
          const highlightBleedY = hasVerticalEmphasis ? 8 : 0;
          const baseMarginBottom = fontSize === 'large'
            ? compareText ? 38 : 30
            : compareText ? 28 : 20;

          return (
            <div
              key={verseKey}
              ref={(element) => {
                verseRefs.current[verse.verse] = element;
              }}
              onClick={() => handleVerseClick(verse)}
              className="cursor-pointer transition-colors"
              style={{
                marginBottom: `${baseMarginBottom - highlightBleedY}px`,
                paddingTop: hasVerticalEmphasis ? `${highlightBleedY}px` : '0',
                paddingBottom: hasVerticalEmphasis ? `${highlightBleedY}px` : '0',
                backgroundColor: highlightColor
                  ? highlightColors[highlightColor]
                  : isSpeaking ? colors.speechBackground : 'transparent',
                marginLeft: hasEmphasisBackground ? '-30px' : '0',
                marginRight: hasEmphasisBackground ? '-30px' : '0',
                marginTop: hasVerticalEmphasis
                  ? `-${highlightBleedY}px`
                  : isConsecutiveWithPrev ? '0px' : '0px',
                borderRadius: '0px',
                boxShadow: 'none',
                transform: 'none',
                transition: 'background-color 160ms ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  paddingLeft: hasEmphasisBackground ? '30px' : '0',
                  paddingRight: hasEmphasisBackground ? '30px' : '0',
                }}
              >
                {showVerseNumbers && (
                  <span
                    style={{
                      fontFamily: 'Glory, sans-serif',
                      fontWeight: 'medium',
                      fontSize: fontSize === 'large' ? '16px' : '14px',
                      color: colors.verseNumber,
                      marginRight: '10px',
                      flexShrink: 0,
                      lineHeight: fontSize === 'large' ? '16px' : '14px',
                      minWidth: fontSize === 'large' ? '6px' : '5px',
                      marginTop: fontSize === 'large' ? '10px' : '7px',
                    }}
                  >
                    {verse.verse}
                  </span>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 'medium',
                      fontSize: fontSize === 'large' ? '30px' : '18px',
                      color: colors.verseText,
                      lineHeight: fontSize === 'large' ? '50px' : '30px',
                      letterSpacing: '0',
                      textDecorationLine: isSelected && !isSpeechActive ? 'underline' : 'none',
                      textDecorationColor: colors.selectionUnderline,
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '6px',
                    }}
                  >
                    {verse.text}
                  </span>
                  {compareText && (
                    <p
                      aria-label={compareTranslationLabel ? `${compareTranslationLabel} 대조 본문` : undefined}
                      style={{
                        marginTop: fontSize === 'large' ? '12px' : '8px',
                        color: colors.compareVerseText,
                        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: fontSize === 'large' ? '22px' : '15px',
                        fontWeight: 500,
                        lineHeight: fontSize === 'large' ? '34px' : '24px',
                        letterSpacing: '0',
                      }}
                    >
                      {compareText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
