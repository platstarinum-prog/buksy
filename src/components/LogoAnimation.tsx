import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface LogoAnimationProps {
  onComplete: () => void;
}

export function LogoAnimation({ onComplete }: LogoAnimationProps) {
  const [phase, setPhase] = useState<'reveal' | 'pulse' | 'fade'>('reveal');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('pulse'), 900),
      setTimeout(() => setPhase('fade'), 2000),
      setTimeout(() => onCompleteRef.current(), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'fade' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-noir flex items-center justify-center"
        >
          <div className="relative">
            {/* Glow behind logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full blur-3xl bg-blood"
              style={{ width: 320, height: 320, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />

            {/* Pulsing rings */}
            {phase === 'pulse' && (
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.3, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.25,
                      ease: 'easeOut',
                    }}
                    className="absolute border border-blood/40 rounded-full"
                    style={{ width: 220, height: 220, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </>
            )}

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.6, rotateY: 90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <motion.div
                animate={{ scale: phase === 'pulse' ? [1, 1.04, 1] : 1 }}
                transition={{ duration: 0.8, repeat: phase === 'pulse' ? 1 : 0 }}
                className="w-[220px] h-[220px] overflow-hidden"
              >
                <motion.img
                  src="/logo.png"
                  alt="BUKSY"
                  className="w-full h-full object-contain brightness-0 invert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Corner accents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            className="absolute top-8 right-8 w-40 h-40"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M0 0 L100 0 L100 100" fill="none" stroke="#B10006" strokeWidth="1" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            className="absolute bottom-8 left-8 w-40 h-40"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M100 100 L0 100 L0 0" fill="none" stroke="#B10006" strokeWidth="1" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
