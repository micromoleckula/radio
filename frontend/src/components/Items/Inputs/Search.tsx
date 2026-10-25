export const InputSearch = () => {
  return (
    <form className="flex items-center gap-2" role="search">
      <input
        type="search"
        name="search"
        aria-label="Search music"
        placeholder="What do you want to play?"
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
