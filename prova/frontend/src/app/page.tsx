import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
       
        <h1 className="mt-4 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
          LUIS FELIPE RODRIGUES FREIRE
        </h1>
        
        <Link
          href="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Ir para o login
        </Link>
      </main>
    </div>
  );
}
