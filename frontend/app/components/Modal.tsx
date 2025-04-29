import { RiCloseLine } from "react-icons/ri";
import { Card } from "./Card";
import cn from "classnames";
import { createPortal } from "react-dom";
export const Modal = ({
  children,
  isOpen,
  onClose,
  className,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}) => {
  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center z-200 bg-black/50"
      )}
      onClick={() => onClose?.()}
    >
      <Card
        className={cn("relative", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <RiCloseLine
          onClick={() => onClose?.()}
          className="absolute -top-6 -right-6 cursor-pointer text-white"
        />
        {children}
      </Card>
    </div>,
    document.getElementById("modal") as HTMLElement
  );
};
