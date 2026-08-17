import React, { useState, useEffect } from 'react';

interface DashboardProgressBarProps {
  onRefresh: () => void;
  intervalSeconds?: number;
}

export const DashboardProgressBar: React.FC<DashboardProgressBarProps> = ({
  onRefresh,
  intervalSeconds = 60,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onRefresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds, onRefresh]);

  const progressPercent = ((intervalSeconds - secondsLeft) / intervalSeconds) * 100;

  return (
    <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 sticky top-16 z-20 pointer-events-none">
      <div className="w-full h-[3px] bg-slate-800/40 overflow-hidden backdrop-blur-xs">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(6,182,212,0.7)]"
        />
      </div>
    </div>
  );
};
