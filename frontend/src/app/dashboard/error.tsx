"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    if (
      error?.message?.toLowerCase().includes("token") ||
      error?.message?.toLowerCase().includes("autorização") ||
      error?.message?.toLowerCase().includes("authorization")
    ) {
      // Redireciona para login se o erro for de token
      router.replace("/login");
    }
  }, [error, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Ocorreu um erro</h2>
      <p className="mb-2 text-red-600">{error.message}</p>
      <button
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => reset()}
      >
        Tentar novamente
      </button>
    </div>
  );
} 