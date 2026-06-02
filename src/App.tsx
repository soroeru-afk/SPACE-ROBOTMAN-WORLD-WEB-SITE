/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [systemLogo, setSystemLogo] = useState<string>("assets/new_image/imageSSS.png");

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
          if (data.systemLogo) setSystemLogo(data.systemLogo);
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

  const [activeArtFilter, setActiveArtFilter] = useState("ALL");
  const [selectedArt, setSelectedArt] = useState<string | null>(null);

  const [activeMotFilter, setActiveMotFilter] = useState("ALL");
  const [selectedMot, setSelectedMot] = useState<string | null>(null);

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
      return filters.map((f) => (
        <button
          key={f}
          className={`mech-btn !w-auto px-5 h-[28px] ${activeCharFilter === f ? "active" : ""}`}
          onClick={() => setActiveCharFilter(f)}
        >
          <span>{f}</span>
        </button>
      ));
    }
    if (currentNav === "ART") {
      const filters = ["ALL", ...artCategories];
      return filters.map((f) => (
        <button
          key={f}
          className={`mech-btn !w-auto px-5 h-[28px] ${activeArtFilter === f ? "active" : ""}`}
          onClick={() => setActiveArtFilter(f)}
        >
          <span>{f}</span>
        </button>
      ));
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

  const getFilteredUnits = () =>
    activeCharFilter === "ALL"
      ? units
      : units.filter(
          (u: any) => u.faction && u.faction.startsWith(activeCharFilter),
        );

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
                className="border-l-2 border-[var(--emerald-primary)] py-[60px]"
                style={{ marginLeft: "30px", paddingLeft: "40px" }}
              >
                <h2 
                  className="font-['Orbitron'] text-[24px] text-white mb-[30px] tracking-[0.1em]"
                  style={{ marginTop: storyStyle.marginTop || "30px" }}
                >
                  WORLDVIEW // 世界観
                </h2>
                <div
                  className="text-[#ccc] leading-[2.2] mb-8 max-w-2xl"
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
          <div id="art-well" className="w-full h-full flex flex-col">
            <div className="hero-frame flex-1 bg-[#1a1a1a] m-4 border border-[#333] rounded shadow-md overflow-hidden flex items-center justify-center p-4">
              {selectedArt && (
                <img
                  src={`assets/new_image/${selectedArt}`}
                  alt="art"
                  className="max-w-full max-h-full object-contain drop-shadow-xl"
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
                className="ribbon-scroller h-[120px] bg-[#181818] border-t border-[#333] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0 scroll-smooth"
              >
                {artSet.filter(d => `assets/new_image/${d}` !== systemLogo).map((art) => (
                  <div
                    key={art}
                    className={`h-[90%] w-auto flex-shrink-0 cursor-pointer border-2 transition-all ${selectedArt === art ? "border-[var(--accent-cyan)] opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}
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
          </div>
        )}

        {currentNav === "MOTION" && (
          <div id="motion-well" className="w-full h-full flex flex-col">
            <div className="hero-frame flex-1 bg-[#1a1a1a] m-4 border border-[#333] rounded shadow-md overflow-hidden flex items-center justify-center p-4">
              {selectedMot && (
                <video
                  controls
                  autoPlay
                  muted
                  loop
                  src={`assets/motion/${selectedMot}`}
                  className="max-w-full max-h-full object-contain drop-shadow-xl"
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
                className="ribbon-scroller h-[120px] bg-[#181818] border-t border-[#333] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0 scroll-smooth"
              >
                {motSet.map((mot) => (
                  <div
                    key={mot}
                    className={`h-[90%] w-auto flex-shrink-0 cursor-pointer border-2 transition-all ${selectedMot === mot ? "border-[var(--accent-cyan)] opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}
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
          <div id="char-well" className="w-full h-full p-6 flex justify-center">
            <div className="archive-box bg-[#151515] border border-[#333] rounded p-6 shadow-md w-full max-w-6xl h-full flex gap-8">
              <div className="archive-scroller w-[280px] shrink-0 overflow-y-auto border-r border-[#222] pr-4 flex flex-col gap-2" id="char-master-list">
                {getFilteredUnits().map((u: any, i: number) => (
                  <button
                    key={i}
                    className={`mech-btn text-left !w-full !mb-0 !h-10 ${selectedChar === u ? "active" : ""}`}
                    onClick={() => setSelectedChar(u)}
                  >
                    <span className="truncate px-4">{u.name}</span>
                  </button>
                ))}
              </div>
              <div
                className="flex-1 flex gap-8 transition-opacity duration-500 min-w-0"
                style={{ opacity: selectedChar ? 1 : 0 }}
              >
                {selectedChar && (
                  <>
                    <div className="flex-1 bg-[#0a0a0a] border border-[#222] flex items-center justify-center shrink-0 p-6 rounded bg-gradient-to-br from-[#111] to-[#000]">
                      <img
                        src={selectedChar.file}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_20px_rgba(0,255,255,0.15)]"
                        alt={selectedChar.name}
                      />
                    </div>
                    <div className="w-[360px] flex flex-col min-w-0 shrink-0 py-4">
                      <h2 className="font-['Orbitron'] text-[24px] text-white border-b-2 border-[var(--emerald-primary)] pb-[15px] mb-[25px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {selectedChar.name}
                      </h2>
                      <div className="unit-desc-box bg-transparent border-none p-0 flex-1 overflow-y-auto">
                        <div className="desc-en text-[13px] text-[#ccc] leading-[1.8] mb-[20px] font-mono">
                          {selectedChar.desc || "--"}
                        </div>
                        <div className="desc-jp text-[14px] text-[#aaa] leading-[2] font-sans">
                          {selectedChar.descJp || "--"}
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-[15px] shrink-0">
                        <div className="border border-[#333] p-[15px] bg-[#0a0a0a]">
                          <div className="brand-secondary mb-[8px] text-[var(--emerald-primary)] !tracking-[0.2em]">CLASS</div>
                          <div className="text-[12px] text-white font-bold tracking-wider">
                            {selectedChar.faction || "--"}
                          </div>
                        </div>
                        <div className="border border-[#333] p-[15px] bg-[#0a0a0a]">
                          <div className="brand-secondary mb-[8px] text-[var(--emerald-primary)] !tracking-[0.2em]">
                            UNIT ROLE
                          </div>
                          <div className="text-[12px] text-white font-bold tracking-wider">
                            {selectedChar.role || "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
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
        systemLogo: systemLogo,
        logoSet: logoSet,
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
      const arr = [...logoSet];
      arr.splice(index, 1);
      setLogoSet(arr);
      p.logoSet = arr;
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
        className="fixed inset-0 w-full h-full bg-[#050505] z-[999] flex justify-center p-4 md:p-8 lg:p-10 box-border overflow-hidden"
      >
        <div className="w-full max-w-[1600px] h-full flex flex-col min-w-0 bg-[#0a0a0a] border border-[#222] rounded-lg shadow-2xl p-4 sm:p-6 md:p-8">
          <header className="flex flex-wrap justify-between items-center border-b border-[#333] shrink-0 gap-4 pb-4">
          <div className="flex flex-wrap items-center gap-[20px] lg:gap-[30px] h-full min-w-0">
            <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[20px] md:text-[24px] tracking-wide font-bold shrink-0">
              ADMIN DASHBOARD
            </div>
            <div className="flex flex-wrap gap-[10px] lg:gap-[30px] h-full lg:ml-[20px]">
              <button
                className={`border-b-[3px] !w-auto !h-[50px] font-bold text-[13px] uppercase ${currentAdminTab === "ART" ? "border-[var(--emerald-primary)] text-[var(--emerald-primary)]" : "border-transparent text-[#aaa] hover:text-[#fff]"}`}
                onClick={() => {
                  setCurrentAdminTab("ART");
                  clearCharForm();
                }}
              >
                <span>CG ARTWORKS</span>
              </button>
              <button
                className={`border-b-[3px] !w-auto !h-[50px] font-bold text-[13px] uppercase ${currentAdminTab === "MOTION" ? "border-[var(--emerald-primary)] text-[var(--emerald-primary)]" : "border-transparent text-[#aaa] hover:text-[#fff]"}`}
                onClick={() => {
                  setCurrentAdminTab("MOTION");
                  clearCharForm();
                }}
              >
                <span>MOVIE DATA</span>
              </button>
              <button
                className={`border-b-[3px] !w-auto !h-[50px] font-bold text-[13px] uppercase ${currentAdminTab === "CHAR" ? "border-[var(--emerald-primary)] text-[var(--emerald-primary)]" : "border-transparent text-[#aaa] hover:text-[#fff]"}`}
                onClick={() => {
                  setCurrentAdminTab("CHAR");
                  clearCharForm();
                }}
              >
                <span>CAST ROSTER</span>
              </button>
              <button
                className={`border-b-[3px] !w-auto !h-[50px] font-bold text-[13px] uppercase ${currentAdminTab === "LOGO" ? "border-[var(--emerald-primary)] text-[var(--emerald-primary)]" : "border-transparent text-[#aaa] hover:text-[#fff]"}`}
                onClick={() => {
                  setCurrentAdminTab("LOGO");
                  clearCharForm();
                }}
              >
                <span>SYSTEM LOGO</span>
              </button>
              <button
                className={`border-b-[3px] !w-auto !h-[50px] font-bold text-[13px] uppercase ${currentAdminTab === "OVERVIEW" ? "border-[var(--emerald-primary)] text-[var(--emerald-primary)]" : "border-transparent text-[#aaa] hover:text-[#fff]"}`}
                onClick={() => {
                  setCurrentAdminTab("OVERVIEW");
                  clearCharForm();
                }}
              >
                <span>OVERVIEW TEXT</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-[15px] items-center pb-[5px]">
            <span className="text-[var(--accent-cyan)] text-[11px] font-['Orbitron'] font-bold">
              {saveStatusMsg}
            </span>
            <button
              className="mech-btn !w-auto px-6 !h-[35px] !text-[var(--emerald-primary)] border-[var(--emerald-primary)] hover:bg-[var(--emerald-diffuse)] font-bold text-[12px]"
              onClick={() => saveAdminData()}
            >
              <span>SAVE JSON DATA</span>
            </button>
            <button
              className="mech-btn !w-auto px-6 !h-[35px] text-[#ccc] border-[#333] bg-[#111] hover:bg-[#222] font-bold text-[12px]"
              onClick={() => {
                clearCharForm();
                setCurrentScreen("dash");
              }}
            >
              <span>EXIT ADMIN</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0 mt-[20px]">
          {currentAdminTab === "OVERVIEW" ? (
            <div className="flex-1 flex gap-[20px] p-[10px] pr-[20px] h-full">
              <div className="flex-1 flex flex-col gap-[10px]">
                <div className="flex justify-between items-center mb-[5px]">
                  <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[14px]">
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
                  className="flex-1 bg-[#0a0a0a] text-[#ccc] border border-[#333] p-[20px] outline-none focus:border-[var(--emerald-primary)] leading-[2.2] resize-none"
                  style={{ fontSize: adminStoryStyle.fontSizeJp, fontFamily: adminStoryStyle.fontFamilyJp }}
                  value={adminStoryJp}
                  onChange={(e) => setAdminStoryJp(e.target.value)}
                ></textarea>
              </div>
              <div className="flex-1 flex flex-col gap-[10px]">
                <div className="flex justify-between items-center mb-[5px]">
                  <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[14px]">
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
                  className={`flex-1 bg-[#0a0a0a] text-[#aaa] border border-[#333] p-[15px] outline-none focus:border-[var(--emerald-primary)] leading-[2] resize-none ${adminStoryStyle.isItalicEn ? "italic" : ""}`}
                  style={{ fontSize: adminStoryStyle.fontSizeEn, fontFamily: adminStoryStyle.fontFamilyEn }}
                  value={adminStoryEn}
                  onChange={(e) => setAdminStoryEn(e.target.value)}
                ></textarea>
              </div>
              <div className="w-[350px] flex flex-col gap-[10px]">
                <div className="flex flex-col gap-[10px] mb-[5px]">
                  <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[14px]">
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
                  className="flex-1 bg-[#0a0a0a] text-[#aaa] border border-[#333] p-[15px] outline-none focus:border-[var(--emerald-primary)] leading-[2] resize-none font-mono text-[11px]"
                  value={adminAboutText}
                  onChange={(e) => setAdminAboutText(e.target.value)}
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="flex gap-[20px] w-full h-full min-h-0 pb-4">
              {/* LEFT SIDEBAR: UPLOAD/FORM */}
              <div className="w-[300px] border-r border-[#333] flex flex-col gap-[20px] pr-[20px] overflow-y-auto shrink-0">
                <div className="flex flex-col gap-[8px]">
                  <div className="text-[var(--emerald-primary)] font-['Orbitron'] font-bold text-[10px] tracking-wide uppercase">Target Category</div>
                  <div className="bg-[#151515] text-[#ccc] border border-[#333] p-[10px] text-[13px] font-bold font-mono tracking-widest select-none">
                    {currentAdminTab === "ART" && "CG ARTWORKS"}
                    {currentAdminTab === "MOTION" && "MOVIE DATA"}
                    {currentAdminTab === "CHAR" && "CAST ROSTER"}
                    {currentAdminTab === "LOGO" && "SYSTEM LOGO"}
                  </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <div className="text-[var(--emerald-primary)] font-['Orbitron'] font-bold text-[10px] tracking-wide uppercase">Custom filename (optional)</div>
                  <input
                    type="text"
                    placeholder="Enter title..."
                    className="bg-[#151515] text-[#fff] border border-[#333] p-[10px] text-[13px] outline-none focus:border-[var(--emerald-primary)] placeholder-[#555] font-mono"
                    value={customUploadName}
                    onChange={(e) => setCustomUploadName(e.target.value)}
                  />
                </div>

                <div
                  className="h-[220px] shrink-0 border-2 border-dashed border-[#444] bg-[#111] flex flex-col items-center justify-center text-center text-[#777] cursor-pointer p-[20px] box-border hover:border-[var(--emerald-primary)] transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length)
                      handleUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-[30px] h-[30px] mb-[15px] fill-current text-[var(--emerald-primary)]" viewBox="0 0 24 24">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                  <div className="font-['Orbitron'] text-[18px] mb-[10px] text-[var(--emerald-primary)] font-bold tracking-widest">
                    DRAG & DROP
                  </div>
                  <div className="text-[12px] font-bold tracking-wider text-[#ccc] mb-[15px]">Click or drop media here</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#777] leading-relaxed">
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

                <div className="text-[12px] text-[var(--emerald-primary)] font-bold">
                  {uploadMsg}
                </div>

                {currentAdminTab === "CHAR" && (
                  <div className="flex flex-col gap-[8px] text-[11px] bg-[#151515] border border-[#333] p-[15px] shrink-0">
                    <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[12px] mb-[4px]">
                      UNIT METADATA
                    </div>
                    <input
                      type="text"
                      placeholder="Name"
                      className="bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                      value={fmName}
                      onChange={(e) => setFmName(e.target.value)}
                    />
                    <div className="flex gap-[8px]">
                      <input
                        type="text"
                        placeholder="Faction"
                        className="flex-1 bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                        value={fmFact}
                        onChange={(e) => setFmFact(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        className="flex-1 bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                        value={fmRole}
                        onChange={(e) => setFmRole(e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Desc EN"
                      rows={2}
                      className="bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                      value={fmDesc}
                      onChange={(e) => setFmDesc(e.target.value)}
                    ></textarea>
                    <textarea
                      placeholder="Desc JP"
                      rows={2}
                      className="bg-[#0a0a0a] text-white border border-[#222] p-[8px] outline-none focus:border-[var(--emerald-primary)]"
                      value={fmDescJp}
                      onChange={(e) => setFmDescJp(e.target.value)}
                    ></textarea>
                    <div className="flex gap-[10px] mt-[5px]">
                      <button className="mech-btn flex-1 !h-[30px]" onClick={clearCharForm}>
                        <span className="text-[10px]">CLEAR</span>
                      </button>
                      <button
                        className="mech-btn flex-1 !h-[30px] border-[var(--emerald-primary)] !text-[var(--emerald-primary)]"
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
                             className="w-full bg-[#111] hover:bg-[var(--emerald-diffuse)] text-[var(--emerald-primary)] text-[9px] border border-[var(--emerald-primary)] py-[4px] font-bold uppercase transition-colors"
                             onClick={(e) => {
                               e.stopPropagation();
                               setSystemLogo(item.src);
                               setUploadMsg("SYSTEM LOGO UPDATED. REMEMBER TO SAVE JSON DATA.");
                             }}
                           >
                             SET AS LOGO
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
      { p: 25, text: "MOUNTING_LOCAL_DRIVES.........COMPLETE" },
      { p: 50, text: "SYNC_DATABANK_PROTOCOL........COMPLETE" },
      { p: 80, text: "VERIFYING_UNIT_ARCHIVES.......COMPLETE" },
      { p: 100, text: "ALL_SYSTEMS_GO................100%" },
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
            <div className="w-[180px] h-[180px] flex justify-center items-center mb-[50px] relative">
              <svg width="180" height="180" viewBox="0 0 180 180">
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
            <div className="flex flex-col w-full max-w-2xl px-[30px] mt-[30px]">
              <div className="font-['Orbitron'] text-[18px] text-[var(--emerald-primary)] mb-[40px] font-bold tracking-[8px] text-center" style={{ textShadow: "0 0 8px var(--emerald-primary)" }}>
                SYSTEM BOOT PROTOCOL
              </div>
              <div className="w-full flex justify-center">
                <div className="text-[13px] text-[var(--emerald-primary)] leading-[3] tracking-[2px] font-mono whitespace-pre-wrap h-[180px] px-[30px] w-max text-left">
                  {bootLogs.map((l, i) => (
                    <div key={i} className="animate-pulse">{l}</div>
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

            <header className="chassis-header">
              <div className="header-title">SPACE ROBOTMAN WORLD</div>
              <div className="header-status-line">
                <span className="header-sub">MAIN DATA TERMINAL // v.3.0</span>
              </div>
            </header>

            <aside className="chassis-side">
              <div className="structural-panel"></div>
              <div className="button-area">
                <div className="flex flex-col mt-[-5px]">
                  <div className="mb-4 flex justify-center px-4">
                    <img src={systemLogo} alt="S Logo" className="w-[125px] object-contain opacity-85 hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="nav-group flex-none">
                  <button
                    className={`mech-btn ${currentNav === "HOME" ? "active" : ""}`}
                    onClick={() => setCurrentNav("HOME")}
                  >
                    <span>HOME / STATUS</span>
                  </button>
                  <button
                    className={`mech-btn ${currentNav === "ART" ? "active" : ""}`}
                    onClick={() => setCurrentNav("ART")}
                  >
                    <span>CG-ARTWORKS</span>
                  </button>
                  <button
                    className={`mech-btn ${currentNav === "CHAR" ? "active" : ""}`}
                    onClick={() => setCurrentNav("CHAR")}
                  >
                    <span>UNIT-ARCHIVES</span>
                  </button>
                  <button
                    className={`mech-btn ${currentNav === "MOTION" ? "active" : ""}`}
                    onClick={() => setCurrentNav("MOTION")}
                  >
                    <span>MOTION-DATA</span>
                  </button>
                  <button
                    className={`mech-btn ${currentNav === "OVER" ? "active" : ""}`}
                    onClick={() => setCurrentNav("OVER")}
                  >
                    <span>OVERVIEW</span>
                  </button>
                </div>
                </div>

                <div className="nav-group flex-none">
                  <button
                    className="mech-btn w-full mb-[5px]"
                    onClick={() => setCurrentScreen("admin")}
                  >
                    <span>ADMIN LOGIN</span>
                  </button>
                  <button
                    className="mech-btn w-full"
                    onClick={() => setCurrentScreen("splash")}
                  >
                    <span>OPENING TOP</span>
                  </button>
                  <div className="flex items-baseline justify-between mt-[15px] px-1">
                    <span 
                      className="text-[9px] text-[var(--accent-cyan)] font-mono tracking-widest cursor-pointer opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap"
                      onClick={() => setClockMode(prev => prev === "REAL" ? "LIMIT" : "REAL")}
                    >
                      {clockMode === "REAL" ? "RIGHT NOW" : "TIME LIMIT"}
                    </span>
                    <div className="text-[16px] text-[#999] font-mono tracking-widest font-bold text-right shrink-0 min-w-[125px]">
                      <span id="dash-clk">{clockMode === "REAL" ? clock : countdownText}</span>
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
