"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Terminal, Tag, Palette, Download, Film, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { StepCard } from '@/components/dashboard/StepCard';
import { useApi } from '@/lib/api';
import { StorageImage } from '@/components/StorageImage';
import { StorageMedia } from '@/components/StorageMedia';
import { getStorageUrl } from '@/lib/storage';
import { UploadModal } from '@/components/dashboard/UploadModal';
import { VideoModal } from '@/components/dashboard/VideoModal';

const STEP_INFO: Record<string, { title: string, description: string, next: string, note?: string }> = {
    created: {
        title: "Project Created",
        description: "Upload source images to guide the AI, or skip to rely solely on your prompt.",
        next: "Ingest Files",
        note: "Only images are supported."
    },
    running_ingest: {
        title: "Ingesting Files...",
        description: "Processing your uploaded images and preparing them for analysis.",
        next: "Please wait..."
    },
    waiting_detective: {
        title: "Ingestion Complete",
        description: "The AI will now analyze your prompt and assets to generate a creative brief.",
        next: "Detective Analysis"
    },
    running_detective: {
        title: "Detective Analysis in Progress...",
        description: "The AI is analyzing your prompt and assets to generate a creative brief.",
        next: "Please wait..."
    },
    waiting_planning: {
        title: "Analysis Complete",
        description: "The Director AI will plan the video timeline, shots, and narration.",
        next: "Planning Director"
    },
    running_planning: {
        title: "Planning in Progress...",
        description: "The Director AI is crafting the video timeline and shots.",
        next: "Please wait..."
    },
    waiting_assets: {
        title: "Planning Complete",
        description: "Generate or extract the final visual assets (characters, locations) for the video.",
        next: "Asset Studio"
    },
    running_assets: {
        title: "Generating Assets...",
        description: "Creating and extracting the visual assets for your video.",
        next: "Please wait..."
    },
    waiting_anchors: {
        title: "Assets Ready",
        description: "Generate the key visual frames (anchors) for each shot in the timeline.",
        next: "Anchor Generation"
    },
    running_anchors: {
        title: "Generating Anchors...",
        description: "Creating the key visual frames for each shot.",
        next: "Please wait..."
    },
    waiting_production: {
        title: "Anchors Ready",
        description: "Generate the actual video clips using Veo and narration audio.",
        next: "Production"
    },
    running_production: {
        title: "Production in Progress...",
        description: "Generating video clips with Veo and rendering audio.",
        next: "Please wait..."
    },
    waiting_assembly: {
        title: "Production Complete",
        description: "Stitch everything together into the final video file.",
        next: "Final Assembly"
    },
    running_assembly: {
        title: "Assembling Video...",
        description: "Stitching clips and audio into the final result.",
        next: "Please wait..."
    },
    completed: {
        title: "Project Complete",
        description: "Your video is ready! You can download it or regenerate specific parts.",
        next: "Done"
    },
    failed: {
        title: "Project Failed",
        description: "Something went wrong. Check the logs for details.",
        next: "Retry"
    }
};

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params as any);
  const { fetch: apiFetch } = useApi();
  const [project, setProject] = useState<any>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [finalDownloadUrl, setFinalDownloadUrl] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fetchProject = async () => {
    try {
        const res = await apiFetch(`/projects/${id}`);
        if (res.ok) {
            const data = await res.json();
            setProject(data);
            if (data.logs) setLogs(data.logs);
            setIsBusy(data.status === 'running');
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchProject();
    const interval = setInterval(fetchProject, 1000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs.length]);

  useEffect(() => {
      if (project?.status === 'completed' && project?.result?.url) {
          getStorageUrl(project.result.url).then(setFinalDownloadUrl);
      }
  }, [project?.status, project?.result?.url]);

  const runStep = async (step: string) => {
    setIsBusy(true);
    await apiFetch(`/projects/${id}/step/${step}`, { method: 'POST' });
  };

  const handleUpload = async (file: File, description: string) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("description", description);
    await apiFetch(`/projects/${id}/upload`, { method: 'POST', body: formData });
    fetchProject();
  };

  if (!project) return <div className="p-8">Loading...</div>;

  const canRun = (requiredStatus: string) => !isBusy && project.status === requiredStatus;
  
  let infoKey = project.status;
  if (project.status === 'running' && project.current_step) {
      infoKey = `running_${project.current_step}`;
  }
  const currentInfo = STEP_INFO[infoKey] || STEP_INFO['created'];

  const ActionButton = ({ onClick, disabled, children, variant = 'primary' }: any) => (
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }} 
            disabled={disabled}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                disabled ? "opacity-50 cursor-not-allowed" : "",
                variant === 'primary' ? "bg-indigo-600 hover:bg-indigo-500 text-white" : 
                "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            )}
        >
            {children}
        </button>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-zinc-200 dark:border-white/5 px-6 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex-shrink-0">
            <h1 className="font-semibold">{project.name}</h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-mono">
                    <div className={cn("w-2 h-2 rounded-full", isBusy ? "bg-amber-500 animate-pulse" : project.status === 'completed' ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600")} />
                    <span className="uppercase text-zinc-500">{project.status}</span>
                </div>
                <div className="h-4 w-px bg-zinc-300 dark:bg-white/10"></div>
                <ModeToggle />
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-6">
                {/* Final Video Banner */}
                {project.result?.url && (
                    <div className="col-span-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Film className="w-6 h-6"/>
                            </div>
                            <div>
                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Final Video Ready</h3>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">Assembly complete. Your video is ready to watch.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsVideoModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition flex items-center gap-2">
                                <Play className="w-4 h-4"/> Watch Now
                            </button>
                            {finalDownloadUrl && (
                                <a href={finalDownloadUrl} download className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md text-sm font-medium transition flex items-center gap-2">
                                    <Download className="w-4 h-4"/> Download
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Workflow Steps */}
                <div className="col-span-1 space-y-4">
                    <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Workflow</h2>
                    <div className="space-y-2">
                        <StepCard label="1. Ingest Files" status={project.potential_assets?.length > 0 ? 'done' : 'ready'} isBusy={isBusy && project.current_step === 'ingest'}>
                            <div className="flex gap-2">
                                <ActionButton onClick={() => runStep('ingest')} disabled={isBusy}>Ingest</ActionButton>
                                <ActionButton onClick={() => runStep('ingest')} disabled={isBusy} variant="secondary">Skip</ActionButton>
                            </div>
                        </StepCard>
                        
                        <StepCard label="2. Detective Analysis" status={project.report ? 'done' : canRun('waiting_detective') ? 'ready' : 'waiting'} isBusy={isBusy && project.current_step === 'detective'}>
                            <ActionButton onClick={() => runStep('detective')} disabled={!canRun('waiting_detective') && !project.report}>
                                {project.report ? 'Regenerate' : 'Generate'}
                            </ActionButton>
                        </StepCard>

                        <StepCard label="3. Planning Director" status={project.manifest ? 'done' : canRun('waiting_planning') ? 'ready' : 'waiting'} isBusy={isBusy && project.current_step === 'planning'}>
                            <ActionButton onClick={() => runStep('planning')} disabled={!canRun('waiting_planning') && !project.manifest}>
                                {project.manifest ? 'Regenerate' : 'Generate'}
                            </ActionButton>
                        </StepCard>

                        <StepCard label="4. Asset Studio" status={Object.keys(project.asset_map || {}).length > 0 ? 'done' : canRun('waiting_assets') ? 'ready' : 'waiting'} isBusy={isBusy && project.current_step === 'assets'}>
                            <ActionButton onClick={() => runStep('assets')} disabled={!canRun('waiting_assets') && Object.keys(project.asset_map || {}).length === 0}>
                                {Object.keys(project.asset_map || {}).length > 0 ? 'Regenerate' : 'Generate'}
                            </ActionButton>
                        </StepCard>

                        <StepCard label="5. Anchor Generation" status={Object.keys(project.anchor_map || {}).length > 0 ? 'done' : canRun('waiting_anchors') ? 'ready' : 'waiting'} isBusy={isBusy && project.current_step === 'anchors'}>
                            <ActionButton onClick={() => runStep('anchors')} disabled={!canRun('waiting_anchors') && Object.keys(project.anchor_map || {}).length === 0}>
                                {Object.keys(project.anchor_map || {}).length > 0 ? 'Regenerate' : 'Generate'}
                            </ActionButton>
                        </StepCard>

                        <StepCard label="6. Production (Veo/TTS)" status={Object.keys(project.video_map || {}).length > 0 ? 'done' : canRun('waiting_production') ? 'ready' : 'waiting'} isBusy={isBusy && project.current_step === 'production'}>
                            <ActionButton onClick={() => runStep('production')} disabled={!canRun('waiting_production') && Object.keys(project.video_map || {}).length === 0}>
                                {Object.keys(project.video_map || {}).length > 0 ? 'Regenerate' : 'Generate'}
                            </ActionButton>
                        </StepCard>

                        <StepCard label="7. Final Assembly" status={project.status === 'completed' ? 'done' : canRun('waiting_assembly') ? 'ready' : 'waiting'} isBusy={isBusy && project.current_step === 'assembly'}>
                            <ActionButton onClick={() => runStep('assembly')} disabled={!canRun('waiting_assembly') && project.status !== 'completed'}>
                                {project.status === 'completed' ? 'Regenerate' : 'Generate'}
                            </ActionButton>
                        </StepCard>
                    </div>
                </div>

                {/* Project Info & Upload */}
                <div className="col-span-2 space-y-6">
                    {/* INFO CARD */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">{currentInfo.title}</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">{currentInfo.description}</p>
                        {currentInfo.note && (
                            <div className="text-xs bg-white dark:bg-indigo-950/50 px-3 py-2 rounded-md border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4 inline-block">
                                Note: {currentInfo.note}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm font-medium text-indigo-800 dark:text-indigo-200">
                            Next Step: <span className="bg-white dark:bg-indigo-950 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800">{currentInfo.next}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">Project Prompt</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">{project.prompt}</p>
                        </div>
                        {project.report && (
                            <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-white/5">
                                <div>
                                    <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1 flex items-center gap-1"><Tag className="w-3 h-3"/> Category</h4>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 capitalize">
                                        {project.report.category.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1 flex items-center gap-1"><Palette className="w-3 h-3"/> Visual Style</h4>
                                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{project.report.visual_style}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Source Files</h3>
                            <button onClick={() => setIsUploadModalOpen(true)} className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-md transition flex items-center gap-2">
                                <Upload className="w-3 h-3"/> + Add Asset
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {project.file_paths.map((item: any, i: number) => {
                                const path = typeof item === 'string' ? item : item.path;
                                const desc = typeof item === 'string' ? null : item.description;
                                return (
                                    <div key={i} className="relative aspect-square bg-zinc-100 dark:bg-black/20 rounded-md border border-zinc-200 dark:border-white/5 overflow-hidden group">
                                        <StorageImage path={path} alt={`Upload ${i}`} fill className="object-cover" />
                                        {desc && (
                                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/70 text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                {desc}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {project.file_paths.length === 0 && <div className="col-span-4 text-center text-sm text-zinc-500 dark:text-zinc-500 py-4">No files uploaded yet.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
        <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoPath={project?.result?.url} downloadUrl={finalDownloadUrl} />

        {/* Logs */}
        <div className="h-48 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/5 flex flex-col flex-shrink-0">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-white/5 flex items-center gap-2"><Terminal className="w-4 h-4 text-zinc-500" /><span className="text-xs font-medium text-zinc-500 uppercase">Logs</span></div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                {logs.map((log, i) => <div key={i} className="opacity-80">{log}</div>)}
                <div ref={logEndRef} />
            </div>
        </div>
    </div>
  );
}
