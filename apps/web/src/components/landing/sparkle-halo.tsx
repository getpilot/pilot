"use client"
import { LazyMotion, domAnimation, m, type Variants } from "motion/react"
import { Sparkles } from "lucide-react"

const ChipViz = () => {
  const createVariants = ({
    scale,
    delay,
  }: {
    scale: number
    delay: number
  }): Variants => ({
    initial: { scale: 1 },
    animate: {
      scale: [1, scale, 1],
      transition: {
        duration: 2,
        times: [0, 0.2, 1],
        ease: [0.23, 1, 0.32, 1],
        repeat: Infinity,
        repeatDelay: 2,
        delay,
      },
    },
  })

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex items-center">
        <div className="relative">
          <m.div
            variants={createVariants({ scale: 1.1, delay: 0 })}
            initial="initial"
            animate="animate"
            className="absolute -inset-px z-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-800 opacity-30 blur-xl"
          />
          <m.div
            variants={createVariants({ scale: 1.08, delay: 0.1 })}
            initial="initial"
            animate="animate"
            className="relative z-0 min-h-[80px] min-w-[80px] rounded-full border border-border bg-gradient-to-b from-background to-secondary shadow-xl shadow-primary/15"
          >
            <m.div
              variants={createVariants({ scale: 1.06, delay: 0.2 })}
              initial="initial"
              animate="animate"
              className="absolute inset-1 rounded-full bg-gradient-to-t from-cyan-500 via-blue-500 to-blue-800 p-0.5 shadow-xl"
            >
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-black/40 shadow-xs shadow-white/40 dark:shadow-black/40 will-change-transform">
                <div className="size-full bg-black/30 dark:bg-black/50" />
                <m.div
                  variants={createVariants({ scale: 1.04, delay: 0.3 })}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-500 via-blue-500 to-blue-800 opacity-50 shadow-[inset_0_0_16px_4px_rgba(0,0,0,1)]"
                />
                <m.div
                  variants={createVariants({ scale: 1.02, delay: 0.4 })}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-[6px] rounded-full bg-white/10 dark:bg-white/5 p-1 backdrop-blur-[1px]"
                >
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-background to-secondary shadow-lg shadow-black/20 dark:shadow-black/50">
                    <Sparkles className="h-6 w-6 text-primary dark:text-white" aria-hidden="true" />
                  </div>
                </m.div>
              </div>
            </m.div>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  )
}

export default ChipViz
