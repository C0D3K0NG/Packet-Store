"use client";

export default function AuraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Large misty white/cyan glow — upper right, like the reference */}
      <div
        className="aura-orb absolute -top-[10%] right-[5%] h-[700px] w-[800px] rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200, 230, 225, 0.18) 0%, rgba(160, 220, 210, 0.10) 40%, transparent 70%)",
          ["--float-duration" as string]: "20s",
        }}
      />

      {/* Secondary soft glow — center left, subtle */}
      <div
        className="aura-orb absolute top-[30%] -left-[10%] h-[500px] w-[600px] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(200, 220, 215, 0.08) 0%, transparent 60%)",
          ["--float-duration" as string]: "25s",
        }}
      />

      {/* Bottom subtle fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] blur-[80px]"
        style={{
          background:
            "linear-gradient(to top, rgba(180, 210, 200, 0.04) 0%, transparent 100%)",
        }}
      />

      {/* Very subtle noise/grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
