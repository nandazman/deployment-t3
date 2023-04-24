import { useState, type ReactNode, useEffect, useCallback } from "react";
import cn from "classnames";
import dynamic from "next/dynamic";

const Portal = dynamic(
  import("~/components/portal").then((module) => module.default),
  {
    ssr: false,
  }
);

type ModalProps = {
  show: boolean;
  title: ReactNode;
  children: ReactNode;
  onHide: () => void;
};
export const Modal = ({ show, title, children, onHide }: ModalProps) => {
  const [showModal, setShowModal] = useState(show);

  useEffect(() => {
    setShowModal(show);
  }, [show]);

  const handleClose = useCallback(() => {

    setShowModal(false);
    setTimeout(() => {
      onHide();
    }, 300);
  }, [onHide]);

  if (!show) return <></>;
  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
        <div
          className="fixed top-0 left-0 right-0 bottom-0 h-full w-full bg-neutral-800/70"
          onClick={handleClose}
        ></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 my-6 mx-auto h-max w-full md:w-4/6 lg:w-3/6 xl:w-2/5 px-4">
          {/*content*/}
          <div
            className={cn("translate duration-300", {
              "translate-y-0 opacity-100": showModal,
              "translate-y-full opacity-0": !showModal,
            })}
          >
            <div className="translate relative flex h-full w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none md:h-auto lg:h-auto">
              {/*header*/}
              <div className="relative flex items-center justify-center rounded-t border-b p-6">
                <button
                  className="
                      absolute
                      right-9 
                      border-0
                      p-1
                      transition
                      hover:opacity-70
                    "
                  onClick={handleClose}
                >
                  <CloseIcon />
                </button>
                <div className="text-lg font-semibold">{title}</div>
              </div>
              {/*body*/}
              <div className="relative flex-auto p-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

function CloseIcon() {
  return (
    <svg
      height="16"
      viewBox="0 0 512 512"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z" />
    </svg>
  );
}