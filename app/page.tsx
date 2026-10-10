"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false, loading: () => null });
import Header from "@/components/Header";
import ControlHUD from "@/components/ControlHUD";
import FloorIndicator from "@/components/FloorIndicator";
import UnitInfoCard from "@/components/UnitInfoCard";
import AIConcierge from "@/components/AIConcierge";
import CognitiveGrowthBot from "@/components/CognitiveGrowthBot";
import PricingModal from "@/components/PricingModal";
import AuthModal from "@/components/AuthModal";
import LegalModal from "@/components/LegalModal";
import SecurityFooter from "@/components/SecurityFooter";
import FAQSection from "@/components/FAQSection";
import Onboarding from "@/components/Onboarding";
import AboutModal from "@/components/AboutModal";
import ReadmeModal from "@/components/ReadmeModal";
import FloatingCTA from "@/components/FloatingCTA";
import LandingOverlay from "@/components/LandingOverlay";
import DisclaimerPage from "@/components/DisclaimerPage";
import { I18nProvider, useTranslation } from "@/lib/i18n";
import type { Theme, LightColor, Unit } from "@/data/units";

function HomeInner() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>("cyber");
  const [lightColor, setLightColor] = useState<LightColor>("cyber-blue");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [activeFloor, setActiveFloor] = useState<number | null>(null);

  // Modal 狀態
  const [pricingOpen, setPricingOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("orbit-tower-visited")) {
        localStorage.setItem("orbit-tower-visited", "true");
        // Intentional one-time post-hydration decision based on browser storage.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOnboardingOpen(true);
      }
    } catch {
      // Keep the main 3D experience usable when browser storage is unavailable.
    }
  }, []);
  
  const [aboutOpen, setAboutOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const handleEnter3D = useCallback(() => {
    try {
      localStorage.setItem("orbit-3d-entered", "true");
    } catch {
      // This flag is only a convenience; it must not block the 3D experience.
    }
  }, []);

  const handleUnitClick = useCallback((unit: Unit, _position: THREE.Vector3) => {
    setSelectedUnit(unit);
    setActiveFloor(unit.floor);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedUnit(null);
  }, []);

  const handleFloorSelect = useCallback((floor: number) => {
    setActiveFloor(floor);
  }, []);

  return (
    <main className="relative w-full h-full">
      {/* 完整免責聲明頁面 */}
      {disclaimerOpen && (
        <DisclaimerPage onBack={() => setDisclaimerOpen(false)} />
      )}

      {/* 可收合的側邊導覽；不再以全頁覆蓋層遮擋 3D 大樓 */}
      <LandingOverlay
        onEnter3D={handleEnter3D}
        onPricingClick={() => setPricingOpen(true)}
      />

      {/* 3D 場景 */}
      <Scene theme={theme} lightColor={lightColor} onUnitClick={handleUnitClick} />

      {/* 掃描線覆蓋層（手機版 CSS 自動隱藏） */}
      <div className="scanline-overlay" />

      {/* 頂部標題（含登入/定價/條款/關於/README 入口） */}
      <Header
        theme={theme}
        onLoginClick={() => setAuthOpen(true)}
        onPricingClick={() => setPricingOpen(true)}
        onLegalClick={() => setLegalOpen(true)}
        onAboutClick={() => setAboutOpen(true)}
        onReadmeClick={() => setReadmeOpen(true)}
      />

      {/* 左側樓層指示器 */}
      <FloorIndicator activeFloor={activeFloor} onFloorSelect={handleFloorSelect} />

      {/* 右下角控制面板 */}
      <ControlHUD
        theme={theme}
        lightColor={lightColor}
        onThemeChange={setTheme}
        onLightColorChange={setLightColor}
        onPricingClick={() => setPricingOpen(true)}
      />

      {/* 左下角 AI 樓管 */}
      <AIConcierge />

      {/* 右下角：可審核、可複製、可分享的認知擴散文案機器人 */}
      <CognitiveGrowthBot />

      {/* 戶別資訊卡 */}
      <UnitInfoCard unit={selectedUnit} onClose={handleCloseCard} />

      {/* 資安防護狀態 + 免責聲明入口 Footer */}
      <SecurityFooter />
      {/* 免責聲明按鈕 */}
      <div className="orbit-disclaimer fixed bottom-0.5 sm:bottom-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => setDisclaimerOpen(true)}
          className="text-[5px] sm:text-[8px] text-white/15 hover:text-white/40 tracking-wider transition-colors px-1.5 sm:px-2 py-0.5"
        >
          {t("security.disclaimer")}
        </button>
      </div>

      {/* FAQ 區塊 */}
      <FAQSection />

      {/* 浮動 CTA 按鈕 */}
      <FloatingCTA onPricingClick={() => setPricingOpen(true)} />

      {/* 關於區塊 */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* README 系統說明 */}
      <ReadmeModal isOpen={readmeOpen} onClose={() => setReadmeOpen(false)} />

      {/* 新手引導 */}
      {onboardingOpen && (
        <Onboarding onClose={() => setOnboardingOpen(false)} />
      )}

      {/* ===== Modals ===== */}
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <LegalModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
    </main>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <HomeInner />
    </I18nProvider>
  );
}
