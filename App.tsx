import { useQuery } from '@tanstack/react-query';
import { getPieces } from './lib/pieces';
import Hero from './components/Hero';
import Rail from './components/Rail';

export default function App() {
  const { data, isPending, error } = useQuery({
    queryKey: ['pieces'],
    queryFn: getPieces,
    staleTime: 300_000,
  });

  return (
    // Desktop: fixed text sidebar on the left, scrollable grid on the right.
    // Mobile: the two stack (Hero on top, grid below).
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[40rem_1fr]">
      <Hero />

      <main className="px-4 pb-24 sm:px-6 lg:pt-10">
        {isPending && (
          <p className="py-16 text-center text-sm text-steel-deep">
            Wheeling out the rack…
          </p>
        )}

        {error && (
          <p className="py-16 text-center text-sm text-steel-deep">
            The rail&apos;s being restocked — check back shortly.
          </p>
        )}

        {data &&
          (data.length > 0 ? (
            <Rail pieces={data} />
          ) : (
            <p className="py-16 text-center text-sm text-steel-deep">
              Pieces are being shot and tagged — come back soon.
            </p>
          ))}
      </main>
    </div>
  );
}
