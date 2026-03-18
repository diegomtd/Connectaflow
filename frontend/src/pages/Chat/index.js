/**
 * Chat — Modernizado
 * Cabeçalho corporativo: INTOCADO (idêntico ao original)
 * Modernizações: ChatModal refinado, layout grid/tab, empty state na área de mensagens,
 *                botão "Nova conversa" com shimmer, todas as integrações socket preservadas.
 */

import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { has, isObject }         from "lodash";

import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  Grid, IconButton, Paper, Stack, TextField,
  Typography, alpha, useMediaQuery,
} from "@mui/material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import {
  Chat as ChatIcon, Close, Add,
  Forum, FiberManualRecord, EditNote,
} from "@mui/icons-material";

import ChatList           from "./ChatList";
import ChatMessages       from "./ChatMessages";
import { UsersFilter }    from "../../components/UsersFilter";
import api                from "../../services/api";
import { AuthContext }    from "../../context/Auth/AuthContext";
import { i18n }           from "../../translate/i18n";

/* ─── FontStyle ──────────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .chat-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .chat-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .chat-root { max-width: 100%; overflow-x: hidden; }


    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes heroShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .chat-animate { animation: fadeSlideUp 0.36s ease both; }

    .chat-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .chat-root ::-webkit-scrollbar-track { background: transparent; }
    .chat-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .chat-tab-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .chat-tab-scroll::-webkit-scrollbar { display: none; }
  `}</style>
);

/* ─── usePalette ─────────────────────────────────────────────────────────── */
const usePalette = () => {
  const themeV4 = useMuiThemeV4();
  const themeV5 = useMuiThemeV5();
  const isDark  = themeV4?.palette?.type === "dark" || themeV5?.palette?.mode === "dark";
  const BLUES   = ["#1976d2","#2196f3","#1565c0","#42a5f5","#1769aa","#2563eb","#1d4ed8"];
  const v4Raw   = themeV4?.palette?.primary?.main || "";
  const v5p     = themeV5?.palette?.primary?.main || "#0f6cbd";
  const isC4    = v4Raw && !BLUES.includes(v4Raw.toLowerCase().trim());
  const isC5    = v5p   && !BLUES.includes(v5p.toLowerCase().trim());
  const primary = isC4 ? v4Raw : isC5 ? v5p : (v4Raw || v5p);

  return useMemo(() => {
    const success="#10b981", warning="#f59e0b", danger="#ef4444";
    const t = isDark ? {
      pageBg:"#080e1a", surfaceBg:"#0f1929", surfaceBg2:"#141f30",
      border:"rgba(255,255,255,0.065)", divider:"rgba(255,255,255,0.055)",
      textPrimary:"#f0f4f8", textSecond:"#8fa4be", textMuted:"#4d6478",
      hoverRow:"rgba(255,255,255,0.03)", avatarBg:"rgba(255,255,255,0.08)",
      inputBg:"rgba(255,255,255,0.04)", inputBorder:"rgba(255,255,255,0.12)",
    } : {
      pageBg:"#f0f4f8", surfaceBg:"#ffffff", surfaceBg2:"#fafbfd",
      border:"#e3eaf2", divider:"#e8eef4",
      textPrimary:"#0d1b2a", textSecond:"#3d5166", textMuted:"#8fa0b0",
      hoverRow:"#f5f8fc", avatarBg:"#eef2f8",
      inputBg:"rgba(0,0,0,0.018)", inputBorder:"#dbe4ed",
    };
    return {
      primary, isDark, ...t, success, warning, danger,
      chipBg: alpha(primary, isDark?0.18:0.10), chipColor: primary,
      tabActiveBg: primary, tabActiveColor: "#fff", tabInactiveColor: t.textMuted,
    };
  }, [primary, isDark]);
};

/* ─── SectionLabel ────────────────────────────────────────────────────────── */
const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted,
    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    {children}
  </Typography>
);

/* ─── inputFieldSx ───────────────────────────────────────────────────────── */
const inputFieldSx = (p) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: p.inputBg,
    transition: "box-shadow 0.18s",
    "& fieldset": { borderColor: p.inputBorder, transition: "border-color 0.18s" },
    "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(p.primary, 0.14)}` },
    "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputBase-input": { color: p.textPrimary },
  "& .MuiInputLabel-root": { display: "none" },
});

