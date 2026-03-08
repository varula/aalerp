// Clean corporate chart configuration shared across all chart components

export const APPLE_TOOLTIP = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "11px",
  boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)",
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
  strokeOpacity: 0.5,
  vertical: false as const,
};

// Chart color palette — clean corporate teal
export const APPLE_COLORS = {
  blue: "hsl(190, 70%, 42%)",
  green: "hsl(152, 60%, 42%)",
  orange: "hsl(38, 90%, 50%)",
  purple: "hsl(262, 52%, 55%)",
  red: "hsl(0, 72%, 51%)",
  teal: "hsl(175, 55%, 40%)",
  pink: "hsl(330, 65%, 55%)",
};
