import { Link, useParams } from "react-router";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AstrologyError({ type = "birth" }: { type?: "birth" | "synastry" }) {
  const { id } = useParams();
  const retryPath = type === "birth" ? "/astrology/birth-chart/new" : "/astrology/synastry/new";
  const continuePath = type === "birth"
    ? `/astrology/birth-chart/${id}/basic-report`
    : `/astrology/synastry/${id}/basic-report`;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6">
        <section className="glass rounded-3xl border border-[#ffb6c130] p-6 text-center sm:p-9">
          <AlertTriangle className="mx-auto h-10 w-10 text-[#ffb6c1]" />
          <h1 className="font-display mt-5 text-3xl font-black text-[#f5ead7]">建议先修正资料</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#b8b2d8]">
            回溯校验不符合时，通常是出生时间、出生地、历法或子时口径影响了盘面。建议先返回重新输入；如果你只是想快速预览，也可以带着误差提示继续查看免费报告。
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link to={retryPath} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d4a853] px-5 py-3 font-black text-black">
              <RotateCcw className="h-4 w-4" /> 重新输入
            </Link>
            <Link to={continuePath} className="inline-flex items-center justify-center rounded-2xl border border-[#d4a85330] bg-[#151520] px-5 py-3 font-black text-[#f5ead7]">
              继续查看免费报告
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
