"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509315811345-672d83ce2be3?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588610543665-27a9645938f3?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550545933-255d6487e076?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=800&auto=format&fit=crop",
];

const Skiper30 = () => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    requestAnimationFrame(raf);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="w-full overflow-hidden relative bg-transparent py-10">
      <div
        ref={gallery}
        className="relative box-border flex h-[120vh] sm:h-[150vh] md:h-[175vh] gap-[2vw] overflow-hidden bg-transparent px-[2vw]"
      >
        <Column images={[images[0], images[1], images[2]]} y={y} classes="flex" />
        <Column images={[images[3], images[4], images[5]]} y={y2} classes="flex" />
        <Column images={[images[6], images[7], images[8]]} y={y3} classes="hidden md:flex" />
        <Column images={[images[9], images[10], images[11]]} y={y4} classes="hidden lg:flex" />
      </div>
    </div>
  );
};

type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
  classes?: string;
};

const Column = ({ images, y, classes = "" }: ColumnProps) => {
  return (
    <motion.div
      className={`relative -top-[45%] flex-1 flex h-full flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%] ${classes}`}
      style={{ y }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-[33%] w-full overflow-hidden rounded-2xl">
          <img
            src={`${src}`}
            alt="gallery image"
            className="pointer-events-none object-cover w-full h-full"
          />
        </div>
      ))}
    </motion.div>
  );
};

export { Skiper30 as ParallaxGallery };
