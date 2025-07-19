
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, User2, Users, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  userRole: string;
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/dashboard/tenants', icon: Users },
    ...(userRole === 'admin'
      ? [{ name: 'Usuários', href: '/admin/users', icon: User2 }]
      : []),
  ];

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} p-4`}>
      <div className="flex items-center justify-between h-16 mb-4">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {!collapsed && (
          <Image src="/images/iconeuniatende.png" alt="Logo Unigate" width={36} height={36} className="ml-2" />
        )}
      </div>
      <nav className="flex-grow">
        <ul>
          {navigation.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg transition-colors duration-200
                  ${pathname === item.href
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white'
                  }
                `}
              >
                <item.icon className="h-6 w-6 mr-3" />
                {!collapsed && item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Botão de sair no rodapé */}
      {!collapsed && (
        <button
          onClick={logout}
          className="flex items-center gap-2 mt-4 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors w-full justify-center"
          style={{ marginTop: 'auto' }}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      )}
    </div>
  );
};

export default Sidebar;
