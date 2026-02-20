"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <div className="text-center py-16 px-4">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-4"
            >
                <span className="text-blue-600">
                    Vibrant Resume
                </span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
                Transform your resume into a high-impact, ATS-proof document tailored perfectly to your target role.
            </motion.p>
        </div>
    );
}
