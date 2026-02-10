import { DockContext } from "../core/context";
import { DOCK_ID } from "../core/constants";
import { log } from "../core/log";

declare const __DEV__: boolean;

export function setupDevTools(ctx: DockContext) {
  // Only expose in DEV mode
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    (window as any).__cgptDockSelfTest = {
      run: async () => {
        const report: any = {
          checks: [],
          success: true
        };

        function check(name: string, fn: () => boolean) {
          try {
            const result = fn();
            report.checks.push({ name, passed: result });
            if (!result) report.success = false;
          } catch (e) {
            report.checks.push({ name, passed: false, error: String(e) });
            report.success = false;
          }
        }

        // 1. Check Dock Existence
        check("Dock exists", () => {
          return !!document.getElementById(DOCK_ID);
        });

        // 2. Check Context
        check("Context initialized", () => {
          return !!ctx && !!ctx.settings;
        });

        // 3. Check Storage (Mock write/read)
        await new Promise<void>((resolve) => {
          const key = "selftest_" + Date.now();
          ctx.storageSet({ [key]: "test" }).then(() => {
            ctx.storageGet([key]).then((res) => {
              const passed = res[key] === "test";
              report.checks.push({ name: "Storage write/read", passed });
              if (!passed) report.success = false;
              resolve();
            });
          }).catch(e => {
            report.checks.push({ name: "Storage write/read", passed: false, error: String(e) });
            report.success = false;
            resolve();
          });
        });

        // 4. Check Popover functionality (light check)
        check("Popovers registered", () => {
          // This is a bit indirect, but we assume if dock exists, popovers are likely wired.
          // A better check would be to try to open one, but that changes UI state.
          // We'll just check if we can call openPopover without error (but passing invalid key to not actually open)
          try {
            // We won't actually open one to avoid UI flicker during test,
            // but we can check if the function exists.
            return typeof ctx.openPopover === 'function';
          } catch { return false; }
        });

        log.info("Self-test complete", report);
        return report;
      }
    };
    log.info("Self-test registered at window.__cgptDockSelfTest");
  }
}
