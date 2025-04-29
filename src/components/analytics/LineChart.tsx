import React, { useEffect, useRef, useState } from "react";

interface DataSeries {
  label: string;
  data: number[];
  color: string;
}

interface LineChartProps {
  data: DataSeries[];
  labels: string[];
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, labels, title }) => {
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

    const drawLines = () => {
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
      const maxValue = Math.max(...data.flatMap((series) => series.data)) * 1.1;

      // Draw lines for each series
      data.forEach((series) => {
        ctx.strokeStyle = series.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Draw line segments
        series.data.forEach((value, index) => {
          const x = padding + (chartWidth / (series.data.length - 1)) * index;
          const y = height - padding - (value / maxValue) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(
          0,
          padding,
          0,
          height - padding
        );
        gradient.addColorStop(
          0,
          series.color.replace(")", ", 0.1)").replace("rgb", "rgba")
        );
        gradient.addColorStop(
          1,
          series.color.replace(")", ", 0.0)").replace("rgb", "rgba")
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);

        // Draw the same path as the line
        series.data.forEach((value, index) => {
          const x = padding + (chartWidth / (series.data.length - 1)) * index;
          const y = height - padding - (value / maxValue) * chartHeight;
          ctx.lineTo(x, y);
        });

        ctx.lineTo(padding + chartWidth, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fill();
      });

      // Draw axis labels
      ctx.fillStyle = "rgba(107, 114, 128, 1)";
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";

      // X-axis labels
      labels.forEach((label, index) => {
        const x = padding + (chartWidth / (labels.length - 1)) * index;
        ctx.fillText(label, x, height - padding + 20);
      });

      // Draw legend
      const legendY = padding - 20;
      let legendX = padding;

      data.forEach((series) => {
        // Draw color indicator
        ctx.strokeStyle = series.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 20, legendY);
        ctx.stroke();

        // Draw label
        ctx.fillStyle = "rgba(107, 114, 128, 1)";
        ctx.textAlign = "left";
        ctx.fillText(series.label, legendX + 30, legendY + 4);

        legendX += ctx.measureText(series.label).width + 60;
      });
    };

    // Initial draw
    drawLines();

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawLines();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [data, isVisible, labels]);

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

export default LineChart;
