/**
 * ChatMessages — Modernizado
 * Base: @material-ui → @mui/material
 * Lógica original 100% preservada.
 * Novo visual: balões assimétricos, avatares, divider de data,
 *              empty state SVG, input refinado, botão send animado.
 */

import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  Avatar, Box, IconButton, Stack,
  TextField, Tooltip, Typography, alpha,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate }     from "../../hooks/useDate";
import api             from "../../services/api";

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
    const t = isDark ? {
      divider: "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8", textMuted: "#4d6478",
      msgListBg: "#080e1a",
      bubbleOutBg:     alpha(primary, 0.22),
      bubbleOutBorder: alpha(primary, 0.30),
      bubbleInBg:     "#141f30",
      bubbleInBorder: "rgba(255,255,255,0.07)",
      bubbleOutText:  "#e0f0ff",
      bubbleInText:   "#c8d8e8",
      dateBg:   "rgba(255,255,255,0.06)",
      dateText: "#4d6478",
      inputBg:     "rgba(255,255,255,0.05)",
      inputBorder: "rgba(255,255,255,0.10)",
      footerBg: "rgba(0,0,0,0.20)",
    } : {
      divider: "#e8eef4",
      textPrimary: "#0d1b2a", textMuted: "#8fa0b0",
      msgListBg: "#f5f8fc",
      bubbleOutBg:     primary,
      bubbleOutBorder: "transparent",
      bubbleInBg:     "#ffffff",
      bubbleInBorder: "#e3eaf2",
      bubbleOutText:  "#ffffff",
      bubbleInText:   "#0d1b2a",
      dateBg:   "rgba(0,0,0,0.045)",
      dateText: "#8fa0b0",
      inputBg:     "#ffffff",
      inputBorder: "#dbe4ed",
      footerBg: alpha(primary, 0.015),
    };
    return { primary, isDark, ...t };
  }, [primary, isDark]);
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444",
  "#14b8a6","#ec4899","#6366f1","#f97316","#06b6d4",
];
const avatarColor = (str = "") => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

/* ─── DateDivider ────────────────────────────────────────────────────────── */
const DateDivider = ({ label, p }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, my: 1.5 }}>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: p.divider }} />
    <Box sx={{ px: 1.5, py: 0.3, borderRadius: "20px", backgroundColor: p.dateBg }}>
      <Typography sx={{
        fontSize: 10.5, color: p.dateText, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
      }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: p.divider }} />
  </Stack>
);

/* ─── EmptyMessages ──────────────────────────────────────────────────────── */
const EmptyMessages = ({ p }) => (
  <Box sx={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", py: 7, px: 3,
  }}>
    <Box sx={{ mb: 2.5, opacity: p.isDark ? 0.82 : 1 }}>
      <svg width="148" height="118" viewBox="0 0 148 118" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="74" cy="110" rx="52" ry="5.5"
          fill={p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} />
        {/* Balão esquerda */}
        <rect x="10" y="20" width="68" height="34" rx="12"
          fill={p.isDark ? "#141f30" : "#ffffff"}
          stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#dbeafe"} strokeWidth="1.4" />
        <path d="M22,54 L14,66 L36,54 Z" fill={p.isDark ? "#141f30" : "#ffffff"}
          stroke={p.isDark ? "rgba(255,255,255,0.08)" : "#dbeafe"} strokeWidth="1.4" strokeLinejoin="round"/>
        <rect x="22" y="30" width="36" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.09)" : "#bfdbfe"} />
        <rect x="22" y="41" width="26" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.05)" : "#dbeafe"} />
        {/* Balão direita */}
        <rect x="70" y="42" width="68" height="34" rx="12"
          fill={p.isDark ? alpha("#3b82f6", 0.22) : alpha("#3b82f6", 0.88)}
          stroke={p.isDark ? "rgba(99,179,237,0.28)" : "transparent"} strokeWidth="1.4" />
        <path d="M126,76 L136,88 L114,76 Z"
          fill={p.isDark ? alpha("#3b82f6", 0.22) : alpha("#3b82f6", 0.88)}
          stroke={p.isDark ? "rgba(99,179,237,0.28)" : "transparent"} strokeWidth="1.4" strokeLinejoin="round"/>
        <rect x="80" y="52" width="40" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.72)"} />
        <rect x="80" y="63" width="28" height="5" rx="2.5"
          fill={p.isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.50)"} />
        {/* Pontos decorativos */}
        <circle cx="44" cy="10" r="3"   fill={p.isDark ? "rgba(99,179,237,0.18)" : "#bfdbfe"} />
        <circle cx="56" cy="5"  r="2"   fill={p.isDark ? "rgba(99,179,237,0.12)" : "#dbeafe"} />
        <circle cx="34" cy="7"  r="1.5" fill={p.isDark ? "rgba(99,179,237,0.08)" : "#eff6ff"} />
      </svg>
    </Box>
    <Typography sx={{
      fontSize: 14.5, fontWeight: 700, color: p.textPrimary,
      mb: 0.6, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
    }}>
      Nenhuma mensagem ainda
    </Typography>
    <Typography sx={{
      fontSize: 12.5, color: p.textMuted, textAlign: "center",
      lineHeight: 1.65, maxWidth: 220, fontFamily: "'DM Sans', sans-serif",
    }}>
      Seja o primeiro a iniciar a conversa neste canal.
    </Typography>
  </Box>
);

