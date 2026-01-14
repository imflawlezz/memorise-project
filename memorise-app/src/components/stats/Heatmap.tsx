import React, { useMemo } from 'react';
import { ReviewLog } from '../../models/ReviewLog';
import { startOfYear, endOfYear, format, differenceInWeeks, addWeeks, getDay, addDays } from 'date-fns';
import './Heatmap.css';

interface HeatmapProps {
  reviewLogs: ReviewLog[];
  year?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ reviewLogs, year = new Date().getFullYear() }) => {
  const data = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 11, 31));
    const weeks = differenceInWeeks(yearEnd, yearStart);

    const heatmapData: { [key: string]: number } = {};

    // Count reviews per day
    reviewLogs.forEach(log => {
      const logDate = new Date(log.reviewDate);
      if (logDate.getFullYear() === year) {
        const key = format(logDate, 'yyyy-MM-dd');
        heatmapData[key] = (heatmapData[key] || 0) + 1;
      }
    });

    // Build grid: 7 rows (days) x ~52 columns (weeks)
    const grid: (number | null)[][] = [];
    for (let day = 0; day < 7; day++) {
      grid[day] = [];
      for (let week = 0; week <= weeks; week++) {
        const date = addWeeks(yearStart, week);
        const dateForDay = addDays(date, day - getDay(date));

        if (dateForDay >= yearStart && dateForDay <= yearEnd) {
          const key = format(dateForDay, 'yyyy-MM-dd');
          grid[day][week] = heatmapData[key] || 0;
        } else {
          grid[day][week] = null;
        }
      }
    }

    return grid;
  }, [reviewLogs, year]);

  const getIntensity = (count: number | null): string => {
    if (count === null) return 'empty';
    if (count === 0) return 'level-0';
    if (count <= 5) return 'level-1';
    if (count <= 10) return 'level-2';
    if (count <= 20) return 'level-3';
    return 'level-4';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        <div className="day-labels">
          {dayLabels.map((day, idx) => (
            <div key={day} className="day-label">
              {day}
            </div>
          ))}
        </div>
        <div className="squares">
          {/* Iterate by week first (columns), then by day (rows) */}
          {data[0] && data[0].map((_, weekIdx) => (
            data.map((dayData, dayIdx) => (
              <div
                key={`${dayIdx}-${weekIdx}`}
                className={`square ${getIntensity(dayData[weekIdx])}`}
                title={dayData[weekIdx] !== null ? `${dayData[weekIdx]} reviews` : ''}
              />
            ))
          ))}
        </div>
      </div>
    </div>
  );
};


