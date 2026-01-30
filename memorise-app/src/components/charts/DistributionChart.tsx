import React from 'react';
import './Charts.css';

interface DistributionChartProps {
    data: { label: string; value: number; color: string }[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate percentages and create segments
    let cumulativePercent = 0;
    const segments = data.map(item => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const segment = {
            ...item,
            percent,
            offset: cumulativePercent,
        };
        cumulativePercent += percent;
        return segment;
    });

    if (total === 0) {
        return (
            <div className="distribution-chart">
                <div className="donut-container">
                    <svg viewBox="0 0 36 36" className="donut">
                        <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="var(--border-color)"
                            strokeWidth="3"
                        />
                    </svg>
                    <div className="donut-center">
                        <span className="donut-total">0</span>
                        <span className="donut-label">cards</span>
                    </div>
                </div>
                <div className="chart-legend">
                    {data.map((item, index) => (
                        <div key={index} className="legend-item">
                            <span className="legend-dot" style={{ background: item.color }} />
                            <span className="legend-label">{item.label}</span>
                            <span className="legend-value">0</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="distribution-chart">
            <div className="donut-container">
                <svg viewBox="0 0 36 36" className="donut">
                    {/* Background circle */}
                    <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth="3"
                    />
                    {/* Data segments */}
                    {segments.map((segment, index) => (
                        <circle
                            key={index}
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="3"
                            strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                            strokeDashoffset={25 - segment.offset}
                            className="donut-segment"
                        />
                    ))}
                </svg>
                <div className="donut-center">
                    <span className="donut-total">{total}</span>
                    <span className="donut-label">cards</span>
                </div>
            </div>

            <div className="chart-legend">
                {segments.map((item, index) => (
                    <div key={index} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
