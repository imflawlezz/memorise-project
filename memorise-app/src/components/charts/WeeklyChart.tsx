import React from 'react';
import './Charts.css';

interface WeeklyChartProps {
    data: { day: string; count: number }[];
    maxValue?: number;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, maxValue }) => {
    const max = maxValue || Math.max(...data.map(d => d.count), 1);

    return (
        <div className="weekly-chart">
            <div className="chart-bars">
                {data.map((item, index) => {
                    const height = max > 0 ? (item.count / max) * 100 : 0;
                    return (
                        <div key={index} className="chart-bar-wrapper">
                            <div className="chart-bar-container">
                                <div
                                    className={`chart-bar ${item.count > 0 ? 'active' : ''}`}
                                    style={{ height: `${Math.max(height, 4)}%` }}
                                >
                                    {item.count > 0 && (
                                        <span className="chart-bar-value">{item.count}</span>
                                    )}
                                </div>
                            </div>
                            <span className="chart-bar-label">{item.day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
