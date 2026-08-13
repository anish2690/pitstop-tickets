import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, Flag, MapPin, Minus, Plus, Ticket, Timer } from "lucide-react";

import heroImage from "@/assets/f1-hero.jpg";
import { SeatMap, seatBlocksByStand, seatLabel } from "@/components/seat-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Grand Prix Tickets — 2027 Season Booking" },
      {
        name: "description",
        content:
          "Book 2027 Formula 1 season tickets in four steps: pick your Grand Prix, choose a grandstand, add paddock extras and checkout.",
      },
      { property: "og:title", content: "Apex Grand Prix Tickets — 2027 Season Booking" },
      {
        property: "og:description",
        content: "Pick your race weekend, grandstand and paddock extras, then confirm your seats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingFunnel,
});

type Race = {
  id: string;
  gp: string;
  circuit: string;
  city: string;
  dates: string;
  from: number;
  tag?: string;
};

const races: Race[] = [
  {
    id: "melbourne",
    gp: "Australian Grand Prix",
    circuit: "Albert Park",
    city: "Melbourne",
    dates: "Mar 12 – 14",
    from: 240,
    tag: "Season opener",
  },
  {
    id: "imola",
    gp: "Emilia-Romagna Grand Prix",
    circuit: "Autodromo Imola",
    city: "Imola",
    dates: "Apr 23 – 25",
    from: 195,
  },
  {
    id: "monaco",
    gp: "Monaco Grand Prix",
    circuit: "Circuit de Monaco",
    city: "Monte Carlo",
    dates: "May 21 – 23",
    from: 620,
    tag: "Selling fast",
  },
  {
    id: "silverstone",
    gp: "British Grand Prix",
    circuit: "Silverstone",
    city: "Northampton",
    dates: "Jul 2 – 4",
    from: 310,
  },
  {
    id: "suzuka",
    gp: "Japanese Grand Prix",
    circuit: "Suzuka",
    city: "Suzuka",
    dates: "Sep 24 – 26",
    from: 265,
  },
  {
    id: "vegas",
    gp: "Las Vegas Grand Prix",
    circuit: "Strip Circuit",
    city: "Las Vegas",
    dates: "Nov 19 – 21",
    from: 540,
    tag: "Night race",
  },
];

type Stand = {
  id: string;
  name: string;
  view: string;
  price: number;
  perks: string[];
};

const stands: Stand[] = [
  {
    id: "general",
    name: "General Admission",
    view: "Roaming trackside lawns",
    price: 0,
    perks: ["3-day walkabout access", "Big-screen zones", "Fan village entry"],
  },
  {
    id: "turn1",
    name: "Turn 1 Grandstand",
    view: "Lap-one braking zone",
    price: 180,
    perks: ["Covered seating", "Overtaking hotspot", "Reserved seat"],
  },
  {
    id: "main",
    name: "Main Straight",
    view: "Start / finish & podium",
    price: 340,
    perks: ["Podium view", "Pit-stop sightlines", "Grid walk ballot"],
  },
  {
    id: "paddock",
    name: "Paddock Club",
    view: "Above the garages",
    price: 1450,
    perks: ["Open bar & dining", "Pit-lane walk", "Driver appearances"],
  },
];

type Extra = { id: string; name: string; note: string; price: number };

const extras: Extra[] = [
  { id: "pitlane", name: "Pit Lane Walk", note: "Thursday, 90 minutes", price: 95 },
  { id: "headset", name: "Live Team Radio Headset", note: "3-day rental", price: 45 },
  { id: "parking", name: "Circuit Parking Pass", note: "Zone A, all weekend", price: 60 },
  { id: "merch", name: "Team Merch Bundle", note: "Cap, lanyard, programme", price: 80 },
];

const steps = ["Race", "Grandstand", "Seats", "Extras", "Checkout"];

