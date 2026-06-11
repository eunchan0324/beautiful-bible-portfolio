'use client';

import {
  Check,
  Languages,
  Monitor,
  Moon,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { SpeechReaderRate, SpeechReaderStatus } from '@/hooks/use-speech-synthesis-reader';
import { CompareTranslation, FontSize, ResolvedTheme, ThemeMode } from '@/types/bible';

interface ChapterNavProps {
  fontSize: FontSize['size'];
  themeMode: ThemeMode;
  effectiveTheme: ResolvedTheme;
  compareTranslation: CompareTranslation;
  speechStatus: SpeechReaderStatus;
  speechRate: SpeechReaderRate;
  speechChapterLabel?: string;
  speechCurrentVerseIndex?: number | null;
  speechTotalVerses?: number;
  isCompareLoading?: boolean;
  compareError?: string | null;
  onFontSizeChange: (size: FontSize['size']) => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onCompareTranslationChange: (translation: CompareTranslation) => void;
  onSpeechToggle: () => void;
  onSpeechStop: () => void;
  onSpeechRateChange: (rate: SpeechReaderRate) => void;
  onSpeechPrevious: () => void;
  onSpeechNext: () => void;
}

const SPEECH_RATE_OPTIONS: SpeechReaderRate[] = [0.8, 1, 1.5];

const TOOLBAR_THEME_COLORS: Record<
  ResolvedTheme,
  {
    background: string;
    controlBackground: string;
    activeControlBackground: string;
    text: string;
    mutedText: string;
    icon: string;
    activeIcon: string;
    sheetBackground: string;
    sheetOverlay: string;
    border: string;
  }
> = {
  light: {
    background: '#FCFBFB',
    controlBackground: '#DFD4C4',
    activeControlBackground: '#A88A63',
    text: '#414141',
    mutedText: '#8D8881',
    icon: '#414141',
    activeIcon: '#FFFFFF',
    sheetBackground: '#FFFFFF',
    sheetOverlay: 'rgba(0,0,0,0.42)',
    border: '#EEE6DB',
  },
  dark: {
    background: '#2F2F2F',
    controlBackground: '#4A4A4A',
    activeControlBackground: '#C8BDAE',
    text: '#EAEAEA',
    mutedText: '#C8BDAE',
    icon: '#EAEAEA',
    activeIcon: '#2F2F2F',
    sheetBackground: '#3A3A3A',
    sheetOverlay: 'rgba(0,0,0,0.58)',
    border: '#55504A',
  },
};

export default function ChapterNavigation({
  fontSize,
  themeMode,
  effectiveTheme,
  compareTranslation,
  speechStatus,
  speechRate,
  speechChapterLabel,
  speechCurrentVerseIndex = null,
  speechTotalVerses = 0,
  isCompareLoading = false,
  compareError = null,
  onFontSizeChange,
  onThemeModeChange,
  onCompareTranslationChange,
  onSpeechToggle,
  onSpeechStop,
  onSpeechRateChange,
  onSpeechPrevious,
  onSpeechNext,
}: ChapterNavProps) {
  const [isTranslationSheetOpen, setIsTranslationSheetOpen] = useState(false);
  const [isSpeechRateMenuOpen, setIsSpeechRateMenuOpen] = useState(false);
  const colors = TOOLBAR_THEME_COLORS[effectiveTheme];
  const ThemeIcon = themeMode === 'system' ? Monitor : themeMode === 'dark' ? Moon : Sun;
  const nextThemeMode = themeMode === 'system' ? 'light' : themeMode === 'light' ? 'dark' : 'system';
  const nextFontSize = fontSize === 'small' ? 'large' : 'small';
  const isCompareActive = compareTranslation === 'WEBP';
  const isSpeechActive = speechStatus === 'playing' || speechStatus === 'paused';
  const isSpeechUnsupported = speechStatus === 'unsupported';
  const SpeechIcon = speechStatus === 'playing' ? Pause : speechStatus === 'paused' ? Play : Volume2;
  const speechProgressPercent =
    speechTotalVerses > 0 && speechCurrentVerseIndex !== null
      ? ((speechCurrentVerseIndex + 1) / speechTotalVerses) * 100
      : 0;
  const speechRateLabel = speechRate === 1 ? '1.0x' : `${speechRate}x`;
  const speechButtonLabel =
    speechStatus === 'playing'
      ? '일시정지'
      : speechStatus === 'paused'
        ? '이어듣기'
        : isSpeechUnsupported
          ? '미지원'
          : '듣기';
  const handleSpeechStop = () => {
    setIsSpeechRateMenuOpen(false);
    onSpeechStop();
  };

  return (
    <>
      {isSpeechActive && speechChapterLabel && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
          <div
            className="relative w-full max-w-[430px] rounded-t-[24px] px-5 pb-4 pt-4 shadow-[0_-14px_36px_rgba(0,0,0,0.26)]"
            style={{
              backgroundColor: 'rgba(22, 22, 22, 0.94)',
              color: '#FFFFFF',
            }}
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <div className="relative flex min-w-0 items-center justify-self-start">
                <button
                  type="button"
                  onClick={() => setIsSpeechRateMenuOpen((isOpen) => !isOpen)}
                  className="rounded-full bg-white/12 px-3 py-1.5 text-[12px] font-bold text-white transition active:scale-[0.96]"
                  aria-label={`읽기 속도 선택: ${speechRateLabel}`}
                >
                  {speechRateLabel}
                </button>
                {isSpeechRateMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 flex rounded-full bg-white p-1 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
                    {SPEECH_RATE_OPTIONS.map((rateOption) => {
                      const isSelected = speechRate === rateOption;
                      const rateLabel = rateOption === 1 ? '1.0x' : `${rateOption}x`;

                      return (
                        <button
                          key={rateOption}
                          type="button"
                          onClick={() => {
                            onSpeechRateChange(rateOption);
                            setIsSpeechRateMenuOpen(false);
                          }}
                          className="h-8 rounded-full px-3 text-[12px] font-bold transition active:scale-[0.96]"
                          style={{
                            backgroundColor: isSelected ? '#A88A63' : 'transparent',
                            color: isSelected ? '#FFFFFF' : '#414141',
                          }}
                          aria-label={`${rateLabel} 속도로 듣기`}
                        >
                          {rateLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="truncate text-center text-[12px] font-bold text-white/78">
                {speechChapterLabel} {speechStatus === 'paused' ? '일시정지됨' : '듣는 중'}
              </p>
              <button
                type="button"
                onClick={handleSpeechStop}
                className="flex h-10 w-10 shrink-0 items-center justify-center justify-self-end rounded-full bg-white/16 text-white transition active:scale-[0.96]"
                aria-label="듣기 정지"
              >
                <X size={23} strokeWidth={2.4} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-7">
              <button
                type="button"
                onClick={onSpeechPrevious}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition active:scale-[0.94]"
                aria-label="이전 절 듣기"
              >
                <SkipBack size={29} fill="currentColor" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={onSpeechToggle}
                className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-[#2F2F2F] shadow-[0_7px_22px_rgba(0,0,0,0.24)] transition active:scale-[0.96]"
                aria-label={speechStatus === 'playing' ? '일시정지' : '이어듣기'}
              >
                {speechStatus === 'playing' ? (
                  <Pause size={29} fill="currentColor" strokeWidth={2.8} />
                ) : (
                  <Play size={29} fill="currentColor" strokeWidth={2.8} />
                )}
              </button>
              <button
                type="button"
                onClick={onSpeechNext}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition active:scale-[0.94]"
                aria-label="다음 절 듣기"
              >
                <SkipForward size={29} fill="currentColor" strokeWidth={2.2} />
              </button>
            </div>

            <div className="mt-4 h-1 rounded-full bg-white/18">
              <div
                className="h-full rounded-full bg-[#C8BDAE]"
                style={{ width: `${speechProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!isSpeechActive && (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[120px] items-start justify-center px-[30px]"
        style={{ backgroundColor: colors.background }}
        aria-label="읽기 화면 설정"
      >
        <div className="flex w-full max-w-[330px] items-start justify-between py-[20px]">
          <button
            type="button"
            onClick={() => onThemeModeChange(nextThemeMode)}
            className="flex w-[32px] flex-col items-center gap-1 transition-opacity hover:opacity-70"
            aria-label={`화면 모드 변경: ${themeMode}`}
          >
            <span
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px]"
              style={{ backgroundColor: colors.controlBackground }}
            >
              <ThemeIcon size={16} strokeWidth={2} style={{ color: colors.icon }} />
            </span>
            <span
              className="text-center"
              style={{
                color: colors.text,
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '8px',
                lineHeight: '12px',
              }}
            >
              화면 모드
            </span>
          </button>

          <button
            type="button"
            onClick={onSpeechToggle}
            disabled={isSpeechUnsupported}
            className="flex w-[72px] flex-col items-center gap-1 transition-opacity hover:opacity-70 disabled:opacity-50 disabled:hover:opacity-50"
            aria-label={`성경 듣기: ${speechButtonLabel}`}
          >
            <span
              className="flex h-[32px] min-w-[72px] items-center justify-center gap-1 rounded-[99px] px-2"
              style={{
                backgroundColor: isSpeechActive
                  ? colors.activeControlBackground
                  : colors.controlBackground,
                color: isSpeechActive ? colors.activeIcon : colors.text,
              }}
            >
              <SpeechIcon size={15} strokeWidth={2.2} />
              <span
                className="whitespace-nowrap"
                style={{
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  lineHeight: '18px',
                }}
              >
                {speechButtonLabel}
              </span>
            </span>
            <span
              className="text-center"
              style={{
                color: colors.text,
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '8px',
                lineHeight: '12px',
              }}
            >
              듣기
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsTranslationSheetOpen(true)}
            className="flex w-[64px] flex-col items-center gap-1 transition-opacity hover:opacity-70"
            aria-label={`역본 비교 설정: ${isCompareActive ? 'WEB' : '선택 안 함'}`}
          >
            <span
              className="flex h-[32px] min-w-[64px] items-center justify-center gap-1 rounded-[99px] px-2"
              style={{
                backgroundColor: isCompareActive
                  ? colors.activeControlBackground
                  : colors.controlBackground,
                color: isCompareActive ? colors.activeIcon : colors.text,
              }}
            >
              <Languages size={15} strokeWidth={2.2} />
              <span
                className="whitespace-nowrap"
                style={{
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  lineHeight: '18px',
                }}
              >
                {isCompareActive ? 'WEB' : '대조'}
              </span>
            </span>
            <span
              className="text-center"
              style={{
                color: colors.text,
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '8px',
                lineHeight: '12px',
              }}
            >
              역본
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFontSizeChange(nextFontSize)}
            className="flex w-[74px] flex-col items-center gap-1 transition-opacity hover:opacity-70"
            aria-label={`글씨 크기 변경: ${fontSize}`}
          >
            <span
              className="flex h-[32px] w-[74px] items-center justify-center rounded-[99px]"
              style={{
                backgroundColor: colors.controlBackground,
                color: colors.text,
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '18px',
              }}
            >
              {fontSize === 'small' ? '작은 글' : '큰 글'}
            </span>
            <span
              className="text-center"
              style={{
                color: colors.text,
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '8px',
                lineHeight: '12px',
              }}
            >
              글씨 크기
            </span>
          </button>
        </div>
      </nav>
      )}

      {isTranslationSheetOpen && (
        <TranslationSheet
          colors={colors}
          compareTranslation={compareTranslation}
          isCompareLoading={isCompareLoading}
          compareError={compareError}
          onClose={() => setIsTranslationSheetOpen(false)}
          onSelect={(translation) => {
            onCompareTranslationChange(translation);
            setIsTranslationSheetOpen(false);
          }}
        />
      )}
    </>
  );
}

interface TranslationSheetProps {
  colors: typeof TOOLBAR_THEME_COLORS[ResolvedTheme];
  compareTranslation: CompareTranslation;
  isCompareLoading: boolean;
  compareError: string | null;
  onClose: () => void;
  onSelect: (translation: CompareTranslation) => void;
}

function TranslationSheet({
  colors,
  compareTranslation,
  isCompareLoading,
  compareError,
  onClose,
  onSelect,
}: TranslationSheetProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end px-4 pb-4"
      style={{ backgroundColor: colors.sheetOverlay }}
      onClick={onClose}
    >
      <section
        className="mx-auto w-full max-w-sm rounded-[28px] px-5 pb-5 pt-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
        style={{ backgroundColor: colors.sheetBackground }}
        onClick={(event) => event.stopPropagation()}
        aria-label="역본 비교 선택"
      >
        <div className="mx-auto mb-6 h-1.5 w-14 rounded-full bg-[#E2DED8]" />
        <h2
          className="text-[24px] font-bold leading-snug"
          style={{ color: colors.text }}
        >
          역본 비교
        </h2>
        <p
          className="mt-2 break-keep text-[14px] font-medium leading-relaxed"
          style={{ color: colors.mutedText }}
        >
          기본 본문은 한국어 본문으로 유지돼요
        </p>

        <div className="mt-7">
          <p className="mb-2 text-[13px] font-bold" style={{ color: colors.mutedText }}>
            기본 역본
          </p>
          <div
            className="flex h-[54px] items-center justify-between rounded-[16px] border px-4"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            <span className="text-[15px] font-bold">한국어 본문</span>
            <span className="text-[12px] font-bold" style={{ color: colors.mutedText }}>
              고정
            </span>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[13px] font-bold" style={{ color: colors.mutedText }}>
            대조 역본
          </p>
          <div className="grid gap-2">
            <TranslationOption
              label="선택 안 함"
              description="한국어 본문만 읽어요"
              selected={compareTranslation === 'none'}
              colors={colors}
              onClick={() => onSelect('none')}
            />
            <TranslationOption
              label="WEB"
              description={isCompareLoading ? 'WEB 본문을 불러오는 중이에요' : 'World English Bible'}
              selected={compareTranslation === 'WEBP'}
              colors={colors}
              onClick={() => onSelect('WEBP')}
            />
          </div>
          {compareError && (
            <p className="mt-3 break-keep text-[12px] font-bold leading-relaxed text-[#B86655]">
              WEB 본문을 불러오지 못했어요
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

interface TranslationOptionProps {
  label: string;
  description: string;
  selected: boolean;
  colors: typeof TOOLBAR_THEME_COLORS[ResolvedTheme];
  onClick: () => void;
}

function TranslationOption({
  label,
  description,
  selected,
  colors,
  onClick,
}: TranslationOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[58px] items-center justify-between rounded-[16px] border px-4 text-left transition active:scale-[0.98]"
      style={{
        borderColor: selected ? colors.activeControlBackground : colors.border,
        backgroundColor: selected ? colors.controlBackground : 'transparent',
      }}
    >
      <span>
        <span className="block text-[15px] font-bold" style={{ color: colors.text }}>
          {label}
        </span>
        <span className="mt-0.5 block text-[12px] font-medium" style={{ color: colors.mutedText }}>
          {description}
        </span>
      </span>
      {selected && (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            backgroundColor: colors.activeControlBackground,
            color: colors.activeIcon,
          }}
        >
          <Check size={16} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}
