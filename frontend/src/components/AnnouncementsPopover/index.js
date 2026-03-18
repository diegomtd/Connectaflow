import React, { useEffect, useReducer, useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme }   from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import moment     from "moment";
import { isArray } from "lodash";

import Popover        from "@material-ui/core/Popover";
import Dialog         from "@material-ui/core/Dialog";
import DialogActions  from "@material-ui/core/DialogActions";
import Button         from "@material-ui/core/Button";
import IconButton     from "@material-ui/core/IconButton";
import Badge          from "@material-ui/core/Badge";
import Avatar         from "@material-ui/core/Avatar";

import CampaignRoundedIcon  from "@material-ui/icons/RecordVoiceOver";
import InboxRoundedIcon     from "@material-ui/icons/InboxRounded";
import CloseRoundedIcon     from "@material-ui/icons/CloseRounded";
import ErrorRoundedIcon     from "@material-ui/icons/ErrorRounded";
import WarningRoundedIcon   from "@material-ui/icons/WarningRounded";
import InfoRoundedIcon      from "@material-ui/icons/InfoRounded";

import { i18n }        from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import api             from "../../services/api";

/* ── LinkText helper ─────────────────────────────────────────────────────── */
const LinkText = ({ text = "" }) => {
  const theme   = useTheme();
  const PRIMARY = theme?.palette?.primary?.main || "#6366f1";
  const urlRegex = /((https?:\/\/|www\.)[^\s)]+|mailto:[^\s)]+)/gi;

  const parts = [];
  let last = 0, m;
  while ((m = urlRegex.exec(text)) !== null) {
    const [raw] = m, start = m.index;
    if (start > last) parts.push(text.slice(last, start));
    const href = raw.startsWith("www.") ? `https://${raw}` : raw;
    parts.push(
      <a key={`${start}`} href={href} target="_blank" rel="noopener noreferrer"
         style={{ color: PRIMARY, textDecoration: "underline", wordBreak: "break-word" }}>
        {raw}
      </a>
    );
    last = start + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));

  const withBreaks = [];
  parts.forEach((p, i) => {
    const chunks = typeof p === "string" ? p.split("\n") : [p];
    chunks.forEach((c, j) => {
      withBreaks.push(c);
      if (j < chunks.length - 1) withBreaks.push(<br key={`br-${i}-${j}`} />);
    });
  });

  return (
    <span style={{ fontSize: "0.80rem", color: "#475569", lineHeight: 1.55,
                   fontFamily: "'DM Sans', system-ui, sans-serif", whiteSpace: "pre-line" }}>
      {withBreaks}
    </span>
  );
};

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark     = theme.palette.type === "dark" || theme.mode === "dark";
  const menuBg     = isDark ? "#0e1521"                    : "#ffffff";
  const menuHeadBg = isDark ? "#080e17"                    : "#f8fafc";
  const menuHover  = isDark ? "rgba(255,255,255,0.06)"     : "#f8fafc";
  const border     = isDark ? "rgba(255,255,255,0.07)"     : "#e8edf4";
  const borderHov  = isDark ? "rgba(255,255,255,0.14)"     : "#cbd5e1";
  const textPri    = isDark ? "#e2e8f0"                    : "#0f172a";
  const shadow     = isDark
    ? "0 12px 40px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30)"
    : "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)";

  return {
    paper: {
      width: 360,
      borderRadius: "16px !important",
      border: `1px solid ${border} !important`,
      background: `${menuBg} !important`,
      boxShadow: `${shadow} !important`,
      overflow: "hidden !important",
      marginTop: 8,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },

    header: {
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 18px",
      borderBottom: `1px solid ${border}`,
      background: menuHeadBg,
    },
    headerIcon: {
      width: 38, height: 38, borderRadius: 11,
      background: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.20)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#f59e0b", flexShrink: 0,
      "& svg": { fontSize: "1.15rem !important" },
    },
    headerTitle: {
      fontSize: "0.875rem", fontWeight: 700, color: textPri,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    headerSub: {
      fontSize: "0.70rem", color: "#64748b",
      fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 1,
    },
    countBadge: {
      marginLeft: "auto",
      background: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.22)",
      color: "#f59e0b", fontSize: "0.68rem", fontWeight: 700,
      borderRadius: 20, padding: "2px 9px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },

    list: {
      maxHeight: 380, overflowY: "auto", padding: "8px",
      background: menuBg,
      "&::-webkit-scrollbar": { width: 3 },
      "&::-webkit-scrollbar-thumb": { background: "rgba(100,116,139,0.20)", borderRadius: 3 },
    },

    item: {
      display: "flex", gap: 12,
      padding: "10px 12px", borderRadius: 12,
      border: `1px solid ${border}`,
      cursor: "pointer",
      transition: "background 0.13s, border-color 0.13s",
      marginBottom: 6,
      "&:hover": { background: menuHover, borderColor: borderHov },
      "&:last-child": { marginBottom: 0 },
    },
    itemAvatar: {
      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    },
    priorityBar: {
      width: 3, borderRadius: 2, flexShrink: 0, alignSelf: "stretch", minHeight: 36,
    },
    itemContent: { flex: 1, minWidth: 0 },
    itemTitle: {
      fontSize: "0.82rem", fontWeight: 700, color: textPri,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    itemDate: {
      fontSize: "0.68rem", color: "#94a3b8",
      fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 1,
    },
    itemText: {
      fontSize: "0.75rem", color: "#64748b",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      marginTop: 3,
      overflow: "hidden", textOverflow: "ellipsis",
      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
    },

    priorityIconWrap: {
      width: 28, height: 28, borderRadius: 7, flexShrink: 0, alignSelf: "flex-start",
      display: "flex", alignItems: "center", justifyContent: "center",
      "& svg": { fontSize: "0.95rem !important" },
    },

    emptyWrap: {
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", gap: 10,
    },
    emptyIcon: {
      width: 44, height: 44, borderRadius: 12,
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(100,116,139,0.08)",
      border: `1px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8",
      "& svg": { fontSize: "1.3rem !important" },
    },
    emptyText: {
      fontSize: "0.82rem", color: "#64748b",
      fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500,
    },

    /* Dialog moderno */
    dialogPaper: {
      borderRadius: "16px !important",
      border: `1px solid ${border}`,
      background: `${menuBg} !important`,
      boxShadow: `${isDark
        ? "0 20px 60px rgba(0,0,0,0.60)"
        : "0 20px 60px rgba(0,0,0,0.18)"} !important`,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      maxWidth: 480, width: "100%",
    },
    dialogHeader: {
      display: "flex", alignItems: "center", gap: 14,
      padding: "18px 20px",
      borderBottom: `1px solid ${border}`,
      background: menuHeadBg,
    },
    dialogHeaderIcon: {
      width: 44, height: 44, borderRadius: 12,
      background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.20)",
      display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b",
      "& svg": { fontSize: "1.3rem !important" },
    },
    dialogClose: {
      marginLeft: "auto", width: 28, height: 28, borderRadius: 7,
      background: "transparent", border: `1px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: "#64748b",
      transition: "background 0.14s",
      "&:hover": { background: menuHover },
      "& svg": { fontSize: "0.95rem !important" },
    },
    dialogTitle: {
      fontSize: "0.95rem", fontWeight: 700, color: textPri,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    dialogBody: { padding: "16px 20px", background: menuBg },
    dialogImg: {
      width: "100%", maxHeight: 220, objectFit: "cover",
      borderRadius: 10, border: `1px solid ${border}`, marginBottom: 14,
    },
    dialogFooter: {
      padding: "12px 20px",
      borderTop: `1px solid ${border}`,
      background: menuHeadBg,
    },
  };
});

