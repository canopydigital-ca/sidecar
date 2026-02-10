import { updateSettings } from "../settings/storage";
import { state } from "../../core/state";

let inputWriteTimer: number | null = null;

export function persistInputDebounced() {
  if (inputWriteTimer) window.clearTimeout(inputWriteTimer);
  inputWriteTimer = window.setTimeout(() => {
    updateSettings({
      ui: {
        inputCollapsed: state.uiState.inputCollapsed,
        inputHeight: state.uiState.inputHeight,
        inputHeightExpanded: state.uiState.inputHeightExpanded
      }
    });
    inputWriteTimer = null;
  }, 180);
}
