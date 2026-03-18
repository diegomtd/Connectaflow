import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import { isArray } from "lodash";

import Popover    from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import Badge      from "@material-ui/core/Badge";
import Avatar     from "@material-ui/core/Avatar";

import ForumRoundedIcon from "@material-ui/icons/ForumRounded";
import InboxRoundedIcon from "@material-ui/icons/InboxRounded";

import api            from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate }    from "../../hooks/useDate";
import { i18n }       from "../../translate/i18n";
import notifySound    from "../../assets/chat_notify.mp3";
import useSound       from "use-sound";

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
      background: "rgba(99,102,241,0.10)",
      border: "1px solid rgba(99,102,241,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#6366f1", flexShrink: 0,
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
    unreadsChip: {
      marginLeft: "auto",
      background: "rgba(99,102,241,0.10)",
      border: "1px solid rgba(99,102,241,0.20)",
      color: "#6366f1", fontSize: "0.68rem", fontWeight: 700,
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
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 12px", borderRadius: 12,
      border: `1px solid ${border}`,
      cursor: "pointer",
      transition: "background 0.13s, border-color 0.13s",
      marginBottom: 6,
      "&:hover": { background: menuHover, borderColor: borderHov },
      "&:last-child": { marginBottom: 0 },
    },
    itemUnread: {
      background: "rgba(99,102,241,0.06)",
      borderColor: "rgba(99,102,241,0.18)",
      "&:hover": { background: "rgba(99,102,241,0.10)", borderColor: "rgba(99,102,241,0.28)" },
    },
    avatar: {
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: "rgba(99,102,241,0.12)",
      color: "#6366f1", fontSize: "0.95rem", fontWeight: 700,
      "& svg": { fontSize: "1.15rem !important" },
    },
    itemContent: { flex: 1, minWidth: 0 },
    itemTitle: {
      fontSize: "0.82rem", fontWeight: 700, color: textPri,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    itemMsg: {
      fontSize: "0.75rem", color: "#64748b",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1,
    },
    itemDate: {
      fontSize: "0.67rem", color: "#94a3b8",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      flexShrink: 0, alignSelf: "flex-start", marginTop: 2,
    },
    unreadDot: {
      width: 8, height: 8, borderRadius: "50%",
      background: "#6366f1", flexShrink: 0,
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
  };
});

/* ── Reducer ─────────────────────────────────────────────────────────────── */
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS": {
      const next = [...state];
      (isArray(action.payload) ? action.payload : []).forEach(c => {
        const i = next.findIndex(u => u.id === c.id);
        i !== -1 ? (next[i] = c) : next.push(c);
      });
      return next;
    }
    case "UPDATE_CHATS": {
      const i = state.findIndex(u => u.id === action.payload.id);
      if (i !== -1) { const s = [...state]; s[i] = action.payload; return s; }
      return [action.payload, ...state];
    }
    case "CHANGE_CHAT":
      return state.map(c => c.id === action.payload.chat.id ? action.payload.chat : c);
    case "DELETE_CHAT":
      return state.filter(c => c.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

/* ── Componente ──────────────────────────────────────────────────────────── */
export default function ChatPopover() {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const [play]   = useSound(notifySound);
  const soundRef = useRef();

  const [anchorEl,   setAnchorEl]   = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [searchParam]               = useState("");
  const [chats,   dispatch]         = useReducer(reducer, []);
  const [invisible, setInvisible]   = useState(true);

  useEffect(() => { soundRef.current = play; }, [play]);
  useEffect(() => { dispatch({ type: "RESET" }); setPageNumber(1); }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(fetchChats, 500);
    return () => clearTimeout(t);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!user.companyId) return;
    const companyId = user.companyId;
    const onChat = (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
        if (data.newMessage.senderId !== user.id) soundRef.current?.();
      }
      if (data.action === "update") dispatch({ type: "CHANGE_CHAT", payload: data });
    };
    socket.on(`company-${companyId}-chat`, onChat);
    return () => socket.off(`company-${companyId}-chat`, onChat);
  }, [user]);

  useEffect(() => {
    let unreads = 0;
    chats.forEach(chat =>
      chat.users?.forEach(cu => { if (cu.userId === user.id) unreads += cu.unreads; })
    );
    setInvisible(unreads === 0);
  }, [chats, user.id]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", { params: { searchParam, pageNumber } });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) { toastError(err); }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) setPageNumber(p => p + 1);
  };

  const totalUnreads = chats.reduce((sum, chat) => {
    return sum + (chat.users?.reduce((s, cu) => cu.userId === user.id ? s + cu.unreads : s, 0) ?? 0);
  }, 0);

  const initials = (title) =>
    (title || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton
        onClick={(e) => { setAnchorEl(e.currentTarget); setInvisible(true); }}
        aria-label="Chat interno"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        <Badge color="secondary" variant="dot" overlap="rectangular" invisible={invisible}>
          <ForumRoundedIcon />
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
          <div className={classes.headerIcon}><ForumRoundedIcon /></div>
          <div>
            <div className={classes.headerTitle}>Chat Interno</div>
            <div className={classes.headerSub}>Mensagens da equipe</div>
          </div>
          {totalUnreads > 0 && (
            <span className={classes.unreadsChip}>{totalUnreads} novo{totalUnreads !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Lista */}
        <div className={classes.list} onScroll={handleScroll}>
          {!isArray(chats) || chats.length === 0 ? (
            <div className={classes.emptyWrap}>
              <div className={classes.emptyIcon}><InboxRoundedIcon /></div>
              <span className={classes.emptyText}>{i18n.t("mainDrawer.appBar.notRegister")}</span>
            </div>
          ) : (
            chats.map(item => {
              const myUnreads = item.users?.reduce(
                (s, cu) => cu.userId === user.id ? s + cu.unreads : s, 0
              ) ?? 0;
              const hasUnread = myUnreads > 0;
              const title = item.title || item.users?.map(u => u.user?.name).filter(Boolean).join(", ") || "Chat";

              return (
                <div
                  key={item.id}
                  className={`${classes.item} ${hasUnread ? classes.itemUnread : ""}`}
                  onClick={() => { window.location.href = `/chats/${item.uuid}`; }}
                >
                  <Avatar className={classes.avatar} variant="rounded">
                    {initials(title)}
                  </Avatar>

                  <div className={classes.itemContent}>
                    <div className={classes.itemTitle}>{title}</div>
                    {item.lastMessage && (
                      <div className={classes.itemMsg}>{item.lastMessage}</div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className={classes.itemDate}>{datetimeToClient(item.updatedAt)}</span>
                    {hasUnread && <div className={classes.unreadDot} />}
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