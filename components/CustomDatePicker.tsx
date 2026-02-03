import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  // viewDate controls which month is currently shown in the calendar popup
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update view date when value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    // Format: YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === currentDateStr;
      const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

      days.push(
        <button
          key={day}
          onClick={(e) => {
            e.preventDefault();
            handleDateSelect(day);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-700'}
            ${isToday && !isSelected ? 'text-indigo-600 font-bold border border-indigo-200' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Format date for display in the input box (YYYY/MM/DD)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // Format month for header (YYYY/MM)
  const formatMonthHeader = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full md:w-auto" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 cursor-pointer flex items-center justify-between hover:border-indigo-300 transition-colors"
      >
        <span className="text-sm font-medium text-slate-600">
          {value ? formatDisplayDate(value) : 'Select Date'}
        </span>
        <span className="text-slate-400">📅</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-[300px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={(e) => { e.preventDefault(); handlePrevMonth(); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              ◀
            </button>
            <span className="font-bold text-slate-800">
              {formatMonthHeader(viewDate)}
            </span>
            <button onClick={(e) => { e.preventDefault(); handleNextMonth(); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              ▶
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-[10px] font-bold text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
