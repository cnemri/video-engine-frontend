"use client";

import React, { useState, useEffect } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { getStorageUrl } from '@/lib/storage';
import { ImageIcon } from 'lucide-react';

interface StorageImageProps extends Omit<ImageProps, 'src'> {
    path: string;
}

export function StorageImage({ path, alt, ...props }: StorageImageProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getStorageUrl(path).then(u => {
            if (mounted) {
                setUrl(u);
                setLoading(false);
            }
        });
        return () => { mounted = false; };
    }, [path]);

    if (loading) {
        return <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse"/>;
    }

    if (!url) {
        return <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400"><ImageIcon className="w-6 h-6 opacity-20"/></div>;
    }

    return <NextImage src={url} alt={alt} {...props} unoptimized />;
}