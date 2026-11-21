"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Dataset } from "@/lib/playground/data-matter/model";

type State = {
  present: Dataset;
  past: Dataset[];
  future: Dataset[];
};

type Action =
  | { type: "live"; next: Dataset }
  | { type: "commit"; next: Dataset }
  | { type: "end"; start: Dataset }
  | { type: "undo" }
  | { type: "redo" };

const LIMIT = 40;

function sameData(a: Dataset, b: Dataset) {
  if (a.title !== b.title || a.note !== b.note) return false;
  if (a.data.length !== b.data.length) return false;
  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i].label !== b.data[i].label) return false;
    if (a.data[i].value !== b.data[i].value) return false;
  }
  return true;
}

function pushPast(past: Dataset[], entry: Dataset) {
  return [...past.slice(-(LIMIT - 1)), entry];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "live":
      return { ...state, present: action.next };
    case "commit":
      if (sameData(state.present, action.next)) return state;
      return {
        present: action.next,
        past: pushPast(state.past, state.present),
        future: [],
      };
    case "end":
      if (sameData(action.start, state.present)) return state;
      return {
        ...state,
        past: pushPast(state.past, action.start),
        future: [],
      };
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, LIMIT),
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        present: next,
        past: pushPast(state.past, state.present),
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
}

export function useDatasetHistory(initial: Dataset) {
  const [state, dispatch] = useReducer(reducer, {
    present: initial,
    past: [],
    future: [],
  });
  const presentRef = useRef(state.present);
  const gestureStart = useRef<Dataset | null>(null);
  const lastCoalesce = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    presentRef.current = state.present;
  }, [state.present]);

  const beginGesture = useCallback(() => {
    gestureStart.current = presentRef.current;
    lastCoalesce.current = null;
  }, []);

  const live = useCallback((next: Dataset) => {
    presentRef.current = next;
    dispatch({ type: "live", next });
  }, []);

  const commit = useCallback((next: Dataset, coalesceKey?: string) => {
    const now = performance.now();
    const previous = lastCoalesce.current;
    presentRef.current = next;
    if (
      coalesceKey &&
      previous &&
      previous.key === coalesceKey &&
      now - previous.at < 650
    ) {
      dispatch({ type: "live", next });
    } else {
      dispatch({ type: "commit", next });
    }
    lastCoalesce.current = coalesceKey ? { key: coalesceKey, at: now } : null;
  }, []);

  const endGesture = useCallback(() => {
    const start = gestureStart.current;
    gestureStart.current = null;
    if (start) dispatch({ type: "end", start });
  }, []);

  const undo = useCallback(() => {
    gestureStart.current = null;
    lastCoalesce.current = null;
    dispatch({ type: "undo" });
  }, []);

  const redo = useCallback(() => {
    gestureStart.current = null;
    lastCoalesce.current = null;
    dispatch({ type: "redo" });
  }, []);

  return {
    dataset: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    beginGesture,
    live,
    commit,
    endGesture,
    undo,
    redo,
  };
}
