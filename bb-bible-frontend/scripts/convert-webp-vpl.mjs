import fs from 'node:fs';
import path from 'node:path';

const BOOK_CODE_MAP = {
  GEN: '창',
  EXO: '출',
  LEV: '레',
  NUM: '민',
  DEU: '신',
  JOS: '수',
  JDG: '삿',
  RUT: '룻',
  '1SA': '삼상',
  '2SA': '삼하',
  '1KI': '왕상',
  '2KI': '왕하',
  '1CH': '대상',
  '2CH': '대하',
  EZR: '스',
  NEH: '느',
  EST: '에',
  JOB: '욥',
  PSA: '시',
  PRO: '잠',
  ECC: '전',
  SOL: '아',
  ISA: '사',
  JER: '렘',
  LAM: '애',
  EZE: '겔',
  DAN: '단',
  HOS: '호',
  JOE: '욜',
  AMO: '암',
  OBA: '옵',
  JON: '욘',
  MIC: '미',
  NAH: '나',
  HAB: '합',
  ZEP: '습',
  HAG: '학',
  ZEC: '슥',
  MAL: '말',
  MAT: '마',
  MAR: '막',
  LUK: '눅',
  JOH: '요',
  ACT: '행',
  ROM: '롬',
  '1CO': '고전',
  '2CO': '고후',
  GAL: '갈',
  EPH: '엡',
  PHI: '빌',
  COL: '골',
  '1TH': '살전',
  '2TH': '살후',
  '1TI': '딤전',
  '2TI': '딤후',
  TIT: '딛',
  PHM: '몬',
  HEB: '히',
  JAM: '약',
  '1PE': '벧전',
  '2PE': '벧후',
  '1JO': '요일',
  '2JO': '요이',
  '3JO': '요삼',
  JUD: '유',
  REV: '계',
};

const DEFAULT_SOURCE = path.join(process.cwd(), '..', 'tmp', 'engwebp_vpl.txt');
const DEFAULT_KOR = path.join(process.cwd(), 'public', 'bible.json');
const DEFAULT_OUTPUT = path.join(process.cwd(), 'public', 'bible-webp.json');
const DEFAULT_REPORT = path.join(process.cwd(), '..', 'docs', 'data-sources', 'webp-conversion-report.md');

const SPECIAL_ALIGNMENTS = [
  {
    reason: '한국어 기준 본문 고후13:11은 WEBP 고후13:11-12에 해당한다.',
    targetKey: '고후13:11',
    sourceKeys: ['고후13:11', '고후13:12'],
  },
  {
    reason: '한국어 기준 본문 고후13:12는 WEBP 고후13:13에 해당한다.',
    targetKey: '고후13:12',
    sourceKeys: ['고후13:13'],
  },
  {
    reason: '한국어 기준 본문 고후13:13은 WEBP 고후13:14에 해당한다.',
    targetKey: '고후13:13',
    sourceKeys: ['고후13:14'],
  },
  {
    reason: 'WEBP는 롬16:25-27 송영을 롬14:24-26에 둔다.',
    targetKey: '롬16:25',
    sourceKeys: ['롬14:24'],
  },
  {
    reason: 'WEBP는 롬16:25-27 송영을 롬14:24-26에 둔다.',
    targetKey: '롬16:26',
    sourceKeys: ['롬14:25'],
  },
  {
    reason: 'WEBP는 롬16:25-27 송영을 롬14:24-26에 둔다.',
    targetKey: '롬16:27',
    sourceKeys: ['롬14:26'],
  },
  {
    reason: 'WEBP 요삼1:14가 한국어 기준 본문 요삼1:14-15 내용을 함께 담고 있어 앞부분만 요삼1:14로 사용한다.',
    targetKey: '요삼1:14',
    sourceKeys: ['요삼1:14'],
    transform: (text) => text.split(' Peace be to you. ')[0],
  },
  {
    reason: 'WEBP 요삼1:14가 한국어 기준 본문 요삼1:14-15 내용을 함께 담고 있어 뒷부분을 요삼1:15로 사용한다.',
    targetKey: '요삼1:15',
    sourceKeys: ['요삼1:14'],
    transform: (text) => {
      const [, tail] = text.split(' Peace be to you. ');
      return tail ? `Peace be to you. ${tail}` : '';
    },
  },
];

function getArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value`);
  }

  return path.resolve(value);
}

function parseVpl(sourcePath) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const lines = source.split(/\r?\n/);
  const verseMap = {};
  const duplicateKeys = [];
  const unknownBookCodes = new Set();
  const unparsableLines = [];
  const emptyVerseKeys = [];

  lines.forEach((line, index) => {
    if (!line.trim()) {
      return;
    }

    const match = line.match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)(?:\s+(.*))?$/);
    if (!match) {
      unparsableLines.push({ lineNumber: index + 1, line });
      return;
    }

    const [, sourceBookCode, chapter, verse, text = ''] = match;
    const bookCode = BOOK_CODE_MAP[sourceBookCode];
    if (!bookCode) {
      unknownBookCodes.add(sourceBookCode);
      return;
    }

    const verseKey = `${bookCode}${Number(chapter)}:${Number(verse)}`;
    const verseText = text.trim();
    if (!verseText) {
      emptyVerseKeys.push(verseKey);
      return;
    }

    if (verseMap[verseKey]) {
      duplicateKeys.push(verseKey);
    }

    verseMap[verseKey] = verseText;
  });

  return {
    verseMap,
    sourceLineCount: lines.filter((line) => line.trim()).length,
    duplicateKeys,
    unknownBookCodes: [...unknownBookCodes].sort(),
    unparsableLines,
    emptyVerseKeys,
  };
}

function compareWithKoreanBible(koreanBible, webpBible) {
  const koreanKeys = Object.keys(koreanBible);
  const webpKeys = Object.keys(webpBible);
  const koreanKeySet = new Set(koreanKeys);
  const webpKeySet = new Set(webpKeys);

  const missingInWebp = koreanKeys.filter((key) => !webpKeySet.has(key));
  const webpOnly = webpKeys.filter((key) => !koreanKeySet.has(key));

  return {
    koreanCount: koreanKeys.length,
    webpCount: webpKeys.length,
    missingInWebp,
    webpOnly,
  };
}

function countByBook(verseMap) {
  return Object.keys(verseMap).reduce((acc, verseKey) => {
    const bookCode = verseKey.replace(/\d.*$/, '');
    acc[bookCode] = (acc[bookCode] ?? 0) + 1;
    return acc;
  }, {});
}

function buildSpecialAlignmentMap(parsedWebpBible) {
  const appliedAlignments = [];
  const specialByTarget = new Map();
  const specialSourceKeys = new Set();

  SPECIAL_ALIGNMENTS.forEach((alignment) => {
    const sourceTexts = alignment.sourceKeys
      .map((sourceKey) => parsedWebpBible[sourceKey])
      .filter(Boolean);

    if (sourceTexts.length !== alignment.sourceKeys.length) {
      return;
    }

    const joinedText = sourceTexts.join(' ');
    const alignedText = alignment.transform ? alignment.transform(joinedText).trim() : joinedText;

    if (!alignedText) {
      return;
    }

    specialByTarget.set(alignment.targetKey, alignedText);
    alignment.sourceKeys.forEach((sourceKey) => specialSourceKeys.add(sourceKey));
    appliedAlignments.push({
      targetKey: alignment.targetKey,
      sourceKeys: alignment.sourceKeys,
      reason: alignment.reason,
    });
  });

  return { appliedAlignments, specialByTarget, specialSourceKeys };
}

function orderWebpBible(koreanBible, parsedWebpBible) {
  const ordered = {};
  const usedSourceKeys = new Set();
  const { appliedAlignments, specialByTarget, specialSourceKeys } = buildSpecialAlignmentMap(parsedWebpBible);

  Object.keys(koreanBible).forEach((key) => {
    if (specialByTarget.has(key)) {
      ordered[key] = specialByTarget.get(key);
      return;
    }

    const rangeMatch = key.match(/^([가-힣]+)(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
      const [, bookCode, chapter, startVerse, endVerse] = rangeMatch;
      const sourceKeys = [];
      const texts = [];

      for (let verse = Number(startVerse); verse <= Number(endVerse); verse += 1) {
        const sourceKey = `${bookCode}${Number(chapter)}:${verse}`;
        sourceKeys.push(sourceKey);
        if (parsedWebpBible[sourceKey]) {
          texts.push(parsedWebpBible[sourceKey]);
        }
      }

      if (texts.length > 0) {
        ordered[key] = texts.join(' ');
        sourceKeys.forEach((sourceKey) => usedSourceKeys.add(sourceKey));
      }

      return;
    }

    if (parsedWebpBible[key]) {
      ordered[key] = parsedWebpBible[key];
      usedSourceKeys.add(key);
    }
  });

  Object.keys(parsedWebpBible)
    .filter((key) => !usedSourceKeys.has(key) && !specialSourceKeys.has(key))
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .forEach((key) => {
      ordered[key] = parsedWebpBible[key];
    });

  return { orderedWebpBible: ordered, appliedAlignments };
}

function formatSampleList(items) {
  if (items.length === 0) {
    return '- 없음';
  }

  return items.slice(0, 50).map((item) => `- ${item}`).join('\n');
}

function buildReport({
  sourcePath,
  outputPath,
  sourceLineCount,
  duplicateKeys,
  unknownBookCodes,
  unparsableLines,
  emptyVerseKeys,
  appliedAlignments,
  comparison,
  webpByBook,
  samples,
}) {
  const generatedAt = new Date().toISOString();

  return `# WEBP 성경 데이터 변환 리포트