/* ─── primaryBtnSx ───────────────────────────────────────────────────────── */
const primaryBtnSx = (p, extra = {}) => ({
  position: "relative", overflow: "hidden",
  backgroundColor: p.primary, color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 700, textTransform: "none",
  borderRadius: "10px",
  boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.28)}`,
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  "&::before": {
    content: '""', position: "absolute",
    top: 0, left: "-75%", width: "50%", height: "100%",
    background: "linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)",
    transition: "left 0.4s ease", pointerEvents: "none",
  },
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 20px ${alpha(p.primary, 0.40)}`,
    "&::before": { left: "125%" },
  },
  "&:active": { transform: "translateY(0)" },
  "&:disabled": { opacity: 0.42, transform: "none", boxShadow: "none" },
  ...extra,
});

/* ═══════════════════════════════════════════════════════════════════════════
   ChatModal
═══════════════════════════════════════════════════════════════════════════ */
export function ChatModal({ open, chat, type, handleClose, handleLoadNewChat }) {
  const p = usePalette();
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(""); setUsers([]);
    if (type === "edit") {
      setUsers(chat.users.map((u) => ({ id: u.user.id, name: u.user.name })));
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, { users, title });
      } else {
        const { data } = await api.post("/chats", { users, title });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (_) {}
  };

  const isValid = users && users.length > 0 && title && title.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: "18px",
          border: `1px solid ${p.border}`,
          backgroundColor: p.surfaceBg,
          backgroundImage: "none",
        },
      }}
      BackdropProps={{
        sx: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
      }}
    >
      {/* ── Header do modal ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row" justifyContent="space-between" alignItems="center"
          sx={{
            px: 3, pt: 2.5, pb: 2,
            borderBottom: `1px solid ${p.divider}`,
          }}
        >
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box sx={{
              width: 38, height: 38, borderRadius: "11px", flexShrink: 0,
              backgroundColor: alpha(p.primary, p.isDark ? 0.16 : 0.09),
              border: `1.5px solid ${alpha(p.primary, p.isDark ? 0.24 : 0.14)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {type === "edit"
                ? <EditNote  sx={{ fontSize: 19, color: p.primary }} />
                : <ChatIcon  sx={{ fontSize: 19, color: p.primary }} />
              }
            </Box>
            <Box>
              <SectionLabel p={p}>
                {type === "edit" ? "Editar conversa" : "Nova conversa"}
              </SectionLabel>
              <Typography sx={{
                fontSize: 15.5, fontWeight: 700, color: p.textPrimary,
                mt: 0.15, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2,
              }}>
                {i18n.t("chatInternal.modal.title")}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              borderRadius: "10px", p: 0.7,
              border: `1px solid ${p.border}`,
              backgroundColor: p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
              color: p.textMuted, transition: "all 0.16s",
              "&:hover": {
                borderColor: alpha("#ef4444", 0.45), color: "#ef4444",
                backgroundColor: alpha("#ef4444", p.isDark ? 0.10 : 0.05),
              },
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 3 }}>
        <Stack spacing={2.2}>

          {/* ── Título ── */}
          <Box>
            <Typography sx={{
              fontSize: 11.5, fontWeight: 600, color: p.textMuted,
              textTransform: "uppercase", letterSpacing: "0.07em",
              mb: 0.8, fontFamily: "'DM Sans', sans-serif",
            }}>
              Título da conversa
            </Typography>
            <TextField
              placeholder="Ex: Suporte ao cliente, Projeto X…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isValid && handleSave()}
              variant="outlined" size="small" fullWidth
              InputLabelProps={{ shrink: false }}
              sx={inputFieldSx(p)}
            />
          </Box>

          {/* ── Participantes ── */}
          <Box>
            <Typography sx={{
              fontSize: 11.5, fontWeight: 600, color: p.textMuted,
              textTransform: "uppercase", letterSpacing: "0.07em",
              mb: 0.8, fontFamily: "'DM Sans', sans-serif",
            }}>
              Participantes
            </Typography>
            <Box sx={{
              "& .MuiFormControl-root": { margin: "0 !important", width: "100%" },
              "& .MuiInputBase-root": {
                fontSize: 13, borderRadius: "10px",
                backgroundColor: p.inputBg,
                fontFamily: "'DM Sans', sans-serif",
                transition: "box-shadow 0.18s",
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: p.inputBorder },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8",
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: p.primary, borderWidth: "1.5px",
              },
              "& .MuiOutlinedInput-root.Mui-focused": {
                boxShadow: `0 0 0 3px ${alpha(p.primary, 0.14)}`,
              },
              "& .MuiInputLabel-root": { fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
              "& .MuiInputLabel-root.Mui-focused": { color: p.primary },
              "& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": { opacity: 0 },
              "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { opacity: 0 },
              "& .MuiChip-root": {
                borderRadius: "7px", fontSize: 12, fontWeight: 600,
                backgroundColor: alpha(p.primary, p.isDark ? 0.18 : 0.10),
                color: p.primary,
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.28 : 0.18)}`,
              },
            }}>
              <UsersFilter onFiltered={(u) => setUsers(u)} initialUsers={users} />
            </Box>
          </Box>

          <Box sx={{ height: "1px", backgroundColor: p.divider }} />

          {/* ── Botões ── */}
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="outlined" size="small"
              onClick={handleClose}
              sx={{
                borderRadius: "10px", textTransform: "none", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                height: 38, px: 2,
                borderColor: p.border, color: p.textMuted,
                transition: "all 0.16s",
                "&:hover": {
                  borderColor: p.textMuted,
                  backgroundColor: alpha(p.textMuted, 0.06),
                },
              }}
            >
              {i18n.t("chatInternal.modal.cancel")}
            </Button>
            <Button
              variant="contained" disableElevation size="small"
              onClick={handleSave}
              disabled={!isValid}
              startIcon={
                type === "edit"
                  ? <EditNote sx={{ fontSize: 15 }} />
                  : <Add      sx={{ fontSize: 15 }} />
              }
              sx={primaryBtnSx(p, { fontSize: 13, height: 38, px: 2.2 })}
            >
              {i18n.t("chatInternal.modal.save")}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

/* ─── NewChatButton ──────────────────────────────────────────────────────── */
const NewChatButton = ({ p, onClick }) => (
  <Box sx={{
    px: 1.5, py: 1.2,
    borderBottom: `1px solid ${p.divider}`,
    backgroundColor: p.isDark ? alpha("#000", 0.15) : alpha(p.primary, 0.015),
    flexShrink: 0,
  }}>
    <Button
      fullWidth disableElevation variant="contained"
      size="small"
      onClick={onClick}
      startIcon={<Add sx={{ fontSize: 14 }} />}
      sx={primaryBtnSx(p, { fontSize: 12.5, height: 36 })}
    >
      {i18n.t("chatInternal.new")}
    </Button>
  </Box>
);

/* ─── NoConversationSelected ─────────────────────────────────────────────── */
const NoConversationSelected = ({ p }) => (
  <Box sx={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    backgroundColor: p.isDark ? p.pageBg : "#f5f8fc",
    height: "100%", py: 6, px: 3,
  }}>
    <Box sx={{ mb: 2.5, opacity: p.isDark ? 0.80 : 1 }}>
      <svg width="156" height="126" viewBox="0 0 156 126" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="78" cy="118" rx="56" ry="6"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
        <rect x="18" y="18" width="120" height="80" rx="14"
          fill={p.isDark ? "#141f30" : "#f0f6ff"}
          stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#dbeafe"} strokeWidth="1.5" />
        <rect x="34" y="32" width="44" height="7" rx="3.5"
          fill={p.isDark ? "rgba(255,255,255,0.08)" : "#bfdbfe"} />
        <rect x="34" y="45" width="56" height="7" rx="3.5"
          fill={p.isDark ? "rgba(255,255,255,0.05)" : "#dbeafe"} />
        <rect x="78" y="58" width="40" height="7" rx="3.5"
          fill={p.isDark ? alpha("#3b82f6", 0.28) : alpha("#3b82f6", 0.72)} />
        <rect x="34" y="71" width="48" height="7" rx="3.5"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "#e0f2fe"} />
        <circle cx="58" cy="106" r="3.5" fill={p.isDark ? "rgba(99,179,237,0.22)" : "#bfdbfe"} />
        <circle cx="70" cy="106" r="3.5" fill={p.isDark ? "rgba(99,179,237,0.15)" : "#dbeafe"} />
        <circle cx="82" cy="106" r="3.5" fill={p.isDark ? "rgba(99,179,237,0.10)" : "#eff6ff"} />
      </svg>
    </Box>
    <Typography sx={{
      fontSize: 15, fontWeight: 700, color: p.textPrimary,
      mb: 0.7, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
    }}>
      Selecione uma conversa
    </Typography>
    <Typography sx={{
      fontSize: 12.5, color: p.textMuted, textAlign: "center",
      lineHeight: 1.65, maxWidth: 230, fontFamily: "'DM Sans', sans-serif",
    }}>
      Escolha um chat na lista ou crie uma nova conversa para começar.
    </Typography>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Chat (componente principal)
═══════════════════════════════════════════════════════════════════════════ */
function Chat() {
  const p         = usePalette();
  const themeV5   = useMuiThemeV5();
  const isDesktop = useMediaQuery(themeV5.breakpoints.up("md"));

  const { user, socket } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog,       setShowDialog]       = useState(false);
  const [dialogType,       setDialogType]       = useState("new");
  const [currentChat,      setCurrentChat]      = useState({});
  const [chats,            setChats]            = useState([]);
  const [chatsPageInfo,    setChatsPageInfo]    = useState({ hasMore: false });
  const [messages,         setMessages]         = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage,     setMessagesPage]     = useState(1);
  const [loading,          setLoading]          = useState(false);
  const [tab,              setTab]              = useState(0);

  const isMounted         = useRef(true);
  const scrollToBottomRef = useRef();
  const { id }            = useParams();

  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);
          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => scrollToBottomRef.current(), 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = user.companyId;

    // ✅ CORRIGIDO: uso de "prev =>" em todos os setChats dentro dos handlers
    // para evitar stale closure que apagava a lista ao enviar mensagens.

    const onChatUser = (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === data.record.id) {
              setCurrentChat(data.record);
              return { ...data.record };
            }
            return chat;
          })
        );
      }
    };

    const onChat = (data) => {
      if (data.action === "delete") {
        setChats((prev) => prev.filter((c) => c.id !== +data.id));
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    };

    const onCurrentChat = (data) => {
      if (data.action === "new-message") {
        setMessages((prev) => [...prev, data.newMessage]);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === data.newMessage.chatId ? { ...data.chat } : chat
          )
        );
        scrollToBottomRef.current();
      }
      if (data.action === "update") {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === data.chat.id ? { ...data.chat } : chat
          )
        );
        scrollToBottomRef.current();
      }
    };

    socket.on(`company-${companyId}-chat-user-${user.id}`, onChatUser);
    socket.on(`company-${companyId}-chat`, onChat);
    if (isObject(currentChat) && has(currentChat, "id"))
      socket.on(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);

    return () => {
      socket.off(`company-${companyId}-chat-user-${user.id}`, onChatUser);
      socket.off(`company-${companyId}-chat`, onChat);
      if (isObject(currentChat) && has(currentChat, "id"))
        socket.off(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  const selectChat     = (chat) => {
    try { setMessages([]); setMessagesPage(1); setCurrentChat(chat); setTab(1); } catch (_) {}
  };
  const sendMessage    = async (msg) => {
    setLoading(true);
    try { await api.post(`/chats/${currentChat.id}/messages`, { message: msg }); } catch (_) {}
    setLoading(false);
  };
  const deleteChat     = async (chat) => {
    try { await api.delete(`/chats/${chat.id}`); } catch (_) {}
  };
  const findMessages   = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chats/${chatId}/messages?pageNumber=${messagesPage}`);
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (_) {}
    setLoading(false);
  };
  const loadMoreMessages = async () => { if (!loading) findMessages(currentChat.id); };
  const findChats        = async () => {
    try { const { data } = await api.get("/chats"); return data; }
    catch (err) { console.log(err); }
  };

  /* ── Layout desktop ── */
  const renderGrid = () => (
    <Grid container sx={{ flex: 1, minHeight: "500px", overflow: "hidden", flexWrap: "nowrap" }}>
      {/* Sidebar */}
      <Grid item md={3} sx={{
        display: "flex", flexDirection: "column",
        borderRight: `1px solid ${p.divider}`,
        backgroundColor: p.isDark ? alpha("#000", 0.10) : "#fafbfd",
        overflow: "hidden",
        minWidth: 0,
        flexShrink: 0,
        width: "25%",
      }}>
        <NewChatButton p={p} onClick={() => { setDialogType("new"); setShowDialog(true); }} />
        <Box sx={{ flex: 1, overflow: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { background: "rgba(100,116,139,0.25)", borderRadius: 4 },
        }}>
          <ChatList
            chats={chats} pageInfo={chatsPageInfo} loading={loading}
            handleSelectChat={(chat) => selectChat(chat)}
            handleDeleteChat={(chat) => deleteChat(chat)}
            handleEditChat={() => { setDialogType("edit"); setShowDialog(true); }}
          />
        </Box>
      </Grid>

      {/* Área de mensagens */}
      <Grid item md={9} sx={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minWidth: 0 }}>
        {isObject(currentChat) && has(currentChat, "id") ? (
          <ChatMessages
            chat={currentChat}
            scrollToBottomRef={scrollToBottomRef}
            pageInfo={messagesPageInfo}
            messages={messages}
            loading={loading}
            handleSendMessage={sendMessage}
            handleLoadMore={loadMoreMessages}
          />
        ) : (
          <NoConversationSelected p={p} />
        )}
      </Grid>
    </Grid>
  );

  /* ── Layout mobile (tabs) ── */
  const renderTab = () => (
    <Grid container sx={{ flex: 1, height: "100%" }}>
      <Grid item xs={12} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Tab bar */}
        <Box sx={{
          px: { xs: 0.8, sm: 1.5 }, py: { xs: 0.7, sm: 1.1 },
          borderBottom: `1px solid ${p.divider}`,
          backgroundColor: p.isDark ? alpha("#000", 0.15) : alpha(p.primary, 0.015),
          flexShrink: 0,
        }}>
          <Box className="chat-tab-scroll">
            <Stack direction="row" spacing={0.3} sx={{
              p: 0.4, borderRadius: "9px",
              backgroundColor: p.isDark ? alpha("#000", 0.3) : alpha(p.primary, 0.04),
              border: `1px solid ${p.border}`,
              display: "inline-flex", width: "max-content", minWidth: "100%",
            }}>
              {["Chats", "Mensagens"].map((label, idx) => {
                const active = tab === idx;
                return (
                  <Button key={label} onClick={() => setTab(idx)} disableElevation sx={{
                    textTransform: "none", px: { xs: 1.4, sm: 2 }, py: 0.65,
                    borderRadius: "8px", border: "none", whiteSpace: "nowrap", flexShrink: 0,
                    fontFamily: "'DM Sans', sans-serif",
                    color:           active ? "#fff"         : p.tabInactiveColor,
                    backgroundColor: active ? p.tabActiveBg  : "transparent",
                    fontWeight: active ? 600 : 500, fontSize: { xs: 12, sm: 13 },
                    boxShadow: active
                      ? `0 1px 6px ${alpha(p.primary, 0.30)},inset 0 1px 0 ${alpha("#fff", 0.12)}`
                      : "none",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      backgroundColor: active
                        ? alpha(p.primary, 0.88)
                        : (p.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                      color: active ? "#fff" : p.textSecond,
                    },
                  }}>
                    {label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* Conteúdo */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === 0 && (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <NewChatButton p={p} onClick={() => { setDialogType("new"); setShowDialog(true); }} />
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <ChatList
                  chats={chats} pageInfo={chatsPageInfo} loading={loading}
                  handleSelectChat={(chat) => selectChat(chat)}
                  handleDeleteChat={(chat) => deleteChat(chat)}
                />
              </Box>
            </Box>
          )}
          {tab === 1 && (
            isObject(currentChat) && has(currentChat, "id") ? (
              <ChatMessages
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
              />
            ) : (
              <NoConversationSelected p={p} />
            )
          )}
        </Box>
      </Grid>
    </Grid>
  );

  /* ── Render ── */
  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          setMessages([]); setMessagesPage(1);
          setCurrentChat(data); setTab(1);
          setChats((prev) => {
            const exists = prev.find((c) => c.id === data.id);
            return exists ? prev : [data, ...prev];
          });
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
      />

      <Box
        className="chat-root"
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: p.pageBg,
          transition: "background-color 0.3s ease",
          display: "flex", flexDirection: "column",
        }}
      >
        <FontStyle />

        {/* ══ CABEÇALHO CORPORATIVO — INTOCADO ══════════════════════════ */}
        <Box sx={{
          background: p.isDark
            ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
            : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2.5, sm: 3, md: 3.5 },
          pb: { xs: 2,   sm: 2.5, md: 3 },
          position: "relative", overflow: "hidden",
        }}>
          <Box sx={{ position:"absolute", top:-40, right:-40, width:{xs:160,md:220}, height:{xs:160,md:220}, borderRadius:"50%", background: p.isDark ? alpha(p.primary,0.08) : alpha("#fff",0.08), pointerEvents:"none" }} />
          <Box sx={{ position:"absolute", bottom:-30, left:"35%", width:{xs:100,md:140}, height:{xs:100,md:140}, borderRadius:"50%", background: p.isDark ? alpha("#0ea5e9",0.06) : alpha("#fff",0.06), pointerEvents:"none" }} />

          <Stack direction={{ xs:"column", sm:"row" }} justifyContent="space-between" alignItems={{ xs:"flex-start", sm:"center" }} spacing={1.5}>
            <Box sx={{ position:"relative", zIndex:1 }}>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb:0.8 }}>
                <Typography sx={{ fontSize:{xs:10,sm:11}, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color: p.isDark ? alpha(p.primary,0.8) : alpha("#fff",0.7) }}>Interno</Typography>
                <Box sx={{ width:3, height:3, borderRadius:"50%", backgroundColor: p.isDark ? alpha(p.primary,0.5) : alpha("#fff",0.45) }} />
                <Typography sx={{ fontSize:{xs:10,sm:11}, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color: p.isDark ? alpha("#fff",0.5) : alpha("#fff",0.55) }}>Chat</Typography>
              </Stack>
              <Typography sx={{ fontSize:{xs:20,sm:24,md:28}, fontWeight:800, letterSpacing:"-0.025em", lineHeight:1, color: p.isDark ? p.textPrimary : "#ffffff" }}>
                {i18n.t("mainDrawer.listItems.chats")}
              </Typography>
              <Typography sx={{ fontSize:{xs:12,sm:13.5}, mt:0.6, color: p.isDark ? p.textMuted : alpha("#fff",0.72), display:{xs:"none",sm:"block"} }}>
                Converse com a equipe em tempo real em um ambiente interno organizado.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt:{xs:1.2,sm:1.5}, flexWrap:"wrap", gap:0.8 }}>
                {[
                  { icon:<FiberManualRecord sx={{fontSize:8}}/>, label:"Chat interno" },
                  { icon:<Forum sx={{fontSize:12}}/>,           label:`${chats.length} conversas` },
                ].map((tag,i) => (
                  <Box key={i} sx={{ display:"inline-flex", alignItems:"center", gap:0.6, px:1.2, py:0.4, borderRadius:"20px", backgroundColor: p.isDark ? alpha(p.primary,0.14) : alpha("#fff",0.15), border:`1px solid ${p.isDark ? alpha(p.primary,0.22) : alpha("#fff",0.22)}`, backdropFilter:"blur(8px)" }}>
                    <Box sx={{ color: p.isDark ? p.primary : "#fff", display:"flex" }}>{tag.icon}</Box>
                    <Typography sx={{ fontSize:{xs:10,sm:11}, fontWeight:600, color: p.isDark ? alpha("#fff",0.8) : "#fff" }}>{tag.label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
        {/* ══ FIM DO CABEÇALHO ══ */}

        {/* ── Área de conteúdo ── */}
        <Box sx={{
          px: { xs: 1, sm: 1.5, md: 2.5 },
          py: { xs: 1.5, sm: 2, md: 2.5 },
          flex: 1,
          display: "flex", flexDirection: "column",
          minHeight: "500px",
        }}>
          <Paper
            elevation={0}
            className="chat-animate"
            sx={{
              flex: 1,
              minHeight: "500px",
              borderRadius: { xs: "12px", sm: "16px" },
              border: `1px solid ${p.border}`,
              backgroundColor: p.surfaceBg,
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              animationDelay: "120ms",
            }}
          >
            {isDesktop ? renderGrid() : renderTab()}
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default Chat;