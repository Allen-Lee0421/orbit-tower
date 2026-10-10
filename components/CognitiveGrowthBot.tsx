"use client";

import { useMemo, useState } from "react";
import { Bot, Check, Copy, Share2, Sparkles, X } from "lucide-react";

const AUDIENCES = [
  { id: "manufacturing", label: "精密製造", accent: "#00D4FF" },
  { id: "consulting", label: "工程顧問", accent: "#00D68F" },
  { id: "brand", label: "跨境品牌", accent: "#A855F7" },
] as const;

type AudienceId = (typeof AUDIENCES)[number]["id"];

const COPY: Record<AudienceId, { hook: string; body: string; cta: string }> = {
  manufacturing: {
    hook: "把分散的詢價、技術資料與客服，收進一座會成長的 AI Digital Headquarters。",
    body: "Orbit Tower 以六個 AI 營運中心串起品牌、知識庫、GEO、客服與自動化流程，讓客戶更快找到你，也讓團隊少做重複工作。",
    cta: "預約一場 15 分鐘導覽，看看你的企業適合哪一層。",
  },
  consulting: {
    hook: "讓每一份專案履歷，都變成下一個國際來案的入口。",
    body: "用可搜尋的知識中心與 GEO 內容架構，把案例、招標履歷與交付方法整理成可持續累積的數位資產。",
    cta: "加入 Orbit 導覽名單，取得你的專案知識庫藍圖。",
  },
  brand: {
    hook: "跨境成長，不該靠每天手動追訊息。",
    body: "Orbit Tower 將內容中心、AI 接待與商機分流放進同一個數位總部，讓品牌在不同市場持續被看見與回應。",
    cta: "分享給正在拓展海外市場的夥伴，一起啟動成長診斷。",
  },
};

export default function CognitiveGrowthBot() {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<AudienceId>("manufacturing");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const campaign = useMemo(() => COPY[audience], [audience]);
  const shareText = `${campaign.hook}\n\n${campaign.body}\n\n${campaign.cta}\nhttps://orbit.xingdeng.tw/`;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Orbit Tower AI Digital Headquarters", text: shareText, url: "https://orbit.xingdeng.tw/" });
        setShared(true);
        window.setTimeout(() => setShared(false), 2200);
        return;
      } catch {
        // 使用者關閉原生分享時，保留在機器人面板內。
      }
    }
    await copyText();
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="開啟認知擴散機器人"
          className="orbit-growth-bot fixed right-3 bottom-[5.8rem] sm:right-5 sm:bottom-24 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-[#08162b]/80 px-3 py-2 text-[10px] text-white shadow-[0_0_28px_rgba(0,212,255,.2)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/70"
        >
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-200">
            <Bot size={13} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#00D68F]" />
          </span>
          <span className="hidden sm:inline">認知擴散機器人</span>
          <Sparkles size={12} className="text-cyan-300" />
        </button>
      )}

      {open && (
        <aside className="fixed right-3 bottom-3 sm:right-5 sm:bottom-5 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071326]/95 text-white shadow-[0_20px_80px_rgba(0,0,0,.55),0_0_35px_rgba(0,212,255,.12)] backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200"><Bot size={16} /></div>
              <div>
                <div className="text-xs font-semibold tracking-[0.12em]">認知擴散機器人</div>
                <div className="font-mono-data text-[9px] text-cyan-200/55">CAMPAIGN NODE / READY</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="關閉認知擴散機器人" className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"><X size={15} /></button>
          </header>

          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">選擇你的第一批認知節點</div>
              <div className="grid grid-cols-3 gap-1.5">
                {AUDIENCES.map((item) => (
                  <button key={item.id} onClick={() => setAudience(item.id)} className="rounded-xl border px-2 py-2 text-[10px] transition" style={{ borderColor: audience === item.id ? item.accent : "rgba(255,255,255,.1)", background: audience === item.id ? `${item.accent}18` : "rgba(255,255,255,.03)", color: audience === item.id ? item.accent : "rgba(255,255,255,.65)" }}>{item.label}</button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <div className="mb-2 text-[9px] font-mono-data tracking-[0.16em] text-cyan-200/55">GENERATED AWARENESS MESSAGE</div>
              <p className="text-sm font-medium leading-relaxed text-white/90">{campaign.hook}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/55">{campaign.body}</p>
              <p className="mt-3 border-l border-cyan-300/60 pl-2 text-[11px] leading-relaxed text-cyan-100/80">{campaign.cta}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyText} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-[11px] text-white/75 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"><Copy size={13} />{copied ? "已複製" : "複製文案"}</button>
              <button onClick={share} className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-300 px-3 py-2.5 text-[11px] font-semibold text-[#061226] transition hover:bg-cyan-200">{shared ? <Check size={13} /> : <Share2 size={13} />}{shared ? "已分享" : "啟動擴散"}</button>
            </div>
            <div className="text-center text-[9px] leading-relaxed text-white/35">機器人只產生你可審核的內容，不會自動發佈或騷擾他人。</div>
          </div>
        </aside>
      )}
    </>
  );
}