> Issue #182: WEBP 성경 데이터 변환 및 검증

---

## 원본

- Source URL: https://ebible.org/Scriptures/engwebp_vpl.zip
- Source file: engwebp_vpl.txt
- Local source path: ${sourcePath}
- Output path: ${outputPath}
- Generated at: ${generatedAt}

---

## 변환 결과

- 원본 VPL non-empty lines: ${sourceLineCount}
- 한국어 bible.json 절 수: ${comparison.koreanCount}
- WEBP 변환 절 수: ${comparison.webpCount}
- WEBP 누락 절 수: ${comparison.missingInWebp.length}
- WEBP에만 있는 절 수: ${comparison.webpOnly.length}
- 중복 verse_key 수: ${duplicateKeys.length}
- 알 수 없는 원본 책 코드 수: ${unknownBookCodes.length}
- 파싱 실패 라인 수: ${unparsableLines.length}
- 원본에서 본문이 비어 있는 절 수: ${emptyVerseKeys.length}
- 수동 절 번호 보정 수: ${appliedAlignments.length}

---

## 책별 WEBP 절 수

${Object.entries(webpByBook)
  .map(([bookCode, count]) => `- ${bookCode}: ${count}`)
  .join('\n')}

---

## WEBP 누락 절 샘플

${formatSampleList(comparison.missingInWebp)}

---

## WEBP에만 있는 절 샘플

${formatSampleList(comparison.webpOnly)}

---

## 중복 verse_key 샘플

${formatSampleList(duplicateKeys)}

---

## 알 수 없는 원본 책 코드

${formatSampleList(unknownBookCodes)}

---

## 파싱 실패 라인 샘플

${formatSampleList(unparsableLines.map((item) => `${item.lineNumber}: ${item.line}`))}

---

## 원본에서 본문이 비어 있는 절 샘플

${formatSampleList(emptyVerseKeys)}

---

## 수동 절 번호 보정

${formatSampleList(appliedAlignments.map((item) => `${item.targetKey} <= ${item.sourceKeys.join(', ')} (${item.reason})`))}

---

## 대표 절 확인

- 창1:1: ${samples['창1:1'] ?? '없음'}
- 시23:1: ${samples['시23:1'] ?? '없음'}
- 요1:1: ${samples['요1:1'] ?? '없음'}
- 요3:16: ${samples['요3:16'] ?? '없음'}
- 롬8:28: ${samples['롬8:28'] ?? '없음'}

---

## 판정

${comparison.missingInWebp.length === 0 && comparison.webpOnly.length === 0 && duplicateKeys.length === 0 && unknownBookCodes.length === 0 && unparsableLines.length === 0
  ? '기존 한국어 bible.json과 WEBP verse_key가 모두 일치한다.'
  : '판본상 생략 절과 절 번호 차이는 리포트에 기록한다. FE 표시 시 WEBP 본문이 없는 절은 대조 역본을 숨기고, 후속 QA에서 대표 장을 확인한다.'}
`;
}

function main() {
  const sourcePath = getArg('--source', DEFAULT_SOURCE);
  const koreanPath = getArg('--korean', DEFAULT_KOR);
  const outputPath = getArg('--output', DEFAULT_OUTPUT);
  const reportPath = getArg('--report', DEFAULT_REPORT);

  const koreanBible = JSON.parse(fs.readFileSync(koreanPath, 'utf8'));
  const parsed = parseVpl(sourcePath);
  const { orderedWebpBible, appliedAlignments } = orderWebpBible(koreanBible, parsed.verseMap);
  const comparison = compareWithKoreanBible(koreanBible, orderedWebpBible);
  const webpByBook = countByBook(orderedWebpBible);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(orderedWebpBible, null, 2)}\n`, 'utf8');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    buildReport({
      sourcePath,
      outputPath,
      sourceLineCount: parsed.sourceLineCount,
      duplicateKeys: parsed.duplicateKeys,
      unknownBookCodes: parsed.unknownBookCodes,
      unparsableLines: parsed.unparsableLines,
      emptyVerseKeys: parsed.emptyVerseKeys,
      appliedAlignments,
      comparison,
      webpByBook,
      samples: orderedWebpBible,
    }),
    'utf8',
  );

  console.log(JSON.stringify({
    outputPath,
    reportPath,
    koreanCount: comparison.koreanCount,
    webpCount: comparison.webpCount,
    missingInWebp: comparison.missingInWebp.length,
    webpOnly: comparison.webpOnly.length,
    duplicateKeys: parsed.duplicateKeys.length,
    unknownBookCodes: parsed.unknownBookCodes.length,
    unparsableLines: parsed.unparsableLines.length,
    emptyVerseKeys: parsed.emptyVerseKeys.length,
    appliedAlignments: appliedAlignments.length,
  }, null, 2));
}

main();
