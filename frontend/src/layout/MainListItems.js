import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme, alpha } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";

import ListItem      from "@material-ui/core/ListItem";
import ListItemIcon  from "@material-ui/core/ListItemIcon";
import ListItemText  from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider       from "@material-ui/core/Divider";
import Badge         from "@material-ui/core/Badge";
import Collapse      from "@material-ui/core/Collapse";
import List          from "@material-ui/core/List";
import Tooltip       from "@material-ui/core/Tooltip";
import Typography    from "@material-ui/core/Typography";
import Box           from "@material-ui/core/Box";
import Chip          from "@material-ui/core/Chip";

import WhatsAppIcon                              from "@material-ui/icons/WhatsApp";
import DashboardOutlinedIcon                     from "@material-ui/icons/DashboardOutlined";
import SettingsOutlinedIcon                      from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon                     from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon                  from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon                   from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon                               from "@material-ui/icons/FlashOn";
import HelpOutlineIcon                           from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon                           from "@material-ui/icons/CodeRounded";
import Schedule                                  from "@material-ui/icons/Schedule";
import LocalOfferIcon                            from "@material-ui/icons/LocalOffer";
import EventAvailableIcon                        from "@material-ui/icons/EventAvailable";
import RouterIcon                                from "@material-ui/icons/Router";
import ExpandLessIcon                            from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon                            from "@material-ui/icons/ExpandMore";
import PeopleIcon                                from "@material-ui/icons/People";
import ListIcon                                  from "@material-ui/icons/ListAlt";
import AnnouncementIcon                          from "@material-ui/icons/Announcement";
import ForumIcon                                 from "@material-ui/icons/Forum";
import LocalAtmIcon                              from "@material-ui/icons/LocalAtm";
import SignalCellularConnectedNoInternet4BarIcon from "@material-ui/icons/SignalCellularConnectedNoInternet4Bar";
import { AllInclusive, AttachFile, Dashboard, Description, DeviceHubOutlined, SettingsApplications } from "@material-ui/icons";
import ViewKanban       from "@mui/icons-material/ViewKanban";
import { ShapeLine, Webhook } from "@mui/icons-material";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext }      from "../context/Auth/AuthContext";
import { useActiveMenu }    from "../context/ActiveMenuContext";
import { Can }              from "../components/Can";
import { isArray }          from "lodash";
import api                  from "../services/api";
import toastError           from "../errors/toastError";
import usePlans             from "../hooks/usePlans";
import useVersion           from "../hooks/useVersion";
import { i18n }             from "../translate/i18n";

