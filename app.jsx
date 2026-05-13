/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakButton */
const { useState, useEffect, useRef, useMemo } = React;

// ============================================================
// TWEAK DEFAULTS — host edits this JSON block
// ============================================================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0e1a10", "#1e2d18", "#b8954a", "#d94f7e"],
  "fogIntensity": "Тяжёлый",
  "headerStyle": "Готика",
  "accentPop": true
}/*EDITMODE-END*/;

// ============================================================
// SHREK IMAGES — random per peek
// ============================================================
// pos: objectPosition to crop to face; scale: zoom factor for full-body shots
const SHREK_IMAGES = [
  { src: "shrek1.png",  pos: "50% 12%", scale: 2.2 },  // full body — zoom 2.2x to face
  { src: "shrek2.png",  pos: "center top", scale: 1 },
  { src: "shrek3.png",  pos: "center top", scale: 1 },
  { src: "shrek4.png",  pos: "center top", scale: 1 },
];

// ============================================================
// CONSTANTS
// ============================================================
const RECIPIENT = "Ром4ик";
const SENDER = "Мишунчик";

const WISHES = [
  {
    layer: "Слой 1",
    title: "Болото уюта",
    body: "Чтобы твой год был как тёплое болото — глубокий, мшистый, никто не лезет без приглашения, а лягушки поют только хорошее.",
    onion: "🧅"
  },
  {
    layer: "Слой 2",
    title: "Луковая правда",
    body: "Чтобы каждый слой жизни открывался без слёз. А если со слезами — то только от смеха, и обязательно под пиво в кружке размером с твою голову.",
    onion: "🧅"
  },
  {
    layer: "Слой 3",
    title: "Огрское достоинство",
    body: "Чтобы ты оставался собой — громким, настоящим, немного грязным, очень любимым. Принцесс не обещаю, но осла и верных друзей — всегда.",
    onion: "🧅"
  }
];

// ============================================================
// FOG / MIST OVERLAY
// ============================================================
function Fog({ intensity }) {
  const opacity = intensity === "Лёгкий" ? 0.25 : intensity === "Средний" ? 0.5 : 0.78;
  return (
    <div className="fog-wrap" style={{ opacity }}>
      <div className="fog fog-1"></div>
      <div className="fog fog-2"></div>
      <div className="fog fog-3"></div>
      <div className="grain"></div>
    </div>
  );
}

// ============================================================
// ONION ICON (placeholder hand-drawn-ish — using emoji for safety)
// ============================================================
function Onion({ size = 24, style = {} }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1, display: "inline-block", ...style }}>🧅</span>
  );
}

// ============================================================
// OGRE PEEK — generic swamp-dweller silhouette peeking from edges
// Round green head, no specific character features.
// ============================================================
const PEEK_SPOTS = [
  // each: which edge + offset along that edge + rotation
  { edge: "left",   pos: 22, rot: -12, scale: 1.0 },
  { edge: "right",  pos: 38, rot: 14,  scale: 0.85 },
  { edge: "top",    pos: 28, rot: -8,  scale: 0.75 },
  { edge: "left",   pos: 70, rot: -6,  scale: 0.95 },
  { edge: "right",  pos: 75, rot: 18,  scale: 1.1 },
  { edge: "bottom", pos: 18, rot: 6,   scale: 0.8 },
  { edge: "top",    pos: 78, rot: 12,  scale: 0.7 },
  { edge: "bottom", pos: 82, rot: -10, scale: 0.9 }
];

function OgreSilhouette({ size = 120, src }) {
  return (
    <img
      src={src}
      alt=""
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        mixBlendMode: "multiply",
        filter: "drop-shadow(0 8px 16px rgba(0,0,0,.7))",
      }}
    />
  );
}

