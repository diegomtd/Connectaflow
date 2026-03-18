import React, { useState, useContext, useEffect, useRef } from "react";
import clsx from "clsx";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Divider,
  MenuItem,
  IconButton,
  Popover,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  withStyles,
  Chip,
  alpha,
  Tooltip,
} from "@material-ui/core";

// ── Ícones Material UI (todos Rounded — fonte única, padronizada) ──────────
import MenuRoundedIcon           from "@material-ui/icons/MenuRounded";
import ChevronLeftRoundedIcon    from "@material-ui/icons/ChevronLeftRounded";
import RefreshRoundedIcon        from "@material-ui/icons/RefreshRounded";
import SearchRoundedIcon         from "@material-ui/icons/SearchRounded";
import CloseRoundedIcon          from "@material-ui/icons/CloseRounded";
import NightsStayRoundedIcon     from "@material-ui/icons/NightsStayRounded";
import WbSunnyRoundedIcon        from "@material-ui/icons/WbSunnyRounded";
import PersonRoundedIcon         from "@material-ui/icons/PersonRounded";
import HeadsetMicRoundedIcon     from "@material-ui/icons/HeadsetMicRounded";
import ExitToAppRoundedIcon      from "@material-ui/icons/ExitToAppRounded";
import PhoneRoundedIcon          from "@material-ui/icons/PhoneRounded";
import EmailRoundedIcon          from "@material-ui/icons/EmailRounded";
import LanguageRoundedIcon       from "@material-ui/icons/LanguageRounded";
import CodeRoundedIcon           from "@material-ui/icons/CodeRounded";
import CloseIcon                 from "@material-ui/icons/Close";
// Ícones de página para o spotlight
import DashboardRoundedIcon      from "@material-ui/icons/DashboardRounded";
import SpeedRoundedIcon          from "@material-ui/icons/SpeedRounded";
import AssessmentRoundedIcon     from "@material-ui/icons/AssessmentRounded";
import ForumRoundedIcon          from "@material-ui/icons/ForumRounded";
import FlashOnRoundedIcon        from "@material-ui/icons/FlashOnRounded";
import ViewKanbanIcon            from "@material-ui/icons/ViewWeek";
import ContactsRoundedIcon       from "@material-ui/icons/ContactsRounded";
import EventNoteRoundedIcon      from "@material-ui/icons/EventNoteRounded";
import LabelRoundedIcon          from "@material-ui/icons/LabelRounded";
import ChatBubbleRoundedIcon     from "@material-ui/icons/ChatBubbleRounded";
import HelpRoundedIcon           from "@material-ui/icons/HelpRounded";
import CampaignIcon              from "@material-ui/icons/RecordVoiceOver";
import ListAltRoundedIcon        from "@material-ui/icons/ListAltRounded";
import TuneRoundedIcon           from "@material-ui/icons/TuneRounded";
import AccountTreeRoundedIcon    from "@material-ui/icons/AccountTreeRounded";
import SortByAlphaRoundedIcon    from "@material-ui/icons/SortByAlphaRounded";
import NotificationsRoundedIcon  from "@material-ui/icons/NotificationsRounded";
import ApiRoundedIcon            from "@material-ui/icons/DeveloperModeRounded";
import GroupRoundedIcon          from "@material-ui/icons/GroupRounded";
import QueueRoundedIcon          from "@material-ui/icons/QueueRounded";
import PsychologyRoundedIcon     from "@material-ui/icons/EmojiObjectsRounded";
import ExtensionRoundedIcon      from "@material-ui/icons/ExtensionRounded";
import RouterRoundedIcon         from "@material-ui/icons/RouterRounded";
import FolderRoundedIcon         from "@material-ui/icons/FolderRounded";
import AccountBalanceRoundedIcon from "@material-ui/icons/AccountBalanceRounded";
import SettingsRoundedIcon       from "@material-ui/icons/SettingsRounded";
import PublicRoundedIcon         from "@material-ui/icons/PublicRounded";

import MainListItems        from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume  from "../components/NotificationsVolume";
import UserModal            from "../components/UserModal";
import { AuthContext }      from "../context/Auth/AuthContext";
import BackdropLoading      from "../components/BackdropLoading";
import { i18n }             from "../translate/i18n";
import toastError           from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import ChatPopover          from "../pages/Chat/ChatPopover";
import { useHistory }       from "react-router-dom";
import ColorModeContext     from "./themeContext";
import { getBackendUrl }    from "../config";
import useSettings          from "../hooks/useSettings";
import VersionControl       from "../components/VersionControl";
import api                  from "../services/api";

import logo     from "../assets/logo.png";
import logoDark from "../assets/logo-black.png";

const backendUrl  = getBackendUrl();
const drawerWidth = 240;

const resolveImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("http")) return value;
  if (!backendUrl) return value;
  return `${backendUrl.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
};

/* ══════════════════════════════════════════════════════════════════════════
   ESTILOS GLOBAIS
══════════════════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

    .ull-root, .ull-root * {
      font-family: 'DM Sans', system-ui, sans-serif !important;
      box-sizing: border-box;
    }

    /* ── Drawer scroll ── */
    .ull-scroll { overflow-y: auto !important; overflow-x: hidden !important; }
    .ull-scroll::-webkit-scrollbar { width: 3px; }
    .ull-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.20); border-radius: 3px; }

    /* ── Busca no drawer ── */
    .ull-drawer-search {
      display: flex; align-items: center; gap: 8px;
      margin: 8px 10px 2px; padding: 7px 11px;
      border-radius: 10px;
      border: 1px solid var(--ull-border);
      background: var(--ull-hover);
      cursor: pointer; outline: none;
      transition: border-color 0.18s, background 0.18s;
    }
    .ull-drawer-search:hover, .ull-drawer-search:focus {
      border-color: rgba(99,102,241,0.40);
      background: rgba(99,102,241,0.06);
    }
    .ull-search-label { flex: 1; font-size: 0.75rem; font-weight: 500; color: #94a3b8; }
    .ull-kbd-pill {
      font-size: 0.63rem; color: #94a3b8;
      background: rgba(100,116,139,0.12);
      border: 1px solid rgba(100,116,139,0.20);
      border-radius: 4px; padding: 1px 5px;
    }

    /* ══ Avatar Dropdown / Popovers externos — respeita tema ════════════ */
    .ull-user-menu .MuiPaper-root {
      border-radius: 14px !important;
      border: 1px solid var(--ull-border) !important;
      background: var(--ull-menu-bg) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12) !important;
      margin-top: 10px !important;
      min-width: 228px !important;
      overflow: visible !important;
      opacity: 1 !important;
    }
    /* Seta decorativa */
    .ull-user-menu .MuiPaper-root::before {
      content: '';
      position: absolute; top: -6px; right: 20px;
      width: 12px; height: 12px;
      background: var(--ull-menu-head-bg);
      border-left: 1px solid var(--ull-border);
      border-top: 1px solid var(--ull-border);
      transform: rotate(45deg);
      border-radius: 2px 0 0 0;
    }
    .ull-user-menu .MuiList-padding { padding: 0 !important; }
    .ull-user-menu .MuiPaper-root .MuiMenu-list {
      background: var(--ull-menu-bg) !important;
    }

    /* Cabeçalho do dropdown */
    .ull-menu-head {
      padding: 14px 16px 13px;
      border-bottom: 1px solid var(--ull-border);
      background: var(--ull-menu-head-bg);
      border-radius: 14px 14px 0 0;
    }
    .ull-menu-name { font-size: 0.875rem; font-weight: 700; color: var(--ull-text); line-height: 1.2; }
    .ull-menu-role { font-size: 0.72rem; font-weight: 500; color: #64748b; margin-top: 2px; }
    .ull-menu-online {
      display: inline-flex; align-items: center; gap: 5px;
      margin-top: 8px;
      background: rgba(34,197,94,0.10);
      border: 1px solid rgba(34,197,94,0.22);
      border-radius: 20px; padding: 2px 9px;
      font-size: 0.68rem; font-weight: 600; color: #22c55e;
    }
    .ull-online-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22c55e; flex-shrink: 0;
      animation: ull-dot-pulse 1.6s infinite ease-in-out;
    }
    @keyframes ull-dot-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.55; transform: scale(0.80); }
    }

    .ull-menu-item {
      display: flex !important; align-items: center !important; gap: 10px !important;
      padding: 9px 12px !important; border-radius: 9px !important;
      font-size: 0.825rem !important; font-weight: 500 !important;
      color: var(--ull-text) !important;
      transition: background 0.13s !important;
      cursor: pointer;
    }
    .ull-menu-item:hover { background: var(--ull-menu-hover) !important; }
    .ull-menu-icon {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .ull-menu-icon svg { font-size: 1.05rem !important; }
    .ull-menu-sep { height: 1px; background: var(--ull-border); margin: 4px 6px; }
    .ull-menu-danger { color: #ef4444 !important; }
    .ull-menu-danger:hover { background: rgba(239,68,68,0.07) !important; }

    /* ══ Modal de Suporte — respeita tema ════════════════════════════════ */
    .ull-support-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.50);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 1600;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: ull-fadein 0.16s ease;
    }
    @keyframes ull-fadein { from { opacity:0 } to { opacity:1 } }

    .ull-support-box {
      width: 100%; max-width: 380px;
      border-radius: 16px;
      background: var(--ull-menu-bg);
      border: 1px solid var(--ull-border);
      box-shadow: 0 20px 60px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.12);
      overflow: hidden;
      animation: ull-popin 0.20s cubic-bezier(0.34,1.4,0.64,1);
    }
    @keyframes ull-popin {
      from { opacity:0; transform: scale(0.94) translateY(8px) }
      to   { opacity:1; transform: scale(1)    translateY(0)   }
    }

    /* Header sóbrio com acento de cor */
    .ull-sup-header {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 20px;
      border-bottom: 1px solid var(--ull-border);
      background: var(--ull-menu-head-bg);
    }
    .ull-sup-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: rgba(37,99,235,0.12);
      border: 1px solid rgba(37,99,235,0.20);
      display: flex; align-items: center; justify-content: center;
      color: #3b82f6;
    }
    .ull-sup-icon-wrap svg { font-size: 1.3rem !important; }
    .ull-sup-title { font-size: 0.95rem; font-weight: 700; color: var(--ull-text); line-height: 1.2; }
    .ull-sup-sub { font-size: 0.73rem; color: #64748b; margin-top: 2px; }
    .ull-sup-close {
      margin-left: auto; flex-shrink: 0;
      width: 28px; height: 28px; border-radius: 7px;
      background: transparent;
      border: 1px solid var(--ull-border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #64748b;
      transition: background 0.14s, color 0.14s;
    }
    .ull-sup-close:hover { background: var(--ull-menu-hover); color: var(--ull-text); }

    /* Body */
    .ull-sup-body { padding: 12px; display: flex; flex-direction: column; gap: 6px; }

    .ull-sup-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 10px;
      border: 1px solid var(--ull-border);
      background: transparent;
      transition: background 0.13s, border-color 0.13s;
      text-decoration: none; cursor: default;
    }
    a.ull-sup-row { cursor: pointer; }
    a.ull-sup-row:hover {
      background: var(--ull-menu-hover);
      border-color: rgba(59,130,246,0.25);
    }
    .ull-sup-row-icon {
      width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .ull-sup-row-icon svg { font-size: 1rem !important; }
    .ull-sup-label {
      font-size: 0.67rem; font-weight: 600; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.07em; line-height: 1;
    }
    .ull-sup-value {
      font-size: 0.83rem; font-weight: 600; color: var(--ull-text);
      line-height: 1.3; margin-top: 2px;
    }
    a.ull-sup-row .ull-sup-value { color: #3b82f6; }

    /* ══ Spotlight — respeita tema ═══════════════════════════════════════ */
    .ull-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.50);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 1500;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: ull-fadein 0.16s ease;
    }
    .ull-spotlight {
      width: 100%; max-width: 500px;
      border-radius: 16px;
      background: var(--ull-menu-bg);
      border: 1px solid var(--ull-border);
      box-shadow: 0 20px 60px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.12);
      display: flex; flex-direction: column; overflow: hidden;
      animation: ull-popin 0.20s cubic-bezier(0.34,1.4,0.64,1);
    }
    /* Header do spotlight */
    .ull-sp-head {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--ull-border);
      background: var(--ull-menu-head-bg);
    }
    .ull-sp-icon {
      width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(99,102,241,0.12); color: #818cf8;
      border: 1px solid rgba(99,102,241,0.20);
    }
    .ull-sp-icon svg { font-size: 1.2rem !important; }
    .ull-sp-input-wrap { flex: 1; display: flex; flex-direction: column; gap: 1px; }
    .ull-sp-title { font-size: 0.90rem; font-weight: 700; color: var(--ull-text); }
    .ull-sp-input {
      border: none; outline: none; font-size: 0.80rem; font-weight: 400;
      color: #64748b; background: transparent; font-family: inherit;
      padding: 0; width: 100%;
    }
    .ull-sp-input::placeholder { color: #94a3b8; }
    /* Botão fechar do spotlight */
    .ull-sp-close {
      flex-shrink: 0;
      width: 28px; height: 28px; border-radius: 7px;
      background: transparent;
      border: 1px solid var(--ull-border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #64748b;
      transition: background 0.14s, color 0.14s;
    }
    .ull-sp-close:hover { background: var(--ull-menu-hover); color: var(--ull-text); }

    .ull-sp-results { max-height: 360px; overflow-y: auto; padding: 10px 12px; }
    .ull-sp-results::-webkit-scrollbar { width: 3px; }
    .ull-sp-results::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.22); border-radius: 3px; }
    .ull-sp-group {
      padding: 8px 2px 4px; font-size: 0.64rem; font-weight: 700;
      letter-spacing: 0.09em; text-transform: uppercase; color: #64748b;
    }
    .ull-sp-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 9px;
      cursor: pointer; border: none; background: none; width: 100%; text-align: left;
      transition: background 0.10s;
    }
    .ull-sp-item:hover, .ull-sp-item.active { background: var(--ull-menu-hover); }
    .ull-sp-dot {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .ull-sp-dot svg { font-size: 1.05rem !important; color: inherit !important; }
    .ull-sp-name { font-size: 0.82rem; font-weight: 600; color: var(--ull-text); }
    .ull-sp-empty { text-align:center; padding:32px 16px; color:#64748b; font-size:0.85rem; }
    /* Footer do spotlight */
    .ull-sp-foot {
      padding: 12px 20px; border-top: 1px solid var(--ull-border);
      background: var(--ull-menu-head-bg); display: flex; gap: 16px; align-items: center;
    }
    .ull-hint { display: inline-flex; align-items: center; gap: 4px; font-size: 0.68rem; color: #64748b; }
    .ull-hint kbd {
      background: var(--ull-menu-hover); border: 1px solid var(--ull-border);
      border-radius: 4px; padding: 2px 6px; font-size: 0.67rem; font-family: inherit;
      color: var(--ull-text);
    }
  `}</style>
);

