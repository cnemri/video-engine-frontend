"use client";

import React, { useState, useEffect } from 'react';
import { User, Box, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { AssetDetailSheet } from '@/components/assets/AssetDetailSheet';
import { useApi } from '@/lib/api';
import { StorageImage } from '@/components/StorageImage';

export default function AssetsPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params as any);
  const { fetch: apiFetch } = useApi();
  const [project, setProject] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [filter, setFilter] = useState<'all'|'character'|'object'|'location'>('all');

  const fetchProject = async () => {
      try {
          const res = await apiFetch(`/projects/${id}`);
          if (res.ok) setProject(await res.json());
      } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProject(); }, [id]);

  // Sync selectedAsset with updated project data to reflect regeneration changes
  useEffect(() => {
      if (selectedAsset && project?.asset_map && project?.report?.assets) {
          const updatedAssetData = project.asset_map[selectedAsset.id];
          if (updatedAssetData) {
              const originalAsset = project.report.assets.find((a: any) => a.id === selectedAsset.id);
              if (originalAsset) {
                   const fullAsset = { ...originalAsset, ...updatedAssetData };
                   if (fullAsset.local_path !== selectedAsset.local_path) {
                       setSelectedAsset(fullAsset);
                   }
              }
          }
      }
  }, [project, selectedAsset]);

  if (!project || !project.report) return <div className="p-8">Assets not yet defined. Run Detective & Planning steps first.</div>;

  const assets = project.report.assets || [];
  const generatedAssets = project.asset_map || {};
  const filteredAssets = assets.filter((a: any) => filter === 'all' || a.type === filter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-zinc-200 dark:border-white/5 px-6 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-4">
                <h1 className="font-semibold">Asset Studio</h1>
                <div className="h-4 w-px bg-zinc-300 dark:bg-white/10"></div>
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    {['all', 'character', 'object', 'location'].map(f => (
                        <button key={f} onClick={() => setFilter(f as any)} className={cn("px-3 py-1 rounded-md text-xs font-medium capitalize transition-all", filter === f ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300")}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <ModeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredAssets.map((asset: any) => {
                    const isGen = !!generatedAssets[asset.id];
                    // Merge report definition with generated result if it exists
                    const fullAsset = isGen ? { ...asset, ...generatedAssets[asset.id] } : asset;
                    const AssetIcon = asset.type === 'character' ? User : asset.type === 'object' ? Box : MapPin;
                    
                    return (
                        <button key={asset.id} onClick={() => setSelectedAsset(fullAsset)} className={cn("group relative aspect-square rounded-xl border transition-all overflow-hidden text-left", selectedAsset?.id === asset.id ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-zinc-200 dark:border-white/5 hover:border-indigo-500/50 bg-white dark:bg-zinc-900/50")}>
                            {isGen ? (
                                <StorageImage path={fullAsset.local_path} alt={asset.id} fill className="object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-2 bg-zinc-50 dark:bg-black/20">
                                    <AssetIcon className="w-8 h-8 opacity-20"/>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <div className="text-xs font-medium truncate">{asset.id}</div>
                                <div className="text-[10px] opacity-70 capitalize">{asset.type}</div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        {selectedAsset && (
            <AssetDetailSheet 
                pid={id} 
                asset={selectedAsset} 
                isGenerated={!!generatedAssets[selectedAsset.id]} 
                onClose={() => setSelectedAsset(null)}
                onUpdate={fetchProject}
            />
        )}
    </div>
  );
}