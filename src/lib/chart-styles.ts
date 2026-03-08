// Apple-style chart configuration shared across all chart components

export const APPLE_TOOLTIP = {
  backgroundColor: "hsl(var(--card))",
  border: "none",
  borderRadius: "14px",
  fontSize: "11px",
  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
  padding: "10px 14px",
  lineHeight: "1.6",
};

export const APPLE_AXIS = {
  tick: { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Inter" },
  axisLine: false as const,
  tickLine: false as const,
};

export const APPLE_GRID = {
  strokeDasharray: "0",
  stroke: "hsl(var(--border))",
  strokeOpacity: 0.4,
  vertical: false as const,
};

// Apple-style color palette for charts
export const APPLE_COLORS = {
  blue: "hsl(211, 100%, 50%)",
  green: "hsl(142, 71%, 45%)",
  orange: "hsl(38, 92%, 50%)",
  purple: "hsl(262, 52%, 55%)",
  red: "hsl(0, 72%, 51%)",
  teal: "hsl(175, 60%, 42%)",
  pink: "hsl(330, 65%, 55%)",
};
