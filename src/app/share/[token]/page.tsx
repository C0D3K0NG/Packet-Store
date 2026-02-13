import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getPacketByShareToken } from "@/lib/packets";
import AuraBackground from "@/app/components/AuraBackground";

export default async function PublicPacketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const packet = await getPacketByShareToken(token);

  if (!packet) {
    notFound();
  }

  // Determine theme/style based on packet color mostly (or default to something nice)
  // Public view is simpler, maybe just "aurora" + "glass" style always, or derive from packet color?
  // Let's keep it simple: Aurora theme.

  const formattedDate = new Date(packet.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <AuraBackground theme="aurora" />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="mb-8 border-b border-white/5 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-4">
              {packet.title || "Untitled Packet"}
            </h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className={`px-2 py-0.5 rounded-full text-xs border ${packet.color === 'default' ? 'bg-zinc-800 border-zinc-700' :
                packet.color === 'teal' ? 'bg-teal-900/30 border-teal-700/30 text-teal-400' :
                  packet.color === 'purple' ? 'bg-violet-900/30 border-violet-700/30 text-violet-400' :
                    packet.color === 'amber' ? 'bg-amber-900/30 border-amber-700/30 text-amber-400' :
                      packet.color === 'rose' ? 'bg-rose-900/30 border-rose-700/30 text-rose-400' :
                        packet.color === 'blue' ? 'bg-blue-900/30 border-blue-700/30 text-blue-400' :
                          'bg-zinc-800 border-zinc-700'
                }`}>
                {packet.color}
              </span>
              <span>•</span>
              <time>{formattedDate}</time>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {packet.content ? (
              <ReactMarkdown
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  code({ node, inline, className, children, style, ...props }: { node?: unknown, inline?: boolean, className?: string, children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="relative group/code my-6">
                        <div className="absolute top-0 right-0 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded-bl-lg border-l border-b border-white/5">
                          {match[1]}
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.9rem", padding: "1.5rem" }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={`${className} bg-white/10 px-1 py-0.5 rounded text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  a: ({ node, ...props }) => (
                    <a className="text-teal-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {packet.content}
              </ReactMarkdown>
            ) : (
              <span className="text-zinc-500 italic">No content</span>
            )}
          </div>

          {/* Footer Branding */}
          <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <p>Shared via Packet Store</p>
            <Link href="/" className="hover:text-zinc-300 transition-colors">Create your own</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
