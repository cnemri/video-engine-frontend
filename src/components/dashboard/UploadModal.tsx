import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, description: string) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        
        setIsUploading(true);
        await onUpload(file, description);
        setIsUploading(false);
        setFile(null);
        setDescription("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="h-14 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 bg-zinc-50/50 dark:bg-white/5">
                    <h3 className="font-medium">Add Asset</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition"><X className="w-4 h-4"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* File Input */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn("border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors",
                            file ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                        )}
                    >
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                        {file ? (
                            <div className="text-center">
                                <ImageIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2"/>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-indigo-500/70">Click to change</p>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500">
                                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                                <p className="text-sm font-medium">Click to upload image</p>
                                <p className="text-xs opacity-70">JPG, PNG supported</p>
                            </div>
                        )}
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase mb-1 block">Description (Optional)</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Photo of Alex, the main character..."
                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-md p-2 text-sm resize-none outline-none focus:border-indigo-500"
                            rows={3}
                        />
                        <p className="text-[10px] text-zinc-400 mt-1">This helps the AI identify who or what is in the image.</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!file || isUploading}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? "Uploading..." : "Add Asset"}
                    </button>
                </form>
            </div>
        </div>
    );
}
