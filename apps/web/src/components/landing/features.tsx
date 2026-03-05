import {
  BadgeCheck,
  Bell,
  Bot,
  BotIcon,
  Brain,
  Hand,
  Instagram,
  LoaderCircle,
  MessageCircle,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Orbit from "./orbit";
import ChipViz from "./sparkle-halo";

type FeatureCopyProps = {
  title: string;
  heading: string;
  description: string;
};

type PatternBackgroundProps = {
  id: string;
  maskClassName?: string;
  keyPrefix: string;
};

const FeatureCopy = ({ title, heading, description }: FeatureCopyProps) => (
  <div className="col-span-2 my-auto px-2">
    <h2 className="relative text-sm font-medium tracking-tight text-primary sm:text-base">
      {title}
      <div className="absolute top-[2.5px] -left-[8px] h-5 w-[3px] rounded-r-sm bg-primary" />
    </h2>
    <p className="font-heading mt-2 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
      {heading}
    </p>
    <p className="mt-4 text-sm text-balance text-muted-foreground sm:text-base">
      {description}
    </p>
  </div>
);

const PatternBackground = ({
  id,
  maskClassName,
  keyPrefix,
}: PatternBackgroundProps) => (
  <svg
    className={
      maskClassName
        ? `absolute size-full ${maskClassName}`
        : "absolute size-full"
    }
  >
    <defs>
      <pattern id={id} patternUnits="userSpaceOnUse" width="64" height="64">
        {Array.from({ length: 17 }, (_, i) => {
          const offset = i * 8;
          return (
            <path
              key={`${keyPrefix}-${offset}`}
              d={`M${-106 + offset} 110L${22 + offset} -18`}
              className="stroke-border/70"
              strokeWidth="1"
            />
          );
        })}
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

const VerticalGuideLines = () => (
  <div className="pointer-events-none inset-0 select-none">
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
);

const SignalIntakeDiagram = () => (
  <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
    <PatternBackground
      id="diagonal-feature-pattern-1"
      maskClassName="mask-[linear-gradient(transparent,white_10rem)]"
      keyPrefix="feature-pattern-a"
    />
    <div className="pointer-events-none h-104 w-full max-w-full p-6 sm:p-10 select-none">
      <div className="relative flex flex-col items-center justify-center">
        <Orbit
          className="scale-70 sm:scale-80 md:scale-90 lg:scale-100"
          durationSeconds={40}
          radiusPx={140}
          keepUpright
          orbitingObjects={[
            <div
              key="obj1"
              className="relative flex items-center justify-center"
            >
              <ShieldAlert className="z-10 size-5 text-foreground" />
              <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border" />
              <div className="absolute -top-4 left-4 z-20">
                <div className="inline-flex h-6 items-center overflow-hidden rounded-full border border-border bg-card/80 text-[11px]">
                  <div className="flex h-full items-center justify-center bg-destructive px-1.5">
                    <Bell className="size-3 shrink-0 text-white" />
                  </div>
                  <div className="flex h-full max-w-24 items-center truncate px-2 whitespace-nowrap">
                    Escalate
                  </div>
                </div>
              </div>
              <div
                style={{ animationDelay: "1s" }}
                className="absolute z-0 size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
              />
            </div>,
            <div
              key="obj2"
              className="relative flex items-center justify-center"
            >
              <MessageCircle className="z-10 size-5 text-foreground" />
              <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border" />
              <div className="absolute -top-4 left-4 z-20">
                <div className="inline-flex h-6 items-center overflow-hidden rounded-full border border-border bg-card/80 text-[11px]">
                  <div className="flex h-full items-center justify-center bg-muted-foreground px-1.5">
                    <LoaderCircle className="size-3 shrink-0 animate-spin text-white" />
                  </div>
                  <div className="flex h-full max-w-24 items-center truncate px-2 whitespace-nowrap">
                    Inbox
                  </div>
                </div>
              </div>
              <div
                style={{ animationDelay: "4s" }}
                className="absolute z-0 size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
              />
            </div>,
            <div
              key="obj3"
              className="relative flex items-center justify-center"
            >
              <Brain className="z-10 size-5 text-foreground" />
              <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border" />
              <div className="absolute -top-4 left-4 z-20">
                <div className="inline-flex h-6 items-center overflow-hidden rounded-full border border-border bg-card/80 text-[11px]">
                  <div className="flex h-full items-center justify-center bg-primary/80 px-1.5">
                    <BotIcon className="size-3 shrink-0 text-white" />
                  </div>
                  <div className="flex h-full max-w-24 items-center truncate px-2 whitespace-nowrap">
                    Classify
                  </div>
                </div>
              </div>
              <div
                style={{ animationDelay: "2s" }}
                className="absolute z-0 size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
              />
            </div>,
            <div
              key="obj4"
              className="relative flex items-center justify-center"
            >
              <BadgeCheck className="z-10 size-5 text-foreground" />
              <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border" />
              <div className="absolute -top-4 left-4 z-20">
                <div className="inline-flex h-6 items-center overflow-hidden rounded-full border border-border bg-card/80 text-[11px]">
                  <div className="flex h-full items-center justify-center bg-emerald-500 px-1.5">
                    <MessageCircle className="size-3 shrink-0 text-white" />
                  </div>
                  <div className="flex h-full max-w-24 items-center truncate px-2 whitespace-nowrap">
                    Qualified
                  </div>
                </div>
              </div>
              <div
                style={{ animationDelay: "6s" }}
                className="absolute z-0 size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
              />
            </div>,
            <div
              key="obj5"
              className="relative flex items-center justify-center"
            >
              <Instagram className="z-10 size-5 text-foreground" />
              <div className="absolute size-10 rounded-full bg-card/80 ring-1 shadow-lg ring-border" />
              <div className="absolute -top-4 left-4 z-20">
                <div className="inline-flex h-6 items-center overflow-hidden rounded-full border border-border bg-card/80 text-[11px]">
                  <div className="flex h-full items-center justify-center bg-amber-500 px-1.5">
                    <Zap className="size-3 shrink-0 text-white" />
                  </div>
                  <div className="flex h-full max-w-24 items-center truncate px-2 whitespace-nowrap">
                    Trigger
                  </div>
                </div>
              </div>
              <div
                style={{ animationDelay: "3s" }}
                className="absolute z-0 size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-primary/50"
              />
            </div>,
          ]}
        >
          <div className="relative flex h-48 w-48 items-center justify-center">
            <div className="rounded-full bg-card/70 p-1 ring-1 ring-border">
              <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-background ring-1 shadow-[inset_0px_-15px_20px_rgba(0,0,0,0.1),0_7px_10px_0_rgba(0,0,0,0.15)] ring-border">
                <Image
                  src="/logo.png"
                  alt="Pilot"
                  width={20}
                  height={20}
                  className="size-8 object-contain"
                />
              </div>
              <div className="absolute inset-12 animate-[spin_8s_linear_infinite] rounded-full bg-linear-to-t from-transparent via-primary/70 to-transparent blur-lg" />
            </div>
          </div>
        </Orbit>
      </div>
    </div>
  </div>
);

const ContextEngineDiagram = () => (
  <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
    <PatternBackground
      id="diagonal-feature-pattern-2"
      keyPrefix="feature-pattern-b"
    />
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
          <div className="flex size-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
            <Image
              src="/logo.png"
              alt="Pilot"
              width={16}
              height={16}
              className="size-8 object-contain"
            />
          </div>
        </div>
        {[
          { top: "top-[144px]", left: "left-[48px]", text: "Hot" },
          { top: "top-[48px]", left: "left-[144px]", text: "New" },
          { top: "top-[96px]", left: "left-[240px]", text: "Warm" },
          { top: "top-[240px]", left: "left-[385px]", text: "Follow" },
          { top: "top-[337px]", left: "left-[336px]", text: "HRN" },
          { top: "top-[288px]", left: "left-[144px]", text: "Owner" },
        ].map((item) => (
          <div key={item.text} className={`absolute ${item.top} ${item.left}`}>
            <div className="relative">
              <div className="absolute inset-0 size-12 animate-pulse bg-primary/20 blur-[3px]" />
              <div className="relative flex h-12 w-12 items-center justify-center bg-background ring-1 shadow-sm ring-border">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {item.text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OperatorControlsDiagram = () => (
  <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
    <PatternBackground
      id="diagonal-feature-pattern-3"
      maskClassName="mask-[linear-gradient(white_10rem,transparent)]"
      keyPrefix="feature-pattern-c"
    />
    <div className="pointer-events-none relative flex size-full h-104 items-center justify-center p-10 select-none">
      <div className="relative">
        <div className="absolute top-24 left-24 z-20">
          <div className="relative mx-auto w-fit rounded-full bg-card p-1 ring-1 shadow-md shadow-black/10 ring-border">
            <div className="w-fit rounded-full bg-linear-to-b from-background to-secondary p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.09),0_3px_5px_0_rgba(0,0,0,0.19)] ring-border ring-inset">
              <Bell className="size-5 text-foreground" aria-hidden="true" />
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
              <Bot className="size-5 text-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-24 left-24 z-20">
          <div className="relative mx-auto w-fit rounded-full bg-card p-1 ring-1 shadow-md shadow-black/10 ring-border">
            <div className="w-fit rounded-full bg-linear-to-b from-background to-secondary p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-border ring-inset">
              <Hand className="size-5 text-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
          <div
            key={rotation}
            className="absolute origin-left overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="relative">
              <div className="h-0.5 w-60 bg-linear-to-r from-border to-transparent" />
              <div
                className="absolute top-0 left-0 h-0.5 w-28 bg-linear-to-r from-transparent via-primary/40 to-transparent"
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
);

const Features = () => (
  <section
    aria-label="Pilot platform overview"
    id="platform"
    className="relative mx-auto max-w-6xl scroll-my-24"
  >
    <VerticalGuideLines />
    <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-0">
      <FeatureCopy
        title="Signal Intake"
        heading="Capture every Instagram buying signal in one live queue"
        description="Pilot ingests comments, DMs, replies, and follow-ups in real time, then classifies intent so your team sees who is ready to buy first."
      />
      <SignalIntakeDiagram />

      <FeatureCopy
        title="Context Engine"
        heading="Reply with lead memory, stage, and next-best action"
        description="Every thread carries timeline context, sentiment, tags, and owner notes so AI and operators make consistent decisions across messages."
      />
      <ContextEngineDiagram />

      <FeatureCopy
        title="Operator Controls"
        heading="Configure safeguards once, then let Pilot scale safely"
        description="Tune tone, handoff rules, and automation boundaries from one control surface so growth never compromises trust or compliance."
      />
      <OperatorControlsDiagram />
    </div>
  </section>
);

export default Features;
