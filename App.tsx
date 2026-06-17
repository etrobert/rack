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
    <div className="min-h-full">
      <Hero />

      {isPending && (
        <p className="px-6 pb-24 text-center text-sm text-steel-deep">
          Wheeling out the rack…
        </p>
      )}

      {error && (
        <p className="px-6 pb-24 text-center text-sm text-steel-deep">
          The rail&apos;s being restocked — check back shortly.
        </p>
      )}

      {data &&
        (data.length > 0 ? (
          <Rail pieces={data} />
        ) : (
          <p className="px-6 pb-24 text-center text-sm text-steel-deep">
            Pieces are being shot and tagged — come back soon.
          </p>
        ))}
    </div>
  );
}
