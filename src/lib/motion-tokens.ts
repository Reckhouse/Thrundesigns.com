/** Shared motion language for cinematic scroll storytelling. */
export const motionTokens = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.45, 0, 0.55, 1] as const,
  durationFast: 0.45,
  durationBase: 0.8,
  durationSlow: 1.2,
  stagger: 0.08,
};

export const revealViewport = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -8% 0px",
} as const;
