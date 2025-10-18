'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/fantasy/index.css';

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  onClose?: () => void;
}

export default function VideoPlayer({ videoUrl, poster, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      poster: poster,
      controlBar: {
        volumePanel: {
          inline: false
        }
      }
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [poster]);

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        className="video-js vjs-theme-fantasy vjs-big-play-centered"
      >
        <source src={videoUrl} type="video/mp4" />
        <p className="vjs-no-js">
          Pour voir cette vidéo, veuillez activer JavaScript et/ou utiliser un navigateur supportant HTML5.
        </p>
      </video>
      
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/80 hover:bg-black flex items-center justify-center text-white"
          aria-label="Fermer"
        >
          ✕
        </button>
      )}
    </div>
  );
}
