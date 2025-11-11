import React from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepCard({ label, status, isBusy, children }: { label: string, status: 'waiting'|'ready'|'done', isBusy: boolean, children?: React.ReactNode }) {
    return (
        <div className={cn("w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between", 
            status === 'done' ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
            status === 'ready' ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/10 shadow-sm text-zinc-900 dark:text-zinc-100" :
            "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-white/5 text-zinc-400 dark:text-zinc-600",
            isBusy && "border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500/20"
        )}>
            <div className="flex items-center gap-3">
                {isBusy ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-500"/> : 
                 status === 'done' ? <CheckCircle className="w-4 h-4"/> :
                 <div className={cn("w-4 h-4 rounded-full border-2", status === 'ready' ? "border-indigo-500" : "border-zinc-300 dark:border-zinc-700")}/>}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    )
}
