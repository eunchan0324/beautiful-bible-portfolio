'use client';

import { AlertCircle, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import PageSearchField from '@/components/PageSearchField';
import SlowRequestNotice from '@/components/SlowRequestNotice';
import { useSlowRequest } from '@/hooks/use-slow-request';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  fetchPersonCommentaries,
  PersonCommentaryListItemResponse,
} from '@/lib/api';
import { getPersonImageStyle } from './person-image';

export default function PersonCommentaryList() {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<PersonCommentaryListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSlowLoading = useSlowRequest(isLoading);
  const trimmedQuery = query.trim();

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage(null);

    fetchPersonCommentaries()
      .then((response) => {
        if (isMounted) {
          setPeople(response);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, '인물 해설을 불러오지 못했어요.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPeople = useMemo(() => {
    if (!trimmedQuery) {
      return people;
    }

    return people.filter((person) => (
      person.name.includes(trimmedQuery)
      || person.personCode.includes(trimmedQuery.toLowerCase())
      || person.keywords.some((keyword) => keyword.includes(trimmedQuery))
    ));
  }, [people, trimmedQuery]);

  return (
    <main className="min-h-screen bg-[#F0EEE7] pb-[132px]">
      <PageHeader title="인물 해설" align="center" showBack sticky>
        <PageSearchField
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="인물 이름이나 키워드로 찾기"
          className="mt-3"
        />
      </PageHeader>

      <div className="px-5 pt-5">
        <p className="mb-4 break-keep px-1 text-[13px] font-medium leading-relaxed text-[#8D8881]">
          본문 이해를 돕기 위해 주요 인물의 이야기 흐름과 관련 구절을 차분하게 정리했어요.
        </p>

        {isLoading && <ListSkeleton />}
        {isSlowLoading && <SlowRequestNotice className="mt-4" />}

        {!isLoading && errorMessage && (
          <div className="rounded-[16px] bg-white px-5 py-8 shadow-sm">
            <AlertCircle size={22} className="mb-3 text-[#A8754D]" />
            <p className="text-[15px] font-bold text-[#343434]">
              인물 해설을 불러오지 못했어요
            </p>
            <p className="mt-2 break-keep text-[13px] font-medium leading-relaxed text-[#8D8881]">
              {errorMessage}
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && filteredPeople.length === 0 ? (
          <div className="rounded-[16px] bg-white px-5 py-10 text-center shadow-sm">
            <p className="text-[15px] font-bold text-[#343434]">
              {trimmedQuery ? '맞는 인물이 없어요' : '아직 준비된 인물 해설이 없어요'}
            </p>
            <p className="mt-2 text-[13px] font-medium text-[#8D8881]">
              {trimmedQuery ? '이름이나 키워드로 다시 찾아보세요.' : '승인된 인물 해설이 준비되면 이곳에 표시돼요.'}
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredPeople.length > 0 && (
          <div className="space-y-3">
            {filteredPeople.map((person) => (
              <PersonRow key={person.personCode} person={person} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function PersonRow({ person }: { person: PersonCommentaryListItemResponse }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/ai/persons/${person.personCode}`)}
      className="flex w-full items-center gap-4 rounded-[16px] bg-white px-4 py-4 text-left shadow-sm active:bg-[#F8F5EE]"
    >
      <span
        className="flex h-16 w-16 shrink-0 items-end overflow-hidden rounded-[14px] bg-[#DDD2C1] bg-cover bg-center"
        style={getPersonImageStyle(person.personCode)}
      >
        <span className="h-full w-full bg-[linear-gradient(135deg,rgba(92,74,55,0.20),rgba(244,239,230,0.66))]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold text-[#343434]">
          {person.name}
        </span>
        <span className="mt-1 block break-keep text-[13px] font-medium leading-relaxed text-[#7A746B]">
          {person.shortDescription}
        </span>
        <span className="mt-3 flex flex-wrap gap-1.5">
          {person.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-[#F3EFE7] px-2 py-1 text-[11px] font-semibold text-[#7A6048]"
            >
              {keyword}
            </span>
          ))}
        </span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-[#C4BDB2]" />
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 rounded-[16px] bg-white px-4 py-4 shadow-sm"
        >
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-[14px] bg-[#E8E4DC]" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-4 w-20 animate-pulse rounded-full bg-[#E8E4DC]" />
            <div className="h-3 w-full animate-pulse rounded-full bg-[#EFEAE1]" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#EFEAE1]" />
          </div>
        </div>
      ))}
    </div>
  );
}
