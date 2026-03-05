import {
  Bell,
  Car,
  Check,
  Circle,
  Code2,
  LoaderCircle,
  Plane,
  Scan,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import Orbit from "./orbit";
import ChipViz from "./sparkle-halo";

const FEATURES_CONTENT = (
  <section
    aria-label="Pilot platform overview"
    id="platform"
    className="relative mx-auto max-w-6xl scroll-my-24"
  >
      {/* Vertical Lines */}
      <div className="pointer-events-none inset-0 select-none">
        {/* Left */}
        <div
          className="absolute inset-y-0 -my-20 w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-border"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* Right */}
        <div
          className="absolute inset-y-0 right-0 -my-20 w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-border"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>
        {/* Middle */}
        <div
          className="absolute inset-y-0 left-1/2 -z-10 -my-20 w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-border"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>
        {/* 25% */}
        <div
          className="absolute inset-y-0 left-1/4 -z-10 -my-20 hidden w-px sm:block"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-border"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>
        {/* 75% */}
        <div
          className="absolute inset-y-0 left-3/4 -z-10 -my-20 hidden w-px sm:block"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
          }}
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              className="stroke-border"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-0">
        {/* Content */}
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-sm font-medium tracking-tight text-primary sm:text-base">
            Lead Capture
            <div className="absolute top-[2.5px] -left-[8px] h-5 w-[3px] rounded-r-sm bg-primary" />
          </h2>
          <p className="font-heading mt-2 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
            Capture every buyer signal before it goes cold
          </p>
          <p className="mt-4 text-sm text-balance text-muted-foreground sm:text-base">
            One viral post can flood your inbox. Pilot catches DMs, comments,
            and follow-ups in one system so reps respond faster with context.
          </p>
        </div>
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg
            className="absolute size-full mask-[linear-gradient(transparent,white_10rem)]"
            // style={{
            //   maskImage:
            //     "linear-gradient(transparent, white 20rem, white calc(100% - 20rem), transparent)",
            // }}
          >
            <defs>
              <pattern
                id="diagonal-feature-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8;
                  return (
                    <path
                      key={`feature-pattern-a-${offset}`}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-border/70"
                      strokeWidth="1"
                    />
                  );
                })}
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#diagonal-feature-pattern)"
            />
          </svg>
          <div className="pointer-events-none h-104 w-full max-w-full p-6 sm:p-10 select-none">
            <div className="relative flex flex-col items-center justify-center">
              <Orbit
                durationSeconds={40}
                radiusPx={140}
                keepUpright
                orbitingObjects={[
                  <div
                    key="obj1"
                    className="relative flex items-center justify-center"
                  >
                    <Truck className="z-10 size-5 text-foreground" />
                    <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-destructive p-1 text-xs ring-1 ring-border">
                          <Circle className="size-3 shrink-0 text-white" />
                        </div>
                        <div className="rounded-r-full bg-card/80 py-0.5 pr-1.5 pl-1 text-xs whitespace-nowrap ring-1 ring-border">
                          Human needed
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        animationDelay: "1s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
                    ></div>
                  </div>,

                  <div
                    key="obj2"
                    className="relative flex items-center justify-center"
                  >
                    <Plane className="z-10 size-5 rotate-90 text-foreground" />
                    <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-muted-foreground p-1 text-xs ring-1 ring-border">
                          <LoaderCircle className="size-3 shrink-0 animate-spin text-white" />
                        </div>
                        <div className="rounded-r-full bg-card/80 py-0.5 pr-1.5 pl-1 text-xs ring-1 ring-border">
                          In queue
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        animationDelay: "4s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
                    ></div>
                  </div>,

                  <div
                    key="obj3"
                    className="relative flex items-center justify-center"
                  >
                    <Car className="z-10 size-5 text-foreground" />
                    <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border"></div>
                    <div
                      style={{
                        animationDelay: "2s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
                    ></div>
                  </div>,
                  <div
                    key="obj4"
                    className="relative flex items-center justify-center"
                  >
                    <Plane className="z-10 size-5 rotate-90 text-foreground" />
                    <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-emerald-500 p-1 text-xs ring-1 ring-border">
                          <Check className="size-3 shrink-0 text-white" />
                        </div>
                        <div className="rounded-r-full bg-card/80 py-0.5 pr-1.5 pl-1 text-xs ring-1 ring-border">
                          Live reply
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        animationDelay: "6s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
                    ></div>
                  </div>,
                  <div
                    key="obj5"
                    className="relative flex items-center justify-center"
                  >
                    <Plane className="z-10 size-5 rotate-90 text-foreground" />
                    <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border"></div>
                    <div
                      style={{
                        animationDelay: "3s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
                    ></div>
                  </div>,
                ]}
              >
                <div className="relative flex h-48 w-48 items-center justify-center">
                  <div className="rounded-full bg-card/70 p-1 ring-1 ring-border">
                    <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-background ring-1 shadow-[inset_0px_-15px_20px_rgba(0,0,0,0.1),0_7px_10px_0_rgba(0,0,0,0.15)] ring-border">
                      <div className="h-10 w-10 rounded-md bg-primary/15 text-primary ring-1 ring-primary/30 grid place-items-center text-sm font-semibold">
                        P
                      </div>
                    </div>
                    <div className="absolute inset-12 animate-[spin_8s_linear_infinite] rounded-full bg-linear-to-t from-transparent via-primary/70 to-transparent blur-lg" />
                  </div>
                </div>
              </Orbit>
            </div>
          </div>
        </div>

        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-sm font-medium tracking-tight text-primary sm:text-base">
            Conversation Memory
            <div className="absolute top-[2.5px] -left-[8px] h-5 w-[3px] rounded-r-sm bg-primary" />
          </h2>
          <p className="font-heading mt-2 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
            Reply with full thread memory, not guesswork
          </p>
          <p className="mt-4 text-sm text-balance text-muted-foreground sm:text-base">
            Pilot keeps lead stage, past replies, and account context visible so
            every response sounds on-brand and moves the deal forward.
          </p>
        </div>
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg className="absolute size-full">
            <defs>
              <pattern
                id="diagonal-feature-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8;
                  return (
                    <path
                      key={`feature-pattern-b-${offset}`}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-border/70"
                      strokeWidth="1"
                    />
                  );
                })}
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#diagonal-feature-pattern)"
            />
          </svg>
          <div className="relative h-[320px] w-[320px] sm:h-[432px] sm:w-[432px]">
            <svg
              id="grid"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className="landing-mask absolute size-full"
            >
              <path
                className="stroke-border"
                d="M48 0v432M96 0v432M144 0v432M192 0v432M240 0v432M288 0v432M336 0v432M384 0v432M0 48h432M0 96h432M0 144h432M0 192h432M0 240h432M0 288h432M0 336h432M0 384h432"
              />
            </svg>

            <div className="pointer-events-none relative h-full select-none">
              <div className="absolute top-[192px] left-[191.8px]">
                <div className="flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                  <div className="h-8 w-8 rounded-md bg-primary/15 text-primary ring-1 ring-primary/30 grid place-items-center text-xs font-semibold">
                    P
                  </div>
                </div>
              </div>
              <div className="absolute top-[144px] left-[48px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      92%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[48px] left-[144px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      18m
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[96px] left-[240px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      47%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[240px] left-[385px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      14m
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[337px] left-[336px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      12%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[288px] left-[144px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      17m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-sm font-medium tracking-tight text-primary sm:text-base">
            Operator Controls
            <div className="absolute top-[2.5px] -left-[7px] h-5 w-[3px] rounded-r-sm bg-primary" />
          </h2>
          <p className="font-heading mt-2 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
            Add guardrails that protect revenue and reputation
          </p>
          <p className="mt-4 text-sm text-balance text-muted-foreground sm:text-base">
            Set triggers, throttles, and human checkpoints once. Pilot adapts as
            campaigns change without rebuilding fragile flowcharts.
          </p>
        </div>
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg
            className="absolute size-full mask-[linear-gradient(white_10rem,transparent)]"
            // style={{
            //   maskImage:
            //     "linear-gradient(transparent, white 20rem, white calc(100% - 20rem), transparent)",
            // }}
          >
            <defs>
              <pattern
                id="diagonal-feature-pattern"
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                {Array.from({ length: 17 }, (_, i) => {
                  const offset = i * 8;
                  return (
                    <path
                      key={`feature-pattern-c-${offset}`}
                      d={`M${-106 + offset} 110L${22 + offset} -18`}
                      className="stroke-border/70"
                      strokeWidth="1"
                    />
                  );
                })}
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#diagonal-feature-pattern)"
            />
          </svg>
          <div className="pointer-events-none relative flex size-full h-104 items-center justify-center p-10 select-none">
            <div className="relative">
              <div className="absolute top-24 left-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-card p-1 ring-1 shadow-md shadow-black/10 ring-border">
                  <div className="w-fit rounded-full bg-linear-to-b from-background to-secondary p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.09),0_3px_5px_0_rgba(0,0,0,0.19)] ring-border ring-inset">
                    <Bell
                      className="size-5 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute top-24 right-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-card p-1 ring-1 shadow-md shadow-black/10 ring-border">
                  <div className="w-fit rounded-full bg-linear-to-b from-background to-secondary p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-border ring-inset">
                    <SlidersHorizontal
                      className="size-5 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute right-24 bottom-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-card p-1 ring-1 shadow-md shadow-black/10 ring-border">
                  <div className="w-fit rounded-full bg-linear-to-b from-background to-secondary p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-border ring-inset">
                    <Code2
                      className="size-5 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-24 left-24 z-20">
                <div className="relative mx-auto w-fit rounded-full bg-card p-1 ring-1 shadow-md shadow-black/10 ring-border">
                  <div className="w-fit rounded-full bg-linear-to-b from-background to-secondary p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-border ring-inset">
                    <Scan
                      className="size-5 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              {[0, 45, 135, 180, 225, 315, 360].map((rotation, index) => (
                <div
                  key={rotation}
                  className="absolute origin-left overflow-hidden"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="relative">
                    <div className="h-0.5 w-60 bg-linear-to-r from-border to-transparent" />
                    <div
                      className="absolute top-[2.5px] left-0 h-0.5 w-28 bg-linear-to-r from-transparent via-primary/40 to-transparent"
                      style={{
                        animation: `gridMovingLine 5s linear infinite ${index * 1.2}s`,
                        animationFillMode: "backwards",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <ChipViz />
              </div>
            </div>
          </div>
        </div>
      </div>
  </section>
)

const Features = () => FEATURES_CONTENT

export default Features;
