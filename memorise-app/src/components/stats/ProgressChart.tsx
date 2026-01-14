import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReviewLog } from '../../models/ReviewLog';
import { format, subDays } from 'date-fns';

interface ProgressChartProps {
  reviewLogs: ReviewLog[];
  days?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ reviewLogs, days = 30 }) => {
  const data = useMemo(() => {
    const today = new Date();
    const dataMap = new Map<string, number>();

    // Initialize last 30 days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const key = format(date, 'yyyy-MM-dd');
      dataMap.set(key, 0);
    }

    // Count reviews per day
    reviewLogs.forEach(log => {
      const key = format(new Date(log.reviewDate), 'yyyy-MM-dd');
      if (dataMap.has(key)) {
        dataMap.set(key, (dataMap.get(key) || 0) + 1);
      }
    });

    return Array.from(dataMap.entries()).map(([date, count]) => ({
      date: format(new Date(date), 'MMM d'),
      reviews: count,
    }));
  }, [reviewLogs, days]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="reviews" fill="#5B8DEF" />
      </BarChart>
    </ResponsiveContainer>
  );
};


