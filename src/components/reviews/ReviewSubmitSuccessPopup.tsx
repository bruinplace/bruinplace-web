"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ReviewSubmitSuccessPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCloseMs?: number;
};

export function ReviewSubmitSuccessPopup({
  open,
  onOpenChange,
  autoCloseMs = 1800,
}: ReviewSubmitSuccessPopupProps) {
  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onOpenChange(false), autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [autoCloseMs, onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] max-w-[373px] rounded-[25px] border-0 bg-[#F5F5F5] p-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.25)]"
      >
        <DialogTitle className="sr-only">Review submitted</DialogTitle>

        <div className="flex flex-col items-center justify-center gap-[15px] py-[36px]">
          {/* Figma smile icon placeholder (SVG to be replaced later). */}
          <div className="grid h-[45px] w-[45px] place-items-center rounded-full border-[4px] border-[#71C4FF] text-[10px] font-semibold text-[#71C4FF]">
            SVG
          </div>

          <p className="w-[239px] text-center text-[20px] font-semibold leading-[28px] tracking-[-0.1px] text-[#3EA6FC]">
            Thank you for
            <br />
            submitting a review!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
