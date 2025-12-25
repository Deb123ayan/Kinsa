import { motion } from "framer-motion";

export function LoadingScreen() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center z-50 overflow-hidden perspective">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 3D Rotating Cube */}
      <motion.div
        className="absolute w-48 h-48 pointer-events-none"
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateX: 360, rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Cube faces */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-48 h-48 border-2 border-accent/30 bg-accent/5 flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                transform: [
                  "translateZ(96px)",
                  "rotateY(180deg) translateZ(96px)",
                  "rotateY(90deg) translateZ(96px)",
                  "rotateY(-90deg) translateZ(96px)",
                  "rotateX(90deg) translateZ(96px)",
                  "rotateX(-90deg) translateZ(96px)",
                ][i],
              }}
            >
              <div className="text-4xl opacity-60">⚓</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex flex-col items-center gap-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-block px-4 py-2 bg-accent/20 border border-accent/40 rounded-full backdrop-blur-sm"
        >
          <span className="text-sm font-medium text-accent-foreground">Premium Agricultural Exports</span>
        </motion.div>

        {/* Company Name with 3D effect */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary-foreground drop-shadow-lg">
              KINSA
            </h1>
          </motion.div>
          <motion.p
            className="text-xl text-primary-foreground/80 mt-2"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Global Exim
          </motion.p>
        </motion.div>

        {/* Advanced Loading Dots */}
        <motion.div variants={itemVariants} className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-3 w-3 bg-accent rounded-full"
              animate={{
                y: [0, -12, 0],
                boxShadow: [
                  "0 0 0 0 rgba(252, 176, 64, 0.7)",
                  "0 0 0 10px rgba(252, 176, 64, 0)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Status Text */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <motion.p
            className="text-primary-foreground/70 text-sm font-medium tracking-widest"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            INITIALIZING PARTNER PORTAL
          </motion.p>
          <motion.div
            className="mt-3 text-xs text-primary-foreground/60 flex gap-2 justify-center"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span>•</span>
            <span>Verifying credentials</span>
            <span>•</span>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          variants={itemVariants}
          className="w-48 h-1 bg-primary-foreground/10 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50"
            animate={{ x: [-200, 400] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
