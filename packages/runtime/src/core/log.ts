export type LogLevel = "debug" | "info" | "warn" | "error";
export type Logger = (level: LogLevel, msg: string, meta?: unknown) => void;

const DEBUG = false;

export function createLogger(prefix: string) {
  const impl = {
    log: (...args: any[]) => {
      if (DEBUG) console.log(prefix, ...args);
    },
    debug: (...args: any[]) => {
      if (DEBUG) console.debug(prefix, ...args);
    },
    warn: (...args: any[]) => {
      console.warn(prefix, ...args);
    },
    error: (...args: any[]) => {
      console.error(prefix, ...args);
    },
    info: (...args: any[]) => {
      console.info(prefix, ...args);
    }
  };

  const dispatch: Logger = (level, msg, meta) => {
    if (level === "debug" && !DEBUG) return;
    const args = meta !== undefined ? [msg, meta] : [msg];
    if (level === "debug") impl.debug(...args);
    else if (level === "info") impl.info(...args);
    else if (level === "warn") impl.warn(...args);
    else if (level === "error") impl.error(...args);
  };

  // Allow usage as both function and object
  return Object.assign(dispatch, impl);
}

export const log = createLogger("[ChatGPT Dock]");
