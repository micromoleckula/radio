import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export function useAnchoredMenu(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        onClose();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const bounds = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - bounds.bottom - 16;
      const spaceAbove = bounds.top - 16;
      const openBelow = spaceBelow >= spaceAbove;
      const menuHeight = Math.max(
        120,
        Math.min(360, openBelow ? spaceBelow : spaceAbove),
      );
      const left = Math.max(
        16,
        Math.min(bounds.right - 256, window.innerWidth - 272),
      );

      setMenuStyle({
        left,
        maxHeight: menuHeight,
        top: openBelow
          ? bounds.bottom + 8
          : bounds.top - menuHeight - 8,
        width: "min(16rem, calc(100vw - 2rem))",
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    document.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      document.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return { containerRef, menuRef, triggerRef, menuStyle };
}
