import { Link } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { CalendarDays, HeartHandshake, Sparkles } from "lucide-react";

export default function AstrologyHome() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <section className="glass rounded-3xl border border-[#d4a85324] p-6 sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a85326] bg-[#d4a8530d] px-3 py-1 text-xs font-bold tracking-[0.16em] text-[#d4a853]">
            <Sparkles className="h-4 w-4" />
            ASTROLOGY ZONE
          </div>
          <h1 className="font-display mt-5 max-w-3xl text-4xl font-black text-[#f5ead7] sm:text-6xl">
            命理专区 · 东方传统性格分析
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b8b2d8] sm:text-base">
            先生成免费命盘，再通过真太阳时与回溯校验确认盘面。完整报告当前以「即将上线」状态展示，免费基础报告可直接查看。
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              to="/astrology/birth-chart/new"
              className="group rounded-3xl border border-[#d4a85326] bg-[#151520]/80 p-5 transition hover:border-[#d4a85366] hover:bg-[#1b1b27]"
            >
              <CalendarDays className="h-8 w-8 text-[#d4a853]" />
              <h2 className="mt-5 text-2xl font-bold text-[#f5ead7]">个人命盘排盘</h2>
              <p className="mt-2 text-sm leading-6 text-[#b8b2d8]">公历/农历、生辰、出生地，生成紫微十二宫命盘与免费基础报告。</p>
              <span className="mt-5 inline-flex rounded-full bg-[#d4a853] px-4 py-2 text-sm font-black text-black">开始排盘</span>
            </Link>

            <Link
              to="/astrology/synastry/new"
              className="group rounded-3xl border border-[#f3c0d030] bg-[#151520]/80 p-5 transition hover:border-[#f3c0d070] hover:bg-[#1b1b27]"
            >
              <HeartHandshake className="h-8 w-8 text-[#ffb6c1]" />
              <h2 className="mt-5 text-2xl font-bold text-[#f5ead7]">双人合盘分析</h2>
              <p className="mt-2 text-sm leading-6 text-[#b8b2d8]">输入双方生辰资料，生成两张命盘与关系基础定位。</p>
              <span className="mt-5 inline-flex rounded-full bg-[#ffb6c1] px-4 py-2 text-sm font-black text-black">开始合盘</span>
            </Link>
          </div>

          <p className="mt-8 rounded-2xl border border-[#d4a85318] bg-[#0f0f19]/70 p-4 text-xs leading-6 text-[#8a8aad]">
            本工具为东方传统性格分析与人生规划参考，内容仅供传统文化研究，不构成人生决策唯一依据。
          </p>
        </section>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
