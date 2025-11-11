"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Film, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectLayout({ children, params }: { children: React.ReactNode, params: any }) {
  const pathname = usePathname();
  const { id } = React.use(params);

  const links = [
    { href: `/project/${id}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/project/${id}/assets`, label: 'Assets', icon: Users },
    { href: `/project/${id}/timeline`, label: 'Timeline', icon: Film },
  ];

  return (
    <div className="h-screen w-screen flex bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/5 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-zinc-200 dark:border-white/5 flex-shrink-0">
            <Link href="/" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4"/> All Projects
            </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map(link => (
                <Link key={link.href} href={link.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", pathname.startsWith(link.href) ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200")}>
                    <link.icon className="w-4 h-4"/>
                    {link.label}
                </Link>
            ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}