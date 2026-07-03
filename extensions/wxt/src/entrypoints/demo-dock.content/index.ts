import "@sidecar/runtime-root/styles.css";
import { bootChatGptHost } from "@sidecar/host-chatgpt";
import { defineContentScript } from "#imports";

export default defineContentScript({
  matches: ["http://localhost/*", "http://127.0.0.1/*"],
  runAt: "document_idle",
  async main() {
    if (document.documentElement.getAttribute("data-sidecar-demo") !== "1") {
      return;
    }

    await bootChatGptHost();
  },
});