/* ── Priority helpers ────────────────────────────────────────────────────── */
const PRIORITY = {
  1: { color: "#ef4444", bg: "rgba(239,68,68,0.10)",   Icon: ErrorRoundedIcon },
  2: { color: "#f97316", bg: "rgba(249,115,22,0.10)",  Icon: WarningRoundedIcon },
  3: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", Icon: InfoRoundedIcon },
};

/* ── Reducer ─────────────────────────────────────────────────────────────── */
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_ANNOUNCEMENTS": {
      const next = [...state];
      (isArray(action.payload) ? action.payload : []).forEach(a => {
        const i = next.findIndex(u => u.id === a.id);
        i !== -1 ? (next[i] = a) : next.push(a);
      });
      return next;
    }
    case "UPDATE_ANNOUNCEMENTS": {
      const i = state.findIndex(u => u.id === action.payload.id);
      if (i !== -1) { const s = [...state]; s[i] = action.payload; return s; }
      return [action.payload, ...state];
    }
    case "DELETE_ANNOUNCEMENT":
      return state.filter(u => u.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

/* ── AnnouncementDialog ──────────────────────────────────────────────────── */
function AnnouncementDialog({ announcement, open, handleClose }) {
  const classes = useStyles();
  const p    = PRIORITY[announcement.priority] || PRIORITY[3];
  const Icon = p.Icon;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <div className={classes.dialogHeader}>
        <div className={classes.dialogHeaderIcon}><Icon /></div>
        <div>
          <div className={classes.dialogTitle}>{announcement.title}</div>
        </div>
        <button className={classes.dialogClose} onClick={handleClose}>
          <CloseRoundedIcon />
        </button>
      </div>

      <div className={classes.dialogBody}>
        {announcement.mediaPath && (
          <img src={announcement.mediaPath} alt="announcement" className={classes.dialogImg} />
        )}
        <LinkText text={announcement.text || ""} />
      </div>

      <DialogActions className={classes.dialogFooter}>
        <Button
          onClick={handleClose}
          variant="contained"
          disableElevation
          style={{
            background: "#6366f1", color: "#fff", borderRadius: 9,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 600, fontSize: "0.82rem", textTransform: "none",
            padding: "7px 20px",
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function AnnouncementsPopover() {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [anchorEl,   setAnchorEl]   = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [searchParam]               = useState("");
  const [announcements, dispatch]   = useReducer(reducer, []);
  const [invisible,  setInvisible]  = useState(false);
  const [selected,   setSelected]   = useState({});
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => { dispatch({ type: "RESET" }); setPageNumber(1); }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(fetchAnnouncements, 500);
    return () => clearTimeout(t);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!user.companyId) return;
    const onAnnouncement = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
        setInvisible(false);
      }
      if (data.action === "delete") dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
    };
    socket.on("company-announcement", onAnnouncement);
    return () => socket.off("company-announcement", onAnnouncement);
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", { params: { searchParam, pageNumber } });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) { toastError(err); }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) setPageNumber(p => p + 1);
  };

  const handleOpen = (item) => { setSelected(item); setShowDialog(true); setAnchorEl(null); };
  const open       = Boolean(anchorEl);

  return (
    <div>
      <AnnouncementDialog
        announcement={selected}
        open={showDialog}
        handleClose={() => setShowDialog(false)}
      />

      <IconButton
        onClick={(e) => { setAnchorEl(e.currentTarget); setInvisible(true); }}
        aria-label="Avisos"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        <Badge color="secondary" variant="dot" overlap="rectangular"
               invisible={invisible || announcements.length < 1}>
          <CampaignRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top",    horizontal: "right" }}
        classes={{ paper: classes.paper }}
        disableScrollLock
      >
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerIcon}><CampaignRoundedIcon /></div>
          <div>
            <div className={classes.headerTitle}>Avisos</div>
            <div className={classes.headerSub}>Comunicados da equipe</div>
          </div>
          {announcements.length > 0 && (
            <span className={classes.countBadge}>{announcements.length}</span>
          )}
        </div>

        {/* Lista */}
        <div className={classes.list} onScroll={handleScroll}>
          {!isArray(announcements) || announcements.length === 0 ? (
            <div className={classes.emptyWrap}>
              <div className={classes.emptyIcon}><InboxRoundedIcon /></div>
              <span className={classes.emptyText}>{i18n.t("mainDrawer.appBar.notRegister")}</span>
            </div>
          ) : (
            announcements.map(item => {
              const p    = PRIORITY[item.priority] || PRIORITY[3];
              const Icon = p.Icon;
              return (
                <div key={item.id} className={classes.item} onClick={() => handleOpen(item)}>
                  <div className={classes.priorityBar} style={{ background: p.color }} />
                  {item.mediaPath && (
                    <Avatar src={item.mediaPath} variant="rounded" className={classes.itemAvatar} />
                  )}
                  {!item.mediaPath && (
                    <div className={classes.priorityIconWrap} style={{ background: p.bg, color: p.color }}>
                      <Icon />
                    </div>
                  )}
                  <div className={classes.itemContent}>
                    <div className={classes.itemTitle}>{item.title}</div>
                    <div className={classes.itemDate}>{moment(item.createdAt).format("DD/MM/YYYY")}</div>
                    {item.text && <div className={classes.itemText}>{item.text}</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Popover>
    </div>
  );
}