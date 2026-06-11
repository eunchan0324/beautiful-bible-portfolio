'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchVerses } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { SearchVerseItem } from '@/types/search';

export type SearchStatus = 'initial' | 'typing' | 'loading' | 'results' | 'empty' | 'error';

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 280;
const SEARCH_PAGE_SIZE = 20;

export function useBibleSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [status, setStatus] = useState<SearchStatus>('initial');
  const [items, setItems] = useState<SearchVerseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    abortRef.current?.abort();

    if (!debouncedQuery) {
      setStatus('initial');
      setItems([]);
      setTotal(0);
      setErrorMessage(null);
      return;
    }

    if (debouncedQuery.length < MIN_SEARCH_LENGTH) {
      setStatus('typing');
      setItems([]);
      setTotal(0);
      setErrorMessage(null);
      return;
    }

    const abortController = new AbortController();
    abortRef.current = abortController;

    setStatus('loading');
    setErrorMessage(null);

    searchVerses({
      q: debouncedQuery,
      page: 0,
      size: SEARCH_PAGE_SIZE,
      signal: abortController.signal,
    })
      .then((result) => {
        setItems(result.content);
        setTotal(result.totalElements);
        setStatus(result.totalElements > 0 ? 'results' : 'empty');
      })
      .catch((error) => {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        setStatus('error');
        setErrorMessage(getApiErrorMessage(error, '검색 결과를 불러오는 중 문제가 생겼어요.'));
      });

    return () => abortController.abort();
  }, [debouncedQuery, retryCount]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    status,
    errorMessage,
    items,
    total,
    retry,
  };
}
