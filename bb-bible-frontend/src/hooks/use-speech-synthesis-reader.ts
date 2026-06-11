import { useCallback, useEffect, useRef, useState } from 'react';
import { createVerseKey } from '@/lib/bible-parser';
import { BibleVerse } from '@/types/bible';

export type SpeechReaderStatus = 'idle' | 'playing' | 'paused' | 'unsupported';
export type SpeechReaderRate = 0.8 | 1 | 1.5;

interface UseSpeechSynthesisReaderOptions {
  verses: BibleVerse[];
  chapterKey: string;
  lang?: string;
  rate?: SpeechReaderRate;
}

export function useSpeechSynthesisReader({
  verses,
  chapterKey,
  lang = 'ko-KR',
  rate = 1,
}: UseSpeechSynthesisReaderOptions) {
  const [status, setStatus] = useState<SpeechReaderStatus>('idle');
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const currentIndexRef = useRef(0);
  const sessionIdRef = useRef(0);
  const restartTimeoutRef = useRef<number | null>(null);
  const shouldStopRef = useRef(false);
  const versesRef = useRef(verses);
  const rateRef = useRef(rate);
  const previousRateRef = useRef(rate);
  const langRef = useRef(lang);

  versesRef.current = verses;
  rateRef.current = rate;
  langRef.current = lang;

  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const isSupported = useCallback(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }, []);

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(restartTimeoutRef.current);
    restartTimeoutRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (!isSupported()) {
      setStatus('unsupported');
      return;
    }

    clearRestartTimeout();
    shouldStopRef.current = true;
    sessionIdRef.current += 1;
    window.speechSynthesis.cancel();
    currentIndexRef.current = 0;
    setCurrentVerseKey(null);
    setCurrentVerseIndex(null);
    setStatus('idle');
  }, [clearRestartTimeout, isSupported]);

  const speakAtIndex = useCallback(
    (index: number, sessionId: number) => {
      if (!isSupported()) {
        setStatus('unsupported');
        return;
      }

      if (sessionIdRef.current !== sessionId) {
        return;
      }

      const currentVerse = versesRef.current[index];

      if (!currentVerse) {
        currentIndexRef.current = 0;
        setCurrentVerseKey(null);
        setCurrentVerseIndex(null);
        setStatus('idle');
        return;
      }

      shouldStopRef.current = false;
      currentIndexRef.current = index;
      setCurrentVerseIndex(index);
      setCurrentVerseKey(
        createVerseKey(currentVerse.book, currentVerse.chapter, currentVerse.verse),
      );

      const utterance = new SpeechSynthesisUtterance(currentVerse.text);
      utterance.lang = langRef.current;
      utterance.rate = rateRef.current;

      utterance.onend = () => {
        if (shouldStopRef.current || sessionIdRef.current !== sessionId) {
          return;
        }

        speakAtIndex(index + 1, sessionId);
      };

      utterance.onerror = () => {
        if (sessionIdRef.current !== sessionId) {
          return;
        }

        currentIndexRef.current = 0;
        setCurrentVerseKey(null);
        setCurrentVerseIndex(null);
        setStatus('idle');
      };

      setStatus('playing');
      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  const restartAtIndex = useCallback(
    (index: number) => {
      if (!isSupported()) {
        setStatus('unsupported');
        return;
      }

      clearRestartTimeout();
      shouldStopRef.current = true;
      sessionIdRef.current += 1;
      const nextSessionId = sessionIdRef.current;
      window.speechSynthesis.cancel();

      restartTimeoutRef.current = window.setTimeout(() => {
        restartTimeoutRef.current = null;
        speakAtIndex(index, nextSessionId);
      }, 0);
    },
    [clearRestartTimeout, isSupported, speakAtIndex],
  );

  const play = useCallback(() => {
    if (!isSupported()) {
      setStatus('unsupported');
      return;
    }

    currentIndexRef.current = 0;
    restartAtIndex(0);
  }, [isSupported, restartAtIndex]);

  const pause = useCallback(() => {
    if (!isSupported()) {
      setStatus('unsupported');
      return;
    }

    if (status !== 'playing') {
      return;
    }

    clearRestartTimeout();
    shouldStopRef.current = true;
    sessionIdRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus('paused');
  }, [clearRestartTimeout, isSupported, status]);

  const resume = useCallback(() => {
    if (!isSupported()) {
      setStatus('unsupported');
      return;
    }

    restartAtIndex(currentIndexRef.current);
  }, [isSupported, restartAtIndex]);

  const jumpToVerse = useCallback(
    (verseKey: string) => {
      if (!isSupported()) {
        setStatus('unsupported');
        return;
      }

      const targetIndex = versesRef.current.findIndex((verse) => (
        createVerseKey(verse.book, verse.chapter, verse.verse) === verseKey
      ));

      if (targetIndex < 0) {
        return;
      }

      restartAtIndex(targetIndex);
    },
    [isSupported, restartAtIndex],
  );

  const skipPrevious = useCallback(() => {
    const previousIndex = Math.max(0, currentIndexRef.current - 1);
    const previousVerse = versesRef.current[previousIndex];

    if (!previousVerse) {
      return;
    }

    jumpToVerse(createVerseKey(previousVerse.book, previousVerse.chapter, previousVerse.verse));
  }, [jumpToVerse]);

  const skipNext = useCallback(() => {
    const nextIndex = Math.min(versesRef.current.length - 1, currentIndexRef.current + 1);
    const nextVerse = versesRef.current[nextIndex];

    if (!nextVerse) {
      return;
    }

    jumpToVerse(createVerseKey(nextVerse.book, nextVerse.chapter, nextVerse.verse));
  }, [jumpToVerse]);

  useEffect(() => {
    if (!isSupported()) {
      setStatus('unsupported');
      return;
    }

    return () => {
      clearRestartTimeout();
      window.speechSynthesis.cancel();
    };
  }, [clearRestartTimeout, isSupported]);

  useEffect(() => {
    const previousRate = previousRateRef.current;
    rateRef.current = rate;
    previousRateRef.current = rate;

    if (previousRate === rate || status !== 'playing' || !isSupported()) {
      return;
    }

    restartAtIndex(currentIndexRef.current);
  }, [isSupported, rate, restartAtIndex, status]);

  useEffect(() => {
    stop();
  }, [chapterKey, stop]);

  return {
    status,
    currentVerseKey,
    currentVerseIndex,
    totalVerses: verses.length,
    isSupported: status !== 'unsupported',
    play,
    pause,
    resume,
    stop,
    jumpToVerse,
    skipPrevious,
    skipNext,
  };
}
