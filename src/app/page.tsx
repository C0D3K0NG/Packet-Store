import AuraBackground from "./components/AuraBackground";
import MovingLights from "./components/MovingLights";
import RequestAccessForm from "./components/RequestAccessForm";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background layers */}
      <AuraBackground />
      <MovingLights />

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto gap-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
          </span>
          Invite-only access
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.1] bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
          Your packets,
          <br />
          secured.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-md leading-relaxed -mt-2">
          A private space for your thoughts, notes, and fragments.
          <br className="hidden sm:block" />
          Request access to step inside.
        </p>

        {/* Form */}
        <div className="w-full mt-2">
          <RequestAccessForm />
        </div>

        {/* Footer hint */}
        <p className="text-xs text-zinc-600 mt-4">
          No passwords. No OAuth. Just a verified invitation.
        </p>
      </main>

      {/* Bottom fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </div>
  );
}
