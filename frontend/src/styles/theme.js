export const T = {
  bg0: "#07111d",
  bg1: "#0c1a27",
  bg2: "#0d1625",
  bg3: "#142030",

  border: "#23374d",
  borderL: "#2f5170",

  t1: "#d6eef8",
  t2: "#bfdbe8",
  t3: "#90b6c8",
  t4: "#5a91b0",

  blue: "#1a8fc1",
  blueMid: "#2eaad8",
  blueL: "#4dc8f0",
  blueD: "#0f5f86",

  success: "#2fc98f",
  warn: "#f0b24a",
  danger: "#ef6b6b",
  purple: "#8f7cff",
};

export const STATUS_CFG = {
  submitted: { label: "Submitted", c: T.blueL, bg: `${T.blue}22` },
  under_review: { label: "Under Review", c: T.warn, bg: `${T.warn}22` },
  in_progress: { label: "In Progress", c: T.purple, bg: `${T.purple}22` },
  resolved: { label: "Resolved", c: T.success, bg: `${T.success}22` },
  rejected: { label: "Rejected", c: T.danger, bg: `${T.danger}22` },
};

export const SEV_CFG = {
  low: { label: "Low", c: T.success, bg: `${T.success}22` },
  medium: { label: "Medium", c: T.warn, bg: `${T.warn}22` },
  high: { label: "High", c: T.danger, bg: `${T.danger}22` },
};

export const STATUS_STEPS = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
];

export default T;
