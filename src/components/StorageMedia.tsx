"use client";

import React, { useState, useEffect } from 'react';
import { getStorageUrl } from '@/lib/storage';

interface StorageMediaProps extends React.VideoHTMLAttributes<HTMLVideoElement | HTMLAudioElement> {
    path: string;
    type: 'video' | 'audio';
}

export function StorageMedia({ path, type, ...props }: StorageMediaProps) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        getStorageUrl(path).then(u => {
            if (mounted) setUrl(u);
        });
        return () => { mounted = false; };
    }, [path]);

    if (!url) return <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-md"/>;

    if (type === 'video') {
        return <video src={url} {...(props as React.VideoHTMLAttributes<HTMLVideoElement>)} />;
    } else {
        return <audio src={url} {...(props as React.AudioHTMLAttributes<HTMLAudioElement>)} />;
    }
}