function OgrePeek({ screen }) {
  // pick a different spot index based on screen so each screen feels distinct
  const seedOffset = { intro: 0, reveal: 3, finale: 5 }[screen] ?? 0;
  const [spotIdx, setSpotIdx] = useState(seedOffset % PEEK_SPOTS.length);
  const [imgIdx, setImgIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let aliveTimer, hideTimer;

    function cycle() {
      setImgIdx(Math.floor(Math.random() * SHREK_IMAGES.length));
      // pick a new random spot (not same as last)
      setSpotIdx(prev => {
        let n = prev;
        while (n === prev) n = Math.floor(Math.random() * PEEK_SPOTS.length);
        return n;
      });
      // wait one paint so the element settles into new spot's hidden position,
      // then transition into the shown position
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      hideTimer = setTimeout(() => setVisible(false), 2600 + Math.random() * 1400);
      aliveTimer = setTimeout(cycle, 6000 + Math.random() * 5000);
    }

    // initial peek after short delay
    aliveTimer = setTimeout(cycle, 2200 + Math.random() * 1800);

    return () => {
      clearTimeout(aliveTimer);
      clearTimeout(hideTimer);
    };
  }, [screen]);

  const spot = PEEK_SPOTS[spotIdx];

  // Full circle visible inside screen when shown; hidden fully behind edge
  const W = 120, H = 120, PAD = 16;
  let style = {
    "--rot": `${spot.rot}deg`,
    "--scale": spot.scale,
  };
  if (spot.edge === "left") {
    style.left = 0; style.top = `${spot.pos}%`;
    style["--hidden-x"] = `${-(W + PAD)}px`; style["--hidden-y"] = `${-H / 2}px`;
    style["--shown-x"]  = `${PAD}px`;         style["--shown-y"]  = `${-H / 2}px`;
  } else if (spot.edge === "right") {
    style.right = 0; style.top = `${spot.pos}%`;
    style["--hidden-x"] = `${PAD}px`;           style["--hidden-y"] = `${-H / 2}px`;
    style["--shown-x"]  = `${-(W + PAD)}px`;    style["--shown-y"]  = `${-H / 2}px`;
  } else if (spot.edge === "top") {
    style.top = 0; style.left = `${spot.pos}%`;
    style["--hidden-x"] = `${-W / 2}px`;   style["--hidden-y"] = `${-(H + PAD)}px`;
    style["--shown-x"]  = `${-W / 2}px`;   style["--shown-y"]  = `${PAD}px`;
  } else { // bottom
    style.bottom = 0; style.left = `${spot.pos}%`;
    style["--hidden-x"] = `${-W / 2}px`;   style["--hidden-y"] = `${PAD}px`;
    style["--shown-x"]  = `${-W / 2}px`;   style["--shown-y"]  = `${-(H + PAD)}px`;
  }

  return (
    <div
      className={`ogre-peek edge-${spot.edge} ${visible ? "show" : "hide"}`}
      style={style}
      aria-hidden="true"
    >
      <div className="ogre-bob">
        <OgreSilhouette
          size={120}
          src={SHREK_IMAGES[imgIdx].src}
          imgPos={SHREK_IMAGES[imgIdx].pos}
          imgScale={SHREK_IMAGES[imgIdx].scale}
        />
      </div>
    </div>
  );
}

