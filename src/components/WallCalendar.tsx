"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_IMAGE_BY_MONTH_INDEX = [
  "/calendar-images/comp8.png", // Jan
  "/calendar-images/comp1.jpg", // Feb
  "/calendar-images/comp2.jpg", // Mar
  "/calendar-images/comp3.jpg", // Apr
  "/calendar-images/comp4.jpg", // May
  "/calendar-images/comp5.jpg", // Jun
  "/calendar-images/comp6.png", // Jul
  "/calendar-images/comp7.webp", // Aug
  "/calendar-images/comp9.jpg", // Sep
  "/calendar-images/comp10.jpg", // Oct
  "/calendar-images/comp11.jpg", // Nov
  "/calendar-images/comp12.webp", // Dec
];
const HOLIDAYS_CSV = `Date,Holiday Name,Type
2026-01-01,New Year's Day,National
2026-01-14,Makar Sankranti / Pongal,Hindu
2026-01-26,Republic Day,National
2026-02-02,Basant Panchami,Hindu
2026-02-19,Chhatrapati Shivaji Maharaj Jayanti,Observance
2026-02-26,Maha Shivaratri,Hindu
2026-03-20,Holi,Hindu
2026-03-30,Ram Navami,Hindu
2026-04-02,Mahavir Jayanti,Jain
2026-04-03,Good Friday,Christian
2026-04-05,Easter Sunday,Christian
2026-04-06,Eid ul-Fitr (Ramzan Eid),Muslim
2026-04-14,Dr. Ambedkar Jayanti,Observance
2026-04-14,Baisakhi / Vishu / Tamil New Year,Hindu
2026-05-05,Buddha Purnima,Buddhist
2026-06-13,Eid ul-Adha (Bakrid),Muslim
2026-07-03,Muharram,Muslim
2026-08-15,Independence Day,National
2026-08-16,Janmashtami,Hindu
2026-09-03,Ganesh Chaturthi,Hindu
2026-09-12,Milad-un-Nabi (Eid-e-Milad),Muslim
2026-10-02,Gandhi Jayanti,National
2026-10-14,Dussehra (Vijayadashami),Hindu
2026-10-20,Diwali (Deepavali),Hindu
2026-10-22,Bhai Dooj,Hindu
2026-10-27,Guru Nanak Jayanti,Sikh
2026-11-04,Chhath Puja,Hindu
2026-12-25,Christmas,Christian
2026-12-30,Guru Gobind Singh Jayanti,Sikh`;

type CalendarCell = {
  day: number;
  inMonth: boolean;
  date: Date;
};

function toMondayIndex(dayIndex: number) {
  return dayIndex === 0 ? 6 : dayIndex - 1;
}

function monthGrid(date: Date): CalendarCell[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startPad = toMondayIndex(firstDay.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({ day, inMonth: false, date: new Date(year, month - 1, day) });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true, date: new Date(year, month, day) });
  }

  while (cells.length < 42) {
    const day = cells.length - (startPad + daysInMonth) + 1;
    cells.push({ day, inMonth: false, date: new Date(year, month + 1, day) });
  }

  return cells;
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function atDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function rangeKey(start: Date, end: Date) {
  return `${atDayStart(start).toISOString()}__${atDayStart(end).toISOString()}`;
}

