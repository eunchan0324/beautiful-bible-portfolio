import { getPersonImageStyle } from './person-image';

interface PersonImagePanelProps {
  personCode: string;
  name: string;
}

export default function PersonImagePanel({ personCode, name }: PersonImagePanelProps) {
  return (
    <div
      className="relative flex aspect-[4/3] min-h-[220px] overflow-hidden rounded-[16px] bg-[#DDD2C1] bg-cover bg-center shadow-sm"
      style={getPersonImageStyle(personCode)}
      aria-label={`${name} 이미지`}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(35,29,22,0.68),rgba(35,29,22,0.28),rgba(35,29,22,0))]" />
      <div className="relative z-10 mt-auto w-full px-5 py-5">
        <p className="text-[28px] font-bold text-white drop-shadow-sm">
          {name}
        </p>
      </div>
    </div>
  );
}
