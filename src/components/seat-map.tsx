import { Check } from "lucide-react";

export type SeatBlock = {
  id: string;
  name: string;
  note: string;
  premium?: boolean;
};

export const seatBlocksByStand: Record<string, SeatBlock[]> = {
  turn1: [
    { id: "T1-A", name: "Block A", note: "Braking zone, low tier" },
    { id: "T1-B", name: "Block B", note: "Apex view, mid tier" },
    { id: "T1-C", name: "Block C", note: "Exit view, upper tier", premium: true },
  ],
  main: [
    { id: "MS-L", name: "Block L", note: "Grid slots 1–10" },
    { id: "MS-C", name: "Block C", note: "Podium & pit wall", premium: true },
    { id: "MS-R", name: "Block R", note: "Turn 1 approach" },
  ],
  paddock: [
    { id: "PC-1", name: "Suite 1", note: "Above garages 1–5", premium: true },
    { id: "PC-2", name: "Suite 2", note: "Above garages 6–10", premium: true },
  ],
};

const ROWS = ["A", "B", "C", "D", "E", "F"];
const SEATS_PER_ROW = 14;

/** Deterministic pseudo-occupancy so server and client render identically. */
function isTaken(seatId: string) {
  let hash = 7;
  for (let i = 0; i < seatId.length; i++) hash = (hash * 31 + seatId.charCodeAt(i)) % 1000;
  return hash % 7 < 2;
}

export function seatLabel(seatId: string) {
  const [block, row, num] = seatId.split(":");
  return `${block} ${row}${num}`;
}

type Props = {
  blockId: string;
  selected: string[];
  onToggle: (seatId: string) => void;
  maxSeats: number;
};

export function SeatMap({ blockId, selected, onToggle, maxSeats }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <p className="font-display text-center text-xs tracking-[0.4em] text-muted-foreground uppercase">
          Track side
        </p>
        <div className="mt-4 space-y-2 overflow-x-auto">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="font-display w-5 shrink-0 text-xs text-muted-foreground">{row}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const num = i + 1;
                  const seatId = `${blockId}:${row}:${num}`;
                  const taken = isTaken(seatId);
                  const active = selected.includes(seatId);
                  const full = !active && selected.length >= maxSeats;
                  return (
                    <button
                      key={seatId}
                      type="button"
                      disabled={taken || full}
                      onClick={() => onToggle(seatId)}
                      aria-label={`Seat ${row}${num}${taken ? " unavailable" : ""}`}
                      aria-pressed={active}
                      className={`flex size-6 items-center justify-center rounded-t-md border text-[10px] transition-colors ${
                        taken
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50"
                          : active
                            ? "border-primary bg-primary text-primary-foreground"
                            : full
                              ? "cursor-not-allowed border-border bg-card text-muted-foreground/60"
                              : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {active ? <Check className="size-3" /> : num}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-t-sm border border-border bg-card" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-t-sm border border-primary bg-primary" /> Your seats
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-t-sm border border-border bg-muted" /> Taken
        </span>
      </div>
    </div>
  );
}