/* ─── Paleta de cores dos ícones ─────────────────────────────────────────── */
const iconStyles = {
  dashboard:    { color: "#3b82f6", gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)" },
  tickets:      { color: "#0d9488", gradient: "linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)" },
  messages:     { color: "#f59e0b", gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" },
  kanban:       { color: "#0ea5e9", gradient: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)" },
  contacts:     { color: "#10b981", gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)" },
  schedules:    { color: "#f43f5e", gradient: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)" },
  tags:         { color: "#f97316", gradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)" },
  chats:        { color: "#6366f1", gradient: "linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)" },
  helps:        { color: "#0284c7", gradient: "linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)" },
  campaigns:    { color: "#ef4444", gradient: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)" },
  flowbuilder:  { color: "#8b5cf6", gradient: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)" },
  announcements:{ color: "#f59e0b", gradient: "linear-gradient(135deg, #fbbf24 0%, #b45309 100%)" },
  api:          { color: "#059669", gradient: "linear-gradient(135deg, #34d399 0%, #065f46 100%)" },
  users:        { color: "#4f46e5", gradient: "linear-gradient(135deg, #818cf8 0%, #3730a3 100%)" },
  queues:       { color: "#0d9488", gradient: "linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)" },
  prompts:      { color: "#9333ea", gradient: "linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)" },
  integrations: { color: "#ea580c", gradient: "linear-gradient(135deg, #fb923c 0%, #c2410c 100%)" },
  connections:  { color: "#64748b", gradient: "linear-gradient(135deg, #94a3b8 0%, #475569 100%)" },
  files:        { color: "#2563eb", gradient: "linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)" },
  financial:    { color: "#16a34a", gradient: "linear-gradient(135deg, #4ade80 0%, #15803d 100%)" },
  settings:     { color: "#475569", gradient: "linear-gradient(135deg, #94a3b8 0%, #334155 100%)" },
  globalConfig: { color: "#7c3aed", gradient: "linear-gradient(135deg, #a78bfa 0%, #5b21b6 100%)" },
  server:       { color: "#0f766e", gradient: "linear-gradient(135deg, #2dd4bf 0%, #0d5c55 100%)" },
  default:      { color: "#2563eb", gradient: "linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)" },
};

/* ─── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.mode === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  /* Tokens que espelham os modais e o LoggedInLayout */
  const drawerBg     = isDark ? "#0f1929" : "#f4f7fb";
  const itemHover    = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)";
  const itemActive   = isDark ? alpha(primary, 0.18)     : alpha(primary, 0.10);
  const textColor    = isDark ? "#e2e8f0" : "#344054";
  const textActive   = isDark ? "#f8fafc" : "#111827";
  const textMuted    = isDark ? "#64748b" : "#667085";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "#e3eaf2";
  const subBg        = isDark
    ? "rgba(255,255,255,0.03)"
    : "rgba(15,23,42,0.03)";
  const iconInactiveBg  = isDark ? "rgba(30,41,59,0.9)"  : "rgba(248,250,252,0.95)";
  const iconInactiveBdr = isDark ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.22)";

  return {
    menuRoot: {
      padding: "8px 8px 12px",
      backgroundColor: drawerBg,
      minHeight: "100%",
    },

    /* ── Item base ── */
    item: {
      height: 40,
      marginBottom: 3,
      borderRadius: 10,
      paddingLeft: 8,
      paddingRight: 8,
      transition: "all 0.18s ease",
      "&:hover": {
        backgroundColor: itemHover,
        transform: "translateX(2px)",
      },
    },
    itemCollapsed: {
      justifyContent: "center",
      paddingLeft: 4,
      paddingRight: 4,
    },
    itemSub: {
      height: 36,
      marginBottom: 2,
      marginLeft: 6,
      marginRight: 6,
      paddingLeft: 6,
      borderRadius: 8,
    },
    itemActive: {
      backgroundColor: itemActive,
      "& $itemLabel": {
        fontWeight: 700,
        color: textActive,
      },
    },

    /* ── Ícone ── */
    iconWrap: { minWidth: 40 },
    iconWrapCollapsed: { minWidth: "auto", margin: 0 },
    iconSurface: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      width: 30,
      height: 30,
      transition: "all 0.18s ease",
      "& .MuiSvgIcon-root": { fontSize: "1.10rem" },
    },

    /* ── Texto ── */
    itemTextWrap: { margin: 0 },
    itemLabel: {
      fontSize: "0.82rem",
      fontWeight: 600,
      letterSpacing: "0.005em",
      color: textColor,
      lineHeight: 1.2,
    },

    /* ── Expand chevron ── */
    chevron: { color: textMuted, fontSize: "1rem", flexShrink: 0 },

    /* ── Submenu container ── */
    submenuWrap: {
      margin: "2px 0 6px",
      borderRadius: 10,
      background: subBg,
      border: `1px solid ${dividerColor}`,
      overflow: "hidden",
      padding: "4px 0",
    },

    /* ── Divisor + subheader ── */
    divider: {
      margin: "10px 6px 6px",
      backgroundColor: dividerColor,
    },
    subheader: {
      paddingLeft: 14,
      paddingRight: 14,
      fontSize: "0.68rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: textMuted,
      lineHeight: "22px",
      background: "transparent",
    },

    /* ── Versão ── */
    versionWrap: {
      padding: "12px 10px 6px",
      display: "flex",
      justifyContent: "center",
    },
    versionChip: {
      height: 22,
      fontSize: "0.68rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      backgroundColor: isDark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)",
      border: `1px solid ${isDark ? "rgba(96,165,250,0.25)" : "rgba(37,99,235,0.18)"}`,
      color: isDark ? "#93c5fd" : "#1d4ed8",
      borderRadius: 7,
    },
  };
});

