import { findBookById } from '@/data/bible-books';
import { BibleVerse } from '@/types/bible';

export function formatSelectedReference(verses: BibleVerse[], selectedVerseNumbers: number[]) {
  if (verses.length === 0 || selectedVerseNumbers.length === 0) {
    return '';
  }

  const firstVerse = verses[0];
  const bookName = findBookById(firstVerse.book)?.name ?? firstVerse.book;
  const chapter = firstVerse.chapter;
  const ranges = buildVerseRanges(selectedVerseNumbers);
  const joinedRanges = ranges.join(', ');

  if (joinedRanges.length <= 18) {
    return `${bookName} ${chapter}:${joinedRanges}`;
  }

  const firstRange = ranges[0];
  const remainingCount = selectedVerseNumbers.length - countRangeVerses(firstRange);

  if (remainingCount > 0) {
    return `${bookName} ${chapter}:${firstRange} 외 ${remainingCount}절`;
  }

  return `${bookName} ${chapter}:${firstRange}`;
}

export function formatSelectedText(selectedVerses: BibleVerse[]) {
  if (selectedVerses.length === 0) {
    return '';
  }

  const sortedVerses = [...selectedVerses].sort((a, b) => a.verse - b.verse);
  const selectedVerseNumbers = sortedVerses.map((verse) => verse.verse);
  const reference = formatSelectedReference(sortedVerses, selectedVerseNumbers);
  const body = sortedVerses.map((verse) => `${verse.verse}. ${verse.text}`).join('\n');

  return `${reference}\n\n${body}`;
}

function buildVerseRanges(selectedVerseNumbers: number[]) {
  if (selectedVerseNumbers.length === 0) {
    return [];
  }

  const ranges: string[] = [];
  let rangeStart = selectedVerseNumbers[0];
  let previous = selectedVerseNumbers[0];

  for (let index = 1; index < selectedVerseNumbers.length; index += 1) {
    const current = selectedVerseNumbers[index];

    if (current === previous + 1) {
      previous = current;
      continue;
    }

    ranges.push(formatRange(rangeStart, previous));
    rangeStart = current;
    previous = current;
  }

  ranges.push(formatRange(rangeStart, previous));

  return ranges;
}

function formatRange(start: number, end: number) {
  return start === end ? `${start}` : `${start}-${end}`;
}

function countRangeVerses(range: string) {
  if (!range.includes('-')) {
    return 1;
  }

  const [start, end] = range.split('-').map(Number);
  return end - start + 1;
}
