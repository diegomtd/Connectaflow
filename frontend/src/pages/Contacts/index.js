/**
 * Contacts — Visual 100% fiel ao Dashboard
 * - usePalette idêntico (dark/light, whitelabel)
 * - FontStyle DM Sans + JetBrains Mono
 * - Cabeçalho corporativo com gradiente, breadcrumb e meta-tags
 * - SubPaper / SectionLabel / inputSx / tokens idênticos
 * - Toda a lógica original 100% preservada
 * - ContactCard, tabela lista, mapa, modais — INTOCADOS na lógica
 */

import React, {
  useState, useEffect, useReducer, useContext, useRef, useMemo,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import {
  Avatar, Box, Button, Card, CardContent, Checkbox, Chip, Grid,
  IconButton, InputAdornment, Menu, MenuItem, Paper, Skeleton,
  Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography, alpha,
} from "@mui/material";
import {
  ArrowDropDown, Backup, Block, Cancel, CheckCircle, ContactPhone,
  DeleteOutline, Edit, Facebook, FiberManualRecord, Groups,
  Instagram, Insights, Person, Search, ViewList, ViewModule, WhatsApp,
} from "@mui/icons-material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import {
  ComposableMap, Geographies, Geography, Marker,
} from "react-simple-maps";

import api                   from "../../services/api";
import ContactModal          from "../../components/ContactModal";
import ConfirmationModal     from "../../components/ConfirmationModal";
import { i18n }              from "../../translate/i18n";
import toastError            from "../../errors/toastError";
import { AuthContext }        from "../../context/Auth/AuthContext";
import { Can }               from "../../components/Can";
import NewTicketModal        from "../../components/NewTicketModal";
import { TagsFilter }        from "../../components/TagsFilter";
import formatSerializedId    from "../../utils/formatSerializedId";
import ContactImportWpModal  from "../../components/ContactImportWpModal";
import useCompanySettings    from "../../hooks/useSettings/companySettings";
import { TicketsContext }    from "../../context/Tickets/TicketsContext";

// ─── Geo / DDD ───────────────────────────────────────────────────────────────

const geoUrl =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const markers = [
  { markerOffset: -30, name: "Aracaju",         coordinates: [-37.0717, -10.9472] },
  { markerOffset:  15, name: "Belém",            coordinates: [-48.4878,  -1.4558] },
  { markerOffset:  15, name: "Belo Horizonte",   coordinates: [-43.9378, -19.8157] },
  { markerOffset:  15, name: "Boa Vista",        coordinates: [-60.6739,   2.8195] },
  { markerOffset:  15, name: "Brasília",         coordinates: [-47.8825, -15.7942] },
  { markerOffset:  15, name: "Campo Grande",     coordinates: [-54.6464, -20.4428] },
  { markerOffset:  15, name: "Cuiabá",           coordinates: [-56.0969, -15.6011] },
  { markerOffset:  15, name: "Curitiba",         coordinates: [-49.2736, -25.4296] },
  { markerOffset:  15, name: "Florianópolis",    coordinates: [-48.5492, -27.5969] },
  { markerOffset:  15, name: "Fortaleza",        coordinates: [-38.5267,  -3.71839]},
  { markerOffset:  15, name: "Goiânia",          coordinates: [-49.2736, -16.6869] },
  { markerOffset:  15, name: "João Pessoa",      coordinates: [-34.8631,  -7.1195] },
  { markerOffset:  15, name: "Macapá",           coordinates: [-51.0667,   0.0333] },
  { markerOffset:  15, name: "Maceió",           coordinates: [-35.7353,  -9.6658] },
  { markerOffset:  15, name: "Manaus",           coordinates: [-60.025,   -3.10194]},
  { markerOffset:  15, name: "Natal",            coordinates: [-35.2094,  -5.795]  },
  { markerOffset:  15, name: "Palmas",           coordinates: [-48.3347, -10.1844] },
  { markerOffset:  15, name: "Porto Alegre",     coordinates: [-51.23,   -30.0331] },
  { markerOffset:  15, name: "Porto Velho",      coordinates: [-63.9039,  -8.7619] },
  { markerOffset:  15, name: "Recife",           coordinates: [-34.8811,  -8.05389]},
  { markerOffset:  15, name: "Rio Branco",       coordinates: [-67.8099,  -9.9747] },
  { markerOffset:  15, name: "Rio de Janeiro",   coordinates: [-43.1729, -22.9068] },
  { markerOffset:  15, name: "Salvador",         coordinates: [-38.4813, -12.9716] },
  { markerOffset:  15, name: "São Luís",         coordinates: [-44.3028,  -2.5283] },
  { markerOffset:  15, name: "São Paulo",        coordinates: [-46.6333, -23.5505] },
  { markerOffset:  15, name: "Teresina",         coordinates: [-42.8039,  -5.0892] },
  { markerOffset:  15, name: "Vitória",          coordinates: [-40.3378, -20.3194] },
];

