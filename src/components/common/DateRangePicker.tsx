import React, { useEffect } from "react";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = "",
}) => {
  useEffect(() => {
    console.log("DateRangePicker - Fechas recibidas:");
    console.log("- startDate:", startDate);
    console.log("- endDate:", endDate);
  }, [startDate, endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // Formato "YYYY-MM-DD"
    console.log(
      "DateRangePicker - Nueva fecha de inicio seleccionada:",
      dateString
    );

    // Crear la fecha correctamente, respetando el día seleccionado
    const [year, month, day] = dateString.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);

    console.log(
      "DateRangePicker - Fecha de inicio convertida a objeto Date:",
      newDate
    );
    onStartDateChange(newDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // Formato "YYYY-MM-DD"
    console.log(
      "DateRangePicker - Nueva fecha de fin seleccionada:",
      dateString
    );

    // Crear la fecha correctamente, respetando el día seleccionado
    const [year, month, day] = dateString.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);

    console.log(
      "DateRangePicker - Fecha de fin convertida a objeto Date:",
      newDate
    );
    onEndDateChange(newDate);
  };

  // Formatea la fecha para el input sin problemas de zona horaria
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        <div className="relative">
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
      </div>
      <span className="text-slate-500 dark:text-slate-400">to</span>
      <div className="flex items-center">
        <div className="relative">
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
