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
      className="flex items-center gap-2"
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
        className="w-80 rounded-full bg-zinc-800 px-4 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <button
        className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
        type="submit"
      >
        Search
      </button>
    </form>
  );
};
