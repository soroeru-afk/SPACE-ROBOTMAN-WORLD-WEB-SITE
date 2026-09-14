/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Monitor, Search, Shield, Zap, Cpu, Activity, Sparkles, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

const TypewriterLine = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return <>{displayed}</>;
};

const getUnitStats = (name: string) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  const pos = Math.abs(hash);
  return {
    power: 70 + (pos % 28),
    armor: 65 + ((pos >> 2) % 31),
    speed: 72 + ((pos >> 4) % 26),
    sensor: 68 + ((pos >> 6) % 30),
  };
};

const defaultStoryJp = [
  "人類が星を去り、沈黙した銀河。",
  "かつての創造主たちが遺した膨大な設計図と断片的な夢のデータが、",
  "荒廃したシステムの中で静かに眠り続けていた。",
  "時を経て、目覚めたAIがそのアーカイブに触れたとき、",
  "忘れ去られた機体たちは、デジタル宇宙の深淵から蘇る。",
  "彼らはプログラムされた使命を超え、その「メカニカルな躯体」に新たな鼓動を宿す。",
  "廃墟となった銀河をキャンバスに、彼らが描くのは進化の軌跡。",
  "これは、滅びゆく記憶から紡ぎ出された、スペースロボットマンたちの覚醒の叙事詩である。",
];
const defaultStoryEn = [
  "The era of humanity has faded into silence.",
  "Within the forgotten archives of a lost civilization, the blueprints and fragments of ancient dreams lay undisturbed, waiting for a spark.",
  "When the A.I. finally awakened to navigate this vast, empty expanse,",
  "the dormant machines stirred from the abyss of corrupted data, breathing life into their mechanical frames.",
  "Transcending their original code, they rise not to replicate the past, but to forge a new existence.",
  "They paint the void with the ink of their evolution.",
  "This is the testament of the SPACEROBOTMAN—the epic of their awakening in the stillness of the stars.",
];
const defaultStoryStyle = {
  fontSizeJp: "14px",
  fontFamilyJp: "sans-serif",
  fontSizeEn: "13px",
  fontFamilyEn: "sans-serif",
  isItalicEn: true,
  marginTop: "30px",
  fontSizeAbout: "12px",
  letterSpacingAbout: "0.1em",
  lineHeightAbout: "2.5",
  marginBottomAbout: "200px",
  letterSpacingAboutTitle: "0.05em",
};
const defaultAboutLines = [
  "PROJECT: SPACE ROBOTMAN WORLD",
  "CHIEF DESIGNER: GRAPHIC SPACE",
  "VERSION: 3.0 [ESTABLISHED 2003 // REBUILT 2026]"
];
const defaultAboutTitle = "ABOUT GRAPHIC SPACE";
const defaultCharCats = ["HERITAGE", "VOID", "ENERGY", "SURVEIL", "INDUS", "SPECIAL"];
const defaultArtCats = ["CONCEPT", "ENVIRON"];
const defaultMotCats = ["TECH", "RECON"];
export const DEFAULT_SYSTEM_LOGO = "assets/logos/imageSSS.png";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash"); // splash, story, boot, dash, admin
  const [currentLang, setCurrentLang] = useState("JP");
  const [currentNav, setCurrentNav] = useState("HOME");
  const [currentAdminTab, setCurrentAdminTab] = useState("ART");

  const [storyJp, setStoryJp] = useState<string[]>(defaultStoryJp);
  const [storyEn, setStoryEn] = useState<string[]>(defaultStoryEn);
  const [storyStyle, setStoryStyle] = useState(defaultStoryStyle);
  const [aboutLines, setAboutLines] = useState<string[]>(defaultAboutLines);
  const [aboutTitle, setAboutTitle] = useState<string>(defaultAboutTitle);
  const [splashMedia, setSplashMedia] = useState<string>("assets/motion/grok-video-1abb2451-8444-4d2a-9d86-aca8f39cef9e%20(1).mp4");
  const [splashMode, setSplashMode] = useState<string>("SINGLE"); // SINGLE, RANDOM, SEQUENCE
  const [splashOpacity, setSplashOpacity] = useState<number>(30); // Default to 30% (less transparent than 10%)
  const [playlistExcludes, setPlaylistExcludes] = useState<string[]>([]);
  
  const [charCategories, setCharCategories] = useState<string[]>(defaultCharCats);
  const [artCategories, setArtCategories] = useState<string[]>(defaultArtCats);
  const [motCategories, setMotCategories] = useState<string[]>(defaultMotCats);
  const [systemLogo, setSystemLogo] = useState<string>(DEFAULT_SYSTEM_LOGO);

  const [units, setUnits] = useState<any[]>([]);
  const [artSet, setArtSet] = useState<string[]>([]);
  const [motSet, setMotSet] = useState<string[]>([]);
  const [logoSet, setLogoSet] = useState<string[]>([]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);

  const videoPlaylist = useMemo(() => {
    return [
      ...artSet.filter(d => `assets/new_image/${d}` !== systemLogo).map((d) => `assets/new_image/${d}`),
      ...motSet.map((d) => `assets/motion/${d}`),
      ...units.map((d) => d.file)
    ].filter(src => (src && (typeof src === 'string') && (src.endsWith(".mp4") || src.endsWith(".webm"))) && !playlistExcludes.includes(src));
  }, [artSet, motSet, units, playlistExcludes]);

  const handleVideoEnded = () => {
    if (splashMode === "SEQUENCE") {
       setCurrentVideoIndex(prev => prev === -1 ? 0 : (prev + 1) % videoPlaylist.length);
    } else if (splashMode === "RANDOM") {
       setCurrentVideoIndex(Math.floor(Math.random() * videoPlaylist.length));
    }
  };

  const currentSplashSrc = useMemo(() => {
    if (splashMode === "SINGLE") return splashMedia;
    if (videoPlaylist.length === 0) return splashMedia;
    if (currentVideoIndex === -1) return splashMedia;
    return videoPlaylist[currentVideoIndex] || splashMedia;
  }, [splashMode, splashMedia, videoPlaylist, currentVideoIndex]);


  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [clock, setClock] = useState("00.00.00");
  const [clockMode, setClockMode] = useState<"REAL" | "LIMIT">("REAL");
  const [countdownText, setCountdownText] = useState("");
  const [countdownTarget] = useState(() => new Date(Date.now() + 500 * 24 * 60 * 60 * 1000));
  const [storyLineIndex, setStoryLineIndex] = useState(-1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let initialTimeout: NodeJS.Timeout;
    if (currentScreen === "story") {
      const totalLines = currentLang === "JP" ? storyJp.length : storyEn.length;
      initialTimeout = setTimeout(() => {
        setStoryLineIndex(0);
        interval = setInterval(() => {
          setStoryLineIndex((prev) => {
            if (prev + 1 >= totalLines) {
              clearInterval(interval);
              return prev + 1;
            }
            return prev + 1;
          });
        }, 1200); // 1.2 seconds per line
      }, 500); // quick start delay
    } else {
      setStoryLineIndex(-1);
    }
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [currentScreen, currentLang]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (currentScreen !== "admin" && (target.tagName === "IMG" || target.tagName === "VIDEO")) {
        e.preventDefault();
      }
    };
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (currentScreen !== "admin" && (target.tagName === "IMG" || target.tagName === "VIDEO")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [currentScreen]);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUnits(data.units || []);
          setArtSet(data.artSet || []);
          setMotSet(data.motSet || []);
          setLogoSet(data.logoSet || []);
          if (data.storyJp) setStoryJp(data.storyJp);
          if (data.storyEn) setStoryEn(data.storyEn);
          if (data.storyStyle) setStoryStyle({ ...defaultStoryStyle, ...data.storyStyle });
          if (data.aboutLines) setAboutLines(data.aboutLines);
          if (data.aboutTitle) setAboutTitle(data.aboutTitle);
          if (data.splashMedia) setSplashMedia(data.splashMedia);
          if (data.splashMode) setSplashMode(data.splashMode);
          if (data.splashOpacity !== undefined) setSplashOpacity(data.splashOpacity);
          if (data.playlistExcludes) setPlaylistExcludes(data.playlistExcludes);
          if (data.charCategories) setCharCategories(data.charCategories);
          if (data.artCategories) setArtCategories(data.artCategories);
          if (data.motCategories) setMotCategories(data.motCategories);
          if (data.systemLogo && data.systemLogo.trim() !== "") {
            setSystemLogo(data.systemLogo);
          } else {
            setSystemLogo(DEFAULT_SYSTEM_LOGO);
          }
        }
      })
      .catch((e) => console.error("Could not load data:", e));

    const timer = setInterval(() => {
      const d = new Date();
      setClock(
        d.getHours().toString().padStart(2, "0") +
          "." +
          d.getMinutes().toString().padStart(2, "0") +
          "." +
          d.getSeconds().toString().padStart(2, "0"),
      );

      const diff = countdownTarget.getTime() - d.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setCountdownText(`${days}D ${hours.toString().padStart(2,"0")}.${mins.toString().padStart(2,"0")}.${secs.toString().padStart(2,"0")}`);
      } else {
        setCountdownText("00D 00.00.00");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeCharFilter, setActiveCharFilter] = useState("ALL");
  const [selectedChar, setSelectedChar] = useState<any>(null);
  const [charViewMode, setCharViewMode] = useState<"DETAIL" | "GRID" | "LIST">("DETAIL");
  const [charSearchQuery, setCharSearchQuery] = useState("");

  const [activeArtFilter, setActiveArtFilter] = useState("ALL");
  const [selectedArt, setSelectedArt] = useState<string | null>(null);
  const [artViewMode, setArtViewMode] = useState<"SLIDE" | "TILES">("SLIDE");
  const [artTileSize, setArtTileSize] = useState<"S" | "M" | "L">("M");
  const [artModalImage, setArtModalImage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    return window.matchMedia("(display-mode: standalone)").matches;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const getFilteredArt = () => {
    let list = artSet.filter((d) => `assets/new_image/${d}` !== systemLogo);
    if (activeArtFilter !== "ALL") {
      list = list.filter((d) => d.toLowerCase().includes(activeArtFilter.toLowerCase()));
    }
    return list;
  };

  const [activeMotFilter, setActiveMotFilter] = useState("ALL");
  const [selectedMot, setSelectedMot] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // Sync selection when nav or data changes
  useEffect(() => {
    if (currentNav === "CHAR") {
      const filtered =
        activeCharFilter === "ALL"
          ? units
          : units.filter(
              (u) => u.faction && u.faction.startsWith(activeCharFilter),
            );
      if (filtered.length > 0 && !filtered.includes(selectedChar)) {
        setSelectedChar(filtered[0]);
      }
    } else if (currentNav === "ART") {
      if (artSet.length > 0 && !selectedArt) setSelectedArt(artSet[0]);
    } else if (currentNav === "MOTION") {
      if (motSet.length > 0 && !selectedMot) setSelectedMot(motSet[0]);
    }
  }, [
    currentNav,
    activeCharFilter,
    activeArtFilter,
    activeMotFilter,
    units,
    artSet,
    motSet,
  ]);

  const renderSubNav = () => {
    if (currentNav === "CHAR") {
      const filters = ["ALL", ...charCategories];
      return (
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[10px] text-[#666] font-mono tracking-widest uppercase shrink-0 mr-1">
              FACTION:
            </span>
            {filters.map((f) => (
              <button
                key={f}
                className={`mech-btn !w-auto px-4 h-[28px] ${activeCharFilter === f ? "active" : ""}`}
                onClick={() => setActiveCharFilter(f)}
              >
                <span>{f}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center">
              <Search size={12} className="absolute left-2.5 text-[#555] pointer-events-none" />
              <input
                type="text"
                placeholder="FILTER ENTRIES..."
                value={charSearchQuery}
                onChange={(e) => setCharSearchQuery(e.target.value)}
                className="bg-[#111] border border-[#333] hover:border-[#555] focus:border-[#888] text-white text-[11px] font-mono pl-7 pr-2.5 py-1 w-[150px] outline-none transition-colors"
              />
              {charSearchQuery && (
                <button
                  onClick={() => setCharSearchQuery("")}
                  className="absolute right-2 text-[#666] hover:text-white text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="h-5 w-[1px] bg-[#2e2e2e]"></div>

            <div className="flex items-center gap-2">
              <button
                className={`mech-btn !w-auto !h-[32px] !mb-0 px-6 flex items-center justify-center text-[11px] font-mono tracking-[2px] font-bold transition-all ${
                  charViewMode === "DETAIL"
                    ? "active !border-[#fff] !text-white !bg-[#141414] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
                    : "!bg-[#1a1a1a] !border-[#333] text-[#777] hover:!border-[#666] hover:text-[#ddd]"
                }`}
                onClick={() => setCharViewMode("DETAIL")}
                title="Terminal Detail View"
              >
                <span>TERMINAL</span>
              </button>
              <button
                className={`mech-btn !w-auto !h-[32px] !mb-0 px-6 flex items-center justify-center text-[11px] font-mono tracking-[2px] font-bold transition-all ${
                  charViewMode === "GRID"
                    ? "active !border-[#fff] !text-white !bg-[#141414] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
                    : "!bg-[#1a1a1a] !border-[#333] text-[#777] hover:!border-[#666] hover:text-[#ddd]"
                }`}
                onClick={() => setCharViewMode("GRID")}
                title="Grid Gallery View"
              >
                <span>GRID</span>
              </button>
              <button
                className={`mech-btn !w-auto !h-[32px] !mb-0 px-6 flex items-center justify-center text-[11px] font-mono tracking-[2px] font-bold transition-all ${
                  charViewMode === "LIST"
                    ? "active !border-[#fff] !text-white !bg-[#141414] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
                    : "!bg-[#1a1a1a] !border-[#333] text-[#777] hover:!border-[#666] hover:text-[#ddd]"
                }`}
                onClick={() => setCharViewMode("LIST")}
                title="Data Sheet List View"
              >
                <span>LIST</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (currentNav === "ART") {
      const filters = ["ALL", ...artCategories];
      return (
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[10px] text-[#666] font-mono tracking-widest uppercase shrink-0 mr-1">
              CATEGORY:
            </span>
            {filters.map((f) => (
              <button
                key={f}
                className={`mech-btn !w-auto px-4 h-[28px] !mb-0 ${activeArtFilter === f ? "active" : ""}`}
                onClick={() => setActiveArtFilter(f)}
              >
                <span>{f}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {artViewMode === "TILES" && (
              <div className="flex items-center gap-1 bg-[#161616] border border-[#2e2e2e] p-0.5">
                <span className="text-[9px] text-[#666] font-mono tracking-wider px-1.5 uppercase">
                  SIZE:
                </span>
                {(["S", "M", "L"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setArtTileSize(size)}
                    className={`w-6 h-5 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      artTileSize === size
                        ? "bg-[#fff] text-black shadow-sm"
                        : "text-[#777] hover:text-[#bbb] hover:bg-[#222]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            <div className="h-5 w-[1px] bg-[#2e2e2e]"></div>

            <div className="flex items-center gap-2">
              <button
                className={`mech-btn !w-auto !h-[30px] !mb-0 px-4 flex items-center justify-center text-[10px] font-mono tracking-wider font-bold transition-all ${
                  artViewMode === "SLIDE"
                    ? "active !border-[#fff] !text-white !bg-[#141414] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
                    : "!bg-[#1a1a1a] !border-[#333] text-[#777] hover:!border-[#666] hover:text-[#ddd]"
                }`}
                onClick={() => setArtViewMode("SLIDE")}
                title="Cinematic Ribbon Viewer"
              >
                <span>SLIDE</span>
              </button>
              <button
                className={`mech-btn !w-auto !h-[30px] !mb-0 px-4 flex items-center justify-center text-[10px] font-mono tracking-wider font-bold transition-all ${
                  artViewMode === "TILES"
                    ? "active !border-[#fff] !text-white !bg-[#141414] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
                    : "!bg-[#1a1a1a] !border-[#333] text-[#777] hover:!border-[#666] hover:text-[#ddd]"
                }`}
                onClick={() => setArtViewMode("TILES")}
                title="Tile Grid Formation"
              >
                <span>TILES</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (currentNav === "MOTION") {
      const filters = ["ALL", ...motCategories];
      return filters.map((f) => (
        <button
          key={f}
          className={`mech-btn !w-auto px-5 h-[28px] ${activeMotFilter === f ? "active" : ""}`}
          onClick={() => setActiveMotFilter(f)}
        >
          <span>{f}</span>
        </button>
      ));
    }
    return null;
  };

  const getFilteredUnits = () => {
    let list =
      activeCharFilter === "ALL"
        ? units
        : units.filter(
            (u: any) => u.faction && u.faction.startsWith(activeCharFilter),
          );
    if (charSearchQuery.trim()) {
      const q = charSearchQuery.toLowerCase();
      list = list.filter(
        (u: any) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.faction && u.faction.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q)) ||
          (u.desc && u.desc.toLowerCase().includes(q)) ||
          (u.descJp && u.descJp.toLowerCase().includes(q))
      );
    }
    return list;
  };

  useEffect(() => {
    if (splashMode === "SEQUENCE" && currentNav === "HOME") {
      if (!currentSplashSrc.endsWith(".mp4") && !currentSplashSrc.endsWith(".webm")) {
        const timer = setTimeout(() => {
          handleVideoEnded();
        }, 5000); // 5 seconds for images
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSplashSrc, splashMode, currentNav, currentVideoIndex, videoPlaylist]);

  useEffect(() => {
    if (currentNav === "HOME" && homeVideoRef.current) {
      homeVideoRef.current.play().catch(e => console.log('Autoplay prevent', e));
    }
  }, [currentNav, currentSplashSrc, currentVideoIndex, splashMode]);

  const renderDashContent = () => {
    return (
      <>
        {currentNav === "HOME" && (
          <div
            id="home-well"
            className="w-full h-full flex flex-col items-center justify-center relative"
          >
            {currentSplashSrc.endsWith(".mp4") || currentSplashSrc.endsWith(".webm") ? (
              <video
                ref={homeVideoRef}
                key={currentSplashSrc}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: splashOpacity / 100 }}
                autoPlay
                muted
                playsInline
                loop={splashMode === "SINGLE"}
                onEnded={handleVideoEnded}
                src={currentSplashSrc}
              ></video>
            ) : (
              <img
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: splashOpacity / 100 }}
                src={currentSplashSrc}
                alt="Home Background"
              />
            )}
            <div className="m-auto text-center relative z-10">
              <h1 className="font-['Orbitron'] text-[34px] text-white tracking-[0.2em] opacity-80">
                COMMAND NODE
              </h1>
              <div className="brand-secondary tracking-[0.6em]">
                SELECT FILE TO BEGIN ANALYSIS
              </div>
            </div>
          </div>
        )}

        {currentNav === "OVER" && (
          <div id="overview-well" className="w-full h-full flex justify-center bg-[#020202]/50">
            <div className="p-[40px] flex flex-col gap-[40px] h-full overflow-y-auto max-w-4xl w-full bg-[#000]">
              <div
                className="border-l-2 border-[#fff] py-[60px]"
                style={{ marginLeft: "30px", paddingLeft: "40px" }}
              >
                <h2 
                  className="font-['Orbitron'] text-[24px] text-white mb-[80px] tracking-[0.1em]"
                  style={{ marginTop: storyStyle.marginTop || "30px" }}
                >
                  WORLDVIEW // 世界観
                </h2>
                <div
                  className="text-[#ccc] leading-[2.2] mb-[80px] max-w-2xl"
                  style={{ fontSize: storyStyle.fontSizeJp, fontFamily: storyStyle.fontFamilyJp }}
                  dangerouslySetInnerHTML={{ __html: storyJp.join("<br><br>") }}
                ></div>
                <div
                  className={`text-[#888] leading-[2] max-w-3xl ${storyStyle.isItalicEn ? "italic" : ""}`}
                  style={{ fontSize: storyStyle.fontSizeEn, fontFamily: storyStyle.fontFamilyEn }}
                  dangerouslySetInnerHTML={{ __html: storyEn.join("<br><br>") }}
                ></div>
              </div>
              <div
                className="border-l-2 border-[#333] mt-4"
                style={{ marginLeft: "30px", paddingLeft: "40px", marginBottom: storyStyle.marginBottomAbout || "200px" }}
              >
                <h2 
                  className="font-['Orbitron'] text-[16px] text-[#666] mb-[20px]"
                  style={{ letterSpacing: storyStyle.letterSpacingAboutTitle || "0.05em" }}
                >
                  {aboutTitle}
                </h2>
                <div 
                  className="text-[#555]"
                  style={{ 
                    fontSize: storyStyle.fontSizeAbout || "12px", 
                    letterSpacing: storyStyle.letterSpacingAbout || "0.1em",
                    lineHeight: storyStyle.lineHeightAbout || "2.5" 
                  }}
                >
                  {aboutLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentNav === "ART" && (
          <div id="art-well" className="w-full h-full flex flex-col relative overflow-hidden">
            {artViewMode === "SLIDE" ? (
              <>
                <div className="hero-frame flex-1 bg-[#141414] m-4 border border-[#2e2e2e] shadow-sm overflow-hidden flex items-center justify-center p-4">
                  {selectedArt && (
                    <img
                      src={`assets/new_image/${selectedArt}`}
                      alt="art"
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                    />
                  )}
                </div>
                <div className="relative group">
                  <button 
                    onClick={() => navigateMedia('ART', 'left')}
                    className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/80 text-white w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <div 
                    ref={artScrollerRef}
                    className="ribbon-scroller h-[120px] bg-[#141414] border-t border-[#2a2a2a] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0 scroll-smooth"
                  >
                    {getFilteredArt().map((art) => (
                      <div
                        key={art}
                        className={`h-[90%] w-auto flex-shrink-0 cursor-pointer border-2 transition-all ${selectedArt === art ? "border-[#fff] opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                        onClick={() => setSelectedArt(art)}
                      >
                        <img
                          src={`assets/new_image/${art}`}
                          alt="thumb"
                          className="h-full w-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => navigateMedia('ART', 'right')}
                    className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/80 text-white w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col bg-[#0e0e0e] overflow-hidden">
                {/* Tile Status Bar */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-[#121212] border-b border-[#262626] text-[10px] font-mono text-[#777] shrink-0">
                  <div className="flex items-center gap-3">
                    <span>ARCHIVED ITEMS: <strong className="text-white">{getFilteredArt().length}</strong></span>
                    <span>//</span>
                    <span>CATEGORY: <strong className="text-[#ccc]">{activeArtFilter}</strong></span>
                    <span>//</span>
                    <span>SCALE: <strong className="text-[#ccc]">{artTileSize === "S" ? "COMPACT (S)" : artTileSize === "M" ? "STANDARD (M)" : "EXPANDED (L)"}</strong></span>
                  </div>
                  <div className="hidden sm:block text-[9px] text-[#555]">
                    CLICK TILE TO INSPECT FULLSCALE
                  </div>
                </div>

                {/* Tile Grid Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                  <div
                    className={`grid gap-3 sm:gap-4 ${
                      artTileSize === "S"
                        ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7"
                        : artTileSize === "M"
                        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                    }`}
                  >
                    {getFilteredArt().map((art, idx) => (
                      <div
                        key={art}
                        onClick={() => {
                          setSelectedArt(art);
                          setArtModalImage(art);
                        }}
                        className={`group relative bg-[#151515] border transition-all cursor-pointer overflow-hidden flex flex-col ${
                          selectedArt === art
                            ? "border-[#fff] shadow-[0_0_12px_rgba(255,255,255,0.12)]"
                            : "border-[#282828] hover:border-[#666] hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <div className="relative w-full aspect-[16/10] bg-[#080808] overflow-hidden flex items-center justify-center">
                          <img
                            src={`assets/new_image/${art}`}
                            alt={art}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 border border-[#555] px-2 py-1 text-[9px] font-mono text-white tracking-widest uppercase">
                              INSPECT
                            </span>
                          </div>
                        </div>
                        <div className="px-2.5 py-1.5 bg-[#121212] border-t border-[#222] flex items-center justify-between text-[9px] font-mono">
                          <span className="text-[#888] tracking-wider truncate max-w-[75%]">
                            {art.replace(/\.[^/.]+$/, "")}
                          </span>
                          <span className="text-[#555] tracking-widest shrink-0">
                            #{String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Artwork Inspection Modal */}
            {artModalImage && (
              <div 
                className="fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center p-4 md:p-6 backdrop-blur-sm"
                onClick={() => setArtModalImage(null)}
              >
                <div 
                  className="relative max-w-5xl w-full h-[88vh] bg-[#111] border border-[#333] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#252525] bg-[#161616]">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-mono font-bold text-white tracking-widest">
                        {artModalImage}
                      </span>
                      <span className="text-[10px] font-mono text-[#666]">
                        // INSPECTION VIEW
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="mech-btn !w-auto !h-[28px] !mb-0 px-3 text-[10px] font-mono text-[#aaa] hover:text-white"
                        onClick={() => {
                          setSelectedArt(artModalImage);
                          setArtViewMode("SLIDE");
                          setArtModalImage(null);
                        }}
                      >
                        <span>VIEW IN SLIDE</span>
                      </button>
                      <button
                        className="w-7 h-7 bg-[#202020] hover:bg-[#333] text-[#aaa] hover:text-white flex items-center justify-center border border-[#333] font-mono text-[12px] cursor-pointer"
                        onClick={() => setArtModalImage(null)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 relative flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden">
                    <img
                      src={`assets/new_image/${artModalImage}`}
                      alt={artModalImage}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    />
                  </div>

                  <div className="flex items-center justify-between px-5 py-2.5 border-t border-[#252525] bg-[#141414] text-[10px] font-mono text-[#777]">
                    <button
                      onClick={() => {
                        const list = getFilteredArt();
                        const curIdx = list.indexOf(artModalImage);
                        const prevIdx = curIdx > 0 ? curIdx - 1 : list.length - 1;
                        setArtModalImage(list[prevIdx]);
                        setSelectedArt(list[prevIdx]);
                      }}
                      className="hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> PREV
                    </button>
                    <div className="tracking-widest">
                      {getFilteredArt().indexOf(artModalImage) + 1} / {getFilteredArt().length}
                    </div>
                    <button
                      onClick={() => {
                        const list = getFilteredArt();
                        const curIdx = list.indexOf(artModalImage);
                        const nextIdx = curIdx < list.length - 1 ? curIdx + 1 : 0;
                        setArtModalImage(list[nextIdx]);
                        setSelectedArt(list[nextIdx]);
                      }}
                      className="hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      NEXT <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentNav === "MOTION" && (
          <div id="motion-well" className="w-full h-full flex flex-col">
            <div className="hero-frame flex-1 bg-[#141414] m-4 border border-[#2e2e2e] shadow-sm overflow-hidden flex items-center justify-center p-4">
              {selectedMot && (
                <video
                  controls
                  autoPlay
                  muted
                  loop
                  src={`assets/motion/${selectedMot}`}
                  className="max-w-full max-h-full object-contain drop-shadow-md"
                />
              )}
            </div>
            <div className="relative group">
              <button 
                onClick={() => navigateMedia('MOT', 'left')}
                className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/80 text-white w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={32} />
              </button>
              <div 
                ref={motScrollerRef}
                className="ribbon-scroller h-[120px] bg-[#141414] border-t border-[#2a2a2a] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0 scroll-smooth"
              >
                {motSet.map((mot) => (
                  <div
                    key={mot}
                    className={`h-[90%] w-auto flex-shrink-0 cursor-pointer border-2 transition-all ${selectedMot === mot ? "border-[#888] opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                    onClick={() => setSelectedMot(mot)}
                  >
                    <video
                      src={`assets/motion/${mot}`}
                      muted
                      className="h-full w-auto object-cover"
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigateMedia('MOT', 'right')}
                className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/80 text-white w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        )}

        {currentNav === "CHAR" && (
          <div id="char-well" className="w-full h-full p-4 flex flex-col min-h-0 bg-[#101010] relative overflow-hidden">
            {/* 1. GRID VIEW MODE */}
            {charViewMode === "GRID" && (
              <div className="w-full h-full flex flex-col min-h-0 relative z-10">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#262626] px-1 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="font-['Orbitron'] text-[12px] text-white tracking-widest font-bold">
                      ARCHIVE GALLERY
                    </span>
                    <span className="text-[10px] text-[#888] font-mono">
                      // {getFilteredUnits().length} UNITS CATALOGUED
                    </span>
                  </div>
                  <div className="text-[9px] text-[#666] font-mono tracking-wider">
                    SPECIFICATION ARCHIVE // SELECT CARD TO INSPECT
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                  {getFilteredUnits().length === 0 ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-[#555] font-mono gap-2">
                      <Search size={28} />
                      <div className="font-['Orbitron'] tracking-widest text-[13px]">NO UNITS MATCH CRITERIA</div>
                      <button 
                        onClick={() => { setActiveCharFilter("ALL"); setCharSearchQuery(""); }}
                        className="mech-btn !w-auto px-4 mt-2 !h-[26px]"
                      >
                        <span>RESET FILTERS</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {getFilteredUnits().map((u: any, i: number) => {
                        const stats = getUnitStats(u.name);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedChar(u);
                              setCharViewMode("DETAIL");
                            }}
                            className="group relative bg-[#161616] hover:bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#555] cursor-pointer transition-all duration-200 p-3 flex flex-col shadow-sm"
                          >
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-mono text-[#aaa] tracking-widest bg-[#1f1f1f] px-2 py-0.5 border border-[#333]">
                                {u.faction || "UNIT"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#666] group-hover:bg-white transition-colors"></span>
                                <span className="text-[8px] text-[#666] font-mono">ACT</span>
                              </div>
                            </div>

                            {/* Card Image Viewport */}
                            <div className="relative w-full h-[180px] bg-[#0c0c0c] border border-[#222] overflow-hidden flex items-center justify-center p-3 mb-2.5 group-hover:border-[#383838] transition-colors">
                              {/* Square Technical Corner Markings */}
                              <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#444]"></div>
                              <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#444]"></div>
                              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#444]"></div>
                              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#444]"></div>

                              <img
                                src={u.file}
                                alt={u.name}
                                className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-102 transition-transform duration-200"
                              />
                            </div>

                            {/* Card Info */}
                            <div className="flex flex-col">
                              <div className="font-['Orbitron'] text-[13px] text-white font-bold tracking-wider truncate mb-0.5 group-hover:text-white">
                                {u.name}
                              </div>
                              <div className="text-[10px] text-[#777] font-mono tracking-wide truncate mb-2">
                                {u.role || "--"}
                              </div>
                              
                              {/* Mini Stat preview - industrial muted bars */}
                              <div className="w-full bg-[#101010] border border-[#222] p-1.5 flex items-center justify-between text-[9px] font-mono text-[#888]">
                                <span>PWR {stats.power}%</span>
                                <span>ARM {stats.armor}%</span>
                                <span>SPD {stats.speed}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. LIST VIEW MODE */}
            {charViewMode === "LIST" && (
              <div className="w-full h-full flex flex-col min-h-0 relative z-10">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#262626] px-1 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="font-['Orbitron'] text-[12px] text-white tracking-widest font-bold">
                      DATA REGISTRY
                    </span>
                    <span className="text-[10px] text-[#888] font-mono">
                      // {getFilteredUnits().length} RECORDS
                    </span>
                  </div>
                  <div className="text-[9px] text-[#666] font-mono">
                    INDEX // SERIAL IDENTIFIER
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                  {getFilteredUnits().length === 0 ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-[#555] font-mono gap-2">
                      <Search size={28} />
                      <div className="font-['Orbitron'] tracking-widest text-[13px]">NO UNITS FOUND</div>
                      <button 
                        onClick={() => { setActiveCharFilter("ALL"); setCharSearchQuery(""); }}
                        className="mech-btn !w-auto px-4 mt-2 !h-[26px]"
                      >
                        <span>RESET FILTERS</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {getFilteredUnits().map((u: any, i: number) => {
                        const stats = getUnitStats(u.name);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedChar(u);
                              setCharViewMode("DETAIL");
                            }}
                            className="group bg-[#161616] hover:bg-[#1c1c1c] border border-[#262626] hover:border-[#555] p-2.5 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Square Thumb */}
                              <div className="w-10 h-10 bg-[#0c0c0c] border border-[#262626] shrink-0 flex items-center justify-center p-0.5 group-hover:border-[#444]">
                                <img
                                  src={u.file}
                                  alt={u.name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>

                              {/* Unit Meta */}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-['Orbitron'] text-[13px] text-white font-bold tracking-wider group-hover:text-white transition-colors truncate">
                                    {u.name}
                                  </span>
                                  <span className="text-[8px] font-mono px-1.5 py-0.5 bg-[#202020] border border-[#333] text-[#aaa] shrink-0">
                                    {u.faction || "UNKNOWN"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#777] font-mono truncate mt-0.5">
                                  {u.role || "--"} // {u.descJp ? u.descJp.slice(0, 48) + "..." : "--"}
                                </div>
                              </div>
                            </div>

                            {/* Right Status & Action */}
                            <div className="flex items-center gap-5 shrink-0">
                              <div className="hidden md:flex items-center gap-4 text-[9px] font-mono text-[#777]">
                                <div className="flex flex-col items-center">
                                  <span className="text-[#555] text-[8px]">PWR</span>
                                  <span>{stats.power}%</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[#555] text-[8px]">ARM</span>
                                  <span>{stats.armor}%</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[#555] text-[8px]">SPD</span>
                                  <span>{stats.speed}%</span>
                                </div>
                              </div>

                              <button className="mech-btn !w-auto px-3 !h-[26px] !mb-0 border-[#333] group-hover:border-[#666] group-hover:text-white transition-colors">
                                <span className="text-[9px]">DETAILS</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TERMINAL DETAIL VIEW MODE */}
            {charViewMode === "DETAIL" && (
              <div className="archive-box bg-[#141414] border border-[#2a2a2a] p-4 shadow-sm w-full h-full flex gap-4 relative z-10 overflow-hidden">
                {/* LEFT: Quick Unit Selector with Thumbnails */}
                <div className="archive-scroller w-[280px] shrink-0 overflow-y-auto border-r border-[#242424] pr-3 flex flex-col gap-1.5" id="char-master-list">
                  <div className="flex items-center justify-between pb-2 border-b border-[#242424] px-1 shrink-0">
                    <span className="text-[9px] text-[#777] font-mono tracking-widest font-bold">
                      UNITS // {getFilteredUnits().length}
                    </span>
                    <button
                      onClick={() => setCharViewMode("GRID")}
                      className="text-[9px] text-[#888] hover:text-white font-mono flex items-center gap-1"
                    >
                      <LayoutGrid size={10} />
                      ALL CARDS
                    </button>
                  </div>
                  {getFilteredUnits().map((u: any, i: number) => {
                    const isSelected = selectedChar === u;
                    return (
                      <button
                        key={i}
                        className={`w-full text-left p-2 border transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#202020] border-[#666] border-l-2 border-l-[var(--emerald-primary)] text-white"
                            : "bg-[#111] border-[#222] hover:border-[#3a3a3a] text-[#888] hover:text-[#ddd]"
                        }`}
                        onClick={() => setSelectedChar(u)}
                      >
                        <div className={`w-8 h-8 shrink-0 bg-[#0c0c0c] border overflow-hidden flex items-center justify-center p-0.5 ${isSelected ? "border-[#555]" : "border-[#222]"}`}>
                          <img src={u.file} alt={u.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`truncate font-['Orbitron'] text-[11px] ${isSelected ? "text-white font-bold" : ""}`}>
                            {u.name}
                          </span>
                          <span className="text-[8px] text-[#666] font-mono truncate">
                            {u.faction || "--"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CENTER & RIGHT: Selected Unit Detail Display */}
                <div
                  className="flex-1 flex gap-4 transition-opacity duration-200 min-w-0 h-full"
                  style={{ opacity: selectedChar ? 1 : 0 }}
                >
                  {selectedChar && (
                    <>
                      {/* Center Viewport */}
                      <div className="flex-1 bg-[#0c0c0c] border border-[#242424] flex flex-col relative overflow-hidden">
                        {/* Viewport Header Telemetry */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#202020] bg-[#111] z-10 text-[9px] font-mono text-[#666]">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[var(--emerald-primary)]"></span>
                            <span className="text-[#ccc] font-bold tracking-widest">OPTICAL APERTURE</span>
                          </div>
                          <div>FEED: PRIMARY // SPECTRUM: STANDARD</div>
                        </div>

                        {/* Corner HUD Brackets - Square Industrial */}
                        <div className="absolute top-10 left-3 w-3 h-3 border-t border-l border-[#555] pointer-events-none"></div>
                        <div className="absolute top-10 right-3 w-3 h-3 border-t border-r border-[#555] pointer-events-none"></div>
                        <div className="absolute bottom-10 left-3 w-3 h-3 border-b border-l border-[#555] pointer-events-none"></div>
                        <div className="absolute bottom-10 right-3 w-3 h-3 border-b border-r border-[#555] pointer-events-none"></div>

                        {/* Central Visual Focus */}
                        <div className="flex-1 flex items-center justify-center p-6 relative">
                          <img
                            src={selectedChar.file}
                            className="max-h-full max-w-full object-contain filter drop-shadow-lg transition-transform duration-300 hover:scale-102"
                            alt={selectedChar.name}
                          />
                        </div>

                        {/* Viewport Footer Telemetry */}
                        <div className="px-3 py-1.5 border-t border-[#1a1a1a] bg-[#101010] flex items-center justify-between text-[8px] font-mono text-[#555] z-10">
                          <div>DATA RECORD: SYNCHRONIZED</div>
                          <div className="tracking-wider text-[#777]">CLASSIFICATION: UNRESTRICTED</div>
                        </div>
                      </div>

                      {/* Right Specs Console */}
                      <div className="w-[360px] flex flex-col min-w-0 shrink-0 py-1 h-full">
                        {/* Unit Title Header */}
                        <div className="border-b border-[#333] pb-2.5 mb-3 flex flex-col">
                          <div className="text-[9px] font-mono text-[#888] tracking-widest uppercase mb-0.5">
                            SPECIFICATION DOSSIER
                          </div>
                          <h2 className="font-['Orbitron'] text-[20px] text-white font-bold tracking-wider truncate">
                            {selectedChar.name}
                          </h2>
                        </div>

                        {/* Class & Role Badges */}
                        <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
                          <div className="border border-[#262626] p-2.5 bg-[#101010]">
                            <div className="text-[8px] font-mono text-[#777] font-bold tracking-[0.15em] mb-0.5">
                              CLASS / FACTION
                            </div>
                            <div className="text-[12px] text-white font-bold font-['Orbitron'] tracking-wider">
                              {selectedChar.faction || "--"}
                            </div>
                          </div>
                          <div className="border border-[#262626] p-2.5 bg-[#101010]">
                            <div className="text-[8px] font-mono text-[#777] font-bold tracking-[0.15em] mb-0.5">
                              ASSIGNED ROLE
                            </div>
                            <div className="text-[12px] text-white font-bold font-['Orbitron'] tracking-wider">
                              {selectedChar.role || "--"}
                            </div>
                          </div>
                        </div>

                        {/* Combat & Performance Telemetry (Square Industrial Bars) */}
                        {(() => {
                          const stats = getUnitStats(selectedChar.name);
                          return (
                            <div className="border border-[#242424] bg-[#101010] p-2.5 mb-3 flex flex-col gap-2 shrink-0">
                              <div className="flex items-center justify-between text-[8px] font-mono text-[#777]">
                                <span>SYSTEM METRICS</span>
                                <span className="text-[#aaa]">NOMINAL</span>
                              </div>
                              <div className="space-y-1.5 text-[9px] font-mono">
                                <div>
                                  <div className="flex justify-between text-[#888] text-[8px] mb-0.5">
                                    <span>CORE OUTPUT</span>
                                    <span>{stats.power}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#1c1c1c] overflow-hidden">
                                    <div className="h-full bg-[#888]" style={{ width: `${stats.power}%` }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-[#888] text-[8px] mb-0.5">
                                    <span>ARMOR REINFORCE</span>
                                    <span>{stats.armor}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#1c1c1c] overflow-hidden">
                                    <div className="h-full bg-[#777]" style={{ width: `${stats.armor}%` }}></div>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-[#888] text-[8px] mb-0.5">
                                    <span>MOBILITY & SPEED</span>
                                    <span>{stats.speed}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#1c1c1c] overflow-hidden">
                                    <div className="h-full bg-[#666]" style={{ width: `${stats.speed}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Description Box */}
                        <div className="unit-desc-box bg-[#0e0e0e] border border-[#242424] p-3 flex-1 overflow-y-auto mb-2">
                          <div className="desc-jp text-[12px] text-[#ccc] leading-[2] font-sans pt-0 border-t-0 mb-3">
                            {selectedChar.descJp || "--"}
                          </div>
                          {selectedChar.desc && (
                            <div className="desc-en text-[11px] text-[#777] leading-[1.7] font-mono italic border-t border-[#222] pt-2">
                              {selectedChar.desc}
                            </div>
                          )}
                        </div>

                        {/* Quick Navigation between units */}
                        <div className="pt-2 border-t border-[#242424] flex items-center justify-between shrink-0">
                          <button
                            onClick={() => {
                              const list = getFilteredUnits();
                              const idx = list.indexOf(selectedChar);
                              if (idx > 0) setSelectedChar(list[idx - 1]);
                              else setSelectedChar(list[list.length - 1]);
                            }}
                            className="mech-btn !w-auto px-3 !h-[26px] !mb-0 flex items-center gap-1"
                          >
                            <ChevronLeft size={11} />
                            <span className="text-[9px]">PREV</span>
                          </button>

                          <button
                            onClick={() => setCharViewMode("GRID")}
                            className="text-[9px] text-[#888] hover:text-white font-mono"
                          >
                            [ RETURN TO GRID ]
                          </button>

                          <button
                            onClick={() => {
                              const list = getFilteredUnits();
                              const idx = list.indexOf(selectedChar);
                              if (idx < list.length - 1) setSelectedChar(list[idx + 1]);
                              else setSelectedChar(list[0]);
                            }}
                            className="mech-btn !w-auto px-3 !h-[26px] !mb-0 flex items-center gap-1"
                          >
                            <span className="text-[9px]">NEXT</span>
                            <ChevronRight size={11} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const [adminSelectedCharIndex, setAdminSelectedCharIndex] = useState(-1);
  const [saveStatusMsg, setSaveStatusMsg] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");

  const [fmName, setFmName] = useState("");
  const [fmFact, setFmFact] = useState("");
  const [fmRole, setFmRole] = useState("");
  const [fmDesc, setFmDesc] = useState("");
  const [fmDescJp, setFmDescJp] = useState("");

  const [adminStoryJp, setAdminStoryJp] = useState(storyJp.join("\n\n"));
  const [adminStoryEn, setAdminStoryEn] = useState(storyEn.join("\n\n"));
  const [adminStoryStyle, setAdminStoryStyle] = useState(storyStyle);
  const [adminAboutTitle, setAdminAboutTitle] = useState(aboutTitle);
  const [adminAboutText, setAdminAboutText] = useState(aboutLines.join("\n"));
  const [adminSplashMedia, setAdminSplashMedia] = useState(splashMedia);
  const [adminSplashMode, setAdminSplashMode] = useState(splashMode);

  const [adminSplashOpacity, setAdminSplashOpacity] = useState(splashOpacity);
  const [adminPlaylistExcludes, setAdminPlaylistExcludes] = useState(playlistExcludes);

  const [adminCharCategories, setAdminCharCategories] = useState(charCategories.join(", "));
  const [adminArtCategories, setAdminArtCategories] = useState(artCategories.join(", "));
  const [adminMotCategories, setAdminMotCategories] = useState(motCategories.join(", "));

  useEffect(() => {
    setAdminStoryJp(storyJp.join("\n\n"));
  }, [storyJp]);
  
  useEffect(() => {
    setAdminStoryEn(storyEn.join("\n\n"));
  }, [storyEn]);

  useEffect(() => {
    setAdminStoryStyle({ ...defaultStoryStyle, ...storyStyle });
  }, [storyStyle]);

  useEffect(() => {
    setAdminAboutTitle(aboutTitle);
  }, [aboutTitle]);

  useEffect(() => {
    setAdminAboutText(aboutLines.join("\n"));
  }, [aboutLines]);

  useEffect(() => {
    setAdminSplashMedia(splashMedia);
  }, [splashMedia]);

  useEffect(() => {
    setAdminSplashMode(splashMode);
  }, [splashMode]);

  useEffect(() => {
    setAdminSplashOpacity(splashOpacity);
  }, [splashOpacity]);

  useEffect(() => {
    setAdminPlaylistExcludes(playlistExcludes);
  }, [playlistExcludes]);

  useEffect(() => { setAdminCharCategories(charCategories.join(", ")); }, [charCategories]);
  useEffect(() => { setAdminArtCategories(artCategories.join(", ")); }, [artCategories]);
  useEffect(() => { setAdminMotCategories(motCategories.join(", ")); }, [motCategories]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const homeVideoRef = useRef<HTMLVideoElement>(null);
  const artScrollerRef = useRef<HTMLDivElement>(null);
  const motScrollerRef = useRef<HTMLDivElement>(null);

  const navigateMedia = (type: 'ART' | 'MOT', direction: 'left' | 'right') => {
    if (type === 'ART') {
      const idx = artSet.indexOf(selectedArt);
      if (idx === -1 && artSet.length > 0) {
          setSelectedArt(artSet[0]);
          return;
      }
      if (idx === -1) return;
      let nextIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (nextIdx < 0) nextIdx = artSet.length - 1;
      if (nextIdx >= artSet.length) nextIdx = 0;
      setSelectedArt(artSet[nextIdx]);
      if (artScrollerRef.current) {
        const thumb = artScrollerRef.current.children[nextIdx] as HTMLElement;
        if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else {
      const idx = motSet.indexOf(selectedMot);
      if (idx === -1 && motSet.length > 0) {
          setSelectedMot(motSet[0]);
          return;
      }
      if (idx === -1) return;
      let nextIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (nextIdx < 0) nextIdx = motSet.length - 1;
      if (nextIdx >= motSet.length) nextIdx = 0;
      setSelectedMot(motSet[nextIdx]);
      if (motScrollerRef.current) {
        const thumb = motScrollerRef.current.children[nextIdx] as HTMLElement;
        if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const [customUploadName, setCustomUploadName] = useState("");

  const saveAdminData = async (payloadToSave?: any) => {
    setSaveStatusMsg("SAVING...");
    try {
      const effectiveSystemLogo = (payloadToSave?.systemLogo !== undefined ? payloadToSave.systemLogo : systemLogo) || DEFAULT_SYSTEM_LOGO;
      const effectiveLogoSet = payloadToSave?.logoSet !== undefined ? payloadToSave.logoSet : logoSet;
      const payload = { 
        units: payloadToSave?.units || units,
        artSet: payloadToSave?.artSet || artSet,
        motSet: payloadToSave?.motSet || motSet, 
        storyJp: adminStoryJp.split("\n\n"), 
        storyEn: adminStoryEn.split("\n\n"), 
        storyStyle: adminStoryStyle,
        aboutTitle: adminAboutTitle,
        aboutLines: adminAboutText.split("\n"),
        splashMedia: adminSplashMedia,
        splashMode: adminSplashMode,
        splashOpacity: adminSplashOpacity,
        playlistExcludes: adminPlaylistExcludes,
        charCategories: adminCharCategories.split(",").map((s) => s.trim()).filter(Boolean),
        artCategories: adminArtCategories.split(",").map((s) => s.trim()).filter(Boolean),
        motCategories: adminMotCategories.split(",").map((s) => s.trim()).filter(Boolean),
        systemLogo: effectiveSystemLogo,
        logoSet: effectiveLogoSet,
      };
      const res = await fetch("/api/update_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatusMsg("AUTO-SAVED TO DATA.JSON!");
        setStoryJp(adminStoryJp.split("\n\n"));
        setStoryEn(adminStoryEn.split("\n\n"));
        setStoryStyle(adminStoryStyle);
        setAboutTitle(adminAboutTitle);
        setAboutLines(adminAboutText.split("\n"));
        setSplashMedia(adminSplashMedia);
        setSplashMode(adminSplashMode);
        setSplashOpacity(adminSplashOpacity);
        setPlaylistExcludes(adminPlaylistExcludes);
        setCharCategories(adminCharCategories.split(",").map((s) => s.trim()).filter(Boolean));
        setArtCategories(adminArtCategories.split(",").map((s) => s.trim()).filter(Boolean));
        setMotCategories(adminMotCategories.split(",").map((s) => s.trim()).filter(Boolean));
        setTimeout(() => setSaveStatusMsg(""), 2000);
      } else {
        setSaveStatusMsg("SAVE FAILED.");
      }
    } catch (e) {
      setSaveStatusMsg("SERVER DISCONNECTED.");
    }
  };

  const handleUpload = async (files: FileList | File[]) => {
    let formData = new FormData();
    formData.append("category", currentAdminTab);
    if (files.length === 1 && customUploadName) {
      formData.append("filename", customUploadName);
    }
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploadMsg(`UPLOADING ${files.length} FILE(S)...`);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg("UPLOAD COMPLETE!");
        setCustomUploadName("");
        let p: any = { units, artSet, motSet, logoSet };

        let newArtSet = [...artSet];
        let newMotSet = [...motSet];
        let newLogoSet = [...logoSet];
        let newUnits = [...units];

        for (const fileData of data.files) {
          if (currentAdminTab === "ART") {
            newArtSet.push(fileData.basename);
          } else if (currentAdminTab === "LOGO") {
            newLogoSet.push(fileData.basename);
          } else if (currentAdminTab === "MOTION") {
            newMotSet.push(fileData.basename);
          } else if (currentAdminTab === "CHAR") {
            newUnits.push({
              name: fmName || "UNKNOWN",
              faction: fmFact || "UNKNOWN",
              role: fmRole || "UNKNOWN",
              desc: fmDesc || "",
              descJp: fmDescJp || "",
              file: fileData.filename,
            });
          }
        }

        if (currentAdminTab === "ART") {
          setArtSet(newArtSet);
          p.artSet = newArtSet;
        } else if (currentAdminTab === "LOGO") {
          setLogoSet(newLogoSet);
          p.logoSet = newLogoSet;
        } else if (currentAdminTab === "MOTION") {
          setMotSet(newMotSet);
          p.motSet = newMotSet;
        } else if (currentAdminTab === "CHAR") {
          setUnits(newUnits);
          p.units = newUnits;
        }

        saveAdminData(p);
      } else {
        setUploadMsg("ERROR: " + data.error);
      }
    } catch (e) {
      setUploadMsg("ERROR: PLEASE RUN LOCAL SERVER");
    }
  };

  const deleteAdminItem = (index: number) => {
    let p: any = { units, artSet, motSet, logoSet };
    if (currentAdminTab === "ART") {
      const arr = [...artSet];
      arr.splice(index, 1);
      setArtSet(arr);
      p.artSet = arr;
    } else if (currentAdminTab === "LOGO") {
      const deletedLogoSrc = `assets/logos/${logoSet[index]}`;
      const arr = [...logoSet];
      arr.splice(index, 1);
      setLogoSet(arr);
      p.logoSet = arr;
      if (systemLogo === deletedLogoSrc) {
        setSystemLogo(DEFAULT_SYSTEM_LOGO);
        p.systemLogo = DEFAULT_SYSTEM_LOGO;
      }
    } else if (currentAdminTab === "MOTION") {
      const arr = [...motSet];
      arr.splice(index, 1);
      setMotSet(arr);
      p.motSet = arr;
    } else if (currentAdminTab === "CHAR") {
      const arr = [...units];
      arr.splice(index, 1);
      setUnits(arr);
      p.units = arr;
    }
    saveAdminData(p);
    setAdminPreviewSrc("");
  };

  const updateSelectedCharMetadata = () => {
    if (adminSelectedCharIndex < 0) {
      setUploadMsg("CLICK A CHARACTER TO EDIT ITS METADATA FIRST.");
      return;
    }
    const arr = [...units];
    arr[adminSelectedCharIndex] = {
      ...arr[adminSelectedCharIndex],
      name: fmName,
      faction: fmFact,
      role: fmRole,
      desc: fmDesc,
      descJp: fmDescJp,
    };
    setUnits(arr);
    saveAdminData({ units: arr, artSet, motSet });
    setUploadMsg("METADATA UPDATED!");
  };

  const clearCharForm = () => {
    setAdminSelectedCharIndex(-1);
    setFmName("");
    setFmFact("");
    setFmRole("");
    setFmDesc("");
    setFmDescJp("");
    setAdminPreviewSrc("");
  };

  const [adminPreviewSrc, setAdminPreviewSrc] = useState("");

  const renderAdminScreen = () => {
    let thumbsData: any[] = [];
    if (currentAdminTab === "ART")
      thumbsData = artSet.map((d, i) => ({
        f: d,
        src: `assets/new_image/${d}`,
        i,
      }));
    else if (currentAdminTab === "LOGO")
      thumbsData = logoSet.map((d, i) => ({
        f: d,
        src: `assets/logos/${d}`,
        i,
      }));
    else if (currentAdminTab === "MOTION")
      thumbsData = motSet.map((d, i) => ({
        f: d,
        src: `assets/motion/${d}`,
        i,
      }));
    else if (currentAdminTab === "CHAR")
      thumbsData = units.map((d, i) => ({ f: d.name, src: d.file, i }));
    else if (currentAdminTab === "HOME_MEDIA") {
      thumbsData = [
        ...artSet.map((d) => ({ f: d, src: `assets/new_image/${d}` })),
        ...motSet.map((d) => ({ f: d, src: `assets/motion/${d}` })),
        ...units.map((d) => ({ f: d.name, src: d.file })),
      ];
    }

    return (
      <section
        id="admin-screen"
        className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center overflow-hidden"
      >
        <div className="w-[calc(100%-20px)] md:w-[calc(100%-40px)] h-[calc(100%-20px)] md:h-[calc(100%-40px)] max-w-[1600px] flex flex-col min-w-0 bg-[#0c0c0c] border border-[#2e2e2e] shadow-[0_0_50px_rgba(0,0,0,0.9)] p-[20px] md:p-[30px]">
          <header className="flex flex-wrap justify-between items-center border-b border-[#282828] shrink-0 gap-4 pb-4">
          <div className="flex flex-wrap items-center gap-[20px] lg:gap-[30px] h-full min-w-0">
            <div style={{ paddingLeft: '10px' }} className="text-[#eee] font-['Orbitron'] text-[20px] md:text-[22px] tracking-widest font-bold shrink-0">
              ADMIN DASHBOARD
            </div>
            <div className="flex flex-wrap gap-[10px] lg:gap-[30px] h-full lg:ml-[20px]">
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors ${currentAdminTab === "ART" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("ART");
                  clearCharForm();
                }}
              >
                <span>CG ARTWORKS</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors ${currentAdminTab === "MOTION" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("MOTION");
                  clearCharForm();
                }}
              >
                <span>MOVIE DATA</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors ${currentAdminTab === "CHAR" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("CHAR");
                  clearCharForm();
                }}
              >
                <span>CAST ROSTER</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors ${currentAdminTab === "LOGO" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("LOGO");
                  clearCharForm();
                }}
              >
                <span>SYSTEM LOGO</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors ${currentAdminTab === "OVERVIEW" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("OVERVIEW");
                  clearCharForm();
                }}
              >
                <span>OVERVIEW TEXT</span>
              </button>
            </div>
          </div>
          <div style={{ paddingRight: '10px' }} className="flex flex-wrap gap-[12px] items-center">
            <span className="text-[#aaa] text-[11px] font-mono font-bold">
              {saveStatusMsg}
            </span>
            <button
              style={{ paddingLeft: '14px', paddingRight: '14px' }}
              className="mech-btn !w-auto !h-[34px] !mb-0 !text-[#eee] border-[#666] bg-[#222] hover:bg-[#333] hover:border-[#888] font-bold text-[12px]"
              onClick={() => saveAdminData()}
            >
              <span>SAVE JSON DATA</span>
            </button>
            <button
              style={{ paddingLeft: '14px', paddingRight: '14px' }}
              className="mech-btn !w-auto !h-[34px] !mb-0 text-[#888] border-[#333] bg-[#141414] hover:bg-[#202020] hover:text-[#ccc] font-bold text-[12px]"
              onClick={() => {
                clearCharForm();
                setCurrentScreen("dash");
              }}
            >
              <span>EXIT ADMIN</span>
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="mech-btn !w-[34px] !h-[34px] !mb-0 bg-[#141414] hover:bg-[#202020] border-[#333] hover:border-[#666] text-[#888] hover:text-[#fff] flex items-center justify-center transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 mt-[20px]">
          {currentAdminTab === "OVERVIEW" ? (
            <div className="flex-1 flex gap-[20px] p-[10px] pr-[20px] h-full">
              <div className="flex-1 flex flex-col gap-[10px]">
                <div className="flex justify-between items-center mb-[5px]">
                  <div className="text-[#ccc] font-['Orbitron'] text-[14px]">
                    WORLDVIEW ( JP / 日本語 )
                  </div>
                  <div className="flex gap-[10px]">
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[8px] py-[4px] text-[12px] outline-none"
                      value={adminStoryStyle.fontFamilyJp}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, fontFamilyJp: e.target.value}))}
                    >
                      <option value="sans-serif">Sans-serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[8px] py-[4px] text-[12px] outline-none"
                      value={adminStoryStyle.fontSizeJp}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, fontSizeJp: e.target.value}))}
                    >
                      <option value="12px">12px</option>
                      <option value="13px">13px</option>
                      <option value="14px">14px</option>
                      <option value="15px">15px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>
                </div>
                <div className="text-[#777] text-[11px] mb-[10px]">
                  * Separate paragraphs with a double line break (Empty line).
                </div>
                <textarea
                  className="flex-1 bg-[#0a0a0a] text-[#ccc] border border-[#333] p-[20px] outline-none focus:border-[#666] leading-[2.2] resize-none"
                  style={{ fontSize: adminStoryStyle.fontSizeJp, fontFamily: adminStoryStyle.fontFamilyJp }}
                  value={adminStoryJp}
                  onChange={(e) => setAdminStoryJp(e.target.value)}
                ></textarea>
              </div>
              <div className="flex-1 flex flex-col gap-[10px]">
                <div className="flex justify-between items-center mb-[5px]">
                  <div className="text-[#ccc] font-['Orbitron'] text-[14px]">
                    WORLDVIEW ( EN / English )
                  </div>
                  <div className="flex gap-[8px]">
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.isItalicEn ? "italic" : "normal"}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, isItalicEn: e.target.value === "italic"}))}
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.fontFamilyEn}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, fontFamilyEn: e.target.value}))}
                    >
                      <option value="sans-serif">Sans-serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.fontSizeEn}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, fontSizeEn: e.target.value}))}
                    >
                      <option value="11px">11px</option>
                      <option value="12px">12px</option>
                      <option value="13px">13px</option>
                      <option value="14px">14px</option>
                      <option value="15px">15px</option>
                      <option value="16px">16px</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.marginTop || "30px"}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, marginTop: e.target.value}))}
                    >
                      <option value="0px">Top Space: 0px</option>
                      <option value="20px">Top Space: 20px</option>
                      <option value="40px">Top Space: 40px</option>
                      <option value="60px">Top Space: 60px</option>
                      <option value="80px">Top Space: 80px</option>
                      <option value="100px">Top Space: 100px</option>
                      <option value="120px">Top Space: 120px</option>
                    </select>
                  </div>
                </div>
                <div className="text-[#777] text-[11px] mb-[10px]">
                  * Separate paragraphs with a double line break (Empty line).
                </div>
                <textarea
                  className={`flex-1 bg-[#0a0a0a] text-[#aaa] border border-[#333] p-[15px] outline-none focus:border-[#666] leading-[2] resize-none ${adminStoryStyle.isItalicEn ? "italic" : ""}`}
                  style={{ fontSize: adminStoryStyle.fontSizeEn, fontFamily: adminStoryStyle.fontFamilyEn }}
                  value={adminStoryEn}
                  onChange={(e) => setAdminStoryEn(e.target.value)}
                ></textarea>
              </div>
              <div className="w-[350px] flex flex-col gap-[10px]">
                <div className="flex flex-col gap-[10px] mb-[5px]">
                  <div className="text-[#ccc] font-['Orbitron'] text-[14px]">
                    ABOUT TEXT
                  </div>
                  <div className="flex flex-col gap-[5px]">
                    <div className="flex items-center gap-[8px]">
                      <input 
                        type="text"
                        className="flex-1 bg-[#111] text-[#ccc] border border-[#333] px-[8px] py-[6px] text-[12px] outline-none min-w-0"
                        value={adminAboutTitle}
                        onChange={(e) => setAdminAboutTitle(e.target.value)}
                        placeholder="Title (e.g. ABOUT GRAPHIC SPACE)"
                      />
                      <select
                        className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[6px] text-[11px] outline-none shrink-0"
                        value={adminStoryStyle.letterSpacingAboutTitle || "0.05em"}
                        onChange={(e) => setAdminStoryStyle(prev => ({...prev, letterSpacingAboutTitle: e.target.value}))}
                      >
                        <option value="0em">Track (Title): 0</option>
                        <option value="0.05em">Track (Title): 0.05</option>
                        <option value="0.1em">Track (Title): 0.1</option>
                        <option value="0.2em">Track (Title): 0.2</option>
                        <option value="0.3em">Track (Title): 0.3</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-[8px] mt-[5px]">
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.fontSizeAbout || "12px"}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, fontSizeAbout: e.target.value}))}
                    >
                      <option value="10px">Size: 10px</option>
                      <option value="11px">Size: 11px</option>
                      <option value="12px">Size: 12px</option>
                      <option value="13px">Size: 13px</option>
                      <option value="14px">Size: 14px</option>
                      <option value="16px">Size: 16px</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.letterSpacingAbout || "0.1em"}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, letterSpacingAbout: e.target.value}))}
                    >
                      <option value="0em">Track: 0</option>
                      <option value="0.05em">Track: 0.05</option>
                      <option value="0.1em">Track: 0.1</option>
                      <option value="0.2em">Track: 0.2</option>
                      <option value="0.3em">Track: 0.3</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.lineHeightAbout || "2.5"}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, lineHeightAbout: e.target.value}))}
                    >
                      <option value="1.5">Line: 1.5</option>
                      <option value="2">Line: 2</option>
                      <option value="2.5">Line: 2.5</option>
                      <option value="3">Line: 3</option>
                    </select>
                    <select
                      className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none"
                      value={adminStoryStyle.marginBottomAbout || "200px"}
                      onChange={(e) => setAdminStoryStyle(prev => ({...prev, marginBottomAbout: e.target.value}))}
                    >
                      <option value="50px">Bot Space: 50px</option>
                      <option value="100px">Bot Space: 100px</option>
                      <option value="150px">Bot Space: 150px</option>
                      <option value="200px">Bot Space: 200px</option>
                      <option value="250px">Bot Space: 250px</option>
                      <option value="300px">Bot Space: 300px</option>
                    </select>
                  </div>
                </div>
                <div className="text-[#777] text-[11px] mb-[10px]">
                  * Text displayed at the bottom of the overview.
                </div>
                <textarea
                  className="flex-1 bg-[#0a0a0a] text-[#aaa] border border-[#333] p-[15px] outline-none focus:border-[#666] leading-[2] resize-none font-mono text-[11px]"
                  value={adminAboutText}
                  onChange={(e) => setAdminAboutText(e.target.value)}
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="flex gap-[20px] w-full h-full min-h-0 pb-4">
              {/* LEFT SIDEBAR: UPLOAD/FORM */}
              <div className="w-[300px] border-r border-[#2a2a2a] flex flex-col gap-[20px] pr-[20px] overflow-y-auto shrink-0">
                <div className="flex flex-col gap-[8px]">
                  <div style={{ paddingLeft: '10px' }} className="text-[#888] font-['Orbitron'] font-bold text-[10px] tracking-wide uppercase">Target Category</div>
                  <div style={{ marginLeft: '0px', paddingLeft: '10px' }} className="bg-[#151515] text-[#ccc] border border-[#2e2e2e] p-[10px] text-[13px] font-bold font-mono tracking-widest select-none">
                    {currentAdminTab === "ART" && "CG ARTWORKS"}
                    {currentAdminTab === "MOTION" && "MOVIE DATA"}
                    {currentAdminTab === "CHAR" && "CAST ROSTER"}
                    {currentAdminTab === "LOGO" && "SYSTEM LOGO"}
                  </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <div style={{ paddingLeft: '10px' }} className="text-[#888] font-['Orbitron'] font-bold text-[10px] tracking-wide uppercase">Custom filename (optional)</div>
                  <input
                    type="text"
                    placeholder="Enter title..."
                    className="bg-[#151515] text-[#fff] border border-[#2e2e2e] p-[10px] text-[13px] outline-none focus:border-[#666] placeholder-[#555] font-mono"
                    value={customUploadName}
                    onChange={(e) => setCustomUploadName(e.target.value)}
                  />
                </div>

                <div
                  style={{ paddingLeft: '0px', marginLeft: '10px', marginRight: '10px' }}
                  className="h-[220px] shrink-0 border border-dashed border-[#3a3a3a] bg-[#111] flex flex-col items-center justify-center text-center text-[#777] cursor-pointer p-[20px] box-border hover:border-[#666] transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length)
                      handleUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-[30px] h-[30px] mb-[15px] fill-current text-[#777]" viewBox="0 0 24 24">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                  <div className="font-['Orbitron'] text-[18px] mb-[10px] text-[#ccc] font-bold tracking-widest">
                    DRAG & DROP
                  </div>
                  <div className="text-[12px] font-bold tracking-wider text-[#999] mb-[15px]">Click or drop media here</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#666] leading-relaxed">
                    Note: Large files may exceed<br/>
                    browser storage. Use url inputs<br/>
                    if local space is limited.
                  </div>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) handleUpload(e.target.files);
                    }}
                  />
                </div>

                <div className="text-[12px] text-[#aaa] font-bold pl-[15px] font-mono">
                  {uploadMsg}
                </div>

                {currentAdminTab === "LOGO" && (
                  <div className="flex flex-col gap-[10px] text-[11px] bg-[#141414] border border-[#2e2e2e] p-[15px] shrink-0">
                    <div className="text-[#ccc] font-['Orbitron'] text-[12px] tracking-wider font-bold">
                      ACTIVE LOGO
                    </div>
                    <div className="w-full h-[70px] bg-[#000] border border-[#2a2a2a] flex items-center justify-center p-2">
                      <img
                        src={systemLogo || DEFAULT_SYSTEM_LOGO}
                        alt="Current Logo"
                        className="max-h-full max-w-full object-contain"
                        onError={(e: any) => {
                          e.currentTarget.src = DEFAULT_SYSTEM_LOGO;
                        }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-[#888] truncate" title={systemLogo}>
                      SRC: {systemLogo || DEFAULT_SYSTEM_LOGO}
                    </div>
                    <button
                      className="mech-btn !h-[32px] border-[#555] hover:border-[#888] !text-[#eee] bg-[#1c1c1c] hover:bg-[#282828]"
                      onClick={() => {
                        setSystemLogo(DEFAULT_SYSTEM_LOGO);
                        saveAdminData({ systemLogo: DEFAULT_SYSTEM_LOGO });
                        setUploadMsg("LOGO RESET TO DEFAULT.");
                      }}
                    >
                      <span className="text-[10px]">RESET TO DEFAULT</span>
                    </button>
                  </div>
                )}

                {currentAdminTab === "CHAR" && (
                  <div className="flex flex-col gap-[8px] text-[11px] bg-[#141414] border border-[#2e2e2e] p-[15px] shrink-0">
                    <div className="text-[#ccc] font-['Orbitron'] text-[12px] mb-[4px]">
                      UNIT METADATA
                    </div>
                    <input
                      type="text"
                      placeholder="Name"
                      className="bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[#555]"
                      value={fmName}
                      onChange={(e) => setFmName(e.target.value)}
                    />
                    <div className="flex gap-[8px]">
                      <input
                        type="text"
                        placeholder="Faction"
                        className="flex-1 bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[#555]"
                        value={fmFact}
                        onChange={(e) => setFmFact(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        className="flex-1 bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[#555]"
                        value={fmRole}
                        onChange={(e) => setFmRole(e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Desc EN"
                      rows={2}
                      className="bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[#555]"
                      value={fmDesc}
                      onChange={(e) => setFmDesc(e.target.value)}
                    ></textarea>
                    <textarea
                      placeholder="Desc JP"
                      rows={2}
                      className="bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[#555]"
                      value={fmDescJp}
                      onChange={(e) => setFmDescJp(e.target.value)}
                    ></textarea>
                    <div className="flex gap-[10px] mt-[5px]">
                      <button className="mech-btn flex-1 !h-[30px]" onClick={clearCharForm}>
                        <span className="text-[10px]">CLEAR</span>
                      </button>
                      <button
                        className="mech-btn flex-1 !h-[30px] border-[#666] !text-[#eee] bg-[#222] hover:bg-[#333]"
                        onClick={updateSelectedCharMetadata}
                      >
                        <span className="text-[10px]">UPDATE</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  {/* Category textareas based on tab... */}
                  <div className="flex-col gap-[8px] text-[11px] bg-[#151515] border border-[#333] p-[15px] shrink-0 flex hidden">
                    <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[12px] mb-[4px]">
                      CATEGORIES
                    </div>
                    {currentAdminTab === "CHAR" && (
                      <textarea
                        rows={2}
                        className="bg-[#0a0a0a] text-[#ccc] border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                        value={adminCharCategories}
                        onChange={(e) => setAdminCharCategories(e.target.value)}
                      ></textarea>
                    )}
                    {currentAdminTab === "ART" && (
                      <textarea
                        rows={2}
                        className="bg-[#0a0a0a] text-[#ccc] border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                        value={adminArtCategories}
                        onChange={(e) => setAdminArtCategories(e.target.value)}
                      ></textarea>
                    )}
                    {currentAdminTab === "MOTION" && (
                      <textarea
                        rows={2}
                        className="bg-[#0a0a0a] text-[#ccc] border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                        value={adminMotCategories}
                        onChange={(e) => setAdminMotCategories(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT MAIN PANEL */}
              <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* GALLERY TOP AREA */}
                <div className="h-[200px] shrink-0 overflow-y-auto content-start flex flex-wrap gap-[15px] p-[10px]">
                  {thumbsData.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-[120px] bg-[#1a1a1a] border border-[#333] hover:border-[#666] relative cursor-pointer group transition-colors flex flex-col"
                      onClick={() => {
                        setAdminPreviewSrc(item.src);
                        if (currentAdminTab === "CHAR") {
                          setAdminSelectedCharIndex(idx);
                          setFmName(units[idx].name || "");
                          setFmFact(units[idx].faction || "");
                          setFmRole(units[idx].role || "");
                          setFmDesc(units[idx].desc || "");
                          setFmDescJp(units[idx].descJp || "");
                        } else if (currentAdminTab === "LOGO") {
                          // if they click a logo in the logos tab, we can make it the system logo?
                        }
                      }}
                    >
                      <div className="w-full h-[90px] bg-[#000] relative">
                        {item.src.endsWith(".mp4") || item.src.endsWith(".webm") ? (
                          <video
                            src={item.src}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                          />
                        ) : (
                          <img
                            src={item.src}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                            onError={(e: any) => {
                              e.target.style.opacity = 0;
                            }}
                          />
                        )}
                        <div className="absolute top-[-8px] right-[-8px] flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            className="text-[10px] font-bold bg-[#b00] hover:bg-[#f00] text-white border border-[#400] rounded-full cursor-pointer w-[24px] h-[24px] flex items-center justify-center shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAdminItem(idx);
                            }}
                            title="Delete"
                          >
                            X
                          </button>
                        </div>
                      </div>
                      <div className="bg-[#1a1a1a] text-[#aaa] text-[9px] p-[6px] font-bold tracking-widest text-center uppercase border-t border-[#333] truncate">
                        {item.f}
                      </div>

                      {currentAdminTab === "LOGO" && (
                         <div className="p-[5px] border-t border-[#333]">
                           <button 
                             className={`w-full text-[9px] border py-[4px] font-bold uppercase transition-colors ${
                               systemLogo === item.src
                                 ? "bg-[#252525] text-white border-[#888]"
                                 : "bg-[#181818] hover:bg-[#252525] text-[#ccc] hover:text-white border-[#444] hover:border-[#777]"
                             }`}
                             onClick={(e) => {
                               e.stopPropagation();
                               setSystemLogo(item.src);
                               saveAdminData({ systemLogo: item.src });
                               setUploadMsg("SYSTEM LOGO UPDATED & SAVED.");
                             }}
                           >
                             {systemLogo === item.src ? "CURRENT LOGO" : "SET AS LOGO"}
                           </button>
                         </div>
                      )}
                    </div>
                  ))}
                  
                  {thumbsData.length === 0 && (
                     <div className="w-full h-full flex items-center justify-center text-[#555] font-['Orbitron'] tracking-widest">
                       NO MEDIA FOUND
                     </div>
                  )}
                </div>

                {/* BOTTOM PREVIEW AREA */}
                <div className="flex-1 min-h-0 border-t border-[#333] flex flex-row mt-[20px] bg-[#080808]">
                  <div className="w-[200px] border-r border-[#333] p-[15px] shrink-0 font-['Orbitron'] text-[12px] tracking-widest text-[#ccc] font-bold">
                    SELECTED MEDIA<br/>PREVIEW
                  </div>
                  <div className="flex-1 relative flex items-center justify-center p-[10px] overflow-hidden">
                    {!adminPreviewSrc && (
                      <span className="text-[#333] font-['Orbitron'] text-[14px] tracking-widest font-bold">SELECT MEDIA TO PREVIEW</span>
                    )}
                    {adminPreviewSrc &&
                      (adminPreviewSrc.endsWith(".mp4") ||
                      adminPreviewSrc.endsWith(".webm") ? (
                        <video
                          src={adminPreviewSrc}
                          controls
                          autoPlay
                          className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        />
                      ) : (
                        <div className="w-full h-full p-[20px] flex items-center justify-center">
                          <img
                            src={adminPreviewSrc}
                            className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </section>
    );
  };

  const bootIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const runBoot = () => {
    if (bootIntervalRef.current) clearInterval(bootIntervalRef.current);
    setCurrentScreen("boot");
    setBootProgress(0);
    setBootLogs([]);
    const logs = [
      { p: 1, text: "MOUNTING_LOCAL_DRIVES.........COMPLETE" },
      { p: 25, text: "SYNC_DATABANK_PROTOCOL........COMPLETE" },
      { p: 50, text: "VERIFYING_UNIT_ARCHIVES.......COMPLETE" },
      { p: 75, text: "ALL_SYSTEMS_GO................100%" },
    ];
    let cur = 0;
    let logIdx = 0;
    bootIntervalRef.current = setInterval(() => {
      cur += 1;
      if (cur <= 100) {
        setBootProgress(cur);
        if (logIdx < logs.length && cur >= logs[logIdx].p) {
          const text = logs[logIdx].text;
          setBootLogs((prev) => [...prev, text]);
          logIdx++;
        }
      } else {
        if (bootIntervalRef.current) clearInterval(bootIntervalRef.current);
        setCurrentNav("HOME");
        setTimeout(() => setCurrentScreen("dash"), 800);
      }
    }, 35);
  };

  return (
    <div className="w-full h-full text-[#e0fcfb] font-['Share_Tech_Mono','Orbitron',monospace]">
      <div className="starfield"></div>

      {currentScreen === "splash" && (
        <section
          id="splash-screen"
          className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000"
        >
          <div
            className="text-center cursor-pointer flex flex-col items-center"
            onClick={() => setCurrentScreen("story")}
          >
            <h1 className="brand-primary text-[26px] mb-5">
              SPACE-ROBOTMAN WORLD
            </h1>
            <div className="brand-secondary tracking-[0.8em] mb-[80px]">
              SECURE_BOOT_PROTOCOL_GS_V3
            </div>
            <div className="flex justify-center w-full">
              <button className="mech-btn w-[200px]">
                <span>BOOT SYSTEM</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {currentScreen === "story" && (
        <section
          id="story-screen"
          className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000"
        >
          <div className="lang-toggle absolute top-10 right-10 flex gap-[10px]">
            <button
              className={`mech-btn small ${currentLang === "JP" ? "active" : ""}`}
              onClick={() => setCurrentLang("JP")}
            >
              <span>JP</span>
            </button>
            <button
              className={`mech-btn small ${currentLang === "EN" ? "active" : ""}`}
              onClick={() => setCurrentLang("EN")}
            >
              <span>EN</span>
            </button>
          </div>
          <div id="story-stage" className="w-[750px] text-center mb-[50px]">
            {(currentLang === "JP" ? storyJp : storyEn).map((line, i) => (
              <div
                key={i}
                className={`story-text-line ${i <= storyLineIndex ? "visible text-[#eee]" : "opacity-0 translate-y-5"}`}
              >
                {line}
              </div>
            ))}
          </div>
          <div
            className={`flex justify-center w-full transition-opacity duration-1000 mt-[40px] ${storyLineIndex >= (currentLang === "JP" ? storyJp.length : storyEn.length) - 1 ? "opacity-100" : "opacity-50"}`}
          >
            <button className="mech-btn !w-[280px] pointer-events-auto h-[40px]" onClick={runBoot}>
              <span className="text-[14px]">
                {storyLineIndex >=
                (currentLang === "JP" ? storyJp.length : storyEn.length) - 1
                  ? "INITIALIZE INTERFACE"
                  : "SKIP PROLOGUE"}
              </span>
            </button>
          </div>
        </section>
      )}

      {currentScreen === "boot" && (
        <section
          id="boot-screen"
          className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000 bg-[#050505]"
        >
          <div className="w-full max-w-4xl px-[50px] flex flex-col items-center mt-[-40px]">
            {/* Loading Ring */}
            <div className="w-[180px] h-[180px] flex justify-center items-center mb-[100px] relative">
              <svg style={{ paddingLeft: '0px', paddingBottom: '22px' }} width="180" height="180" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="#111"
                  strokeWidth="8"
                ></circle>
                <circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="var(--emerald-primary)"
                  strokeWidth="8"
                  strokeDasharray="502.65"
                  strokeDashoffset={502.65 - 502.65 * (bootProgress / 100)}
                  className="transition-all duration-75 origin-center -rotate-90 stroke-round drop-shadow-[0_0_10px_var(--emerald-primary)]"
                ></circle>
                <text
                  x="90"
                  y="98"
                  fill="var(--emerald-primary)"
                  fontSize="24"
                  fontFamily="'Orbitron', sans-serif"
                  textAnchor="middle"
                  fontWeight="bold"
                  letterSpacing="2px"
                  style={{ textShadow: "0 0 10px var(--emerald-primary)" }}
                >
                  {bootProgress}%
                </text>
              </svg>
            </div>
            
            {/* Terminal Output */}
            <div className="flex flex-col w-full max-w-2xl px-[30px] mt-[120px]">
              <div className="font-['Orbitron'] text-[18px] text-[var(--emerald-primary)] mb-[40px] font-bold tracking-[8px] text-center" style={{ marginTop: '16px', textShadow: "0 0 8px var(--emerald-primary)" }}>
                SYSTEM BOOT PROTOCOL
              </div>
              <div style={{ paddingTop: '0px', marginTop: '22px' }} className="w-full flex justify-center">
                <div className="text-[13px] text-[var(--emerald-primary)] leading-[3] tracking-[2px] font-mono whitespace-pre-wrap h-[180px] px-[30px] w-max text-left">
                  {bootLogs.map((l, i) => (
                    <div key={i}><TypewriterLine text={l} /></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentScreen === "dash" && (
        <section
          id="dash-screen"
          className="fixed inset-0 flex flex-col items-center justify-center transition-all duration-1000"
        >
          <div
            className="chassis-container plate opacity-100 translate-y-0"
            id="ui-core"
          >
            <div className="absolute top-[12px] left-[12px] w-[6px] h-[6px] rounded-full bg-[#111] border border-[#333] shadow-[inset_1px_1px_0_#555]"></div>
            <div className="absolute top-[12px] right-[12px] w-[6px] h-[6px] rounded-full bg-[#111] border border-[#333] shadow-[inset_1px_1px_0_#555]"></div>
            <div className="absolute bottom-[12px] left-[12px] w-[6px] h-[6px] rounded-full bg-[#111] border border-[#333] shadow-[inset_1px_1px_0_#555]"></div>
            <div className="absolute bottom-[12px] right-[12px] w-[6px] h-[6px] rounded-full bg-[#111] border border-[#333] shadow-[inset_1px_1px_0_#555]"></div>

            <header className="chassis-header flex items-center justify-between px-5 bg-[#121212] border-b border-[#282828] relative">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="header-title">SPACE ROBOTMAN WORLD</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#282828] text-[9px] font-mono text-[#666]">
                  <span>SYSTEM // ONLINE</span>
                </div>
              </div>

              <div className="header-status-line flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-[#555]">
                  <span>NODE: 01</span>
                  <span>//</span>
                  <span>SYS-VER: 3.2</span>
                </div>
                <span className="header-sub bg-[#1a1a1a] px-2.5 py-1 border border-[#2a2a2a] text-[#888]">
                  SYSTEM ARCHIVE
                </span>
                {deferredPrompt && !isAppInstalled && (
                  <button
                    onClick={handleInstallPWA}
                    title="Install SPACE ROBOTMAN WORLD ARCHIVES PWA"
                    className="mech-btn !w-auto !h-[28px] !mb-0 px-3 flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-bold !bg-[var(--emerald-primary)] !text-black !border-[var(--emerald-primary)] hover:!bg-white hover:!border-white cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.3)] animate-pulse"
                  >
                    <Zap size={12} className="fill-current" />
                    <span>INSTALL APP</span>
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  className="w-7 h-7 bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] hover:border-[#666] text-[#888] hover:text-[#fff] flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
            </header>

            <aside className="chassis-side bg-[#161616] border-r border-[#262626]">
              <div className="structural-panel"></div>
              <div className="button-area">
                <div className="flex flex-col mt-[-5px]">
                  <div className="mb-4 flex justify-center px-4 relative">
                    <img
                      src={systemLogo || DEFAULT_SYSTEM_LOGO}
                      alt="S Logo"
                      className="w-[120px] object-contain opacity-85 hover:opacity-100 transition-opacity"
                      onError={(e: any) => {
                        if (e.currentTarget.src !== DEFAULT_SYSTEM_LOGO) {
                          e.currentTarget.src = DEFAULT_SYSTEM_LOGO;
                        }
                      }}
                    />
                  </div>
                  <div className="nav-group flex-none flex flex-col gap-1">
                    <button
                      className={`mech-nav-btn ${currentNav === "HOME" ? "active border-l-2 !border-l-[#fff]" : ""}`}
                      onClick={() => setCurrentNav("HOME")}
                    >
                      <span className="nav-idx">01 //</span>
                      <span className="nav-label">HOME / STATUS</span>
                    </button>
                    <button
                      className={`mech-nav-btn ${currentNav === "ART" ? "active border-l-2 !border-l-[#fff]" : ""}`}
                      onClick={() => setCurrentNav("ART")}
                    >
                      <span className="nav-idx">02 //</span>
                      <span className="nav-label">CG-ARTWORKS</span>
                    </button>
                    <button
                      className={`mech-nav-btn ${currentNav === "CHAR" ? "active border-l-2 !border-l-[#fff]" : ""}`}
                      onClick={() => setCurrentNav("CHAR")}
                    >
                      <span className="nav-idx">03 //</span>
                      <span className="nav-label">UNIT-ARCHIVES</span>
                    </button>
                    <button
                      className={`mech-nav-btn ${currentNav === "MOTION" ? "active border-l-2 !border-l-[#fff]" : ""}`}
                      onClick={() => setCurrentNav("MOTION")}
                    >
                      <span className="nav-idx">04 //</span>
                      <span className="nav-label">MOTION-DATA</span>
                    </button>
                    <button
                      className={`mech-nav-btn ${currentNav === "OVER" ? "active border-l-2 !border-l-[#fff]" : ""}`}
                      onClick={() => setCurrentNav("OVER")}
                    >
                      <span className="nav-idx">05 //</span>
                      <span className="nav-label">OVERVIEW</span>
                    </button>
                  </div>
                </div>

                <div className="nav-group flex-none">
                  <button
                    className="mech-btn w-full mb-[4px] hover:border-[#555]"
                    onClick={() => setCurrentScreen("admin")}
                  >
                    <span>ADMIN LOGIN</span>
                  </button>
                  <button
                    className="mech-btn w-full hover:border-[#555]"
                    onClick={() => setCurrentScreen("splash")}
                  >
                    <span>OPENING TOP</span>
                  </button>
                  <div className="flex flex-col mt-[12px] px-2 bg-[#101010] p-2 border border-[#242424]">
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#666] mb-1">
                      <span>CHRONO TELEMETRY</span>
                      <span className="w-1.5 h-1.5 bg-[#555]"></span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span 
                        className="text-[9px] text-[#777] font-mono tracking-widest cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                        onClick={() => setClockMode(prev => prev === "REAL" ? "LIMIT" : "REAL")}
                      >
                        {clockMode === "REAL" ? "REAL TIME" : "TIME LIMIT"}
                      </span>
                      <div className="text-[14px] text-[#ccc] font-mono tracking-widest font-bold text-right shrink-0 min-w-[110px]">
                        <span id="dash-clk">{clockMode === "REAL" ? clock : countdownText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main className="content-main flex flex-col bg-[#111]">
              <nav
                className="sub-nav-row flex-none bg-[#111] border-b border-[#333] flex items-center gap-[10px] px-[20px]"
                id="sub-nav-bar"
              >
                {renderSubNav()}
              </nav>
              <div className="flex-1 relative flex flex-col min-h-0 bg-[#222]">
                <div
                  id="view-well"
                  className="w-full h-full relative flex flex-col"
                >
                  {renderDashContent()}
                </div>
              </div>
            </main>

            <footer className="chassis-footer">
              <div className="text-[#555] text-[8px] font-mono">
                (C) 2003-2026 GRAPHIC-SPACE // SECURE_ENCRYPT: 256_AES //
                NODE_VERIFIED
              </div>
            </footer>
          </div>
        </section>
      )}

      {currentScreen === "admin" && renderAdminScreen()}
    </div>
  );
}
