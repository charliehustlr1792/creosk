export default function PositionGuide() {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      {/* Silhouette outline */}
      <svg
        viewBox="0 0 200 400"
        className="h-4/5 opacity-20"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      >
        {/* Head */}
        <ellipse cx="100" cy="45" rx="28" ry="33" />
        {/* Shoulders */}
        <path d="M72 78 Q50 85 42 110 L42 200 L158 200 L158 110 Q150 85 128 78" />
        {/* Body */}
        <path d="M42 200 L50 320 L150 320 L158 200" />
        {/* Arms */}
        <path d="M42 110 L20 200 L38 205 L55 130" />
        <path d="M158 110 L180 200 L162 205 L145 130" />
      </svg>

      {/* Tips */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1">
        <p className="text-xs text-zinc-400 text-center">
          Stand 1–2 meters from camera · Face forward · Plain background works best
        </p>
      </div>
    </div>
  )
}