/* ─── Reducer de chats ────────────────────────────────────────────────────── */
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CHATS":
      if (!isArray(action.payload)) return state;
      const merged = [...state];
      action.payload.forEach((chat) => {
        const idx = merged.findIndex((c) => c.id === chat.id);
        if (idx !== -1) merged[idx] = chat; else merged.push(chat);
      });
      return merged;
    case "UPDATE_CHATS": {
      const idx = state.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) { const s = [...state]; s[idx] = action.payload; return s; }
      return [action.payload, ...state];
    }
    case "DELETE_CHAT": {
      const s = [...state];
      const idx = s.findIndex((c) => c.id === action.payload);
      if (idx !== -1) s.splice(idx, 1);
      return s;
    }
    case "CHANGE_CHAT":
      return state.map((c) => c.id === action.payload.chat.id ? action.payload.chat : c);
    case "RESET":
      return [];
    default:
      return state;
  }
};

/* ─── ListItemLink ────────────────────────────────────────────────────────── */
function ListItemLink({ icon, primary, to, tooltip, showBadge, iconKey, small }) {
  const classes  = useStyles();
  const theme    = useTheme();
  const isDark   = theme.mode === "dark";
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const style    = iconStyles[iconKey] || iconStyles.default;
  const isCollapsed = !!tooltip;

  const activeSurface = {
    color: "#ffffff",
    background: style.gradient,
    boxShadow: "0 4px 12px -4px rgba(15,23,42,0.4)",
  };
  const inactiveSurface = {
    color: style.color,
    background: isDark ? "rgba(30,41,59,0.9)" : "rgba(248,250,252,0.95)",
    border: `1px solid ${isDark ? "rgba(148,163,184,0.16)" : "rgba(148,163,184,0.22)"}`,
  };

  const renderLink = React.useMemo(
    () => React.forwardRef((p, ref) => <RouterLink to={to} ref={ref} {...p} />),
    [to]
  );

  const inner = (
    <li>
      <ListItem
        button
        component={renderLink}
        className={[
          classes.item,
          isActive  ? classes.itemActive    : "",
          small     ? classes.itemSub       : "",
          isCollapsed ? classes.itemCollapsed : "",
        ].join(" ")}
      >
        {icon && (
          <ListItemIcon className={isCollapsed ? classes.iconWrapCollapsed : classes.iconWrap}>
            {showBadge ? (
              <Badge badgeContent="!" color="error" overlap="circular">
                <span className={classes.iconSurface} style={isActive ? activeSurface : inactiveSurface}>
                  {icon}
                </span>
              </Badge>
            ) : (
              <span className={classes.iconSurface} style={isActive ? activeSurface : inactiveSurface}>
                {icon}
              </span>
            )}
          </ListItemIcon>
        )}
        {!isCollapsed && (
          <ListItemText
            className={classes.itemTextWrap}
            primary={<span className={classes.itemLabel}>{primary}</span>}
          />
        )}
      </ListItem>
    </li>
  );

  if (!tooltip) return inner;
  return (
    <Tooltip placement="right" arrow title={<span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{primary}</span>}>
      {inner}
    </Tooltip>
  );
}

