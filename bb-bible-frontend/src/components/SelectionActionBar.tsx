'use client';

import { Bookmark, Copy, Highlighter, Share2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { HighlightColor, ResolvedTheme } from '@/types/bible';
import {
  DARK_HIGHLIGHT_BACKGROUND_COLORS,
  HIGHLIGHT_BACKGROUND_COLORS,
} from '@/lib/highlight';

interface SelectionActionBarProps {
  selectedReference: string;
  effectiveTheme: ResolvedTheme;
  bottomOffset: number;
  isColorPickerOpen: boolean;
  onClearSelection: () => void;
  onToggleColorPicker: () => void;
  onSaveVerse: () => void;
  onShare: () => void;
  onCopy: () => void;
  onHighlightRemove: () => void;
  onHighlightColorSelect: (color: HighlightColor) => void;
  isActionPending?: boolean;
}

const ACTION_BAR_THEME_COLORS: Record<
  ResolvedTheme,
  {
    surface: string;
    reference: string;
    button: string;
    activeButton: string;
    icon: string;
    activeIcon: string;
    label: string;
    close: string;
    paletteBackground: string;
    noColorText: string;
    noColorBorder: string;
  }
> = {
  light: {
    surface: '#EDE9E2',
    reference: '#414141',
    button: '#DFD4C4',
    activeButton: '#7A604A',
    icon: '#5D5D5D',
    activeIcon: '#FFFFFF',
    label: '#414141',
    close: '#5D5D5D',
    paletteBackground: '#FFFFFF',
    noColorText: '#9A9A9A',
    noColorBorder: '#CFCFCF',
  },
  dark: {
    surface: '#2F2F2F',
    reference: '#EAEAEA',
    button: '#4B4B4B',
    activeButton: '#EAEAEA',
    icon: '#EAEAEA',
    activeIcon: '#2F2F2F',
    label: '#EAEAEA',
    close: '#EAEAEA',
    paletteBackground: '#242424',
    noColorText: '#A9A9A9',
    noColorBorder: '#5A5A5A',
  },
};

const HIGHLIGHT_COLOR_ORDER: HighlightColor[] = ['yellow', 'blue', 'green', 'pink'];

export default function SelectionActionBar({
  selectedReference,
  effectiveTheme,
  bottomOffset,
  isColorPickerOpen,
  onClearSelection,
  onToggleColorPicker,
  onSaveVerse,
  onShare,
  onCopy,
  onHighlightRemove,
  onHighlightColorSelect,
  isActionPending = false,
}: SelectionActionBarProps) {
  const colors = ACTION_BAR_THEME_COLORS[effectiveTheme];
  const highlightColors =
    effectiveTheme === 'dark' ? DARK_HIGHLIGHT_BACKGROUND_COLORS : HIGHLIGHT_BACKGROUND_COLORS;
  const colorButtonBackground = isColorPickerOpen ? colors.activeButton : colors.button;
  const colorButtonIcon = isColorPickerOpen ? colors.activeIcon : colors.icon;

  return (
    <div
      className="fixed left-0 right-0 z-50 safe-area-bottom transition-[bottom] duration-300 ease-in-out"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <div
        className="mx-auto h-[170px] w-full max-w-[430px] rounded-t-[18px] px-[30px] pt-[20px] shadow-[0_-10px_28px_rgba(65,65,65,0.10)]"
        style={{
          backgroundColor: colors.surface,
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div className="flex h-[130px] flex-col">
          <div className="flex h-[18px] items-center justify-between gap-4">
            <p
              className="truncate"
              style={{
                color: colors.reference,
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
              }}
            >
              {selectedReference}
            </p>
            <button
              type="button"
              onClick={onClearSelection}
              className="flex h-[24px] w-[24px] shrink-0 items-center justify-center transition-opacity hover:opacity-75"
              style={{ color: colors.close }}
              aria-label="선택 해제"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="mt-[20px] grid h-[52px] grid-cols-4 gap-[22px]">
            <ActionButton
              label="색상"
              icon={<Highlighter size={16} strokeWidth={1.8} />}
              disabled={isActionPending}
              backgroundColor={colorButtonBackground}
              iconColor={colorButtonIcon}
              labelColor={colors.label}
              onClick={onToggleColorPicker}
            />
            <ActionButton
              label="저장"
              icon={<Bookmark size={16} strokeWidth={1.8} />}
              disabled={isActionPending}
              backgroundColor={colors.button}
              iconColor={colors.icon}
              labelColor={colors.label}
              onClick={onSaveVerse}
            />
            <ActionButton
              label="공유"
              icon={<Share2 size={16} strokeWidth={1.8} />}
              backgroundColor={colors.button}
              iconColor={colors.icon}
              labelColor={colors.label}
              onClick={onShare}
            />
            <ActionButton
              label="복사"
              icon={<Copy size={16} strokeWidth={1.8} />}
              backgroundColor={colors.button}
              iconColor={colors.icon}
              labelColor={colors.label}
              onClick={onCopy}
            />
          </div>

          {isColorPickerOpen && (
            <div
              className="mt-[12px] flex h-[40px] w-[216px] items-center gap-[16px] rounded-[20px] px-[16px] py-[8px]"
              style={{ backgroundColor: colors.paletteBackground }}
            >
              <button
                type="button"
                onClick={onHighlightRemove}
                disabled={isActionPending}
                className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border bg-white transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-45 disabled:hover:scale-100"
                style={{
                  borderColor: colors.noColorBorder,
                  color: colors.noColorText,
                }}
                aria-label="하이라이트 제거"
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '18px',
                    textDecorationLine: 'line-through',
                  }}
                >
                  가
                </span>
              </button>
              {HIGHLIGHT_COLOR_ORDER.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onHighlightColorSelect(color)}
                  disabled={isActionPending}
                  className="h-[24px] w-[24px] shrink-0 rounded-full transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-45 disabled:hover:scale-100"
                  style={{ backgroundColor: highlightColors[color] }}
                  aria-label={`${color} highlight`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  backgroundColor: string;
  iconColor: string;
  labelColor: string;
  onClick: () => void;
  disabled?: boolean;
}

function ActionButton({
  label,
  icon,
  backgroundColor,
  iconColor,
  labelColor,
  onClick,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-w-0 flex-col items-center gap-[7px] transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-45"
    >
      <span
        className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px]"
        style={{ backgroundColor, color: iconColor }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span
        style={{
          color: labelColor,
          fontSize: '8px',
          fontWeight: 400,
          lineHeight: '12px',
        }}
      >
        {label}
      </span>
    </button>
  );
}
