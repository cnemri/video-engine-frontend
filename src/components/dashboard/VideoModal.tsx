import React from 'react';
import { X, Download } from 'lucide-react';
import { StorageMedia } from '@/components/StorageMedia';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoPath: string;
    downloadUrl: string | null;
}

export function VideoModal({ isOpen, onClose, videoPath, downloadUrl }: VideoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-black border border-white/10 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
                    <h3 className="font-medium text-white">Final Video</h3>
                    <div className="flex items-center gap-2">
                        {downloadUrl && (
                            <a href={downloadUrl} download className="p-2 hover:bg-white/10 rounded-full transition text-white" title="Download">
                                <Download className="w-4 h-4"/>
                            </a>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white"><X className="w-4 h-4"/></button>
                    </div>
                </div>
                <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <StorageMedia path={videoPath} type="video" controls className="w-full h-full max-h-full object-contain" />
                </div>
            </div>
        </div>
    );
}
