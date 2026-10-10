"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode };

// Native <dialog>: focus trap, Escape and focus return come from the browser.
export function Dialog({ open, onClose, labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className="sheet"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