/* ══════════════════════════════════════════════════════════════════════════
   makeStyles
══════════════════════════════════════════════════════════════════════════ */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark" || theme.mode === "dark";
  const primary = theme.palette.primary.main || "#6366f1";
  const barBg   = theme.palette.barraSuperior || (isDark ? "#090f1a" : "#111827");

  const surface    = isDark ? "#0e1521" : "#ffffff";
  const surfaceAlt = isDark ? "#080e17" : "#f8fafc";
  const border     = isDark ? "rgba(255,255,255,0.07)" : "#e8edf4";
  const text       = isDark ? "#e2e8f0" : "#0f172a";
  const hover      = isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.04)";

  // ── Variáveis de menu/modal — dinâmicas por tema ─────────────────────
  const menuBg      = isDark ? "#0e1521"                    : "#ffffff";
  const menuHeadBg  = isDark ? "#080e17"                    : "#f8fafc";
  const menuHover   = isDark ? "rgba(255,255,255,0.06)"     : "#f1f5f9";

  return {
    root: {
      display: "flex",
      height: "100vh",
      [theme.breakpoints.down("sm")]: { height: "calc(100vh - 56px)" },
      backgroundColor: theme.palette.fancyBackground || (isDark ? "#080e17" : "#f1f5f9"),
      "& .MuiButton-outlinedPrimary": {
        color: primary, border: `1px solid ${alpha(primary, 0.40)}`,
      },
      "& .MuiTab-textColorPrimary.Mui-selected": { color: primary },
      // ── CSS custom properties injetadas na raiz ──────────────────────
      "--ull-surface":      surface,
      "--ull-surface-alt":  surfaceAlt,
      "--ull-border":       border,
      "--ull-text":         text,
      "--ull-hover":        hover,
      // Menu / modal — dinâmicos
      "--ull-menu-bg":      menuBg,
      "--ull-menu-head-bg": menuHeadBg,
      "--ull-menu-hover":   menuHover,
    },

    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      [theme.breakpoints.down("sm")]: { marginLeft: 0, width: "100%" },
    },

    toolbar: {
      background: barBg,
      borderBottom: "1px solid rgba(255,255,255,0.055)",
      boxShadow: "0 1px 24px rgba(0,0,0,0.50)",
      minHeight: 54, paddingLeft: 8, paddingRight: 12,
      display: "flex", alignItems: "center", gap: 0,
      [theme.breakpoints.down("sm")]: { minHeight: 48, paddingLeft: 4, paddingRight: 8 },
    },

    menuBtnHidden: { display: "none" },
    spacer: { flex: "1 1 0%" },

    actions: {
      display: "flex", alignItems: "center",
      gap: 2, flexShrink: 0,
    },

    /* Hamburguer */
    menuBtn: {
      width: 42, height: 42, borderRadius: 11, padding: 0,
      color: "#fff",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.14)",
      marginLeft: 8,
      transition: "background 0.15s, border-color 0.15s, transform 0.15s",
      "&:hover": {
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.24)",
        transform: "scale(1.05)",
      },
      "& .MuiSvgIcon-root": { fontSize: "1.35rem" },
    },

    iconBtn: {
      width: 40, height: 40, borderRadius: 11, padding: 0,
      color: "rgba(255,255,255,0.72)",
      border: "1px solid transparent",
      transition: "color 0.15s, background 0.15s, border-color 0.15s",
      "&:hover": {
        color: "#fff",
        background: "rgba(255,255,255,0.09)",
        border: "1px solid rgba(255,255,255,0.12)",
      },
      "& .MuiSvgIcon-root": { fontSize: "1.30rem" },
    },

    /* Wrapper que força estilo uniforme nos sub-componentes externos */
    iconWrap: {
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      "& .MuiIconButton-root": {
        width: "40px !important", height: "40px !important",
        borderRadius: "11px !important", padding: "0 !important", minWidth: "unset",
        color: "rgba(255,255,255,0.72) !important",
        border: "1px solid transparent !important",
        background: "transparent !important",
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
        "&:hover": {
          color: "#fff !important",
          background: "rgba(255,255,255,0.09) !important",
          border: "1px solid rgba(255,255,255,0.12) !important",
        },
        "& .MuiSvgIcon-root": { fontSize: "1.30rem !important", color: "inherit !important" },
        "& .MuiBadge-badge": {
          fontSize: "0.60rem", minWidth: 16, height: 16,
          padding: "0 3px", top: 4, right: 4,
        },
      },
      "& .MuiButton-root": {
        width: "40px !important", height: "40px !important",
        borderRadius: "11px !important", padding: "0 !important", minWidth: "unset",
        color: "rgba(255,255,255,0.72) !important",
        border: "1px solid transparent !important",
        background: "transparent !important",
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
        "&:hover": {
          color: "#fff !important",
          background: "rgba(255,255,255,0.09) !important",
          border: "1px solid rgba(255,255,255,0.12) !important",
        },
        "& .MuiSvgIcon-root": { fontSize: "1.30rem !important", color: "inherit !important" },
      },
    },

    divider: {
      width: 1, height: 18,
      background: "rgba(255,255,255,0.10)",
      margin: "0 6px", flexShrink: 0,
    },

    avatar: {
      width: 32, height: 32, cursor: "pointer",
      border: "2px solid rgba(255,255,255,0.18)",
      borderRadius: "50%", transition: "all 0.18s",
      "&:hover": {
        border: `2px solid ${alpha(primary, 0.65)}`,
        boxShadow: `0 0 0 3px ${alpha(primary, 0.18)}`,
      },
    },

    chip: {
      background: alpha("#f87171", 0.14), color: "#f87171",
      border: "1px solid rgba(248,113,113,0.28)",
      fontWeight: 700, fontSize: "0.70rem", height: 22,
    },

    /* Drawer */
    drawerPaper: {
      position: "relative", whiteSpace: "nowrap", width: drawerWidth,
      overflowX: "hidden", overflowY: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: { width: theme.spacing(9) },
    },
    drawerHeader: {
      flexShrink: 0,
      overflow: "hidden",
    },
    drawerLogoImg: {
      display: "block",
      width: "100%",
      height: "auto",
      aspectRatio: "6 / 1",
      objectFit: "cover",
      objectPosition: "center center",
    },

    appBarSpacer: { minHeight: 54 },
    content: { flex: 1, overflow: "visible", position: "relative" },
    scrollArea: {
      flex: 1, overflowY: "auto", overflowX: "hidden",
      ...theme.scrollbarStyles,
      "&::-webkit-scrollbar": { width: 0 },
      scrollbarWidth: "none",
    },
  };
});

