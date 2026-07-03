export function insertAtCursor(textarea: any, text: string) {
  if (!textarea) return;

  // Ensure focus before insertion to make sure execCommand works on the right target
  textarea.focus();

  const tagName = textarea.tagName ? textarea.tagName.toLowerCase() : "";
  const isInput = tagName === "textarea" || tagName === "input";

  // Handle contenteditable div (ProseMirror / Rich Text Editors)
  // But strictly prioritize input/textarea value manipulation if it IS an input
  if (textarea.isContentEditable && !isInput) {
    // We don't need to manually manipulate selection if we just focus.
    // However, if the user clicked the emoji button, focus might have been lost.
    // ProseMirror usually maintains selection state.

    // execCommand 'insertText' is the most reliable way to preserve undo stack and events
    // It requires the element to be focused and editable.
    const success = document.execCommand("insertText", false, text);

    if (!success) {
      // Fallback if execCommand fails
      // This usually happens if focus was lost completely or command is blocked.
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      } else {
        // Last resort: append to text content, but this breaks ProseMirror state usually
        // Better to just try setting value if it was a textarea, but here it's a div.
        // We'll append to innerHTML if we have to, but this is risky.
        // Let's assume focus worked.
      }
    }
    return;
  }

  // Handle standard textarea/input
  if (typeof textarea.value === "undefined") {
    // Fallback for non-input elements that might have slipped through
    return;
  }
  const val = textarea.value || "";
  const start = textarea.selectionStart ?? val.length;
  const end = textarea.selectionEnd ?? val.length;
  textarea.value = val.slice(0, start) + text + val.slice(end);
  const nextPos = start + text.length;
  textarea.selectionStart = nextPos;
  textarea.selectionEnd = nextPos;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
