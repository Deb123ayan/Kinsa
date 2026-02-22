import React from "react";
import { useLocation } from "wouter";
import { MoveLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white selection:bg-black selection:text-white overflow-hidden relative">
      {/* Structural Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black/5" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5" />

      {/* Background Decorative Element */}
      <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12 select-none pointer-events-none">
        <h1 className="text-[35rem] font-serif font-black leading-none">404</h1>
      </div>

      <div className="max-w-2xl w-full px-10 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-12 group">
            <div className="h-20 w-20 border border-black/10 flex items-center justify-center relative transition-all duration-500 group-hover:border-black">
              <ShieldAlert className="h-8 w-8 text-black/20 group-hover:text-black transition-colors" />
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <h1 className="font-serif text-6xl lg:text-9xl font-black uppercase tracking-tighter text-black leading-none">
              Not <span className="text-black/10 italic">Found</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-black/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-black/30">
                Data_Sector_Redacted
              </p>
              <div className="h-px w-8 bg-black/20" />
            </div>
          </div>

          <p className="text-sm lg:text-base font-medium text-black/50 max-w-sm leading-relaxed mb-12 uppercase tracking-wide">
            The resource you are attempting to access is either non-existent or restricted under current security protocols.
          </p>

          <Button
            onClick={() => setLocation("/")}
            className="h-16 px-16 bg-black text-white hover:bg-zinc-900 rounded-none font-black uppercase tracking-[0.4em] text-[10px] transition-all group scale-95 hover:scale-100 duration-500"
          >
            <MoveLeft className="mr-4 h-4 w-4 group-hover:-translate-x-2 transition-transform" />
            Back to Safety
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 w-full px-10 flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-black tracking-widest text-black/40">KINSA™ GLOBAL REDACTED</p>
          <p className="text-[7px] font-bold text-black/10 tracking-[0.2em]">© 2026 AUDIT_ACTIVE</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-black/5 italic">Unauthorized access is logged.</p>
        </div>
      </div>
    </div>
  );
}
