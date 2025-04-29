import React, { useEffect, useRef, useState } from "react";

interface BarChartProps {
  data: number[];
  labels: string[];
  title: string;
  color: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, labels, title, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const drawBars = () => {
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = "rgba(229, 231, 235, 0.5)";
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Get max value for scaling
      const maxValue = Math.max(...data) * 1.1;

      // Bar width with spacing
      const barCount = data.length;
      const barSpacing = (chartWidth * 0.1) / barCount;
      const barWidth = chartWidth / barCount - barSpacing;

      // Draw bars
      data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + barSpacing);
        const y = height - padding - barHeight;

        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x, height - padding);
        gradient.addColorStop(0, color);
        gradient.addColorStop(
          1,
          color.replace(")", ", 0.6)").replace("rgb", "rgba")
        );

        // Draw bar
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Draw value above bar
        ctx.fillStyle = "rgba(107, 114, 128, 1)";
        ctx.font = "12px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(value.toString(), x + barWidth / 2, y - 10);
      });

      // Draw axis labels
      ctx.fillStyle = "rgba(107, 114, 128, 1)";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";

      // X-axis labels
      labels.forEach((label, index) => {
        const x = padding + index * (barWidth + barSpacing) + barWidth / 2;
        ctx.fillText(label, x, height - padding + 20);
      });
    };

    // Initial draw
    drawBars();

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawBars();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [color, data, isVisible, labels]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="w-full h-64">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
};

export default BarChart;
