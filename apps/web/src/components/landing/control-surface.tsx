import Image from "next/image";

const ControlSurface = () => {
  return (
    <section
      id="workflow"
      aria-labelledby="management-title"
      className="relative flex w-full max-w-6xl scroll-my-24 flex-col items-center justify-center overflow-hidden rounded-2xl bg-background px-4 sm:px-10 md:px-20 lg:mx-auto lg:px-28"
    >
      <div className="absolute left-0 z-10 h-full backdrop-blur-[2px]">
        <svg
          className="h-full w-5 border-r border-border stroke-border/80 sm:w-15 md:w-20 lg:w-25"
          style={{
            maskImage:
              "linear-gradient(transparent, white 10rem, white calc(100% - 10rem), transparent)",
          }}
        >
          <defs>
            <pattern
              id="diagonal-border-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8;
                return (
                  <path
                    key={`control-pattern-left-${offset}`}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    strokeWidth="1"
                  />
                );
              })}
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#diagonal-border-pattern)"
          />
        </svg>
      </div>
      <div className="absolute right-0 z-10 h-full backdrop-blur-[2px]">
        <svg
          className="h-full w-8 border-r border-border stroke-border/80 sm:w-20"
          style={{
            maskImage:
              "linear-gradient(transparent, white 10rem, white calc(100% - 10rem), transparent)",
          }}
        >
          <defs>
            <pattern
              id="diagonal-border-pattern-right"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8;
                return (
                  <path
                    key={`control-pattern-right-${offset}`}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    strokeWidth="1"
                  />
                );
              })}
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#diagonal-border-pattern-right)"
          />
        </svg>
      </div>

      <div className="px-6 text-center">
        <div className="pt-12 text-sm font-medium tracking-tight text-primary sm:pt-20 sm:text-base">
          How Pilot Decides
        </div>
        <h2
          id="management-title"
          className="font-heading mt-6 max-w-[700px] text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl md:text-5xl"
        >
          One control surface for every DM outcome
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-balance text-muted-foreground sm:mt-8 sm:text-base md:text-xl">
          Most tools force you to stitch together flows, tags, and inbox hacks.
          Pilot runs qualification, memory, sentiment, and human handoff from
          one decision engine so each conversation takes the right path
          automatically.
        </p>

        <div className="sm:my-12 md:my-16 lg:my-20 py-14 flex w-full items-center justify-center">
          <div className="scale-[120%] md:scale-[185%] lg:scale-[250%]">
            <Image
              src="/rotary-dial.svg"
              width={230}
              height={200}
              alt="Pilot control dial"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ControlSurface;
