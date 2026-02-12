"use client";

interface AuraBackgroundProps {
  theme: "aurora" | "neon" | "velvet";
}

export default function AuraBackground({ theme }: AuraBackgroundProps) {
  if (theme === "neon") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 100%)"
          }}
        />

        {/* Retro Sun / Glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-cyan-900/10 to-transparent" />
      </div>
    );
  }

  if (theme === "velvet") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0505]">
        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.07] z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Deep, Rich Orbs */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-rose-900/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[120px]" />
      </div>
    );
  }

  // Default: Aurora
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Large misty white/cyan glow — upper right */}
      <div
        className="absolute -top-[10%] right-[5%] h-[700px] w-[800px] rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)",
        }}
      />

      {/* Secondary soft glow — center left */}
      <div
        className="absolute top-[30%] -left-[10%] h-[500px] w-[600px] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 60%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
