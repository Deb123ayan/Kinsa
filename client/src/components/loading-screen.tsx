import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-primary flex items-center justify-center z-50">
      <motion.div className="flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <motion.div
          className="bg-accent text-accent-foreground p-4 rounded-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="text-4xl font-bold"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            ⚓
          </motion.div>
        </motion.div>

        {/* Company Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-serif font-bold text-primary-foreground">KINSA</h1>
          <p className="text-lg text-primary-foreground/70 mt-2">Global Exim</p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 bg-accent rounded-full"
              animate={{ translateY: [0, -8, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        <motion.p
          className="text-primary-foreground/60 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}
