import { TopBar } from "@/components/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="mx-auto flex min-h-[60vh] max-w-[640px] items-center justify-center px-6">
        <h1 className="text-2xl font-medium">Swaad is alive</h1>
      </main>
    </>
  );
}
