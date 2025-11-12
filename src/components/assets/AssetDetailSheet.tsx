import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Save, X, User, Box, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/api';
import { StorageImage } from '@/components/StorageImage';

export function AssetDetailSheet({ pid, asset, isGenerated, onClose, onUpdate }: { pid: string, asset: any, isGenerated: boolean, onClose: () => void, onUpdate: () => void }) {
    const { fetch: apiFetch } = useApi();
    const [editedAsset, setEditedAsset] = useState(asset);
    const [isSaving, setIsSaving] = useState(false);
    const [isRegening, setIsRegening] = useState(false);
    const previousPathRef = useRef(asset.local_path);
    const AssetIcon = asset.type === 'character' ? User : asset.type === 'object' ? Box : MapPin;

    useEffect(() => setEditedAsset(asset), [asset]);

    const handleSave = async () => {
        setIsSaving(true);
        await apiFetch(`/projects/${pid}/assets/${asset.id}/update`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedAsset)
        });
        setIsSaving(false);
        onUpdate();
    };

    const handleRegen = async () => {
        await handleSave();
        previousPathRef.current = asset.local_path;
        setIsRegening(true);
        await apiFetch(`/projects/${pid}/assets/${asset.id}/regenerate`, { method: 'POST' });
        
        // Safety timeout (60s) in case polling fails or backend errors
        setTimeout(() => setIsRegening(false), 60000);
    };

    // Poll for updates while regenerating
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRegening) {
            interval = setInterval(onUpdate, 2000);
        }
        return () => clearInterval(interval);
    }, [isRegening, onUpdate]);

    // Stop regenerating when path changes
    useEffect(() => {
        if (isRegening && asset.local_path !== previousPathRef.current) {
            setIsRegening(false);
        }
    }, [asset.local_path, isRegening]);

    return (
        <div className="w-96 border-l border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto absolute right-0 top-0 bottom-0 z-10 shadow-xl">
            <div className="h-14 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 flex-shrink-0">
                <h3 className="font-medium truncate pr-4">{asset.name || asset.id}</h3>
                <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition flex-shrink-0"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 space-y-6 flex-1">
                <div className="aspect-square relative bg-zinc-100 dark:bg-black/20 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/5 flex items-center justify-center">
                     {isGenerated && asset.local_path ? (
                        <StorageImage path={asset.local_path} alt={asset.id} fill className="object-cover" />
                     ) : (
                        <div className="flex flex-col items-center text-zinc-400 gap-2">
                            <AssetIcon className="w-12 h-12 opacity-20"/>
                            <span className="text-xs uppercase tracking-wider">Not Generated Yet</span>
                        </div>
                     )}
                     
                     {/* Loading Overlay */}
                     {isRegening && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
                            <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin"/>
                        </div>
                     )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase">Name</label>
                        <input type="text" className="w-full mt-1 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md p-2 text-sm outline-none focus:border-indigo-500" value={editedAsset.name || ""} onChange={e => setEditedAsset({...editedAsset, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase">Description</label>
                        <textarea className="w-full mt-1 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md p-2 text-sm resize-none outline-none focus:border-indigo-500" rows={3} value={editedAsset.description} onChange={e => setEditedAsset({...editedAsset, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase">Visual Prompt (Generator)</label>
                        <textarea className="w-full mt-1 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md p-2 text-sm resize-none outline-none focus:border-indigo-500" rows={6} value={editedAsset.visual_prompt || ""} onChange={e => setEditedAsset({...editedAsset, visual_prompt: e.target.value})} />
                    </div>
                    {asset.type === 'character' && (
                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase">Voice Style</label>
                            <input type="text" className="w-full mt-1 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md p-2 text-sm outline-none focus:border-indigo-500" value={editedAsset.voice_style || ""} onChange={e => setEditedAsset({...editedAsset, voice_style: e.target.value})} />
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-white/5 flex gap-2 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
                    <Save className="w-4 h-4"/> Save
                </button>
                <button onClick={handleRegen} disabled={isRegening} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition">
                    <RefreshCw className={cn("w-4 h-4", isRegening && "animate-spin")}/> {isRegening ? 'Regenerating...' : 'Regenerate'}
                </button>
            </div>
        </div>
    );
}