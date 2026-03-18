import React, { useState, useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Popover    from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import Slider     from "@material-ui/core/Slider";

import VolumeUpRoundedIcon      from "@material-ui/icons/VolumeUpRounded";
import VolumeOffRoundedIcon     from "@material-ui/icons/VolumeOffRounded";
import VolumeDownRoundedIcon    from "@material-ui/icons/VolumeDownRounded";
import PlayArrowRoundedIcon     from "@material-ui/icons/PlayArrowRounded";
import CheckRoundedIcon         from "@material-ui/icons/CheckRounded";
import MusicNoteRoundedIcon     from "@material-ui/icons/MusicNoteRounded";

import { SOUND_OPTIONS } from "../../utils/notificationSounds";

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => ({
  paper: {
    width: 300,
    borderRadius: "16px !important",
    border: "1px solid #e8edf4 !important",
    background: "#ffffff !important",
    boxShadow: "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08) !important",
    overflow: "hidden !important",
    marginTop: 8,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 18px",
    borderBottom: "1px solid #e8edf4",
    background: "#f8fafc",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: "rgba(245,158,11,0.10)",
    border: "1px solid rgba(245,158,11,0.20)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f59e0b",
    flexShrink: 0,
    "& svg": { fontSize: "1.15rem !important" },
  },
  headerTitle: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  headerSub: {
    fontSize: "0.70rem",
    color: "#64748b",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    marginTop: 1,
  },

  /* Volume section */
  section: {
    padding: "14px 18px",
    borderBottom: "1px solid #e8edf4",
  },
  sectionLabel: {
    fontSize: "0.64rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    marginBottom: 12,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  volumeRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  volumeIcon: {
    color: "#64748b",
    flexShrink: 0,
    "& svg": { fontSize: "1.15rem !important" },
  },
  slider: {
    flex: 1,
    color: "#6366f1",
    "& .MuiSlider-thumb": {
      width: 14,
      height: 14,
      marginTop: -5,
      marginLeft: -7,
      background: "#ffffff",
      border: "2px solid #6366f1",
      boxShadow: "0 1px 4px rgba(99,102,241,0.30)",
      "&:hover, &.Mui-focusVisible": {
        boxShadow: "0 0 0 6px rgba(99,102,241,0.14)",
      },
    },
    "& .MuiSlider-track": {
      height: 4,
      borderRadius: 2,
    },
    "& .MuiSlider-rail": {
      height: 4,
      borderRadius: 2,
      background: "#e2e8f0",
    },
  },
  volumeValue: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#6366f1",
    minWidth: 30,
    textAlign: "right",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  /* Sound list */
  soundList: {
    padding: "8px",
    maxHeight: 220,
    overflowY: "auto",
    "&::-webkit-scrollbar": { width: 3 },
    "&::-webkit-scrollbar-thumb": { background: "rgba(100,116,139,0.20)", borderRadius: 3 },
  },
  soundItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.12s",
    "&:hover": { background: "#f1f5f9" },
  },
  soundItemSelected: {
    background: "rgba(99,102,241,0.07)",
    "&:hover": { background: "rgba(99,102,241,0.11)" },
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "#f1f5f9",
    border: "1px solid #e8edf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "pointer",
    transition: "background 0.12s, border-color 0.12s",
    color: "#475569",
    "&:hover": { background: "#e2e8f0", borderColor: "#cbd5e1" },
    "& svg": { fontSize: "0.95rem !important" },
  },
  soundIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#6366f1",
    "& svg": { fontSize: "0.90rem !important" },
  },
  soundLabel: {
    flex: 1,
    fontSize: "0.82rem",
    fontWeight: 500,
    color: "#0f172a",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  checkIcon: {
    color: "#6366f1",
    flexShrink: 0,
    "& svg": { fontSize: "1rem !important" },
  },
}));

/* ── Componente ──────────────────────────────────────────────────────────── */
const NotificationsVolume = ({ volume, setVolume, notificationSound, setNotificationSound }) => {
  const classes = useStyles();

  const anchorEl      = useRef();
  const previewRef    = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const pct = Math.round(Number(volume) * 100);

  const handleVolumeChange = (_, value) => {
    setVolume(value);
    localStorage.setItem("volume", String(value));
  };

  const handleSoundChange = (id) => {
    setNotificationSound(id);
    localStorage.setItem("notificationSound", id);
  };

  const handlePreview = (e, src) => {
    e.stopPropagation();
    if (previewRef.current) { previewRef.current.pause(); previewRef.current.currentTime = 0; }
    const audio = new Audio(src);
    audio.volume = Number(volume) || 1;
    audio.play().catch(() => {});
    previewRef.current = audio;
  };

  useEffect(() => {
    if (previewRef.current) previewRef.current.volume = Number(volume) || 1;
  }, [volume]);

  useEffect(() => () => { if (previewRef.current) { previewRef.current.pause(); } }, []);

  const VolumeIcon = pct === 0 ? VolumeOffRoundedIcon : pct < 50 ? VolumeDownRoundedIcon : VolumeUpRoundedIcon;

  return (
    <>
      <IconButton
        ref={anchorEl}
        onClick={() => setIsOpen(p => !p)}
        aria-label="Volume das notificações"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        <VolumeIcon />
      </IconButton>

      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top",    horizontal: "right" }}
        classes={{ paper: classes.paper }}
        onClose={() => setIsOpen(false)}
      >
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerIcon}><VolumeUpRoundedIcon /></div>
          <div>
            <div className={classes.headerTitle}>Áudio</div>
            <div className={classes.headerSub}>Volume e som das notificações</div>
          </div>
        </div>

        {/* Volume */}
        <div className={classes.section}>
          <div className={classes.sectionLabel}>Volume</div>
          <div className={classes.volumeRow}>
            <span className={classes.volumeIcon}><VolumeDownRoundedIcon /></span>
            <Slider
              className={classes.slider}
              value={Number(volume)}
              step={0.05}
              min={0}
              max={1}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
            <span className={classes.volumeIcon}><VolumeUpRoundedIcon /></span>
            <span className={classes.volumeValue}>{pct}%</span>
          </div>
        </div>

        {/* Sons */}
        <div className={classes.section} style={{ borderBottom: "none", paddingBottom: 0 }}>
          <div className={classes.sectionLabel}>Som da notificação</div>
        </div>
        <div className={classes.soundList}>
          {SOUND_OPTIONS.map((opt) => {
            const selected = opt.id === notificationSound;
            return (
              <div
                key={opt.id}
                className={`${classes.soundItem} ${selected ? classes.soundItemSelected : ""}`}
                onClick={() => handleSoundChange(opt.id)}
              >
                <button className={classes.playBtn} onClick={(e) => handlePreview(e, opt.src)}>
                  <PlayArrowRoundedIcon />
                </button>
                <div className={classes.soundIconWrap}><MusicNoteRoundedIcon /></div>
                <span className={classes.soundLabel}>{opt.label}</span>
                {selected && <span className={classes.checkIcon}><CheckRoundedIcon /></span>}
              </div>
            );
          })}
        </div>
        <div style={{ height: 8 }} />
      </Popover>
    </>
  );
};

export default NotificationsVolume;