const dddList = {
  "11":"São Paulo","12":"São Paulo","13":"São Paulo","14":"São Paulo","15":"São Paulo",
  "16":"São Paulo","17":"São Paulo","18":"São Paulo","19":"São Paulo",
  "21":"Rio de Janeiro","22":"Rio de Janeiro","24":"Rio de Janeiro",
  "27":"Espírito Santo","28":"Espírito Santo",
  "31":"Minas Gerais","32":"Minas Gerais","33":"Minas Gerais","34":"Minas Gerais",
  "35":"Minas Gerais","37":"Minas Gerais","38":"Minas Gerais",
  "41":"Paraná","42":"Paraná","43":"Paraná","44":"Paraná","45":"Paraná","46":"Paraná",
  "47":"Santa Catarina","48":"Santa Catarina","49":"Santa Catarina",
  "51":"Rio Grande do Sul","53":"Rio Grande do Sul","54":"Rio Grande do Sul","55":"Rio Grande do Sul",
  "61":"Distrito Federal/Goiás","62":"Goiás","63":"Tocantins","64":"Goiás",
  "65":"Mato Grosso","66":"Mato Grosso","67":"Mato Grosso do Sul",
  "68":"Acre","69":"Rondônia",
  "71":"Bahia","73":"Bahia","74":"Bahia","75":"Bahia","77":"Bahia",
  "79":"Sergipe","81":"Pernambuco","82":"Alagoas","83":"Paraíba",
  "84":"Rio Grande do Norte","85":"Ceará","86":"Piauí","87":"Pernambuco",
  "88":"Ceará","89":"Piauí",
  "91":"Pará","92":"Amazonas","93":"Pará","94":"Pará",
  "95":"Roraima","96":"Amapá","97":"Amazonas","98":"Maranhão","99":"Maranhão",
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const newContacts = [];
    action.payload.forEach((contact) => {
      const idx = state.findIndex((c) => c.id === contact.id);
      if (idx !== -1) state[idx] = contact;
      else newContacts.push(contact);
    });
    return [...state, ...newContacts];
  }
  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const idx = state.findIndex((c) => c.id === contact.id);
    if (idx !== -1) { state[idx] = contact; return [...state]; }
    return [contact, ...state];
  }
  if (action.type === "DELETE_CONTACT") {
    const idx = state.findIndex((c) => c.id === action.payload);
    if (idx !== -1) state.splice(idx, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
};

// ─── FontStyle ────────────────────────────────────────────────────────────────

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .ct-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .ct-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .ct-root { max-width: 100%; overflow-x: hidden; }

    @keyframes ctFadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }
    .ct-animate { animation: ctFadeSlideUp 0.36s ease both; }

    /* Scrollbar fina */
    .ct-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .ct-root ::-webkit-scrollbar-track { background: transparent; }
    .ct-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    /* Hover linha tabela */
    .ct-row-hover:hover { background: var(--ct-hover-row) !important; }
  `}</style>
);

// ─── usePalette (idêntico ao Dashboard) ──────────────────────────────────────

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
    const purple="#8b5cf6", teal="#14b8a6";

    const t = isDark ? {
      pageBg:      "#080e1a",
      surfaceBg:   "#0f1929",
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      barTrack:    "rgba(255,255,255,0.06)",
      hoverRow:    "rgba(255,255,255,0.03)",
      tagBg:       "rgba(255,255,255,0.07)",
      avatarBg:    "rgba(255,255,255,0.08)",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      surfaceBg2:  "#fafbfd",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      barTrack:    "#e8eef5",
      hoverRow:    "#f5f8fc",
      tagBg:       "rgba(0,0,0,0.045)",
      avatarBg:    "#eef2f8",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
    };

    return {
      primary, isDark, ...t,
      chipBg:    alpha(primary, isDark ? 0.18 : 0.10),
      chipColor: primary,
      tabActiveBg:      primary,
      tabActiveColor:   "#fff",
      tabInactiveColor: t.textMuted,
      success, warning, danger, purple, teal,
    };
  }, [primary, isDark]);
};

// ─── SubPaper ─────────────────────────────────────────────────────────────────

const SubPaper = ({ children, sx = {}, p, className = "" }) => (
  <Paper elevation={0} className={className} sx={{
    borderRadius: "14px",
    border: `1px solid ${p.border}`,
    backgroundColor: p.surfaceBg,
    ...sx,
  }}>
    {children}
  </Paper>
);

// ─── SectionLabel ─────────────────────────────────────────────────────────────

const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.09em",
  }}>
    {children}
  </Typography>
);

// ─── inputSx — altura fixa 40px, texto centralizado, ícone primário no dark ──

const mkInputSx = (p) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 12.5,
    backgroundColor: p.inputBg,
    overflow: "hidden",
    height: 40,
    "& input": {
      padding: "0 8px",
      height: "100%",
      boxSizing: "border-box",
      fontSize: 12.5,
      lineHeight: "40px",
      color: p.isDark ? "#ffffff" : undefined,
    },
    "& fieldset": { borderColor: p.inputBorder },
    "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": {
    fontSize: 12.5,
    color: p.isDark ? "rgba(255,255,255,0.45)" : p.textMuted,
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    top: 0,
    transform: "translate(12px, -8px) scale(0.78)",
    color: p.isDark ? "rgba(255,255,255,0.85) !important" : undefined,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: p.isDark ? "#ffffff !important" : p.primary,
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
    fontSize: 18,
    color: p.isDark ? p.primary : undefined,
    transition: "color 0.18s",
  },
});

// ─── Tab component ────────────────────────────────────────────────────────────

const ContactTab = ({ active, label, onClick, p }) => (
  <Button onClick={onClick} disableElevation sx={{
    textTransform: "none", px: { xs: 1.4, sm: 2 }, py: 0.65,
    borderRadius: "8px", border: "none", whiteSpace: "nowrap", flexShrink: 0,
    color:           active ? p.tabActiveColor  : p.tabInactiveColor,
    backgroundColor: active ? p.tabActiveBg     : "transparent",
    fontWeight: active ? 600 : 500, fontSize: { xs: 12, sm: 13 },
    transition: "all 0.18s ease",
    boxShadow: active
      ? `0 1px 6px ${alpha(p.primary, 0.30)}, inset 0 1px 0 ${alpha("#fff", 0.12)}`
      : "none",
    "&:hover": {
      backgroundColor: active
        ? alpha(p.primary, 0.88)
        : (p.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
      color: active ? p.tabActiveColor : p.textSecond,
    },
  }}>{label}</Button>
);

// ─── Channel Icon ─────────────────────────────────────────────────────────────

const ChannelIcon = ({ channel, size = 18 }) => {
  if (channel === "facebook")  return <Facebook  sx={{ fontSize: size, color: "#3b5998" }} />;
  if (channel === "instagram") return <Instagram sx={{ fontSize: size, color: "#e1306c" }} />;
  return <WhatsApp sx={{ fontSize: size, color: "#25d366" }} />;
};

// ─── ContactCard (lógica interna intocada, tokens de cor do design system) ───

const ContactCard = ({
  contact, selected, onSelect, onNewTicket, onEdit, onBlock, onDelete,
  enableLGPD, hideNum, userProfile, user, p,
}) => {
  const maskedNumber = () => {
    if (enableLGPD && hideNum && userProfile === "user") {
      if (contact.isGroup) return contact.number;
      const fmt = formatSerializedId(contact?.number);
      return fmt
        ? fmt.slice(0, -6) + "**-**" + contact?.number.slice(-2)
        : contact.number.slice(0, -6) + "**-**" + contact?.number.slice(-2);
    }
    return contact.isGroup ? contact.number : formatSerializedId(contact?.number);
  };

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${selected ? p.primary : p.border}`,
      borderRadius: "14px",
      backgroundColor: selected ? alpha(p.primary, p.isDark ? 0.12 : 0.05) : p.surfaceBg,
      height: "100%",
      transition: "box-shadow 0.18s, border-color 0.18s, background 0.18s",
      "&:hover": {
        boxShadow: `0 6px 22px ${alpha(p.primary, p.isDark ? 0.18 : 0.10)}`,
        borderColor: alpha(p.primary, 0.45),
      },
    }}>
      <Box sx={{ p: "14px 16px" }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              src={contact?.urlPicture}
              sx={{
                width: 44, height: 44, flexShrink: 0,
                border: `2px solid ${p.border}`,
                backgroundColor: p.avatarBg, color: p.primary,
                fontSize: 16, fontWeight: 700,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: p.textPrimary, lineHeight: 1.3 }} noWrap>
                {contact.name || "-"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: p.textSecond, mt: 0.2 }} noWrap>
                {maskedNumber()}
              </Typography>
              {contact.email && (
                <Typography sx={{ fontSize: 11, color: p.textMuted }} noWrap>{contact.email}</Typography>
              )}
            </Box>
          </Stack>
          <Checkbox
            checked={selected}
            onChange={onSelect}
            size="small"
            sx={{
              p: 0.5, mt: -0.5, flexShrink: 0,
              color: p.textMuted,
              "&.Mui-checked": { color: p.primary },
            }}
          />
        </Stack>

        {/* Meta chips */}
        <Stack direction="row" spacing={0.8} sx={{ mt: 1.4 }} flexWrap="wrap" useFlexGap>
          {contact?.whatsapp?.name && (
            <Box sx={{
              display: "inline-flex", alignItems: "center",
              px: 0.9, py: 0.25, borderRadius: "6px",
              backgroundColor: p.tagBg,
              border: `1px solid ${p.border}`,
            }}>
              <Typography sx={{ fontSize: 10.5, color: p.textSecond, fontWeight: 600 }}>
                {contact.whatsapp.name}
              </Typography>
            </Box>
          )}
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.4,
            px: 0.9, py: 0.25, borderRadius: "6px",
            backgroundColor: contact.active
              ? alpha("#10b981", p.isDark ? 0.14 : 0.09)
              : alpha("#ef4444", p.isDark ? 0.14 : 0.09),
            border: `1px solid ${contact.active
              ? alpha("#10b981", p.isDark ? 0.22 : 0.18)
              : alpha("#ef4444", p.isDark ? 0.22 : 0.18)}`,
          }}>
            {contact.active
              ? <CheckCircle sx={{ fontSize: 11, color: "#10b981" }} />
              : <Cancel      sx={{ fontSize: 11, color: "#ef4444" }} />
            }
            <Typography sx={{
              fontSize: 10.5, fontWeight: 700,
              color: contact.active ? "#10b981" : "#ef4444",
            }}>
              {contact.active ? "Ativo" : "Bloqueado"}
            </Typography>
          </Box>
        </Stack>

        {/* Divider + ações */}
        <Box sx={{ borderTop: `1px solid ${p.divider}`, mt: 1.4, pt: 1.2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ChannelIcon channel={contact.channel} size={13} />
              <Typography sx={{ fontSize: 11, color: p.textMuted }}>
                {contact.channel || "whatsapp"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.4}>
              <Tooltip title="Iniciar conversa">
                <span>
                  <IconButton size="small" disabled={!contact.active} onClick={onNewTicket} sx={{
                    p: 0.55, borderRadius: "8px",
                    backgroundColor: contact.active ? alpha("#10b981", 0.10) : p.tagBg,
                    "&:hover": { backgroundColor: alpha("#10b981", 0.18) },
                  }}>
                    <ChannelIcon channel={contact.channel} size={14} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={onEdit} sx={{
                  p: 0.55, borderRadius: "8px",
                  backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.08),
                  "&:hover": { backgroundColor: alpha(p.primary, p.isDark ? 0.22 : 0.14) },
                }}>
                  <Edit sx={{ fontSize: 14, color: p.primary }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={contact.active ? "Bloquear" : "Desbloquear"}>
                <IconButton size="small" onClick={onBlock} sx={{
                  p: 0.55, borderRadius: "8px",
                  backgroundColor: alpha("#f59e0b", p.isDark ? 0.14 : 0.08),
                  "&:hover": { backgroundColor: alpha("#f59e0b", p.isDark ? 0.22 : 0.14) },
                }}>
                  {contact.active
                    ? <Block      sx={{ fontSize: 14, color: "#f59e0b" }} />
                    : <CheckCircle sx={{ fontSize: 14, color: "#10b981" }} />
                  }
                </IconButton>
              </Tooltip>
              <Can role={user.profile} perform="contacts-page:deleteContact" yes={() => (
                <Tooltip title="Excluir">
                  <IconButton size="small" onClick={onDelete} sx={{
                    p: 0.55, borderRadius: "8px",
                    backgroundColor: alpha("#ef4444", p.isDark ? 0.14 : 0.08),
                    "&:hover": { backgroundColor: alpha("#ef4444", p.isDark ? 0.22 : 0.14) },
                  }}>
                    <DeleteOutline sx={{ fontSize: 14, color: "#ef4444" }} />
                  </IconButton>
                </Tooltip>
              )} />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

// ─── thCellSx / tdCellSx dinâmicos ───────────────────────────────────────────

const mkThCellSx = (p) => ({
  fontWeight: 700,
  color: p.textMuted,
  backgroundColor: p.surfaceBg2 || p.surfaceBg,
  borderBottom: `1px solid ${p.divider}`,
  fontSize: "0.76rem",
  py: 1.1,
  whiteSpace: "nowrap",
  fontFamily: "'DM Sans', sans-serif",
});

const mkTdCellSx = (p) => ({
  fontSize: "0.78rem",
  color: p.textSecond,
  py: 0.9,
  borderBottom: `1px solid ${p.divider}`,
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

const Contacts = () => {
  const p       = usePalette();
  const themeV5 = useMuiThemeV5();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  /* ── Estado original 100% preservado ── */
  const [loading,               setLoading]               = useState(false);
  const [pageNumber,            setPageNumber]            = useState(1);
  const [searchParam,           setSearchParam]           = useState("");
  const [contacts,              dispatch]                 = useReducer(reducer, []);
  const [selectedContactId,     setSelectedContactId]     = useState(null);
  const [contactModalOpen,      setContactModalOpen]      = useState(false);
  const [importContactModalOpen,setImportContactModalOpen]= useState(false);
  const [deletingContact,       setDeletingContact]       = useState(null);
  const [ImportContacts,        setImportContacts]        = useState(null);
  const [blockingContact,       setBlockingContact]       = useState(null);
  const [unBlockingContact,     setUnBlockingContact]     = useState(null);
  const [confirmOpen,           setConfirmOpen]           = useState(false);
  const [exportContact,         setExportContact]         = useState(false);
  const [confirmChatsOpen,      setConfirmChatsOpen]      = useState(false);
  const [hasMore,               setHasMore]               = useState(false);
  const [newTicketModalOpen,    setNewTicketModalOpen]    = useState(false);
  const [contactTicket,         setContactTicket]         = useState({});
  const fileUploadRef = useRef(null);
  const [selectedTags,          setSelectedTags]          = useState([]);
  const { setCurrentTicket } = useContext(TicketsContext);
  const [selectedContactIds,    setSelectedContactIds]    = useState([]);
  const [isSelectAllChecked,    setIsSelectAllChecked]    = useState(false);
  const [confirmDeleteManyOpen, setConfirmDeleteManyOpen] = useState(false);
  const { getAll: getAllSettings } = useCompanySettings();
  const [hideNum,    setHideNum]    = useState(false);
  const [enableLGPD, setEnableLGPD] = useState(false);
  const [tabValue,   setTabValue]   = useState(0);
  const [viewMode,   setViewMode]   = useState("card");

  const thCellSx = mkThCellSx(p);
  const tdCellSx = mkTdCellSx(p);

  /* ── Handlers originais 100% preservados ── */
  useEffect(() => {
    async function fetchData() {
      const settingList = await getAllSettings(user.companyId);
      for (const [key, value] of Object.entries(settingList)) {
        if (key === "enableLGPD")    setEnableLGPD(value === "enabled");
        if (key === "lgpdHideNumber") setHideNum(value === "enabled");
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImportExcel = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileUploadRef.current.files[0]);
      await api.request({ url: `/contacts/upload`, method: "POST", data: formData });
      history.go(0);
    } catch (err) { toastError(err); }
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setSelectedContactIds([]);
    setIsSelectAllChecked(false);
  }, [searchParam, selectedTags]);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber, contactTag: JSON.stringify(selectedTags) },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          const allIds = data.contacts.map((c) => c.id);
          const newSelected = selectedContactIds.filter((id) => allIds.includes(id));
          setSelectedContactIds(newSelected);
          setIsSelectAllChecked(newSelected.length === allIds.length && allIds.length > 0);
        } catch (err) { toastError(err); }
        finally { setLoading(false); }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber, selectedTags]);

  useEffect(() => {
    const companyId = user.companyId;
    const onContactEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
        setSelectedContactIds((prev) => prev.filter((id) => id !== +data.contactId));
      }
    };
    socket.on(`company-${companyId}-contact`, onContactEvent);
    return () => socket.off(`company-${companyId}-contact`, onContactEvent);
  }, [socket, user.companyId]);

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      handleSelectTicket(ticket);
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) { toastError(err); }
    setDeletingContact(null);
  };

  const handleBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: false });
      dispatch({ type: "UPDATE_CONTACTS", payload: { ...blockingContact, active: false } });
      toast.success("Contato bloqueado");
    } catch (err) { toastError(err); }
    setBlockingContact(null);
  };

  const handleUnBlockContact = async (contactId) => {
    try {
      await api.put(`/contacts/block/${contactId}`, { active: true });
      dispatch({ type: "UPDATE_CONTACTS", payload: { ...unBlockingContact, active: true } });
      toast.success("Contato desbloqueado");
    } catch (err) { toastError(err); }
    setUnBlockingContact(null);
  };

  const handleDeleteSelectedContacts = async () => {
    try {
      setLoading(true);
      await api.delete("/contacts/batch-delete", { data: { contactIds: selectedContactIds } });
      toast.success("Contatos selecionados deletados com sucesso!");
      setSelectedContactIds([]);
      setIsSelectAllChecked(false);
      setConfirmDeleteManyOpen(false);
      dispatch({ type: "RESET" });
      setPageNumber(1);
    } catch (err) { toastError(err); }
    finally { setLoading(false); }
  };

  const handleimportContact = async (whatsappId) => {
    setImportContactModalOpen(false);
    try {
      await api.post("/contacts/import", { whatsappId });
      history.go(0);
    } catch (err) { toastError(err); setImportContactModalOpen(false); }
  };

  const handleimportChats = async () => {
    try {
      await api.post("/contacts/import/chats");
      history.go(0);
    } catch (err) { toastError(err); }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) setPageNumber((prev) => prev + 1);
  };

  const maskedNumber = (contact) => {
    if (enableLGPD && hideNum && user.profile === "user") {
      if (contact.isGroup) return contact.number;
      const fmt = formatSerializedId(contact?.number);
      return fmt
        ? fmt.slice(0, -6) + "**-**" + contact?.number.slice(-2)
        : contact.number.slice(0, -6) + "**-**" + contact?.number.slice(-2);
    }
    return contact.isGroup ? contact.number : formatSerializedId(contact?.number);
  };

  const countContactsByState = () => {
    const stateCounts = {};
    contacts.forEach((contact) => {
      const number = contact.number;
      if (number && number.length > 4) {
        const ddd = number.substring(2, 4);
        const state = dddList[ddd] || "Outros";
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      }
    });
    return stateCounts;
  };

  const stateCounts = countContactsByState();

  const contactActionProps = (contact) => ({
    onNewTicket: () => { setContactTicket(contact); setNewTicketModalOpen(true); },
    onEdit:      () => { setSelectedContactId(contact.id); setContactModalOpen(true); },
    onBlock: contact.active
      ? () => { setConfirmOpen(true); setBlockingContact(contact); }
      : () => { setConfirmOpen(true); setUnBlockingContact(contact); },
    onDelete: () => { setConfirmOpen(true); setDeletingContact(contact); },
  });

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <Box
      className="ct-root"
      style={{ "--ct-hover-row": p.hoverRow }}
      sx={{
        minHeight: "calc(100% - 48px)",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontStyle />

      {/* ── Modais (originais, intocados) ── */}
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => handleCloseOrOpenTicket(ticket)}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={() => { setSelectedContactId(null); setContactModalOpen(false); }}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <ConfirmationModal
        title={
          deletingContact    ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`
          : blockingContact  ? `Bloquear Contato ${blockingContact.name}?`
          : unBlockingContact? `Desbloquear Contato ${unBlockingContact.name}?`
          : ImportContacts   ? `${i18n.t("contacts.confirmationModal.importTitlte")}`
          : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
        }
        isCellPhone={ImportContacts}
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact    ? handleDeleteContact(deletingContact.id)
          : blockingContact  ? handleBlockContact(blockingContact.id)
          : unBlockingContact? handleUnBlockContact(unBlockingContact.id)
          : ImportContacts   ? handleimportContact(e)
          : handleImportExcel()
        }
      >
        {exportContact       ? `${i18n.t("contacts.confirmationModal.exportContact")}`
          : deletingContact  ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : blockingContact  ? `${i18n.t("contacts.confirmationModal.blockContact")}`
          : unBlockingContact? `${i18n.t("contacts.confirmationModal.unblockContact")}`
          : ImportContacts   ? "Escolha de qual conexão deseja importar"
          : `${i18n.t("contactListItems.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <ConfirmationModal
        title={`Tem certeza que deseja deletar ${selectedContactIds.length} contatos selecionados?`}
        open={confirmDeleteManyOpen}
        onClose={() => setConfirmDeleteManyOpen(false)}
        onConfirm={handleDeleteSelectedContacts}
      >
        Essa ação é irreversível.
      </ConfirmationModal>
      <ConfirmationModal
        title={i18n.t("contacts.confirmationModal.importChat")}
        open={confirmChatsOpen}
        onClose={setConfirmChatsOpen}
        onConfirm={() => handleimportChats()}
      >
        {i18n.t("contacts.confirmationModal.wantImport")}
      </ConfirmationModal>
      {importContactModalOpen && (
        <ContactImportWpModal
          isOpen={importContactModalOpen}
          handleClose={() => setImportContactModalOpen(false)}
          selectedTags={selectedTags}
          hideNum={hideNum}
          userProfile={user.profile}
        />
      )}
      <input
        style={{ display: "none" }}
        id="upload" name="file" type="file" accept=".xls,.xlsx"
        onChange={() => setConfirmOpen(true)}
        ref={fileUploadRef}
      />

      {/* ══ CABEÇALHO CORPORATIVO ═══════════════════════════════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3, md: 3.5 },
        pb: { xs: 2,   sm: 2.5, md: 3 },
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorações geométricas */}
        <Box sx={{
          position: "absolute", top: -40, right: -40,
          width: { xs: 160, md: 220 }, height: { xs: 160, md: 220 },
          borderRadius: "50%",
          background: p.isDark ? alpha(p.primary, 0.08) : alpha("#fff", 0.08),
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", bottom: -30, left: "35%",
          width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 },
          borderRadius: "50%",
          background: p.isDark ? alpha("#0ea5e9", 0.06) : alpha("#fff", 0.06),
          pointerEvents: "none",
        }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
            <Typography sx={{
              fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
            }}>
              Painel
            </Typography>
            <Box sx={{
              width: 3, height: 3, borderRadius: "50%",
              backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45),
            }} />
            <Typography sx={{
              fontSize: { xs: 10, sm: 11 }, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
            }}>
              Contatos
            </Typography>
          </Stack>

          {/* Título */}
          <Typography sx={{
            fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
            letterSpacing: "-0.025em", lineHeight: 1,
            color: p.isDark ? p.textPrimary : "#ffffff",
          }}>
            {i18n.t("contacts.title")}
          </Typography>

          {/* Subtítulo */}
          <Typography sx={{
            fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
            color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
            display: { xs: "none", sm: "block" },
          }}>
            Gerencie sua base de contatos com ações rápidas e visão operacional.
          </Typography>

          {/* Meta-tags */}
          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
            {[
              { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "Atualizado agora" },
              { icon: <Person sx={{ fontSize: 12 }} />,           label: `${contacts.length} contatos` },
              { icon: <Groups sx={{ fontSize: 12 }} />,           label: `${selectedContactIds.length} selecionados` },
            ].map((tag, i) => (
              <Box key={i} sx={{
                display: "inline-flex", alignItems: "center", gap: 0.6,
                px: 1.2, py: 0.4, borderRadius: "20px",
                backgroundColor: p.isDark ? alpha(p.primary, 0.14) : alpha("#fff", 0.15),
                border: `1px solid ${p.isDark ? alpha(p.primary, 0.22) : alpha("#fff", 0.22)}`,
                backdropFilter: "blur(8px)",
              }}>
                <Box sx={{ color: p.isDark ? p.primary : "#fff", display: "flex" }}>{tag.icon}</Box>
                <Typography sx={{
                  fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                  color: p.isDark ? alpha("#fff", 0.8) : "#fff",
                }}>
                  {tag.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ── Conteúdo ── */}
      <Box sx={{
        px: { xs: 1, sm: 1.5, md: 2.5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        flex: 1, display: "flex", flexDirection: "column",
        gap: { xs: 1, sm: 1.5 },
      }}>

        {/* ── Barra de filtros / controles ── */}
        <SubPaper p={p} className="ct-animate" sx={{ p: { xs: "12px 14px", sm: "14px 18px" } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={3}>
              <TagsFilter onFiltered={(s) => setSelectedTags(s.map((t) => t.id))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder={i18n.t("contacts.searchPlaceholder")}
                type="search"
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value.toLowerCase())}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={mkInputSx(p)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <PopupState variant="popover" popupId="import-export-menu">
                {(popupState) => (
                  <>
                    <Button
                      fullWidth variant="contained" disableElevation size="small"
                      sx={{
                        borderRadius: "9px", height: 38, fontWeight: 700, fontSize: 12,
                        textTransform: "none", backgroundColor: p.primary,
                        boxShadow: `0 2px 10px ${alpha(p.primary, 0.30)}`,
                        "&:hover": { backgroundColor: alpha(p.primary, 0.88) },
                      }}
                      {...bindTrigger(popupState)}
                    >
                      Importar/Exportar <ArrowDropDown sx={{ fontSize: 18, ml: 0.3 }} />
                    </Button>
                    <Menu
                      {...bindMenu(popupState)}
                      PaperProps={{
                        elevation: 0,
                        sx: {
                          borderRadius: "12px", border: `1px solid ${p.border}`,
                          backgroundColor: p.surfaceBg, mt: 0.5,
                          boxShadow: `0 8px 24px ${alpha("#000", p.isDark ? 0.35 : 0.12)}`,
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => { setConfirmOpen(true); setImportContacts(true); popupState.close(); }}
                        sx={{ fontSize: 13, color: p.textSecond, "&:hover": { backgroundColor: p.tagBg } }}
                      >
                        <ContactPhone fontSize="small" sx={{ mr: 1.2, color: p.primary }} />
                        {i18n.t("contacts.menu.importYourPhone")}
                      </MenuItem>
                      <MenuItem
                        onClick={() => { setImportContactModalOpen(true); popupState.close(); }}
                        sx={{ fontSize: 13, color: p.textSecond, "&:hover": { backgroundColor: p.tagBg } }}
                      >
                        <Backup fontSize="small" sx={{ mr: 1.2, color: p.primary }} />
                        {i18n.t("contacts.menu.importToExcel")}
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </PopupState>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth variant="outlined" size="small"
                onClick={() => setConfirmDeleteManyOpen(true)}
                disabled={selectedContactIds.length === 0 || loading}
                sx={{
                  borderRadius: "9px", height: 38, fontWeight: 700, fontSize: 12,
                  textTransform: "none",
                  borderColor: alpha("#ef4444", 0.35),
                  color: "#ef4444",
                  "&:hover": { borderColor: "#ef4444", backgroundColor: alpha("#ef4444", 0.06) },
                  "&.Mui-disabled": { borderColor: p.border, color: p.textMuted },
                }}
              >
                Deletar ({selectedContactIds.length})
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth variant="contained" disableElevation size="small"
                onClick={() => { setSelectedContactId(null); setContactModalOpen(true); }}
                sx={{
                  borderRadius: "9px", height: 38, fontWeight: 700, fontSize: 12,
                  textTransform: "none", backgroundColor: p.primary,
                  boxShadow: `0 2px 10px ${alpha(p.primary, 0.30)}`,
                  "&:hover": { backgroundColor: alpha(p.primary, 0.88) },
                }}
              >
                {i18n.t("contacts.buttons.add")}
              </Button>
            </Grid>
          </Grid>
        </SubPaper>

        {/* ── Tab bar + toggle de visualização ── */}
        <SubPaper p={p} sx={{ p: 0, overflow: "hidden" }}>
          <Stack
            direction="row" justifyContent="space-between" alignItems="center"
            sx={{
              px: { xs: 0.8, sm: 1.5 }, py: 0.7,
              borderBottom: tabValue === 0 ? `1px solid ${p.divider}` : "none",
              backgroundColor: p.isDark ? alpha("#000", 0.15) : alpha(p.primary, 0.015),
            }}
          >
            {/* Tabs */}
            <Stack direction="row" spacing={0.3} sx={{
              p: 0.4, borderRadius: "9px",
              backgroundColor: p.isDark ? alpha("#000", 0.3) : alpha(p.primary, 0.04),
              border: `1px solid ${p.border}`,
              display: "inline-flex",
            }}>
              {["Contatos", "Mapa"].map((label, i) => (
                <ContactTab
                  key={label}
                  active={tabValue === i}
                  label={label}
                  onClick={() => setTabValue(i)}
                  p={p}
                />
              ))}
            </Stack>

            {/* Toggle card/lista */}
            {tabValue === 0 && (
              <Stack direction="row" spacing={0.5}>
                {[
                  { mode: "card", icon: <ViewModule sx={{ fontSize: 17 }} />, title: "Cards" },
                  { mode: "list", icon: <ViewList   sx={{ fontSize: 17 }} />, title: "Lista" },
                ].map(({ mode, icon, title }) => (
                  <Tooltip key={mode} title={`Visualização em ${title.toLowerCase()}`}>
                    <IconButton
                      size="small"
                      onClick={() => setViewMode(mode)}
                      sx={{
                        p: 0.65, borderRadius: "8px",
                        border: `1px solid ${viewMode === mode ? p.primary : p.border}`,
                        backgroundColor: viewMode === mode ? alpha(p.primary, p.isDark ? 0.18 : 0.09) : "transparent",
                        color: viewMode === mode ? p.primary : p.textMuted,
                        transition: "all 0.16s",
                        "&:hover": {
                          borderColor: alpha(p.primary, 0.45),
                          backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.06),
                          color: p.primary,
                        },
                      }}
                    >
                      {icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            )}
          </Stack>
        </SubPaper>

        {/* ── Conteúdo principal ── */}
        <SubPaper
          p={p}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            p: tabValue === 0 ? { xs: "14px", sm: "18px" } : 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* ══ ABA CONTATOS ══ */}
          {tabValue === 0 && (
            <>
              {/* Selecionar todos */}
              <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1.5 }}>
                <Checkbox
                  checked={isSelectAllChecked}
                  onChange={(e) => {
                    setIsSelectAllChecked(e.target.checked);
                    setSelectedContactIds(e.target.checked ? contacts.map((c) => c.id) : []);
                  }}
                  size="small"
                  sx={{ color: p.textMuted, "&.Mui-checked": { color: p.primary } }}
                />
                <SectionLabel p={p}>Selecionar todos os contatos</SectionLabel>
              </Stack>

              {/* ── MODO CARD ── */}
              {viewMode === "card" && (
                <Grid container spacing={1.5}>
                  {contacts.map((contact) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                      <ContactCard
                        contact={contact}
                        p={p}
                        selected={selectedContactIds.includes(contact.id)}
                        onSelect={(e) => {
                          if (e.target.checked) {
                            setSelectedContactIds((prev) => [...prev, contact.id]);
                          } else {
                            setSelectedContactIds((prev) => prev.filter((id) => id !== contact.id));
                            setIsSelectAllChecked(false);
                          }
                        }}
                        user={user}
                        enableLGPD={enableLGPD}
                        hideNum={hideNum}
                        userProfile={user.profile}
                        {...contactActionProps(contact)}
                      />
                    </Grid>
                  ))}
                  {loading && Array.from({ length: 8 }).map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`sk-${i}`}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: "14px", border: `1px solid ${p.border}`, backgroundColor: p.surfaceBg }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                          <Skeleton variant="circular" width={44} height={44} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width="65%" height={18} />
                            <Skeleton width="45%" height={14} />
                          </Box>
                        </Stack>
                        <Skeleton height={32} sx={{ borderRadius: "8px" }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* ── MODO LISTA ── */}
              {viewMode === "list" && (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ ...thCellSx }}>
                          <Checkbox
                            checked={isSelectAllChecked}
                            onChange={(e) => {
                              setIsSelectAllChecked(e.target.checked);
                              setSelectedContactIds(e.target.checked ? contacts.map((c) => c.id) : []);
                            }}
                            size="small"
                            sx={{ color: p.textMuted, "&.Mui-checked": { color: p.primary } }}
                          />
                        </TableCell>
                        {["Contato","Número","E-mail","Conexão","Canal","Status","Ações"].map((h) => (
                          <TableCell key={h} align={["Canal","Status","Ações"].includes(h) ? "center" : "left"} sx={thCellSx}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow
                          key={contact.id}
                          className="ct-row-hover"
                          sx={{ "&:nth-of-type(even)": { backgroundColor: p.isDark ? alpha("#fff",0.015) : alpha(p.primary,0.012) } }}
                        >
                          <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${p.divider}` }}>
                            <Checkbox
                              checked={selectedContactIds.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContactIds((prev) => [...prev, contact.id]);
                                } else {
                                  setSelectedContactIds((prev) => prev.filter((id) => id !== contact.id));
                                  setIsSelectAllChecked(false);
                                }
                              }}
                              size="small"
                              sx={{ color: p.textMuted, "&.Mui-checked": { color: p.primary } }}
                            />
                          </TableCell>
                          <TableCell sx={tdCellSx}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                              <Avatar src={contact?.urlPicture} sx={{ width: 32, height: 32, backgroundColor: p.avatarBg, color: p.primary, fontSize: 12, fontWeight: 700 }} />
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: p.textPrimary }}>{contact.name || "-"}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={tdCellSx}>{maskedNumber(contact)}</TableCell>
                          <TableCell sx={{ ...tdCellSx, color: p.textMuted }}>{contact.email || "-"}</TableCell>
                          <TableCell sx={{ ...tdCellSx, color: p.textMuted }}>{contact?.whatsapp?.name || "-"}</TableCell>
                          <TableCell align="center" sx={tdCellSx}><ChannelIcon channel={contact.channel} /></TableCell>
                          <TableCell align="center" sx={tdCellSx}>
                            <Box sx={{
                              display: "inline-flex", alignItems: "center", gap: 0.4,
                              px: 0.9, py: 0.2, borderRadius: "6px",
                              backgroundColor: contact.active ? alpha("#10b981", p.isDark?0.14:0.09) : alpha("#ef4444", p.isDark?0.14:0.09),
                            }}>
                              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: contact.active ? "#10b981" : "#ef4444" }}>
                                {contact.active ? "Ativo" : "Bloqueado"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={tdCellSx}>
                            <Stack direction="row" spacing={0.4} justifyContent="center">
                              <Tooltip title="Iniciar conversa"><span>
                                <IconButton size="small" disabled={!contact.active}
                                  onClick={() => { setContactTicket(contact); setNewTicketModalOpen(true); }}
                                  sx={{ p: 0.5, borderRadius: "7px" }}>
                                  <ChannelIcon channel={contact.channel} size={15} />
                                </IconButton>
                              </span></Tooltip>
                              <Tooltip title="Editar">
                                <IconButton size="small"
                                  onClick={() => { setSelectedContactId(contact.id); setContactModalOpen(true); }}
                                  sx={{ p: 0.5, borderRadius: "7px" }}>
                                  <Edit sx={{ fontSize: 15, color: p.primary }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={contact.active ? "Bloquear" : "Desbloquear"}>
                                <IconButton size="small"
                                  onClick={contact.active
                                    ? () => { setConfirmOpen(true); setBlockingContact(contact); }
                                    : () => { setConfirmOpen(true); setUnBlockingContact(contact); }}
                                  sx={{ p: 0.5, borderRadius: "7px" }}>
                                  {contact.active
                                    ? <Block       sx={{ fontSize: 15, color: "#f59e0b" }} />
                                    : <CheckCircle sx={{ fontSize: 15, color: "#10b981" }} />}
                                </IconButton>
                              </Tooltip>
                              <Can role={user.profile} perform="contacts-page:deleteContact" yes={() => (
                                <Tooltip title="Excluir">
                                  <IconButton size="small"
                                    onClick={() => { setConfirmOpen(true); setDeletingContact(contact); }}
                                    sx={{ p: 0.5, borderRadius: "7px" }}>
                                    <DeleteOutline sx={{ fontSize: 15, color: "#ef4444" }} />
                                  </IconButton>
                                </Tooltip>
                              )} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ p: 0, border: "none" }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Box key={i} sx={{ px: 2, py: 1, borderBottom: `1px solid ${p.divider}` }}>
                                <Skeleton height={28} sx={{ backgroundColor: p.isDark ? alpha("#fff",0.06) : alpha("#000",0.04) }} />
                              </Box>
                            ))}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </>
          )}

          {/* ══ ABA MAPA ══ */}
          {tabValue === 1 && (
            <Box>
              {/* Barra de total */}
              <Box sx={{
                background: p.isDark
                  ? `linear-gradient(135deg, #0d1b2e 0%, ${alpha(p.primary, 0.18)} 100%)`
                  : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 100%)`,
                p: 1.8, textAlign: "center",
                borderRadius: "14px 14px 0 0",
              }}>
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                  Total de Contatos por Estado: {contacts.length}
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 1.5, sm: 2.5 }, backgroundColor: p.surfaceBg }}>
                {/* Legenda */}
                <SubPaper p={p} sx={{ p: "14px 18px", mb: 2.5 }}>
                  <SectionLabel p={p}>Distribuição por estado</SectionLabel>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1.2 }}>
                    {Object.entries(stateCounts).map(([state, count]) => (
                      <Stack key={state} direction="row" spacing={0.8} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: p.warning, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, color: p.textSecond }}>
                          {state}: <strong style={{ color: p.textPrimary }}>{count}</strong>
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                </SubPaper>

                {/* Mapa */}
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 600, center: [-53, -15] }}
                  style={{ width: "100%", height: "auto" }}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const state = geo.properties.name;
                        const count = stateCounts[state] || 0;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={count > 0 ? p.warning : (p.isDark ? alpha("#fff", 0.06) : "#e2e8f0")}
                            stroke={p.isDark ? alpha("#fff", 0.10) : "#cbd5e1"}
                            style={{ hover: { fill: p.primary, stroke: p.border } }}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {markers.map(({ name, coordinates, markerOffset }) => (
                    <Marker key={name} coordinates={coordinates}>
                      <circle r={5} fill={p.primary} stroke={p.isDark ? "#0f1929" : "#fff"} strokeWidth={1} />
                      <text
                        textAnchor="middle"
                        y={markerOffset}
                        style={{ fontFamily: "'DM Sans', system-ui", fill: p.textSecond, fontSize: "11px" }}
                      >
                        {name}
                      </text>
                    </Marker>
                  ))}
                </ComposableMap>
              </Box>
            </Box>
          )}
        </SubPaper>
      </Box>
    </Box>
  );
};

export default Contacts;