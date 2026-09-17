/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { usePWAInstall } from "./usePWAInstall";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { OfflineIndicator } from "./components/OfflineIndicator";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Monitor, Search, Shield, Zap, Cpu, Activity, Sparkles, ExternalLink, Maximize2, Minimize2, Download, Upload, FileJson, Check, AlertCircle, RefreshCw, Copy, Database, Lock, Key, Delete } from "lucide-react";
import { loadInitialData, saveToLocalData, defaultAppData } from "./defaultData";
import { loadAppDataFromIndexedDB, readFileAsDataURL } from "./idbStorage";

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
  overviewMaxWidth: "896px",
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

export const resolveArtSrc = (d: string) => {
  if (!d) return "";
  if (d.startsWith("data:") || d.startsWith("blob:") || d.startsWith("http://") || d.startsWith("https://") || d.startsWith("assets/") || d.startsWith("/")) {
    return d;
  }
  return `assets/new_image/${d}`;
};

export const resolveMotSrc = (d: string) => {
  if (!d) return "";
  if (d.startsWith("data:") || d.startsWith("blob:") || d.startsWith("http://") || d.startsWith("https://") || d.startsWith("assets/") || d.startsWith("/")) {
    return d;
  }
  return `assets/motion/${d}`;
};

export const resolveLogoSrc = (d: string) => {
  if (!d) return "";
  if (d.startsWith("data:") || d.startsWith("blob:") || d.startsWith("http://") || d.startsWith("https://") || d.startsWith("assets/") || d.startsWith("/")) {
    return d;
  }
  return `assets/logos/${d}`;
};

const initialCachedData = loadInitialData();

