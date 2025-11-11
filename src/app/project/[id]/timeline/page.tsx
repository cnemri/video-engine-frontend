"use client";

import React, { useState, useEffect } from 'react';
import { Play, Download } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { SegmentCard } from '@/components/timeline/SegmentCard';
import { useApi } from '@/lib/api';
import { getStorageUrl } from '@/lib/storage';

export default function TimelinePage({ params }: { params: { id: string } }) {
  const { id } = React.use(params as any);
  const { fetch: apiFetch } = useApi();
  const [project, setProject] = useState<any>(null);
  const [finalDownloadUrl, setFinalDownloadUrl] = useState<string | null>(null);

  const fetchProject = async () => {
      try {
          const res = await apiFetch(`/projects/${id}`);
          if (res.ok) setProject(await res.json());
      } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProject(); }, [id]);

  useEffect(() => {
      if (project?.status === 'completed' && project?.result?.url) {
          getStorageUrl(project.result.url).then(setFinalDownloadUrl);
      }
  }, [project?.status, project?.result?.url]);

  if (!project || !project.manifest) return <div className="p-8">Timeline not yet created. Run Planning step first.</div>;

  const timeline = project.manifest.timeline || [];

  // Enrich timeline with generation status and paths
  const enrichedTimeline = timeline.map((seg: any) => ({
      ...seg,
      anchor_start_path: project.anchor_map?.[`${seg.id}_start`],
      anchor_end_path: project.anchor_map?.[`${seg.id}_end`],
      video_path: project.video_map?.[seg.id],
      audio_path: project.audio_map?.[seg.id],
      anchor_start_gen: !!project.anchor_map?.[`${seg.id}_start`],
      anchor_end_gen: !!project.anchor_map?.[`${seg.id}_end`],
      video_gen: !!project.video_map?.[seg.id],
      audio_gen: !!project.audio_map?.[seg.id],
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-zinc-200 dark:border-white/5 px-6 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex-shrink-0">
             <div className="flex items-center gap-4">
                <h1 className="font-semibold">Timeline Editor</h1>
                <div className="h-4 w-px bg-zinc-300 dark:bg-white/10"></div>
                <div className="text-xs text-zinc-500">{enrichedTimeline.length} Segments • ~{project.manifest.estimated_total_duration}s Total</div>
            </div>
            <div className="flex items-center gap-4">
                {finalDownloadUrl && (
                    <a href={finalDownloadUrl} download className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition">
                        <Download className="w-3 h-3"/> Download Final
                    </a>
                )}
                <ModeToggle />
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {enrichedTimeline.map((seg: any, i: number) => (
                <SegmentCard key={seg.id} pid={id} segment={seg} index={i} onUpdate={fetchProject} />
            ))}
        </div>
    </div>
  );
}