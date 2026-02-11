"use client";

import { useEffect, useRef } from "react";

/**
 * Circuit-board style animated lines — energy pulses flowing along
 * orthogonal traces across the entire page, making right-angle turns
 * like PCB traces with power flowing through them.
 */

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Trace {
  segments: Segment[];
  totalLength: number;
  pulsePos: number;
  pulseSpeed: number;
  pulseLength: number;
  opacity: number;
}

// Directions: right, down, left, up
const DIRS: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function createTrace(canvasW: number, canvasH: number, fromCenter: boolean): Trace {
  const segments: Segment[] = [];

  let x: number, y: number;

  if (fromCenter) {
    // Some traces start from center area
    x = canvasW * (0.35 + Math.random() * 0.3);
    y = canvasH * (0.3 + Math.random() * 0.3);
  } else {
    // Others start from random points across the entire canvas
    x = Math.random() * canvasW;
    y = Math.random() * canvasH;
  }

  // Pick an initial direction
  let dirIdx = Math.floor(Math.random() * 4);
  const numSegments = 4 + Math.floor(Math.random() * 6); // 4–9 segments

  for (let i = 0; i < numSegments; i++) {
    const dir = DIRS[dirIdx];
    const len = 40 + Math.random() * 180;
    const nx = x + dir[0] * len;
    const ny = y + dir[1] * len;
    segments.push({ x1: x, y1: y, x2: nx, y2: ny });
    x = nx;
    y = ny;

    // Turn 90°
    if (dir[0] !== 0) {
      dirIdx = Math.random() > 0.5 ? 1 : 3;
    } else {
      dirIdx = Math.random() > 0.5 ? 0 : 2;
    }
  }

  let totalLength = 0;
  for (const s of segments) {
    totalLength += Math.abs(s.x2 - s.x1) + Math.abs(s.y2 - s.y1);
  }

  return {
    segments,
    totalLength,
    pulsePos: -Math.random() * totalLength,
    pulseSpeed: 0.5 + Math.random() * 1.5,
    pulseLength: 50 + Math.random() * 100,
    opacity: 0.1 + Math.random() * 0.18,
  };
}

function getPointOnTrace(
  trace: Trace,
  dist: number
): { x: number; y: number } | null {
  if (dist < 0 || dist > trace.totalLength) return null;

  let accumulated = 0;
  for (const seg of trace.segments) {
    const segLen = Math.abs(seg.x2 - seg.x1) + Math.abs(seg.y2 - seg.y1);
    if (accumulated + segLen >= dist) {
      const t = (dist - accumulated) / segLen;
      return {
        x: seg.x1 + (seg.x2 - seg.x1) * t,
        y: seg.y1 + (seg.y2 - seg.y1) * t,
      };
    }
    accumulated += segLen;
  }
  return null;
}

export default function MovingLights() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tracesRef = useRef<Trace[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const TRACE_COUNT = 22;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx!.scale(dpr, dpr);
      init();
    }

    function init() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const traces: Trace[] = [];

      // ~40% from center area, ~60% scattered across page
      for (let i = 0; i < TRACE_COUNT; i++) {
        traces.push(createTrace(w, h, i < TRACE_COUNT * 0.4));
      }
      tracesRef.current = traces;
    }

    function drawTrace(trace: Trace) {
      if (!ctx) return;

      // Draw faint static trace path
      ctx.beginPath();
      for (const seg of trace.segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.strokeStyle = `rgba(200, 225, 220, 0.035)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw small dots at corners
      for (const seg of trace.segments) {
        ctx.beginPath();
        ctx.arc(seg.x1, seg.y1, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 225, 220, 0.06)`;
        ctx.fill();
      }

      // Draw moving energy pulse along trace
      const pulseStart = trace.pulsePos;
      const steps = Math.ceil(trace.pulseLength / 2);

      for (let i = 0; i <= steps; i++) {
        const d = pulseStart + (i / steps) * trace.pulseLength;
        const p = getPointOnTrace(trace, d);
        if (!p) continue;

        const t = i / steps;
        const brightness = Math.sin(t * Math.PI);

        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 240, 235, ${brightness * trace.opacity})`;
        ctx.fill();
      }

      // Bright leading dot
      const leadPoint = getPointOnTrace(
        trace,
        trace.pulsePos + trace.pulseLength
      );
      if (leadPoint) {
        ctx.beginPath();
        ctx.arc(leadPoint.x, leadPoint.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 255, 250, ${trace.opacity * 1.8})`;
        ctx.fill();

        // Soft glow
        ctx.beginPath();
        ctx.arc(leadPoint.x, leadPoint.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 230, ${trace.opacity * 0.25})`;
        ctx.fill();
      }
    }

    function animate() {
      if (!canvas || !ctx) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      for (const trace of tracesRef.current) {
        drawTrace(trace);
        trace.pulsePos += trace.pulseSpeed;

        if (trace.pulsePos > trace.totalLength + trace.pulseLength) {
          trace.pulsePos = -trace.pulseLength;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    />
  );
}