/* ─── Submenu expandível ──────────────────────────────────────────────────── */
function SubmenuItem({ icon, iconKey, label, isActive, isCollapsed, isOpen, onClick, onMouseEnter, onMouseLeave, children }) {
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.mode === "dark";
  const [hovered, setHovered] = useState(false);

  const style = iconStyles[iconKey] || iconStyles.default;
  const activeSurface = {
    color: "#ffffff",
    background: style.gradient,
    boxShadow: "0 4px 12px -4px rgba(15,23,42,0.4)",
  };
  const inactiveSurface = {
    color: style.color,
    background: isDark ? "rgba(30,41,59,0.9)" : "rgba(248,250,252,0.95)",
    border: `1px solid ${isDark ? "rgba(148,163,184,0.16)" : "rgba(148,163,184,0.22)"}`,
  };
  const surfaceStyle = (isActive || hovered) ? activeSurface : inactiveSurface;

  const inner = (
    <ListItem
      dense
      button
      className={[
        classes.item,
        isActive    ? classes.itemActive    : "",
        isCollapsed ? classes.itemCollapsed : "",
      ].join(" ")}
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onMouseEnter?.(); }}
      onMouseLeave={() => { setHovered(false); onMouseLeave?.(); }}
    >
      <ListItemIcon className={isCollapsed ? classes.iconWrapCollapsed : classes.iconWrap}>
        <span className={classes.iconSurface} style={surfaceStyle}>{icon}</span>
      </ListItemIcon>
      {!isCollapsed && (
        <>
          <ListItemText
            className={classes.itemTextWrap}
            primary={<span className={classes.itemLabel}>{label}</span>}
          />
          {isOpen
            ? <ExpandLessIcon className={classes.chevron} />
            : <ExpandMoreIcon className={classes.chevron} />}
        </>
      )}
    </ListItem>
  );

  return (
    <>
      {isCollapsed
        ? <Tooltip placement="right" arrow title={<span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{label}</span>}>{inner}</Tooltip>
        : inner}
      <Collapse in={!isCollapsed && isOpen} timeout="auto" unmountOnExit className={classes.submenuWrap}>
        <List dense component="div" disablePadding>{children}</List>
      </Collapse>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
const MainListItems = ({ collapsed, drawerClose }) => {
  const classes  = useStyles();
  const { whatsApps }           = useContext(WhatsAppsContext);
  const { user, socket }        = useContext(AuthContext);
  const { setActiveMenu }       = useActiveMenu();
  const location                = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaign,  setOpenCampaign]  = useState(false);
  const [openFlow,      setOpenFlow]      = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const [showCampaigns,     setShowCampaigns]     = useState(false);
  const [showKanban,        setShowKanban]        = useState(false);
  const [showOpenAi,        setShowOpenAi]        = useState(false);
  const [showIntegrations,  setShowIntegrations]  = useState(false);
  const [showSchedules,     setShowSchedules]     = useState(false);
  const [showInternalChat,  setShowInternalChat]  = useState(false);
  const [showExternalApi,   setShowExternalApi]   = useState(false);
  const [invisible,    setInvisible]    = useState(true);
  const [pageNumber]                    = useState(1);
  const [searchParam]                   = useState("");
  const [chats, dispatch]               = useReducer(reducer, []);
  const [hasHelps, setHasHelps]         = useState(false);

  const { list }           = useHelps();
  const { getPlanCompany } = usePlans();
  const { getVersion }     = useVersion();

  /* ── Flags de rota ativa ── */
  const isManagementActive   = location.pathname === "/" || location.pathname.startsWith("/reports") || location.pathname.startsWith("/moments") || location.pathname.startsWith("/server-metrics");
  const isCampaignActive     = ["/campaigns", "/contact-lists", "/campaigns-config"].some((p) => location.pathname === p || location.pathname.startsWith(p));
  const isFlowActive         = ["/phrase-lists", "/flowbuilders"].some((p) => location.pathname.startsWith(p));

  /* ── Effects ── */
  useEffect(() => {
    list().then((h) => setHasHelps(h.length > 0)).catch((e) => { if (e?.response?.status !== 401) console.error(e); });
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) setActiveMenu("/tickets");
    else setActiveMenu("");
  }, [location, setActiveMenu]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getPlanCompany(undefined, user.companyId);
        setShowCampaigns(p.plan.useCampaigns);
        setShowKanban(p.plan.useKanban);
        setShowOpenAi(p.plan.useOpenAi);
        setShowIntegrations(p.plan.useIntegrations);
        setShowSchedules(p.plan.useSchedules);
        setShowInternalChat(p.plan.useInternalChat);
        setShowExternalApi(p.plan.useExternalApi);
      } catch (e) { if (e?.response?.status !== 401) console.error(e); }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/chats/", { params: { searchParam, pageNumber } });
        dispatch({ type: "LOAD_CHATS", payload: data.records });
      } catch (err) { toastError(err); }
    }, 500);
    return () => clearTimeout(t);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (!user.id) return;
    const handler = (data) => {
      if (data.action === "new-message" || data.action === "update")
        dispatch({ type: "CHANGE_CHAT", payload: data });
    };
    socket.on(`company-${user.companyId}-chat`, handler);
    return () => socket.off(`company-${user.companyId}-chat`, handler);
  }, [socket]);

  useEffect(() => {
    const unreads = chats.reduce((acc, chat) => {
      const cu = chat.users?.find((u) => u.userId === user.id);
      return acc + (cu?.unreads || 0);
    }, 0);
    setInvisible(unreads === 0);
  }, [chats, user.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offline = whatsApps.some((w) => ["qrcode","PAIRING","DISCONNECTED","TIMEOUT","OPENING"].includes(w.status));
        setConnectionWarning(offline);
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [whatsApps]);

  return (
    <div onClick={drawerClose} className={classes.menuRoot}>

      {/* ════ ÁREA DO USUÁRIO ════ */}
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") || user.allowRealTime === "enabled"
            ? "admin" : user.profile
        }
        perform="drawer-admin-items:view"
        yes={() => (
          <SubmenuItem
            icon={<Dashboard style={{ fontSize: "1.05rem" }} />}
            iconKey="dashboard"
            label={i18n.t("mainDrawer.listItems.management")}
            isActive={isManagementActive}
            isCollapsed={collapsed}
            isOpen={openDashboard}
            onClick={() => setOpenDashboard((p) => !p)}
          >
            <Can
              role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <>
                  <ListItemLink small to="/" primary="Dashboard" icon={<DashboardOutlinedIcon />} iconKey="dashboard" tooltip={collapsed} />
                  {user.super && (
                    <ListItemLink small to="/server-metrics" primary="Dados do Servidor" icon={<RouterIcon />} iconKey="server" tooltip={collapsed} />
                  )}
                  <ListItemLink small to="/reports" primary={i18n.t("mainDrawer.listItems.reports")} icon={<Description />} iconKey="dashboard" tooltip={collapsed} />
                </>
              )}
            />
          </SubmenuItem>
        )}
      />

      <ListItemLink to="/tickets"       primary={i18n.t("mainDrawer.listItems.tickets")}       icon={<WhatsAppIcon />}               iconKey="tickets"   tooltip={collapsed} />
      <ListItemLink to="/quick-messages" primary={i18n.t("mainDrawer.listItems.quickMessages")} icon={<FlashOnIcon />}                iconKey="messages"  tooltip={collapsed} />

      {showKanban && (
        <ListItemLink to="/kanban" primary={i18n.t("mainDrawer.listItems.kanban")} icon={<ViewKanban />} iconKey="kanban" tooltip={collapsed} />
      )}

      <ListItemLink to="/contacts" primary={i18n.t("mainDrawer.listItems.contacts")} icon={<ContactPhoneOutlinedIcon />} iconKey="contacts" tooltip={collapsed} />

      {showSchedules && (
        <ListItemLink to="/schedules" primary={i18n.t("mainDrawer.listItems.schedules")} icon={<Schedule />} iconKey="schedules" tooltip={collapsed} />
      )}

      <ListItemLink to="/tags" primary={i18n.t("mainDrawer.listItems.tags")} icon={<LocalOfferIcon />} iconKey="tags" tooltip={collapsed} />

      {showInternalChat && (
        <ListItemLink
          to="/chats"
          primary={i18n.t("mainDrawer.listItems.chats")}
          icon={<Badge color="secondary" variant="dot" overlap="rectangular" invisible={invisible}><ForumIcon /></Badge>}
          iconKey="chats"
          tooltip={collapsed}
        />
      )}

      {hasHelps && (
        <ListItemLink to="/helps" primary={i18n.t("mainDrawer.listItems.helps")} icon={<HelpOutlineIcon />} iconKey="helps" tooltip={collapsed} />
      )}

      {/* ════ ADMINISTRAÇÃO ════ */}
      <Can
        role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
        perform="dashboard:view"
        yes={() => (
          <>
            {!collapsed && (
              <>
                <Divider className={classes.divider} />
                <ListSubheader inset className={classes.subheader}>
                  {i18n.t("mainDrawer.listItems.administration")}
                </ListSubheader>
              </>
            )}

            {/* Campanhas */}
            {showCampaigns && (
              <Can role={user.profile} perform="dashboard:view" yes={() => (
                <SubmenuItem
                  icon={<EventAvailableIcon style={{ fontSize: "1.05rem" }} />}
                  iconKey="campaigns"
                  label={i18n.t("mainDrawer.listItems.campaigns")}
                  isActive={isCampaignActive}
                  isCollapsed={collapsed}
                  isOpen={openCampaign}
                  onClick={() => setOpenCampaign((p) => !p)}
                >
                  <ListItemLink small to="/campaigns"       primary={i18n.t("campaigns.subMenus.list")}         icon={<ListIcon />}           iconKey="campaigns" tooltip={collapsed} />
                  <ListItemLink small to="/contact-lists"   primary={i18n.t("campaigns.subMenus.listContacts")} icon={<PeopleIcon />}          iconKey="campaigns" tooltip={collapsed} />
                  <ListItemLink small to="/campaigns-config" primary={i18n.t("campaigns.subMenus.settings")}   icon={<SettingsOutlinedIcon />} iconKey="campaigns" tooltip={collapsed} />
                </SubmenuItem>
              )} />
            )}

            {/* FlowBuilder */}
            <Can role={user.profile} perform="dashboard:view" yes={() => (
              <SubmenuItem
                icon={<Webhook style={{ fontSize: "1.05rem" }} />}
                iconKey="flowbuilder"
                label={i18n.t("mainDrawer.listItems.flowbuilder")}
                isActive={isFlowActive}
                isCollapsed={collapsed}
                isOpen={openFlow}
                onClick={() => setOpenFlow((p) => !p)}
              >
                <ListItemLink small to="/phrase-lists"  primary={i18n.t("flowbuilder.subMenus.campaign")}     icon={<EventAvailableIcon />} iconKey="flowbuilder" tooltip={collapsed} />
                <ListItemLink small to="/flowbuilders"  primary={i18n.t("flowbuilder.subMenus.conversation")} icon={<ShapeLine />}          iconKey="flowbuilder" tooltip={collapsed} />
              </SubmenuItem>
            )} />

            {user.super && (
              <ListItemLink to="/announcements" primary={i18n.t("mainDrawer.listItems.annoucements")} icon={<AnnouncementIcon />} iconKey="announcements" tooltip={collapsed} />
            )}

            {showExternalApi && (
              <Can role={user.profile} perform="dashboard:view" yes={() => (
                <ListItemLink to="/messages-api" primary={i18n.t("mainDrawer.listItems.messagesAPI")} icon={<CodeRoundedIcon />} iconKey="api" tooltip={collapsed} />
              )} />
            )}

            <Can role={user.profile} perform="dashboard:view" yes={() => (
              <ListItemLink to="/users" primary={i18n.t("mainDrawer.listItems.users")} icon={<PeopleAltOutlinedIcon />} iconKey="users" tooltip={collapsed} />
            )} />

            <Can role={user.profile} perform="dashboard:view" yes={() => (
              <ListItemLink to="/queues" primary={i18n.t("mainDrawer.listItems.queues")} icon={<AccountTreeOutlinedIcon />} iconKey="queues" tooltip={collapsed} />
            )} />

            {showOpenAi && (
              <Can role={user.profile} perform="dashboard:view" yes={() => (
                <ListItemLink to="/prompts" primary={i18n.t("mainDrawer.listItems.prompts")} icon={<AllInclusive />} iconKey="prompts" tooltip={collapsed} />
              )} />
            )}

            {showIntegrations && (
              <Can role={user.profile} perform="dashboard:view" yes={() => (
                <ListItemLink to="/queue-integration" primary={i18n.t("mainDrawer.listItems.queueIntegration")} icon={<DeviceHubOutlined />} iconKey="integrations" tooltip={collapsed} />
              )} />
            )}

            <Can
              role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <ListItemLink to="/connections" primary={i18n.t("mainDrawer.listItems.connections")} icon={<SignalCellularConnectedNoInternet4BarIcon />} iconKey="connections" showBadge={connectionWarning} tooltip={collapsed} />
              )}
            />

            <Can role={user.profile} perform="dashboard:view" yes={() => (
              <ListItemLink to="/files" primary={i18n.t("mainDrawer.listItems.files")} icon={<AttachFile />} iconKey="files" tooltip={collapsed} />
            )} />

            <Can role={user.profile} perform="dashboard:view" yes={() => (
              <ListItemLink to="/financeiro" primary={i18n.t("mainDrawer.listItems.financeiro")} icon={<LocalAtmIcon />} iconKey="financial" tooltip={collapsed} />
            )} />

            <Can role={user.profile} perform="dashboard:view" yes={() => (
              <ListItemLink to="/settings" primary={i18n.t("mainDrawer.listItems.settings")} icon={<SettingsOutlinedIcon />} iconKey="settings" tooltip={collapsed} />
            )} />

            {user.super && (
              <ListItemLink to="/global-config" primary={i18n.t("globalConfig.title", "Configurações Globais")} icon={<SettingsApplications />} iconKey="globalConfig" tooltip={collapsed} />
            )}
          </>
        )}
      />

      {/* ── Versão ── */}
      {!collapsed && (
        <>
          <Divider className={classes.divider} />
          <Box className={classes.versionWrap}>
            <Chip label="V15.0.2" size="small" className={classes.versionChip} />
          </Box>
        </>
      )}
    </div>
  );
};

export default MainListItems;