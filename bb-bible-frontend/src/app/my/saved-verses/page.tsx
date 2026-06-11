'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SlowRequestNotice from '@/components/SlowRequestNotice';
import MyPageHeader from '@/components/my/MyPageHeader';
import { useAuth } from '@/hooks/use-auth';
import { useSlowRequest } from '@/hooks/use-slow-request';
import { deleteSavedVerse, fetchSavedVerses, SavedVerseResponse } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';

interface SavedVerseGroup {
  id: string;
  bookCode: string;
  bookName: string;
  chapterNum: number;
  startVerseNum: number;
  endVerseNum: number;
  verseKeys: string[];
  verseTexts: string[];
}

export default function SavedVersesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signInWithKakao } = useAuth();
  const [items, setItems] = useState<SavedVerseResponse[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedVerseGroup | null>(null);
  const isSlowLoading = useSlowRequest(status === 'loading');
  const groups = groupSavedVerses(items);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;
    setStatus('loading');
    setErrorMessage(null);

    fetchSavedVerses()
      .then((savedVerses) => {
        if (isMounted) {
          setItems(savedVerses);
          setStatus('idle');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, '저장한 말씀을 불러오지 못했어요.'));
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleDeleteGroup = async (group: SavedVerseGroup) => {
    const previousItems = items;
    const verseKeys = group.verseKeys;

    setItems((currentItems) => currentItems.filter((item) => !verseKeys.includes(item.verseKey)));
    setDeleteTarget(null);

    try {
      await Promise.all(verseKeys.map((verseKey) => deleteSavedVerse(verseKey)));
    } catch {
      setItems(previousItems);
    }
  };

  const goToGroup = (group: SavedVerseGroup) => {
    router.push(
      `/bible/${encodeURIComponent(group.bookCode)}/${group.chapterNum}?startVerse=${group.startVerseNum}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#F0EEE7] px-5 pb-[132px] pt-9">
      <div className="mx-auto max-w-sm">
        <MyPageHeader title="저장한 말씀" showBack />

        {!isAuthenticated && !isLoading && (
          <section className="rounded-[16px] bg-white px-5 py-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0EEE7] text-[#8D8881]">
              <Bookmark size={24} />
            </div>
            <p className="mt-4 text-[16px] font-bold text-[#414141]">로그인이 필요해요</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6E6A63]">
              로그인하면 저장한 말씀을 기기와 상관없이 다시 볼 수 있어요.
            </p>
            <button
              type="button"
              onClick={signInWithKakao}
              className="mt-5 h-11 rounded-full bg-[#414141] px-6 text-[14px] font-bold text-white"
            >
              로그인하기
            </button>
          </section>
        )}

        {isAuthenticated && status === 'loading' && (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[132px] animate-pulse rounded-[16px] bg-white/70" />
            ))}
          </div>
        )}
        {isAuthenticated && isSlowLoading && <SlowRequestNotice className="mt-4" />}

        {isAuthenticated && status === 'error' && (
          <section className="rounded-[16px] bg-white px-5 py-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="text-[16px] font-bold text-[#414141]">잠시 후 다시 시도해주세요</p>
            <p className="mt-2 text-[13px] text-[#8D8881]">
              {errorMessage ?? '저장한 말씀을 불러오지 못했어요.'}
            </p>
          </section>
        )}

        {isAuthenticated && status === 'idle' && items.length === 0 && (
          <section className="rounded-[16px] bg-white px-5 py-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0EEE7] text-[#8D8881]">
              <Bookmark size={24} />
            </div>
            <p className="mt-4 text-[16px] font-bold text-[#414141]">아직 저장한 말씀이 없어요</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6E6A63]">
              읽기 화면에서 마음에 남는 구절을 저장해보세요.
            </p>
          </section>
        )}

        {isAuthenticated && status === 'idle' && items.length > 0 && (
          <div className="space-y-3">
            <p className="px-1 text-[13px] font-bold text-[#8D8881]">
              총 {items.length}개 · 묶음 {groups.length}개
            </p>
            {groups.map((group) => (
              <article
                key={group.id}
                className="rounded-[16px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => goToGroup(group)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#CCE5FF] px-2 text-[13px] font-semibold text-[#414141]">
                      {group.bookCode}
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] font-bold text-[#414141]">
                      {group.bookName} {formatVerseRange(group)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(group)}
                    aria-label={`${group.bookName} ${formatVerseRange(group)} 저장 해제`}
                    className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#8D7F5B] transition-colors hover:bg-[#F0EEE7]"
                  >
                    <BookmarkCheck size={21} fill="currentColor" strokeWidth={1.8} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => goToGroup(group)}
                  className="w-full text-left"
                >
                  <div className="mt-3 space-y-2 text-[15px] leading-[1.7] text-[#414141]">
                    {group.verseTexts.map((text, index) => (
                      <p key={`${group.verseKeys[index]}-text`}>
                        {group.verseKeys.length > 1 && (
                          <span className="mr-2 text-[13px] font-semibold text-[#8D8881]">
                            {group.startVerseNum + index}
                          </span>
                        )}
                        {text}
                      </p>
                    ))}
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4">
          <div className="w-full max-w-sm rounded-t-[28px] bg-[#F9F8F4] px-7 pb-8 pt-4 shadow-[0_-12px_32px_rgba(0,0,0,0.16)]">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-[#D2CFC8]" />
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#414141]">
              저장 해제할까요?
            </h2>
            <p className="mt-3 text-[15px] font-bold text-[#414141]">
              {deleteTarget.bookName} {formatVerseRange(deleteTarget)}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#6E6A63]">
              {deleteTarget.verseKeys.length === 1
                ? '저장한 말씀에서 사라져요.'
                : `${deleteTarget.verseKeys.length}개 구절이 저장한 말씀에서 사라져요.`}
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-14 rounded-[14px] bg-[#ECEAE3] text-[15px] font-bold text-[#414141]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(deleteTarget)}
                className="h-14 rounded-[14px] bg-[#B05F52] text-[15px] font-bold text-white"
              >
                저장 해제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function groupSavedVerses(items: SavedVerseResponse[]): SavedVerseGroup[] {
  const sortedItems = [...items].sort((a, b) => {
    if (a.bookCode !== b.bookCode) {
      return a.bookCode.localeCompare(b.bookCode, 'ko');
    }

    if (a.chapterNum !== b.chapterNum) {
      return a.chapterNum - b.chapterNum;
    }

    return a.verseNum - b.verseNum;
  });

  return sortedItems.reduce<SavedVerseGroup[]>((groups, item) => {
    const lastGroup = groups[groups.length - 1];
    const isConsecutive =
      lastGroup &&
      lastGroup.bookCode === item.bookCode &&
      lastGroup.chapterNum === item.chapterNum &&
      lastGroup.endVerseNum + 1 === item.verseNum;

    if (isConsecutive) {
      lastGroup.endVerseNum = item.verseNum;
      lastGroup.verseKeys.push(item.verseKey);
      lastGroup.verseTexts.push(item.verseText);
      return groups;
    }

    groups.push({
      id: item.verseKey,
      bookCode: item.bookCode,
      bookName: item.bookName,
      chapterNum: item.chapterNum,
      startVerseNum: item.verseNum,
      endVerseNum: item.verseNum,
      verseKeys: [item.verseKey],
      verseTexts: [item.verseText],
    });

    return groups;
  }, []);
}

function formatVerseRange(group: SavedVerseGroup) {
  if (group.startVerseNum === group.endVerseNum) {
    return `${group.chapterNum}:${group.startVerseNum}`;
  }

  return `${group.chapterNum}:${group.startVerseNum}-${group.endVerseNum}`;
}
