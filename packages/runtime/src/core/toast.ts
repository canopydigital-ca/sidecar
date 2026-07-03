import { toast } from "../ui/toast.svelte";

export function showToast(msg: string) {
  toast.show(msg);
}

export function showToastOnce(key: string, msg: string) {
  toast.showOnce(key, msg);
}
