import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  isOpenPopup: boolean;
  setIsOpenPopup: (isOpen: boolean) => void;
}

export default function Popup({ children, isOpenPopup, setIsOpenPopup }: ModalProps) {

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpenPopup(false);
    }
  };

  if (!isOpenPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-80" onClick={handleOutsideClick}></div>
      <div className="relative bg-white rounded-md w-96 text-black">
        <div className="relative flex justify-end pt-2 pr-2">
          <span onClick={() => setIsOpenPopup(false)} className="cursor-pointer"><X /></span>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}