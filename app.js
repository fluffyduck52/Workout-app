const {
  useState,
  useEffect,
  useRef,
  Fragment
} = React;

// ─────────────────────────────────────────────────────────────────────────────
// APP VERSION — increment only when DEFAULT_WORKOUTS schema changes
// ─────────────────────────────────────────────────────────────────────────────
const V = 8;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE
// Mon=Pull  Tue=Rest  Wed=Lower  Thu=Upper  Fri=Rest  Sat=Legs  Sun=Push
// Tracking ONLY on: pull / legs / push
// ─────────────────────────────────────────────────────────────────────────────
const SCHEDULE = [{
  day: "MON",
  label: "Monday",
  type: "pull"
}, {
  day: "TUE",
  label: "Tuesday",
  type: "rest"
}, {
  day: "WED",
  label: "Wednesday",
  type: "lower"
}, {
  day: "THU",
  label: "Thursday",
  type: "upper"
}, {
  day: "FRI",
  label: "Friday",
  type: "rest"
}, {
  day: "SAT",
  label: "Saturday",
  type: "legs"
}, {
  day: "SUN",
  label: "Sunday",
  type: "push"
}];
const TRACKABLE = new Set(["pull", "legs", "push"]);
const DAY_COLORS = {
  pull: "#42c8f5",
  rest: "#3a3a3a",
  lower: "#f5a142",
  upper: "#a142f5",
  legs: "#c8f542",
  push: "#f54275"
};

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE TYPE SETS
// Isometric = seconds only  |  Dumbbell = per-hand weight, ×2 for 1RM calc
// ─────────────────────────────────────────────────────────────────────────────
const ISOMETRIC = new Set(["Dead Hang", "Wall Sit"]);
const DUMBBELL = new Set(["Lateral Raise", "Rear Delt Fly", "Seated Hammer Curl", "Preacher Curl", "Overhead Triceps Press (Rope)"]);

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT WORKOUTS
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_WORKOUTS = {
  pull: {
    title: "Pull Day",
    subtitle: "Back · Biceps · Chest",
    icon: "↓",
    exercises: [{
      name: "Pull-Up",
      sets: "4",
      reps: "Max",
      muscle: "Lats / Biceps"
    }, {
      name: "Horizontal Row",
      sets: "3",
      reps: "6–8",
      muscle: "Mid Back"
    }, {
      name: "Rear Delt Fly",
      sets: "3",
      reps: "12–15",
      muscle: "Rear Delts"
    }, {
      name: "Shrugs",
      sets: "3",
      reps: "10–12",
      muscle: "Traps"
    }, {
      name: "Preacher Curl",
      sets: "3",
      reps: "8–10",
      muscle: "Biceps Peak"
    }, {
      name: "Seated Hammer Curl",
      sets: "3",
      reps: "10–12",
      muscle: "Brachialis"
    }, {
      name: "Dead Hang",
      sets: "3",
      reps: "20–30 sec",
      muscle: "Grip / Lats"
    }]
  },
  rest: {
    title: "Rest Day",
    subtitle: "Recovery & Mobility",
    icon: "◎",
    exercises: [{
      name: "Light stretching",
      sets: null,
      reps: "10–15 min",
      muscle: "Full Body"
    }, {
      name: "Foam rolling",
      sets: null,
      reps: "10 min",
      muscle: "Recovery"
    }, {
      name: "Walk / light cardio",
      sets: null,
      reps: "Optional",
      muscle: "Active Rest"
    }]
  },
  lower: {
    title: "Lower Body",
    subtitle: "Quads · Hamstrings · Calves",
    icon: "▼",
    exercises: [{
      name: "Squat",
      sets: "4",
      reps: "4–6",
      muscle: "Quads / Glutes"
    }, {
      name: "Deadlift",
      sets: "3",
      reps: "6–8",
      muscle: "Hamstrings / Back"
    }, {
      name: "Leg Press",
      sets: "3",
      reps: "10–12",
      muscle: "Quads"
    }, {
      name: "Calf Raise",
      sets: "3",
      reps: "12–15",
      muscle: "Calves"
    }, {
      name: "Wall Sit",
      sets: "3",
      reps: "30–45 sec",
      muscle: "Quads / Endurance"
    }]
  },
  upper: {
    title: "Upper Body",
    subtitle: "Chest · Back · Arms",
    icon: "◈",
    exercises: [{
      name: "Bench Press",
      sets: "4",
      reps: "4–6",
      muscle: "Chest"
    }, {
      name: "Machine Press",
      sets: "3",
      reps: "8–10",
      muscle: "Chest"
    }, {
      name: "Pull-Up",
      sets: "4",
      reps: "Max",
      muscle: "Lats"
    }, {
      name: "Overhead Press",
      sets: "3",
      reps: "5–7",
      muscle: "Shoulders"
    }, {
      name: "Horizontal Row",
      sets: "3",
      reps: "8–10",
      muscle: "Mid Back"
    }, {
      name: "Shrugs",
      sets: "3",
      reps: "10–12",
      muscle: "Traps"
    }, {
      name: "Machine Chest Fly",
      sets: "3",
      reps: "12–15",
      muscle: "Chest"
    }, {
      name: "Seated Hammer Curl",
      sets: "3",
      reps: "10–12",
      muscle: "Brachialis"
    }, {
      name: "Triceps Pressdown (Bar)",
      sets: "3",
      reps: "10–12",
      muscle: "Triceps"
    }]
  },
  legs: {
    title: "Leg Day",
    subtitle: "Quads · Hamstrings · Calves",
    icon: "⬡",
    exercises: [{
      name: "Deadlift",
      sets: "4",
      reps: "4–5",
      muscle: "Hamstrings / Back"
    }, {
      name: "Squat",
      sets: "3",
      reps: "8–10",
      muscle: "Quads / Glutes"
    }, {
      name: "Leg Press",
      sets: "3",
      reps: "10–12",
      muscle: "Quads"
    }, {
      name: "Hamstring Curl",
      sets: "3",
      reps: "10–12",
      muscle: "Hamstrings"
    }, {
      name: "Calf Raise",
      sets: "3",
      reps: "12–15",
      muscle: "Calves"
    }, {
      name: "Wall Sit",
      sets: "3",
      reps: "30–45 sec",
      muscle: "Quads / Endurance"
    }]
  },
  push: {
    title: "Push Day",
    subtitle: "Chest · Shoulders · Triceps",
    icon: "↑",
    exercises: [{
      name: "Bench Press",
      sets: "4",
      reps: "4–6",
      muscle: "Chest"
    }, {
      name: "Machine Press",
      sets: "3",
      reps: "8–10",
      muscle: "Chest"
    }, {
      name: "Overhead Press",
      sets: "3",
      reps: "5–7",
      muscle: "Shoulders"
    }, {
      name: "Lateral Raise",
      sets: "3",
      reps: "12–15",
      muscle: "Side Delts"
    }, {
      name: "Triceps Pressdown (Bar)",
      sets: "3",
      reps: "10–12",
      muscle: "Triceps"
    }, {
      name: "Overhead Triceps Press (Rope)",
      sets: "3",
      reps: "8–10",
      muscle: "Triceps Long Head"
    }, {
      name: "Push-Ups",
      sets: "2",
      reps: "Max",
      muscle: "Chest / Triceps"
    }]
  }
};
const DEFAULT_DAY_NAMES = {
  pull: {
    title: "Pull Day",
    subtitle: "Back · Biceps · Chest"
  },
  rest: {
    title: "Rest Day",
    subtitle: "Recovery & Mobility"
  },
  lower: {
    title: "Lower Body",
    subtitle: "Quads · Hamstrings · Calves"
  },
  upper: {
    title: "Upper Body",
    subtitle: "Chest · Back · Arms"
  },
  legs: {
    title: "Leg Day",
    subtitle: "Quads · Hamstrings · Calves"
  },
  push: {
    title: "Push Day",
    subtitle: "Chest · Shoulders · Triceps"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TRACKING
// ─────────────────────────────────────────────────────────────────────────────
const TRACKING_ORDER = ["Bench Press", "Squat", "Deadlift", "Pull-Up", "Overhead Press", "Horizontal Row", "Machine Press", "Machine Chest Fly", "Push-Ups", "Shrugs", "Hamstring Curl", "Leg Press", "Preacher Curl", "Seated Hammer Curl", "Triceps Pressdown (Bar)", "Overhead Triceps Press (Rope)", "Lateral Raise", "Calf Raise", "Wall Sit", "Dead Hang"];

// Default 1RM lift list — stored in localStorage so the user can add/remove
const DEFAULT_RM_LIFTS = ["Squat", "Bench Press", "Deadlift", "Pull-Up"];
const DEFAULT_RM_REPS_LIFTS = ["Pull-Up"]; // lifts that track max reps, not max weight
// Color pool — assigned by position, cycles if list grows beyond 8
const RM_COLORS = ["#c8f542", "#f54275", "#f5a142", "#42c8f5", "#a142f5", "#f5e642", "#42f5c8", "#f54242"];
const DOW_MAP = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 0
};
const FONT_SIZES = {
  small: {
    base: 12,
    title: 26,
    exercise: 13,
    stat: 20
  },
  medium: {
    base: 15,
    title: 30,
    exercise: 15,
    stat: 24
  },
  large: {
    base: 17,
    title: 34,
    exercise: 17,
    stat: 28
  }
};

// Cross-exercise 1RM correlations
const CORRELATIONS = {
  "Bench Press": {
    "Machine Press": 0.70,
    "Machine Chest Fly": 0.40,
    "Overhead Press": 0.20,
    "Push-Ups": 0.20
  },
  "Machine Press": {
    "Bench Press": 0.70,
    "Machine Chest Fly": 0.40,
    "Push-Ups": 0.20
  },
  "Machine Chest Fly": {
    "Bench Press": 0.40,
    "Machine Press": 0.40
  },
  "Squat": {
    "Leg Press": 0.40,
    "Deadlift": 0.30
  },
  "Deadlift": {
    "Squat": 0.30,
    "Horizontal Row": 0.20,
    "Shrugs": 0.20
  },
  "Pull-Up": {
    "Horizontal Row": 0.50,
    "Seated Hammer Curl": 0.15,
    "Preacher Curl": 0.15
  },
  "Horizontal Row": {
    "Pull-Up": 0.50,
    "Shrugs": 0.20
  },
  "Overhead Press": {
    "Lateral Raise": 0.25,
    "Bench Press": 0.20
  },
  "Triceps Pressdown (Bar)": {
    "Overhead Triceps Press (Rope)": 0.60
  },
  "Overhead Triceps Press (Rope)": {
    "Triceps Pressdown (Bar)": 0.60
  },
  "Preacher Curl": {
    "Seated Hammer Curl": 0.55
  },
  "Seated Hammer Curl": {
    "Preacher Curl": 0.55
  },
  "Leg Press": {
    "Squat": 0.45,
    "Hamstring Curl": 0.20
  },
  "Hamstring Curl": {
    "Deadlift": 0.30,
    "Leg Press": 0.20
  },
  "Shrugs": {
    "Deadlift": 0.35,
    "Horizontal Row": 0.25
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getNZDay() {
  return new Date(new Date().toLocaleString("en-US", {
    timeZone: "Pacific/Auckland"
  })).getDay();
}
function getNZDate() {
  return new Date().toLocaleDateString("en-NZ", {
    timeZone: "Pacific/Auckland",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
function lsGet(key, fb) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fb;
  } catch (e) {
    return fb;
  }
}
function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}
function lsClear(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

// Epley 1RM — doubles weight for dumbbell exercises (per-hand input)
function epley(w, r, exName) {
  const ww = parseFloat(w),
    rr = parseInt(r);
  if (!ww || !rr || rr < 1) return null;
  const total = DUMBBELL.has(exName) ? ww * 2 : ww;
  return rr === 1 ? total : total * (1 + rr / 30);
}

// Recency-weighted average 1RM across full history (0.85 decay per entry)
function weightedRM(history, exName) {
  if (!history || !history.length) return null;
  let val = 0,
    wt = 0;
  history.forEach((e, i) => {
    const rm = epley(e.weight, e.reps, exName);
    if (!rm) return;
    const w = Math.pow(0.85, i);
    val += rm * w;
    wt += w;
  });
  return wt > 0 ? val / wt : null;
}

// Projected 1RM — direct history first, falls back to correlated exercises
function projectedRM(exName, logs) {
  const direct = weightedRM(logs[exName], exName);
  if (direct) {
    const t = Math.round(direct);
    return DUMBBELL.has(exName) ? Math.round(t / 2) : t;
  }
  const corrs = CORRELATIONS[exName] || {};
  let val = 0,
    wt = 0;
  Object.entries(corrs).forEach(([rel, factor]) => {
    const rm = weightedRM(logs[rel], rel);
    if (!rm) return;
    val += rm * factor;
    wt += factor;
  });
  if (wt <= 0) return null;
  const t = Math.round(val / wt);
  return DUMBBELL.has(exName) ? Math.round(t / 2) : t;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEXT-SESSION SUGGESTION
// Returns a recommended weight + rep target based on the user's log history
// for that specific exercise.  Returns null when there is no history.
//
//   Isometric         → +10% time, min +5 s
//   reps ≥ top range  → bump weight by increment, reset to bottom of range
//   reps < bottom     → hold weight, target the minimum
//   reps within range → hold weight, add one rep
//   "Max" reps        → same weight (or BW), beat last count by 1
//
// Weight increments: dumbbell +1 kg/hand | everything else +2.5 kg
// ─────────────────────────────────────────────────────────────────────────────
function getNextSuggestion(exName, logs, exRepsStr) {
  const isIso = ISOMETRIC.has(exName);
  const isDumb = DUMBBELL.has(exName);
  const inc = isDumb ? 1 : 2.5;
  if (isIso) {
    const h = logs[exName];
    if (!h || !h.length) return null;
    const s = h[0].seconds || 0;
    return {
      text: "→ " + Math.max(s + 5, Math.round(s * 1.10)) + "s",
      increase: false
    };
  }
  let minR = null,
    maxR = null;
  const isMaxReps = !exRepsStr || String(exRepsStr).trim() === "Max";
  if (!isMaxReps) {
    const rm = String(exRepsStr).match(/(\d+)[–\-](\d+)/);
    const sm = String(exRepsStr).match(/^(\d+)/);
    if (rm) {
      minR = parseInt(rm[1], 10);
      maxR = parseInt(rm[2], 10);
    } else if (sm) {
      minR = parseInt(sm[1], 10);
      maxR = minR;
    }
  }
  const hasHistory = !!(logs[exName] && logs[exName].length);
  const last = hasHistory ? logs[exName][0] : null;
  if (isMaxReps || maxR === null) {
    if (!last) return null;
    const lw = parseFloat(last.weight) || 0;
    const lr = parseInt(last.reps, 10) || 0;
    const wPart = lw === 0 ? "BW" : (lw % 1 === 0 ? String(lw) : lw.toFixed(1)) + (isDumb ? "kg/hand" : "kg");
    return {
      text: "→ " + wPart + " × " + (lr + 1) + "+",
      increase: false
    };
  }
  if (!hasHistory) return null;
  const lw = parseFloat(last.weight) || 0;
  const lr = parseInt(last.reps, 10) || 0;
  let sugW = lw,
    sugR = lr,
    increase = false;
  if (lr >= maxR) {
    sugW = Math.round((lw + inc) * 10) / 10;
    sugR = minR;
    increase = true;
  } else if (lr < minR) {
    sugR = minR;
  } else {
    sugR = Math.min(lr + 1, maxR);
  }
  const wPart = sugW === 0 ? "BW" : (sugW % 1 === 0 ? String(sugW) : sugW.toFixed(1)) + (isDumb ? "kg/hand" : "kg");
  return {
    text: (increase ? "↑ " : "→ ") + wPart + " × " + sugR,
    increase
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const todayDow = getNZDay();
  const todaySched = SCHEDULE.find(s => DOW_MAP[s.day] === todayDow);

  // ── Initialise persistent state — version check wipes stale data on upgrade ──
  const [workouts, setWorkouts] = useState(() => {
    const v = lsGet("wl-v", 0);
    if (v < V) {
      lsSet("wl-v", V);
      lsClear("wl-wo");
      lsClear("wl-dn");
      lsClear("wl-logs");
      lsClear("wl-rm");
      return DEFAULT_WORKOUTS;
    }
    return lsGet("wl-wo", DEFAULT_WORKOUTS);
  });
  const [dayNames, setDayNames] = useState(() => {
    // wl-v was already set to V by workouts init if it was stale,
    // so a second read here always reflects the current version.
    return lsGet("wl-v", 0) < V ? DEFAULT_DAY_NAMES : lsGet("wl-dn", DEFAULT_DAY_NAMES);
  });
  const [workoutLogs, setWorkoutLogs] = useState(() => lsGet("wl-logs", {}));
  const [rmHistory, setRmHistory] = useState(() => lsGet("wl-rm", {}));
  const [rmLifts, setRmLifts] = useState(() => lsGet("wl-rm-lifts", DEFAULT_RM_LIFTS));
  const [rmRepsLifts, setRmRepsLifts] = useState(() => new Set(lsGet("wl-rm-reps", DEFAULT_RM_REPS_LIFTS)));
  const [fontSize, setFontSize] = useState(() => lsGet("wl-fs", "medium"));

  // ── UI state ──
  const [page, setPage] = useState("program");
  const [active, setActive] = useState(todaySched ? todaySched.type : "pull");
  const [openLog, setOpenLog] = useState(null);
  const [logWeight, setLogWeight] = useState("");
  const [logReps, setLogReps] = useState("");
  const [openCard, setOpenCard] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(null);
  const [settingsDay, setSettingsDay] = useState(null);
  const [editExIdx, setEditExIdx] = useState(null);
  const [editField, setEditField] = useState({
    name: "",
    sets: "",
    reps: "",
    muscle: ""
  });
  const [addingEx, setAddingEx] = useState(false);
  const [newEx, setNewEx] = useState({
    name: "",
    sets: "3",
    reps: "8–10",
    muscle: ""
  });
  const [editDayType, setEditDayType] = useState(null);
  const [dayNameField, setDayNameField] = useState({
    title: "",
    subtitle: ""
  });
  // rmInput is keyed by lift name — initialised for all current lifts
  const [rmInput, setRmInput] = useState(() => Object.fromEntries(lsGet("wl-rm-lifts", DEFAULT_RM_LIFTS).map(l => [l, ""])));
  const [newRmLift, setNewRmLift] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [showCSV, setShowCSV] = useState(false);

  // ── Drag-to-reorder (settings panel → Edit Exercises) ──
  // dragState drives the visual; dragRef holds the live values so the
  // global mousemove/touchmove listeners never read stale closure state.
  const [dragState, setDragState] = useState(null);
  // dragState shape: { day: string, fromIdx: number, toIdx: number } | null
  const dragRef = useRef(null);

  // ── Drag-to-reorder handlers ──

  // Called on mousedown/touchstart on a drag handle.
  // Refuses to start if an edit form is open (avoids conflicting with inputs).
  function startDrag(day, idx, e) {
    if (editExIdx !== null || addingEx) return;
    e.preventDefault();
    const info = {
      day,
      fromIdx: idx,
      toIdx: idx
    };
    dragRef.current = info;
    setDragState(info);
  }

  // Called on window mousemove/touchmove while dragging.
  // Uses document.elementFromPoint so touch events (which don't fire
  // onMouseEnter on other elements) still detect which row is hovered.
  function onDragMove(e) {
    if (!dragRef.current) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;
    const row = target.closest("[data-drag-row]");
    if (!row || row.dataset.dragDay !== dragRef.current.day) return;
    const toIdx = parseInt(row.dataset.dragIdx, 10);
    if (toIdx !== dragRef.current.toIdx) {
      const next = {
        ...dragRef.current,
        toIdx
      };
      dragRef.current = next;
      setDragState(next);
    }
  }

  // Called on window mouseup/touchend — commits the reorder.
  // Uses functional updater so it always operates on the latest workouts.
  function commitDrag() {
    const ds = dragRef.current;
    if (!ds) return;
    dragRef.current = null;
    setDragState(null);
    if (ds.fromIdx === ds.toIdx) return;
    setWorkouts(prev => {
      const u = JSON.parse(JSON.stringify(prev));
      const exs = u[ds.day].exercises;
      const [moved] = exs.splice(ds.fromIdx, 1);
      exs.splice(ds.toIdx, 0, moved);
      return u;
    });
  }

  // Attach global listeners only while a drag is in progress.
  // !!dragState (boolean) means the effect only re-runs when drag
  // starts or stops, not on every toIdx update — so the listeners
  // are attached once and removed once per drag gesture.
  // touchmove is non-passive so we can call preventDefault() and
  // prevent the page from scrolling while the user is dragging.
  useEffect(() => {
    if (!dragState) return;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", commitDrag);
    window.addEventListener("touchmove", onDragMove, {
      passive: false
    });
    window.addEventListener("touchend", commitDrag);
    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", commitDrag);
      window.removeEventListener("touchmove", onDragMove);
      window.removeEventListener("touchend", commitDrag);
    };
  }, [!!dragState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to localStorage on every relevant state change ──
  useEffect(() => {
    lsSet("wl-wo", workouts);
  }, [workouts]);
  useEffect(() => {
    lsSet("wl-dn", dayNames);
  }, [dayNames]);
  useEffect(() => {
    lsSet("wl-logs", workoutLogs);
  }, [workoutLogs]);
  useEffect(() => {
    lsSet("wl-rm", rmHistory);
  }, [rmHistory]);
  useEffect(() => {
    lsSet("wl-rm-lifts", rmLifts);
  }, [rmLifts]);
  useEffect(() => {
    lsSet("wl-rm-reps", [...rmRepsLifts]);
  }, [rmRepsLifts]);
  useEffect(() => {
    lsSet("wl-fs", fontSize);
  }, [fontSize]);

  // ── Derived values ──
  const FS = FONT_SIZES[fontSize] || FONT_SIZES.medium;
  const workout = workouts[active];
  const dayColor = DAY_COLORS[active];
  const schedDay = SCHEDULE.find(s => s.type === active);
  const dn = type => dayNames[type] || DEFAULT_DAY_NAMES[type];
  const totalSets = workout.exercises.reduce((a, e) => a + (parseInt(e.sets) || 0), 0);
  // Set-based estimate: rest periods between sets drive gym time far more than exercise count.
  // Low = 3 min/set + 1 min/exercise | High = 4 min/set + 2 min/exercise
  const estLow = totalSets * 3 + workout.exercises.length;
  const estHigh = totalSets * 4 + workout.exercises.length * 2;
  const estMin = estLow + "–" + estHigh;
  const canLog = TRACKABLE.has(active); // ONLY pull / legs / push can log

  // ── Shared styles ──
  // FIX: inputs must be ≥ 16px to prevent mobile auto-zoom on focus.
  // Math.max ensures we never go below 16 even on "small" font setting.
  const inp = {
    background: "#1a1a1a",
    border: "1px solid #333",
    color: "#f0f0f0",
    padding: "11px 12px",
    fontSize: Math.max(16, FS.base) + "px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  };
  const sinp = {
    background: "#0e0e0e",
    border: "1px solid #2a2a2a",
    color: "#ddd",
    padding: "9px 11px",
    fontSize: "16px",
    // was 13px — fixed to prevent auto-zoom
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  };
  const ghost = {
    background: "transparent",
    border: "1px solid #333",
    color: "#aaa",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "inherit"
  };
  const delS = {
    flexShrink: 0,
    background: "#2a0000",
    border: "1px solid #7a0000",
    color: "#ff6666",
    padding: "8px 14px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "inherit"
  };

  // ── Handlers ──

  function switchDay(type) {
    setActive(type);
    setOpenLog(null); // always close any open log panel when switching day
  }
  function toggleLog(name) {
    // Guard: enforced here (also enforced by canLog in isOpen definition)
    if (!canLog) return;
    setOpenLog(p => p === name ? null : name);
    setLogWeight("");
    setLogReps("");
  }
  function saveLog(exName) {
    if (ISOMETRIC.has(exName)) {
      if (!logReps) return;
      setWorkoutLogs(p => ({
        ...p,
        [exName]: [{
          date: getNZDate(),
          seconds: parseInt(logReps)
        }, ...(p[exName] || [])]
      }));
    } else {
      if (!logWeight || !logReps) return;
      setWorkoutLogs(p => ({
        ...p,
        [exName]: [{
          date: getNZDate(),
          weight: parseFloat(logWeight),
          reps: parseInt(logReps)
        }, ...(p[exName] || [])]
      }));
    }
    setOpenLog(null);
    setLogWeight("");
    setLogReps("");
  }
  function deleteLog(exName, idx) {
    const e = workoutLogs[exName][idx];
    const label = ISOMETRIC.has(exName) ? e.seconds + "s" : e.weight + "kg × " + e.reps;
    setConfirm({
      msg: "Delete " + exName + " log of " + label + " from " + e.date + "?",
      onYes: () => {
        // FIX: use functional updater so we never operate on stale state
        setWorkoutLogs(p => ({
          ...p,
          [exName]: p[exName].filter((_, i) => i !== idx)
        }));
        setConfirm(null);
      }
    });
  }
  function addRmLift() {
    const name = newRmLift.trim();
    if (!name || rmLifts.includes(name)) return;
    setRmLifts(p => [...p, name]);
    setRmInput(p => ({
      ...p,
      [name]: ""
    }));
    setNewRmLift("");
  }
  function removeRmLift(lift) {
    setConfirm({
      msg: "Remove " + lift + " from the 1RM page? Your history is kept — add it back to restore.",
      onYes: () => {
        setRmLifts(p => p.filter(l => l !== lift));
        setConfirm(null);
      }
    });
  }
  function toggleRmLiftType(lift) {
    setRmRepsLifts(prev => {
      const next = new Set(prev);
      next.has(lift) ? next.delete(lift) : next.add(lift);
      return next;
    });
  }
  function saveRM(lift) {
    const val = parseFloat(rmInput[lift]);
    if (!val || val <= 0) return;
    setRmHistory(p => ({
      ...p,
      [lift]: [{
        date: getNZDate(),
        rm: val
      }, ...(p[lift] || [])].slice(0, 999)
    }));
    setRmInput(p => ({
      ...p,
      [lift]: ""
    }));
  }
  function deleteRM(lift, idx) {
    const e = rmHistory[lift][idx];
    setConfirm({
      msg: "Delete " + lift + " 1RM of " + e.rm + "kg from " + e.date + "?",
      onYes: () => {
        setRmHistory(p => ({
          ...p,
          [lift]: p[lift].filter((_, i) => i !== idx)
        }));
        setConfirm(null);
      }
    });
  }

  // FIX: capture all needed values into local consts before the functional
  // updater runs, so we're never reading stale closure variables.
  function saveEditEx() {
    const capDay = settingsDay;
    const capIdx = editExIdx;
    const capField = {
      ...editField
    };
    setWorkouts(prev => {
      const u = JSON.parse(JSON.stringify(prev));
      u[capDay].exercises[capIdx] = {
        ...u[capDay].exercises[capIdx],
        ...capField
      };
      return u;
    });
    setEditExIdx(null);
  }

  // FIX: functional updater so the filter always runs on the latest workouts
  function deleteEx(dayType, idx) {
    const exName = workouts[dayType].exercises[idx].name;
    setConfirm({
      msg: "Delete " + exName + "?",
      onYes: () => {
        setWorkouts(prev => {
          const u = JSON.parse(JSON.stringify(prev));
          u[dayType].exercises = u[dayType].exercises.filter((_, i) => i !== idx);
          return u;
        });
        setConfirm(null);
      }
    });
  }

  // FIX: functional updater so we push onto the true latest exercises array
  function addEx() {
    if (!newEx.name.trim()) return;
    const capDay = settingsDay;
    const capEx = {
      ...newEx
    };
    setWorkouts(prev => {
      const u = JSON.parse(JSON.stringify(prev));
      u[capDay].exercises.push({
        name: capEx.name.trim(),
        sets: capEx.sets || "3",
        reps: capEx.reps || "8–10",
        muscle: capEx.muscle || ""
      });
      return u;
    });
    setAddingEx(false);
    setNewEx({
      name: "",
      sets: "3",
      reps: "8–10",
      muscle: ""
    });
  }
  function saveDayName() {
    const capType = editDayType;
    const capField = {
      ...dayNameField
    };
    setDayNames(p => ({
      ...p,
      [capType]: {
        title: capField.title,
        subtitle: capField.subtitle
      }
    }));
    setEditDayType(null);
  }
  function buildCSV() {
    const rows = [["Exercise", "Date", "Weight (kg)", "Reps", "Seconds", "Projected 1RM (kg)"]];
    const all = new Set([...TRACKING_ORDER, ...Object.keys(workoutLogs)]);
    all.forEach(ex => {
      const h = workoutLogs[ex];
      if (!h || !h.length) return;
      const isIso = ISOMETRIC.has(ex);
      const proj = !isIso ? projectedRM(ex, workoutLogs) : "";
      h.forEach((e, i) => rows.push([ex, e.date, isIso ? "" : e.weight, isIso ? "" : e.reps, isIso ? e.seconds : "", i === 0 && proj ? proj : ""]));
    });
    return rows.map(r => r.map(c => '"' + String(c || "") + '"').join(",")).join("\n");
  }

  // Ordered list of exercises that have at least one log entry
  const trackedList = [...TRACKING_ORDER, ...Object.keys(workoutLogs).filter(n => !TRACKING_ORDER.includes(n))].filter(n => workoutLogs[n] && workoutLogs[n].length > 0);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // Outer div fills the screen with the app's dark background.
  // On desktop (≥768px) the inner app container is centred at 480px wide.
  // On mobile it is full-width, exactly as before.
  // ─────────────────────────────────────────────────────────────────────────
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#0c0c0c"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#0c0c0c",
      fontFamily: "'Courier New',Courier,monospace",
      color: "#e8e8e8",
      overflowX: "hidden",
      fontSize: FS.base + "px",
      position: "relative"
    }
  }, confirm && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 400,
      padding: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#161616",
      border: "1px solid #333",
      padding: "28px",
      maxWidth: "360px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: "#555",
      marginBottom: "12px"
    }
  }, "CONFIRM DELETE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: FS.base + "px",
      color: "#eee",
      lineHeight: 1.7,
      marginBottom: "24px"
    }
  }, confirm.msg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirm(null),
    style: ghost
  }, "NO, KEEP IT"), /*#__PURE__*/React.createElement("button", {
    onClick: confirm.onYes,
    style: {
      ...ghost,
      background: "#3a0000",
      border: "1px solid #7a0000",
      color: "#ff6666"
    }
  }, "YES, DELETE")))), showSettings && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 200
    },
    onClick: () => setShowSettings(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: "min(340px,100vw)",
      background: "#111",
      borderLeft: "1px solid #222",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px 16px",
      borderBottom: "1px solid #222"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "17px",
      fontWeight: "bold",
      color: "#fff"
    }
  }, "Settings"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSettings(false),
    style: {
      background: "transparent",
      border: "none",
      color: "#777",
      fontSize: "24px",
      cursor: "pointer",
      lineHeight: 1,
      padding: "0 0 0 12px"
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "scroll",
      WebkitOverflowScrolling: "touch",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: "#555",
      marginBottom: "12px"
    }
  }, "FONT SIZE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "8px"
    }
  }, ["small", "medium", "large"].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setFontSize(s),
    style: {
      background: fontSize === s ? "#c8f542" : "transparent",
      border: "1px solid " + (fontSize === s ? "#c8f542" : "#333"),
      color: fontSize === s ? "#0c0c0c" : "#888",
      padding: "12px",
      fontSize: "12px",
      fontWeight: "bold",
      letterSpacing: "0.1em",
      cursor: "pointer",
      fontFamily: "inherit",
      textTransform: "uppercase"
    }
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: "#555",
      marginBottom: "12px"
    }
  }, "EDIT DAYS"), SCHEDULE.map(s => {
    const open = settingsDay === s.type;
    return /*#__PURE__*/React.createElement("div", {
      key: s.type,
      style: {
        marginBottom: "5px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (open) {
          setSettingsDay(null);
          setSettingsOpen(null);
          setEditExIdx(null);
          setAddingEx(false);
          setEditDayType(null);
        } else {
          setSettingsDay(s.type);
          setSettingsOpen("combined");
          setEditExIdx(null);
          setAddingEx(false);
          setEditDayType(s.type);
          setDayNameField({
            title: dn(s.type).title,
            subtitle: dn(s.type).subtitle
          });
        }
      },
      style: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: open ? "#1a1a1a" : "transparent",
        border: "1px solid " + (open ? DAY_COLORS[s.type] : "#2a2a2a"),
        padding: "12px 14px",
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "13px",
        color: open ? DAY_COLORS[s.type] : "#ccc",
        fontWeight: "bold",
        textAlign: "left"
      }
    }, dn(s.type).title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        color: "#555",
        marginTop: "2px",
        textAlign: "left"
      }
    }, s.label)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "13px",
        color: "#444"
      }
    }, open ? "▲" : "▼")), open && /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid #1e1e1e",
        borderTop: "none",
        background: "#0e0e0e"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px",
        borderBottom: "1px solid #222"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#555",
        letterSpacing: "0.15em",
        marginBottom: "8px"
      }
    }, "DAY NAME"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#444",
        letterSpacing: "0.12em",
        marginBottom: "3px"
      }
    }, "TITLE"), /*#__PURE__*/React.createElement("input", {
      value: dayNameField.title,
      onChange: e => setDayNameField(p => ({
        ...p,
        title: e.target.value
      })),
      style: sinp
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#444",
        letterSpacing: "0.12em",
        marginBottom: "3px"
      }
    }, "SUBTITLE"), /*#__PURE__*/React.createElement("input", {
      value: dayNameField.subtitle,
      onChange: e => setDayNameField(p => ({
        ...p,
        subtitle: e.target.value
      })),
      style: sinp
    })), /*#__PURE__*/React.createElement("button", {
      onClick: saveDayName,
      style: {
        background: DAY_COLORS[s.type],
        border: "none",
        color: "#0c0c0c",
        padding: "9px",
        fontSize: "11px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.1em"
      }
    }, "SAVE NAME"))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#555",
        letterSpacing: "0.15em",
        padding: "10px 12px 4px"
      }
    }, "EXERCISES"), workouts[s.type].exercises.map((ex, idx) => {
      const ds = dragState;
      const isThisDay = ds && ds.day === s.type;
      const isSource = isThisDay && ds.fromIdx === idx;
      const isTarget = isThisDay && ds.toIdx === idx && ds.fromIdx !== idx;
      const dropAbove = isTarget && ds.fromIdx > idx;
      const dropBelow = isTarget && ds.fromIdx < idx;
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        style: {
          borderBottom: "1px solid #1a1a1a"
        }
      }, editExIdx === idx ? /*#__PURE__*/React.createElement("div", {
        style: {
          padding: "12px",
          background: "#161616"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "9px",
          color: "#555",
          letterSpacing: "0.15em",
          marginBottom: "4px"
        }
      }, "NAME"), /*#__PURE__*/React.createElement("input", {
        value: editField.name,
        onChange: e => setEditField(p => ({
          ...p,
          name: e.target.value
        })),
        style: sinp
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px"
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "9px",
          color: "#555",
          letterSpacing: "0.15em",
          marginBottom: "4px"
        }
      }, "SETS"), /*#__PURE__*/React.createElement("input", {
        value: editField.sets,
        onChange: e => setEditField(p => ({
          ...p,
          sets: e.target.value
        })),
        style: sinp
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "9px",
          color: "#555",
          letterSpacing: "0.15em",
          marginBottom: "4px"
        }
      }, "REPS"), /*#__PURE__*/React.createElement("input", {
        value: editField.reps,
        onChange: e => setEditField(p => ({
          ...p,
          reps: e.target.value
        })),
        style: sinp
      }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "9px",
          color: "#555",
          letterSpacing: "0.15em",
          marginBottom: "4px"
        }
      }, "MUSCLE"), /*#__PURE__*/React.createElement("input", {
        value: editField.muscle,
        onChange: e => setEditField(p => ({
          ...p,
          muscle: e.target.value
        })),
        style: sinp
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px"
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setEditExIdx(null),
        style: {
          ...ghost,
          padding: "8px",
          fontSize: "11px"
        }
      }, "CANCEL"), /*#__PURE__*/React.createElement("button", {
        onClick: saveEditEx,
        style: {
          background: "#c8f542",
          border: "none",
          color: "#0c0c0c",
          padding: "8px",
          fontSize: "11px",
          fontWeight: "bold",
          cursor: "pointer",
          fontFamily: "inherit"
        }
      }, "SAVE")))) : /*#__PURE__*/React.createElement("div", {
        "data-drag-row": "true",
        "data-drag-day": s.type,
        "data-drag-idx": String(idx),
        style: {
          display: "flex",
          alignItems: "center",
          padding: "11px 12px",
          opacity: isSource ? 0.3 : 1,
          borderTop: dropAbove ? "2px solid " + DAY_COLORS[s.type] : undefined,
          borderBottom: dropBelow ? "2px solid " + DAY_COLORS[s.type] : "1px solid #1a1a1a",
          background: isSource ? "#222" : "transparent"
        }
      }, /*#__PURE__*/React.createElement("div", {
        onMouseDown: e => startDrag(s.type, idx, e),
        onTouchStart: e => startDrag(s.type, idx, e),
        style: {
          cursor: "grab",
          color: isThisDay ? DAY_COLORS[s.type] : "#444",
          fontSize: "18px",
          paddingRight: "10px",
          paddingLeft: "2px",
          userSelect: "none",
          touchAction: "none",
          lineHeight: 1,
          flexShrink: 0
        }
      }, "\u2261"), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "12px",
          color: "#ddd",
          fontWeight: "bold"
        }
      }, ex.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "10px",
          color: "#555",
          marginTop: "1px"
        }
      }, ex.sets ? ex.sets + " sets · " : "", ex.reps)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: "6px",
          flexShrink: 0,
          marginLeft: "6px",
          pointerEvents: isThisDay ? "none" : "auto",
          opacity: isThisDay ? 0.25 : 1
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setEditExIdx(idx);
          setEditField({
            name: ex.name || "",
            sets: ex.sets || "",
            reps: ex.reps || "",
            muscle: ex.muscle || ""
          });
        },
        style: {
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#aaa",
          padding: "6px 10px",
          fontSize: "10px",
          cursor: "pointer",
          fontFamily: "inherit"
        }
      }, "EDIT"), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteEx(s.type, idx),
        style: {
          ...delS,
          padding: "6px 10px",
          fontSize: "10px"
        }
      }, "DEL"))));
    }), addingEx ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px",
        background: "#161616"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#555",
        letterSpacing: "0.15em",
        marginBottom: "4px"
      }
    }, "NAME"), /*#__PURE__*/React.createElement("input", {
      placeholder: "e.g. Dumbbell Row",
      value: newEx.name,
      onChange: e => setNewEx(p => ({
        ...p,
        name: e.target.value
      })),
      style: sinp
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#555",
        letterSpacing: "0.15em",
        marginBottom: "4px"
      }
    }, "SETS"), /*#__PURE__*/React.createElement("input", {
      placeholder: "3",
      value: newEx.sets,
      onChange: e => setNewEx(p => ({
        ...p,
        sets: e.target.value
      })),
      style: sinp
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#555",
        letterSpacing: "0.15em",
        marginBottom: "4px"
      }
    }, "REPS"), /*#__PURE__*/React.createElement("input", {
      placeholder: "8\u201310",
      value: newEx.reps,
      onChange: e => setNewEx(p => ({
        ...p,
        reps: e.target.value
      })),
      style: sinp
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        color: "#555",
        letterSpacing: "0.15em",
        marginBottom: "4px"
      }
    }, "MUSCLE"), /*#__PURE__*/React.createElement("input", {
      placeholder: "e.g. Mid Back",
      value: newEx.muscle,
      onChange: e => setNewEx(p => ({
        ...p,
        muscle: e.target.value
      })),
      style: sinp
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setAddingEx(false),
      style: {
        ...ghost,
        padding: "8px",
        fontSize: "11px"
      }
    }, "CANCEL"), /*#__PURE__*/React.createElement("button", {
      onClick: addEx,
      style: {
        background: "#c8f542",
        border: "none",
        color: "#0c0c0c",
        padding: "8px",
        fontSize: "11px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, "ADD")))) : /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setAddingEx(true);
        setEditExIdx(null);
      },
      style: {
        width: "100%",
        background: "transparent",
        border: "none",
        color: "#c8f542",
        padding: "12px",
        fontSize: "11px",
        fontWeight: "bold",
        letterSpacing: "0.15em",
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, "+ ADD EXERCISE")));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: "#555",
      marginBottom: "12px"
    }
  }, "EDIT 1RM LIFTS"), rmLifts.map((lift, idx) => {
    const isReps = rmRepsLifts.has(lift);
    return /*#__PURE__*/React.createElement("div", {
      key: lift,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #1a1a1a",
        padding: "10px 0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 1,
        flexShrink: 0,
        background: RM_COLORS[idx % RM_COLORS.length]
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: "12px",
        color: "#ddd",
        fontWeight: "bold"
      }
    }, lift), /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleRmLiftType(lift),
      style: {
        background: isReps ? "#42c8f5" : "transparent",
        border: "1px solid " + (isReps ? "#42c8f5" : "#333"),
        color: isReps ? "#0c0c0c" : "#555",
        padding: "4px 8px",
        fontSize: "9px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.1em",
        flexShrink: 0
      }
    }, isReps ? "REPS" : "KG"), /*#__PURE__*/React.createElement("button", {
      onClick: () => removeRmLift(lift),
      style: {
        ...delS,
        padding: "5px 10px",
        fontSize: "10px"
      }
    }, "DEL"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: "8px",
      marginTop: "12px"
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "e.g. Overhead Press",
    value: newRmLift,
    onChange: e => setNewRmLift(e.target.value),
    onKeyDown: e => e.key === "Enter" && addRmLift(),
    style: sinp
  }), /*#__PURE__*/React.createElement("button", {
    onClick: addRmLift,
    style: {
      background: "#c8f542",
      border: "none",
      color: "#0c0c0c",
      padding: "9px 14px",
      fontSize: "11px",
      fontWeight: "bold",
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, "ADD"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: "#555",
      marginBottom: "12px"
    }
  }, "DANGER ZONE"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirm({
      msg: "Reset all exercises to defaults? Cannot be undone.",
      onYes: () => {
        setWorkouts(DEFAULT_WORKOUTS);
        setDayNames(DEFAULT_DAY_NAMES);
        setConfirm(null);
      }
    }),
    style: {
      ...ghost,
      width: "100%",
      color: "#ff6666",
      border: "1px solid #5a0000",
      textAlign: "center"
    }
  }, "RESET ALL EXERCISES TO DEFAULT"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 16px 0",
      borderBottom: "1px solid #222"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10px",
      letterSpacing: "0.35em",
      color: "#444"
    }
  }, "6-DAY"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      height: "14px",
      background: "#333"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#fff",
      letterSpacing: "0.05em"
    }
  }, "TRAINING SPLIT")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSettings(true),
    style: {
      background: "transparent",
      border: "1px solid #2a2a2a",
      color: "#888",
      padding: "8px 12px",
      fontSize: "17px",
      cursor: "pointer",
      fontFamily: "inherit",
      lineHeight: 1
    }
  }, "\u2699")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, [["program", "PROGRAM"], ["tracking", "TRACKING"], ["1rm", "1RM"]].map(([p, label], pi) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => setPage(p),
    style: {
      background: page === p ? "#fff" : "transparent",
      border: "1px solid #2a2a2a",
      borderBottom: page === p ? "1px solid #0c0c0c" : "1px solid #2a2a2a",
      borderRight: pi < 2 ? "none" : "1px solid #2a2a2a",
      color: page === p ? "#0c0c0c" : "#555",
      padding: "10px 18px",
      fontSize: "10px",
      letterSpacing: "0.2em",
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: "bold",
      marginBottom: page === p ? "-1px" : "0",
      position: "relative",
      zIndex: page === p ? 1 : 0
    }
  }, label)))), page === "program" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      borderBottom: "1px solid #222"
    }
  }, SCHEDULE.map((s, idx) => {
    const isActive = active === s.type;
    const isToday = DOW_MAP[s.day] === todayDow;
    const dc = DAY_COLORS[s.type];
    return /*#__PURE__*/React.createElement("button", {
      key: s.day,
      onClick: () => switchDay(s.type),
      style: {
        background: isActive ? dc : "transparent",
        border: "none",
        borderRight: idx < 6 ? "1px solid #222" : "none",
        padding: "14px 2px 12px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "9px",
        letterSpacing: "0.15em",
        fontWeight: "bold",
        color: isActive ? "#0c0c0c" : "#444"
      }
    }, s.day), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "20px",
        color: isActive ? "#0c0c0c" : dc,
        opacity: isActive ? 1 : 0.7,
        lineHeight: 1
      }
    }, workouts[s.type].icon), isToday && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        bottom: 5,
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: isActive ? "#0c0c0c" : dc
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "10px",
      letterSpacing: "0.3em",
      color: dayColor,
      opacity: 0.8,
      marginBottom: "5px"
    }
  }, schedDay ? schedDay.label.toUpperCase() : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: FS.title + "px",
      fontWeight: "bold",
      color: dayColor,
      lineHeight: 1
    }
  }, dn(active).title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#555",
      marginTop: "5px",
      letterSpacing: "0.08em"
    }
  }, dn(active).subtitle.toUpperCase())), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "50px",
      color: dayColor,
      opacity: 0.1,
      lineHeight: 1
    }
  }, workout.icon)), active === "rest" ? /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid #1c1c1c",
      padding: "28px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "32px",
      marginBottom: "10px",
      opacity: 0.3
    }
  }, "\u25CE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#333",
      letterSpacing: "0.25em"
    }
  }, "REST \xB7 RECOVER \xB7 GROW"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "20px"
    }
  }, workout.exercises.map((ex, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      borderTop: "1px solid #1a1a1a",
      padding: "12px 0",
      fontSize: FS.base + "px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#666"
    }
  }, ex.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#444"
    }
  }, ex.reps))))) :
  /*#__PURE__*/
  // Exercise table — FIX: use <Fragment key={ex.name}> so React
  // can correctly track each row-pair. The old anonymous <>...</>
  // had no key, which caused React to mis-reconcile rows when
  // the log panel opened/closed, making taps appear to do nothing
  // or open the wrong exercise.
  React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed"
    }
  }, /*#__PURE__*/React.createElement("colgroup", null, /*#__PURE__*/React.createElement("col", {
    style: {
      width: "30px"
    }
  }), /*#__PURE__*/React.createElement("col", null), /*#__PURE__*/React.createElement("col", {
    style: {
      width: "44px"
    }
  }), /*#__PURE__*/React.createElement("col", {
    style: {
      width: "76px"
    }
  })), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "2px solid " + dayColor
    }
  }, [["#", "left"], ["Exercise", "left"], ["Sets", "center"], ["Reps", "center"]].map(([h, a]) => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      fontSize: "10px",
      letterSpacing: "0.2em",
      color: "#444",
      textTransform: "uppercase",
      fontWeight: "normal",
      paddingBottom: "10px",
      textAlign: a
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, workout.exercises.map((ex, i) => {
    const isOpen = canLog && openLog === ex.name;
    const lastEntry = workoutLogs[ex.name] ? workoutLogs[ex.name][0] : null;
    const isIso = ISOMETRIC.has(ex.name);
    const isDumb = DUMBBELL.has(ex.name);
    const suggestion = !isOpen ? getNextSuggestion(ex.name, workoutLogs, ex.reps) : null;
    return /*#__PURE__*/React.createElement(Fragment, {
      key: ex.name
    }, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: isOpen ? "none" : "1px solid #1e1e1e",
        cursor: canLog ? "pointer" : "default",
        background: isOpen ? "#161616" : "transparent"
      },
      onClick: () => toggleLog(ex.name),
      onMouseEnter: e => {
        if (canLog && !isOpen) e.currentTarget.style.background = "#161616";
      },
      onMouseLeave: e => {
        if (canLog && !isOpen) e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: "11px",
        color: dayColor,
        opacity: 0.8,
        fontWeight: "bold",
        verticalAlign: "top",
        paddingTop: "16px",
        paddingBottom: "14px"
      }
    }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("td", {
      style: {
        verticalAlign: "middle",
        padding: "14px 10px 14px 0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: FS.exercise + "px",
        color: "#f0f0f0",
        fontWeight: "bold"
      }
    }, ex.name), canLog && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "12px",
        color: isOpen ? dayColor : "#444",
        marginLeft: "5px"
      }
    }, isOpen ? "▲" : "▼")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "11px",
        color: "#555",
        textTransform: "uppercase",
        marginTop: "3px",
        letterSpacing: "0.08em"
      }
    }, ex.muscle), lastEntry && !isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        color: "#2a5a2a",
        marginTop: "2px"
      }
    }, isIso ? "Last: " + lastEntry.seconds + "s · " + lastEntry.date : isDumb ? "Last: " + lastEntry.weight + "kg/hand × " + lastEntry.reps + " · " + lastEntry.date : "Last: " + lastEntry.weight + "kg × " + lastEntry.reps + " · " + lastEntry.date)), suggestion && /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0,
        textAlign: "right",
        paddingLeft: "10px"
      }
    }, suggestion.text.split(" × ").map((part, si) => /*#__PURE__*/React.createElement("div", {
      key: si,
      style: {
        fontSize: si === 0 ? "18px" : "14px",
        fontWeight: "bold",
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        color: suggestion.increase ? "#c8f542" : dayColor
      }
    }, si === 0 ? part : "× " + part))))), /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: "18px",
        color: dayColor,
        fontWeight: "bold",
        textAlign: "center",
        verticalAlign: "middle",
        padding: "14px 0"
      }
    }, ex.sets), /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: FS.base + "px",
        color: "#aaa",
        textAlign: "center",
        verticalAlign: "middle",
        padding: "14px 0"
      }
    }, ex.reps)), isOpen && /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: "1px solid #1e1e1e"
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: 4,
      style: {
        background: "#161616",
        padding: "0 0 16px 0"
      }
    }, isIso ?
    /*#__PURE__*/
    // Isometric: seconds only, no weight or reps
    React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "10px",
        paddingTop: "14px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "#555",
        marginBottom: "6px"
      }
    }, "SECONDS"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      placeholder: "e.g. 30",
      value: logReps,
      onChange: e => setLogReps(e.target.value),
      onClick: e => e.stopPropagation(),
      style: inp
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        saveLog(ex.name);
      },
      style: {
        background: dayColor,
        border: "none",
        color: "#0c0c0c",
        padding: "11px 16px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, "LOG IT"))) :
    /*#__PURE__*/
    // Regular / Dumbbell: weight + reps
    React.createElement("div", {
      style: {
        paddingTop: "14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "#555",
        marginBottom: "6px"
      }
    }, isDumb ? "WEIGHT PER HAND (kg)" : "WEIGHT (kg)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      placeholder: "e.g. 80",
      value: logWeight,
      onChange: e => setLogWeight(e.target.value),
      onClick: e => e.stopPropagation(),
      style: inp
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "#555",
        marginBottom: "6px"
      }
    }, "REPS"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      placeholder: "e.g. 6",
      value: logReps,
      onChange: e => setLogReps(e.target.value),
      onClick: e => e.stopPropagation(),
      style: inp
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        saveLog(ex.name);
      },
      style: {
        background: dayColor,
        border: "none",
        color: "#0c0c0c",
        padding: "11px 16px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap"
      }
    }, "LOG IT")))))));
  }))), active !== "rest" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "24px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      border: "1px solid #222"
    }
  }, [{
    l: "Exercises",
    v: workout.exercises.length
  }, {
    l: "Total Sets",
    v: totalSets
  }, {
    l: "Est. Time",
    v: estMin + " min"
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    style: {
      padding: "16px 10px",
      textAlign: "center",
      borderRight: i < 2 ? "1px solid #222" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: FS.stat + "px",
      color: dayColor,
      fontWeight: "bold",
      lineHeight: 1
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "10px",
      color: "#444",
      letterSpacing: "0.15em",
      marginTop: "5px"
    }
  }, s.l.toUpperCase()))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 16px 24px",
      display: "flex",
      gap: "12px",
      flexWrap: "wrap"
    }
  }, [{
    c: "#42c8f5",
    l: "Pull"
  }, {
    c: "#f5a142",
    l: "Lower"
  }, {
    c: "#a142f5",
    l: "Upper"
  }, {
    c: "#c8f542",
    l: "Legs"
  }, {
    c: "#f54275",
    l: "Push"
  }, {
    c: "#3a3a3a",
    l: "Rest"
  }].map(t => /*#__PURE__*/React.createElement("div", {
    key: t.l,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "5px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 7,
      height: 7,
      background: t.c,
      borderRadius: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "9px",
      color: "#444",
      letterSpacing: "0.12em"
    }
  }, t.l.toUpperCase()))))), page === "tracking" && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 14px 48px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "10px",
      letterSpacing: "0.3em",
      color: "#444",
      marginBottom: "4px"
    }
  }, "PROGRESS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: FS.title + "px",
      fontWeight: "bold",
      color: "#fff",
      marginBottom: "20px"
    }
  }, "Workout Tracking"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "20px",
      border: "1px solid #1a2a1a",
      background: "#0a150a",
      padding: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "#3a7a3a",
      letterSpacing: "0.15em",
      marginBottom: "8px"
    }
  }, "EXPORT DATA"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#555",
      lineHeight: 1.6,
      marginBottom: "12px"
    }
  }, "Download works on Android when running on Replit. Use the copy-paste fallback inside Claude."), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const csv = buildCSV();
      const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      const a = document.createElement("a");
      a.setAttribute("href", uri);
      a.setAttribute("download", "workout-" + getNZDate().replace(/\//g, "-") + ".csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    style: {
      width: "100%",
      background: "#1a3a1a",
      border: "1px solid #3a7a3a",
      color: "#c8f542",
      padding: "14px",
      fontSize: "13px",
      fontWeight: "bold",
      letterSpacing: "0.15em",
      cursor: "pointer",
      fontFamily: "inherit",
      textAlign: "center",
      marginBottom: "8px"
    }
  }, "\u2193 DOWNLOAD CSV TO FILES"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowCSV(v => !v),
    style: {
      width: "100%",
      background: "transparent",
      border: "1px solid #222",
      color: "#555",
      padding: "10px",
      fontSize: "11px",
      cursor: "pointer",
      fontFamily: "inherit",
      textAlign: "center",
      letterSpacing: "0.1em"
    }
  }, showCSV ? "HIDE" : "SHOW", " RAW CSV TEXT"), showCSV && /*#__PURE__*/React.createElement("textarea", {
    readOnly: true,
    value: buildCSV(),
    onFocus: e => e.target.select(),
    style: {
      width: "100%",
      height: "160px",
      marginTop: "8px",
      background: "#111",
      border: "1px solid #222",
      color: "#888",
      fontSize: "10px",
      fontFamily: "inherit",
      padding: "10px",
      boxSizing: "border-box",
      resize: "none",
      outline: "none"
    }
  })), trackedList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "48px 20px",
      border: "1px solid #181818"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "32px",
      marginBottom: "12px",
      opacity: 0.2
    }
  }, "\u25CE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "#2a2a2a",
      letterSpacing: "0.15em",
      lineHeight: 1.8
    }
  }, "NO ENTRIES YET", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      color: "#222"
    }
  }, "TAP ANY EXERCISE ON PULL / LEGS / PUSH DAYS TO LOG"))) : trackedList.map(exName => {
    const history = workoutLogs[exName];
    const isIso = ISOMETRIC.has(exName);
    const isDumbbell = DUMBBELL.has(exName);
    const projected = !isIso ? projectedRM(exName, workoutLogs) : null;
    const cardOpen = openCard === exName;
    return /*#__PURE__*/React.createElement("div", {
      key: exName,
      style: {
        marginBottom: "8px",
        border: "1px solid " + (cardOpen ? "#333" : "#222")
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpenCard(p => p === exName ? null : exName),
      style: {
        background: cardOpen ? "#161616" : "#111",
        padding: "14px 16px",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        userSelect: "none"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: FS.exercise + "px",
        fontWeight: "bold",
        color: "#f0f0f0"
      }
    }, exName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        color: "#555",
        marginTop: "3px"
      }
    }, history.length, " ", history.length === 1 ? "ENTRY" : "ENTRIES")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
        marginLeft: "10px"
      }
    }, projected != null && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "9px",
        letterSpacing: "0.1em",
        color: "#444",
        marginBottom: "2px"
      }
    }, "PROJ 1RM", isDumbbell ? " / HAND" : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#c8f542",
        lineHeight: 1
      }
    }, projected, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "11px",
        color: "#555",
        marginLeft: "2px"
      }
    }, "kg"))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "18px",
        color: "#555",
        lineHeight: 1,
        width: "20px",
        textAlign: "center"
      }
    }, cardOpen ? "▲" : "▼"))), cardOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid #222",
        background: "#0e0e0e"
      }
    }, history.map((entry, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderBottom: i < history.length - 1 ? "1px solid #181818" : "none",
        padding: "12px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "9px",
        height: "9px",
        borderRadius: "50%",
        flexShrink: 0,
        background: i === 0 ? "#c8f542" : "#2a2a2a",
        border: i === 0 ? "none" : "1px solid #444"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: FS.base + 1 + "px",
        color: i === 0 ? "#fff" : "#777",
        fontWeight: i === 0 ? "bold" : "normal"
      }
    }, isIso ? entry.seconds + " sec" : isDumbbell ? entry.weight + "kg/hand × " + entry.reps : entry.weight + " kg × " + entry.reps), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "8px",
        marginTop: "3px",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "11px",
        color: "#444"
      }
    }, entry.date), !isIso && projected != null && i === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "11px",
        color: "#3a6a3a"
      }
    }, "~", projected, " kg", isDumbbell ? " / hand" : "", " 1RM"))), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        deleteLog(exName, i);
      },
      style: delS
    }, "DEL")))));
  })), page === "1rm" && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 16px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "10px",
      letterSpacing: "0.3em",
      color: "#444",
      marginBottom: "4px"
    }
  }, "PERSONAL BESTS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: FS.title + "px",
      fontWeight: "bold",
      color: "#fff",
      marginBottom: "24px"
    }
  }, "1RM Tracker"), rmLifts.map((lift, idx) => {
    const c = RM_COLORS[idx % RM_COLORS.length];
    const isReps = rmRepsLifts.has(lift);
    const history = rmHistory[lift] || [];
    const current = history[0];
    return /*#__PURE__*/React.createElement("div", {
      key: lift,
      style: {
        marginBottom: "24px",
        border: "1px solid #1e1e1e",
        padding: "20px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "17px",
        fontWeight: "bold",
        color: c,
        letterSpacing: "0.05em"
      }
    }, lift.toUpperCase()), current && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "11px",
        color: "#444",
        letterSpacing: "0.15em",
        marginTop: "3px"
      }
    }, isReps ? "BEST SET" : "CURRENT BEST")), current ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "36px",
        fontWeight: "bold",
        color: c,
        lineHeight: 1
      }
    }, current.rm, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "13px",
        color: "#444",
        marginLeft: "4px"
      }
    }, isReps ? "reps" : "kg")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "12px",
        color: "#2a2a2a",
        letterSpacing: "0.1em"
      }
    }, "NO ENTRY YET")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "10px",
        alignItems: "end"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "#444",
        marginBottom: "6px"
      }
    }, isReps ? "MAX REPS" : "MY 1RM (kg)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      placeholder: isReps ? "e.g. 15" : "e.g. 100",
      value: rmInput[lift] || "",
      onChange: e => setRmInput(p => ({
        ...p,
        [lift]: e.target.value
      })),
      style: inp
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => saveRM(lift),
      style: {
        background: c,
        border: "none",
        color: "#0c0c0c",
        padding: "11px 20px",
        fontSize: "13px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, "SAVE")), history.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "#333",
        marginBottom: "8px"
      }
    }, "HISTORY"), history.map((e, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderTop: "1px solid #1a1a1a",
        padding: "11px 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "11px",
        color: "#3a3a3a",
        flex: 1
      }
    }, e.date), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "15px",
        fontWeight: i === 0 ? "bold" : "normal",
        color: i === 0 ? c : "#555",
        minWidth: "64px",
        textAlign: "right"
      }
    }, e.rm, " ", isReps ? "reps" : "kg"), /*#__PURE__*/React.createElement("button", {
      onClick: () => deleteRM(lift, i),
      style: delS
    }, "DEL")))));
  }), rmLifts.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 20px",
      border: "1px solid #1a1a1a",
      color: "#333",
      fontSize: "12px",
      letterSpacing: "0.15em"
    }
  }, "NO LIFTS \u2014 ADD ONE IN SETTINGS \u2699")))) /* end outer screen fill */;
}
