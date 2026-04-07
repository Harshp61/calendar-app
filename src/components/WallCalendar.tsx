"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export default function WallCalendar() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(new Date());
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [monthNote, setMonthNote] = useState("");
  const [rangeNotes, setRangeNotes] = useState<Record<string, string>>({});

  const monthName = viewDate.toLocaleString("en-US", { month: "long" });
  const year = viewDate.getFullYear();
  const cells = useMemo(() => monthGrid(viewDate), [viewDate]);

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
      setViewDate(
        new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1)
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
    <section className="flex items-center justify-center min-h-screen bg-gray-200 px-4">
      <div className="w-full max-w-[380px] bg-white rounded-sm overflow-hidden
      shadow-[0_40px_80px_rgba(0,0,0,0.35)]
      transform rotate-[0.4deg] hover:rotate-0 hover:-translate-y-1 transition duration-300">

        {/* 🔥 FULL WIDTH SPIRAL */}
        <div className="relative h-14 bg-zinc-100 flex items-center justify-center overflow-hidden">

          <div className="flex w-full justify-between px-3 z-10">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`w-[2px] ${i % 2 === 0 ? "h-5" : "h-4"} bg-zinc-700 rounded-full`}
              />
            ))}
          </div>

          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-zinc-700 bg-white z-20" />

          <div className="absolute top-7 left-0 right-0 h-[1px] bg-zinc-500/70 z-10" />

          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-black/20 to-transparent" />
        </div>

        {/* HERO */}
        <div className="relative">
          <Image
            src="/comp1.jpg"
            alt="Hiking"
            width={1024}
            height={768}
            priority
            className="h-64 w-full object-cover object-left"
          />

          <div
            className="absolute inset-0 bg-sky-500/90"
            style={{
              clipPath: "polygon(0 70%, 100% 50%, 100% 100%, 0 100%)",
            }}
          />

          <div className="absolute bottom-4 right-4 text-white text-right">
            <p className="text-xs tracking-widest opacity-80">{year}</p>
            <p className="text-lg font-semibold tracking-[0.25em]">
              {monthName.toUpperCase()}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-4 px-4 py-4">

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
              value={monthNote}
              onChange={(e) => setMonthNote(e.target.value)}
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
              className="mt-1 w-full text-xs bg-zinc-50 border border-zinc-200 p-2 rounded outline-none disabled:opacity-60"
            />

            <p className="text-[10px] mt-2 text-zinc-500">{rangeLabel}</p>
          </div>

          {/* CALENDAR */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() =>
                  setViewDate(
                    (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
                  )
                }
                className="text-[10px] px-2 py-1 hover:bg-zinc-100 rounded"
              >
                Prev
              </button>

              <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 font-semibold">
                {monthName}
              </h2>

              <button
                onClick={() =>
                  setViewDate(
                    (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
                  )
                }
                className="text-[10px] px-2 py-1 hover:bg-zinc-100 rounded"
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

                return (
                  <button
                    key={cell.date.toISOString()}
                    onClick={() =>
                      handleDateClick(cell.date, cell.inMonth)
                    }
                    className={[
                      "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] transition",
                      cell.inMonth
                        ? isWeekend
                          ? "text-sky-600"
                          : "text-zinc-800"
                        : "text-zinc-300",
                      inRange ? "bg-sky-100 text-sky-700" : "",
                      isStart || isEnd
                        ? "bg-sky-500 text-white"
                        : "hover:bg-zinc-100",
                      !isStart && !isEnd && isToday
                        ? "ring-1 ring-sky-400"
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

        {/* PAPER CURL */}
        <div className="relative h-6 bg-white">
          <div className="absolute left-0 bottom-0 w-1/2 h-6 bg-white shadow-[0_10px_15px_rgba(0,0,0,0.25)] rounded-br-full" />
          <div className="absolute right-0 bottom-0 w-1/2 h-6 bg-white shadow-[0_10px_15px_rgba(0,0,0,0.25)] rounded-bl-full" />
        </div>

      </div>
    </section>
  );
}