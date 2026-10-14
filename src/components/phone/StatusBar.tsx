import { BatteryFull, Signal, Wifi } from "lucide-react";

type Props = { time: string | null; className?: string };

export default function StatusBar({ time, className = "" }: Props) {
  return (
    <div
      className={`flex items-center justify-between px-7 pt-4 text-[13px] font-semibold tabular-nums ${className}`}
    >
      <span className="min-w-[2.5rem]">{time ?? " "}</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <Signal size={14} strokeWidth={2.5} />
        <Wifi size={14} strokeWidth={2.5} />
        <BatteryFull size={18} strokeWidth={2} />
      </span>
    </div>
  );
}
