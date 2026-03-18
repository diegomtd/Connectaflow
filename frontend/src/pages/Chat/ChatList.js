/**
 * ChatList — Modernizado
 * Base: @material-ui → @mui/material
 * Lógica original 100% preservada.
 * Novo visual: avatares coloridos, badge de não-lidos, borda ativa,
 *              botões de ação no hover, empty state, dark/light/whitelabel.
 */

import React, { useContext, useState, useMemo } from "react";
import {
  Avatar, Box, IconButton, Stack,
  Tooltip, Typography, alpha,
} from "@mui/material";
import { Delete, Edit, Forum } from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";

import { AuthContext }        from "../../context/Auth/AuthContext";
import { useDate }            from "../../hooks/useDate";
import ConfirmationModal      from "../../components/ConfirmationModal";
import api                    from "../../services/api";

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
      textPrimary: "#f0f4f8", textSecond: "#8fa4be", textMuted: "#4d6478",
      divider: "rgba(255,255,255,0.055)", border: "rgba(255,255,255,0.065)",
      hoverRow: "rgba(255,255,255,0.03)",
    } : {
      textPrimary: "#0d1b2a", textSecond: "#3d5166", textMuted: "#8fa0b0",
      divider: "#e8eef4", border: "#e3eaf2",
      hoverRow: "#f5f8fc",
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
const getInitials = (title = "") =>
  title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

/* ─── ChatList ────────────────────────────────────────────────────────────── */
export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const p = usePalette();
  const history  = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const { id }   = useParams();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat,      setSelectedChat]     = useState({});

  /* ── lógica original preservada ── */
  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try { await api.post(`/chats/${chat.id}/read`, { userId: user.id }); } catch (_) {}
    }
    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => { handleDeleteChat(selectedChat); };

  return (
    <>
      <ConfirmationModal
        title="Excluir Conversa"
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>

      <Box sx={{
        display: "flex", flexDirection: "column",
        height: "100%", overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(100,116,139,0.25)", borderRadius: 4,
        },
      }}>
        {/* ── Empty state ── */}
        {(!chats || chats.length === 0) && !loading && (
          <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", flex: 1, py: 6, px: 3,
          }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: "15px",
              backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.08),
              border: `1.5px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
              display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
            }}>
              <Forum sx={{ fontSize: 24, color: p.primary, opacity: 0.7 }} />
            </Box>
            <Typography sx={{
              fontSize: 13.5, fontWeight: 700, color: p.textPrimary,
              mb: 0.5, textAlign: "center", fontFamily: "'DM Sans', sans-serif",
            }}>
              Nenhuma conversa
            </Typography>
            <Typography sx={{
              fontSize: 12, color: p.textMuted, textAlign: "center",
              lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
            }}>
              Crie uma nova conversa com o botão acima
            </Typography>
          </Box>
        )}

        {/* ── Lista de chats ── */}
        {Array.isArray(chats) && chats.map((chat, key) => {
          const isActive = chat.uuid === id;
          const unreads  = unreadMessages(chat);
          const initials = getInitials(chat.title);
          const bgColor  = avatarColor(chat.title);
          const secondary = chat.lastMessage !== ""
            ? `${datetimeToClient(chat.updatedAt)}: ${chat.lastMessage}`
            : datetimeToClient(chat.updatedAt);

          return (
            <Box
              key={key}
              onClick={() => goToMessages(chat)}
              className="chat-list-item"
              sx={{
                px: 1.5, py: 1.2,
                cursor: "pointer",
                position: "relative",
                borderBottom: `1px solid ${p.divider}`,
                backgroundColor: isActive
                  ? alpha(p.primary, p.isDark ? 0.12 : 0.07)
                  : "transparent",
                transition: "background 0.15s",
                "&:hover": {
                  backgroundColor: isActive
                    ? alpha(p.primary, p.isDark ? 0.16 : 0.10)
                    : p.hoverRow,
                  "& .chat-item-actions": { opacity: 1, pointerEvents: "auto" },
                },
                /* borda esquerda quando ativo */
                "&::before": {
                  content: '""',
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: 3, borderRadius: "0 3px 3px 0",
                  backgroundColor: isActive ? p.primary : "transparent",
                  transition: "background-color 0.15s",
                },
              }}
            >
              <Stack direction="row" spacing={1.3} alignItems="flex-start">
                {/* Avatar */}
                <Avatar sx={{
                  width: 40, height: 40, fontSize: 14, fontWeight: 700,
                  flexShrink: 0, borderRadius: "12px",
                  backgroundColor: alpha(bgColor, p.isDark ? 0.85 : 0.90),
                  color: "#fff",
                  boxShadow: `0 2px 8px ${alpha(bgColor, 0.35)}`,
                  border: isActive
                    ? `2px solid ${alpha(p.primary, 0.50)}`
                    : "2px solid transparent",
                  transition: "border-color 0.15s",
                }}>
                  {initials}
                </Avatar>

                {/* Conteúdo */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row" justifyContent="space-between"
                    alignItems="center" sx={{ mb: 0.3 }}
                  >
                    <Typography sx={{
                      fontSize: 13,
                      fontWeight: unreads > 0 ? 700 : 600,
                      color: isActive ? p.primary : p.textPrimary,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      maxWidth: "calc(100% - 52px)",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "color 0.15s",
                    }}>
                      {chat.title}
                    </Typography>

                    {/* Badge de não-lidos */}
                    {unreads > 0 && (
                      <Box sx={{
                        minWidth: 20, height: 20, borderRadius: "10px",
                        backgroundColor: p.primary, color: "#fff",
                        fontSize: 10.5, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        px: 0.8, flexShrink: 0,
                        boxShadow: `0 2px 6px ${alpha(p.primary, 0.40)}`,
                      }}>
                        {unreads}
                      </Box>
                    )}
                  </Stack>

                  <Typography sx={{
                    fontSize: 11.5,
                    color: unreads > 0 ? p.textSecond : p.textMuted,
                    fontWeight: unreads > 0 ? 500 : 400,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    pr: "52px", // espaço para os botões não sobrepor
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {secondary}
                  </Typography>
                </Box>
              </Stack>

              {/* ── Botões ação (aparecem no hover) ── */}
              {chat.ownerId === user.id && (
                <Stack
                  direction="row" spacing={0.3}
                  className="chat-item-actions"
                  sx={{
                    position: "absolute", right: 8, top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0, pointerEvents: "none",
                    transition: "opacity 0.18s",
                  }}
                >
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToMessages(chat).then(() => handleEditChat(chat));
                      }}
                      sx={{
                        p: 0.5, borderRadius: "7px",
                        color: p.primary,
                        backgroundColor: alpha(p.primary, p.isDark ? 0.16 : 0.10),
                        border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
                        transition: "background 0.15s",
                        "&:hover": { backgroundColor: alpha(p.primary, p.isDark ? 0.26 : 0.18) },
                      }}
                    >
                      <Edit sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChat(chat);
                        setConfirmModalOpen(true);
                      }}
                      sx={{
                        p: 0.5, borderRadius: "7px",
                        color: "#ef4444",
                        backgroundColor: alpha("#ef4444", p.isDark ? 0.14 : 0.08),
                        border: `1px solid ${alpha("#ef4444", p.isDark ? 0.22 : 0.14)}`,
                        transition: "background 0.15s",
                        "&:hover": { backgroundColor: alpha("#ef4444", p.isDark ? 0.24 : 0.15) },
                      }}
                    >
                      <Delete sx={{ fontSize: 13 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );
}