/* ─── ChatMessages ───────────────────────────────────────────────────────── */
export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const p                    = usePalette();
  const { user }             = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef              = useRef();
  const [contentMessage, setContentMessage] = useState("");

  /* ── lógica original preservada ── */
  const scrollToBottom = () => {
    if (baseRef.current) baseRef.current.scrollIntoView({});
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try { api.post(`/chats/${chat.id}/read`, { userId: user.id }); } catch (_) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) handleLoadMore();
  };

  const handleSend = () => {
    if (contentMessage.trim() !== "") {
      handleSendMessage(contentMessage);
      setContentMessage("");
    }
  };

  /* ── Agrupa mensagens por data ── */
  const renderMessages = () => {
    if (!Array.isArray(messages) || messages.length === 0) return null;
    const result = [];
    let lastDate = null;

    messages.forEach((item, key) => {
      const msgDate = new Date(item.createdAt).toLocaleDateString("pt-BR");
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        result.push(<DateDivider key={`d-${key}`} label={msgDate} p={p} />);
      }

      const isOwn    = item.senderId === user.id;
      const name     = item.sender?.name || "?";
      const initials = getInitials(name);
      const bgColor  = avatarColor(name);

      result.push(
        <Box key={key} sx={{
          display: "flex",
          flexDirection: isOwn ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: 0.9,
          px: { xs: 1.5, sm: 2 },
          mb: 0.5,
        }}>
          {/* Avatar — apenas para recebidas */}
          {!isOwn && (
            <Avatar sx={{
              width: 30, height: 30, fontSize: 11.5, fontWeight: 700,
              flexShrink: 0, borderRadius: "9px", mb: 0.2,
              backgroundColor: alpha(bgColor, p.isDark ? 0.85 : 0.88),
              color: "#fff",
              boxShadow: `0 2px 6px ${alpha(bgColor, 0.32)}`,
            }}>
              {initials}
            </Avatar>
          )}

          {/* Balão */}
          <Box sx={{ maxWidth: { xs: "76%", sm: "62%", md: "52%" } }}>
            {/* Nome — apenas recebidas */}
            {!isOwn && (
              <Typography sx={{
                fontSize: 10.5, fontWeight: 700, color: p.textMuted,
                mb: 0.3, ml: 0.4, fontFamily: "'DM Sans', sans-serif",
              }}>
                {name}
              </Typography>
            )}
            <Box sx={{
              px: { xs: 1.4, sm: 1.8 }, pt: { xs: 0.85, sm: 1 }, pb: { xs: 0.6, sm: 0.7 },
              borderRadius: isOwn ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              backgroundColor: isOwn ? p.bubbleOutBg : p.bubbleInBg,
              border: `1px solid ${isOwn ? p.bubbleOutBorder : p.bubbleInBorder}`,
              boxShadow: isOwn
                ? `0 2px 10px ${alpha(p.primary, p.isDark ? 0.22 : 0.20)}`
                : `0 1px 4px ${p.isDark ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.06)"}`,
            }}>
              <Typography sx={{
                fontSize: { xs: 13, sm: 13.5 },
                color: isOwn ? p.bubbleOutText : p.bubbleInText,
                lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif",
                wordBreak: "break-word",
              }}>
                {item.message}
              </Typography>
              <Typography sx={{
                fontSize: 9.5, mt: 0.4,
                color: isOwn
                  ? (p.isDark ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.68)")
                  : p.textMuted,
                textAlign: "right",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
              }}>
                {datetimeToClient(item.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    });
    return result;
  };

  return (
    <Box sx={{
      display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
      backgroundColor: p.msgListBg,
    }}>
      {/* ── Área de mensagens ── */}
      <Box
        onScroll={handleScroll}
        sx={{
          flex: 1, overflowY: "auto",
          py: { xs: 1.5, sm: 2 },
          display: "flex", flexDirection: "column",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(100,116,139,0.22)", borderRadius: 4,
          },
        }}
      >
        {(!messages || messages.length === 0) && !loading && <EmptyMessages p={p} />}
        {renderMessages()}
        <div ref={baseRef} />
      </Box>

      {/* ── Footer / Input ── */}
      <Box sx={{
        px: { xs: 1.5, sm: 2 }, pt: 1.2, pb: { xs: 1.4, sm: 1.6 },
        borderTop: `1px solid ${p.divider}`,
        backgroundColor: p.footerBg,
        flexShrink: 0,
      }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth multiline maxRows={4}
            placeholder="Digite uma mensagem…"
            value={contentMessage}
            onChange={(e) => setContentMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            variant="outlined" size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px", fontSize: 13.5,
                fontFamily: "'DM Sans', sans-serif",
                backgroundColor: p.inputBg,
                transition: "box-shadow 0.18s",
                "& fieldset": { borderColor: p.inputBorder, transition: "border-color 0.18s" },
                "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.20)" : "#a8b8c8" },
                "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(p.primary, 0.14)}` },
                "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
              },
              "& .MuiInputBase-input": {
                color: p.textPrimary,
                "&::placeholder": { color: p.textMuted, opacity: 1 },
              },
            }}
          />
          <Tooltip title="Enviar (Enter)">
            <span>
              <IconButton
                onClick={handleSend}
                disabled={!contentMessage.trim()}
                sx={{
                  width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
                  backgroundColor: contentMessage.trim() ? p.primary : alpha(p.primary, 0.22),
                  color: "#fff",
                  transition: "all 0.18s ease",
                  boxShadow: contentMessage.trim() ? `0 3px 14px ${alpha(p.primary, 0.40)}` : "none",
                  "&:hover:not(:disabled)": {
                    backgroundColor: alpha(p.primary, 0.85),
                    transform: "translateY(-1px)",
                    boxShadow: `0 5px 18px ${alpha(p.primary, 0.50)}`,
                  },
                  "&:active:not(:disabled)": { transform: "scale(0.95)" },
                  "&.Mui-disabled": { color: "rgba(255,255,255,0.55)" },
                }}
              >
                <Send sx={{ fontSize: 17, ml: "1px" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Typography sx={{
          fontSize: 10.5, color: p.textMuted, mt: 0.65, ml: 0.5,
          fontFamily: "'DM Sans', sans-serif",
          display: { xs: "none", sm: "block" },
        }}>
          Enter para enviar · Shift + Enter para nova linha
        </Typography>
      </Box>
    </Box>
  );
}