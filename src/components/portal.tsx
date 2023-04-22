import { useEffect, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
type PortalInterface = {
  children: ReactNode;
};

export default function Portal({ children }: PortalInterface) {
  const el = useMemo(
    (): HTMLDivElement | null =>
      typeof document !== "undefined" ? document.createElement("div") : null,
    []
  );
  useEffect(() => {
    if (!el) return;
    el.role = "dialog";
    document.body.appendChild(el);

    return () => {
      document.body.removeChild(el);
    };
  }, [el]);
  if (!el) return <></>;
  return createPortal(children, el);
}
