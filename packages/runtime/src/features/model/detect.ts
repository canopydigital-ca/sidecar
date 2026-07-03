import { getHostAdapter } from "../../core/host";
import { PerfTracker } from "../composer/find";

export function findModelPickerElement(tracker?: PerfTracker): Element | null {
  return getHostAdapter().findModelPicker();
}
