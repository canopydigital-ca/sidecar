import { USE_NEW_BOOT } from "../core/constants";
import { legacyBoot } from "./legacy-boot";

if (USE_NEW_BOOT) {
  // New Boot Path
  // We need to import bootFullRuntime dynamically or statically.
  // Static is fine as long as side-effects don't run immediately.
  // ui/bootstrap has side effects? No, we refactored it to export functions.
  // But we need to be careful about import order.

  import("../ui/bootstrap").then(({ bootFullRuntime }) => {
    void bootFullRuntime();
  });
} else {
  // Legacy Boot Path
  legacyBoot();
}
