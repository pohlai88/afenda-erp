"use client"

import { useMemo } from "react"
import { scaleLinear } from "@visx/scale"
import { LinePath } from "@visx/shape"

type ListSurfaceSparklineProps = {
  points: readonly number[]
  className?: string
}

export function ListSurfaceSparkline({
  points,
  className,
}: ListSurfaceSparklineProps) {
  const width = 96
  const height = 32

  const pathData = useMemo(() => {
    if (points.length < 2) {
      return null
    }
    const min = Math.min(...points)
    const max = Math.max(...points)
    const xScale = scaleLinear({
      domain: [0, points.length - 1],
      range: [0, width],
    })
    const yScale = scaleLinear({
      domain: [min, max === min ? min + 1 : max],
      range: [height - 2, 2],
    })
    return points.map((value, index) => ({
      x: xScale(index) ?? 0,
      y: yScale(value) ?? 0,
    }))
  }, [points])

  if (!pathData) {
    return null
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
    >
      <LinePath
        data={pathData}
        x={(d) => d.x}
        y={(d) => d.y}
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        fill="none"
      />
    </svg>
  )
}
