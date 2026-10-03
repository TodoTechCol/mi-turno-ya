"use client";

import { useState } from "react";
import {
  format,
  addDays,
  startOfToday,
  isSameDay,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

export default function DatePicker({ onSelect }: Props) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding al inicio del mes (día de la semana del primer día)
  const startPad = getDay(monthStart); // 0=Dom

  function handleSelect(day: Date) {
    if (isBefore(day, today)) return;
    setSelected(day);
    onSelect(day);
  }

  return (
    <div className="bg-white rounded-xl border border-pizarra-100 p-4">
      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          disabled={isSameDay(currentMonth, startOfMonth(today))}
          className="p-1 rounded-lg text-pizarra-400 hover:text-pizarra-700 hover:bg-pizarra-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-medium text-pizarra-900 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded-lg text-pizarra-400 hover:text-pizarra-700 hover:bg-pizarra-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cabecera de días */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-pizarra-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Padding inicial */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const isPast = isBefore(day, today);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleSelect(day)}
              disabled={isPast}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-lg transition-colors",
                isPast && "text-pizarra-300 cursor-not-allowed",
                !isPast && !isSelected && "text-pizarra-700 hover:bg-lila-50 hover:text-lila-600",
                isSelected && "bg-lila-600 text-white font-semibold",
                isToday && !isSelected && "font-bold text-lila-600"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
