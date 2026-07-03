import { INPUT_MIN, INPUT_MAX, FLAGS, DOCK_ID } from "../../core/constants";
import { clamp, setPressed } from "../../core/dom";
import { state } from "../../core/state";
import { PerfTracker } from "../composer/find";
import { applyTextareaSizing } from "./sizing";
import { updateSettings } from "../settings/storage";

export function toggleInputCollapsed(
  findComposerResizeTarget: (track?: PerfTracker) => Element | null,
  track?: PerfTracker
) {
  const el = findComposerResizeTarget(track);
  if (!el) return;

  const isCollapsed = state.uiState.inputCollapsed;
  const nextCollapsed = !isCollapsed;

  if (nextCollapsed) {
    // Collapsing
    const cur = el.getBoundingClientRect().height || state.uiState.inputHeightExpanded || state.uiState.inputHeight || INPUT_MIN;
    const expanded = clamp(cur, INPUT_MIN, INPUT_MAX);
    
    // Update local DOM immediately for response
    document.documentElement.classList.add(FLAGS.inputCollapsed);
    // Simulate state for sizing application
    applyTextareaSizing({ ...state.uiState, inputCollapsed: true, inputHeightExpanded: expanded }, findComposerResizeTarget, track);

    // Persist
    updateSettings({ ui: { inputCollapsed: true, inputHeightExpanded: expanded } });
  } else {
    // Expanding
    document.documentElement.classList.remove(FLAGS.inputCollapsed);
    const restore = state.uiState.inputHeightExpanded || state.uiState.inputHeight || null;
    
    // Simulate state
    const nextState = { ...state.uiState, inputCollapsed: false };
    if (restore) nextState.inputHeight = restore;
    applyTextareaSizing(nextState, findComposerResizeTarget, track);

    // Persist
    updateSettings({ ui: { inputCollapsed: false, inputHeight: restore ?? undefined } });
  }
  
  // Sync pressed states locally
  const btn = document.querySelector(`#${DOCK_ID} button[data-action="inputToggle"]`);
  if (btn) setPressed(btn, nextCollapsed);
}