function BookingFunnel() {
  const [step, setStep] = useState(0);
  const [raceId, setRaceId] = useState<string | null>(null);
  const [standId, setStandId] = useState<string | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [qty, setQty] = useState(2);
  const [chosenExtras, setChosenExtras] = useState<string[]>([]);
  const [insurance, setInsurance] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const race = races.find((r) => r.id === raceId) ?? null;
  const stand = stands.find((s) => s.id === standId) ?? null;
  const blocks = standId ? (seatBlocksByStand[standId] ?? []) : [];
  const assignedSeating = blocks.length > 0;

  const total = useMemo(() => {
    if (!race || !stand) return 0;
    const seatFee = blocks.find((b) => b.id === blockId)?.premium ? 60 : 0;
    const seatsCost = (race.from + stand.price + seatFee) * qty;
    const addOns = extras
      .filter((e) => chosenExtras.includes(e.id))
      .reduce((sum, e) => sum + e.price * qty, 0);
    const cover = insurance ? 29 * qty : 0;
    return seatsCost + addOns + cover;
  }, [race, stand, blocks, blockId, qty, chosenExtras, insurance]);

  const canContinue =
    step === 0
      ? !!race
      : step === 1
        ? !!stand
        : step === 2
          ? !assignedSeating || (!!blockId && seats.length === qty)
          : true;

  const selectStand = (id: string) => {
    setStandId(id);
    setBlockId(null);
    setSeats([]);
  };

  const selectBlock = (id: string) => {
    setBlockId(id);
    setSeats([]);
  };

  const changeQty = (next: number) => {
    setQty(next);
    setSeats((prev) => prev.slice(0, next));
  };

  const toggleSeat = (seatId: string) =>
    setSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : prev.length >= qty
          ? prev
          : [...prev, seatId],
    );

  const toggleExtra = (id: string) =>
    setChosenExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Formula 1 car racing under floodlights on a night circuit"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--gradient-night)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 md:pt-28">
          <Badge className="bg-speed border-0 font-display tracking-widest text-primary-foreground uppercase">
            2027 Season
          </Badge>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[0.92] uppercase md:text-7xl">
            Book your seat on the <span className="text-speed">grid</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Twenty-four race weekends. Five steps to lock in your grandstand, your exact seats and
            your paddock access.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 font-display text-sm tracking-wide uppercase">
            <span className="flex items-center gap-2">
              <Flag className="size-4 text-primary" /> 24 Grands Prix
            </span>
            <span className="flex items-center gap-2">
              <Ticket className="size-4 text-primary" /> Instant e-tickets
            </span>
            <span className="flex items-center gap-2">
              <Timer className="size-4 text-primary" /> Free date changes
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-3 border-y border-border py-5">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex size-8 items-center justify-center rounded-full font-display text-sm ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-speed text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={`font-display text-sm tracking-widest uppercase ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < steps.length - 1 && <span className="h-px w-6 bg-border sm:w-10" />}
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {races.map((r) => {
                  const active = r.id === raceId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRaceId(r.id)}
                      className={`rounded-lg border bg-card p-5 text-left transition-all hover:-translate-y-0.5 ${
                        active ? "border-primary shadow-glow" : "border-border shadow-panel"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl uppercase">{r.gp}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" /> {r.circuit}, {r.city}
                          </p>
                        </div>
                        {r.tag && (
                          <Badge variant="secondary" className="shrink-0 text-xs uppercase">
                            {r.tag}
                          </Badge>
                        )}
                      </div>
                      <Separator className="my-4" />
                      <div className="flex items-baseline justify-between">
                        <span className="font-display text-sm tracking-widest text-muted-foreground uppercase">
                          {r.dates}
                        </span>
                        <span className="font-display text-lg">
                          from <span className="text-primary">${r.from}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                {stands.map((s) => {
                  const active = s.id === standId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectStand(s.id)}
                      className={`w-full rounded-lg border bg-card p-5 text-left transition-all ${
                        active ? "border-primary shadow-glow" : "border-border"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl uppercase">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{s.view}</p>
                        </div>
                        <span className="font-display text-lg text-primary">
                          {s.price === 0 ? "included" : `+$${s.price}`}
                        </span>
                      </div>
                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        {s.perks.map((p) => (
                          <li key={p} className="flex items-center gap-1.5">
                            <Check className="size-3.5 text-accent" /> {p}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
                  <div>
                    <h3 className="text-lg uppercase">Tickets</h3>
                    <p className="text-sm text-muted-foreground">Max 6 per booking</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => changeQty(Math.max(1, qty - 1))}
                      aria-label="Remove ticket"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="font-display w-8 text-center text-2xl">{qty}</span>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => changeQty(Math.min(6, qty + 1))}
                      aria-label="Add ticket"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {!assignedSeating ? (
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg uppercase">Unreserved seating</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {stand?.name} is walkabout access — no seat numbers are assigned. Upgrade to a
                      grandstand if you'd like to pick exact seats.
                    </p>
                    <Button variant="secondary" className="mt-4" onClick={() => setStep(1)}>
                      Change grandstand
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-border bg-card p-5">
                      <h3 className="text-lg uppercase">Choose your section</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {blocks.map((b) => {
                          const active = b.id === blockId;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => selectBlock(b.id)}
                              className={`rounded-lg border p-4 text-left transition-colors ${
                                active ? "border-primary bg-primary/10" : "border-border bg-card"
                              }`}
                            >
                              <span className="font-display block text-base uppercase">
                                {b.name}
                              </span>
                              <span className="text-sm text-muted-foreground">{b.note}</span>
                              <span className="font-display mt-2 block text-sm text-primary">
                                {b.premium ? "+$60 / seat" : "no extra fee"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {blockId && (
                      <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-lg uppercase">Pick {qty} seats</h3>
                          <span className="font-display text-sm tracking-widest text-muted-foreground uppercase">
                            {seats.length} / {qty} selected
                          </span>
                        </div>
                        <div className="mt-4">
                          <SeatMap
                            blockId={blockId}
                            selected={seats}
                            onToggle={toggleSeat}
                            maxSeats={qty}
                          />
                        </div>
                        {seats.length > 0 && (
                          <p className="mt-4 text-sm text-muted-foreground">
                            Your seats: {seats.map(seatLabel).join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {extras.map((e) => {
                  const active = chosenExtras.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => toggleExtra(e.id)}
                      className={`flex w-full items-center justify-between gap-4 rounded-lg border bg-card p-5 text-left transition-colors ${
                        active ? "border-primary" : "border-border"
                      }`}
                    >
                      <span>
                        <span className="font-display block text-base uppercase">{e.name}</span>
                        <span className="text-sm text-muted-foreground">{e.note}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-display text-primary">+${e.price}</span>
                        <span
                          className={`flex size-6 items-center justify-center rounded-full border ${
                            active ? "bg-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {active ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                        </span>
                      </span>
                    </button>
                  );
                })}

                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-5">
                  <div>
                    <p className="font-display text-base uppercase">Weekend cover</p>
                    <p className="text-sm text-muted-foreground">
                      Full refund up to 48h before lights out — $29 per ticket
                    </p>
                  </div>
                  <Switch
                    checked={insurance}
                    onCheckedChange={setInsurance}
                    aria-label="Weekend cover"
                  />
                </div>
              </div>
            )}

            {step === 4 && !confirmed && (
              <form
                className="space-y-5 rounded-lg border border-border bg-card p-6"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  setConfirmed(true);
                }}
              >
                <h3 className="text-xl uppercase">Ticket holder</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first">First name</Label>
                    <Input id="first" required placeholder="Ayrton" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last">Last name</Label>
                    <Input id="last" required placeholder="Senna" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email for e-tickets</Label>
                    <Input id="email" type="email" required placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="card">Card number</Label>
                    <Input id="card" required inputMode="numeric" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp">Expiry</Label>
                    <Input id="exp" required placeholder="09/29" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" required placeholder="123" />
                  </div>
                </div>
                <Button type="submit" size="lg" className="bg-speed w-full border-0 shadow-glow">
                  Pay ${total.toLocaleString()} & confirm seats
                </Button>
              </form>
            )}

            {step === 4 && confirmed && (
              <div className="rounded-lg border border-primary bg-card p-8 text-center shadow-glow">
                <span className="bg-speed mx-auto flex size-14 items-center justify-center rounded-full">
                  <Check className="size-7 text-primary-foreground" />
                </span>
                <h3 className="mt-6 text-3xl uppercase">You're on the grid</h3>
                <p className="mt-3 text-muted-foreground">
                  {qty} × {stand?.name} for the {race?.gp}. E-tickets are on their way to your inbox.
                </p>
                {seats.length > 0 && (
                  <p className="font-display mt-3 text-sm tracking-widest uppercase">
                    Seats {seats.map(seatLabel).join(" · ")}
                  </p>
                )}
                <p className="font-display mt-6 text-sm tracking-widest text-muted-foreground uppercase">
                  Booking ref APX-{race?.id.slice(0, 3).toUpperCase()}-2027
                </p>
              </div>
            )}

            {!confirmed && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft className="size-4" /> Back
                </Button>
                {step < 4 && (
                  <Button
                    size="lg"
                    className="bg-speed border-0 shadow-glow"
                    disabled={!canContinue}
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                  >
                    Continue
                  </Button>
                )}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-panel lg:sticky lg:top-8">
            <h2 className="font-display text-sm tracking-widest text-muted-foreground uppercase">
              Your order
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Grand Prix" value={race ? race.gp : "Not selected"} />
              <Row label="Dates" value={race ? race.dates : "—"} />
              <Row label="Grandstand" value={stand ? stand.name : "Not selected"} />
              <Row
                label="Section"
                value={
                  !stand
                    ? "—"
                    : !assignedSeating
                      ? "Unreserved"
                      : (blocks.find((b) => b.id === blockId)?.name ?? "Not selected")
                }
              />
              <Row
                label="Seats"
                value={
                  !assignedSeating
                    ? "General admission"
                    : seats.length
                      ? seats.map(seatLabel).join(", ")
                      : "Not selected"
                }
              />
              <Row label="Tickets" value={`${qty}`} />
              <Row
                label="Extras"
                value={chosenExtras.length ? `${chosenExtras.length} added` : "None"}
              />
              <Row label="Weekend cover" value={insurance ? "Included" : "Declined"} />
            </div>
            <Separator className="my-5" />
            <div className="flex items-baseline justify-between">
              <span className="font-display tracking-widest uppercase">Total</span>
              <span className="font-display text-3xl text-primary">
                ${total.toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Taxes and circuit fees included. Seats held for 10 minutes.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

