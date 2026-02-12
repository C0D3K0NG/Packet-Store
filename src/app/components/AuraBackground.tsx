"use client";

interface AuraBackgroundProps {
  theme: "aurora" | "neon" | "velvet" | "ocean" | "sunset" | "matrix" | "monochrome";
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

  if (theme === "ocean") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#000810]">
        {/* Deep Sea Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-blue-950/10 to-[#000810]" />

        {/* Light Shafts */}
        <div className="absolute -top-[20%] right-[10%] w-[400px] h-[800px] bg-sky-500/10 blur-[100px] rotate-[-20deg]" />
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[600px] bg-teal-500/10 blur-[120px] rotate-[15deg]" />

        {/* Floating Particles (Static representation) */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>
    );
  }

  if (theme === "sunset") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0f0505]">
        {/* Warm Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-purple-950/20 to-[#0f0505]" />

        {/* Sun Glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-orange-600/10 blur-[150px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-800/10 blur-[150px]" />
      </div>
    );
  }

  if (theme === "matrix") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#000500]">
        {/* Digital Rain Effect ( simplified as vertical lines ) */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/20 to-transparent" />
      </div>
    );
  }

  if (theme === "monochrome") {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#000000]">
        {/* Pure minimalist noise */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.99' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Subtle gray glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[200px]" />
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
