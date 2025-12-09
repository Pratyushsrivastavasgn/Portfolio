import { useState, useRef, useEffect } from "react";
import { FaMusic, FaPause, FaForward, FaBackward } from "react-icons/fa6";
import "./styles/MusicPlayer.css";

// Placeholder playlist - User needs to add files
const playlist = [
    "/audio/music.mp3",
    "/audio/music2.mp3",
    "/audio/music3.mp3",
];

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch((error) => {
                    console.log("Audio playback failed:", error);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    const playNext = () => {
        setCurrentTrack((prev) => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const playPrev = () => {
        setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch((error) => console.log("Playback failed", error));
            }
        }
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.4;
        }
    }, []);

    return (
        <div className="music-player-container">
            <audio ref={audioRef} onEnded={playNext}>
                <source src={playlist[currentTrack]} type="audio/mp3" />
            </audio>

            <div className="music-controls">
                <button className="music-btn small" onClick={playPrev}>
                    <FaBackward />
                </button>
                <button className="music-btn main" onClick={togglePlay}>
                    {isPlaying ? <FaPause /> : <FaMusic />}
                </button>
                <button className="music-btn small" onClick={playNext}>
                    <FaForward />
                </button>
            </div>
        </div>
    );
};

export default MusicPlayer;
