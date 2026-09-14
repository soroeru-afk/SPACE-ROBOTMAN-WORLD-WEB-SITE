import React, { useState } from 'react';
import { Download, Smartphone, ExternalLink, X } from 'lucide-react';
import { usePWAInstall } from '../usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowDesktopGuide(true);
    }
  };

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleButtonClick}
        className="group relative flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-[#0d151c] hover:bg-[#142330] border border-[#00ffcc]/40 hover:border-[#00ffcc] text-[#00ffcc] text-[11px] font-['Orbitron'] tracking-wider transition-all duration-200 shadow-[0_0_12px_rgba(0,255,204,0.15)] hover:shadow-[0_0_16px_rgba(0,255,204,0.3)]"
        title="Install SPACE ROBOTMAN WORLD as System PWA"
      >
        <Download className="w-3.5 h-3.5 animate-pulse text-[#00ffcc]" />
        <span>INSTALL SYSTEM APP</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-none border border-[#00ffcc]/60 bg-[#0c0e12] p-6 shadow-[0_0_30px_rgba(0,255,204,0.2)] text-[#e0e0e0]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-4">
              <h3 className="text-[13px] font-['Orbitron'] tracking-widest text-[#00ffcc] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#00ffcc]" />
                <span>INSTALL ON iPHONE / iPAD</span>
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12px] leading-relaxed text-[#bbb] mb-4">
              1. Safariの下部ツールバーにある <strong className="text-white">共有アイコン (四角から上矢印)</strong> をタップします。<br />
              2. メニューをスクロールし、<strong className="text-[#00ffcc]">「ホーム画面に追加」</strong> を選択してください。<br />
              3. ホーム画面の専用アプリアイコンからフルスクリーンで起動できます。
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-[#181818] hover:bg-[#252525] border border-[#444] text-[#ccc] hover:text-white text-[11px] font-['Orbitron'] tracking-wider uppercase transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Fallback Guide Modal */}
      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-none border border-[#00ffcc]/60 bg-[#0c0e12] p-6 shadow-[0_0_30px_rgba(0,255,204,0.2)] text-[#e0e0e0] font-mono">
            <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-4">
              <h3 className="text-[13px] font-['Orbitron'] tracking-widest text-[#00ffcc] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#00ffcc]" />
                <span>SYSTEM APP INSTALLATION</span>
              </h3>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[12px] leading-relaxed text-[#bbb] mb-4 flex flex-col gap-2.5">
              <p>
                本システムは端末に直接インストールして、オフラインでもフルスクリーンで起動できる **PWA (Progressive Web App)** に対応しています。
              </p>
              <div className="bg-[#141414] border border-[#262626] p-3 text-[11px] text-[#ccc] flex flex-col gap-1.5">
                <div className="text-[#00ffcc] font-bold">【PC・デスクトップ（Chrome / Edge）の場合】</div>
                <div>・ブラウザのアドレスバー右端に表示される「アプリをインストール（パソコンと下矢印）」アイコンをクリックしてください。</div>
                <div className="text-[#00ffcc] font-bold mt-1">【スマートフォン（Android）の場合】</div>
                <div>・Chromeメニュー（右上「⋮」）から「アプリをインストール」または「ホーム画面に追加」を選択してください。</div>
              </div>
              {isInIframe && (
                <div className="text-[11px] text-[#ffaa44] bg-[#221808] border border-[#553311] p-2.5">
                  ※ 現在の開発プレビュー枠内（iframe）からはブラウザ仕様によりインストールが制限される場合があります。下のボタンから別タブで開いてお試しください。
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isInIframe && (
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="flex-1 py-2 bg-[#12222a] hover:bg-[#1a323e] border border-[#00ffcc]/60 text-[#00ffcc] text-[11px] font-['Orbitron'] tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>OPEN IN NEW TAB</span>
                </button>
              )}
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="flex-1 py-2 bg-[#181818] hover:bg-[#252525] border border-[#444] text-[#ccc] hover:text-white text-[11px] font-['Orbitron'] tracking-wider uppercase transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
