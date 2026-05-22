/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";

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
};
const defaultAboutLines = [
  "PROJECT: SPACE ROBOTMAN WORLD",
  "CHIEF DESIGNER: GRAPHIC SPACE",
  "VERSION: 3.0 [ESTABLISHED 2003 // REBUILT 2026]"
];
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
  const [splashMedia, setSplashMedia] = useState<string>("/placeholder_movie.mp4");
  const [splashMode, setSplashMode] = useState<string>("SINGLE"); // SINGLE, RANDOM, SEQUENCE
  const [splashOpacity, setSplashOpacity] = useState<number>(30); // Default to 30% (less transparent than 10%)
  const [playlistExcludes, setPlaylistExcludes] = useState<string[]>([]);
  
  const [charCategories, setCharCategories] = useState<string[]>(defaultCharCats);
  const [artCategories, setArtCategories] = useState<string[]>(defaultArtCats);
  const [motCategories, setMotCategories] = useState<string[]>(defaultMotCats);

  const [units, setUnits] = useState<any[]>([]);
  const [artSet, setArtSet] = useState<string[]>([]);
  const [motSet, setMotSet] = useState<string[]>([]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videoPlaylist = useMemo(() => {
    return [
      ...artSet.map((d) => `assets/new_image/${d}`),
      ...motSet.map((d) => `assets/motion/${d}`),
      ...units.map((d) => d.file)
    ].filter(src => (src.endsWith(".mp4") || src.endsWith(".webm")) && !playlistExcludes.includes(src));
  }, [artSet, motSet, units, playlistExcludes]);

  const handleVideoEnded = () => {
    if (splashMode === "SEQUENCE") {
       setCurrentVideoIndex(prev => (prev + 1) % videoPlaylist.length);
    } else if (splashMode === "RANDOM") {
       setCurrentVideoIndex(Math.floor(Math.random() * videoPlaylist.length));
    }
  };

  const currentSplashSrc = useMemo(() => {
    if (splashMode === "SINGLE") return splashMedia;
    if (videoPlaylist.length === 0) return splashMedia;
    return videoPlaylist[currentVideoIndex] || splashMedia;
  }, [splashMode, splashMedia, videoPlaylist, currentVideoIndex]);


  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [clock, setClock] = useState("00:00:00");
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
          if (data.storyJp) setStoryJp(data.storyJp);
          if (data.storyEn) setStoryEn(data.storyEn);
          if (data.storyStyle) setStoryStyle({ ...defaultStoryStyle, ...data.storyStyle });
          if (data.aboutLines) setAboutLines(data.aboutLines);
          if (data.splashMedia) setSplashMedia(data.splashMedia);
          if (data.splashMode) setSplashMode(data.splashMode);
          if (data.splashOpacity !== undefined) setSplashOpacity(data.splashOpacity);
          if (data.playlistExcludes) setPlaylistExcludes(data.playlistExcludes);
          if (data.charCategories) setCharCategories(data.charCategories);
          if (data.artCategories) setArtCategories(data.artCategories);
          if (data.motCategories) setMotCategories(data.motCategories);
        }
      })
      .catch((e) => console.error("Could not load data:", e));

    const timer = setInterval(() => {
      const d = new Date();
      setClock(
        d.getHours().toString().padStart(2, "0") +
          ":" +
          d.getMinutes().toString().padStart(2, "0") +
          ":" +
          d.getSeconds().toString().padStart(2, "0"),
      );
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
                key={currentSplashSrc}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: splashOpacity / 100 }}
                autoPlay
                muted
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
                style={{ marginLeft: "30px", paddingLeft: "40px" }}
              >
                <h2 className="font-['Orbitron'] text-[16px] text-[#666] mb-[10px]">
                  ABOUT GRAPHIC SPACE
                </h2>
                <div className="text-[12px] text-[#555] leading-[2]">
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
            <div className="ribbon-scroller h-[120px] bg-[#181818] border-t border-[#333] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0">
              {artSet.map((art) => (
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
            <div className="ribbon-scroller h-[120px] bg-[#181818] border-t border-[#333] flex items-center gap-2 overflow-x-auto px-4 py-2 shrink-0">
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

  const [customUploadName, setCustomUploadName] = useState("");

  const saveAdminData = async (payloadToSave?: any) => {
    setSaveStatusMsg("SAVING...");
    try {
      const payload = payloadToSave || { 
        units, artSet, motSet, 
        storyJp: adminStoryJp.split("\n\n"), 
        storyEn: adminStoryEn.split("\n\n"), 
        storyStyle: adminStoryStyle,
        aboutLines: adminAboutText.split("\n"),
        splashMedia: adminSplashMedia,
        splashMode: adminSplashMode,
        splashOpacity: adminSplashOpacity,
        playlistExcludes: adminPlaylistExcludes,
        charCategories: adminCharCategories.split(",").map((s) => s.trim()).filter(Boolean),
        artCategories: adminArtCategories.split(",").map((s) => s.trim()).filter(Boolean),
        motCategories: adminMotCategories.split(",").map((s) => s.trim()).filter(Boolean),
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
        let p: any = { units, artSet, motSet };

        let newArtSet = [...artSet];
        let newMotSet = [...motSet];
        let newUnits = [...units];

        for (const fileData of data.files) {
          if (currentAdminTab === "ART") {
            newArtSet.push(fileData.basename);
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
    let p: any = { units, artSet, motSet };
    if (currentAdminTab === "ART") {
      const arr = [...artSet];
      arr.splice(index, 1);
      setArtSet(arr);
      p.artSet = arr;
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
        className="fixed inset-0 w-full h-full bg-[#0a0a0a] z-[999] flex flex-col p-[20px] box-border"
      >
        <header className="flex flex-wrap justify-between items-center border-b border-[#333] pb-[15px] mb-[20px] shrink-0 gap-4">
          <div className="flex flex-wrap items-center gap-[30px]">
            <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[20px] tracking-wide">
              ADMIN DASHBOARD
            </div>
            <div className="flex gap-[12px]">
              <button
                className={`mech-btn !w-auto px-5 !h-[30px] ${currentAdminTab === "ART" ? "active" : ""}`}
                onClick={() => {
                  setCurrentAdminTab("ART");
                  clearCharForm();
                }}
              >
                <span>CG ARTWORKS</span>
              </button>
              <button
                className={`mech-btn !w-auto px-5 !h-[30px] ${currentAdminTab === "CHAR" ? "active" : ""}`}
                onClick={() => {
                  setCurrentAdminTab("CHAR");
                  clearCharForm();
                }}
              >
                <span>UNIT ARCHIVES</span>
              </button>
              <button
                className={`mech-btn !w-auto px-5 !h-[30px] ${currentAdminTab === "MOTION" ? "active" : ""}`}
                onClick={() => {
                  setCurrentAdminTab("MOTION");
                  clearCharForm();
                }}
              >
                <span>MOTION DATA</span>
              </button>
              <button
                className={`mech-btn !w-auto px-5 !h-[30px] ${currentAdminTab === "OVERVIEW" ? "active" : ""}`}
                onClick={() => {
                  setCurrentAdminTab("OVERVIEW");
                  clearCharForm();
                }}
              >
                <span>OVERVIEW TEXT</span>
              </button>
              <button
                className={`mech-btn !w-auto px-5 !h-[30px] ${currentAdminTab === "HOME_MEDIA" ? "active" : ""}`}
                onClick={() => {
                  setCurrentAdminTab("HOME_MEDIA");
                  clearCharForm();
                }}
              >
                <span>HOME MEDIA</span>
              </button>
            </div>
          </div>
          <div className="flex gap-[15px] items-center">
            <span className="text-[var(--accent-cyan)] text-[11px] font-['Orbitron'] font-bold">
              {saveStatusMsg}
            </span>
            <button
              className="mech-btn !w-auto px-6 !h-[30px] !text-[var(--accent-cyan)] border-[var(--accent-cyan)] hover:bg-[var(--emerald-diffuse)]"
              onClick={() => saveAdminData()}
            >
              <span>SAVE JSON DATA</span>
            </button>
            <button
              className="mech-btn !w-auto px-6 !h-[30px] border-[#555] opacity-80"
              onClick={() => {
                clearCharForm();
                setCurrentScreen("dash");
              }}
            >
              <span>EXIT ADMIN</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-[20px] min-h-0">
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
              <div className="w-[300px] flex flex-col gap-[10px]">
                <div className="flex justify-between items-center mb-[5px]">
                  <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[14px]">
                    ABOUT TEXT
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
            <>
              {/* TOP HALF: UPLOAD/FORM and GALLERY */}
              <div className="flex h-[280px] gap-[20px] shrink-0">
                {/* UPLOAD / FORM / CONTROLS */}
                <div className="w-[320px] flex flex-col gap-[12px] overflow-y-auto pr-[5px]">
                  <div
                    className="h-[120px] shrink-0 border-2 border-dashed border-[#444] bg-[#111] flex flex-col items-center justify-center text-center text-[#777] cursor-pointer p-[15px] box-border hover:border-[var(--emerald-primary)] transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files.length)
                        handleUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="font-['Orbitron'] text-[16px] mb-[5px] text-[var(--emerald-primary)]">
                      DRAG & DROP
                    </div>
                    <div className="text-[11px]">Click or drop media here</div>
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
                  <input
                    type="text"
                    placeholder="Custom filename (optional)"
                    className="bg-[#151515] text-white border border-[#333] p-[8px] text-[12px] shrink-0 outline-none focus:border-[var(--emerald-primary)]"
                    value={customUploadName}
                    onChange={(e) => setCustomUploadName(e.target.value)}
                  />

                  <div
                    style={{ display: currentAdminTab === "CHAR" ? "flex" : "none" }}
                    className="flex-col gap-[8px] text-[11px] bg-[#151515] border border-[#333] p-[15px] shrink-0"
                  >
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
                        className="mech-btn flex-1 !h-[30px] border-[var(--accent-cyan)] !text-[var(--accent-cyan)]"
                        onClick={updateSelectedCharMetadata}
                      >
                        <span className="text-[10px]">UPDATE</span>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{ display: currentAdminTab === "HOME_MEDIA" ? "flex" : "none" }}
                    className="flex-col gap-[8px] text-[11px] bg-[#151515] border border-[#333] p-[15px] shrink-0"
                  >
                    <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[12px] mb-[4px]">
                      HOME MEDIA
                    </div>
                    <div className="text-[#ccc] text-[10px] mb-2 leading-relaxed">
                      Select an image or video from the gallery to set as the HOME screen (COMMAND NODE) background.
                    </div>
                    <div className="flex gap-[10px] mb-[10px] items-center">
                      <select
                        className="bg-[#111] text-[#ccc] border border-[#333] px-[6px] py-[4px] text-[11px] outline-none flex-1"
                        value={adminSplashMode}
                        onChange={(e) => setAdminSplashMode(e.target.value)}
                      >
                        <option value="SINGLE">Single Media (Loop)</option>
                        <option value="SEQUENCE">Sequential Video Playlist</option>
                      </select>
                      <div className="flex items-center gap-[5px]">
                        <span className="text-[#888] text-[9px] w-[40px]">OPACITY</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={adminSplashOpacity}
                          onChange={(e) => setAdminSplashOpacity(Number(e.target.value))}
                          className="w-[60px]"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] p-[10px] bg-[#0a0a0a] border border-[#222] truncate text-[#aaa] mb-2">
                       {adminSplashMode === "SINGLE" ? adminSplashMedia : "PLAYING ALL VIDEOS IN SEQUENCE"}
                    </div>
                    <button
                      className="mech-btn !h-[30px] border-[var(--emerald-primary)] !text-[var(--emerald-primary)] hover:bg-[var(--emerald-primary)] hover:bg-opacity-20"
                      onClick={() => {
                        if (adminPreviewSrc) {
                          setAdminSplashMedia(adminPreviewSrc);
                          setUploadMsg("HOME MEDIA UPDATED. DONT FORGET TO SAVE.");
                        } else {
                          setUploadMsg("SELECT A MEDIA FROM THE GALLERY FIRST.");
                        }
                      }}
                    >
                      <span className="text-[10px] tracking-widest">SET SELECTED AS SINGLE MEDIA</span>
                    </button>
                    {adminPreviewSrc && (adminPreviewSrc.endsWith(".mp4") || adminPreviewSrc.endsWith(".webm")) && adminSplashMode === "SEQUENCE" && (
                      <button
                        className={`mech-btn !h-[30px] mt-2 ${adminPlaylistExcludes.includes(adminPreviewSrc) ? "border-[#555] !text-[#555] hover:bg-[#333]" : "border-[var(--emerald-primary)] !text-[var(--emerald-primary)] hover:bg-[var(--emerald-primary)] hover:bg-opacity-20"}`}
                        onClick={() => {
                          if (adminPlaylistExcludes.includes(adminPreviewSrc)) {
                            setAdminPlaylistExcludes(adminPlaylistExcludes.filter(src => src !== adminPreviewSrc));
                          } else {
                            setAdminPlaylistExcludes([...adminPlaylistExcludes, adminPreviewSrc]);
                          }
                        }}
                      >
                        <span className="text-[10px] tracking-widest">{adminPlaylistExcludes.includes(adminPreviewSrc) ? "ADD TO PLAYLIST" : "REMOVE FROM PLAYLIST"}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-col gap-[8px] text-[11px] bg-[#151515] border border-[#333] p-[15px] shrink-0 flex mt-auto">
                    <div className="text-[var(--emerald-primary)] font-['Orbitron'] text-[12px] mb-[4px]">
                      CATEGORIES (Comma separated)
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

                  <div className="text-[12px] text-[var(--emerald-primary)] font-bold mb-[10px]">
                    {uploadMsg}
                  </div>
                </div>

                {/* GALLERY THUMBNAILS */}
                <div className="flex-1 border border-[#333] bg-[#050505] overflow-y-auto flex flex-wrap gap-[12px] p-[20px] content-start">
                  {thumbsData.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-[100px] h-[100px] bg-[#111] border-2 border-transparent hover:border-[#555] relative cursor-pointer group transition-colors"
                      onClick={() => {
                        setAdminPreviewSrc(item.src);
                        if (currentAdminTab === "CHAR") {
                          setAdminSelectedCharIndex(idx);
                          setFmName(units[idx].name || "");
                          setFmFact(units[idx].faction || "");
                          setFmRole(units[idx].role || "");
                          setFmDesc(units[idx].desc || "");
                          setFmDescJp(units[idx].descJp || "");
                        }
                      }}
                    >
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
                      <div className="absolute bottom-0 w-full bg-[rgba(0,0,0,0.8)] text-[#aaa] text-[9px] p-[4px] px-[6px] overflow-hidden whitespace-nowrap text-ellipsis pointer-events-none border-t border-[#222]">
                        {item.f}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTTOM HALF: LARGE PREVIEW */}
              <div className="flex-1 border border-[#333] bg-[#000] flex items-center justify-center relative min-h-0">
                <div className="absolute top-[15px] left-[15px] text-[14px] text-[#555] font-['Orbitron'] pointer-events-none tracking-widest">
                  SELECTED MEDIA PREVIEW
                </div>
                <div className="w-[95%] h-[95%] flex items-center justify-center p-[20px]">
                  {adminPreviewSrc &&
                    (adminPreviewSrc.endsWith(".mp4") ||
                    adminPreviewSrc.endsWith(".webm") ? (
                      <video
                        src={adminPreviewSrc}
                        controls
                        autoPlay
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      />
                    ) : (
                      <img
                        src={adminPreviewSrc}
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      />
                    ))}
                </div>
              </div>
            </>
          )}
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
                  <div className="text-[7px] text-[#555] mt-[15px] font-mono">
                    NODE.CLK: <span id="dash-clk">{clock}</span>
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