const mergeUnitScales = (loadedUnits: any[]): any[] => {
  if (typeof window === "undefined" || !Array.isArray(loadedUnits)) return loadedUnits;
  try {
    const savedMap = localStorage.getItem("space_robotman_unit_scales");
    if (!savedMap) return loadedUnits;
    const parsed = JSON.parse(savedMap);
    if (!parsed || typeof parsed !== "object") return loadedUnits;
    return loadedUnits.map((u) => {
      const key = u.name || u.file;
      if (parsed[key] !== undefined) {
        const item = parsed[key];
        const scale = typeof item === "object" ? item.scale : item;
        const offsetY = typeof item === "object" ? item.offsetY : undefined;
        return {
          ...u,
          imageScale: u.imageScale !== undefined ? u.imageScale : scale,
          imageOffsetY: u.imageOffsetY !== undefined ? u.imageOffsetY : offsetY,
        };
      }
      return u;
    });
  } catch (e) {
    return loadedUnits;
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");

  // Synchronize browser/PWA header color (meta theme-color) dynamically per screen
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    // #000000 for intro/boot/admin, #121212 for main dashboard
    const targetColor = (currentScreen === "dash") ? "#121212" : "#000000";
    meta.setAttribute('content', targetColor);
  }, [currentScreen]);
 // splash, story, boot, dash, admin
  const [currentLang, setCurrentLang] = useState("JP");
  const [currentNav, setCurrentNav] = useState("HOME");
  const [currentAdminTab, setCurrentAdminTab] = useState("ART");

  const [storyJp, setStoryJp] = useState<string[]>(() => initialCachedData.storyJp || defaultStoryJp);
  const [storyEn, setStoryEn] = useState<string[]>(() => initialCachedData.storyEn || defaultStoryEn);
  const [storyStyle, setStoryStyle] = useState(() => ({ ...defaultStoryStyle, ...initialCachedData.storyStyle }));
  const [aboutLines, setAboutLines] = useState<string[]>(() => initialCachedData.aboutLines || defaultAboutLines);
  const [aboutTitle, setAboutTitle] = useState<string>(() => initialCachedData.aboutTitle || defaultAboutTitle);
  const [splashMedia, setSplashMedia] = useState<string>(() => initialCachedData.splashMedia || defaultAppData.splashMedia);
  const [splashMode, setSplashMode] = useState<string>(() => initialCachedData.splashMode || "SEQUENCE");
  const [splashOpacity, setSplashOpacity] = useState<number>(() => initialCachedData.splashOpacity !== undefined ? initialCachedData.splashOpacity : 30);
  const [playlistExcludes, setPlaylistExcludes] = useState<string[]>(() => initialCachedData.playlistExcludes || []);
  
  const [charCategories, setCharCategories] = useState<string[]>(() => initialCachedData.charCategories || defaultCharCats);
  const [artCategories, setArtCategories] = useState<string[]>(() => initialCachedData.artCategories || defaultArtCats);
  const [motCategories, setMotCategories] = useState<string[]>(() => initialCachedData.motCategories || defaultMotCats);
  const [artCategoryMap, setArtCategoryMap] = useState<Record<string, string>>(() => initialCachedData.artCategoryMap || defaultAppData.artCategoryMap || {});
  const [motCategoryMap, setMotCategoryMap] = useState<Record<string, string>>(() => initialCachedData.motCategoryMap || defaultAppData.motCategoryMap || {});
  const [systemLogo, setSystemLogo] = useState<string>(() => initialCachedData.systemLogo || DEFAULT_SYSTEM_LOGO);

  // Global unit scale state (defaults to cached/default, allows admin global scaling)
  const [globalUnitScale, setGlobalUnitScale] = useState<number>(() => {
    if (typeof initialCachedData.globalUnitScale === "number" && !isNaN(initialCachedData.globalUnitScale)) {
      return initialCachedData.globalUnitScale;
    }
    return 100;
  });
  // Sidebar "OPENING TOP" 4-second auto-reverting confirmation state (Emerald Green)
  const [openingTopCountdown, setOpeningTopCountdown] = useState<number | null>(null);
  const openingTopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpeningTopClick = () => {
    if (openingTopCountdown === null) {
      setOpeningTopCountdown(4);
      if (openingTopTimerRef.current) clearInterval(openingTopTimerRef.current);
      let remaining = 4;
      openingTopTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (openingTopTimerRef.current) clearInterval(openingTopTimerRef.current);
          setOpeningTopCountdown(null);
        } else {
          setOpeningTopCountdown(remaining);
        }
      }, 1000);
    } else {
      if (openingTopTimerRef.current) clearInterval(openingTopTimerRef.current);
      setOpeningTopCountdown(null);
      setCurrentScreen("splash");
    }
  };

  useEffect(() => {
    return () => {
      if (openingTopTimerRef.current) clearInterval(openingTopTimerRef.current);
    };
  }, []);

  const [units, setUnits] = useState<any[]>(() => {
    const base = (initialCachedData.units && initialCachedData.units.length > 0) ? initialCachedData.units : defaultAppData.units;
    return mergeUnitScales(base);
  });
  const [artSet, setArtSet] = useState<string[]>(() => (initialCachedData.artSet && initialCachedData.artSet.length > 0) ? initialCachedData.artSet : defaultAppData.artSet);
  const [motSet, setMotSet] = useState<string[]>(() => (initialCachedData.motSet && initialCachedData.motSet.length > 0) ? initialCachedData.motSet : defaultAppData.motSet);
  const [logoSet, setLogoSet] = useState<string[]>(() => (initialCachedData.logoSet && initialCachedData.logoSet.length > 0) ? initialCachedData.logoSet : defaultAppData.logoSet);
  const [isDraggingArt, setIsDraggingArt] = useState(false);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);

  const videoPlaylist = useMemo(() => {
    return [
      ...artSet.filter(d => resolveArtSrc(d) !== systemLogo).map((d) => resolveArtSrc(d)),
      ...motSet.map((d) => resolveMotSrc(d)),
      ...units.map((d) => d.file)
    ].filter(src => (src && (typeof src === 'string') && (src.endsWith(".mp4") || src.endsWith(".webm") || src.startsWith("data:video/"))) && !playlistExcludes.includes(src));
  }, [artSet, motSet, units, playlistExcludes, systemLogo]);

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
    // 1. Asynchronously load high-capacity IndexedDB data (PWA / offline persistence)
    loadAppDataFromIndexedDB().then((idbData) => {
      if (idbData) {
        if (Array.isArray(idbData.units) && idbData.units.length > 0) setUnits(mergeUnitScales(idbData.units));
        if (Array.isArray(idbData.artSet) && idbData.artSet.length > 0) setArtSet(idbData.artSet);
        if (Array.isArray(idbData.motSet) && idbData.motSet.length > 0) setMotSet(idbData.motSet);
        if (Array.isArray(idbData.logoSet) && idbData.logoSet.length > 0) setLogoSet(idbData.logoSet);
        if (idbData.storyJp) setStoryJp(idbData.storyJp);
        if (idbData.storyEn) setStoryEn(idbData.storyEn);
        if (idbData.storyStyle) setStoryStyle({ ...defaultStoryStyle, ...idbData.storyStyle });
        if (idbData.aboutLines) setAboutLines(idbData.aboutLines);
        if (idbData.aboutTitle) setAboutTitle(idbData.aboutTitle);
        if (idbData.splashMedia) setSplashMedia(idbData.splashMedia);
        if (idbData.splashMode) setSplashMode(idbData.splashMode);
        if (idbData.splashOpacity !== undefined) setSplashOpacity(idbData.splashOpacity);
        if (idbData.playlistExcludes) setPlaylistExcludes(idbData.playlistExcludes);
        if (idbData.charCategories) setCharCategories(idbData.charCategories);
        if (idbData.artCategories) setArtCategories(idbData.artCategories);
        if (idbData.motCategories) setMotCategories(idbData.motCategories);
        if (idbData.artCategoryMap) setArtCategoryMap(idbData.artCategoryMap);
        if (idbData.motCategoryMap) setMotCategoryMap(idbData.motCategoryMap);
        if (idbData.systemLogo && idbData.systemLogo.trim() !== "") {
          setSystemLogo(idbData.systemLogo);
        }
        if (typeof idbData.globalUnitScale === "number" && !isNaN(idbData.globalUnitScale)) {
          setGlobalUnitScale(idbData.globalUnitScale);
        }
      }
    }).catch(() => {});

    // 2. Fetch server data and perform hybrid merge (server assets + local additions)
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (Array.isArray(data.artSet) && data.artSet.length > 0) {
            setArtSet((prev) => {
              const serverArt = data.artSet;
              const localAdditions = prev.filter((a) => a.startsWith("data:") || a.startsWith("blob:"));
              const merged = [...serverArt];
              for (const a of localAdditions) {
                if (!merged.includes(a)) merged.push(a);
              }
              return merged;
            });
          }
          if (Array.isArray(data.units) && data.units.length > 0) {
            setUnits((prev) => {
              const serverUnits = data.units;
              const localUnits = prev.filter((u) => u.file && (u.file.startsWith("data:") || u.file.startsWith("blob:")));
              const merged = [...serverUnits];
              for (const u of localUnits) {
                if (!merged.some((m) => m.name === u.name || m.file === u.file)) merged.push(u);
              }
              return mergeUnitScales(merged);
            });
          }
          if (Array.isArray(data.motSet) && data.motSet.length > 0) {
            setMotSet((prev) => {
              const serverMot = data.motSet;
              const localMot = prev.filter((m) => m.startsWith("data:") || m.startsWith("blob:"));
              const merged = [...serverMot];
              for (const m of localMot) {
                if (!merged.includes(m)) merged.push(m);
              }
              return merged;
            });
          }
          if (Array.isArray(data.logoSet) && data.logoSet.length > 0) {
            setLogoSet((prev) => {
              const serverLogos = data.logoSet;
              const localLogos = prev.filter((l) => l.startsWith("data:") || l.startsWith("blob:"));
              const merged = [...serverLogos];
              for (const l of localLogos) {
                if (!merged.includes(l)) merged.push(l);
              }
              return merged;
            });
          }
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
          if (data.artCategoryMap) setArtCategoryMap(data.artCategoryMap);
          if (data.motCategoryMap) setMotCategoryMap(data.motCategoryMap);
          if (data.systemLogo && data.systemLogo.trim() !== "") {
            setSystemLogo(data.systemLogo);
          }
          if (typeof data.globalUnitScale === "number" && !isNaN(data.globalUnitScale)) {
            setGlobalUnitScale(data.globalUnitScale);
          }
          saveToLocalData(data);
        }
      })
      .catch((e) => {
        console.warn("Server API not reachable; maintaining cached/embedded offline data:", e);
      });

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

  // Persisted view mode for UNIT-ARCHIVES (DETAIL / GRID / LIST)
  const [charViewMode, setCharViewModeState] = useState<"DETAIL" | "GRID" | "LIST">(() => {
    try {
      const saved = localStorage.getItem("space_robotman_char_view_mode");
      if (saved === "DETAIL" || saved === "GRID" || saved === "LIST") return saved;
    } catch (e) {}
    return "DETAIL";
  });
  const setCharViewMode = (mode: "DETAIL" | "GRID" | "LIST") => {
    setCharViewModeState(mode);
    try {
      localStorage.setItem("space_robotman_char_view_mode", mode);
    } catch (e) {}
  };

  // Persisted list view scale for UNIT-ARCHIVES (S / M / L / XL)
  const [charListSize, setCharListSizeState] = useState<"S" | "M" | "L" | "XL">(() => {
    try {
      const saved = localStorage.getItem("space_robotman_char_list_size");
      if (saved === "S" || saved === "M" || saved === "L" || saved === "XL") return saved;
    } catch (e) {}
    return "M";
  });
  const setCharListSize = (size: "S" | "M" | "L" | "XL") => {
    setCharListSizeState(size);
    try {
      localStorage.setItem("space_robotman_char_list_size", size);
    } catch (e) {}
  };

  const [charSearchQuery, setCharSearchQuery] = useState("");

  const [activeArtFilter, setActiveArtFilter] = useState("ALL");
  const [selectedArt, setSelectedArt] = useState<string | null>(null);

  // Persisted view mode for CG-ARTWORKS (SLIDE / TILES)
  const [artViewMode, setArtViewModeState] = useState<"SLIDE" | "TILES">(() => {
    try {
      const saved = localStorage.getItem("space_robotman_art_view_mode");
      if (saved === "SLIDE" || saved === "TILES") return saved;
    } catch (e) {}
    return "SLIDE";
  });
  const setArtViewMode = (mode: "SLIDE" | "TILES") => {
    setArtViewModeState(mode);
    try {
      localStorage.setItem("space_robotman_art_view_mode", mode);
    } catch (e) {}
  };

  // Persisted tile size for CG-ARTWORKS (S / M / L)
  const [artTileSize, setArtTileSizeState] = useState<"S" | "M" | "L">(() => {
    try {
      const saved = localStorage.getItem("space_robotman_art_tile_size");
      if (saved === "S" || saved === "M" || saved === "L") return saved;
    } catch (e) {}
    return "M";
  });
  const setArtTileSize = (size: "S" | "M" | "L") => {
    setArtTileSizeState(size);
    try {
      localStorage.setItem("space_robotman_art_tile_size", size);
    } catch (e) {}
  };

  // Individual unit scale and vertical offset helpers
  const getUnitScale = (unit: any): number => {
    if (!unit) return 100;
    if (typeof unit.imageScale === "number" && !isNaN(unit.imageScale)) {
      return unit.imageScale;
    }
    try {
      const savedMap = localStorage.getItem("space_robotman_unit_scales");
      if (savedMap) {
        const parsed = JSON.parse(savedMap);
        const key = unit.name || unit.file;
        if (parsed && parsed[key] !== undefined) {
          if (typeof parsed[key] === "object" && typeof parsed[key].scale === "number") {
            return parsed[key].scale;
          } else if (typeof parsed[key] === "number") {
            return parsed[key];
          }
        }
      }
    } catch (e) {}
    return 100;
  };

  const getUnitOffsetY = (unit: any): number => {
    if (!unit) return 0;
    if (typeof unit.imageOffsetY === "number" && !isNaN(unit.imageOffsetY)) {
      return unit.imageOffsetY;
    }
    try {
      const savedMap = localStorage.getItem("space_robotman_unit_scales");
      if (savedMap) {
        const parsed = JSON.parse(savedMap);
        const key = unit.name || unit.file;
        if (parsed && parsed[key] !== undefined && typeof parsed[key] === "object" && typeof parsed[key].offsetY === "number") {
          return parsed[key].offsetY;
        }
      }
    } catch (e) {}
    return 0;
  };

  const updateUnitScaleAndOffset = (unitToUpdate: any, newScale: number, newOffsetY?: number) => {
    if (!unitToUpdate) return;
    const clampedScale = Math.max(30, Math.min(180, Math.round(newScale)));
    const currentOffsetY = getUnitOffsetY(unitToUpdate);
    const clampedOffsetY = Math.max(-120, Math.min(120, Math.round(newOffsetY !== undefined ? newOffsetY : currentOffsetY)));

    const updatedUnits = units.map((u) => {
      if ((unitToUpdate.name && u.name === unitToUpdate.name) || (unitToUpdate.file && u.file === unitToUpdate.file)) {
        return {
          ...u,
          imageScale: clampedScale,
          imageOffsetY: clampedOffsetY,
        };
      }
      return u;
    });
    setUnits(updatedUnits);

    const updatedCurrent = updatedUnits.find(
      (u) =>
        (unitToUpdate.name && u.name === unitToUpdate.name) ||
        (unitToUpdate.file && u.file === unitToUpdate.file)
    );
    if (updatedCurrent) {
      setSelectedChar(updatedCurrent);
    }

    try {
      const key = unitToUpdate.name || unitToUpdate.file;
      const savedMapStr = localStorage.getItem("space_robotman_unit_scales");
      const currentMap = savedMapStr ? JSON.parse(savedMapStr) : {};
      currentMap[key] = { scale: clampedScale, offsetY: clampedOffsetY };
      localStorage.setItem("space_robotman_unit_scales", JSON.stringify(currentMap));
    } catch (e) {}

    saveToLocalData({ units: updatedUnits });

    fetch("/api/update_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ units: updatedUnits }),
    }).catch(() => {});
  };

  const [artModalImage, setArtModalImage] = useState<string | null>(null);

  const getFilteredArt = () => {
    let list = artSet.filter((d) => resolveArtSrc(d) !== systemLogo);
    if (activeArtFilter !== "ALL") {
      list = list.filter((d) => {
        const cat = artCategoryMap[d] || defaultAppData.artCategoryMap?.[d] || (d.toLowerCase().includes(activeArtFilter.toLowerCase()) ? activeArtFilter : "CONCEPT");
        return cat.toUpperCase() === activeArtFilter.toUpperCase();
      });
    }
    return list;
  };

  const [activeMotFilter, setActiveMotFilter] = useState("ALL");
  const [selectedMot, setSelectedMot] = useState<string | null>(null);

  const getFilteredMot = () => {
    let list = [...motSet];
    if (activeMotFilter !== "ALL") {
      list = list.filter((d) => {
        const cat = motCategoryMap[d] || defaultAppData.motCategoryMap?.[d] || (d.toLowerCase().includes(activeMotFilter.toLowerCase()) ? activeMotFilter : "TECH");
        return cat.toUpperCase() === activeMotFilter.toUpperCase();
      });
    }
    return list;
  };
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
      const filtered = getFilteredUnits();
      if (filtered.length > 0) {
        const stillSelected = selectedChar
          ? filtered.find(
              (u) =>
                (selectedChar.name && u.name === selectedChar.name) ||
                (selectedChar.file && u.file === selectedChar.file),
            )
          : null;
        if (stillSelected) {
          if (selectedChar !== stillSelected) {
            setSelectedChar(stillSelected);
          }
        } else {
          setSelectedChar(filtered[0]);
        }
      }
    } else if (currentNav === "ART") {
      const filtered = getFilteredArt();
      if (filtered.length > 0) {
        if (!selectedArt || !filtered.includes(selectedArt)) {
          setSelectedArt(filtered[0]);
        }
      } else {
        setSelectedArt(null);
      }
    } else if (currentNav === "MOTION") {
      const filtered = getFilteredMot();
      if (filtered.length > 0) {
        if (!selectedMot || !filtered.includes(selectedMot)) {
          setSelectedMot(filtered[0]);
        }
      } else {
        setSelectedMot(null);
      }
    }
  }, [
    currentNav,
    activeCharFilter,
    activeArtFilter,
    activeMotFilter,
    charSearchQuery,
    units,
    artSet,
    motSet,
    artCategoryMap,
    motCategoryMap,
    systemLogo,
  ]);

  const renderSubNav = () => {
    const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.deltaY !== 0) {
        e.currentTarget.scrollLeft += e.deltaY;
      }
    };

    if (currentNav === "CHAR") {
      const filters = ["ALL", ...charCategories];
      return (
        <div className="w-full flex items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth"
            onWheel={handleCategoryWheel}
            title="ホイールで横スクロール可能"
          >
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

            {/* List View Scaling Controls (when in LIST mode) */}
            {charViewMode === "LIST" && (
              <div className="flex items-center gap-1 bg-[#161616] border border-[#2e2e2e] p-0.5">
                <span className="text-[9px] text-[#666] font-mono tracking-wider px-1.5 uppercase">
                  SIZE:
                </span>
                {(["S", "M", "L", "XL"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setCharListSize(size)}
                    className={`w-6 h-5 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      charListSize === size
                        ? "bg-[#fff] text-black shadow-sm"
                        : "text-[#777] hover:text-[#bbb] hover:bg-[#222]"
                    }`}
                    title={`リスト表示倍率: ${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

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
          <div 
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth"
            onWheel={handleCategoryWheel}
            title="ホイールで横スクロール可能"
          >
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
      return (
        <div 
          className="w-full flex items-center gap-2 overflow-x-auto py-1 scroll-smooth"
          onWheel={handleCategoryWheel}
          title="ホイールで横スクロール可能"
        >
          <span className="text-[10px] text-[#666] font-mono tracking-widest uppercase shrink-0 mr-1">
            CATEGORY:
          </span>
          {filters.map((f) => (
            <button
              key={f}
              className={`mech-btn !w-auto px-5 h-[28px] !mb-0 ${activeMotFilter === f ? "active" : ""}`}
              onClick={() => setActiveMotFilter(f)}
            >
              <span>{f}</span>
            </button>
          ))}
        </div>
      );
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
            <div 
              className="p-[40px] flex flex-col gap-[40px] h-full overflow-y-auto w-full bg-[#000] transition-all"
              style={{
                maxWidth: storyStyle.overviewMaxWidth || "896px",
              }}
            >
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
                  className="text-[#ccc] leading-[2.2] mb-[80px]"
                  style={{ 
                    fontSize: storyStyle.fontSizeJp, 
                    fontFamily: storyStyle.fontFamilyJp,
                    maxWidth: storyStyle.overviewMaxWidth === "100%" ? "100%" : "min(100%, 1400px)"
                  }}
                  dangerouslySetInnerHTML={{ __html: storyJp.join("<br><br>") }}
                ></div>
                <div
                  className={`text-[#888] leading-[2] ${storyStyle.isItalicEn ? "italic" : ""}`}
                  style={{ 
                    fontSize: storyStyle.fontSizeEn, 
                    fontFamily: storyStyle.fontFamilyEn,
                    maxWidth: storyStyle.overviewMaxWidth === "100%" ? "100%" : "min(100%, 1400px)"
                  }}
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
          <div
            id="art-well"
            className="w-full h-full flex flex-col relative overflow-hidden"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingArt(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setIsDraggingArt(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingArt(false);
              if (e.dataTransfer.files?.length) {
                handleUpload(e.dataTransfer.files, "ART");
              }
            }}
          >
            {isDraggingArt && (
              <div className="absolute inset-0 z-50 bg-black/85 border-2 border-dashed border-[#00ffcc] flex flex-col items-center justify-center p-6 backdrop-blur-sm pointer-events-none transition-all">
                <Upload size={44} className="text-[#00ffcc] mb-3 animate-bounce" />
                <div className="font-['Orbitron'] text-white text-[15px] font-bold tracking-widest mb-1">
                  DROP IMAGE TO ADD TO CG-ARTWORKS
                </div>
                <div className="text-[#aaa] text-[11px] font-mono">
                  AUTO HYBRID STORAGE // SERVER & INDEXEDDB READY
                </div>
              </div>
            )}
            {artViewMode === "SLIDE" ? (
              <>
                <div className="hero-frame flex-1 bg-[#141414] m-4 border border-[#2e2e2e] shadow-sm overflow-hidden flex items-center justify-center p-4">
                  {selectedArt && (
                    <img
                      src={resolveArtSrc(selectedArt)}
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
                    onWheel={(e) => handleScrollerWheel('ART', e)}
                    className="ribbon-scroller h-[120px] bg-[#141414] border-t border-[#2a2a2a] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0 scroll-smooth cursor-grab active:cursor-grabbing"
                  >
                    {getFilteredArt().map((art) => (
                      <div
                        key={art}
                        className={`h-[90%] w-auto flex-shrink-0 cursor-pointer border-2 transition-all ${selectedArt === art ? "border-[#fff] opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                        onClick={() => setSelectedArt(art)}
                      >
                        <img
                          src={resolveArtSrc(art)}
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
                            src={resolveArtSrc(art)}
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
                            {art.startsWith("data:") ? `LOCAL ART #${String(idx + 1).padStart(2, "0")}` : art.replace(/\.[^/.]+$/, "")}
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
                        {artModalImage.startsWith("data:") ? "LOCAL STORED ART" : artModalImage}
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
                      src={resolveArtSrc(artModalImage)}
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
                  src={resolveMotSrc(selectedMot)}
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
                onWheel={(e) => handleScrollerWheel('MOT', e)}
                className="ribbon-scroller h-[120px] bg-[#141414] border-t border-[#2a2a2a] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0 scroll-smooth cursor-grab active:cursor-grabbing"
              >
                {getFilteredMot().map((mot) => (
                  <div
                    key={mot}
                    className={`h-[90%] w-auto flex-shrink-0 cursor-pointer border-2 transition-all ${selectedMot === mot ? "border-[#888] opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                    onClick={() => setSelectedMot(mot)}
                  >
                    <video
                      src={resolveMotSrc(mot)}
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
            {charViewMode === "LIST" && (() => {
              const listConfig = {
                S: {
                  thumb: "w-10 h-10",
                  padding: "p-2",
                  titleSize: "text-[12px]",
                  badgeSize: "text-[7px]",
                  roleSize: "text-[9px]",
                  showDesc: false,
                  statsSize: "text-[8px]",
                  gap: "gap-1",
                },
                M: {
                  thumb: "w-14 h-14",
                  padding: "p-2.5",
                  titleSize: "text-[13px]",
                  badgeSize: "text-[8px]",
                  roleSize: "text-[10px]",
                  showDesc: true,
                  statsSize: "text-[9px]",
                  gap: "gap-1.5",
                },
                L: {
                  thumb: "w-20 h-20",
                  padding: "p-3.5",
                  titleSize: "text-[15px]",
                  badgeSize: "text-[9px]",
                  roleSize: "text-[11px]",
                  showDesc: true,
                  statsSize: "text-[10px]",
                  gap: "gap-2",
                },
                XL: {
                  thumb: "w-28 h-28",
                  padding: "p-4",
                  titleSize: "text-[17px]",
                  badgeSize: "text-[10px]",
                  roleSize: "text-[12px]",
                  showDesc: true,
                  statsSize: "text-[11px]",
                  gap: "gap-2.5",
                },
              }[charListSize];

              return (
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
                    <div className="flex items-center gap-3">
                      {/* Scale switcher in list header */}
                      <div className="flex items-center gap-1 bg-[#141414] border border-[#2e2e2e] p-0.5">
                        <span className="text-[9px] text-[#777] font-mono tracking-wider px-1.5 uppercase">
                          SCALE:
                        </span>
                        {(["S", "M", "L", "XL"] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setCharListSize(size)}
                            className={`px-2 h-5 text-[9px] font-mono font-bold transition-all cursor-pointer ${
                              charListSize === size
                                ? "bg-[var(--emerald-primary)] text-black font-bold shadow-sm"
                                : "text-[#777] hover:text-[#bbb] hover:bg-[#222]"
                            }`}
                            title={`リスト表示倍率: ${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <div className="hidden sm:block text-[9px] text-[#666] font-mono">
                        INDEX // SERIAL IDENTIFIER
                      </div>
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
                      <div className={`flex flex-col ${listConfig.gap}`}>
                        {getFilteredUnits().map((u: any, i: number) => {
                          const stats = getUnitStats(u.name);
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                setSelectedChar(u);
                                setCharViewMode("DETAIL");
                              }}
                              className={`group bg-[#161616] hover:bg-[#1c1c1c] border border-[#262626] hover:border-[#555] ${listConfig.padding} flex items-center justify-between gap-4 cursor-pointer transition-all shadow-sm`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Scalable Thumb */}
                                <div className={`${listConfig.thumb} bg-[#0c0c0c] border border-[#262626] shrink-0 flex items-center justify-center p-1 group-hover:border-[#555] transition-colors relative`}>
                                  <img
                                    src={u.file}
                                    alt={u.name}
                                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>

                                {/* Unit Meta */}
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-['Orbitron'] ${listConfig.titleSize} text-white font-bold tracking-wider group-hover:text-white transition-colors truncate`}>
                                      {u.name}
                                    </span>
                                    <span className={`${listConfig.badgeSize} font-mono px-1.5 py-0.5 bg-[#202020] border border-[#333] text-[#aaa] shrink-0`}>
                                      {u.faction || "UNKNOWN"}
                                    </span>
                                  </div>
                                  <div className={`${listConfig.roleSize} text-[#777] font-mono truncate mt-0.5`}>
                                    {u.role || "--"} {listConfig.showDesc && u.descJp ? ` // ${u.descJp.slice(0, charListSize === "XL" ? 80 : 48)}...` : ""}
                                  </div>
                                </div>
                              </div>

                              {/* Right Status & Action */}
                              <div className="flex items-center gap-5 shrink-0">
                                <div className={`hidden md:flex items-center gap-4 ${listConfig.statsSize} font-mono text-[#777]`}>
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

                                <button className="mech-btn !w-auto px-3.5 !h-[28px] !mb-0 border-[#333] group-hover:border-[#666] group-hover:text-white transition-colors">
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
              );
            })()}

            {/* 3. TERMINAL DETAIL VIEW MODE */}
            {charViewMode === "DETAIL" && (
              <div className="archive-box bg-[#141414] border border-[#2a2a2a] p-4 shadow-sm w-full h-full flex gap-4 relative z-10 overflow-hidden">
                {/* LEFT: Quick Unit Selector with Enlarged Thumbnails */}
                <div className="archive-scroller w-[330px] shrink-0 overflow-y-auto border-r border-[#242424] pr-3 flex flex-col gap-1.5" id="char-master-list">
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
                    const isSelected =
                      selectedChar &&
                      ((selectedChar.name && u.name === selectedChar.name) ||
                        (selectedChar.file && u.file === selectedChar.file));
                    return (
                      <button
                        key={i}
                        className={`w-full text-left p-2 border transition-all flex items-center gap-2.5 group cursor-pointer ${
                          isSelected
                            ? "bg-[#182624] border-[var(--emerald-dim)] border-l-[3px] border-l-[var(--emerald-primary)] text-white shadow-[0_0_12px_rgba(0,237,232,0.15)]"
                            : "bg-[#111] border-[#222] hover:border-[#3a3a3a] text-[#888] hover:text-[#ddd]"
                        }`}
                        onClick={() => setSelectedChar(u)}
                      >
                        {/* Enriched & Enlarged Character Image Icon (56px) */}
                        <div className={`w-14 h-14 shrink-0 bg-[#080808] border overflow-hidden flex items-center justify-center p-1 relative transition-colors ${isSelected ? "border-[var(--emerald-primary)] bg-[#0a1514]" : "border-[#282828] group-hover:border-[#444]"}`}>
                          <img
                            src={u.file}
                            alt={u.name}
                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`truncate font-['Orbitron'] text-[12px] ${isSelected ? "text-white font-bold" : "text-[#ccc] group-hover:text-white"}`}>
                              {u.name}
                            </span>
                            <span className="text-[8px] font-mono text-[#555] shrink-0">
                              #{String(i + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[8px] font-mono px-1.5 py-0.2 bg-[#1a1a1a] border border-[#333] text-[#aaa] shrink-0 truncate max-w-[100px]">
                              {u.faction || "--"}
                            </span>
                            <span className="text-[8px] text-[var(--emerald-primary)] font-mono">
                              {getUnitScale(u)}%
                            </span>
                          </div>
                          <span className="text-[9px] text-[#777] font-mono truncate">
                            {u.role || "--"}
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
                      <div className="flex-1 bg-[#0c0c0c] border border-[#242424] flex flex-col min-h-0 relative overflow-hidden">
                        {/* Viewport Header Telemetry & Calibration HUD */}
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#202020] bg-[#111] z-10 text-[9px] font-mono text-[#666] flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[var(--emerald-primary)]"></span>
                            <span className="text-[#ccc] font-bold tracking-widest">OPTICAL APERTURE</span>
                            <span className="text-[#555] hidden sm:inline">// CALIBRATION</span>
                          </div>

                          {/* Individual Unit Image Size / Bottom Fit Calibration HUD */}
                          <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#2a2a2a] px-2 py-0.5">
                            <span className="text-[9px] font-mono text-[#777] uppercase tracking-wider">
                              SIZE:
                            </span>
                            <button
                              onClick={() => {
                                const cur = getUnitScale(selectedChar);
                                updateUnitScaleAndOffset(selectedChar, cur - 5);
                              }}
                              className="w-5 h-4.5 bg-[#181818] hover:bg-[#282828] text-white border border-[#333] hover:border-[#666] flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors"
                              title="縮小 (-5%) 下が切れる場合は小さく調整"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-mono font-bold text-white w-9 text-center">
                              {getUnitScale(selectedChar)}%
                            </span>
                            <button
                              onClick={() => {
                                const cur = getUnitScale(selectedChar);
                                updateUnitScaleAndOffset(selectedChar, cur + 5);
                              }}
                              className="w-5 h-4.5 bg-[#181818] hover:bg-[#282828] text-white border border-[#333] hover:border-[#666] flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors"
                              title="拡大 (+5%)"
                            >
                              +
                            </button>

                            <div className="w-[1px] h-3.5 bg-[#262626] mx-0.5"></div>

                            <span className="text-[9px] font-mono text-[#777] uppercase tracking-wider hidden md:inline">
                              POS:
                            </span>
                            <button
                              onClick={() => {
                                const curScale = getUnitScale(selectedChar);
                                const curOffset = getUnitOffsetY(selectedChar);
                                updateUnitScaleAndOffset(selectedChar, curScale, curOffset - 8);
                              }}
                              className="w-5 h-4.5 bg-[#181818] hover:bg-[#282828] text-[#aaa] hover:text-white border border-[#333] hover:border-[#666] flex items-center justify-center text-[9px] cursor-pointer transition-colors"
                              title="上へ移動（下の見切れを解消）"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => {
                                const curScale = getUnitScale(selectedChar);
                                const curOffset = getUnitOffsetY(selectedChar);
                                updateUnitScaleAndOffset(selectedChar, curScale, curOffset + 8);
                              }}
                              className="w-5 h-4.5 bg-[#181818] hover:bg-[#282828] text-[#aaa] hover:text-white border border-[#333] hover:border-[#666] flex items-center justify-center text-[9px] cursor-pointer transition-colors"
                              title="下へ移動"
                            >
                              ▼
                            </button>

                            <div className="w-[1px] h-3.5 bg-[#262626] mx-0.5"></div>

                            {/* Quick Presets */}
                            {([100, 90, 80] as const).map((pct) => {
                              const active = getUnitScale(selectedChar) === pct && getUnitOffsetY(selectedChar) === 0;
                              return (
                                <button
                                  key={pct}
                                  onClick={() => updateUnitScaleAndOffset(selectedChar, pct, 0)}
                                  className={`px-1.5 h-4.5 text-[9px] font-mono font-bold transition-colors cursor-pointer ${
                                    active
                                      ? "bg-[#fff] text-black"
                                      : "text-[#777] hover:text-white hover:bg-[#1a1a1a]"
                                  }`}
                                  title={`${pct}%に設定（位置リセット）`}
                                >
                                  {pct}%
                                </button>
                              );
                            })}

                            <div className="w-[1px] h-3.5 bg-[#262626] mx-0.5"></div>

                            {/* Always visible neutral reset button */}
                            <button
                              onClick={() => updateUnitScaleAndOffset(selectedChar, 100, 0)}
                              className={`px-2 h-4.5 text-[9px] font-mono font-bold transition-all cursor-pointer ${
                                getUnitScale(selectedChar) === 100 && getUnitOffsetY(selectedChar) === 0
                                  ? "text-[#555] hover:text-[#888]"
                                  : "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#ddd] hover:text-white border border-[#3a3a3a]"
                              }`}
                              title="初期値 (100%, Y:0) にリセット"
                            >
                              RESET
                            </button>
                          </div>
                        </div>

                        {/* Corner HUD Brackets - Square Industrial */}
                        <div className="absolute top-12 left-3 w-3 h-3 border-t border-l border-[#555] pointer-events-none"></div>
                        <div className="absolute top-12 right-3 w-3 h-3 border-t border-r border-[#555] pointer-events-none"></div>
                        <div className="absolute bottom-10 left-3 w-3 h-3 border-b border-l border-[#555] pointer-events-none"></div>
                        <div className="absolute bottom-10 right-3 w-3 h-3 border-b border-r border-[#555] pointer-events-none"></div>

                        {/* Central Visual Focus */}
                        <div className="flex-1 min-h-0 w-full flex items-center justify-center p-4 md:p-6 pb-6 relative overflow-hidden">
                          <div
                            className="relative w-full h-full flex items-center justify-center transition-transform duration-150"
                            style={{
                              transform: `scale(${((getUnitScale(selectedChar) / 100) * (globalUnitScale / 100))}) translateY(${getUnitOffsetY(selectedChar)}px)`,
                              transformOrigin: "center center",
                            }}
                          >
                            <img
                              src={selectedChar.file}
                              className="max-h-full max-w-full object-contain filter drop-shadow-lg pointer-events-none select-none transition-transform duration-300"
                              style={{
                                maxHeight: "calc(100% - 10px)",
                              }}
                              alt={selectedChar.name}
                            />
                          </div>
                        </div>

                        {/* Viewport Footer Telemetry */}
                        <div className="px-3 py-1.5 border-t border-[#1a1a1a] bg-[#101010] flex items-center justify-between text-[8px] font-mono text-[#555] z-10">
                          <div>DATA RECORD: SYNCHRONIZED</div>
                          <div className="tracking-wider text-[#777]">
                            APERTURE: {getUnitScale(selectedChar)}%{globalUnitScale !== 100 ? ` [GLOBAL: ${globalUnitScale}%]` : ""} // OFFSET: {getUnitOffsetY(selectedChar)}PX
                          </div>
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
                              const idx = list.findIndex(
                                (u) =>
                                  (selectedChar?.name && u.name === selectedChar.name) ||
                                  (selectedChar?.file && u.file === selectedChar.file),
                              );
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
                              const idx = list.findIndex(
                                (u) =>
                                  (selectedChar?.name && u.name === selectedChar.name) ||
                                  (selectedChar?.file && u.file === selectedChar.file),
                              );
                              if (idx >= 0 && idx < list.length - 1) setSelectedChar(list[idx + 1]);
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
  const [fmScale, setFmScale] = useState<number>(100);
  const [fmOffsetY, setFmOffsetY] = useState<number>(0);

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

  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>("ALL");
  const [adminUploadCategory, setAdminUploadCategory] = useState<string>("");
  const [newCategoryInput, setNewCategoryInput] = useState<string>("");
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editingCatValue, setEditingCatValue] = useState<string>("");
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<string | null>(null);
  const [selectedAdminItemIndex, setSelectedAdminItemIndex] = useState<number>(-1);

  const getItemCategory = (tab: string, rawItem: any, index?: number): string => {
    if (tab === "ART") {
      const key = typeof rawItem === "string" ? rawItem : (index !== undefined ? artSet[index] : "");
      return artCategoryMap[key] || defaultAppData.artCategoryMap?.[key] || (artCategories.length > 0 ? artCategories[0] : "CONCEPT");
    }
    if (tab === "MOTION") {
      const key = typeof rawItem === "string" ? rawItem : (index !== undefined ? motSet[index] : "");
      return motCategoryMap[key] || defaultAppData.motCategoryMap?.[key] || (motCategories.length > 0 ? motCategories[0] : "TECH");
    }
    if (tab === "CHAR") {
      if (rawItem && typeof rawItem === "object" && rawItem.faction) return rawItem.faction;
      if (index !== undefined && units[index]) return units[index].faction || (charCategories.length > 0 ? charCategories[0] : "HERITAGE");
      if (typeof rawItem === "string") {
        const u = units.find((un) => un.name === rawItem || un.file === rawItem);
        if (u?.faction) return u.faction;
      }
      return charCategories.length > 0 ? charCategories[0] : "HERITAGE";
    }
    return "";
  };

  const handleAddCategory = (tab: "ART" | "MOTION" | "CHAR", name: string) => {
    const trimmed = name.trim().toUpperCase().replace(/[^A-Z0-9_\- ]/g, "");
    if (!trimmed) return;
    let p: any = {};
    if (tab === "ART") {
      if (artCategories.includes(trimmed)) return;
      const updated = [...artCategories, trimmed];
      setArtCategories(updated);
      setAdminArtCategories(updated.join(", "));
      p.artCategories = updated;
    } else if (tab === "MOTION") {
      if (motCategories.includes(trimmed)) return;
      const updated = [...motCategories, trimmed];
      setMotCategories(updated);
      setAdminMotCategories(updated.join(", "));
      p.motCategories = updated;
    } else if (tab === "CHAR") {
      if (charCategories.includes(trimmed)) return;
      const updated = [...charCategories, trimmed];
      setCharCategories(updated);
      setAdminCharCategories(updated.join(", "));
      p.charCategories = updated;
    }
    setNewCategoryInput("");
    saveAdminData(p);
    setUploadMsg(`CATEGORY [${trimmed}] ADDED!`);
  };

  const handleRenameCategory = (tab: "ART" | "MOTION" | "CHAR", oldCat: string, newName: string) => {
    const trimmed = newName.trim().toUpperCase().replace(/[^A-Z0-9_\- ]/g, "");
    if (!trimmed || trimmed === oldCat) {
      setEditingCatName(null);
      return;
    }
    let p: any = {};
    if (tab === "ART") {
      if (artCategories.includes(trimmed)) {
        setUploadMsg(`CATEGORY [${trimmed}] ALREADY EXISTS!`);
        setEditingCatName(null);
        return;
      }
      const updatedCats = artCategories.map((c) => (c === oldCat ? trimmed : c));
      const updatedMap = { ...artCategoryMap };
      for (const k in updatedMap) {
        if (updatedMap[k] === oldCat) {
          updatedMap[k] = trimmed;
        }
      }
      setArtCategories(updatedCats);
      setAdminArtCategories(updatedCats.join(", "));
      setArtCategoryMap(updatedMap);
      p.artCategories = updatedCats;
      p.artCategoryMap = updatedMap;
      if (activeArtFilter === oldCat) setActiveArtFilter(trimmed);
      if (adminCategoryFilter === oldCat) setAdminCategoryFilter(trimmed);
    } else if (tab === "MOTION") {
      if (motCategories.includes(trimmed)) {
        setUploadMsg(`CATEGORY [${trimmed}] ALREADY EXISTS!`);
        setEditingCatName(null);
        return;
      }
      const updatedCats = motCategories.map((c) => (c === oldCat ? trimmed : c));
      const updatedMap = { ...motCategoryMap };
      for (const k in updatedMap) {
        if (updatedMap[k] === oldCat) {
          updatedMap[k] = trimmed;
        }
      }
      setMotCategories(updatedCats);
      setAdminMotCategories(updatedCats.join(", "));
      setMotCategoryMap(updatedMap);
      p.motCategories = updatedCats;
      p.motCategoryMap = updatedMap;
      if (activeMotFilter === oldCat) setActiveMotFilter(trimmed);
      if (adminCategoryFilter === oldCat) setAdminCategoryFilter(trimmed);
    } else if (tab === "CHAR") {
      if (charCategories.includes(trimmed)) {
        setUploadMsg(`CATEGORY [${trimmed}] ALREADY EXISTS!`);
        setEditingCatName(null);
        return;
      }
      const updatedCats = charCategories.map((c) => (c === oldCat ? trimmed : c));
      const updatedUnits = units.map((u) => (u.faction === oldCat ? { ...u, faction: trimmed } : u));
      setCharCategories(updatedCats);
      setAdminCharCategories(updatedCats.join(", "));
      setUnits(updatedUnits);
      p.charCategories = updatedCats;
      p.units = updatedUnits;
      if (activeCharFilter === oldCat) setActiveCharFilter(trimmed);
      if (adminCategoryFilter === oldCat) setAdminCategoryFilter(trimmed);
    }
    setEditingCatName(null);
    saveAdminData(p);
    setUploadMsg(`CATEGORY RENAMED TO [${trimmed}]`);
  };

  const handleDeleteCategory = (tab: "ART" | "MOTION" | "CHAR", catToDelete: string) => {
    let p: any = {};
    if (tab === "ART") {
      const updatedCats = artCategories.filter((c) => c !== catToDelete);
      const fallbackCat = updatedCats.length > 0 ? updatedCats[0] : "CONCEPT";
      const updatedMap = { ...artCategoryMap };
      for (const k in updatedMap) {
        if (updatedMap[k] === catToDelete) {
          updatedMap[k] = fallbackCat;
        }
      }
      setArtCategories(updatedCats);
      setAdminArtCategories(updatedCats.join(", "));
      setArtCategoryMap(updatedMap);
      p.artCategories = updatedCats;
      p.artCategoryMap = updatedMap;
      if (activeArtFilter === catToDelete) setActiveArtFilter("ALL");
      if (adminCategoryFilter === catToDelete) setAdminCategoryFilter("ALL");
    } else if (tab === "MOTION") {
      const updatedCats = motCategories.filter((c) => c !== catToDelete);
      const fallbackCat = updatedCats.length > 0 ? updatedCats[0] : "TECH";
      const updatedMap = { ...motCategoryMap };
      for (const k in updatedMap) {
        if (updatedMap[k] === catToDelete) {
          updatedMap[k] = fallbackCat;
        }
      }
      setMotCategories(updatedCats);
      setAdminMotCategories(updatedCats.join(", "));
      setMotCategoryMap(updatedMap);
      p.motCategories = updatedCats;
      p.motCategoryMap = updatedMap;
      if (activeMotFilter === catToDelete) setActiveMotFilter("ALL");
      if (adminCategoryFilter === catToDelete) setAdminCategoryFilter("ALL");
    } else if (tab === "CHAR") {
      const updatedCats = charCategories.filter((c) => c !== catToDelete);
      const fallbackCat = updatedCats.length > 0 ? updatedCats[0] : "HERITAGE";
      const updatedUnits = units.map((u) => (u.faction === catToDelete ? { ...u, faction: fallbackCat } : u));
      setCharCategories(updatedCats);
      setAdminCharCategories(updatedCats.join(", "));
      setUnits(updatedUnits);
      p.charCategories = updatedCats;
      p.units = updatedUnits;
      if (activeCharFilter === catToDelete) setActiveCharFilter("ALL");
      if (adminCategoryFilter === catToDelete) setAdminCategoryFilter("ALL");
    }
    setDeleteConfirmCat(null);
    saveAdminData(p);
    setUploadMsg(`CATEGORY [${catToDelete}] REMOVED.`);
  };

  const handleAssignItemCategory = (tab: "ART" | "MOTION" | "CHAR", rawKeyOrIndex: string | number, newCat: string) => {
    let p: any = {};
    if (tab === "ART") {
      const key = typeof rawKeyOrIndex === "string" ? rawKeyOrIndex : artSet[rawKeyOrIndex];
      if (!key) return;
      const updated = { ...artCategoryMap, [key]: newCat };
      setArtCategoryMap(updated);
      p.artCategoryMap = updated;
      setUploadMsg(`ARTWORK MOVED TO [${newCat}]`);
    } else if (tab === "MOTION") {
      const key = typeof rawKeyOrIndex === "string" ? rawKeyOrIndex : motSet[rawKeyOrIndex];
      if (!key) return;
      const updated = { ...motCategoryMap, [key]: newCat };
      setMotCategoryMap(updated);
      p.motCategoryMap = updated;
      setUploadMsg(`VIDEO MOVED TO [${newCat}]`);
    } else if (tab === "CHAR") {
      let idx = typeof rawKeyOrIndex === "number" ? rawKeyOrIndex : units.findIndex((u) => u.name === rawKeyOrIndex);
      if (idx === -1 && typeof rawKeyOrIndex === "string") {
        idx = units.findIndex((u) => u.file === rawKeyOrIndex);
      }
      if (idx === -1 || !units[idx]) return;
      const updated = [...units];
      updated[idx] = { ...updated[idx], faction: newCat };
      setUnits(updated);
      setFmFact(newCat);
      p.units = updated;
      setUploadMsg(`UNIT [${updated[idx].name}] ASSIGNED TO [${newCat}]`);
    }
    saveAdminData(p);
  };

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

  const wheelAccumulatorRef = useRef<{ ART: number; MOT: number }>({ ART: 0, MOT: 0 });
  const lastWheelTimeRef = useRef<number>(0);

  const navigateMedia = (type: 'ART' | 'MOT', direction: 'left' | 'right') => {
    if (type === 'ART') {
      const list = getFilteredArt();
      if (list.length === 0) return;
      const idx = list.indexOf(selectedArt);
      let nextIdx = 0;
      if (idx === -1) {
        nextIdx = 0;
      } else {
        nextIdx = direction === 'left' ? idx - 1 : idx + 1;
        if (nextIdx < 0) nextIdx = list.length - 1;
        if (nextIdx >= list.length) nextIdx = 0;
      }
      setSelectedArt(list[nextIdx]);
      if (artScrollerRef.current) {
        const thumb = artScrollerRef.current.children[nextIdx] as HTMLElement;
        if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else {
      const list = getFilteredMot();
      if (list.length === 0) return;
      const idx = list.indexOf(selectedMot);
      let nextIdx = 0;
      if (idx === -1) {
        nextIdx = 0;
      } else {
        nextIdx = direction === 'left' ? idx - 1 : idx + 1;
        if (nextIdx < 0) nextIdx = list.length - 1;
        if (nextIdx >= list.length) nextIdx = 0;
      }
      setSelectedMot(list[nextIdx]);
      if (motScrollerRef.current) {
        const thumb = motScrollerRef.current.children[nextIdx] as HTMLElement;
        if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleScrollerWheel = (type: 'ART' | 'MOT', e: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 2) return;

    const now = Date.now();
    if (now - lastWheelTimeRef.current > 300) {
      wheelAccumulatorRef.current[type] = 0;
    }
    lastWheelTimeRef.current = now;
    wheelAccumulatorRef.current[type] += delta;

    const THRESHOLD = 25;
    if (wheelAccumulatorRef.current[type] >= THRESHOLD) {
      navigateMedia(type, 'right');
      wheelAccumulatorRef.current[type] = 0;
    } else if (wheelAccumulatorRef.current[type] <= -THRESHOLD) {
      navigateMedia(type, 'left');
      wheelAccumulatorRef.current[type] = 0;
    }
  };

  const [customUploadName, setCustomUploadName] = useState("");
  const [importPendingData, setImportPendingData] = useState<any | null>(null);
  const [importFileName, setImportFileName] = useState<string>("");
  const [importErrorMsg, setImportErrorMsg] = useState<string>("");
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Admin 4-digit PIN authentication
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("SPACE_ROBOTMAN_ADMIN_PIN");
      if (saved && saved.length === 4) return saved;
      const initial = loadInitialData();
      return initial.adminPin || "0000";
    } catch {
      return "0000";
    }
  });
  const [sidebarPinInput, setSidebarPinInput] = useState<string>("");
  const sidebarPinRef = useRef<HTMLInputElement>(null);
  const [isSidebarPinFocused, setIsSidebarPinFocused] = useState<boolean>(false);
  const [pinErrorMessage, setPinErrorMessage] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [modalPinInput, setModalPinInput] = useState<string>("");
  const [modalPinError, setModalPinError] = useState<string>("");
  const [newAdminPinInput, setNewAdminPinInput] = useState<string>("");
  const [pinChangeSuccessMsg, setPinChangeSuccessMsg] = useState<string>("");

  const attemptAdminLogin = (pinToTest: string) => {
    const targetPin = adminPin || "0000";
    if (pinToTest.trim() === targetPin) {
      setSidebarPinInput("");
      setPinErrorMessage("");
      setModalPinInput("");
      setModalPinError("");
      setShowPinModal(false);
      setCurrentScreen("admin");
    } else {
      const err = "INCORRECT PIN // 暗証番号が違います";
      setPinErrorMessage(err);
      setModalPinError(err);
      setTimeout(() => {
        setPinErrorMessage("");
      }, 3000);
    }
  };

  const handleUpdateAdminPin = (newPin: string) => {
    const cleaned = newPin.trim();
    if (!/^\d{4}$/.test(cleaned)) {
      setPinChangeSuccessMsg("エラー: 半角数字4桁で指定してください (例: 1234)");
      setTimeout(() => setPinChangeSuccessMsg(""), 3500);
      return;
    }
    setAdminPin(cleaned);
    try {
      localStorage.setItem("SPACE_ROBOTMAN_ADMIN_PIN", cleaned);
      saveToLocalData({ adminPin: cleaned });
    } catch (e) {
      console.warn("Failed to persist PIN", e);
    }
    setNewAdminPinInput("");
    setPinChangeSuccessMsg(`管理者暗証番号を「${cleaned}」に更新しました！`);
    setTimeout(() => setPinChangeSuccessMsg(""), 4000);
  };

  const getCurrentFullData = () => {
    return {
      app: "SPACE ROBOTMAN WORLD",
      version: "3.2",
      exportedAt: new Date().toISOString(),
      adminPin: adminPin || "0000",
      units,
      artSet,
      motSet,
      logoSet,
      storyJp: adminStoryJp ? adminStoryJp.split("\n\n") : storyJp,
      storyEn: adminStoryEn ? adminStoryEn.split("\n\n") : storyEn,
      storyStyle: adminStoryStyle || storyStyle,
      aboutTitle: adminAboutTitle || aboutTitle,
      aboutLines: adminAboutText ? adminAboutText.split("\n") : aboutLines,
      splashMedia: adminSplashMedia || splashMedia,
      splashMode: adminSplashMode || splashMode,
      splashOpacity: adminSplashOpacity !== undefined ? adminSplashOpacity : splashOpacity,
      playlistExcludes: adminPlaylistExcludes || playlistExcludes,
      charCategories: adminCharCategories ? adminCharCategories.split(",").map((s) => s.trim()).filter(Boolean) : charCategories,
      artCategories: adminArtCategories ? adminArtCategories.split(",").map((s) => s.trim()).filter(Boolean) : artCategories,
      motCategories: adminMotCategories ? adminMotCategories.split(",").map((s) => s.trim()).filter(Boolean) : motCategories,
      artCategoryMap,
      motCategoryMap,
      systemLogo: systemLogo || DEFAULT_SYSTEM_LOGO,
      globalUnitScale: globalUnitScale || 100,
    };
  };

  const handleExportData = () => {
    const currentData = getCurrentFullData();
    const jsonStr = JSON.stringify(currentData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `space-robotman-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveStatusMsg("BACKUP EXPORTED TO JSON!");
    setTimeout(() => setSaveStatusMsg(""), 3000);
  };

  const handleCopyJsonToClipboard = () => {
    const currentData = getCurrentFullData();
    navigator.clipboard
      .writeText(JSON.stringify(currentData, null, 2))
      .then(() => {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      })
      .catch(() => {
        setSaveStatusMsg("CLIPBOARD COPY FAILED");
        setTimeout(() => setSaveStatusMsg(""), 2000);
      });
  };

  const handleImportFile = (file: File) => {
    setImportErrorMsg("");
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("無効なJSONファイルです（最上位がオブジェクトではありません）。");
        }
        const hasRecognizedKeys =
          Array.isArray(parsed.units) ||
          Array.isArray(parsed.artSet) ||
          Array.isArray(parsed.motSet) ||
          Array.isArray(parsed.storyJp) ||
          parsed.storyJp !== undefined;

        if (!hasRecognizedKeys) {
          throw new Error("このJSONにはスペースロボットマンのデータが含まれていないようです。");
        }

        setImportPendingData(parsed);
      } catch (err: any) {
        setImportErrorMsg(`インポートエラー: ${err.message || "JSONの解析に失敗しました。"}`);
        setImportPendingData(null);
      }
    };
    reader.onerror = () => {
      setImportErrorMsg("ファイルの読み込みに失敗しました。");
      setImportPendingData(null);
    };
    reader.readAsText(file);
  };

  const applyImportedData = async (dataToApply: any) => {
    try {
      if (Array.isArray(dataToApply.units)) setUnits(dataToApply.units);
      if (Array.isArray(dataToApply.artSet)) setArtSet(dataToApply.artSet);
      if (Array.isArray(dataToApply.motSet)) setMotSet(dataToApply.motSet);
      if (Array.isArray(dataToApply.logoSet)) setLogoSet(dataToApply.logoSet);
      if (dataToApply.storyJp) {
        const jArr = Array.isArray(dataToApply.storyJp) ? dataToApply.storyJp : [dataToApply.storyJp];
        setStoryJp(jArr);
        setAdminStoryJp(jArr.join("\n\n"));
      }
      if (dataToApply.storyEn) {
        const eArr = Array.isArray(dataToApply.storyEn) ? dataToApply.storyEn : [dataToApply.storyEn];
        setStoryEn(eArr);
        setAdminStoryEn(eArr.join("\n\n"));
      }
      if (dataToApply.storyStyle) {
        const newStyle = { ...defaultStoryStyle, ...dataToApply.storyStyle };
        setStoryStyle(newStyle);
        setAdminStoryStyle(newStyle);
      }
      if (dataToApply.aboutTitle) {
        setAboutTitle(dataToApply.aboutTitle);
        setAdminAboutTitle(dataToApply.aboutTitle);
      }
      if (dataToApply.aboutLines) {
        const aLines = Array.isArray(dataToApply.aboutLines) ? dataToApply.aboutLines : [dataToApply.aboutLines];
        setAboutLines(aLines);
        setAdminAboutText(aLines.join("\n"));
      }
      if (dataToApply.splashMedia) {
        setSplashMedia(dataToApply.splashMedia);
        setAdminSplashMedia(dataToApply.splashMedia);
      }
      if (dataToApply.splashMode) {
        setSplashMode(dataToApply.splashMode);
        setAdminSplashMode(dataToApply.splashMode);
      }
      if (dataToApply.splashOpacity !== undefined) {
        setSplashOpacity(dataToApply.splashOpacity);
        setAdminSplashOpacity(dataToApply.splashOpacity);
      }
      if (dataToApply.playlistExcludes) {
        setPlaylistExcludes(dataToApply.playlistExcludes);
        setAdminPlaylistExcludes(dataToApply.playlistExcludes);
      }
      if (dataToApply.charCategories) {
        setCharCategories(dataToApply.charCategories);
        setAdminCharCategories(dataToApply.charCategories.join(", "));
      }
      if (dataToApply.artCategories) {
        setArtCategories(dataToApply.artCategories);
        setAdminArtCategories(dataToApply.artCategories.join(", "));
      }
      if (dataToApply.motCategories) {
        setMotCategories(dataToApply.motCategories);
        setAdminMotCategories(dataToApply.motCategories.join(", "));
      }
      if (dataToApply.artCategoryMap) {
        setArtCategoryMap(dataToApply.artCategoryMap);
      }
      if (dataToApply.motCategoryMap) {
        setMotCategoryMap(dataToApply.motCategoryMap);
      }
      if (dataToApply.systemLogo) {
        setSystemLogo(dataToApply.systemLogo);
      }
      if (typeof dataToApply.globalUnitScale === "number" && !isNaN(dataToApply.globalUnitScale)) {
        setGlobalUnitScale(dataToApply.globalUnitScale);
      }
      if (dataToApply.adminPin && typeof dataToApply.adminPin === "string" && dataToApply.adminPin.length === 4) {
        setAdminPin(dataToApply.adminPin);
        try {
          localStorage.setItem("SPACE_ROBOTMAN_ADMIN_PIN", dataToApply.adminPin);
        } catch (e) {}
      }

      saveToLocalData(dataToApply);

      try {
        await fetch("/api/update_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToApply),
        });
      } catch (e) {
        console.warn("Could not sync imported data to server; persisted to local storage.", e);
      }

      const uCount = Array.isArray(dataToApply.units) ? dataToApply.units.length : 0;
      const aCount = Array.isArray(dataToApply.artSet) ? dataToApply.artSet.length : 0;
      const mCount = Array.isArray(dataToApply.motSet) ? dataToApply.motSet.length : 0;

      setSaveStatusMsg(`IMPORTED: ${uCount} UNITS, ${aCount} ARTS, ${mCount} MOVIES!`);
      setImportPendingData(null);
      setImportFileName("");
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
      setTimeout(() => setSaveStatusMsg(""), 3500);
    } catch (err: any) {
      setImportErrorMsg(`データの適用に失敗しました: ${err.message}`);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("初期データ（出荷時設定）に戻しますか？現在のローカル変更はリセットされます。念のため先にエクスポートしておくことをお勧めします。")) {
      applyImportedData(defaultAppData);
      setSaveStatusMsg("RESET TO FACTORY DEFAULT DATA!");
      setTimeout(() => setSaveStatusMsg(""), 3000);
    }
  };

  const saveAdminData = async (payloadToSave?: any) => {
    setSaveStatusMsg("SAVING...");
    try {
      const effectiveSystemLogo = (payloadToSave?.systemLogo !== undefined ? payloadToSave.systemLogo : systemLogo) || DEFAULT_SYSTEM_LOGO;
      const effectiveLogoSet = payloadToSave?.logoSet !== undefined ? payloadToSave.logoSet : logoSet;
      const effectiveCharCats = payloadToSave?.charCategories || (adminCharCategories ? adminCharCategories.split(",").map((s) => s.trim()).filter(Boolean) : charCategories);
      const effectiveArtCats = payloadToSave?.artCategories || (adminArtCategories ? adminArtCategories.split(",").map((s) => s.trim()).filter(Boolean) : artCategories);
      const effectiveMotCats = payloadToSave?.motCategories || (adminMotCategories ? adminMotCategories.split(",").map((s) => s.trim()).filter(Boolean) : motCategories);
      const effectiveArtCatMap = payloadToSave?.artCategoryMap || artCategoryMap;
      const effectiveMotCatMap = payloadToSave?.motCategoryMap || motCategoryMap;

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
        charCategories: effectiveCharCats,
        artCategories: effectiveArtCats,
        motCategories: effectiveMotCats,
        artCategoryMap: effectiveArtCatMap,
        motCategoryMap: effectiveMotCatMap,
        systemLogo: effectiveSystemLogo,
        logoSet: effectiveLogoSet,
        globalUnitScale: payloadToSave?.globalUnitScale !== undefined ? payloadToSave.globalUnitScale : globalUnitScale,
      };
      saveToLocalData(payload);
      const res = await fetch("/api/update_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatusMsg("AUTO-SAVED TO DATA.JSON & LOCAL!");
        setStoryJp(adminStoryJp.split("\n\n"));
        setStoryEn(adminStoryEn.split("\n\n"));
        setStoryStyle(adminStoryStyle);
        setAboutTitle(adminAboutTitle);
        setAboutLines(adminAboutText.split("\n"));
        setSplashMedia(adminSplashMedia);
        setSplashMode(adminSplashMode);
        setSplashOpacity(adminSplashOpacity);
        setPlaylistExcludes(adminPlaylistExcludes);
        setCharCategories(effectiveCharCats);
        setArtCategories(effectiveArtCats);
        setMotCategories(effectiveMotCats);
        setArtCategoryMap(effectiveArtCatMap);
        setMotCategoryMap(effectiveMotCatMap);
        setTimeout(() => setSaveStatusMsg(""), 2000);
      } else {
        setSaveStatusMsg("SAVE FAILED (SAVED LOCALLY).");
        setTimeout(() => setSaveStatusMsg(""), 2000);
      }
    } catch (e) {
      setSaveStatusMsg("SAVED LOCALLY (OFFLINE PWA).");
      setTimeout(() => setSaveStatusMsg(""), 2500);
    }
  };

  const handleUpload = async (files: FileList | File[], categoryOverride?: string) => {
    const category = categoryOverride || currentAdminTab;
    let formData = new FormData();
    formData.append("category", category);
    if (files.length === 1 && customUploadName) {
      formData.append("filename", customUploadName);
    }
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploadMsg(`UPLOADING ${files.length} FILE(S)...`);
    let isServerUploaded = false;

    // 1. サーバーへのアップロードを試行（AI Studio / Node.js 稼働時）
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          isServerUploaded = true;
          setUploadMsg("UPLOAD COMPLETE (SERVER)");
          setCustomUploadName("");
          let p: any = { units, artSet, motSet, logoSet };

          let newArtSet = [...artSet];
          let newMotSet = [...motSet];
          let newLogoSet = [...logoSet];
          let newUnits = [...units];
          let updatedArtCategoryMap = { ...artCategoryMap };
          let updatedMotCategoryMap = { ...motCategoryMap };

          const targetArtCat = adminUploadCategory || (artCategories.length > 0 ? artCategories[0] : "CONCEPT");
          const targetMotCat = adminUploadCategory || (motCategories.length > 0 ? motCategories[0] : "TECH");
          const targetCharCat = adminUploadCategory || fmFact || (charCategories.length > 0 ? charCategories[0] : "HERITAGE");

          for (const fileData of data.files) {
            if (category === "ART") {
              newArtSet.push(fileData.basename);
              updatedArtCategoryMap[fileData.basename] = targetArtCat;
            } else if (category === "LOGO") {
              newLogoSet.push(fileData.basename);
            } else if (category === "MOTION") {
              newMotSet.push(fileData.basename);
              updatedMotCategoryMap[fileData.basename] = targetMotCat;
            } else if (category === "CHAR") {
              newUnits.push({
                name: fmName || "UNKNOWN",
                faction: targetCharCat,
                role: fmRole || "UNKNOWN",
                desc: fmDesc || "",
                descJp: fmDescJp || "",
                file: fileData.filename,
              });
            }
          }

          if (category === "ART") {
            setArtSet(newArtSet);
            setArtCategoryMap(updatedArtCategoryMap);
            setSelectedArt(newArtSet[newArtSet.length - 1]);
            p.artSet = newArtSet;
            p.artCategoryMap = updatedArtCategoryMap;
          } else if (category === "LOGO") {
            setLogoSet(newLogoSet);
            p.logoSet = newLogoSet;
          } else if (category === "MOTION") {
            setMotSet(newMotSet);
            setMotCategoryMap(updatedMotCategoryMap);
            p.motSet = newMotSet;
            p.motCategoryMap = updatedMotCategoryMap;
          } else if (category === "CHAR") {
            setUnits(newUnits);
            p.units = newUnits;
          }

          saveAdminData(p);
        }
      }
    } catch (e) {
      // サーバーが不在（PWA・ローカル静的環境）
      isServerUploaded = false;
    }

    // 2. サーバーが動いていない場合（PWA端末内 / オフライン）は自動で大容量ストレージ (IndexedDB & Local) へ保存
    if (!isServerUploaded) {
      try {
        setUploadMsg(`SAVING ${files.length} FILE(S) TO LOCAL STORAGE...`);

        let p: any = { units, artSet, motSet, logoSet };
        let newArtSet = [...artSet];
        let newLogoSet = [...logoSet];
        let newMotSet = [...motSet];
        let newUnits = [...units];
        let updatedArtCategoryMap = { ...artCategoryMap };
        let updatedMotCategoryMap = { ...motCategoryMap };

        const targetArtCat = adminUploadCategory || (artCategories.length > 0 ? artCategories[0] : "CONCEPT");
        const targetMotCat = adminUploadCategory || (motCategories.length > 0 ? motCategories[0] : "TECH");
        const targetCharCat = adminUploadCategory || fmFact || (charCategories.length > 0 ? charCategories[0] : "HERITAGE");

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const dataUrl = await readFileAsDataURL(file);
          const customName = (files.length === 1 && customUploadName) ? customUploadName : file.name;

          if (category === "ART") {
            newArtSet.push(dataUrl);
            updatedArtCategoryMap[dataUrl] = targetArtCat;
          } else if (category === "LOGO") {
            newLogoSet.push(dataUrl);
          } else if (category === "MOTION") {
            newMotSet.push(dataUrl);
            updatedMotCategoryMap[dataUrl] = targetMotCat;
          } else if (category === "CHAR") {
            newUnits.push({
              name: fmName || customName.replace(/\.[^/.]+$/, "") || "UNKNOWN",
              faction: targetCharCat,
              role: fmRole || "UNKNOWN",
              desc: fmDesc || "",
              descJp: fmDescJp || "",
              file: dataUrl,
            });
          }
        }

        if (category === "ART") {
          setArtSet(newArtSet);
          setArtCategoryMap(updatedArtCategoryMap);
          setSelectedArt(newArtSet[newArtSet.length - 1]);
          p.artSet = newArtSet;
          p.artCategoryMap = updatedArtCategoryMap;
        } else if (category === "LOGO") {
          setLogoSet(newLogoSet);
          p.logoSet = newLogoSet;
        } else if (category === "MOTION") {
          setMotSet(newMotSet);
          setMotCategoryMap(updatedMotCategoryMap);
          p.motSet = newMotSet;
          p.motCategoryMap = updatedMotCategoryMap;
        } else if (category === "CHAR") {
          setUnits(newUnits);
          p.units = newUnits;
        }

        saveAdminData(p);
        setUploadMsg("UPLOAD COMPLETE (SAVED TO LOCAL STORAGE)");
        setCustomUploadName("");
      } catch (localErr) {
        console.error("Local save error:", localErr);
        setUploadMsg("ERROR: FAILED TO SAVE LOCAL FILE");
      }
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
      const deletedLogoSrc = resolveLogoSrc(logoSet[index]);
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

  const [draggedAdminIndex, setDraggedAdminIndex] = useState<number | null>(null);
  const [dragOverAdminIndex, setDragOverAdminIndex] = useState<number | null>(null);

  const moveAdminItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0) return;
    let p: any = { units, artSet, motSet, logoSet };

    if (currentAdminTab === "ART") {
      if (fromIndex >= artSet.length || toIndex >= artSet.length || toIndex < 0) return;
      const arr = [...artSet];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      setArtSet(arr);
      p.artSet = arr;
      saveAdminData(p);
      setUploadMsg(`CG ART REORDERED: #${fromIndex + 1} ➔ #${toIndex + 1}`);
    } else if (currentAdminTab === "CHAR") {
      if (fromIndex >= units.length || toIndex >= units.length || toIndex < 0) return;
      const arr = [...units];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      setUnits(arr);
      if (adminSelectedCharIndex === fromIndex) {
        setAdminSelectedCharIndex(toIndex);
      } else if (adminSelectedCharIndex > fromIndex && adminSelectedCharIndex <= toIndex) {
        setAdminSelectedCharIndex(adminSelectedCharIndex - 1);
      } else if (adminSelectedCharIndex < fromIndex && adminSelectedCharIndex >= toIndex) {
        setAdminSelectedCharIndex(adminSelectedCharIndex + 1);
      }
      p.units = arr;
      saveAdminData(p);
      setUploadMsg(`CHARACTER REORDERED: #${fromIndex + 1} ➔ #${toIndex + 1}`);
    } else if (currentAdminTab === "MOTION") {
      if (fromIndex >= motSet.length || toIndex >= motSet.length || toIndex < 0) return;
      const arr = [...motSet];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      setMotSet(arr);
      p.motSet = arr;
      saveAdminData(p);
      setUploadMsg(`MOVIE REORDERED: #${fromIndex + 1} ➔ #${toIndex + 1}`);
    } else if (currentAdminTab === "LOGO") {
      if (fromIndex >= logoSet.length || toIndex >= logoSet.length || toIndex < 0) return;
      const arr = [...logoSet];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      setLogoSet(arr);
      p.logoSet = arr;
      saveAdminData(p);
      setUploadMsg(`LOGO REORDERED: #${fromIndex + 1} ➔ #${toIndex + 1}`);
    }
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
      imageScale: fmScale,
      imageOffsetY: fmOffsetY,
    };
    setUnits(arr);
    try {
      const key = fmName || arr[adminSelectedCharIndex].file;
      const savedMapStr = localStorage.getItem("space_robotman_unit_scales");
      const currentMap = savedMapStr ? JSON.parse(savedMapStr) : {};
      currentMap[key] = { scale: fmScale, offsetY: fmOffsetY };
      localStorage.setItem("space_robotman_unit_scales", JSON.stringify(currentMap));
    } catch (e) {}
    saveAdminData({ units: arr, artSet, motSet });
    setUploadMsg("METADATA & SCALE UPDATED!");
  };

  const clearCharForm = () => {
    setAdminSelectedCharIndex(-1);
    setFmName("");
    setFmFact("");
    setFmRole("");
    setFmDesc("");
    setFmDescJp("");
    setFmScale(100);
    setFmOffsetY(0);
    setAdminPreviewSrc("");
  };

  const [adminPreviewSrc, setAdminPreviewSrc] = useState("");

  const renderAdminScreen = () => {
    const currentTabCategories =
      currentAdminTab === "ART"
        ? artCategories
        : currentAdminTab === "MOTION"
        ? motCategories
        : currentAdminTab === "CHAR"
        ? charCategories
        : [];

    let allThumbsData: any[] = [];
    if (currentAdminTab === "ART")
      allThumbsData = artSet.map((d, i) => ({
        f: d.startsWith("data:") ? `LOCAL_ART_${i + 1}` : d,
        src: resolveArtSrc(d),
        rawKey: d,
        category: getItemCategory("ART", d, i),
        i,
      }));
    else if (currentAdminTab === "LOGO")
      allThumbsData = logoSet.map((d, i) => ({
        f: d.startsWith("data:") ? `LOCAL_LOGO_${i + 1}` : d,
        src: resolveLogoSrc(d),
        rawKey: d,
        category: "LOGO",
        i,
      }));
    else if (currentAdminTab === "MOTION")
      allThumbsData = motSet.map((d, i) => ({
        f: d.startsWith("data:") ? `LOCAL_MOTION_${i + 1}` : d,
        src: resolveMotSrc(d),
        rawKey: d,
        category: getItemCategory("MOTION", d, i),
        i,
      }));
    else if (currentAdminTab === "CHAR")
      allThumbsData = units.map((d, i) => ({
        f: d.name,
        src: d.file,
        rawKey: d.name,
        category: getItemCategory("CHAR", d, i),
        i,
      }));
    else if (currentAdminTab === "HOME_MEDIA") {
      allThumbsData = [
        ...artSet.map((d, i) => ({ f: d.startsWith("data:") ? `LOCAL_ART_${i + 1}` : d, src: resolveArtSrc(d), rawKey: d, category: getItemCategory("ART", d, i), i })),
        ...motSet.map((d, i) => ({ f: d.startsWith("data:") ? `LOCAL_MOTION_${i + 1}` : d, src: resolveMotSrc(d), rawKey: d, category: getItemCategory("MOTION", d, i), i })),
        ...units.map((d, i) => ({ f: d.name, src: d.file, rawKey: d.name, category: getItemCategory("CHAR", d, i), i })),
      ];
    }

    const thumbsData = allThumbsData.filter((item) => {
      if (adminCategoryFilter === "ALL" || !currentTabCategories.includes(adminCategoryFilter)) {
        return true;
      }
      return (item.category || "").toUpperCase() === adminCategoryFilter.toUpperCase();
    });

    return (
      <section
        id="admin-screen"
        className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center overflow-hidden"
      >
        <div className="w-[calc(100%-20px)] md:w-[calc(100%-40px)] h-[calc(100%-20px)] md:h-[calc(100%-40px)] max-w-[1600px] flex flex-col min-w-0 bg-[#0c0c0c] border border-[#2e2e2e] shadow-[0_0_50px_rgba(0,0,0,0.9)] p-[20px] md:p-[30px] relative">
          {/* フローを壊さない絶対配置のステータストースト（文字落ち・ズレ防止） */}
          {saveStatusMsg && (
            <div className="absolute top-[20px] md:top-[25px] right-[20px] md:right-[30px] z-50 bg-[#061e1b] border border-[var(--emerald-primary)] text-[var(--emerald-primary)] px-4 py-2 font-mono text-[12px] font-bold shadow-[0_0_25px_rgba(0,237,232,0.6)] flex items-center gap-2.5 pointer-events-none transition-all animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="w-2 h-2 rounded-full bg-[var(--emerald-primary)] shadow-[0_0_8px_var(--emerald-primary)] animate-ping"></span>
              <span>{saveStatusMsg}</span>
            </div>
          )}

          <header className="flex flex-wrap lg:flex-nowrap justify-between items-center border-b border-[#282828] shrink-0 gap-4 pb-4">
          <div className="flex items-center gap-[15px] lg:gap-[25px] min-w-0 overflow-x-auto no-scrollbar">
            <div style={{ paddingLeft: '10px' }} className="text-[#eee] font-['Orbitron'] text-[18px] md:text-[20px] tracking-widest font-bold shrink-0">
              ADMIN DASHBOARD
            </div>
            <div className="flex gap-[8px] lg:gap-[20px] shrink-0">
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors whitespace-nowrap ${currentAdminTab === "ART" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("ART");
                  clearCharForm();
                }}
              >
                <span>CG ARTWORKS</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors whitespace-nowrap ${currentAdminTab === "MOTION" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("MOTION");
                  clearCharForm();
                }}
              >
                <span>MOVIE DATA</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors whitespace-nowrap ${currentAdminTab === "CHAR" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("CHAR");
                  clearCharForm();
                }}
              >
                <span>CAST ROSTER</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors whitespace-nowrap ${currentAdminTab === "LOGO" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("LOGO");
                  clearCharForm();
                }}
              >
                <span>SYSTEM LOGO</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors whitespace-nowrap ${currentAdminTab === "OVERVIEW" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("OVERVIEW");
                  clearCharForm();
                }}
              >
                <span>OVERVIEW TEXT</span>
              </button>
              <button
                className={`border-b-[2px] !w-auto !h-[50px] font-bold text-[13px] uppercase transition-colors whitespace-nowrap ${currentAdminTab === "BACKUP" ? "border-[#fff] text-[#fff]" : "border-transparent text-[#777] hover:text-[#bbb]"}`}
                onClick={() => {
                  setCurrentAdminTab("BACKUP");
                  clearCharForm();
                }}
              >
                <span>BACKUP & RESTORE</span>
              </button>
            </div>
          </div>
          <div style={{ paddingRight: '10px' }} className="flex gap-[8px] items-center shrink-0">
            <button
              style={{ paddingLeft: '12px', paddingRight: '12px' }}
              className="mech-btn !w-auto !h-[34px] !mb-0 !text-[#eee] border-[#444] bg-[#1a1a1a] hover:bg-[#282828] hover:border-[#888] font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap"
              onClick={handleExportData}
              title="現在の全データ（作品・設定）をJSONファイルとしてダウンロード保存します"
            >
              <Download size={13} />
              <span>EXPORT JSON</span>
            </button>
            <button
              style={{ paddingLeft: '12px', paddingRight: '12px' }}
              className="mech-btn !w-auto !h-[34px] !mb-0 !text-[#eee] border-[#444] bg-[#1a1a1a] hover:bg-[#282828] hover:border-[#888] font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap"
              onClick={() => jsonFileInputRef.current?.click()}
              title="バックアップしたJSONファイルを選択して復元・インポートします"
            >
              <Upload size={13} />
              <span>IMPORT JSON</span>
            </button>
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImportFile(e.target.files[0]);
                }
              }}
            />
            <button
              style={{ paddingLeft: '14px', paddingRight: '14px' }}
              className={`mech-btn !w-auto !h-[34px] !mb-0 font-bold text-[12px] whitespace-nowrap transition-all duration-300 ${
                saveStatusMsg
                  ? "border-[var(--emerald-primary)] bg-[#042421] !text-[var(--emerald-primary)] shadow-[0_0_15px_rgba(0,237,232,0.4)]"
                  : "!text-[#eee] border-[#666] bg-[#222] hover:bg-[#333] hover:border-[#888]"
              }`}
              onClick={() => saveAdminData()}
            >
              <span>{saveStatusMsg ? "✓ SAVED" : "SAVE JSON DATA"}</span>
            </button>
            <button
              style={{ paddingLeft: '14px', paddingRight: '14px' }}
              className="mech-btn !w-auto !h-[34px] !mb-0 text-[#888] border-[#333] bg-[#141414] hover:bg-[#202020] hover:text-[#ccc] font-bold text-[12px] whitespace-nowrap"
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
            <div className="flex-1 flex flex-col gap-[14px] p-[10px] pr-[20px] h-full min-h-0">
              {/* Top Bar: Container Width Setting */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] border border-[#2c2c2c] px-4 py-2.5 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-['Orbitron'] text-[12px] text-white tracking-widest font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--emerald-primary)] shadow-[0_0_8px_var(--emerald-primary)]"></span>
                    <span>OVERVIEW DISPLAY WIDTH // コンテナ表示幅</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#888]">
                    （フルスクリーン・大画面時の横幅を調整できます）
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-[#0c0c0c] border border-[#2a2a2a] p-1">
                    {[
                      { label: "896px (標準)", value: "896px" },
                      { label: "1050px (中)", value: "1050px" },
                      { label: "1200px (広め)", value: "1200px" },
                      { label: "1400px (ワイド)", value: "1400px" },
                      { label: "1600px (特大)", value: "1600px" },
                      { label: "100% (全幅)", value: "100%" },
                    ].map((preset) => {
                      const isActive = (adminStoryStyle.overviewMaxWidth || "896px") === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            setAdminStoryStyle((prev) => ({
                              ...prev,
                              overviewMaxWidth: preset.value,
                            }));
                            setStoryStyle((prev) => ({
                              ...prev,
                              overviewMaxWidth: preset.value,
                            }));
                          }}
                          className={`px-2.5 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[var(--emerald-primary)] text-black shadow-sm"
                              : "text-[#888] hover:text-[#eee] hover:bg-[#222]"
                          }`}
                          title={`横幅を ${preset.value} に設定`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* カスタム幅入力 */}
                  <div className="flex items-center gap-1.5 bg-[#0c0c0c] border border-[#2a2a2a] px-2 py-1">
                    <span className="text-[10px] text-[#777] font-mono">CUSTOM:</span>
                    <input
                      type="text"
                      className="w-20 bg-[#161616] border border-[#333] text-white text-[11px] font-mono px-2 py-0.5 outline-none text-center focus:border-[var(--emerald-primary)]"
                      value={adminStoryStyle.overviewMaxWidth || "896px"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdminStoryStyle((prev) => ({
                          ...prev,
                          overviewMaxWidth: val,
                        }));
                        setStoryStyle((prev) => ({
                          ...prev,
                          overviewMaxWidth: val,
                        }));
                      }}
                      placeholder="例: 1350px"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Columns: JP, EN, ABOUT */}
              <div className="flex-1 flex gap-[20px] min-h-0">
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
          </div>
          ) : currentAdminTab === "BACKUP" ? (
            <div className="flex-1 flex flex-col gap-[20px] p-[10px] md:p-[24px] h-full overflow-y-auto">
              <div className="flex flex-col gap-1 border-b border-[#242424] pb-4">
                <div className="text-[#eee] font-['Orbitron'] text-[18px] tracking-widest font-bold flex items-center gap-2.5">
                  <Database size={20} className="text-[#888]" />
                  <span>SYSTEM ARCHIVE BACKUP & RESTORE PROTOCOL</span>
                </div>
                <div className="text-[#888] text-[12px] font-mono">
                  全作品データ（19機体スペック、CGアート、モーション動画、設定ストーリー、ロゴ、表示設定）を1つのJSONファイルとして端末へダウンロード保存、または過去のバックアップファイルからワンクリックで復元します。
                </div>
              </div>

              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-[#101010] border border-[#262626] p-3 flex flex-col gap-1">
                  <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">UNIT ARCHIVES</span>
                  <span className="text-[#fff] text-[18px] font-mono font-bold">{units.length} UNITS</span>
                </div>
                <div className="bg-[#101010] border border-[#262626] p-3 flex flex-col gap-1">
                  <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">CG ARTWORKS</span>
                  <span className="text-[#fff] text-[18px] font-mono font-bold">{artSet.length} ARTS</span>
                </div>
                <div className="bg-[#101010] border border-[#262626] p-3 flex flex-col gap-1">
                  <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">MOVIE DATA</span>
                  <span className="text-[#fff] text-[18px] font-mono font-bold">{motSet.length} CLIPS</span>
                </div>
                <div className="bg-[#101010] border border-[#262626] p-3 flex flex-col gap-1">
                  <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">LOGO SET</span>
                  <span className="text-[#fff] text-[18px] font-mono font-bold">{logoSet.length} LOGOS</span>
                </div>
                <div className="bg-[#101010] border border-[#262626] p-3 flex flex-col gap-1">
                  <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">WORLDVIEW</span>
                  <span className="text-[#fff] text-[18px] font-mono font-bold">{storyJp.length} / {storyEn.length} L</span>
                </div>
                <div className="bg-[#101010] border border-[#262626] p-3 flex flex-col gap-1">
                  <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">STORAGE STATUS</span>
                  <span className="text-[#00ffaa] text-[13px] font-mono font-bold tracking-tight">SAVED LOCALLY</span>
                </div>
              </div>

              {/* Main 2-Column Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* EXPORT CARD */}
                <div className="bg-[#121212] border border-[#2c2c2c] p-5 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#fff] font-['Orbitron'] font-bold text-[14px] tracking-wider">
                      <Download size={16} className="text-[#888]" />
                      <span>EXPORT BACKUP DATA (エクスポート)</span>
                    </div>
                    <p className="text-[#888] text-[12px] font-mono leading-relaxed">
                      現在アプリに登録されている全ての機体・画像・動画・テキスト設定をまとめた最新のJSONバックアップファイルを端末にダウンロード保存します。
                    </p>
                    <div className="text-[11px] text-[#666] font-mono">
                      * 出力形式: space-robotman-backup-YYYY-MM-DD.json<br />
                      * PWAオフライン環境でもそのままローカル保存が可能です。
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-[#222]">
                    <button
                      className="mech-btn !w-auto !h-[38px] !mb-0 !text-[#000] !bg-[#fff] border-[#fff] hover:!bg-[#ddd] px-5 font-bold text-[12px] flex items-center gap-2"
                      onClick={handleExportData}
                    >
                      <Download size={14} />
                      <span>DOWNLOAD BACKUP FILE (.JSON)</span>
                    </button>
                    <button
                      className="mech-btn !w-auto !h-[38px] !mb-0 !text-[#ccc] border-[#444] bg-[#1a1a1a] hover:bg-[#252525] px-4 font-bold text-[11px] flex items-center gap-2"
                      onClick={handleCopyJsonToClipboard}
                    >
                      {copiedBackup ? <Check size={14} className="text-[#00ffaa]" /> : <Copy size={14} />}
                      <span>{copiedBackup ? "COPIED TO CLIPBOARD!" : "COPY JSON TO CLIPBOARD"}</span>
                    </button>
                  </div>
                </div>

                {/* IMPORT CARD */}
                <div className="bg-[#121212] border border-[#2c2c2c] p-5 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#fff] font-['Orbitron'] font-bold text-[14px] tracking-wider">
                      <Upload size={16} className="text-[#888]" />
                      <span>IMPORT BACKUP DATA (インポート / 復元)</span>
                    </div>
                    <p className="text-[#888] text-[12px] font-mono leading-relaxed">
                      以前エクスポートしたバックアップJSONファイルを読み込み、作品データや設定を即座にアプリ全体へ復元・同期します。
                    </p>
                  </div>

                  {/* Dropzone */}
                  <div
                    className="h-[120px] border border-dashed border-[#3e3e3e] bg-[#0c0c0c] flex flex-col items-center justify-center text-center text-[#777] cursor-pointer p-4 hover:border-[#777] transition-colors gap-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleImportFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => jsonFileInputRef.current?.click()}
                  >
                    <FileJson size={28} className="text-[#555]" />
                    <div className="text-[12px] text-[#ccc] font-mono font-bold">
                      CLICK TO SELECT FILE OR DRAG & DROP .JSON HERE
                    </div>
                    <div className="text-[10px] text-[#666] font-mono">
                      (対応形式: space-robotman-backup-*.json または同等データ)
                    </div>
                  </div>
                </div>
              </div>

              {/* ADMIN PIN CONFIGURATION */}
              <div className="bg-[#101010] border border-[#222] p-4 flex flex-col gap-3 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1c1c] pb-2.5">
                  <div className="flex items-center gap-2 text-[#eee] text-[13px] font-mono font-bold">
                    <Lock size={15} className="text-[#aaa]" />
                    <span>ADMIN PASSCODE CONFIGURATION (管理者暗証番号の設定)</span>
                  </div>
                  <div className="text-[11px] text-[#777] font-mono">
                    CURRENT PIN: <span className="text-[#00ffcc] font-bold tracking-[2px]">{adminPin || "0000"}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#888] font-mono leading-relaxed">
                  トップ画面から管理画面へ入る際に要求される4桁の暗証番号を設定します。（初期値: <span className="text-white font-bold">0000</span>）
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#333] px-3 py-1.5">
                    <span className="text-[11px] text-[#666] font-mono">NEW 4-DIGIT PIN:</span>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="例: 1234"
                      className="bg-transparent text-white font-mono text-center tracking-[4px] text-[14px] w-[90px] focus:outline-none placeholder:text-[#444] placeholder:tracking-normal"
                      value={newAdminPinInput}
                      onChange={(e) => setNewAdminPinInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                    />
                  </div>
                  <button
                    className="mech-btn !w-auto !h-[36px] !mb-0 text-[#fff] border-[#555] bg-[#1c1c1c] hover:bg-[#282828] hover:border-[#888] px-4 font-bold text-[11px] flex items-center gap-1.5"
                    onClick={() => handleUpdateAdminPin(newAdminPinInput)}
                  >
                    <Check size={13} />
                    <span>UPDATE PIN (暗証番号を変更)</span>
                  </button>
                  {pinChangeSuccessMsg && (
                    <div className="text-[11px] text-[#00ffcc] font-mono font-bold animate-fade-in">
                      {pinChangeSuccessMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* FACTORY RESET & SAFETY SECTION */}
              <div className="bg-[#101010] border border-[#222] p-4 flex flex-wrap items-center justify-between gap-4 mt-2">
                <div className="flex flex-col gap-1 max-w-xl">
                  <div className="text-[#ccc] text-[12px] font-mono font-bold flex items-center gap-2">
                    <RefreshCw size={14} className="text-[#777]" />
                    <span>RESTORE FACTORY DEFAULT DATA (初期データ再構築)</span>
                  </div>
                  <div className="text-[#666] text-[11px] font-mono">
                    手動変更を破棄して、同梱されているオリジナルの作品データ（全19機体・全アート・全モーション）に戻したい場合はこちらを実行します。
                  </div>
                </div>
                <button
                  className="mech-btn !w-auto !h-[34px] !mb-0 text-[#aaa] border-[#444] bg-[#181818] hover:bg-[#252525] hover:text-[#fff] px-4 font-bold text-[11px]"
                  onClick={handleResetToDefault}
                >
                  <span>RESET TO FACTORY DEFAULT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-[20px] w-full h-full min-h-0 pb-4">
              {/* LEFT SIDEBAR: UPLOAD/FORM */}
              <div className="w-[340px] border-r border-[#2a2a2a] flex flex-col gap-[20px] pr-[20px] overflow-y-auto shrink-0">
                <div className="flex flex-col gap-[8px]">
                  <div style={{ paddingLeft: '10px' }} className="text-[#888] font-['Orbitron'] font-bold text-[10px] tracking-wide uppercase">Target Category</div>
                  <div style={{ marginLeft: '0px', paddingLeft: '10px' }} className="bg-[#151515] text-[#ccc] border border-[#2e2e2e] p-[10px] text-[13px] font-bold font-mono tracking-widest select-none">
                    {currentAdminTab === "ART" && "CG ARTWORKS"}
                    {currentAdminTab === "MOTION" && "MOVIE DATA"}
                    {currentAdminTab === "CHAR" && "CAST ROSTER"}
                    {currentAdminTab === "LOGO" && "SYSTEM LOGO"}
                  </div>

                  {currentTabCategories.length > 0 && (
                    <div className="bg-[#101010] border border-[#262626] p-2.5 flex flex-col gap-1.5 mt-1">
                      <div className="text-[9px] font-mono text-[#888] flex justify-between items-center">
                        <span>UPLOAD ASSIGN CATEGORY:</span>
                        <span className="text-[#00ffcc] font-bold">
                          {adminUploadCategory || currentTabCategories[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentTabCategories.map((cat) => {
                          const isSelected = (adminUploadCategory || currentTabCategories[0]) === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setAdminUploadCategory(cat)}
                              className={`px-2 py-1 text-[9px] font-mono font-bold border transition-colors ${
                                isSelected
                                  ? "bg-[var(--emerald-primary)] text-black border-[var(--emerald-primary)]"
                                  : "bg-[#181818] text-[#888] border-[#333] hover:text-white hover:border-[#555]"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

                    {/* TERMINAL IMAGE SIZE & POSITION TUNER */}
                    <div className="border-t border-[#222] pt-2 mt-1 flex flex-col gap-2 bg-[#0c0c0c] p-2.5 border border-[#1e1e1e]">
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#888]">
                        <span className="text-[#ccc] font-bold">TERMINAL IMAGE SIZE (下切れ防止)</span>
                        <span className="text-white font-bold bg-[#181818] px-1.5 py-0.5 border border-[#333]">{fmScale}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={40}
                          max={160}
                          step={5}
                          value={fmScale}
                          onChange={(e) => setFmScale(Number(e.target.value))}
                          className="flex-1 accent-white h-1.5 bg-[#222] cursor-pointer"
                        />
                        <div className="flex items-center gap-1">
                          {([100, 90, 80, 75] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFmScale(p)}
                              className={`px-1.5 py-0.5 text-[8px] font-mono border transition-colors ${
                                fmScale === p
                                  ? "border-white bg-white text-black font-bold"
                                  : "border-[#333] text-[#777] hover:text-white hover:border-[#555]"
                              }`}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-[#888] pt-1">
                        <span className="text-[#aaa]">VERTICAL SHIFT (上下移動)</span>
                        <span className="text-white font-bold bg-[#181818] px-1.5 py-0.5 border border-[#333]">{fmOffsetY}px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={-60}
                          max={60}
                          step={4}
                          value={fmOffsetY}
                          onChange={(e) => setFmOffsetY(Number(e.target.value))}
                          className="flex-1 accent-white h-1.5 bg-[#222] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setFmOffsetY(0)}
                          className="px-2 py-0.5 text-[8px] font-mono border border-[#333] text-[#777] hover:text-white hover:border-[#555]"
                        >
                          CENTER
                        </button>
                      </div>
                    </div>

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

                    {/* GLOBAL UNIT SCALE SLIDER (全機体一括縮小/拡大) */}
                    <div className="border-t border-[#262626] pt-2.5 mt-2 flex flex-col gap-2 bg-[#0d0d0d] p-2.5 border border-[#222]">
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#888]">
                        <span className="text-[#eee] font-bold">ALL UNITS GLOBAL SCALE (全体一括倍率)</span>
                        <span className="text-white font-bold bg-[#181818] px-1.5 py-0.5 border border-[#333]">
                          {globalUnitScale}%
                        </span>
                      </div>
                      <div className="text-[8px] font-mono text-[#666]">
                        個別設定された縦切れ調整を維持したまま、全機体を一括で80%や90%へ縮小できます。
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={50}
                          max={130}
                          step={5}
                          value={globalUnitScale}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGlobalUnitScale(val);
                            saveToLocalData({ globalUnitScale: val });
                            fetch("/api/update_data", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ globalUnitScale: val }),
                            }).catch(() => {});
                          }}
                          className="flex-1 accent-white h-1.5 bg-[#222] cursor-pointer"
                        />
                        <div className="flex items-center gap-1">
                          {([100, 95, 90, 85, 80] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setGlobalUnitScale(p);
                                saveToLocalData({ globalUnitScale: p });
                                fetch("/api/update_data", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ globalUnitScale: p }),
                                }).catch(() => {});
                              }}
                              className={`px-1.5 py-0.5 text-[8px] font-mono border transition-colors ${
                                globalUnitScale === p
                                  ? "border-white bg-white text-black font-bold"
                                  : "border-[#333] text-[#777] hover:text-white hover:border-[#555]"
                              }`}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* LIVE SAMPLE PREVIEW (小型リアルタイム検証ボックス) */}
                      {units.length > 0 && (
                        <div className="mt-1 bg-[#080808] border border-[#222] p-2 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[8px] font-mono">
                            <span className="text-[#888]">SAMPLE PREVIEW (検証機体):</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="px-1 py-0.5 bg-[#1a1a1a] hover:bg-[#282828] border border-[#333] text-[#aaa] hover:text-white text-[8px] transition-colors cursor-pointer"
                                onClick={() => {
                                  const total = units.length;
                                  const nextIdx = (adminSelectedCharIndex <= 0 ? total - 1 : adminSelectedCharIndex - 1);
                                  setAdminSelectedCharIndex(nextIdx);
                                  const u = units[nextIdx];
                                  setAdminPreviewSrc(u.file || "");
                                  setFmName(u.name || "");
                                  setFmFact(u.faction || "");
                                  setFmRole(u.role || "");
                                  setFmDesc(u.desc || "");
                                  setFmDescJp(u.descJp || "");
                                  setFmScale(getUnitScale(u));
                                  setFmOffsetY(getUnitOffsetY(u));
                                }}
                                title="前の機体"
                              >
                                ◀
                              </button>
                              <span className="text-white font-bold max-w-[110px] truncate text-[9px]">
                                {units[adminSelectedCharIndex >= 0 ? adminSelectedCharIndex : 0]?.name}
                              </span>
                              <button
                                type="button"
                                className="px-1 py-0.5 bg-[#1a1a1a] hover:bg-[#282828] border border-[#333] text-[#aaa] hover:text-white text-[8px] transition-colors cursor-pointer"
                                onClick={() => {
                                  const total = units.length;
                                  const nextIdx = (adminSelectedCharIndex >= total - 1 ? 0 : adminSelectedCharIndex + 1);
                                  setAdminSelectedCharIndex(nextIdx);
                                  const u = units[nextIdx];
                                  setAdminPreviewSrc(u.file || "");
                                  setFmName(u.name || "");
                                  setFmFact(u.faction || "");
                                  setFmRole(u.role || "");
                                  setFmDesc(u.desc || "");
                                  setFmDescJp(u.descJp || "");
                                  setFmScale(getUnitScale(u));
                                  setFmOffsetY(getUnitOffsetY(u));
                                }}
                                title="次の機体"
                              >
                                ▶
                              </button>
                            </div>
                          </div>
                          
                          <div className="relative w-full h-[120px] bg-[#030303] border border-[#1a1a1a] flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-2 border border-dashed border-[#1c1c1c] pointer-events-none flex items-start justify-end p-0.5">
                              <span className="text-[7px] font-mono text-[#333]">100% REF</span>
                            </div>
                            <img
                              src={
                                (adminSelectedCharIndex >= 0 && units[adminSelectedCharIndex]?.file)
                                  ? units[adminSelectedCharIndex].file
                                  : units[0]?.file
                              }
                              alt="Sample Unit"
                              style={{
                                transform: `scale(${((fmScale / 100) * (globalUnitScale / 100))}) translateY(${fmOffsetY}px)`,
                                transition: "transform 0.15s ease-out",
                              }}
                              className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.06)]"
                            />
                          </div>

                          <div className="flex justify-between items-center text-[8px] font-mono text-[#777] px-0.5">
                            <span>個別: {fmScale}% × 全体: {globalUnitScale}%</span>
                            <span className="text-[#00ffcc] font-bold">
                              実効: {Math.round((fmScale * globalUnitScale) / 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentTabCategories.length > 0 && (
                  <div className="mt-auto flex flex-col gap-[8px] text-[11px] bg-[#141414] border border-[#262626] p-[12px] shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--emerald-primary)] font-['Orbitron'] text-[11px] font-bold tracking-wider">
                        CATEGORY MANAGER
                      </span>
                      <span className="text-[9px] font-mono text-[#666]">
                        {currentTabCategories.length} CATEGORIES
                      </span>
                    </div>

                    {/* Category list with edit and delete */}
                    <div className="flex flex-col gap-1.5 py-1 max-h-[140px] overflow-y-auto pr-0.5">
                      {currentTabCategories.map((cat) => {
                        const isEditing = editingCatName === cat;
                        const isConfirmingDelete = deleteConfirmCat === cat;

                        if (isEditing) {
                          return (
                            <div key={cat} className="flex items-center gap-1 bg-[#1c1c1c] border border-[var(--emerald-primary)] p-1">
                              <input
                                type="text"
                                autoFocus
                                className="flex-1 bg-[#0a0a0a] text-white border border-[#444] px-1.5 py-0.5 text-[10px] font-mono uppercase outline-none focus:border-[var(--emerald-primary)]"
                                value={editingCatValue}
                                onChange={(e) => setEditingCatValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && editingCatValue.trim()) {
                                    handleRenameCategory(currentAdminTab as any, cat, editingCatValue);
                                  } else if (e.key === "Escape") {
                                    setEditingCatName(null);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingCatValue.trim()) {
                                    handleRenameCategory(currentAdminTab as any, cat, editingCatValue);
                                  }
                                }}
                                className="px-2 py-0.5 bg-[#00ffcc] text-black text-[9px] font-bold font-mono hover:bg-[#33ffdd] cursor-pointer"
                                title="保存"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCatName(null)}
                                className="px-1.5 py-0.5 bg-[#222] text-[#888] text-[9px] font-mono hover:text-white cursor-pointer"
                                title="キャンセル"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={cat}
                            className="flex items-center justify-between bg-[#181818] border border-[#2e2e2e] hover:border-[#444] px-2 py-1 transition-colors group"
                          >
                            <span className="text-[10px] font-mono font-bold text-[#ddd] truncate mr-1">
                              {cat}
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Rename button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatName(cat);
                                  setEditingCatValue(cat);
                                  setDeleteConfirmCat(null);
                                }}
                                className="text-[#888] hover:text-[#00ffcc] text-[9px] px-1 py-0.5 hover:bg-[#252525] rounded transition-colors cursor-pointer"
                                title="カテゴリー名を編集"
                              >
                                ✎
                              </button>

                              {/* Delete button with in-UI confirmation */}
                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-0.5 bg-[#331111] px-1 py-0.2 border border-[#661111]">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(currentAdminTab as any, cat)}
                                    className="text-[#ff4444] font-bold text-[8px] font-mono hover:underline cursor-pointer"
                                    title="本当に削除する"
                                  >
                                    DEL?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmCat(null)}
                                    className="text-[#888] text-[8px] font-mono hover:text-white cursor-pointer pl-1"
                                    title="取り消し"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmCat(cat)}
                                  className="text-[#666] hover:text-[#ff4444] text-[9px] px-1 py-0.5 hover:bg-[#252525] rounded transition-colors cursor-pointer"
                                  title="削除"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add new Category */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        placeholder="NEW CATEGORY NAME"
                        className="flex-1 bg-[#0a0a0a] text-white border border-[#333] px-2 py-1 text-[10px] font-mono uppercase outline-none focus:border-[var(--emerald-primary)]"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newCategoryInput.trim()) {
                            handleAddCategory(currentAdminTab as any, newCategoryInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryInput.trim()) {
                            handleAddCategory(currentAdminTab as any, newCategoryInput);
                          }
                        }}
                        disabled={!newCategoryInput.trim()}
                        className="px-2.5 py-1 bg-[#222] hover:bg-[#333] disabled:opacity-30 text-[#00ffcc] border border-[#444] text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT MAIN PANEL */}
              <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* CATEGORY FILTER BAR */}
                {currentTabCategories.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#141414] border-b border-[#242424] text-[11px] font-mono shrink-0 select-none">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[#888] font-bold mr-1 text-[10px] tracking-wider uppercase font-['Orbitron']">
                        CATEGORY FILTER:
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminCategoryFilter("ALL")}
                        className={`px-2.5 py-1 text-[10px] font-bold font-mono transition-colors border cursor-pointer ${
                          adminCategoryFilter === "ALL" || !currentTabCategories.includes(adminCategoryFilter)
                            ? "bg-[var(--emerald-primary)] text-black border-[var(--emerald-primary)]"
                            : "bg-[#1f1f1f] text-[#aaa] border-[#333] hover:text-white hover:border-[#555]"
                        }`}
                      >
                        ALL ({allThumbsData.length})
                      </button>
                      {currentTabCategories.map((cat) => {
                        const count = allThumbsData.filter((item) => (item.category || "").toUpperCase() === cat.toUpperCase()).length;
                        const isSelected = adminCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setAdminCategoryFilter(cat)}
                            className={`px-2.5 py-1 text-[10px] font-bold font-mono transition-colors border cursor-pointer ${
                              isSelected
                                ? "bg-[var(--emerald-primary)] text-black border-[var(--emerald-primary)]"
                                : "bg-[#1a1a1a] text-[#aaa] border-[#333] hover:text-white hover:border-[#555]"
                            }`}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-[9px] text-[#888] font-mono">
                      SHOWING <strong className="text-white">{thumbsData.length}</strong> / {allThumbsData.length}
                    </div>
                  </div>
                )}

                {/* GALLERY REORDER BAR */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#121212] border-b border-[#2a2a2a] text-[10px] font-mono shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[#888] font-['Orbitron'] font-bold tracking-wider">
                      SEQUENCE REORDER:
                    </span>
                    <span className="text-[#00ffcc] font-bold">
                      {thumbsData.length} ITEMS
                    </span>
                    <span className="text-[#444] hidden sm:inline">//</span>
                    <span className="text-[#888] text-[9px] hidden sm:inline">
                      ドラッグ＆ドロップ または [◀][▶] で並べ替え（カテゴリー変更はカード下部のCATで即座に変更可能）
                    </span>
                  </div>
                  <div className="text-[9px] text-[#00ffcc] font-mono tracking-widest hidden md:block">
                    AUTO PERSISTED
                  </div>
                </div>

                {/* GALLERY TOP AREA */}
                <div className="min-h-[220px] max-h-[290px] shrink-0 overflow-y-auto content-start flex flex-wrap gap-[12px] p-[10px] bg-[#0a0a0a]">
                  {thumbsData.map((item, idx) => (
                    <div
                      key={item.i}
                      draggable={currentAdminTab !== "HOME_MEDIA"}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(item.i));
                        setDraggedAdminIndex(item.i);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDragEnter={() => setDragOverAdminIndex(item.i)}
                      onDragLeave={() => {
                        if (dragOverAdminIndex === item.i) setDragOverAdminIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromStr = e.dataTransfer.getData("text/plain");
                        const from = Number(fromStr);
                        if (!isNaN(from) && from !== item.i) {
                          moveAdminItem(from, item.i);
                        }
                        setDraggedAdminIndex(null);
                        setDragOverAdminIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedAdminIndex(null);
                        setDragOverAdminIndex(null);
                      }}
                      className={`w-[130px] bg-[#161616] border relative cursor-pointer group transition-all flex flex-col select-none ${
                        draggedAdminIndex === item.i
                          ? "opacity-40 border-[#00ffcc] scale-95"
                          : dragOverAdminIndex === item.i
                          ? "border-[#00ffcc] bg-[#112420] shadow-[0_0_12px_rgba(0,255,204,0.4)] scale-105 z-20"
                          : "border-[#2e2e2e] hover:border-[#666]"
                      }`}
                      onClick={() => {
                        setAdminPreviewSrc(item.src);
                        if (currentAdminTab === "CHAR") {
                          setAdminSelectedCharIndex(item.i);
                          setFmName(units[item.i].name || "");
                          setFmFact(units[item.i].faction || "");
                          setFmRole(units[item.i].role || "");
                          setFmDesc(units[item.i].desc || "");
                          setFmDescJp(units[item.i].descJp || "");
                          setFmScale(getUnitScale(units[item.i]));
                          setFmOffsetY(getUnitOffsetY(units[item.i]));
                        } else if (currentAdminTab === "LOGO") {
                          // logo selection handled below
                        }
                      }}
                    >
                      <div className="w-full h-[84px] bg-[#000] relative overflow-hidden">
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

                        {/* Order Sequence Badge */}
                        <div className="absolute top-1 left-1 bg-black/85 border border-[#3a3a3a] px-1 py-0.2 text-[8px] font-mono text-[#00ffcc] font-bold tracking-wider z-10">
                          #{String(item.i + 1).padStart(2, "0")}
                        </div>

                        {/* Delete Button */}
                        <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            className="text-[9px] font-bold bg-[#b00]/90 hover:bg-[#f00] text-white border border-[#400] rounded-full cursor-pointer w-[20px] h-[20px] flex items-center justify-center shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAdminItem(item.i);
                            }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Item label */}
                      <div className="bg-[#121212] text-[#aaa] text-[9px] px-[6px] py-[3px] font-bold tracking-widest text-center uppercase border-t border-[#262626] truncate" title={item.f}>
                        {item.f}
                      </div>

                      {/* Category Switcher Dropdown */}
                      {currentTabCategories.length > 0 && (
                        <div className="px-[4px] py-[2px] bg-[#0e0e0e] border-t border-[#222] flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[7px] font-mono text-[#666]">CAT:</span>
                          <select
                            className="flex-1 bg-[#1a1a1a] text-[#00ffcc] border border-[#333] text-[8px] font-mono font-bold px-1 py-0.5 outline-none cursor-pointer focus:border-[var(--emerald-primary)] truncate"
                            value={item.category || currentTabCategories[0]}
                            onChange={(e) => {
                              handleAssignItemCategory(currentAdminTab as any, item.rawKey, e.target.value);
                            }}
                          >
                            {currentTabCategories.map((c) => (
                              <option key={c} value={c} className="bg-[#111] text-white">
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Reorder Buttons (Move left / right) */}
                      {currentAdminTab !== "HOME_MEDIA" && (
                        <div className="grid grid-cols-2 gap-1 p-[3px] bg-[#0d0d0d] border-t border-[#222]" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={item.i === 0}
                            onClick={() => moveAdminItem(item.i, item.i - 1)}
                            className="text-[9px] py-0.5 bg-[#1a1a1a] hover:bg-[#2e2e2e] disabled:opacity-20 disabled:hover:bg-[#1a1a1a] text-[#ccc] hover:text-white border border-[#333] flex items-center justify-center font-mono font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title="前へ移動 (◀)"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            disabled={item.i === allThumbsData.length - 1}
                            onClick={() => moveAdminItem(item.i, item.i + 1)}
                            className="text-[9px] py-0.5 bg-[#1a1a1a] hover:bg-[#2e2e2e] disabled:opacity-20 disabled:hover:bg-[#1a1a1a] text-[#ccc] hover:text-white border border-[#333] flex items-center justify-center font-mono font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title="次へ移動 (▶)"
                          >
                            ▶
                          </button>
                        </div>
                      )}

                      {currentAdminTab === "LOGO" && (
                         <div className="p-[4px] border-t border-[#2e2e2e]">
                           <button 
                             className={`w-full text-[8px] border py-[3px] font-bold uppercase transition-colors ${
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
                     <div className="w-full h-full min-h-[140px] flex items-center justify-center text-[#555] font-['Orbitron'] tracking-widest">
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
                    {(() => {
                      const effectivePreviewSrc = adminPreviewSrc || (currentAdminTab === "CHAR" ? (units[adminSelectedCharIndex >= 0 ? adminSelectedCharIndex : 0]?.file || "") : "");
                      if (!effectivePreviewSrc) {
                        return (
                          <span className="text-[#333] font-['Orbitron'] text-[14px] tracking-widest font-bold">SELECT MEDIA TO PREVIEW</span>
                        );
                      }
                      if (effectivePreviewSrc.endsWith(".mp4") || effectivePreviewSrc.endsWith(".webm")) {
                        return (
                          <video
                            src={effectivePreviewSrc}
                            controls
                            autoPlay
                            className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                          />
                        );
                      }
                      return (
                        <div className="relative w-full h-full p-[20px] flex items-center justify-center overflow-hidden">
                          {currentAdminTab === "CHAR" && (
                            <>
                              <div className="absolute inset-4 border border-dashed border-[#222] pointer-events-none flex items-start justify-start p-1.5">
                                <span className="text-[8px] font-mono text-[#444] tracking-widest">100% BASELINE FRAME</span>
                              </div>
                              <div className="absolute top-2 right-2 bg-[#0d0d0d]/90 border border-[#333] px-2.5 py-1 flex items-center gap-2 text-[9px] font-mono shadow-md z-10 pointer-events-none">
                                <span className="text-[#888]">UNIT: <strong className="text-white">{units[adminSelectedCharIndex >= 0 ? adminSelectedCharIndex : 0]?.name || "SAMPLE"}</strong></span>
                                <span className="text-[#444]">|</span>
                                <span className="text-[#888]">INDIVIDUAL: <strong className="text-[#ccc]">{fmScale}%</strong></span>
                                <span className="text-[#444]">×</span>
                                <span className="text-[#888]">GLOBAL: <strong className="text-[var(--emerald-primary)]">{globalUnitScale}%</strong></span>
                                <span className="text-[#444]">=</span>
                                <span className="text-[#00ffcc] font-bold">NET: {Math.round((fmScale * globalUnitScale) / 100)}%</span>
                                <span className="text-[#444]">|</span>
                                <span className="text-[#888]">OFFSET Y: <strong className="text-white">{fmOffsetY}px</strong></span>
                              </div>
                            </>
                          )}
                          <img
                            src={effectivePreviewSrc}
                            style={
                              currentAdminTab === "CHAR"
                                ? {
                                    transform: `scale(${((fmScale / 100) * (globalUnitScale / 100))}) translateY(${fmOffsetY}px)`,
                                    transition: "transform 0.15s ease-out",
                                  }
                                : undefined
                            }
                            className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* IMPORT CONFIRMATION MODAL */}
        {importPendingData && (
          <div className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-[#444] shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-lg w-full p-6 flex flex-col gap-4 font-mono">
              <div className="flex items-center gap-2 text-[#fff] font-['Orbitron'] font-bold text-[16px] border-b border-[#2e2e2e] pb-3">
                <Upload size={18} className="text-[#eee]" />
                <span>CONFIRM DATA RESTORATION</span>
              </div>
              <div className="text-[12px] text-[#aaa] leading-relaxed">
                バックアップファイル <span className="text-[#fff] font-bold">「{importFileName}」</span> の内容をシステムにインポートして適用しますか？
              </div>
              <div className="bg-[#0a0a0a] border border-[#262626] p-4 text-[12px] text-[#ccc] flex flex-col gap-2">
                <div className="flex justify-between border-b border-[#1a1a1a] pb-1">
                  <span className="text-[#777]">UNIT ARCHIVES (機体数):</span>
                  <span className="font-bold text-[#fff]">{Array.isArray(importPendingData.units) ? importPendingData.units.length : 0} UNITS</span>
                </div>
                <div className="flex justify-between border-b border-[#1a1a1a] pb-1">
                  <span className="text-[#777]">CG ARTWORKS (アート):</span>
                  <span className="font-bold text-[#fff]">{Array.isArray(importPendingData.artSet) ? importPendingData.artSet.length : 0} ITEMS</span>
                </div>
                <div className="flex justify-between border-b border-[#1a1a1a] pb-1">
                  <span className="text-[#777]">MOVIE DATA (動画):</span>
                  <span className="font-bold text-[#fff]">{Array.isArray(importPendingData.motSet) ? importPendingData.motSet.length : 0} CLIPS</span>
                </div>
                <div className="flex justify-between border-b border-[#1a1a1a] pb-1">
                  <span className="text-[#777]">LOGO ASSETS (ロゴ):</span>
                  <span className="font-bold text-[#fff]">{Array.isArray(importPendingData.logoSet) ? importPendingData.logoSet.length : 0} LOGOS</span>
                </div>
                <div className="flex justify-between border-b border-[#1a1a1a] pb-1">
                  <span className="text-[#777]">SYSTEM LOGO:</span>
                  <span className="font-bold text-[#fff] truncate max-w-[200px]">{importPendingData.systemLogo || "DEFAULT"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777]">EXPORTED DATE:</span>
                  <span className="font-bold text-[#888]">{importPendingData.exportedAt || "UNKNOWN"}</span>
                </div>
              </div>
              <div className="text-[11px] text-[#ff9966]">
                ※ 適用すると、現在登録されている作品データが上記バックアップの内容に更新され、端末のローカル領域へ保存されます。
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="mech-btn !w-auto !h-[36px] !mb-0 text-[#888] border-[#333] hover:text-[#eee] px-4 font-bold text-[12px]"
                  onClick={() => {
                    setImportPendingData(null);
                    setImportFileName("");
                    if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
                  }}
                >
                  CANCEL (キャンセル)
                </button>
                <button
                  className="mech-btn !w-auto !h-[36px] !mb-0 !text-[#000] !bg-[#fff] border-[#fff] hover:!bg-[#ddd] px-5 font-bold text-[12px]"
                  onClick={() => applyImportedData(importPendingData)}
                >
                  RESTORE (復元を適用)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPORT ERROR MODAL */}
        {importErrorMsg && (
          <div className="fixed inset-0 z-[1000] bg-black/85 flex items-center justify-center p-4">
            <div className="bg-[#181010] border border-[#662222] p-6 max-w-md w-full flex flex-col gap-3 font-mono">
              <div className="flex items-center gap-2 text-[#ff6666] font-bold text-[15px]">
                <AlertCircle size={18} />
                <span>IMPORT ERROR</span>
              </div>
              <div className="text-[12px] text-[#ccc] leading-relaxed">
                {importErrorMsg}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  className="mech-btn !w-auto !h-[34px] !mb-0 !text-[#fff] border-[#666] px-4 font-bold text-[12px]"
                  onClick={() => setImportErrorMsg("")}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

  const bootIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const runBoot = () => {
    if (bootIntervalRef.current) clearInterval(bootIntervalRef.current);
    setIsInitializingGlow(false);
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

  const [isInitializingGlow, setIsInitializingGlow] = useState(false);
  const storyAutoTimerRef = useRef<NodeJS.Timeout[]>([]);

  const clearStoryAutoTimers = () => {
    storyAutoTimerRef.current.forEach((t) => clearTimeout(t));
    storyAutoTimerRef.current = [];
  };

  // INITIALIZE INTERFACE 出現から約5秒後にローディング画面へ自動遷移＆直前のフワッとしたエメラルド発光演出
  useEffect(() => {
    if (currentScreen !== "story") {
      clearStoryAutoTimers();
      setIsInitializingGlow(false);
      return;
    }

    const totalLines = currentLang === "JP" ? storyJp.length : storyEn.length;
    const isFinished = storyLineIndex >= totalLines - 1 && totalLines > 0;

    if (isFinished) {
      clearStoryAutoTimers();
      // 約4.2秒後にフワッとエメラルドグリーンに発光開始
      const glowTimer = setTimeout(() => {
        setIsInitializingGlow(true);
      }, 4200);

      // 約5.0秒（発光から800ms後）にローディング画面(boot)へ移動
      const bootTimer = setTimeout(() => {
        runBoot();
      }, 5000);

      storyAutoTimerRef.current = [glowTimer, bootTimer];
    } else {
      clearStoryAutoTimers();
      setIsInitializingGlow(false);
    }

    return () => {
      clearStoryAutoTimers();
    };
  }, [currentScreen, storyLineIndex, currentLang, storyJp.length, storyEn.length]);

  const handleStoryButtonClick = () => {
    const totalLines = currentLang === "JP" ? storyJp.length : storyEn.length;
    const isFinished = storyLineIndex >= totalLines - 1;

    if (isFinished) {
      if (isInitializingGlow) return; // 既に発光中・遷移中
      clearStoryAutoTimers();
      setIsInitializingGlow(true);
      // 手動クリック時もフワッとエメラルドグリーンに光ってから約600ms後にローディングへ
      setTimeout(() => {
        runBoot();
      }, 600);
    } else {
      // SKIP PROLOGUE 押下時は待たずに即時実行
      clearStoryAutoTimers();
      runBoot();
    }
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
            <div
              className="brand-secondary tracking-[0.8em]"
              style={{ marginBottom: '18px' }}
            >
              SECURE_BOOT_PROTOCOL_GS_V3
            </div>

            <div className="flex justify-center w-full">
              <button className="mech-btn w-[200px] h-[38px]">
                <span>BOOT SYSTEM</span>
              </button>
            </div>

            {/* Language Switcher under BOOT SYSTEM */}
            <div
              className="flex justify-center items-center gap-2.5 mt-5 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={`mech-btn !w-[56px] !h-[24px] !mb-0 text-[11px] font-bold tracking-widest transition-all ${
                  currentLang === "JP"
                    ? "active !border-[var(--emerald-primary)] !text-[var(--emerald-primary)] !bg-[#002624] shadow-[0_0_12px_rgba(0,237,232,0.45)]"
                    : "!text-[#777] !border-[#333] hover:!text-[#ccc] hover:!border-[#555]"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentLang("JP");
                }}
                title="日本語"
              >
                <span>JP</span>
              </button>
              <button
                type="button"
                className={`mech-btn !w-[56px] !h-[24px] !mb-0 text-[11px] font-bold tracking-widest transition-all ${
                  currentLang === "EN"
                    ? "active !border-[var(--emerald-primary)] !text-[var(--emerald-primary)] !bg-[#002624] shadow-[0_0_12px_rgba(0,237,232,0.45)]"
                    : "!text-[#777] !border-[#333] hover:!text-[#ccc] hover:!border-[#555]"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentLang("EN");
                }}
                title="English"
              >
                <span>EN</span>
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
            className={`flex justify-center w-full transition-opacity duration-1000 mt-[40px] ${
              storyLineIndex >= (currentLang === "JP" ? storyJp.length : storyEn.length) - 1
                ? "opacity-100"
                : "opacity-50"
            }`}
          >
            <button
              className={`mech-btn !w-[290px] pointer-events-auto h-[44px] relative overflow-hidden transition-all duration-700 ${
                isInitializingGlow
                  ? "!border-[var(--emerald-primary)] !bg-[#002624] shadow-[0_0_35px_rgba(0,237,232,0.75)] scale-[1.04]"
                  : ""
              }`}
              onClick={handleStoryButtonClick}
            >
              {isInitializingGlow && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,237,232,0.3)] to-transparent animate-pulse pointer-events-none" />
              )}
              <span
                className={`text-[14px] transition-all duration-700 ${
                  isInitializingGlow
                    ? "text-[var(--emerald-primary)] font-bold tracking-[2.5px] drop-shadow-[0_0_16px_rgba(0,237,232,1)]"
                    : ""
                }`}
              >
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

            <header className="chassis-header flex items-center justify-between px-5 bg-[#121212] border-b border-[#282828] relative overflow-hidden">
              <div className="flex items-center gap-3 anim-header-left">
                <div className="flex items-center gap-2">
                  <div className="header-title">SPACE ROBOTMAN WORLD</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#282828] text-[9px] font-mono text-[#666]">
                  <span>SYSTEM // ONLINE</span>
                </div>
              </div>

              <div className="header-status-line flex items-center gap-4 anim-header-right">
                <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-[#555]">
                  <span>NODE: 01</span>
                  <span>//</span>
                  <span>SYS-VER: 3.2</span>
                </div>
                <span className="header-sub bg-[#1a1a1a] px-2.5 py-1 border border-[#2a2a2a] text-[#888]">
                  SYSTEM ARCHIVE
                </span>
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  className="w-7 h-7 bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] hover:border-[#666] text-[#888] hover:text-[#fff] flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
            </header>

            <aside className="chassis-side bg-[#161616] border-r border-[#262626] anim-sidebar-enter">
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
                    {/* OPENING TOP AUTO-RESET CONFIRMATION BUTTON (EMERALD GREEN) */}
                    {openingTopCountdown === null ? (
                      <button
                        className="mech-nav-btn hover:border-[var(--emerald-dim)] hover:text-[var(--emerald-primary)] mt-1 text-[#aaa] transition-all group"
                        onClick={handleOpeningTopClick}
                        title="オープニングトップ画面へ戻る (クリックして確認)"
                      >
                        <span className="nav-idx text-[#888] group-hover:text-[var(--emerald-primary)]">◀ //</span>
                        <span className="nav-label">OPENING TOP</span>
                      </button>
                    ) : (
                      <button
                        className="mech-nav-btn mt-1 !bg-[#002b28] !border-[var(--emerald-primary)] !text-[#00fff2] shadow-[0_0_14px_rgba(0,237,232,0.35)] transition-all animate-pulse cursor-pointer !justify-center !text-center whitespace-nowrap px-2"
                        onClick={handleOpeningTopClick}
                        title="もう一度クリックするとトップ画面へ戻ります（4秒放置で自動解除）"
                      >
                        <span className="font-['Orbitron'] font-bold text-[11px] tracking-widest text-[var(--emerald-primary)] flex items-center justify-center gap-1.5 w-full text-center">
                          <span className="text-[10px]">◀</span>
                          <span>RETURN NOW ?</span>
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="nav-group flex-none">
                  {/* MASTER ONLY ACCESS */}
                  <div className="mb-[4px] flex flex-col gap-2 bg-[#121212] p-2.5 border border-[#2a2a2a]">
                    <div className="flex items-center justify-between text-[9px] font-mono border-b border-[#222] pb-1.5">
                      <span className="text-[#bbb] font-['Orbitron'] font-bold tracking-wider">
                        MASTER ONLY ACCESS
                      </span>
                      <span className="text-[#555] font-mono text-[8px] tracking-widest">
                        4-DIGIT PIN
                      </span>
                    </div>

                    {/* CONNECTED 4-SLOT INPUT WITH CENTER LINE IN EACH */}
                    <div
                      className="relative flex items-center justify-center my-1 cursor-pointer select-none"
                      onClick={() => sidebarPinRef.current?.focus()}
                      title="4桁の暗証番号を入力 (初期値: 0000)"
                    >
                      <input
                        ref={sidebarPinRef}
                        type="password"
                        maxLength={4}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={sidebarPinInput}
                        onFocus={() => setIsSidebarPinFocused(true)}
                        onBlur={() => setIsSidebarPinFocused(false)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                          setSidebarPinInput(val);
                          setPinErrorMessage("");
                          if (val.length === 4) {
                            attemptAdminLogin(val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            attemptAdminLogin(sidebarPinInput);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        autoComplete="off"
                      />
                      <div
                        className={`grid grid-cols-4 w-full h-[34px] border transition-colors bg-transparent ${
                          pinErrorMessage
                            ? "border-[#ff4444] bg-[#1a0808]"
                            : isSidebarPinFocused
                            ? "border-[#555]"
                            : "border-[#2e2e2e]"
                        }`}
                      >
                        {[0, 1, 2, 3].map((idx) => {
                          const char = sidebarPinInput[idx];
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-center border-r last:border-r-0 border-[#262626] font-mono text-[13px] font-bold"
                            >
                              {char ? (
                                <span className="text-white text-[11px]">●</span>
                              ) : (
                                <span className="w-2.5 h-[2px] bg-[#444] inline-block"></span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {pinErrorMessage ? (
                      <div className="text-[9px] text-[#ff6666] font-mono tracking-tight text-center py-0.5">
                        {pinErrorMessage}
                      </div>
                    ) : (
                      <div className="text-[8px] text-[#555] font-mono text-center tracking-wider">
                        ENTER 4-DIGIT SECURITY CODE
                      </div>
                    )}

                    <button
                      className="mech-btn w-full !mb-0 !h-[30px] hover:border-[#666] flex items-center justify-center text-[10px] font-bold tracking-wider uppercase text-[#ccc] hover:text-[#fff]"
                      onClick={() => {
                        if (!sidebarPinInput) {
                          setShowPinModal(true);
                        } else {
                          attemptAdminLogin(sidebarPinInput);
                        }
                      }}
                      title="暗証番号を入力して管理画面へログイン (未入力でキーパッド表示)"
                    >
                      <span>ADMIN LOGIN</span>
                    </button>
                  </div>
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

            <main className="content-main flex flex-col bg-[#111] anim-content-enter">
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

      {/* SECURITY CLEARANCE PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-[1100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#3a3a3a] shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-sm w-full p-6 flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <div className="flex items-center gap-2 text-[#fff] font-['Orbitron'] font-bold text-[13px] tracking-wider">
                <span>MASTER ONLY ACCESS</span>
              </div>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setModalPinInput("");
                  setModalPinError("");
                }}
                className="text-[#666] hover:text-[#fff] text-[16px] px-1"
              >
                ✕
              </button>
            </div>

            <div className="text-[12px] text-[#aaa] text-center">
              管理画面（ADMIN）に入るための4桁の暗証番号を入力してください。
            </div>

            {/* PIN display slots */}
            <div className="flex justify-center py-2">
              <div
                className={`grid grid-cols-4 w-52 h-12 border bg-transparent ${
                  modalPinError ? "border-[#ff4444] bg-[#1a0808]" : "border-[#333]"
                }`}
              >
                {[0, 1, 2, 3].map((idx) => {
                  const char = modalPinInput[idx];
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center border-r last:border-r-0 border-[#262626] font-mono text-lg font-bold"
                    >
                      {char ? (
                        <span className="text-white">●</span>
                      ) : (
                        <span className="w-3.5 h-[2px] bg-[#444] inline-block"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {modalPinError && (
              <div className="text-[11px] text-[#ff5555] font-bold text-center animate-fade-in">
                {modalPinError}
              </div>
            )}

            <div className="text-[10px] text-[#666] text-center">
              ※ 初期暗証番号は「0000」です。管理画面内から変更可能です。
            </div>

            {/* Numeric Keypad for Mobile & Touch */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (modalPinInput.length < 4) {
                      const next = modalPinInput + num.toString();
                      setModalPinInput(next);
                      setModalPinError("");
                      if (next.length === 4) {
                        attemptAdminLogin(next);
                      }
                    }
                  }}
                  className="h-11 bg-[#181818] hover:bg-[#282828] border border-[#2e2e2e] hover:border-[#666] text-[#eee] font-mono text-[16px] font-bold transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setModalPinInput("");
                  setModalPinError("");
                }}
                className="h-11 bg-[#141414] hover:bg-[#202020] border border-[#2e2e2e] text-[#888] font-mono text-[11px] font-bold transition-colors"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => {
                  if (modalPinInput.length < 4) {
                    const next = modalPinInput + "0";
                    setModalPinInput(next);
                    setModalPinError("");
                    if (next.length === 4) {
                      attemptAdminLogin(next);
                    }
                  }
                }}
                className="h-11 bg-[#181818] hover:bg-[#282828] border border-[#2e2e2e] hover:border-[#666] text-[#eee] font-mono text-[16px] font-bold transition-colors"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalPinInput((prev) => prev.slice(0, -1));
                  setModalPinError("");
                }}
                className="h-11 bg-[#141414] hover:bg-[#202020] border border-[#2e2e2e] text-[#888] font-mono text-[14px] flex items-center justify-center transition-colors"
              >
                ⌫
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="mech-btn !w-auto flex-1 !h-[38px] !mb-0 text-[#888] border-[#333] hover:text-[#eee] font-bold text-[12px]"
                onClick={() => {
                  setShowPinModal(false);
                  setModalPinInput("");
                  setModalPinError("");
                }}
              >
                CANCEL (戻る)
              </button>
              <button
                type="button"
                className="mech-btn !w-auto flex-1 !h-[38px] !mb-0 !text-[#fff] !bg-[#242424] border-[#555] hover:!bg-[#323232] hover:border-[#888] font-bold text-[12px]"
                onClick={() => attemptAdminLogin(modalPinInput)}
              >
                LOGIN (認証)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPLASH, PROLOGUE & BOOT SCREEN TOP-RIGHT FULLSCREEN BUTTON */}
      {(currentScreen === "splash" || currentScreen === "story" || currentScreen === "boot") && (
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "全画面表示を解除 (ESC)" : "フルスクリーン表示 (全画面)"}
          className="fixed top-2.5 right-2.5 z-[9999] w-6 h-6 bg-[#0a0a0a]/60 hover:bg-[#1c1c1c]/90 backdrop-blur-[2px] border border-[#2a2a2a] hover:border-[#555] text-[#777] hover:text-[#eee] flex items-center justify-center transition-all cursor-pointer shadow-sm group opacity-75 hover:opacity-100"
        >
          {isFullscreen ? (
            <Minimize2 size={11} className="transition-transform group-hover:scale-110" />
          ) : (
            <Maximize2 size={11} className="transition-transform group-hover:scale-110" />
          )}
        </button>
      )}

      {currentScreen === "admin" && renderAdminScreen()}
      <OfflineIndicator />
    </div>
  );
}
