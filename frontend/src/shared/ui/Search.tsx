import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const InputSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(routeQuery);

  useEffect(() => {
    setQuery(routeQuery);
  }, [routeQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = query.trim();
    void navigate(
      search ? `/search?q=${encodeURIComponent(search)}` : "/search",
    );
  };

  return (
    <form
      className="flex min-w-0 flex-1 items-center gap-2"
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        type="search"
        name="search"
        aria-label="Search music"
        placeholder="What do you want to play?"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        className="w-full max-w-md rounded-full border border-white-6 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
      />
      <button
        className="rounded-full px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        type="submit"
      >
        Search
      </button>
    </form>
  );
};
