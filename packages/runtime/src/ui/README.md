# UI Mounting System

This directory contains the Svelte 5 UI components and the declarative mounting system used by the extension.

## Architecture

- **`index.ts`**: The entry point. Exports components and the `initUI` function.
- **`shadow.ts`**: A factory for creating Shadow DOM roots (`ShadowWrapper`).
- **`components/`**: Svelte 5 components.

## Mounting Components

We use a declarative `MOUNT_LIST` in `src/ui/index.ts` to automatically mount components into DOM elements matching specific selectors.

### How to add a new component:

1. **Create** your Svelte component in `src/ui/components/`.
2. **Import** it in `src/ui/index.ts`.
3. **Add** an entry to `MOUNT_LIST`:

```typescript
export const MOUNT_LIST: MountItem[] = [
  {
    selector: '#my-target-element-id', // The DOM element to mount into
    component: MyComponent,            // Your Svelte component class
    props: { someProp: 'value' }       // Optional initial props
  },
  // ...
];
```

When `initUI()` is called (usually by the main content script or loader), it will find all elements matching these selectors and mount the corresponding components into them using Shadow DOM encapsulation.

### Shadow DOM

All components are mounted inside a Shadow Root (`mode: 'open'`) to isolate styles. The `ShadowMount` class handles:
- Creating the shadow root.
- Injecting styles (if provided).
- Mounting the Svelte component.
- Cleanup/unmounting.
