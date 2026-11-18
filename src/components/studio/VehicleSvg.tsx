import type { VehicleType } from "@/lib/studio/catalog";
import { VEHICLES } from "@/lib/studio/catalog";

const SEAT = "var(--seat)";
const TRIM = "var(--trim)";

function Seat({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={SEAT} stroke="var(--trim-line)" />
      <rect x={x + 5} y={y + 6} width={w - 10} height={h * 0.55} rx={7} fill="none" stroke="var(--trim-line)" strokeDasharray="2 2" />
      <rect x={x + 3} y={y + h - 14} width={w - 6} height={11} rx={5} fill={TRIM} />
      <rect x={x + w * 0.25} y={y + h - 2} width={w * 0.5} height={8} rx={3} fill={SEAT} stroke="var(--trim-line)" />
    </g>
  );
}
function Bench({ x, y, w, h, seats }: { x: number; y: number; w: number; h: number; seats: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={SEAT} stroke="var(--trim-line)" />
      {Array.from({ length: seats - 1 }, (_, i) => <line key={i} x1={x + (w / seats) * (i + 1)} y1={y + 6} x2={x + (w / seats) * (i + 1)} y2={y + h - 18} stroke="var(--trim-line)" />)}
      <rect x={x + 4} y={y + h - 16} width={w - 8} height={12} rx={5} fill={TRIM} />
    </g>
  );
}

export function VehicleSvg({ type }: { type: VehicleType }) {
  const v = VEHICLES[type];
  const { w, l } = v;
  const body = `M ${w * 0.18} 6 Q ${w / 2} -4 ${w * 0.82} 6 Q ${w - 4} 14 ${w - 2} 60 L ${w} ${l - 40} Q ${w} ${l - 2} ${w * 0.78} ${l} L ${w * 0.22} ${l} Q 0 ${l - 2} 0 ${l - 40} L 2 60 Q 4 14 ${w * 0.18} 6 Z`;
  const cx = w / 2;
  return (
    <g>
      <path d={body} fill="var(--body)" stroke="var(--body-line)" strokeWidth={1.5} />
      {/* mirrors */}
      <rect x={-12} y={112} width={14} height={9} rx={3} fill="var(--body)" stroke="var(--body-line)" />
      <rect x={w - 2} y={112} width={14} height={9} rx={3} fill="var(--body)" stroke="var(--body-line)" />
      {/* interior floor */}
      <rect x={v.bounds.x} y={v.bounds.y - 22} width={v.bounds.w} height={v.bounds.h + 22} rx={14} fill="var(--floor)" />
      {/* dashboard */}
      <path d={`M ${v.bounds.x} ${v.bounds.y - 10} Q ${cx} ${v.bounds.y - 30} ${v.bounds.x + v.bounds.w} ${v.bounds.y - 10} L ${v.bounds.x + v.bounds.w} ${v.bounds.y + 6} L ${v.bounds.x} ${v.bounds.y + 6} Z`} fill={TRIM} />
      <circle cx={v.bounds.x + 38} cy={v.bounds.y + 12} r={13} fill="none" stroke="var(--trim-line)" strokeWidth={3} />
      <rect x={cx - 16} y={v.bounds.y - 4} width={32} height={8} rx={2} fill="var(--screen)" />
      {/* doors */}
      {[0, 1].map((side) => (
        <g key={side}>
          {[v.bounds.y + 30, v.bounds.y + 140, ...(type === "suv" ? [v.bounds.y + 250] : [])].map((dy, i) => (
            <rect key={i} x={side ? v.bounds.x + v.bounds.w - 6 : v.bounds.x} y={dy} width={6} height={90} rx={3} fill={TRIM} />
          ))}
        </g>
      ))}
      {type === "sedan" && (<>
        <Seat x={26} y={150} w={54} h={78} /><Seat x={100} y={150} w={54} h={78} />
        <rect x={82} y={120} width={16} height={110} rx={6} fill={TRIM} />
        <Bench x={24} y={262} w={132} h={64} seats={3} />
        <rect x={20} y={340} width={140} height={68} rx={10} fill="none" stroke="var(--trim-line)" strokeDasharray="4 3" />
        <text x={cx} y={378} textAnchor="middle" className="fill-muted-foreground" fontSize={8} letterSpacing={2}>TRUNK</text>
      </>)}
      {type === "suv" && (<>
        <Seat x={28} y={150} w={58} h={80} /><Seat x={110} y={150} w={58} h={80} />
        <rect x={88} y={120} width={20} height={112} rx={6} fill={TRIM} />
        <Bench x={26} y={258} w={144} h={64} seats={3} />
        <Bench x={36} y={340} w={124} h={52} seats={2} />
        <rect x={22} y={400} width={152} height={50} rx={10} fill="none" stroke="var(--trim-line)" strokeDasharray="4 3" />
        <text x={cx} y={428} textAnchor="middle" className="fill-muted-foreground" fontSize={8} letterSpacing={2}>CARGO</text>
      </>)}
      {type === "truck" && (<>
        <Seat x={28} y={150} w={60} h={80} /><Seat x={112} y={150} w={60} h={80} />
        <rect x={90} y={120} width={20} height={112} rx={6} fill={TRIM} />
        <Bench x={26} y={256} w={148} h={62} seats={3} />
        <rect x={10} y={326} width={w - 20} height={6} fill="var(--body-line)" />
        <rect x={20} y={342} width={w - 40} height={190} rx={6} fill="var(--bed)" stroke="var(--trim-line)" />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={36 + i * 26} y1={348} x2={36 + i * 26} y2={526} stroke="var(--trim-line)" />)}
        <text x={cx} y={440} textAnchor="middle" className="fill-muted-foreground" fontSize={8} letterSpacing={2}>BED</text>
      </>)}
    </g>
  );
}
