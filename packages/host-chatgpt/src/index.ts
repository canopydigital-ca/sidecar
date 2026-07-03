import { setHostAdapter } from "../../runtime/src/core/host";
import { bootFullRuntime } from "../../runtime/src/ui/bootstrap";
import { createChatGptHostAdapter } from "./adapter";

export async function bootChatGptHost(): Promise<void> {
  setHostAdapter(createChatGptHostAdapter());
  await bootFullRuntime();
}

export { createChatGptHostAdapter } from "./adapter";
