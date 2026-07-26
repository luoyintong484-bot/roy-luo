import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import { useI18n } from "@/contexts/I18nContext";
import { ShieldCheck, Database, Lock, Trash2 } from "lucide-react";

export default function PrivacyPolicy() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";

  const sections = isZh
    ? [
        {
          icon: Database,
          title: "我们收集哪些信息",
          body: "当您主动填写出生日期、出生时间、出生地区、昵称或邮箱时，R7 Fortune 会使用这些信息生成个性化报告、保存您的历史记录和改善产品体验。游客模式下的临时输入默认仅用于本次页面计算。",
        },
        {
          icon: Lock,
          title: "数据如何存储与保护",
          body: "出生信息会以受限方式保存，用于自动填充和报告生成。我们不会向第三方出售、出租或共享您的个人资料。后续接入正式后端加密存储时，出生信息将按 AES-256 或等效标准进行加密。",
        },
        {
          icon: ShieldCheck,
          title: "数据用途",
          body: "您的数据仅用于生成塔罗、紫微、合盘、爱豆匹配等个性化内容，以及展示个人中心中的历史记录、付款记录和报告入口。",
        },
        {
          icon: Trash2,
          title: "导出与删除",
          body: "您可以在个人中心的隐私设置中导出本机保存的数据，或清除本机账户与出生档案数据。若后续启用服务器账号体系，将继续补充正式删除账号接口。",
        },
      ]
    : [
        {
          icon: Database,
          title: "What We Collect",
          body: "When you enter birth date, birth time, location, nickname, or email, R7 Fortune uses that information to generate personalized reports, save reading history, and improve the product experience. Guest inputs are used for the current calculation only by default.",
        },
        {
          icon: Lock,
          title: "How Data Is Stored",
          body: "Birth data is stored in a restricted way for autofill and report generation. We do not sell, rent, or share personal information with third parties. When production backend encryption is enabled, birth data will be encrypted with AES-256 or an equivalent standard.",
        },
        {
          icon: ShieldCheck,
          title: "How Data Is Used",
          body: "Your data is used only to generate personalized tarot, Ziwei, synastry, idol matching reports, and to show history, payment records, and report access in your profile.",
        },
        {
          icon: Trash2,
          title: "Export & Delete",
          body: "You can export locally saved data or clear local account and birth profile data in Profile privacy settings. A formal server-side account deletion flow will be added when the production account backend is enabled.",
        },
      ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 pb-20 pt-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4a85324] bg-[#d4a85310] px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-[#d4a853]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4a853]">
                Privacy
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#f0e6d3] sm:text-5xl">
              {isZh ? "隐私政策" : "Privacy Policy"}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#b8b2d8]">
              {isZh
                ? "我们把出生信息视为敏感数据处理。以下说明用于帮助您理解数据如何被使用、保存和删除。"
                : "We treat birth data as sensitive information. This page explains how your data is used, stored, and deleted."}
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.title}
                  className="rounded-3xl border border-[#d4a85318] bg-[#14142a]/72 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d4a85320] bg-[#d4a85310]">
                      <Icon className="h-5 w-5 text-[#d4a853]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#f0e6d3]">{section.title}</h2>
                  </div>
                  <p className="text-sm leading-7 text-[#b8b2d8]">{section.body}</p>
                </section>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs leading-6 text-[#8a8aad]">
            {isZh
              ? "本政策会随支付、账号与云端存储能力上线持续更新。"
              : "This policy will be updated as payment, account, and cloud storage features evolve."}
          </p>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}
