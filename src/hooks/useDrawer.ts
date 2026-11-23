import { useCallback, useEffect, useRef, useState } from "react";

interface UseDrawerOptions {
  /** Class added to <body> while the drawer is open (e.g. to lock scroll). */
  bodyLockClassName?: string;
  /** Media query in which the drawer mode applies; drawer auto-closes when it stops matching. */
  mediaQuery?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Off-canvas drawer behaviour: open/close state, Escape to close, focus moved into the
 * drawer on open and trapped between toggle + drawer, focus restored to the toggle on close,
 * body class while open, and auto-close when leaving the drawer breakpoint.
 */
export function useDrawer({ bodyLockClassName, mediaQuery = "(max-width: 767.98px)" }: UseDrawerOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Body class (scroll lock)
  useEffect(() => {
    if (!isOpen || !bodyLockClassName) return;
    document.body.classList.add(bodyLockClassName);
    return () => document.body.classList.remove(bodyLockClassName);
  }, [isOpen, bodyLockClassName]);

  // Focus in on open, restore on close
  useEffect(() => {
    if (isOpen) {
      const first = drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    } else if (wasOpen.current) {
      toggleRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Escape + focus trap
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const nodes: HTMLElement[] = [
        ...(toggleRef.current ? [toggleRef.current] : []),
        ...Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)),
      ];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !nodes.includes(active as HTMLElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !nodes.includes(active as HTMLElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Leaving the mobile breakpoint closes the drawer (releases scroll lock)
  useEffect(() => {
    const mql = window.matchMedia(mediaQuery);
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        wasOpen.current = false; // don't steal focus to a hidden toggle
        setIsOpen(false);
      }
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mediaQuery]);

  return { isOpen, open, close, toggle, drawerRef, toggleRef };
}