function isWithinRange(target: Date, start: Date, end: Date) {
  const t = atDayStart(target).getTime();
  const s = atDayStart(start).getTime();
  const e = atDayStart(end).getTime();
  return t >= s && t <= e;
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseHolidayCsv(csv: string) {
  const lines = csv.trim().split("\n").slice(1);
  const holidayMap = new Map<string, string>();
  for (const line of lines) {
    const [date, holidayName] = line.split(",");
    if (!date || !holidayName) continue;
    const existing = holidayMap.get(date);
    holidayMap.set(date, existing ? `${existing}, ${holidayName}` : holidayName);
  }
  return holidayMap;
}

export default function WallCalendar() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(new Date());
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [monthNotes, setMonthNotes] = useState<Record<string, string>>({});
  const [rangeNotes, setRangeNotes] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedMonthNotes = localStorage.getItem("calendar_month_notes");
      const storedRangeNotes = localStorage.getItem("calendar_range_notes");
      const storedRangeStart = localStorage.getItem("calendar_range_start");
      const storedRangeEnd = localStorage.getItem("calendar_range_end");

      if (storedMonthNotes) setMonthNotes(JSON.parse(storedMonthNotes));
      if (storedRangeNotes) setRangeNotes(JSON.parse(storedRangeNotes));
      if (storedRangeStart) setRangeStart(new Date(storedRangeStart));
      else if (storedRangeStart === "") setRangeStart(null); // Just in case
      if (storedRangeEnd) setRangeEnd(new Date(storedRangeEnd));
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("calendar_month_notes", JSON.stringify(monthNotes));
    }
  }, [monthNotes, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("calendar_range_notes", JSON.stringify(rangeNotes));
    }
  }, [rangeNotes, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (rangeStart) localStorage.setItem("calendar_range_start", rangeStart.toISOString());
      else localStorage.removeItem("calendar_range_start");
    }
  }, [rangeStart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (rangeEnd) localStorage.setItem("calendar_range_end", rangeEnd.toISOString());
      else localStorage.removeItem("calendar_range_end");
    }
  }, [rangeEnd, isLoaded]);

  type FlipPhase = "idle" | "out-next" | "out-prev";
  const [flipPhase, setFlipPhase] = useState<FlipPhase>("idle");
  const [pendingMonthTarget, setPendingMonthTarget] = useState<Date | null>(
    null
  );

  const viewMonthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthNote = monthNotes[viewMonthKey] || "";

  const flipBusy = flipPhase !== "idle";

  const monthName = viewDate.toLocaleString("en-US", { month: "long" });
  const year = viewDate.getFullYear();
  const cells = useMemo(() => monthGrid(viewDate), [viewDate]);
  const monthHeroImage = MONTH_IMAGE_BY_MONTH_INDEX[viewDate.getMonth()];
  const previewDate = useMemo(() => {
    if (pendingMonthTarget) return pendingMonthTarget;
    if (flipPhase === "out-next") {
      return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    }
    if (flipPhase === "out-prev") {
      return new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    }
    return viewDate;
  }, [viewDate, flipPhase, pendingMonthTarget]);
  const previewMonthName = previewDate.toLocaleString("en-US", { month: "long" });
  const previewYear = previewDate.getFullYear();
  const previewCells = useMemo(() => monthGrid(previewDate), [previewDate]);
  const previewMonthHeroImage =
    MONTH_IMAGE_BY_MONTH_INDEX[previewDate.getMonth()];
  const holidayMap = useMemo(() => parseHolidayCsv(HOLIDAYS_CSV), []);

  const flutterAnimations = [
    { anim: "pageFlutter1", dur: "0.96s", delay: "0s" },
    { anim: "pageFlutter2", dur: "1.14s", delay: "0.2s" },
    { anim: "pageFlutter1", dur: "0.9s", delay: "0.4s" },
    { anim: "pageFlutter3", dur: "1.2s", delay: "0.1s" },
    { anim: "pageFlutter2", dur: "1.02s", delay: "0.3s" },
    { anim: "pageFlutter1", dur: "1.14s", delay: "0.5s" },
    { anim: "pageFlutter3", dur: "0.96s", delay: "0.15s" },
    { anim: "pageFlutter2", dur: "1.08s", delay: "0.35s" },
    { anim: "pageFlutter1", dur: "1.02s", delay: "0.25s" },
    { anim: "pageFlutter3", dur: "1.2s", delay: "0.45s" },
    { anim: "pageFlutter2", dur: "0.9s", delay: "0.1s" },
    { anim: "pageFlutter1", dur: "1.26s", delay: "0.4s" },
  ];

  const selectedRangeKey =
    rangeStart && rangeEnd ? rangeKey(rangeStart, rangeEnd) : null;

  const selectedRangeNote = selectedRangeKey
    ? rangeNotes[selectedRangeKey] ?? ""
    : "";

  const rangeLabel =
    rangeStart && rangeEnd
      ? `${rangeStart.toDateString()} - ${rangeEnd.toDateString()}`
      : rangeStart
        ? `${rangeStart.toDateString()} - Select end date`
        : "Pick a start date";

  const activeTasks = useMemo(() => {
    return Object.entries(rangeNotes).filter(([_, note]) => note.trim() !== "");
  }, [rangeNotes]);

  const monthStart = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), 1);

  const goNextMonth = () => {
    if (flipBusy) return;
    setPendingMonthTarget(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    );
    setFlipPhase("out-next");
  };

  const goPrevMonth = () => {
    if (flipBusy) return;
    setPendingMonthTarget(
      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    );
    setFlipPhase("out-prev");
  };

  const goToday = () => {
    if (flipBusy) return;
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), 1);
    setPendingMonthTarget(target);
    if (target.getTime() === monthStart(viewDate).getTime()) return;
    setFlipPhase(target > viewDate ? "out-next" : "out-prev");
  };

  const handleFlipTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (e.propertyName !== "transform") return;
    if (flipPhase === "out-next") {
      if (pendingMonthTarget) {
        setViewDate(pendingMonthTarget);
        setPendingMonthTarget(null);
      } else {
        setViewDate(
          (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
        );
      }
      setFlipPhase("idle");
    } else if (flipPhase === "out-prev") {
      if (pendingMonthTarget) {
        setViewDate(pendingMonthTarget);
        setPendingMonthTarget(null);
      } else {
        setViewDate(
          (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
        );
      }
      setFlipPhase("idle");
    }
  };

  const handleDateClick = (clickedDate: Date, inMonth: boolean) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
    } else if (
      atDayStart(clickedDate).getTime() <
      atDayStart(rangeStart).getTime()
    ) {
      setRangeStart(clickedDate);
      setRangeEnd(rangeStart);
    } else {
      setRangeEnd(clickedDate);
    }

    if (!inMonth) {
      const target = monthStart(clickedDate);
      const cur = monthStart(viewDate);
      if (target.getTime() === cur.getTime()) return;
      if (flipBusy) {
        setViewDate(target);
        return;
      }
      setPendingMonthTarget(target);
      setFlipPhase(
        target.getTime() > cur.getTime() ? "out-next" : "out-prev"
      );
    }
  };

  const handleRangeNoteChange = (value: string) => {
    if (!selectedRangeKey) return;

    setRangeNotes((prev) => ({
      ...prev,
      [selectedRangeKey]: value,
    }));
  };

  return (
    <section className="cement-wall relative flex items-center justify-center min-h-dvh w-full px-4 py-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_85%,rgba(0,0,0,0.24),transparent_62%)]" />

      <div
        className={[
          "calendar-sway relative mt-10 w-full max-w-[380px] bg-white rounded-[2px] overflow-hidden",
          "shadow-[0_55px_85px_rgba(0,0,0,0.33),0_12px_20px_rgba(0,0,0,0.14)]",
          "before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(0,0,0,0.08)]",
          "after:pointer-events-none after:absolute after:-bottom-5 after:left-[8%] after:h-8 after:w-[84%] after:rounded-full after:bg-black/20 after:blur-md",
          "transform hover:rotate-0 hover:-translate-y-1 transition duration-300",
          flipBusy ? "[animation-play-state:paused]" : "",
        ].join(" ")}
      >
        {/* Edge thickness + swirly side stack */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-7 z-20 w-[10px] bg-gradient-to-l from-zinc-300/85 via-zinc-100/80 to-transparent" />
        <div className="pointer-events-none absolute right-[2px] top-0 bottom-7 z-20 flex w-[7px] flex-col justify-evenly">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`edge-${i}`}
              className="block h-[2px] w-full rounded-full bg-zinc-400/35"
            />
          ))}
        </div>

        {/* Hand-crafted spiral binding (no image) */}
        <div className="relative bg-zinc-100 pt-3 pb-2 border-b border-zinc-300/70 overflow-hidden">
          {/* Round nail head embedded in wall */}
          <div className="pointer-events-none absolute left-1/2 top-[5px] z-30 -translate-x-1/2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 shadow-[0_3px_8px_rgba(0,0,0,0.55),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.3)]" />
          </div>
          <div className="mx-auto w-[90%]">
            <div className="h-[6px] rounded-full bg-zinc-700 shadow-[0_2px_3px_rgba(0,0,0,0.25)]" />
            <div className="mt-[-2px] flex items-start justify-between px-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="relative flex flex-col items-center">
                  <span className="block h-4 w-[8px] rounded-b-full border-[1.6px] border-zinc-700 border-t-0 bg-transparent" />
                  <span className="mt-1 block h-[4px] w-[3px] rounded-full bg-zinc-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-1 h-[2px] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-b from-black/[0.08] to-transparent" />
        </div>

        {/* Vertical roll-over turn from spiral with underlay preview */}
        <div
          className="relative z-0 [perspective:1400px]"
          style={{ perspectiveOrigin: "50% 0%" }}
        >
          {flipBusy ? (
            <div className="absolute inset-0 z-0 bg-white">
              {/* HERO PREVIEW */}
              <div className="relative bg-white overflow-hidden [backface-visibility:hidden]">
                <Image
                  src={previewMonthHeroImage}
                  alt="Hiking"
                  width={1024}
                  height={768}
                  priority
                  className="block h-64 w-full object-cover object-left [transform:translateZ(0)]"
                />
                <div className="pointer-events-none absolute top-0 right-0 h-16 w-28 bg-sky-500/55 [clip-path:polygon(100%_0,0_0,100%_100%)]" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-36 bg-sky-500/55 [clip-path:polygon(0_100%,0_20%,100%_100%)]" />
                <div className="absolute bottom-4 right-4 text-white text-right">
                  <p className="text-xs tracking-widest opacity-80">{previewYear}</p>
                  <p className="text-lg font-semibold tracking-[0.25em]">
                    {previewMonthName.toUpperCase()}
                  </p>
                </div>
              </div>
              {/* CONTENT PREVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-4 px-4 py-4 bg-white">
                <div className="flex flex-col h-full">
                  <p className="text-[11px] text-zinc-500 font-semibold mb-2">Notes</p>
                  <div className="flex-1 rounded bg-zinc-50 border border-zinc-100 p-2 text-xs text-zinc-600 overflow-hidden line-clamp-5">
                    {monthNotes[`${previewDate.getFullYear()}-${String(previewDate.getMonth() + 1).padStart(2, "0")}`] || ""}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] px-2 py-1 text-zinc-400">Prev</p>
                    <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 font-semibold">
                      {previewMonthName}
                    </h2>
                    <p className="text-[10px] px-2 py-1 text-zinc-400">Next</p>
                  </div>
                  <div className="grid grid-cols-7 text-center">
                    {WEEKDAYS.map((d) => (
                      <p key={d} className="text-[9px] text-zinc-400 tracking-wider">
                        {d}
                      </p>
                    ))}
                    {previewCells.map((cell) => {
                      const isWeekend =
                        cell.date.getDay() === 0 || cell.date.getDay() === 6;
                      return (
                        <span
                          key={`preview-${cell.date.toISOString()}`}
                          className={[
                            "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px]",
                            cell.inMonth
                              ? isWeekend
                                ? "text-sky-600"
                                : "text-zinc-800"
                              : "text-zinc-300",
                          ].join(" ")}
                        >
                          {cell.day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div
            className="relative z-10 [transform-style:preserve-3d] [backface-visibility:hidden] will-change-transform origin-top"
            style={{
              transform:
                flipPhase === "idle"
                  ? "rotateX(0deg)"
                  : flipPhase === "out-next"
                    ? "rotateX(-88deg)"
                    : "rotateX(88deg)",
              transition:
                flipPhase === "out-next" || flipPhase === "out-prev"
                  ? "transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)"
                  : "none",
              boxShadow:
                flipPhase === "out-next" || flipPhase === "out-prev"
                  ? "0 16px 38px rgba(0,0,0,0.22)"
                  : "none",
            }}
            onTransitionEnd={handleFlipTransitionEnd}
          >
            {/* HERO */}
            <div className="relative bg-white overflow-hidden [backface-visibility:hidden]">
              <Image
                src={monthHeroImage}
                alt="Hiking"
                width={1024}
                height={768}
                priority
                className="block h-64 w-full object-cover object-left [transform:translateZ(0)]"
              />

              <div className="pointer-events-none absolute top-0 right-0 h-16 w-28 bg-sky-500/55 [clip-path:polygon(100%_0,0_0,100%_100%)]" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-36 bg-sky-500/55 [clip-path:polygon(0_100%,0_20%,100%_100%)]" />

              <div className="absolute bottom-4 right-4 text-white text-right">
                <p className="text-xs tracking-widest opacity-80">{year}</p>
                <p className="text-lg font-semibold tracking-[0.25em]">
                  {monthName.toUpperCase()}
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-4 px-4 py-4 bg-white">
              {/* NOTES */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] text-zinc-500 font-semibold">Notes</p>
                  <button
                    onClick={() => {
                      setRangeStart(null);
                      setRangeEnd(null);
                    }}
                    className="text-[10px] text-sky-600 font-semibold"
                  >
                    Clear
                  </button>
                </div>

                <textarea
                  value={currentMonthNote}
                  onChange={(e) =>
                    setMonthNotes((prev) => ({
                      ...prev,
                      [viewMonthKey]: e.target.value,
                    }))
                  }
                  placeholder="Monthly notes..."
                  className="w-full text-xs text-zinc-600 bg-transparent outline-none resize-none"
                />

                <div className="mt-2 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[1px] bg-zinc-200" />
                  ))}
                </div>

                <p className="mt-3 text-[10px] text-zinc-500 uppercase font-semibold">
                  Range Note
                </p>

                <textarea
                  value={selectedRangeNote}
                  onChange={(e) => handleRangeNoteChange(e.target.value)}
                  disabled={!selectedRangeKey}
                  placeholder="Select range first..."
                  className="mt-1 w-full text-xs bg-zinc-50 border border-zinc-200 p-2 rounded outline-none disabled:opacity-60 min-h-[40px]"
                />

                <p className="text-[10px] mt-1 text-zinc-500">{rangeLabel}</p>

                {activeTasks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-zinc-200">
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mb-1">Assigned Tasks</p>
                    <div className="max-h-[80px] overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {activeTasks.map(([key, note]) => {
                        const [startISO, endISO] = key.split("__");
                        const sDate = new Date(startISO);
                        const eDate = new Date(endISO);
                        const label = `${sDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} - ${eDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}`;
                        
                        return (
                          <div key={key} className="flex items-center gap-1 w-full bg-zinc-50/80 p-1.5 rounded border border-zinc-100 hover:bg-zinc-100 focus-within:ring-1 focus-within:ring-sky-200 transition-colors">
                            <button 
                              type="button"
                              onClick={() => {
                                setRangeStart(sDate);
                                setRangeEnd(eDate);
                                const cur = monthStart(viewDate);
                                const target = monthStart(sDate);
                                if (target.getTime() !== cur.getTime() && flipPhase === "idle") {
                                  setPendingMonthTarget(target);
                                  setFlipPhase(target.getTime() > cur.getTime() ? "out-next" : "out-prev");
                                }
                              }}
                              className="flex-1 text-left cursor-pointer text-[10px] flex flex-col gap-0.5 focus:outline-none overflow-hidden"
                            >
                              <span className="font-semibold text-sky-600 text-[9px] leading-tight">{label}</span>
                              <span className="text-zinc-600 truncate leading-tight w-full" title={note}>{note}</span>
                            </button>
                            <button
                              type="button"
                              className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors focus:outline-none flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRangeNotes((prev) => {
                                  const updated = { ...prev };
                                  delete updated[key];
                                  return updated;
                                });
                                if (selectedRangeKey === key) {
                                  setRangeStart(null);
                                  setRangeEnd(null);
                                }
                              }}
                              title="Remove Task"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* CALENDAR */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <button
                    type="button"
                    onClick={goPrevMonth}
                    disabled={flipBusy}
                    className="text-[10px] px-2 py-1 hover:bg-zinc-100 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <div className="text-center">
                    <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 font-semibold">
                      {monthName}
                    </h2>
                    <button
                      type="button"
                      onClick={goToday}
                      disabled={flipBusy}
                      className="mt-0.5 text-[9px] px-2 py-[2px] rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
                    >
                      Today
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={goNextMonth}
                    disabled={flipBusy}
                    className="text-[10px] px-2 py-1 hover:bg-zinc-100 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center">
                  {WEEKDAYS.map((d) => (
                    <p key={d} className="text-[9px] text-zinc-400 tracking-wider">
                      {d}
                    </p>
                  ))}

                  {cells.map((cell) => {
                    const isStart =
                      rangeStart && isSameDate(cell.date, rangeStart);
                    const isEnd =
                      rangeEnd && isSameDate(cell.date, rangeEnd);
                    const inRange =
                      rangeStart && rangeEnd
                        ? isWithinRange(cell.date, rangeStart, rangeEnd)
                        : false;

                    const isToday = isSameDate(cell.date, today);
                    const isWeekend =
                      cell.date.getDay() === 0 || cell.date.getDay() === 6;
                    const holidayLabel = holidayMap.get(dateKey(cell.date));
                    const isHoliday = !!holidayLabel;
                    const holidayClass = cell.inMonth
                      ? "bg-amber-200 text-black shadow-[inset_0_0_0_1px_rgba(217,119,6,0.42)]"
                      : "bg-amber-100 text-zinc-800 shadow-[inset_0_0_0_1px_rgba(217,119,6,0.35)]";

                    return (
                      <button
                        key={cell.date.toISOString()}
                        onClick={() => handleDateClick(cell.date, cell.inMonth)}
                        title={holidayLabel ?? ""}
                        className={[
                          "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium leading-none transition",
                          cell.inMonth
                            ? isWeekend
                              ? "text-sky-600"
                              : "text-zinc-800"
                            : "text-zinc-300",
                          isStart || isEnd
                            ? "bg-sky-500 text-white"
                            : isHoliday
                              ? holidayClass
                              : inRange
                                ? "bg-sky-100 text-sky-700"
                                : "hover:bg-zinc-100",
                          !isStart && !isEnd && isToday
                            ? isHoliday
                              ? "shadow-[inset_0_0_0_2px_rgba(59,130,246,0.55)]"
                              : "ring-1 ring-sky-400"
                            : "",
                        ].join(" ")}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PAPER CURL */}
          <div className="relative h-6 bg-white">
            <div className="absolute left-0 bottom-0 w-1/2 h-6 bg-white shadow-[0_10px_15px_rgba(0,0,0,0.25)] rounded-br-full" />
            <div className="absolute right-0 bottom-0 w-1/2 h-6 bg-white shadow-[0_10px_15px_rgba(0,0,0,0.25)] rounded-bl-full" />
          </div>
        </div>

      </div>
    </section>
  );
}