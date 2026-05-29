import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface LoadingScreenProps {
  /** Called when the loading screen should dismiss (both app-ready and video-ended) */
  onReady?: () => void;
  /** Whether the app is done loading. When true, we'll wait for the video to finish then dismiss. */
  appReady?: boolean;
}

export function LoadingScreen({ onReady, appReady }: LoadingScreenProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // When both appReady and videoEnded, notify parent
  useEffect(() => {
    if (appReady && videoEnded && onReady) {
      onReady();
    }
  }, [appReady, videoEnded, onReady]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoEnded(true); // treat error as ended so we don't block
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Video container */}
      <div className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md">
        {!videoError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <video
              ref={videoRef}
              src="/Another_animation_for_the_logo.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className="w-full h-auto rounded-2xl shadow-2xl object-contain"
              style={{ maxHeight: "60vh" }}
            />
          </motion.div>
        ) : (
          // Fallback: original animated logo if video fails
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="rounded-full overflow-hidden shadow-lg shadow-black/30">
              <img
                src="/logo_favicon.jpeg"
                alt="KINSA Global Logo"
                className="h-24 w-24 object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-4xl font-bold text-primary notranslate">KINSA</span>
              <span className="text-sm uppercase tracking-widest text-muted-foreground">Global Exim</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Subtle loading hint */}
      <motion.p
        className="mt-6 text-sm text-muted-foreground/60 tracking-widest uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading your portal…
      </motion.p>
    </motion.div>
  );
}
