export type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export const computePopoverPosition = (
  place: PopoverPlacement,
  targetRect: DOMRect,
  popRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  offset: number
) => {
  let left = 0;
  let top = 0;
  const margin = 8;

  if (place === 'top') {
    left = targetRect.left + targetRect.width / 2 - popRect.width / 2;
    top = targetRect.top - popRect.height - offset;
  } else if (place === 'bottom') {
    left = targetRect.left + targetRect.width / 2 - popRect.width / 2;
    top = targetRect.bottom + offset;
  } else if (place === 'left') {
    left = targetRect.left - popRect.width - offset;
    top = targetRect.top + targetRect.height / 2 - popRect.height / 2;
  } else if (place === 'right') {
    left = targetRect.right + offset;
    top = targetRect.top + targetRect.height / 2 - popRect.height / 2;
  } else if (place === 'top-left') {
    left = targetRect.left - popRect.width;
    top = targetRect.top - popRect.height - offset;
  } else if (place === 'top-right') {
    left = targetRect.right;
    top = targetRect.top - popRect.height - offset;
  } else if (place === 'bottom-left') {
    left = targetRect.left - popRect.width;
    top = targetRect.bottom + offset;
  } else {
    left = targetRect.right;
    top = targetRect.bottom + offset;
  }

  const maxLeft = viewportWidth - popRect.width - margin;
  const maxTop = viewportHeight - popRect.height - margin;

  return {
    left: Math.min(Math.max(left, margin), maxLeft),
    top: Math.min(Math.max(top, margin), maxTop),
  };
};

export const resolvePopoverPlacement = (
  preferred: PopoverPlacement,
  targetRect: DOMRect,
  popRect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  offset: number,
  autoFlip: boolean
) => {
  if (!autoFlip) return preferred;

  const spaceTop = targetRect.top - offset;
  const spaceBottom = viewportHeight - targetRect.bottom - offset;
  const spaceLeft = targetRect.left - offset;
  const spaceRight = viewportWidth - targetRect.right - offset;

  if (preferred.startsWith('top') && spaceTop < popRect.height) {
    return preferred.replace('top', 'bottom') as PopoverPlacement;
  }
  if (preferred.startsWith('bottom') && spaceBottom < popRect.height) {
    return preferred.replace('bottom', 'top') as PopoverPlacement;
  }
  if (preferred === 'left' && spaceLeft < popRect.width) return 'right';
  if (preferred === 'right' && spaceRight < popRect.width) return 'left';

  return preferred;
};
