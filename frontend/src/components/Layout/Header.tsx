"use client";

import { useAuth } from "@/contexts/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 bg-white px-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.first_name || user.email} width={32} height={32} className="rounded-full" />
            ) : (
              <Image src="/images/iconeuniatende.png" alt="Avatar padrão" width={32} height={32} className="rounded-full" style={{ height: 'auto' }} />
            )}
            <span className="text-gray-700 font-medium">
              {user.first_name || user.email}
            </span>
          </div>
        )}
        {/* Futuramente, um menu de dropdown para perfil/logout */}
      </div>
    </header>
  );
}
