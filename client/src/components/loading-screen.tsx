import { motion } from "framer-motion";

export function LoadingScreen() {
  // Agricultural crop icons
  const cropIcons = ["🌾", "🌽", "🌶️", "🫘", "🌰", "🥜"];

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Logo - Made Bigger */}
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
            <span className="font-serif text-4xl font-bold text-primary">KINSA</span>
            <span className="text-sm uppercase tracking-widest text-muted-foreground">Global Exim</span>
          </div>
        </motion.div>

        {/* Agricultural Crop Rotation Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-20 h-20"
        >
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 border-2 border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Crop icons rotating around the center */}
          <div className="absolute inset-0">
            {cropIcons.map((crop, index) => (
              <motion.div
                key={index}
                className="absolute text-2xl"
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: "0 0",
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos((index * 60 * Math.PI) / 180) * 30 - 12,
                  y: Math.sin((index * 60 * Math.PI) / 180) * 30 - 12,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.1,
                }}
              >
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.1,
                  }}
                >
                  {crop}
                </motion.span>
              </motion.div>
            ))}
          </div>

          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-base text-muted-foreground font-medium">
            Loading your partner portal...
          </p>
          <motion.p
            className="text-sm text-muted-foreground/70 mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Connecting global agricultural markets
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