// ============================================================
// SWAMP BACKDROP — layered SVG hills + reeds
// ============================================================
function SwampBackdrop({ palette }) {
  const [bg, moss, gold, accent] = palette;
  return (
    <div className="swamp-bg" aria-hidden="true">
      <div className="moon"></div>
      <svg className="hills" viewBox="0 0 400 600" preserveAspectRatio="none">
        <defs>
          <radialGradient id="skyGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor={gold} stopOpacity="0.18" />
            <stop offset="55%" stopColor={moss} stopOpacity="0.0" />
            <stop offset="100%" stopColor={bg} stopOpacity="0.0" />
          </radialGradient>
        </defs>
        <rect width="400" height="600" fill="url(#skyGlow)" />
        {/* far hills */}
        <path d="M0,360 Q60,300 120,330 T240,310 T400,340 L400,600 L0,600 Z"
              fill={moss} opacity="0.55" />
        {/* mid hills */}
        <path d="M0,430 Q80,380 160,410 T320,400 T400,420 L400,600 L0,600 Z"
              fill={moss} opacity="0.85" />
        {/* near hills with reeds */}
        <path d="M0,500 Q70,460 140,485 T280,478 T400,495 L400,600 L0,600 Z"
              fill={bg} />
        {/* reeds */}
        {[40, 70, 95, 130, 175, 215, 255, 305, 345, 380].map((x, i) => (
          <g key={i} transform={`translate(${x}, ${500 + (i % 3) * 8})`}>
            <line x1="0" y1="0" x2={i % 2 ? 3 : -3} y2={-40 - (i % 4) * 10}
                  stroke={gold} strokeWidth="1.2" opacity="0.55" />
            <ellipse cx={i % 2 ? 3 : -3} cy={-40 - (i % 4) * 10} rx="1.5" ry="4"
                     fill={gold} opacity="0.7" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// INTRO SCREEN
// ============================================================
function IntroScreen({ onOpen, palette, fogIntensity, accentPop }) {
  const [, accentMoss, gold, magenta] = palette;
  const accent = accentPop ? magenta : gold;

  return (
    <section className="screen intro" data-screen-label="01 Intro">
      <SwampBackdrop palette={palette} />
      <Fog intensity={fogIntensity} />
      <OgrePeek screen="intro" />

      <div className="intro-content">
        <div className="kicker">
          <span className="kicker-line"></span>
          <span>Сказка из болота · MMXXVI</span>
          <span className="kicker-line"></span>
        </div>

        <div className="intro-eyebrow">
          Сообщение для
          <div className="recipient-frame">
            <Onion size={18} style={{ opacity: 0.7 }} />
            <span className="recipient-name">{RECIPIENT}</span>
            <Onion size={18} style={{ opacity: 0.7 }} />
          </div>
        </div>

        <h1 className="intro-title">
          <span className="line line-1">Где-то</span>
          <span className="line line-2">в далёком</span>
          <span className="line line-3">болоте...</span>
        </h1>

        <p className="intro-sub">
          сегодня случилось нечто невообразимое.
          <br />
          Кто-то стал на год мудрее, громче и&nbsp;луковичнее.
        </p>

        <button className="cta" onClick={onOpen} style={{ "--accent": accent }}>
          <span className="cta-glow"></span>
          <span className="cta-inner">
            <span className="cta-label">Открыть поздравление</span>
            <span className="cta-arrow">→</span>
          </span>
          <span className="cta-ring"></span>
        </button>

        <div className="intro-foot">
          <span className="dot"></span>
          нажми на свиток · оно безопасно · честное огрское
          <span className="dot"></span>
        </div>
      </div>

      {/* floating onions */}
      <div className="floaters" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`floater f${i}`}>🧅</span>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// REVEAL SCREEN — accordion of "layers"
// ============================================================
function RevealScreen({ onNext, palette, fogIntensity, accentPop }) {
  const [, , gold, magenta] = palette;
  const accent = accentPop ? magenta : gold;
  const [openIdx, setOpenIdx] = useState(0);
  const [revealed, setRevealed] = useState([true, false, false]);

  function toggle(i) {
    if (!revealed[i]) {
      const next = [...revealed];
      next[i] = true;
      setRevealed(next);
    }
    setOpenIdx(openIdx === i ? -1 : i);
  }

  const allRevealed = revealed.every(Boolean);

  return (
    <section className="screen reveal" data-screen-label="02 Reveal">
      <SwampBackdrop palette={palette} />
      <Fog intensity={fogIntensity === "Тяжёлый" ? "Средний" : "Лёгкий"} />
      <OgrePeek screen="reveal" />

      <div className="reveal-content">
        <div className="reveal-header">
          <div className="parchment-quote">
            <div className="quote-mark">«</div>
            <p className="quote-text">
              Огры — как луковицы.<br />
              У них есть&nbsp;<em>слои</em>.
            </p>
            <div className="quote-attrib">— старая болотная мудрость</div>
          </div>

          <h2 className="reveal-title">
            Три слоя<br />
            <span className="title-gold">поздравления</span>
          </h2>

          <p className="reveal-instr">
            нажми на каждый слой, чтобы развернуть · слёзы по желанию
          </p>
        </div>

        <div className="layers">
          {WISHES.map((w, i) => (
            <article
              key={i}
              className={`layer-card ${openIdx === i ? "open" : ""} ${revealed[i] ? "revealed" : "sealed"}`}
              style={{ "--accent": accent, "--delay": `${i * 80}ms` }}
              onClick={() => toggle(i)}
            >
              <div className="layer-corner tl"></div>
              <div className="layer-corner tr"></div>
              <div className="layer-corner bl"></div>
              <div className="layer-corner br"></div>

              <header className="layer-head">
                <div className="layer-num">
                  <Onion size={28} />
                  <span className="layer-num-text">{w.layer}</span>
                </div>
                <h3 className="layer-title">{w.title}</h3>
                <span className="layer-chev">{openIdx === i ? "−" : "+"}</span>
              </header>

              <div className="layer-body">
                <div className="layer-divider">
                  <span></span><Onion size={14} /><span></span>
                </div>
                <p>{w.body}</p>
              </div>

              {!revealed[i] && (
                <div className="seal">
                  <span>запечатано</span>
                </div>
              )}
            </article>
          ))}
        </div>

        <button
          className={`cta cta-finale ${allRevealed ? "ready" : "waiting"}`}
          onClick={allRevealed ? onNext : undefined}
          style={{ "--accent": accent }}
          disabled={!allRevealed}
        >
          <span className="cta-glow"></span>
          <span className="cta-inner">
            <span className="cta-label">
              {allRevealed ? "К главному" : `Открой все слои (${revealed.filter(Boolean).length}/3)`}
            </span>
            {allRevealed && <span className="cta-arrow">→</span>}
          </span>
          <span className="cta-ring"></span>
        </button>
      </div>
    </section>
  );
}

// ============================================================
// FINALE — onion confetti + big gothic quote
// ============================================================
function FinaleScreen({ onRestart, palette, fogIntensity, accentPop }) {
  const [, , gold, magenta] = palette;
  const accent = accentPop ? magenta : gold;
  const [showSig, setShowSig] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSig(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // generate confetti once
  const confetti = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 5 + Math.random() * 5,
      size: 16 + Math.random() * 28,
      drift: (Math.random() - 0.5) * 60,
      rot: Math.random() * 360,
      spinDur: 3 + Math.random() * 5,
      key: i
    }));
  }, []);

  return (
    <section className="screen finale" data-screen-label="03 Finale">
      <SwampBackdrop palette={palette} />
      <Fog intensity="Лёгкий" />
      <OgrePeek screen="finale" />

      {/* onion confetti */}
      <div className="confetti" aria-hidden="true">
        {confetti.map(c => (
          <span
            key={c.key}
            className="conf"
            style={{
              left: `${c.left}%`,
              fontSize: `${c.size}px`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              "--drift": `${c.drift}px`,
              "--spin-dur": `${c.spinDur}s`,
              "--rot": `${c.rot}deg`
            }}
          >🧅</span>
        ))}
      </div>

      <div className="finale-content">
        <div className="finale-banner">
          <div className="banner-line"></div>
          <span>С Днём Рождения</span>
          <div className="banner-line"></div>
        </div>

        <h1 className="finale-quote" style={{ "--accent": accent }}>
          <span className="fq-line fq-1">Расти,</span>
          <span className="fq-line fq-2">как лук</span>
          <span className="fq-line fq-3">в&nbsp;болоте —</span>
          <span className="fq-line fq-4 fq-accent">в&nbsp;три слоя</span>
          <span className="fq-line fq-5">и&nbsp;до&nbsp;неба.</span>
        </h1>

        <div className="finale-recipient">
          <div className="rec-line"></div>
          <div className="rec-stack">
            <span className="rec-label">посвящается</span>
            <span className="rec-name">{RECIPIENT}</span>
          </div>
          <div className="rec-line"></div>
        </div>

        <div className={`signature ${showSig ? "show" : ""}`}>
          <div className="sig-seal">
            <Onion size={32} />
          </div>
          <div className="sig-text">
            <span className="sig-from">твой верный огр,</span>
            <span className="sig-name">{SENDER}</span>
          </div>
          <div className="sig-seal">
            <Onion size={32} />
          </div>
        </div>

        <button className="restart" onClick={onRestart}>
          ↺ сначала
        </button>
      </div>
    </section>
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("intro");
  const [direction, setDirection] = useState("forward");

  function go(next) {
    setDirection("forward");
    setScreen(next);
  }
  function back(next) {
    setDirection("back");
    setScreen(next);
  }

  const palette = tweaks.palette;

  return (
    <div className="app" style={{
      "--bg": palette[0],
      "--moss": palette[1],
      "--gold": palette[2],
      "--accent": palette[3]
    }}>
      <div className={`screen-stack ${direction}`}>
        {screen === "intro" && (
          <IntroScreen
            onOpen={() => go("reveal")}
            palette={palette}
            fogIntensity={tweaks.fogIntensity}
            accentPop={tweaks.accentPop}
          />
        )}
        {screen === "reveal" && (
          <RevealScreen
            onNext={() => go("finale")}
            palette={palette}
            fogIntensity={tweaks.fogIntensity}
            accentPop={tweaks.accentPop}
          />
        )}
        {screen === "finale" && (
          <FinaleScreen
            onRestart={() => back("intro")}
            palette={palette}
            fogIntensity={tweaks.fogIntensity}
            accentPop={tweaks.accentPop}
          />
        )}
      </div>

      {/* screen nav dots */}
      <div className="nav-dots">
        {["intro", "reveal", "finale"].map((s, i) => (
          <button
            key={s}
            className={`dot-btn ${screen === s ? "active" : ""}`}
            onClick={() => (i > ["intro","reveal","finale"].indexOf(screen) ? go(s) : back(s))}
            aria-label={s}
          >
            <span></span>
          </button>
        ))}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Палитра">
          <TweakColor
            label="Цветовая схема"
            value={tweaks.palette}
            onChange={(v) => setTweak("palette", v)}
            options={[
              ["#0e1a10", "#1e2d18", "#b8954a", "#d94f7e"], // swamp default
              ["#0a1612", "#142420", "#c9a45a", "#e85d4a"], // bog + ember
              ["#101a14", "#1a2f1e", "#a8b85a", "#7e3fb8"], // moss + magic
              ["#13140e", "#252618", "#d4a85a", "#3fa8c4"]  // mud + frost
            ]}
          />
        </TweakSection>
        <TweakSection title="Атмосфера">
          <TweakRadio
            label="Туман"
            value={tweaks.fogIntensity}
            onChange={(v) => setTweak("fogIntensity", v)}
            options={["Лёгкий", "Средний", "Тяжёлый"]}
          />
          <TweakToggle
            label="Яркий акцент"
            value={tweaks.accentPop}
            onChange={(v) => setTweak("accentPop", v)}
          />
        </TweakSection>
        <TweakSection title="Экраны">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["intro","reveal","finale"].map(s => (
              <button key={s} className="tweak-jump-btn"
                onClick={() => setScreen(s)}
                data-active={screen === s}>
                {s}
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
