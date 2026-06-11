interface SlowRequestNoticeProps {
  className?: string;
}

export default function SlowRequestNotice({ className = '' }: SlowRequestNoticeProps) {
  return (
    <div
      className={`rounded-[16px] border border-[#E2D9C9] bg-[#FFFBF3] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#B69A60]" />
        <div className="min-w-0 flex-1">
          <p className="break-keep text-[14px] font-bold leading-relaxed text-[#414141]">
            처음에는 잠시 준비 시간이 필요해요
          </p>
          <p className="mt-1 break-keep text-[13px] font-medium leading-relaxed text-[#6E6A63]">
            조금만 기다리면 결과가 표시돼요
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#E5DCCB]">
            <div className="backend-warmup-progress h-full w-1/3 rounded-full bg-[#B69A60]" />
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes backend-warmup-progress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        .backend-warmup-progress {
          animation: backend-warmup-progress 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
