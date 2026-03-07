// app/page.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-12 lg:mt-24 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

        {/* Left Content Area */}
        <div className="max-w-2xl">
          <h1 className="text-[2.75rem] sm:text-5xl lg:text-6xl font-medium text-slate-900 leading-[1.15] tracking-tight mb-8">
            Empowering real estate agents to build <span className="text-emerald-600 font-bold">life-changing</span> connections faster.
          </h1>

          <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-xl">
            Managing property inquiries shouldn't be a roadblock to closing deals.
            Hazel CRM streams your journey through AI-powered WhatsApp tools, bringing your entire
            client communication into one unified, intelligent hub.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-16 lg:mb-24">
            <div className="relative">
              <span className="text-sm font-semibold text-emerald-600 mb-3 block">Follow the path</span>
              {/* Decorative line matching the screenshot 'follow the path' */}
              <div className="absolute left-[11px] top-6 w-[1px] h-32 bg-emerald-200"></div>
              <div className="w-6 h-6 rounded-full border-2 border-emerald-200 flex items-center justify-center bg-white shadow-sm relative z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.8)]"></div>
              </div>
            </div>

            <div className="pt-8 sm:pt-0 sm:ml-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/settings/whatsapp"
                className="px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xl shadow-emerald-200/50 flex items-center justify-center gap-2 group transition-all hover:scale-105"
              >
                Connect WhatsApp <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/inbox"
                className="px-8 py-4 rounded-full bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                Open Inbox
              </Link>
            </div>
          </div>
        </div>

        {/* Right Fragmented Image Area - matching the abstract triangulated UI inspiration */}
        <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center overflow-visible">
          {/* The fragmented geometric image mask layout */}

          {/* Top right large triangle */}
          <div className="absolute top-0 right-0 w-[65%] h-[60%] overflow-hidden z-20"
            style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}>
            <img src="/agent.png" alt="Real Estate Agent" className="absolute w-[150%] h-[150%] max-w-none object-cover right-0 top-0 origin-top-right transform scale-110 opacity-95" />
          </div>

          {/* Middle left large pointing triangle */}
          <div className="absolute top-[20%] left-[5%] w-[65%] h-[60%] overflow-hidden z-10"
            style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }}>
            <img src="/agent.png" alt="Real Estate Agent" className="absolute w-[150%] h-[150%] max-w-none object-cover left-0 top-1/2 -translate-y-1/2 transform opacity-90 brightness-110" />
          </div>

          {/* Bottom middle shape */}
          <div className="absolute bottom-[5%] right-[15%] w-[45%] h-[40%] overflow-hidden z-30"
            style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}>
            <img src="/agent.png" alt="Real Estate Agent" className="absolute w-[200%] h-[200%] max-w-none object-cover bottom-0 right-0 origin-bottom-left transform translate-y-20 brightness-95 opacity-90" />
          </div>

          {/* Decorative yellow triangles */}
          <div className="absolute top-[10%] right-[60%] w-24 h-24 bg-yellow-400 opacity-80 mix-blend-multiply rounded-sm"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          <div className="absolute bottom-[20%] right-[5%] w-32 h-32 bg-yellow-400 opacity-60 mix-blend-multiply rounded-sm"
            style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 50%)' }}></div>
          <div className="absolute top-[50%] left-[-5%] w-16 h-16 bg-emerald-300 opacity-60 mix-blend-overlay rounded-sm"
            style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}></div>
        </div>
      </div>
    </div>
  );
}
