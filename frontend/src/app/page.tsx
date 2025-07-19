"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function Home() {
  const [stats, setStats] = useState({
    managed_domains: "-",
    subdomains_created: "-",
    requests_monitored: "-",
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/auth/stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300 relative overflow-hidden text-gray-800 font-sans">
      {/* Background visual com formas orgânicas - cores suavizadas */}
      <svg
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 320"
        fill="none"
      >
        <path
          fill="#86efac"
          fillOpacity="0.15"
          d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,133.3C1120,107,1280,85,1360,74.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
        ></path>
        <circle cx="200" cy="80" r="60" fill="#4ade80" fillOpacity="0.12" />
        <circle cx="1240" cy="220" r="80" fill="#86efac" fillOpacity="0.10" />
        <circle cx="900" cy="100" r="40" fill="#86efac" fillOpacity="0.10" />
      </svg>

      {/* Conteúdo Principal */}
      <div className="z-10 max-w-3xl w-full text-center px-6 py-12 rounded-3xl backdrop-blur-lg bg-white/20 shadow-xl border border-white/30">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-800 mb-4 tracking-tight">
          UNIATENDE TECHNOLOGY
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          Sistema inteligente para gerenciamento de domínios e
          subdomínios via Cloudflare.
        </p>

        {/* Botões */}
        <div className="flex justify-center gap-4 flex-wrap mb-10">
          <Link href="/login">
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-full shadow-md transition transform hover:scale-105 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3m0 0l4-4m-4 4l4 4m13-4v1a3 3 0 01-3 3h-1.5"
                />
              </svg>
              Entrar no Painel
            </button>
          </Link>
          <Link href="/demo-simple">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full shadow-md transition transform hover:scale-105 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Ver Demonstração
            </button>
          </Link>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.managed_domains}
            </div>
            <div>Domínios Gerenciados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.subdomains_created}
            </div>
            <div>Subdomínios Criados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.requests_monitored}
            </div>
            <div>Requisições Monitoradas</div>
          </div>
        </div>
      </div>

      <footer className="z-10 mt-10 text-gray-600 text-xs text-center">
        PowerBy - Unigate System
      </footer>
    </div>
  );
}
