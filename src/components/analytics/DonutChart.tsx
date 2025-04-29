import React, { useEffect, useRef, useState } from "react";

interface DonutChartProps {
  data: number[];
  labels: string[];
  title: string;
  colors: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  labels,
  title,
  colors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

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

    const drawDonut = () => {
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 40;
      const innerRadius = radius * 0.6;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate total for percentages
      const total = data.reduce((sum, value) => sum + value, 0);

      // Starting angle
      let startAngle = -Math.PI / 2;

      // Draw segments
      data.forEach((value, index) => {
        // Calculate angles
        const segmentAngle = (value / total) * (Math.PI * 2);
        const endAngle = startAngle + segmentAngle;

        // Check if this segment is active (hovered)
        const isActive = index === activeSegment;

        // Apply slight offset if active
        const offset = isActive ? 10 : 0;
        const segmentCenterAngle = startAngle + segmentAngle / 2;
        const offsetX = Math.cos(segmentCenterAngle) * offset;
        const offsetY = Math.sin(segmentCenterAngle) * offset;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX + offsetX, centerY + offsetY);
        ctx.arc(
          centerX + offsetX,
          centerY + offsetY,
          radius,
          startAngle,
          endAngle
        );
        ctx.arc(
          centerX + offsetX,
          centerY + offsetY,
          innerRadius,
          endAngle,
          startAngle,
          true
        );
        ctx.closePath();

        // Fill with color
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        // Add stroke
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Update start angle for next segment
        startAngle = endAngle;
      });

      // Draw center circle (for donut hole)
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      // Draw total in center
      ctx.fillStyle = "#374151";
      ctx.font = "bold 20px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(total.toString(), centerX, centerY);

      ctx.fillStyle = "#6B7280";
      ctx.font = "14px Inter, system-ui, sans-serif";
      ctx.fillText("Total", centerX, centerY + 25);
    };

    // Initial draw
    drawDonut();

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawDonut();
    };

    window.addEventListener("resize", handleResize);

    // Handle mouse movement for hover effects
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
      const innerRadius = radius * 0.6;

      // Calculate distance from center
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      // Check if within donut ring
      if (distance >= innerRadius && distance <= radius) {
        // Calculate angle
        let angle = Math.atan2(y - centerY, x - centerX);
        // Adjust angle to start from top (-π/2) and go clockwise
        if (angle < -Math.PI / 2) angle = angle + Math.PI * 2;

        // Find which segment this angle belongs to
        const total = data.reduce((sum, value) => sum + value, 0);
        let startAngle = -Math.PI / 2;
        let activeIndex = null;

        for (let i = 0; i < data.length; i++) {
          const segmentAngle = (data[i] / total) * (Math.PI * 2);
          const endAngle = startAngle + segmentAngle;

          if (angle >= startAngle && angle < endAngle) {
            activeIndex = i;
            break;
          }

          startAngle = endAngle;
        }

        if (activeIndex !== activeSegment) {
          setActiveSegment(activeIndex);
        }
      } else if (activeSegment !== null) {
        setActiveSegment(null);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", () => setActiveSegment(null));

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", () => setActiveSegment(null));
    };
  }, [data, isVisible, labels, activeSegment, colors]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="flex justify-between">
        <div className="w-full h-64">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
        <div className="ml-6 mt-8">
          {labels.map((label, index) => (
            <div
              key={index}
              className={`flex items-center mb-3 ${
                activeSegment === index ? "scale-105 transition-transform" : ""
              }`}
              onMouseEnter={() => setActiveSegment(index)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <div
                className="w-4 h-4 rounded-sm mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data[index]} (
                  {(
                    (data[index] / data.reduce((a, b) => a + b, 0)) *
                    100
                  ).toFixed(1)}
                  %)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
