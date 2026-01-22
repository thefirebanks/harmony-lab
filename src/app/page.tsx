/**
 * Harmony Lab Home Page
 * Game selector
 */

import Link from 'next/link';

export default function Home() {
  const games = [
    {
      id: 'tonic-target',
      name: 'Tonic Target Practice',
      description: 'Build ii-V-I progressions in random keys to develop functional harmony intuition.',
      status: 'available' as const,
    },
    {
      id: 'chord-crush',
      name: 'Chord Crush Clone',
      description: 'Identify the missing chord in a progression.',
      status: 'coming-soon' as const,
    },
    {
      id: 'modal-interchange',
      name: 'Modal Interchange Spotter',
      description: 'Identify borrowed chords from parallel modes.',
      status: 'coming-soon' as const,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--text-muted)]/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Harmony Lab</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Music practice games for building functional harmony intuition
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Games</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200
                ${game.status === 'available'
                  ? 'bg-[var(--background-elevated)] border-[var(--text-muted)]/20 hover:border-[var(--accent)]/50 hover:bg-[var(--background-hover)]'
                  : 'bg-[var(--background-elevated)]/50 border-[var(--text-muted)]/10 opacity-60'
                }
              `}
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {game.name}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                {game.description}
              </p>
              
              {game.status === 'available' ? (
                <Link
                  href={`/games/${game.id}`}
                  className="inline-block px-4 py-2 bg-[var(--accent)] text-[var(--background)] font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Play
                </Link>
              ) : (
                <span className="inline-block px-4 py-2 bg-[var(--background-hover)] text-[var(--text-muted)] font-medium rounded-lg">
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--text-muted)]/10 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-[var(--text-muted)] text-sm">
          Harmony Lab - Build your harmonic intuition
        </div>
      </footer>
    </div>
  );
}
