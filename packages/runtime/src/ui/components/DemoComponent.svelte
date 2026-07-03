<script lang="ts">
  import type { CustomEventDetail, CustomEventType } from '../types';

  let {
    title = 'Demo Component',
    message = 'Hello from Svelte 5!',
    count = 0,
    disabled = false,
  } = $props();

  let localCount = $state(0);
  let inputValue = $state('');
  let container: HTMLDivElement | undefined = $state();

  let totalCount = $derived(count + localCount);

  $effect(() => {
    console.log('Count changed:', totalCount);
    return () => console.log('Cleaning up effect');
  });

  function dispatchEvent(type: CustomEventType, value: any) {
    if (!container) return;

    const detail: CustomEventDetail = {
      value,
      timestamp: Date.now(),
    };

    container.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  function increment() {
    if (!disabled) {
      localCount += 1;
      dispatchEvent('button-click', { action: 'increment', value: localCount });
    }
  }

  function decrement() {
    if (!disabled) {
      localCount -= 1;
      dispatchEvent('button-click', { action: 'decrement', value: localCount });
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    inputValue = target.value;
    dispatchEvent('input-change', inputValue);
  }

  function handleSubmit() {
    dispatchEvent('form-submit', { inputValue, localCount });
  }
</script>

<div class="demo-container" bind:this={container}>
  <h2>{title}</h2>

  <p class="message">{message}</p>

  <div class="counter-section">
    <h3>Counter Demo</h3>
    <div class="counter-display">
      <span>Local: {localCount}</span>
      <span>Props: {count}</span>
      <span>Total: {totalCount}</span>
    </div>

    <div class="button-group">
      <button onclick={decrement} {disabled} class="btn btn-decrement">
        -
      </button>

      <button onclick={increment} {disabled} class="btn btn-increment">
        +
      </button>
    </div>
  </div>

  <div class="input-section">
    <h3>Input Demo</h3>
    <input
      type="text"
      bind:value={inputValue}
      oninput={handleInput}
      placeholder="Type something..."
      {disabled}
      class="input-field"
    />
    <p>You typed: {inputValue}</p>
  </div>

  <div class="action-section">
    <button
      onclick={handleSubmit}
      disabled={disabled || !inputValue}
      class="btn btn-submit"
    >
      Submit
    </button>
  </div>

  <div class="status">
    <p>Component {disabled ? 'disabled' : 'enabled'}</p>
  </div>
</div>

<style>
  .demo-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
    padding: 1.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    background: white;
    max-width: 400px;
    margin: 0 auto;
  }

  h2 {
    color: #1f2937;
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  h3 {
    color: #374151;
    margin: 1.5rem 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .message {
    color: #6b7280;
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
  }

  .counter-display {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    font-family: monospace;
  }

  .counter-display span {
    padding: 0.25rem 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-increment {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }

  .btn-increment:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
  }

  .btn-decrement {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .btn-decrement:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
  }

  .btn-submit {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .btn-submit:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
  }

  .input-field {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    margin: 0.5rem 0;
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input-field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .status {
    margin-top: 1.5rem;
    padding: 0.75rem;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 0.375rem;
    text-align: center;
  }

  .status p {
    margin: 0;
    color: #92400e;
    font-weight: 500;
  }
</style>

