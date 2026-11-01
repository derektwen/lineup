// This file is the home page: whatever this function returns is what
// someone sees at the app's main address (for example lineup.vercel.app/).
// For now it's a placeholder; it becomes the friends feed later.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6">
      <h1 className="text-4xl font-bold tracking-tight">
        lineup<span className="text-[#C8F560]">.</span>
      </h1>
      <p className="text-lg text-[#C9C9CF]">
        See which shows your friends are going to.
      </p>
      <p className="text-sm text-[#8A8A93]">Coming soon.</p>
    </main>
  );
}
