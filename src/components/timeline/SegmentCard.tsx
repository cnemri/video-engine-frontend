import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Image as ImageIcon, Film, ChevronDown, ChevronUp, ArrowRight, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/api';
import { StorageImage } from '@/components/StorageImage';
import { StorageMedia } from '@/components/StorageMedia';

export function SegmentCard({ pid, segment, index, onUpdate }: { pid: string, segment: any, index: number, onUpdate: () => void }) {
    const { fetch: apiFetch } = useApi();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRegening, setIsRegening] = useState<string|null>(null);
    const prevPaths = useRef<{ [key: string]: string | undefined }>({});

    // Use paths passed from parent (which come from backend map)
    const startAnchorPath = segment.anchor_start_path;
    const endAnchorPath = segment.anchor_end_path;
    const videoPath = segment.video_path;
    const audioPath = segment.audio_path;

    const hasStart = !!startAnchorPath;
    const hasEnd = !!endAnchorPath;
    const hasVideo = !!videoPath;
    const hasAudio = !!audioPath;

    const handleRegen = async (type: string, subtype?: string) => {
        const key = `${type}${subtype ? '_' + subtype : ''}`;
        
        // Store current path before regen
        if (key === 'anchor_start') prevPaths.current[key] = startAnchorPath;
        else if (key === 'anchor_end') prevPaths.current[key] = endAnchorPath;
        else if (key === 'video') prevPaths.current[key] = videoPath;
        else if (key === 'tts') prevPaths.current[key] = audioPath;

        setIsRegening(key);
        
        let url = `/projects/${pid}/segments/${segment.id}/${type}/regenerate`;
        if (type === 'anchor') url = `/projects/${pid}/segments/${segment.id}/anchor/${subtype}/regenerate`;
        
        await apiFetch(url, { method: 'POST' });
        
        // Safety timeout
        setTimeout(() => setIsRegening(null), 60000);
    };

    // Polling effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRegening) {
            interval = setInterval(onUpdate, 2000);
        }
        return () => clearInterval(interval);
    }, [isRegening, onUpdate]);

    // Completion check effect
    useEffect(() => {
        if (!isRegening) return;

        let currentPath = undefined;
        if (isRegening === 'anchor_start') currentPath = startAnchorPath;
        else if (isRegening === 'anchor_end') currentPath = endAnchorPath;
        else if (isRegening === 'video') currentPath = videoPath;
        else if (isRegening === 'tts') currentPath = audioPath;

        // If path has changed, stop regenerating
        if (currentPath !== prevPaths.current[isRegening]) {
            setIsRegening(null);
        }
    }, [startAnchorPath, endAnchorPath, videoPath, audioPath, isRegening]);

    return (
        <div className={cn("bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl overflow-hidden transition-all", isExpanded ? "shadow-lg ring-1 ring-indigo-500/10" : "hover:shadow-md")}>
            {/* Header / Summary View */}
            <div className="p-4 flex gap-4 items-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-mono font-medium text-zinc-500">
                    {index + 1}
                </div>
                
                {/* Thumbnail */}
                <div className="w-24 aspect-video bg-zinc-100 dark:bg-black/20 rounded-md border border-zinc-200 dark:border-white/10 overflow-hidden relative flex-shrink-0">
                    {hasStart ? (
                        <StorageImage path={startAnchorPath} alt="Start" fill className="object-cover" />
                    ) : (
                        <ImageIcon className="w-6 h-6 text-zinc-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md font-medium", segment.mode === 'i2v' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400")}>
                            {segment.mode}
                        </span>
                        <span className="text-xs text-zinc-500">{segment.duration}s</span>
                    </div>
                    <p className="text-sm font-medium truncate">{segment.veo_prompt}</p>
                </div>

                <div className="flex items-center gap-3">
                     <div className="flex gap-1">
                        <div className={cn("w-2 h-2 rounded-full", hasStart ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700")} title="Start Anchor"/>
                        {segment.mode === 'fi' && <div className={cn("w-2 h-2 rounded-full", hasEnd ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700")} title="End Anchor"/>}
                        <div className={cn("w-2 h-2 rounded-full", hasVideo ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700")} title="Video"/>
                        <div className={cn("w-2 h-2 rounded-full", hasAudio ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700")} title="Audio"/>
                     </div>
                     <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500"/> : <ChevronDown className="w-4 h-4 text-zinc-500"/>}
                     </button>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="p-6 border-t border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 space-y-6">
                    
                    {/* Row 1: Visual Flow (Anchors -> Video) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Anchors Section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-medium text-zinc-500 uppercase flex items-center justify-between">
                                Visual Anchors
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleRegen('anchor', 'start'); }} disabled={!!isRegening} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition" title="Regen Start"><RefreshCw className={cn("w-3 h-3", isRegening === 'anchor_start' && "animate-spin")}/></button>
                                    {segment.mode === 'fi' && <button onClick={(e) => { e.stopPropagation(); handleRegen('anchor', 'end'); }} disabled={!!isRegening} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition" title="Regen End"><RefreshCw className={cn("w-3 h-3", isRegening === 'anchor_end' && "animate-spin")}/></button>}
                                </div>
                            </h4>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 aspect-video bg-zinc-100 dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden relative shadow-sm">
                                    {hasStart ? <StorageImage path={startAnchorPath} alt="Start" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs">Start Missing</div>}
                                    {isRegening === 'anchor_start' && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-20"><RefreshCw className="w-6 h-6 text-indigo-600 animate-spin"/></div>}
                                </div>
                                {segment.mode === 'fi' && (
                                    <>
                                        <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0"/>
                                        <div className="flex-1 aspect-video bg-zinc-100 dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden relative shadow-sm">
                                            {hasEnd ? <StorageImage path={endAnchorPath} alt="End" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs">End Missing</div>}
                                            {isRegening === 'anchor_end' && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-20"><RefreshCw className="w-6 h-6 text-indigo-600 animate-spin"/></div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Video Section (Takes 2 columns if possible) */}
                        <div className="lg:col-span-2 space-y-3">
                             <h4 className="text-xs font-medium text-zinc-500 uppercase flex items-center justify-between">
                                Generated Video
                                <button onClick={(e) => { e.stopPropagation(); handleRegen('video'); }} disabled={!!isRegening} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition flex items-center gap-1 text-xs font-medium">
                                    <RefreshCw className={cn("w-3 h-3", isRegening === 'video' && "animate-spin")}/> {isRegening === 'video' ? 'Regenerating...' : 'Regenerate Video'}
                                </button>
                            </h4>
                            <div className="aspect-video bg-zinc-950 rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden relative shadow-md flex items-center justify-center">
                                {hasVideo ? (
                                    <StorageMedia path={videoPath} type="video" controls className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-500 gap-2">
                                        <Film className="w-8 h-8 opacity-50"/>
                                        <span className="text-xs">Not Generated Yet</span>
                                    </div>
                                )}
                                {isRegening === 'video' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-20"><RefreshCw className="w-8 h-8 text-white animate-spin"/></div>}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Details & Audio */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-zinc-200 dark:border-white/5">
                        <div className="lg:col-span-2 space-y-2">
                            <h4 className="text-xs font-medium text-zinc-500 uppercase">Video Prompt</h4>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-white/10">
                                {segment.veo_prompt}
                            </p>
                        </div>
                        <div className="space-y-2">
                             <h4 className="text-xs font-medium text-zinc-500 uppercase flex items-center justify-between">
                                Narration
                                <button onClick={(e) => { e.stopPropagation(); handleRegen('tts'); }} disabled={!!isRegening} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition"><RefreshCw className={cn("w-3 h-3", isRegening === 'tts' && "animate-spin")}/></button>
                            </h4>
                            {segment.narration ? (
                                <div className="bg-white dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-white/10 space-y-3 relative">
                                    <p className="text-sm italic text-zinc-600 dark:text-zinc-400">"{segment.narration}"</p>
                                    {hasAudio ? (
                                        <StorageMedia path={audioPath} type="audio" controls className="w-full h-8" />
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500">
                                            <Mic className="w-3 h-3"/> Audio missing
                                        </div>
                                    )}
                                    {isRegening === 'tts' && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-20 rounded-lg"><RefreshCw className="w-6 h-6 text-indigo-600 animate-spin"/></div>}
                                </div>
                            ) : (
                                <div className="text-xs text-zinc-400 italic p-3">No narration for this segment.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
