export class ToastState {
  msg = $state<string | null>(null);
  
  // Internal tracking
  private _once = new Set<string>();
  private _timer: ReturnType<typeof setTimeout> | null = null;

  show(msg: string) {
    this.msg = msg;
    
    // Auto-dismiss after 3s (simple implementation, though ToastHost might handle it too)
    // Actually, ToastHost usually handles the timeout. 
    // We just set the state.
    
    // If we want to support auto-dismiss in the store:
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.msg = null;
      this._timer = null;
    }, 3000);
  }

  showOnce(key: string, msg: string) {
    if (this._once.has(key)) return;
    this._once.add(key);
    this.show(msg);
  }
}

export const toastState = new ToastState();

// Compatibility API
export const toast = {
  show(msg: string) {
    toastState.show(msg);
  },
  showOnce(key: string, msg: string) {
    toastState.showOnce(key, msg);
  }
};
