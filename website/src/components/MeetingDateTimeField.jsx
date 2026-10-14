import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../language";

const HOURS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

function pad(value) {
  return String(value).padStart(2, "0");
}

function sameDay(left, right) {
  return (
    left &&
    right &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function toIso(date, hour12, minute, period) {
  let hour = Number(hour12) % 12;
  if (period === "pm") hour += 12;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${minute}`;
}

function fromIso(value) {
  const match = String(value || "").match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  let hour = Number(match[4]);
  const period = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return {
    date,
    hour: pad(hour),
    minute: match[5],
    period,
  };
}

function formatDisplay(value) {
  const parsed = fromIso(value);
  if (!parsed) return "";

  const day = pad(parsed.date.getDate());
  const month = pad(parsed.date.getMonth() + 1);
  const year = parsed.date.getFullYear();

  return `${day} / ${month} / ${year}, ${parsed.hour} : ${parsed.minute} ${parsed.period}`;
}

function monthCells(view) {
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const previousCount = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    const day = previousCount - firstWeekday + 1 + index;
    cells.push({
      key: `prev-${day}`,
      day,
      outside: true,
      date: new Date(year, month - 1, day),
    });
  }

  for (let day = 1; day <= count; day += 1) {
    cells.push({
      key: `day-${day}`,
      day,
      outside: false,
      date: new Date(year, month, day),
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      key: `next-${nextDay}`,
      day: nextDay,
      outside: true,
      date: new Date(year, month + 1, nextDay),
    });
    nextDay += 1;
  }

  return cells;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isPastDay(date, now) {
  return startOfDay(date).getTime() < startOfDay(now).getTime();
}

function hour24(hour12, period) {
  let hour = Number(hour12) % 12;
  if (period === "pm") hour += 12;
  return hour;
}

function isPastTime(date, hour12, minute, period, now) {
  if (!date || !sameDay(date, now)) return false;

  const value = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour24(hour12, period),
    Number(minute),
    0,
    0
  );

  return value.getTime() < now.getTime();
}

function nextAllowedTime(date, hour12, minute, period, now) {
  if (!sameDay(date, now) || !isPastTime(date, hour12, minute, period, now)) {
    return { hour: hour12, minute, period };
  }

  let hour = now.getHours();
  const nextPeriod = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return {
    hour: pad(hour),
    minute: pad(now.getMinutes()),
    period: nextPeriod,
  };
}

export default function MeetingDateTimeField({ invalid, invalidStyle, onValue }) {
  const { lang, t } = useLanguage();
  const rootRef = useRef(null);
  const modalRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [iso, setIso] = useState("");
  const [view, setView] = useState(() => new Date());
  const [selected, setSelected] = useState(null);
  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("pm");

  const locale = lang === "es" ? "es" : "en";
  const today = new Date();
  const cells = useMemo(() => monthCells(view), [view]);
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(2024, 0, 7 + index);
        return date.toLocaleDateString(locale, { weekday: "short" });
      }),
    [locale]
  );

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (modalRef.current?.contains(event.target)) return;
      if (rootRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function commit(nextDate, nextHour, nextMinute, nextPeriod) {
    const now = new Date();
    if (!nextDate || isPastDay(nextDate, now)) return;

    const allowed = nextAllowedTime(
      nextDate,
      nextHour,
      nextMinute,
      nextPeriod,
      now
    );
    const nextIso = toIso(
      nextDate,
      allowed.hour,
      allowed.minute,
      allowed.period
    );

    setHour(allowed.hour);
    setMinute(allowed.minute);
    setPeriod(allowed.period);
    setIso(nextIso);
    setSelected(nextDate);
    setView(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    onValue?.(nextIso);
  }

  function openPanel() {
    const parsed = fromIso(iso);
    if (parsed) {
      setSelected(parsed.date);
      setView(new Date(parsed.date.getFullYear(), parsed.date.getMonth(), 1));
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }
    setOpen(true);
  }

  function clearValue() {
    setIso("");
    setSelected(null);
    onValue?.("");
    setOpen(false);
  }

  const monthLabel = view.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  const timeDate = selected || today;
  const onCurrentMonth =
    view.getFullYear() === today.getFullYear() &&
    view.getMonth() === today.getMonth();

  function hourBlocked(item) {
    if (!sameDay(timeDate, today)) return false;
    return hour24(item, period) < today.getHours();
  }

  function minuteBlocked(item) {
    if (!sameDay(timeDate, today)) return false;
    if (hour24(hour, period) !== today.getHours()) return false;
    return Number(item) < today.getMinutes();
  }

  function periodBlocked(item) {
    if (!sameDay(timeDate, today)) return false;
    return item === "am" && today.getHours() >= 12;
  }

  return (
    <div className={`meet-dt ${open ? "is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        id="meeting-datetime-trigger"
        className={`meet-dt__trigger ${invalid ? "is-invalid" : ""}`}
        style={invalid ? invalidStyle : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <span className={iso ? "meet-dt__value" : "meet-dt__placeholder"}>
          {iso ? formatDisplay(iso) : "dd / mm / yyyy, -- : --"}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>

      <input type="hidden" name="datetime" value={iso} />

      {open
        ? createPortal(
        <div className="meet-dt__modal" ref={modalRef}>
          <button
            type="button"
            className="meet-dt__backdrop"
            aria-label={t("Close")}
            onClick={() => setOpen(false)}
          />
          <div className="meet-dt__panel" role="dialog" aria-label={t("Desired meeting date & time")}>
            <div className="meet-dt__month">
              <button
                type="button"
                disabled={onCurrentMonth}
                onClick={() => {
                  if (onCurrentMonth) return;
                  setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
                }}
                aria-label={t("Previous month")}
              >
                ‹
              </button>
              <strong>{monthLabel}</strong>
              <button
                type="button"
                onClick={() =>
                  setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
                }
                aria-label={t("Next month")}
              >
                ›
              </button>
            </div>

            <div className="meet-dt__week">
              {weekdays.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>

            <div className="meet-dt__days">
              {cells.map((cell) => {
                const isSelected = sameDay(cell.date, selected);
                const isToday = sameDay(cell.date, today);
                const isPast = isPastDay(cell.date, today);
                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={isPast}
                    className={[
                      cell.outside ? "is-outside" : "",
                      isSelected ? "is-selected" : "",
                      isToday ? "is-today" : "",
                      isPast ? "is-past" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => commit(cell.date, hour, minute, period)}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="meet-dt__time">
              <span>{t("Time")}</span>
              <select
                value={hour}
                aria-label={t("Hour")}
                onChange={(event) => {
                  const nextHour = event.target.value;
                  setHour(nextHour);
                  commit(selected || today, nextHour, minute, period);
                }}
              >
                {HOURS.map((item) => (
                  <option key={item} value={item} disabled={hourBlocked(item)}>
                    {item}
                  </option>
                ))}
              </select>
              <em>:</em>
              <select
                value={minute}
                aria-label={t("Minute")}
                onChange={(event) => {
                  const nextMinute = event.target.value;
                  setMinute(nextMinute);
                  commit(selected || today, hour, nextMinute, period);
                }}
              >
                {MINUTES.map((item) => (
                  <option key={item} value={item} disabled={minuteBlocked(item)}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={period}
                aria-label={t("AM or PM")}
                onChange={(event) => {
                  const nextPeriod = event.target.value;
                  setPeriod(nextPeriod);
                  commit(selected || today, hour, minute, nextPeriod);
                }}
              >
                <option value="am" disabled={periodBlocked("am")}>{t("AM")}</option>
                <option value="pm" disabled={periodBlocked("pm")}>{t("PM")}</option>
              </select>
            </div>

            <div className="meet-dt__actions">
              <button type="button" onClick={clearValue}>
                {t("Clear")}
              </button>
              <button type="button" className="is-done" onClick={() => setOpen(false)}>
                {t("Done")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
