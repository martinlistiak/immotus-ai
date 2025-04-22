import { RiCloseLine } from "react-icons/ri";
import { Card } from "./Card";

export const Modal = ({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  console.log("here");
  return (
    <div
      className="fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center z-100 bg-black/50"
      onClick={() => onClose()}
    >
      <Card className="relative">
        <RiCloseLine
          onClick={() => onClose()}
          className="absolute -top-6 -right-6 cursor-pointer text-white"
        />
        {children}
      </Card>
    </div>
  );
};
