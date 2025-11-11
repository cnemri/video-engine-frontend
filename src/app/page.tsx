"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Folder, ArrowRight, Film, Video, Sparkles, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { Modal } from '@/components/Modal';
import { useApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ProjectSummary = { id: string; name: string; status: string; created_at: number; };

export default function ProjectsPage() {
  const { fetch: apiFetch } = useApi();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const fetchProjects = async () => {
      if (!user) return;
      try {
          const res = await apiFetch('/projects');
          if (res.ok) setProjects(await res.json());
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const createProject = async () => {
    if (!newName || !newPrompt) return;
    setIsCreating(true);
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("prompt", newPrompt);
    try {
        const res = await apiFetch('/projects', { method: 'POST', body: formData });
        if (res.ok) {
            const proj = await res.json();
            window.location.href = `/project/${proj.id}/dashboard`;
        }
    } catch (e) { console.error(e); setIsCreating(false); }
  };

  const promptDelete = (e: React.MouseEvent, pid: string) => {
      e.preventDefault();
      e.stopPropagation();
      setProjectToDelete(pid);
  };

  const confirmDelete = async () => {
      if (!projectToDelete) return;
      try {
          await apiFetch(`/projects/${projectToDelete}`, { method: 'DELETE' });
          fetchProjects();
      } catch (e) { console.error(e); }
      setProjectToDelete(null);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 font-sans transition-colors duration-300 flex flex-col">
      {/* Global Navbar */}
      <header className="h-14 border-b border-zinc-200 dark:border-white/5 px-6 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-md">
            <Film className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-semibold text-sm tracking-tight">Google AI GenMedia Video Engine</h1>
        </div>
        <div className="flex items-center gap-4">
            <a href="https://github.com/your-repo" target="_blank" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Documentation</a>
            <ModeToggle />
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Workspace</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your video generation projects.</p>
            </div>
            {user && <div className="text-xs text-zinc-500">Signed in as {user.email}</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Create New Card */}
            <div className="col-span-1 md:col-span-1 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col gap-3 h-fit sticky top-24">
                <div className="flex items-center gap-2 font-medium text-sm text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4"/> New Project
                </div>
                <input type="text" placeholder="Project Name" className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-indigo-500 transition" value={newName} onChange={e => setNewName(e.target.value)} />
                <textarea placeholder="Describe your video idea..." className="flex-1 w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-indigo-500 transition resize-none" rows={4} value={newPrompt} onChange={e => setNewPrompt(e.target.value)} />
                <button onClick={createProject} disabled={isCreating || !newName || !newPrompt} className={cn("w-full py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2", (isCreating || !newName || !newPrompt) ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm")}>
                    {isCreating ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                    <span>Create</span>
                </button>
            </div>

            {/* Project List or Empty State */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
                {projects.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
                        <Video className="w-12 h-12 mb-4 opacity-50"/>
                        <h3 className="font-medium text-zinc-600 dark:text-zinc-300">No projects yet</h3>
                        <p className="text-sm">Create your first project to get started.</p>
                    </div>
                ) : (
                    projects.sort((a,b) => b.created_at - a.created_at).map(p => (
                        <Link key={p.id} href={`/project/${p.id}/dashboard`} className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col h-48 relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                    <Folder className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"/>
                                </div>
                                <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-medium", 
                                    p.status === 'completed' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : 
                                    p.status === 'failed' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : 
                                    "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500")}>
                                    {p.status}
                                </span>
                            </div>
                            <h3 className="font-medium truncate mb-1 pr-6">{p.name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Created {new Date(p.created_at * 1000).toLocaleDateString()}</p>
                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center">
                                    Open Project <ArrowRight className="w-4 h-4 ml-1"/>
                                </div>
                                <button onClick={(e) => promptDelete(e, p.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10">
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal 
            isOpen={!!projectToDelete} 
            onClose={() => setProjectToDelete(null)} 
            title="Delete Project"
            footer={
                <>
                    <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">Delete</button>
                </>
            }
        >
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500"/>
                </div>
                <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Are you sure you want to delete this project? All associated files, assets, and videos will be permanently removed. This action cannot be undone.
                    </p>
                </div>
            </div>
        </Modal>
      </div>
    </main>
  );
}