/* ── Badge de presença ───────────────────────────────────────────────────── */
const OnlineBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#22c55e", color: "#22c55e",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute", top: 0, left: 0,
      width: "100%", height: "100%", borderRadius: "50%",
      animation: "$pulse 1.6s infinite ease-in-out",
      border: "1px solid currentColor", content: '""',
    },
  },
  "@keyframes pulse": {
    "0%":   { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.6)", opacity: 0 },
  },
}))(Badge);

/* ══════════════════════════════════════════════════════════════════════════
   MODAL DE SUPORTE
══════════════════════════════════════════════════════════════════════════ */
const SupportModal = ({ open, onClose }) => {
  if (!open) return null;

  const rows = [
    {
      icon: <CodeRoundedIcon />,
      bg: "rgba(99,102,241,0.12)", color: "#818cf8",
      label: "Desenvolvedor", value: "Genivaldo", href: null,
    },
    {
      icon: <PhoneRoundedIcon />,
      bg: "rgba(34,197,94,0.12)", color: "#22c55e",
      label: "Contato / WhatsApp", value: "55 (41) 99823-9551",
      href: "https://wa.me/5541998239551",
    },
    {
      icon: <EmailRoundedIcon />,
      bg: "rgba(59,130,246,0.12)", color: "#60a5fa",
      label: "E-mail", value: "contato@conectai.cloud",
      href: "mailto:contato@conectai.cloud",
    },
    {
      icon: <LanguageRoundedIcon />,
      bg: "rgba(245,158,11,0.12)", color: "#fbbf24",
      label: "Site", value: "conectai.cloud",
      href: "https://conectai.cloud",
    },
  ];

  return (
    <div
      className="ull-support-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ull-support-box">

        <div className="ull-sup-header">
          <button className="ull-sup-close" onClick={onClose} aria-label="Fechar">
            <CloseIcon style={{ fontSize: 14 }} />
          </button>
          <div className="ull-sup-icon-wrap">
            <HeadsetMicRoundedIcon style={{ fontSize: 22, color: "#fff" }} />
          </div>
          <div className="ull-sup-title">Suporte Técnico</div>
          <div className="ull-sup-sub">ConectAI — Atendimento e desenvolvimento</div>
        </div>

        <div className="ull-sup-body">
          {rows.map((row) =>
            row.href ? (
              <a
                key={row.label}
                className="ull-sup-row"
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="ull-sup-row-icon" style={{ background: row.bg, color: row.color }}>
                  {row.icon}
                </span>
                <span>
                  <div className="ull-sup-label">{row.label}</div>
                  <div className="ull-sup-value">{row.value}</div>
                </span>
              </a>
            ) : (
              <div key={row.label} className="ull-sup-row">
                <span className="ull-sup-row-icon" style={{ background: row.bg, color: row.color }}>
                  {row.icon}
                </span>
                <span>
                  <div className="ull-sup-label">{row.label}</div>
                  <div className="ull-sup-value">{row.value}</div>
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const theme   = useTheme();

  const [userToken,     setUserToken]     = useState("disabled");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [supportOpen,   setSupportOpen]   = useState(false);
  const [anchorEl,      setAnchorEl]      = useState(null);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const [volume,        setVolume]        = useState(localStorage.getItem("volume") || 1);
  const [notifSound,    setNotifSound]    = useState(localStorage.getItem("notificationSound") || "classic");
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [query,         setQuery]         = useState("");
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [profileUrl,    setProfileUrl]    = useState(null);
  const [wlLogoLight,   setWlLogoLight]   = useState(null);
  const [wlLogoDark,    setWlLogoDark]    = useState(null);

  const { handleLogout, loading } = useContext(AuthContext);
  const { user, socket }          = useContext(AuthContext);
  const { colorMode }             = useContext(ColorModeContext);
  const settings                  = useSettings();
  const history                   = useHistory();
  const searchRef                 = useRef(null);

  const isDark  = theme.palette.type === "dark" || theme.mode === "dark";
  const primary = theme.palette.primary.main || "#6366f1";

  // ── Variáveis de cor derivadas do tema — usadas nos inline styles ────
  const menuBg     = isDark ? "#0e1521"                : "#ffffff";
  const menuHeadBg = isDark ? "#080e17"                : "#f8fafc";
  const menuHover  = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const borderCol  = isDark ? "rgba(255,255,255,0.07)" : "#e8edf4";
  const textCol    = isDark ? "#e2e8f0"                : "#0f172a";

  const drawerLogoSrc = isDark
    ? (typeof theme.calculatedLogoDark  === "function" ? theme.calculatedLogoDark()  : logoDark)
    : (typeof theme.calculatedLogoLight === "function" ? theme.calculatedLogoLight() : logo);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/global-config/public-branding");
        if (data?.loginLogo) setWlLogoLight(resolveImageUrl(data.loginLogo, null));
        const dk = data?.logoDark || data?.loginLogoDark || null;
        if (dk) setWlLogoDark(resolveImageUrl(dk, null));
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { await settings.get("wtV"); setUserToken("disabled"); }
      catch (e) { if (e?.response?.status !== 401) console.error(e); }
    })();
  }, [settings]);

  useEffect(() => {
    if (document.body.offsetWidth > 600)
      setDrawerOpen(user.defaultMenu !== "closed");
    if (user.defaultTheme === "dark" && theme.mode === "light")
      colorMode.toggleColorMode();
  }, [user.defaultMenu]);

  useEffect(() => {
    setDrawerVariant(document.body.offsetWidth < 600 ? "temporary" : "permanent");
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user.companyId;
    if (!companyId) return;
    setProfileUrl(
      user.profileImage
        ? `${backendUrl}/public/avatar/${user.profileImage}`
        : `${process.env.FRONTEND_URL}/nopicture.png`
    );
    const onAuth = (data) => {
      if (data.user.id === +user.id) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => { localStorage.clear(); window.location.reload(); }, 1000);
      }
    };
    socket.on(`company-${companyId}-auth`, onAuth);
    socket.emit("userStatus");
    const iv = setInterval(() => socket.emit("userStatus"), 300_000);
    return () => { socket.off(`company-${companyId}-auth`, onAuth); clearInterval(iv); };
  }, [socket]);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSpotlightOpen((o) => !o);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const openSpotlight = () => {
    setSpotlightOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleMenuOpen    = (e) => { setAnchorEl(e.currentTarget); setMenuOpen(true); };
  const handleMenuClose   = ()  => { setAnchorEl(null); setMenuOpen(false); };
  const handleProfile     = ()  => { setUserModalOpen(true); handleMenuClose(); };
  const handleSupport     = ()  => { setSupportOpen(true);   handleMenuClose(); };
  const handleLogoutClick = ()  => { handleMenuClose(); handleLogout(); };

  const PAGES = [
    { label: "Dashboard",            path: "/",                 section: "Gestão",        color: "#3b82f6", icon: <DashboardRoundedIcon /> },
    { label: "Métricas do Servidor", path: "/server-metrics",   section: "Gestão",        color: "#0f766e", icon: <SpeedRoundedIcon /> },
    { label: "Relatórios",           path: "/reports",          section: "Gestão",        color: "#6366f1", icon: <AssessmentRoundedIcon /> },
    { label: "Atendimentos",         path: "/tickets",          section: "Atendimento",   color: "#0d9488", icon: <ForumRoundedIcon /> },
    { label: "Mensagens Rápidas",    path: "/quick-messages",   section: "Atendimento",   color: "#f59e0b", icon: <FlashOnRoundedIcon /> },
    { label: "Kanban",               path: "/kanban",           section: "Atendimento",   color: "#0ea5e9", icon: <ViewKanbanIcon /> },
    { label: "Contatos",             path: "/contacts",         section: "Atendimento",   color: "#10b981", icon: <ContactsRoundedIcon /> },
    { label: "Agendamentos",         path: "/schedules",        section: "Atendimento",   color: "#f43f5e", icon: <EventNoteRoundedIcon /> },
    { label: "Tags",                 path: "/tags",             section: "Atendimento",   color: "#f97316", icon: <LabelRoundedIcon /> },
    { label: "Chat Interno",         path: "/chats",            section: "Atendimento",   color: "#6366f1", icon: <ChatBubbleRoundedIcon /> },
    { label: "Ajuda",                path: "/helps",            section: "Atendimento",   color: "#0284c7", icon: <HelpRoundedIcon /> },
    { label: "Campanhas",            path: "/campaigns",        section: "Administração", color: "#ef4444", icon: <CampaignIcon /> },
    { label: "Listas de Contatos",   path: "/contact-lists",    section: "Administração", color: "#ef4444", icon: <ListAltRoundedIcon /> },
    { label: "Config. Campanhas",    path: "/campaigns-config", section: "Administração", color: "#ef4444", icon: <TuneRoundedIcon /> },
    { label: "FlowBuilder",          path: "/flowbuilders",     section: "Administração", color: "#8b5cf6", icon: <AccountTreeRoundedIcon /> },
    { label: "Listas de Frases",     path: "/phrase-lists",     section: "Administração", color: "#8b5cf6", icon: <SortByAlphaRoundedIcon /> },
    { label: "Avisos",               path: "/announcements",    section: "Administração", color: "#f59e0b", icon: <NotificationsRoundedIcon /> },
    { label: "API de Mensagens",     path: "/messages-api",     section: "Administração", color: "#059669", icon: <ApiRoundedIcon /> },
    { label: "Usuários",             path: "/users",            section: "Administração", color: "#4f46e5", icon: <GroupRoundedIcon /> },
    { label: "Filas",                path: "/queues",           section: "Administração", color: "#0d9488", icon: <QueueRoundedIcon /> },
    { label: "Prompts IA",           path: "/prompts",          section: "Administração", color: "#9333ea", icon: <PsychologyRoundedIcon /> },
    { label: "Integrações",          path: "/queue-integration",section: "Administração", color: "#ea580c", icon: <ExtensionRoundedIcon /> },
    { label: "Conexões",             path: "/connections",      section: "Administração", color: "#64748b", icon: <RouterRoundedIcon /> },
    { label: "Arquivos",             path: "/files",            section: "Administração", color: "#2563eb", icon: <FolderRoundedIcon /> },
    { label: "Financeiro",           path: "/financeiro",       section: "Administração", color: "#16a34a", icon: <AccountBalanceRoundedIcon /> },
    { label: "Configurações",        path: "/settings",         section: "Administração", color: "#475569", icon: <SettingsRoundedIcon /> },
    { label: "Config. Globais",      path: "/global-config",    section: "Administração", color: "#7c3aed", icon: <PublicRoundedIcon /> },
  ];

  const filtered = query.trim()
    ? PAGES.filter((p) =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.section.toLowerCase().includes(query.toLowerCase())
      )
    : PAGES;

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const goTo = (path) => {
    history.push(path);
    setSpotlightOpen(false);
    setQuery(""); setActiveIdx(0);
  };

  const handleSpotlightKey = (e) => {
    if      (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[activeIdx]) goTo(filtered[activeIdx].path);
    else if (e.key === "Escape")    { setSpotlightOpen(false); setQuery(""); }
  };

  if (loading) return <BackdropLoading />;

  return (
    <div className={`ull-root ${classes.root}`}>
      <GlobalStyles />

      {/* ── Drawer ──────────────────────────────────────────────────────── */}
      <Drawer
        variant={drawerVariant}
        classes={{
          paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
        }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className={classes.drawerHeader}>
          {drawerOpen && (
            <img src={drawerLogoSrc} alt="logo" className={classes.drawerLogoImg} />
          )}
        </div>

        {drawerOpen && (
          <div
            className="ull-drawer-search"
            onClick={openSpotlight}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openSpotlight()}
          >
            <SearchRoundedIcon style={{ fontSize: "0.90rem", color: "#94a3b8", flexShrink: 0 }} />
            <span className="ull-search-label">Buscar no menu…</span>
            <span className="ull-kbd-pill">Ctrl K</span>
          </div>
        )}

        <List className={`ull-scroll ${classes.scrollArea}`}>
          <MainListItems collapsed={!drawerOpen} />
        </List>
        <Divider />
      </Drawer>

      {/* ── AppBar ──────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        elevation={0}
      >
        <Toolbar variant="dense" className={classes.toolbar}>

          {/* Hamburguer — visível só com drawer fechado */}
          <Tooltip title="Abrir menu">
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              className={clsx(classes.menuBtn, drawerOpen && classes.menuBtnHidden)}
              aria-label="open drawer"
            >
              <MenuRoundedIcon />
            </IconButton>
          </Tooltip>

          {/* Botão FECHAR — visível só com drawer aberto */}
          {drawerOpen && (
            <Tooltip title="Fechar menu">
              <IconButton
                onClick={() => setDrawerOpen(false)}
                className={classes.menuBtn}
                aria-label="close drawer"
                style={{ marginLeft: 8 }}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          <div className={classes.spacer} />
          <div className={classes.spacer} />

          {/* Ações */}
          <div className={classes.actions}>

            {userToken === "enabled" && user?.companyId === 1 && (
              <Chip className={classes.chip} label={i18n.t("mainDrawer.appBar.user.token")} size="small" />
            )}

            <div className={classes.iconWrap}>
              <VersionControl />
            </div>

            <div className={classes.divider} />

            <Tooltip title={isDark ? "Modo claro" : "Modo escuro"}>
              <IconButton className={classes.iconBtn} onClick={colorMode.toggleColorMode} aria-label="toggle theme">
                {isDark ? <WbSunnyRoundedIcon /> : <NightsStayRoundedIcon />}
              </IconButton>
            </Tooltip>

            <div className={classes.iconWrap}>
              <NotificationsVolume
                setVolume={setVolume} volume={volume}
                notificationSound={notifSound} setNotificationSound={setNotifSound}
              />
            </div>

            <Tooltip title={i18n.t("mainDrawer.appBar.refresh")}>
              <IconButton className={classes.iconBtn} onClick={() => window.location.reload(false)} aria-label="refresh">
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>

            <div className={classes.divider} />

            {user.id && (
              <div className={classes.iconWrap}>
                <NotificationsPopOver volume={volume} notificationSound={notifSound} />
              </div>
            )}

            <div className={classes.iconWrap}>
              <AnnouncementsPopover />
            </div>

            <div className={classes.iconWrap}>
              <ChatPopover />
            </div>

            <div className={classes.divider} />

            <OnlineBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              onClick={handleMenuOpen}
              style={{ cursor: "pointer" }}
            >
              <Avatar alt={user.name} src={profileUrl} className={classes.avatar} />
            </OnlineBadge>
          </div>

          <UserModal
            open={userModalOpen}
            onClose={() => setUserModalOpen(false)}
            onImageUpdate={setProfileUrl}
            userId={user?.id}
          />

          {/* ── Avatar Dropdown ─────────────────────────────────────────── */}
          {menuOpen && (
            <div
              style={{
                position: "fixed", inset: 0, zIndex: 1300,
                pointerEvents: "none",
              }}
            >
              {/* overlay transparente para fechar ao clicar fora */}
              <div
                style={{ position: "absolute", inset: 0, pointerEvents: "all" }}
                onClick={handleMenuClose}
              />
              {/* painel */}
              <div
                style={{
                  position: "absolute",
                  top: (anchorEl?.getBoundingClientRect().bottom ?? 0) + 10,
                  right: window.innerWidth - (anchorEl?.getBoundingClientRect().right ?? 0),
                  width: 240,
                  borderRadius: 16,
                  background: menuBg,
                  border: `1px solid ${borderCol}`,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  pointerEvents: "all",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  animation: "ull-popin 0.18s cubic-bezier(0.34,1.4,0.64,1)",
                  zIndex: 1,
                }}
              >
                {/* Seta decorativa */}
                <div style={{
                  position: "absolute", top: -6, right: 18,
                  width: 12, height: 12,
                  background: menuHeadBg,
                  border: `1px solid ${borderCol}`,
                  borderRight: "none", borderBottom: "none",
                  transform: "rotate(45deg)",
                  borderRadius: "2px 0 0 0",
                }} />

                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  borderBottom: `1px solid ${borderCol}`,
                  background: menuHeadBg,
                }}>
                  <OnlineBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                  >
                    <Avatar
                      alt={user.name}
                      src={profileUrl}
                      style={{
                        width: 40, height: 40,
                        border: `2px solid ${borderCol}`,
                        borderRadius: "50%",
                      }}
                    />
                  </OnlineBadge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.875rem", fontWeight: 700, color: textCol,
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{user.name}</div>
                    {user.profile && (
                      <div style={{
                        fontSize: "0.70rem", color: "#64748b", marginTop: 1,
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{user.profile}</div>
                    )}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      marginTop: 6,
                      background: "rgba(34,197,94,0.10)",
                      border: "1px solid rgba(34,197,94,0.22)",
                      borderRadius: 20, padding: "2px 8px",
                      fontSize: "0.66rem", fontWeight: 600, color: "#22c55e",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#22c55e", flexShrink: 0,
                        animation: "ull-dot-pulse 1.6s infinite ease-in-out",
                        display: "inline-block",
                      }} />
                      Online
                    </div>
                  </div>
                </div>

                {/* Itens */}
                <div style={{ padding: 6, background: menuBg }}>
                  {/* Perfil */}
                  <div
                    role="menuitem"
                    onClick={handleProfile}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10,
                      fontSize: "0.825rem", fontWeight: 500, color: textCol,
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      cursor: "pointer", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = menuHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(99,102,241,0.12)", color: "#818cf8",
                    }}>
                      <PersonRoundedIcon style={{ fontSize: "1.05rem" }} />
                    </span>
                    {i18n.t("mainDrawer.appBar.user.profile")}
                  </div>

                  {/* Suporte */}
                  <div
                    role="menuitem"
                    onClick={handleSupport}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10,
                      fontSize: "0.825rem", fontWeight: 500, color: textCol,
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      cursor: "pointer", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = menuHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(34,197,94,0.12)", color: "#22c55e",
                    }}>
                      <HeadsetMicRoundedIcon style={{ fontSize: "1.05rem" }} />
                    </span>
                    Suporte
                  </div>

                  {/* Separador */}
                  <div style={{ height: 1, background: borderCol, margin: "4px 6px" }} />

                  {/* Sair */}
                  <div
                    role="menuitem"
                    onClick={handleLogoutClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10,
                      fontSize: "0.825rem", fontWeight: 500, color: "#ef4444",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      cursor: "pointer", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(239,68,68,0.10)", color: "#ef4444",
                    }}>
                      <ExitToAppRoundedIcon style={{ fontSize: "1.05rem" }} />
                    </span>
                    {i18n.t("mainDrawer.appBar.user.logout")}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Conteúdo ── */}
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ?? null}
      </main>

      {/* ── Modal Suporte ── */}
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* ── Spotlight ── */}
      {spotlightOpen && (() => {
        let gIdx = -1;
        return (
          <div
            className="ull-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) { setSpotlightOpen(false); setQuery(""); } }}
          >
            <div className="ull-spotlight">

              {/* Header */}
              <div className="ull-sp-head">
                <div className="ull-sp-icon">
                  <SearchRoundedIcon />
                </div>
                <div className="ull-sp-input-wrap">
                  <div className="ull-sp-title">Buscar páginas</div>
                  <input
                    ref={searchRef}
                    className="ull-sp-input"
                    placeholder="Digite o nome do menu ou seção…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                    onKeyDown={handleSpotlightKey}
                    autoComplete="off"
                  />
                </div>
                <button
                  className="ull-sp-close"
                  onClick={() => { setSpotlightOpen(false); setQuery(""); }}
                  aria-label="Fechar busca"
                >
                  <CloseRoundedIcon style={{ fontSize: 14 }} />
                </button>
              </div>

              <div className="ull-sp-results">
                {filtered.length === 0 ? (
                  <div className="ull-sp-empty">
                    Nenhuma página encontrada para <strong>"{query}"</strong>
                  </div>
                ) : (
                  Object.entries(grouped).map(([section, items]) => (
                    <div key={section}>
                      <div className="ull-sp-group">{section}</div>
                      {items.map((item) => {
                        gIdx++;
                        const idx = gIdx;
                        return (
                          <button
                            key={item.path}
                            className={`ull-sp-item${idx === activeIdx ? " active" : ""}`}
                            onClick={() => goTo(item.path)}
                            onMouseEnter={() => setActiveIdx(idx)}
                          >
                            <span
                              className="ull-sp-dot"
                              style={{ background: item.color + "18", color: item.color }}
                            >
                              {item.icon}
                            </span>
                            <span className="ull-sp-name">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="ull-sp-foot">
                <span className="ull-hint"><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
                <span className="ull-hint"><kbd>Enter</kbd> abrir</span>
                <span className="ull-hint"><kbd>Esc</kbd> fechar</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default LoggedInLayout;