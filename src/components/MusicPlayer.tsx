import { useState, useRef, useEffect, useCallback } from "react";
import { FaMusic, FaPause, FaForward, FaBackward, FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import "./styles/MusicPlayer.css";

// Playlist - include available track(s) in `public/audio`
const playlist = [
    "/audio/music.mp3",
];

const formatTime = (sec: number) => {
    if (!isFinite(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.4);
    // start muted to increase chance autoplay is allowed by browser
    const [muted, setMuted] = useState(true);
    const [autoplayRequested, setAutoplayRequested] = useState(true);
    const [autoplayAllowed, setAutoplayAllowed] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    // Play / pause
    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // If audio is muted, unmute on user-initiated play (counts as interaction)
            if (audio.muted) {
                try {
                    audio.muted = false;
                    setMuted(false);
                } catch (e) {}
            }
            audio.play().then(() => {
                setIsPlaying(true);
                try { localStorage.setItem("music:autoplay", "true"); } catch (e) {}
            }).catch((e) => {
                console.warn("Playback failed:", e);
            });
        }
    }, [isPlaying]);

    // persist current track index
    useEffect(() => {
        try { localStorage.setItem("music:track", String(currentTrack)); } catch (e) {}
    }, [currentTrack]);

    const playTrack = useCallback((index: number) => {
        setCurrentTrack((prev) => {
            const next = (index + playlist.length) % playlist.length;
            return next;
        });
        setIsPlaying(true);
    }, []);

    const playNext = () => playTrack(currentTrack + 1);
    const playPrev = () => playTrack(currentTrack - 1);

    // Seek when clicking progress
    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const rect = (e.target as HTMLDivElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        audio.currentTime = pct * duration;
        setCurrentTime(audio.currentTime);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoaded = () => {
            setDuration(audio.duration || 0);
            // restore saved time if available
            const savedTime = parseFloat(localStorage.getItem("music:time") || "0");
            if (!isNaN(savedTime) && savedTime > 0 && savedTime < audio.duration) {
                try {
                    audio.currentTime = savedTime;
                    setCurrentTime(savedTime);
                } catch (e) {}
            }

            // If we requested autoplay earlier, try to play now that metadata is loaded
            if (autoplayRequested) {
                audio.play().then(() => {
                    setIsPlaying(true);
                    setAutoplayRequested(false);
                    localStorage.setItem("music:autoplay", "true");
                    // try to unmute after a short delay
                    setTimeout(() => {
                        try {
                            audio.muted = false;
                            setMuted(false);
                        } catch (e) {}
                    }, 600);
                }).catch((e) => {
                    console.warn("Autoplay after load failed:", e);
                });
            }
        };
        const onTime = () => {
            const t = audio.currentTime || 0;
            setCurrentTime(t);
            try {
                localStorage.setItem("music:time", String(t));
            } catch (e) {}
        };
        const onEnded = () => playNext();
        const onError = (ev: any) => {
            console.warn("Audio error", ev);
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
        };
    }, [currentTrack, playNext, duration]);

    // React to track change
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        // change source and load
        audio.src = playlist[currentTrack];
        audio.load();
        audio.volume = volume;
        audio.muted = muted;
        if (isPlaying) {
            audio.play().catch((e) => console.warn("Playback failed:", e));
        }
    }, [currentTrack]);

    // Volume/mute
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = muted;
    }, [muted]);

    const toggleMute = () => setMuted((m) => !m);

    const trackName = playlist[currentTrack]?.split("/").pop() || "Unknown";

    // Attempt autoplay on mount. We start muted (commonly allowed) and try to unmute shortly after.
    // Restore previous user autoplay preference and playback position if present.
    useEffect(() => {
        const allowed = localStorage.getItem("music:autoplay") === "true";
        setAutoplayAllowed(allowed);
        if (allowed) {
            // user previously allowed autoplay -> try unmuted
            setMuted(false);
            setAutoplayRequested(true);
        } else {
            setMuted(true);
            setAutoplayRequested(true);
        }

        // restore track/time if available
        const savedTrack = parseInt(localStorage.getItem("music:track") || "0", 10);
        if (!isNaN(savedTrack)) setCurrentTrack(savedTrack);

        // initial autoplay attempt (muted if not allowed)
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = allowed ? false : true;
        audio.volume = volume;
        audio.play().then(() => {
            setIsPlaying(true);
            if (allowed) {
                localStorage.setItem("music:autoplay", "true");
            }
            // if we started muted, try to unmute after short delay
            if (!allowed) {
                setTimeout(() => {
                    try {
                        audio.muted = false;
                        setMuted(false);
                    } catch (e) {}
                }, 600);
            }
        }).catch((e) => {
            // autoplay blocked — will retry after metadata loads
            // console.warn("Autoplay attempt failed:", e);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="music-player-container minimal" role="region" aria-label="Music player">
            <audio ref={audioRef} autoPlay muted={muted} preload="auto">
                <source src={playlist[currentTrack]} type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>

            <div className="music-controls minimal-controls">
                <button className="music-btn small" onClick={playPrev} aria-label="Previous">
                    <FaBackward />
                </button>
                <button className="music-btn main" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <FaPause /> : <FaMusic />}
                </button>
                <button className="music-btn small" onClick={playNext} aria-label="Next">
                    <FaForward />
                </button>
            </div>
        </div>
    );
};

export default MusicPlayer;
