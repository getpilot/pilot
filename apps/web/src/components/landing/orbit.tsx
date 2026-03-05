import { Children, isValidElement, type ReactNode } from "react"

interface OrbitingObjectProps {
  /** Radius of the orbit in pixels */
  radiusPx?: number
  /** Center element */
  children: ReactNode
  /** Array of elements to orbit around the center */
  orbitingObjects: ReactNode[]
  /** Default size of orbiting objects (in pixels) for positioning */
  defaultObjectSize?: number
  /** Duration of one complete orbit in seconds */
  durationSeconds?: number
  /** Keep orbiting upright */
  keepUpright?: boolean
}

const EMPTY_ORBITING_OBJECTS: ReactNode[] = []

const Orbit = ({
  radiusPx = 144,
  children,
  orbitingObjects = EMPTY_ORBITING_OBJECTS,
  defaultObjectSize = 32,
  durationSeconds = 8,
  keepUpright = false,
}: OrbitingObjectProps) => {
  const orbitDiameter = radiusPx * 2
  const containerSize = orbitDiameter + defaultObjectSize
  const initialOffset = radiusPx + defaultObjectSize / 2

  const positionedObjects = Children.toArray(orbitingObjects).map(
    (object, index) => {
    const delaySeconds = -(index * (durationSeconds / orbitingObjects.length))
      const objectKey =
        isValidElement(object) && object.key != null
          ? String(object.key)
          : "orbit-item"

    return (
      <div
        key={objectKey}
        className="absolute flex items-center justify-center"
        style={{
          animationName: "spin",
          animationDuration: `${durationSeconds}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: `${delaySeconds}s`,
          transformOrigin: `calc(50% + ${radiusPx}px) 50%`,
          left: `calc(50% - ${initialOffset}px)`,
          top: `calc(50% - ${defaultObjectSize / 2}px)`,
          width: `${defaultObjectSize}px`,
          height: `${defaultObjectSize}px`,
        }}
      >
        {/* Counter-rotating container to keep object upright */}
        <div
          className="flex h-full w-full items-center justify-center"
          style={
            keepUpright
              ? {
                  animationName: "spin",
                  animationDuration: `${durationSeconds}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationDelay: `${delaySeconds}s`,
                  animationDirection: "reverse",
                }
              : undefined
          }
        >
          {object}
        </div>
      </div>
    )
    },
  )

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
      }}
    >
      {/* Orbital path */}
      <div
        className="absolute animate-pulse rounded-full border border-border bg-muted/30"
        style={{
          width: `${orbitDiameter}px`,
          height: `${orbitDiameter}px`,
        }}
      />

      {/* Orbiting objects */}
      {positionedObjects}

      {/* Center object (children) */}
      {children}
    </div>
  )
}

export default Orbit
