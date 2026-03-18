/**
 * Dashboard — Redesign completo
 * - Cabeçalho corporativo com gradiente, breadcrumb e meta-info
 * - Fonte DM Sans / JetBrains Mono em todos os cards
 * - Tab Indicadores: 3 donuts substituídos por barras horizontais comparativas
 * - Tab NPS: visual renovado com gauge, barras de proporção e cards coloridos
 * - Tab Atendentes: avatares, ícones em todos os mini-cards, sem gráfico de barra redundante
 */

import React, {
  useContext, useEffect, useLayoutEffect, useMemo, useRef, useState
} from "react";
import {
  Avatar, Box, Button, Dialog, DialogContent, DialogTitle,
  Divider, Grid, IconButton,
  Paper, Stack, TextField, Typography, alpha, useMediaQuery
} from "@mui/material";
import {
  AccessTime, AssignmentTurnedIn, Download,
  FiberManualRecord, HourglassTop, Insights,
  SentimentDissatisfied,
  SentimentNeutral, SentimentSatisfiedAlt, StarRate,
  ThumbDown, ThumbUp,
  HeadsetMic, HourglassEmpty, CheckCircle, BarChart,
  PersonAdd, MarkChatUnread, MarkChatRead, Forum,
  Timer, SignalWifi4Bar, PeopleAlt,
  Close, TuneRounded, CalendarToday, FilterAlt,
} from "@mui/icons-material";
import { isArray } from "lodash";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import { AuthContext }       from "../../context/Auth/AuthContext";
import useDashboard          from "../../hooks/useDashboard";
import ForbiddenPage         from "../../components/ForbiddenPage";
import { ChartsDate }        from "./ChartsDate";
import { i18n }              from "../../translate/i18n";

/* ─── Estilos globais ────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .dash-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .dash-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .dash-root { max-width: 100%; overflow-x: hidden; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes kpiIconGlow {
      0%   { box-shadow: 0 0 0 0   var(--kpi-glow); }
      50%  { box-shadow: 0 0 0 7px var(--kpi-glow); }
      100% { box-shadow: 0 0 0 0   transparent; }
    }
    @keyframes barGrow {
      from { width: 0; } to { width: var(--bar-w); }
    }
    @keyframes heroShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .dash-animate { animation: fadeSlideUp 0.36s ease both; }
    .dash-tab     { transition: all 0.18s ease !important; }
    .dash-row-hover:hover { background: var(--hover-row) !important; }

    /* Viewport animado — sem salto na troca de aba */
    .dash-panel-viewport {
      transition: height 0.32s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden; position: relative;
    }
    .dash-tab-pane {
      position: absolute; top: 0; left: 0; right: 0;
      opacity: 0; transform: translateY(6px); pointer-events: none;
      transition: opacity 0.26s cubic-bezier(0.4,0,0.2,1),
                  transform 0.26s cubic-bezier(0.4,0,0.2,1);
    }
    .dash-tab-pane.active {
      opacity: 1; transform: translateY(0);
      pointer-events: auto; position: relative;
    }

    /* KPI card */
    .kpi-card { position: relative; overflow: hidden; }
    .kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--kpi-color); border-radius: 14px 14px 0 0;
      transform: scaleX(0); transform-origin: left center;
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .kpi-card:hover::after { transform: scaleX(1); }
    .kpi-icon-box {
      transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
      will-change: transform;
    }
    .kpi-card:hover .kpi-icon-box {
      transform: scale(1.22) rotate(10deg) !important;
      animation: kpiIconGlow 0.6s ease forwards;
    }

    /* Tab bar scroll mobile */
    .dash-tab-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .dash-tab-scroll::-webkit-scrollbar { display: none; }

    /* Tabela scroll */
    .dash-table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }

    /* Scrollbar fina */
    .dash-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .dash-root ::-webkit-scrollbar-track { background: transparent; }
    .dash-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    /* Avatar online indicator */
    .avatar-online { position: relative; }
    .avatar-online::after {
      content: ''; position: absolute; bottom: 1px; right: 1px;
      width: 9px; height: 9px; border-radius: 50%;
      background: #10b981; border: 2px solid var(--surface-bg);
    }
  `}</style>
);

/* ─── usePalette ──────────────────────────────────────────────────────────── */
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
    const purple="#8b5cf6", teal="#14b8a6", green="#22c55e";

    const t = isDark ? {
      pageBg:"#080e1a", surfaceBg:"#0f1929", surfaceBg2:"#141f30",
      border:"rgba(255,255,255,0.065)", divider:"rgba(255,255,255,0.055)",
      textPrimary:"#f0f4f8", textSecond:"#8fa4be", textMuted:"#4d6478",
      barTrack:"rgba(255,255,255,0.06)", hoverRow:"rgba(255,255,255,0.03)",
      tagBg:"rgba(255,255,255,0.07)", avatarBg:"rgba(255,255,255,0.08)",
      heroBorder: alpha(primary, 0.22),
    } : {
      pageBg:"#f0f4f8", surfaceBg:"#ffffff", surfaceBg2:"#fafbfd",
      border:"#e3eaf2", divider:"#e8eef4",
      textPrimary:"#0d1b2a", textSecond:"#3d5166", textMuted:"#8fa0b0",
      barTrack:"#e8eef5", hoverRow:"#f5f8fc",
      tagBg:"rgba(0,0,0,0.045)", avatarBg:"#eef2f8",
      heroBorder: alpha(primary, 0.14),
    };

    return {
      primary, isDark, ...t,
      heroBg: isDark
        ? `linear-gradient(135deg, ${alpha(primary,0.22)} 0%, ${alpha("#0ea5e9",0.09)} 100%)`
        : `linear-gradient(135deg, ${alpha(primary,0.08)} 0%, ${alpha("#0ea5e9",0.04)} 100%)`,
      chipBg:    alpha(primary, isDark?0.18:0.10),
      chipColor: primary,
      tabActiveBg:      primary,
      tabActiveColor:   "#fff",
      tabInactiveColor: t.textMuted,
      kpiPrimary:{ color:primary,  bg:alpha(primary,  isDark?0.16:0.09) },
      kpiWarning:{ color:warning,  bg:alpha(warning,  isDark?0.16:0.09) },
      kpiSuccess:{ color:success,  bg:alpha(success,  isDark?0.16:0.09) },
      kpiPurple: { color:purple,   bg:alpha(purple,   isDark?0.16:0.09) },
      kpiTeal:   { color:teal,     bg:alpha(teal,     isDark?0.16:0.09) },
      kpiGreen:  { color:green,    bg:alpha(green,    isDark?0.16:0.09) },
      barPrimary:primary, barWarning:warning, barSuccess:success,
      npsPromoter:  isDark?"#4ade80":"#16a34a",
      npsNeutral:   isDark?"#fbbf24":"#d97706",
      npsDetractor: isDark?"#f87171":"#dc2626",
      npsChart:[isDark?"#4ade80":"#16a34a",isDark?"#fbbf24":"#d97706",isDark?"#f87171":"#dc2626"],
      rankTop:  { bg:primary, color:"#fff" },
      rankOther:{ bg:alpha(primary,isDark?0.14:0.09), color:primary },
      success, warning, purple, danger, green, teal,
    };
  }, [primary, isDark]);
};

/* ─── DashboardTab ────────────────────────────────────────────────────────── */
const DashboardTab = ({ active, label, onClick, p }) => (
  <Button onClick={onClick} disableElevation className="dash-tab" sx={{
    textTransform:"none", px:{xs:1.4,sm:2}, py:0.65,
    borderRadius:"8px", border:"none", whiteSpace:"nowrap", flexShrink:0,
    color:           active ? p.tabActiveColor  : p.tabInactiveColor,
    backgroundColor: active ? p.tabActiveBg     : "transparent",
    fontWeight: active ? 600 : 500, fontSize:{xs:12,sm:13},
    boxShadow: active ? `0 1px 6px ${alpha(p.primary,0.30)},inset 0 1px 0 ${alpha("#fff",0.12)}` : "none",
    "&:hover":{
      backgroundColor: active ? alpha(p.primary,0.88) : (p.isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"),
      color: active ? p.tabActiveColor : p.textSecond,
    }
  }}>{label}</Button>
);

/* ─── KpiCard ─────────────────────────────────────────────────────────────── */
const KpiCard = ({ title, value, hint, icon, colorCfg, p, delay=0 }) => {
  const num = typeof value==="number" ? value : (parseInt(String(value).replace(/\D/g,""),10)||0);
  const [disp, setDisp] = useState(0);
  useEffect(()=>{
    if(num===0){setDisp(0);return;}
    const steps=40, st=900/steps; let cur=0;
    const t=setInterval(()=>{
      cur+=1; setDisp(Math.round((num*cur)/steps));
      if(cur>=steps){setDisp(num);clearInterval(t);}
    },st);
    return ()=>clearInterval(t);
  },[num]); // eslint-disable-line
  return (
    <Paper elevation={0} className="dash-animate kpi-card"
      style={{"--kpi-color":colorCfg.color,"--kpi-glow":alpha(colorCfg.color,0.35)}}
      sx={{
        p:{xs:"12px 14px 10px",sm:"16px 18px 13px"},
        borderRadius:"14px", border:`1px solid ${p.border}`,
        minHeight:{xs:105,sm:122}, backgroundColor:p.surfaceBg,
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        animationDelay:`${delay}ms`, cursor:"default",
        transition:"box-shadow 0.22s,transform 0.22s,border-color 0.22s",
        "&:hover":{
          transform:"translateY(-2px)",
          borderColor:alpha(colorCfg.color,p.isDark?0.35:0.22),
          boxShadow:`0 8px 28px ${alpha(colorCfg.color,p.isDark?0.18:0.12)}`,
        }
      }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{flex:1,minWidth:0}}>
          <Typography sx={{color:p.textMuted,fontSize:{xs:9.5,sm:11},fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",lineHeight:1}}>
            {title}
          </Typography>
          <Typography className="mono" sx={{color:p.textPrimary,fontSize:{xs:24,sm:29,md:32},lineHeight:1.1,mt:{xs:0.5,sm:0.75},fontWeight:700,letterSpacing:"-0.025em"}}>
            {disp.toLocaleString("pt-BR")}
          </Typography>
        </Box>
        <Box className="kpi-icon-box" sx={{
          width:{xs:38,sm:48},height:{xs:38,sm:48},borderRadius:"12px",
          backgroundColor:colorCfg.bg,color:colorCfg.color,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          border:`1.5px solid ${alpha(colorCfg.color,p.isDark?0.22:0.14)}`,
          boxShadow:`0 2px 10px ${alpha(colorCfg.color,p.isDark?0.18:0.10)}`,
        }}>
          {React.cloneElement(icon,{sx:{fontSize:{xs:19,sm:23}}})}
        </Box>
      </Stack>
      <Stack direction="row" spacing={0.6} alignItems="center" sx={{mt:0.7}}>
        <Box sx={{width:5,height:5,borderRadius:"50%",backgroundColor:colorCfg.color,opacity:0.65,flexShrink:0}}/>
        <Typography sx={{color:p.textMuted,fontSize:{xs:10,sm:11.5},overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {hint}
        </Typography>
      </Stack>
    </Paper>
  );
};

/* ─── SubPaper ────────────────────────────────────────────────────────────── */
const SubPaper = ({children,sx={},p}) => (
  <Paper elevation={0} sx={{
    p:{xs:"13px 13px",sm:"15px 16px",md:"16px 18px"},
    borderRadius:"14px",border:`1px solid ${p.border}`,
    backgroundColor:p.surfaceBg,...sx
  }}>{children}</Paper>
);

/* ─── SectionLabel ────────────────────────────────────────────────────────── */
const SectionLabel = ({children,p}) => (
  <Typography sx={{fontSize:{xs:9.5,sm:11},color:p.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em"}}>
    {children}
  </Typography>
);

/* ─── PeriodChip ──────────────────────────────────────────────────────────── */
const PeriodChip = ({label,p}) => (
  <Box sx={{display:"inline-flex",alignItems:"center",px:{xs:1.1,sm:1.4},py:0.5,borderRadius:"8px",
    backgroundColor:p.chipBg,border:`1px solid ${alpha(p.primary,p.isDark?0.25:0.16)}`,gap:0.7,flexShrink:0}}>
    <Box sx={{width:6,height:6,borderRadius:"50%",flexShrink:0,backgroundColor:p.primary,boxShadow:`0 0 0 3px ${alpha(p.primary,0.2)}`}}/>
    <Typography sx={{fontSize:{xs:10,sm:11.5},color:p.chipColor,fontWeight:600,whiteSpace:"nowrap"}}>
      {label}
    </Typography>
  </Box>
);

/* ─── StatusBar — barra horizontal com label, valor e percentual ──────────── */
const StatusBar = ({label,value,color,total,p}) => {
  const pct = total>0 ? Math.max(3,Math.round((value/total)*100)) : 3;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{mb:0.5}}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box sx={{width:8,height:8,borderRadius:"50%",backgroundColor:color,flexShrink:0}}/>
          <Typography sx={{fontSize:12,color:p.textSecond,fontWeight:500}}>{label}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.6} alignItems="center">
          <Typography className="mono" sx={{fontSize:12,color:p.textPrimary,fontWeight:700}}>
            {value.toLocaleString("pt-BR")}
          </Typography>
          <Box sx={{px:0.7,py:0.05,borderRadius:"5px",backgroundColor:alpha(color,p.isDark?0.18:0.10),color,fontSize:10.5,fontWeight:700}}>
            {pct}%
          </Box>
        </Stack>
      </Stack>
      <Box sx={{height:7,borderRadius:7,backgroundColor:p.barTrack,overflow:"hidden"}}>
        <Box sx={{
          width:`${pct}%`,height:"100%",borderRadius:7,
          background:`linear-gradient(90deg,${color},${alpha(color,0.65)})`,
          transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)"
        }}/>
      </Box>
    </Box>
  );
};

/* ─── CompareBar — barra dupla para "Origem operacional" ─────────────────── */
const CompareBar = ({rows,p}) => {
  const total = rows.reduce((s,r)=>s+r.value,0)||1;
  return (
    <Stack spacing={1.2}>
      {rows.map(r=>(
        <Box key={r.label}>
          <Stack direction="row" justifyContent="space-between" sx={{mb:0.5}}>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Box sx={{width:8,height:8,borderRadius:"3px",backgroundColor:r.color,flexShrink:0}}/>
              <Typography sx={{fontSize:12,color:p.textSecond,fontWeight:500}}>{r.label}</Typography>
            </Stack>
            <Typography className="mono" sx={{fontSize:12,color:p.textPrimary,fontWeight:700}}>
              {r.value.toLocaleString("pt-BR")}
            </Typography>
          </Stack>
          <Box sx={{height:7,borderRadius:7,backgroundColor:p.barTrack,overflow:"hidden"}}>
            <Box sx={{
              width:`${Math.max(3,Math.round((r.value/total)*100))}%`,
              height:"100%",borderRadius:7,
              background:`linear-gradient(90deg,${r.color},${alpha(r.color,0.6)})`,
              transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)"
            }}/>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

/* ─── NpsScoreGauge — pontuação NPS com anel visual ──────────────────────── */
const NpsScoreGauge = ({score, promoters, detractors, neutrals, p}) => {
  const clamped = Math.max(-100, Math.min(100, Math.round(score)));
  const color   = clamped >= 50 ? p.npsPromoter : clamped >= 0 ? p.npsNeutral : p.npsDetractor;
  const label   = clamped >= 50 ? "Excelente" : clamped >= 0 ? "Bom" : clamped >= -25 ? "Atenção" : "Crítico";

  return (
    <SubPaper p={p} sx={{height:"100%"}}>
      <SectionLabel p={p}>Score NPS</SectionLabel>
      <Typography sx={{fontSize:{xs:13,sm:14.5},color:p.textPrimary,fontWeight:700,mt:0.3,mb:2}}>
        Índice de satisfação
      </Typography>

      {/* Score central */}
      <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",mb:2.5}}>
        <Box sx={{
          width:{xs:110,sm:130},height:{xs:110,sm:130},borderRadius:"50%",
          background:`conic-gradient(${color} ${Math.max(0,clamped+100)/2}%, ${p.isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"} 0)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 0 10px ${alpha(color,0.08)}, inset 0 0 0 14px ${p.surfaceBg}`,
          position:"relative"
        }}>
          <Box sx={{
            width:{xs:82,sm:98},height:{xs:82,sm:98},borderRadius:"50%",
            backgroundColor:p.surfaceBg,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"
          }}>
            <Typography className="mono" sx={{fontSize:{xs:28,sm:34},fontWeight:800,color,lineHeight:1,letterSpacing:"-0.03em"}}>
              {clamped}
            </Typography>
            <Typography sx={{fontSize:10.5,color:p.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",mt:0.2}}>
              {label}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{fontSize:11.5,color:p.textMuted,mt:1.2}}>
          Promotores − Detratores
        </Typography>
      </Box>

      {/* Barras de composição */}
      <Stack spacing={1}>
        {[
          {label:i18n.t("dashboard.assessments.prosecutors"), value:Math.round(promoters),  color:p.npsPromoter,  icon:<ThumbUp    sx={{fontSize:13}}/>},
          {label:i18n.t("dashboard.assessments.neutral"),     value:Math.round(neutrals),   color:p.npsNeutral,   icon:<SentimentNeutral sx={{fontSize:13}}/>},
          {label:i18n.t("dashboard.assessments.detractors"),  value:Math.round(detractors), color:p.npsDetractor, icon:<ThumbDown  sx={{fontSize:13}}/>},
        ].map(row=>(
          <Box key={row.label}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:0.45}}>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <Box sx={{color:row.color,display:"flex"}}>{row.icon}</Box>
                <Typography sx={{fontSize:11.5,color:p.textSecond,fontWeight:500}}>{row.label}</Typography>
              </Stack>
              <Typography className="mono" sx={{fontSize:12,color:row.color,fontWeight:700}}>
                {row.value}%
              </Typography>
            </Stack>
            <Box sx={{height:5,borderRadius:5,backgroundColor:p.barTrack,overflow:"hidden"}}>
              <Box sx={{
                width:`${Math.max(2,row.value)}%`,height:"100%",borderRadius:5,
                backgroundColor:row.color,transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)"
              }}/>
            </Box>
          </Box>
        ))}
      </Stack>
    </SubPaper>
  );
};

/* ─── NpsStatCard — card de métrica NPS com ícone e cor ──────────────────── */
const NpsStatCard = ({label, value, color, icon, sub, p}) => (
  <Paper elevation={0} sx={{
    p:{xs:"14px 14px",sm:"16px 18px"},borderRadius:"14px",
    border:`1px solid ${alpha(color,p.isDark?0.22:0.14)}`,
    backgroundColor:alpha(color,p.isDark?0.08:0.05),
    transition:"transform 0.2s,box-shadow 0.2s",
    "&:hover":{transform:"translateY(-2px)",boxShadow:`0 6px 20px ${alpha(color,0.15)}`}
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{fontSize:{xs:10,sm:11},color:alpha(color,0.85),fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>
          {label}
        </Typography>
        <Typography className="mono" sx={{fontSize:{xs:26,sm:32},color,fontWeight:800,lineHeight:1.1,mt:0.5,letterSpacing:"-0.025em"}}>
          {value}
        </Typography>
        {sub && <Typography sx={{fontSize:11,color:alpha(color,0.7),mt:0.3}}>{sub}</Typography>}
      </Box>
      <Box sx={{
        width:{xs:36,sm:42},height:{xs:36,sm:42},borderRadius:"10px",
        backgroundColor:alpha(color,p.isDark?0.20:0.12),
        color, display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
        border:`1.5px solid ${alpha(color,p.isDark?0.28:0.18)}`,
      }}>
        {React.cloneElement(icon,{sx:{fontSize:{xs:18,sm:22}}})}
      </Box>
    </Stack>
  </Paper>
);

/* ─── AttendantRow — linha de atendente com avatar ────────────────────────── */
const AttendantRow = ({agent, index, maxTickets, p}) => {
  const initials = (agent.name||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const barW     = maxTickets>0 ? Math.max(4,Math.round((agent.tickets/maxTickets)*100)) : 4;
  const isTop    = index < 3;

  return (
    <Box className="dash-row-hover" sx={{
      px:{xs:0.8,sm:1},py:{xs:0.8,sm:0.9},borderRadius:"10px",transition:"background 0.15s"
    }}>
      <Stack direction="row" alignItems="center" spacing={1.2}>
        {/* Posição */}
        <Box sx={{
          width:20,height:20,borderRadius:"6px",flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
          backgroundColor: isTop ? p.rankTop.bg    : p.rankOther.bg,
          color:           isTop ? p.rankTop.color : p.rankOther.color,
        }}>{index+1}</Box>

        {/* Avatar */}
        <Box className={agent.online?"avatar-online":""} style={{"--surface-bg":p.surfaceBg}} sx={{flexShrink:0}}>
          <Avatar sx={{
            width:{xs:30,sm:34},height:{xs:30,sm:34},
            fontSize:{xs:11,sm:12.5},fontWeight:700,
            backgroundColor: isTop ? alpha(p.primary,0.85) : p.avatarBg,
            color:           isTop ? "#fff" : p.primary,
            border:`1.5px solid ${alpha(p.primary,isTop?0.4:0.15)}`,
          }}>{initials}</Avatar>
        </Box>

        {/* Nome + barra */}
        <Box sx={{flex:1,minWidth:0}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:0.35}}>
            <Typography sx={{fontSize:{xs:12,sm:13},color:p.textSecond,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {agent.name}
            </Typography>
            <Typography className="mono" sx={{fontSize:12,color:p.textPrimary,fontWeight:700,flexShrink:0,ml:1}}>
              {agent.tickets.toLocaleString("pt-BR")}
            </Typography>
          </Stack>
          <Box sx={{height:3,borderRadius:3,backgroundColor:p.barTrack,overflow:"hidden"}}>
            <Box sx={{
              width:`${barW}%`,height:"100%",borderRadius:3,
              background: isTop
                ? `linear-gradient(90deg,${p.primary},${alpha(p.primary,0.55)})`
                : alpha(p.primary,0.35),
              transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)"
            }}/>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

/* ─── MiniStatCard — card com ícone obrigatório ───────────────────────────── */
const MiniStatCard = ({label, value, icon, color, p}) => (
  <Paper elevation={0} sx={{
    p:{xs:"11px 12px",sm:"14px 16px"},borderRadius:"12px",
    border:`1px solid ${p.border}`,backgroundColor:p.surfaceBg,
    transition:"box-shadow 0.2s,transform 0.2s",
    "&:hover":{transform:"translateY(-1px)",boxShadow:`0 4px 14px ${alpha("#000",0.06)}`}
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box sx={{minWidth:0,flex:1}}>
        <Typography sx={{fontSize:{xs:9.5,sm:11},color:p.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em"}}>
          {label}
        </Typography>
        <Typography className="mono" sx={{fontSize:{xs:19,sm:23},color:p.textPrimary,fontWeight:700,mt:0.3,letterSpacing:"-0.02em"}}>
          {typeof value==="number" ? value.toLocaleString("pt-BR") : value}
        </Typography>
      </Box>
      <Box sx={{
        color, backgroundColor:alpha(color,p.isDark?0.16:0.09),
        borderRadius:"8px",p:0.65,display:"flex",flexShrink:0,
        border:`1px solid ${alpha(color,p.isDark?0.20:0.12)}`,
      }}>
        {React.cloneElement(icon,{sx:{fontSize:{xs:16,sm:18}}})}
      </Box>
    </Stack>
  </Paper>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/* ─── Dashboard ───────────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const p        = usePalette();
  const themeV5  = useMuiThemeV5();
  const isMobile = useMediaQuery(themeV5.breakpoints.down("sm"));

  const [tab, setTab]               = useState("overview");
  const [loading, setLoading]       = useState(false);
  const [counters, setCounters]     = useState({});
  const [attendants, setAttendants] = useState([]);
  const [panelHeight, setPanelHeight] = useState("auto");
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  /* Período do dashboard — inicializa com o mês corrente */
  const defaultFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const defaultTo   = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo,   setDateTo]   = useState(defaultTo);

  const paneRefs = {
    overview:   useRef(null),
    nps:        useRef(null),
    attendants: useRef(null),
  };

  const { user } = useContext(AuthContext);
  const { find } = useDashboard();

  /* Mede altura do painel ativo e trava o viewport */
  useLayoutEffect(()=>{
    const el = paneRefs[tab]?.current;
    if(el) setPanelHeight(el.offsetHeight);
  },[tab]); // eslint-disable-line
  useEffect(()=>{
    const fn=()=>{ const el=paneRefs[tab]?.current; if(el) setPanelHeight(el.offsetHeight); };
    window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[tab]); // eslint-disable-line

  const periodStart = new Date(dateFrom + "T00:00:00").toLocaleDateString("pt-BR");
  const periodEnd   = new Date(dateTo   + "T00:00:00").toLocaleDateString("pt-BR");
  const periodLabel = isMobile ? `${periodStart}–${periodEnd}` : `Período: ${periodStart} – ${periodEnd}`;

  /* Função de carga — chamada na montagem e via modal */
  const loadData = async (from, to) => {
    setLoading(true);
    try {
      const data = await find({ date_from: from, date_to: to });
      setCounters(data?.counters || {});
      if (isArray(data?.attendants)) setAttendants(data.attendants);
    } catch { toast.error("Não foi possível carregar os dados do dashboard."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(dateFrom, dateTo); }, []); // eslint-disable-line

  const metrics = useMemo(()=>{
    const supportHappening=Number(counters?.supportHappening||0);
    const supportPending  =Number(counters?.supportPending  ||0);
    const supportFinished =Number(counters?.supportFinished ||0);
    const totalAttendances=supportHappening+supportPending+supportFinished;
    return{
      supportHappening,supportPending,supportFinished,totalAttendances,
      avgSupportTime:   Number(counters?.avgSupportTime   ||0),
      avgWaitTime:      Number(counters?.avgWaitTime       ||0),
      withRating:       Number(counters?.withRating        ||0),
      withoutRating:    Number(counters?.withoutRating     ||0),
      waitRating:       Number(counters?.waitRating        ||0),
      activeTickets:    Number(counters?.activeTickets     ||0),
      passiveTickets:   Number(counters?.passiveTickets    ||0),
      supportGroups:    Number(counters?.supportGroups     ||0),
      leads:            Number(counters?.leads             ||0),
      npsScore:         Number(counters?.npsScore          ||0),
      npsPromotersPerc: Number(counters?.npsPromotersPerc  ||0),
      npsPassivePerc:   Number(counters?.npsPassivePerc    ||0),
      npsDetractorsPerc:Number(counters?.npsDetractorsPerc ||0),
      percRating:       Math.round(Number(counters?.percRating||0)),
      waitingRate:   totalAttendances>0?Math.round((supportPending  /totalAttendances)*100):0,
      finishedRate:  totalAttendances>0?Math.round((supportFinished /totalAttendances)*100):0,
      happeningRate: totalAttendances>0?Math.round((supportHappening/totalAttendances)*100):0,
    };
  },[counters]);

  const npsChartData = useMemo(()=>[
    {name:i18n.t("dashboard.assessments.prosecutors"),value:metrics.npsPromotersPerc },
    {name:i18n.t("dashboard.assessments.neutral"),     value:metrics.npsPassivePerc  },
    {name:i18n.t("dashboard.assessments.detractors"),  value:metrics.npsDetractorsPerc},
  ],[metrics]);

  const ranking = useMemo(()=>{
    if(!attendants.length) return [];
    return [...attendants]
      .sort((a,b)=>Number(b?.tickets||0)-Number(a?.tickets||0))
      .slice(0,7)
      .map(a=>({name:a?.name||"-",tickets:Number(a?.tickets||0),online:!!a?.online}));
  },[attendants]);

  const maxTickets  = ranking.length>0 ? ranking[0].tickets : 1;
  const onlineCount = attendants.filter(a=>a.online).length;

  const exportToExcel=()=>{
    try{
      const table=document.getElementById("grid-attendants");
      if(!table) return;
      const ws=XLSX.utils.table_to_sheet(table);
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,"Atendentes");
      XLSX.writeFile(wb,"dashboard-atendentes.xlsx");
    }catch{ toast.error("Erro ao exportar a planilha de atendentes."); }
  };

  if(user.profile==="user"&&user.showDashboard==="disabled") return <ForbiddenPage/>;

  const TABS=[
    {id:"overview",   label:i18n.t("dashboard.tabs.indicators") },
    {id:"nps",        label:i18n.t("dashboard.tabs.assessments")},
    {id:"attendants", label:i18n.t("dashboard.tabs.attendants") },
  ];
  const gs={xs:1,sm:1.5};

  /* ── Dados para "Origem operacional" ── */
  const originRows=[
    {label:"Tickets ativos",   value:metrics.activeTickets,  color:p.purple},
    {label:"Tickets passivos", value:metrics.passiveTickets, color:p.teal  },
    {label:"Grupos",           value:metrics.supportGroups,  color:p.primary},
  ];

  return (
    <Box className="dash-root" sx={{
      "--hover-row":p.hoverRow,
      width:"100%", minHeight:"calc(100% - 48px)",
      py:{xs:0,sm:0,md:0}, px:0,
      backgroundColor:p.pageBg,
      transition:"background-color 0.3s ease",
    }}>
      <FontStyle/>

      {/* ══ CABEÇALHO CORPORATIVO ══════════════════════════════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary,0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary,0.82)} 55%, ${alpha("#0ea5e9",0.9)} 100%)`,
        px:{xs:2,sm:3,md:4}, pt:{xs:2.5,sm:3,md:3.5}, pb:{xs:2,sm:2.5,md:3},
        position:"relative", overflow:"hidden",
      }}>
        {/* Decorações geométricas de fundo */}
        <Box sx={{
          position:"absolute", top:-40, right:-40,
          width:{xs:160,md:220}, height:{xs:160,md:220},
          borderRadius:"50%",
          background: p.isDark ? alpha(p.primary,0.08) : alpha("#fff",0.08),
          pointerEvents:"none"
        }}/>
        <Box sx={{
          position:"absolute", bottom:-30, left:"35%",
          width:{xs:100,md:140}, height:{xs:100,md:140},
          borderRadius:"50%",
          background: p.isDark ? alpha("#0ea5e9",0.06) : alpha("#fff",0.06),
          pointerEvents:"none"
        }}/>

        <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between"
          alignItems={{xs:"flex-start",sm:"center"}} spacing={1.5}>

          <Box sx={{position:"relative",zIndex:1}}>
            {/* Breadcrumb */}
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{mb:0.8}}>
              <Typography sx={{
                fontSize:{xs:10,sm:11}, fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase",
                color: p.isDark ? alpha(p.primary,0.8) : alpha("#fff",0.7),
              }}>
                Painel
              </Typography>
              <Box sx={{width:3,height:3,borderRadius:"50%",backgroundColor: p.isDark ? alpha(p.primary,0.5) : alpha("#fff",0.45)}}/>
              <Typography sx={{
                fontSize:{xs:10,sm:11}, fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase",
                color: p.isDark ? alpha("#fff",0.5) : alpha("#fff",0.55),
              }}>
                Dashboard
              </Typography>
            </Stack>

            {/* Título principal */}
            <Typography sx={{
              fontSize:{xs:20,sm:24,md:28}, fontWeight:800,
              letterSpacing:"-0.025em", lineHeight:1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("dashboard.title")}
            </Typography>

            {/* Subtítulo */}
            <Typography sx={{
              fontSize:{xs:12,sm:13.5}, mt:0.6,
              color: p.isDark ? p.textMuted : alpha("#fff",0.72),
              display:{xs:"none",sm:"block"}
            }}>
              Visão geral da operação · Atendimento e desempenho da equipe
            </Typography>

            {/* Meta-tags */}
            <Stack direction="row" spacing={1} sx={{mt:{xs:1.2,sm:1.5},flexWrap:"wrap",gap:0.8}}>
              {[
                {icon:<FiberManualRecord sx={{fontSize:8}}/>, label:"Atualizado agora"},
                {icon:<Insights sx={{fontSize:12}}/>,         label:periodLabel},
              ].map((tag,i)=>(
                <Box key={i} sx={{
                  display:"inline-flex",alignItems:"center",gap:0.6,
                  px:1.2,py:0.4,borderRadius:"20px",
                  backgroundColor: p.isDark ? alpha(p.primary,0.14) : alpha("#fff",0.15),
                  border:`1px solid ${p.isDark ? alpha(p.primary,0.22) : alpha("#fff",0.22)}`,
                  backdropFilter:"blur(8px)",
                }}>
                  <Box sx={{color: p.isDark ? p.primary : "#fff", display:"flex"}}>{tag.icon}</Box>
                  <Typography sx={{fontSize:{xs:10,sm:11},fontWeight:600,color: p.isDark ? alpha("#fff",0.8) : "#fff"}}>
                    {tag.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* ── Conteúdo abaixo do header ── */}
      <Box sx={{px:{xs:1,sm:1.5,md:2.5},py:{xs:1.5,sm:2,md:2.5}}}>

        {/* ── KPI Cards — linha 1: atendimento em tempo real ── */}
        <Grid container spacing={gs} sx={{mb:gs}}>
          {[
            {title:i18n.t("dashboard.cards.inAttendance"),     value:metrics.supportHappening, hint:"Em andamento agora",      icon:<HeadsetMic/>,        colorCfg:p.kpiPrimary, delay:40 },
            {title:i18n.t("dashboard.cards.waiting"),          value:metrics.supportPending,   hint:"Aguardando atendimento",  icon:<HourglassEmpty/>,    colorCfg:p.kpiWarning, delay:80 },
            {title:i18n.t("dashboard.cards.finalized"),        value:metrics.supportFinished,  hint:"Finalizados no período",  icon:<CheckCircle/>,       colorCfg:p.kpiSuccess, delay:120},
            {title:i18n.t("dashboard.users.totalAttendances"), value:metrics.totalAttendances, hint:"Total acumulado",         icon:<BarChart/>,          colorCfg:p.kpiPurple,  delay:160},
            {title:"Leads no período",                         value:metrics.leads,            hint:"Captados no período",    icon:<PersonAdd/>,         colorCfg:p.kpiPrimary, delay:200},
            {title:"Atend. em grupo",                          value:metrics.supportGroups,    hint:"Via grupos no período",  icon:<Forum/>,             colorCfg:p.kpiTeal,    delay:240},
          ].map((card,i)=>(
            <Grid item xs={6} sm={4} md={2} key={i}>
              <KpiCard {...card} p={p}/>
            </Grid>
          ))}
        </Grid>

        {/* ── KPI Cards — linha 2: operacional e equipe ── */}
        <Grid container spacing={gs} sx={{mb:{xs:1.5,sm:2}}}>
          {[
            {title:"Tickets ativos",        value:metrics.activeTickets,                        hint:"Abertos atualmente",        icon:<MarkChatUnread/>,    colorCfg:p.kpiPurple,  delay:280},
            {title:"Tickets passivos",      value:metrics.passiveTickets,                       hint:"Aguardando resposta",       icon:<MarkChatRead/>,      colorCfg:p.kpiWarning, delay:320},
            {title:"T.M. espera",           value:`${Math.round(metrics.avgWaitTime)} min`,     hint:"Tempo médio de espera",     icon:<Timer/>,             colorCfg:p.kpiPrimary, delay:360},
            {title:"T.M. atendimento",      value:`${Math.round(metrics.avgSupportTime)} min`,  hint:"Tempo médio de atendimento",icon:<AccessTime/>,        colorCfg:p.kpiSuccess, delay:400},
            {title:"Atendentes online",     value:onlineCount,                                  hint:"Agentes conectados agora",  icon:<SignalWifi4Bar/>,    colorCfg:p.kpiTeal,    delay:440},
            {title:"Atendentes no período", value:attendants.length,                            hint:"Atuaram no período",        icon:<PeopleAlt/>,         colorCfg:p.kpiPurple,  delay:480},
          ].map((card,i)=>(
            <Grid item xs={6} sm={4} md={2} key={i}>
              <KpiCard {...card} p={p}/>
            </Grid>
          ))}
        </Grid>

        {/* ── Painel de abas ── */}
        <Paper elevation={0} className="dash-animate" sx={{
          borderRadius:{xs:"12px",sm:"16px"},
          border:`1px solid ${p.border}`,backgroundColor:p.surfaceBg,
          overflow:"hidden",animationDelay:"280ms"
        }}>
          {/* ══ MODAL DE FILTROS DO DASHBOARD ══════════════════════════════ */}
          <Dialog
            open={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
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
            <DialogTitle sx={{ p: 0 }}>
              <Stack
                direction="row" justifyContent="space-between" alignItems="center"
                sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${p.divider}` }}
              >
                <Box>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", fontFamily: "'DM Sans', sans-serif" }}>
                    Período de análise
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: p.textPrimary, mt: 0.2, fontFamily: "'DM Sans', sans-serif" }}>
                    Filtrar Dashboard
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setFilterModalOpen(false)}
                  sx={{
                    borderRadius: "10px", p: 0.7,
                    border: `1px solid ${p.border}`,
                    backgroundColor: p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
                    color: p.textMuted,
                    transition: "all 0.16s",
                    "&:hover": {
                      borderColor: alpha("#ef4444", 0.45),
                      color: "#ef4444",
                      backgroundColor: alpha("#ef4444", p.isDark ? 0.1 : 0.05),
                    },
                  }}
                >
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2.5 }}>
              <Stack spacing={2}>
                {/* Data Inicial */}
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.7, fontFamily: "'DM Sans', sans-serif" }}>
                    Data Inicial
                  </Typography>
                  <TextField
                    type="date" value={dateFrom} fullWidth size="small"
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px", fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        backgroundColor: p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
                        "& fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
                        "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
                        "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
                      },
                      "& .MuiInputLabel-root": { display: "none" },
                    }}
                  />
                </Box>

                {/* Data Final */}
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.7, fontFamily: "'DM Sans', sans-serif" }}>
                    Data Final
                  </Typography>
                  <TextField
                    type="date" value={dateTo} fullWidth size="small"
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: false, sx: { display: "none" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px", fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        backgroundColor: p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
                        "& fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
                        "&:hover fieldset": { borderColor: p.isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
                        "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
                      },
                      "& .MuiInputLabel-root": { display: "none" },
                    }}
                  />
                </Box>

                {/* Separador */}
                <Box sx={{ height: "1px", backgroundColor: p.divider }} />

                {/* Botões */}
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button
                    variant="outlined" size="small"
                    onClick={() => setFilterModalOpen(false)}
                    sx={{
                      borderRadius: "10px", textTransform: "none", fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                      borderColor: p.border, color: p.textMuted,
                      "&:hover": { borderColor: p.textMuted, backgroundColor: alpha(p.textMuted, 0.06) },
                    }}
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="contained" disableElevation
                    onClick={() => { setFilterModalOpen(false); loadData(dateFrom, dateTo); }}
                    startIcon={<FilterAlt sx={{ fontSize: 15 }} />}
                    sx={{
                      position: "relative", overflow: "hidden",
                      backgroundColor: p.primary, color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700, fontSize: 13, textTransform: "none",
                      borderRadius: "10px", height: 38, px: 2.2,
                      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.30)}`,
                      "&::before": {
                        content: '""', position: "absolute",
                        top: 0, left: "-75%", width: "50%", height: "100%",
                        background: "linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)",
                        transition: "left 0.4s ease", pointerEvents: "none",
                      },
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(p.primary, 0.42)}`,
                        "&::before": { left: "125%" },
                      },
                    }}
                  >
                    Aplicar e fechar
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </Dialog>

          {/* Tab bar */}
          <Box sx={{
            px:{xs:0.8,sm:1.5,md:2},py:{xs:0.7,sm:1.1},
            borderBottom:`1px solid ${p.divider}`,
            backgroundColor:p.isDark ? alpha("#000",0.15) : alpha(p.primary,0.015),
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Box className="dash-tab-scroll" sx={{flex:1,minWidth:0}}>
                <Stack direction="row" spacing={0.3} sx={{
                  p:0.4,borderRadius:"9px",
                  backgroundColor:p.isDark?alpha("#000",0.3):alpha(p.primary,0.04),
                  border:`1px solid ${p.border}`,
                  display:"inline-flex",width:"max-content",minWidth:"100%",
                }}>
                  {TABS.map(t=>(
                    <DashboardTab key={t.id} active={tab===t.id} label={t.label} onClick={()=>setTab(t.id)} p={p}/>
                  ))}
                </Stack>
              </Box>

              {/* Lado direito: botão Filtros + PeriodChip */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                <Button
                  onClick={() => setFilterModalOpen(true)}
                  startIcon={<TuneRounded sx={{ fontSize: 15 }} />}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: "9px", textTransform: "none",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12.5,
                    height: 34, px: 1.5,
                    borderColor: p.border,
                    color: p.textSecond,
                    backgroundColor: p.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
                    transition: "all 0.18s",
                    "&:hover": {
                      borderColor: alpha(p.primary, 0.45),
                      color: p.primary,
                      backgroundColor: alpha(p.primary, p.isDark ? 0.1 : 0.05),
                    },
                  }}
                >
                  Filtros
                </Button>
                <Box sx={{display:{xs:"none",sm:"block"}}}>
                  <PeriodChip label={periodLabel} p={p}/>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Viewport com altura animada */}
          <Box className="dash-panel-viewport"
            style={{height:panelHeight==="auto"?"auto":`${panelHeight}px`}}>

            {/* ══ Tab: Indicadores ══ */}
            <Box ref={paneRefs.overview}
              className={`dash-tab-pane${tab==="overview"?" active":""}`}
              sx={{p:{xs:1,sm:1.4,md:2}}}>

              <Grid container spacing={gs}>
                {/* Gráfico de volume */}
                <Grid item xs={12} lg={8}>
                  <SubPaper p={p} sx={{backgroundColor:p.surfaceBg2}}>
                    <SectionLabel p={p}>Volume</SectionLabel>
                    <Typography sx={{fontSize:{xs:13,sm:14.5},color:p.textPrimary,fontWeight:700,mt:0.2,mb:{xs:1,sm:1.5}}}>
                      Atendimentos por dia
                    </Typography>
                    <ChartsDate dateFrom={dateFrom} dateTo={dateTo} />
                  </SubPaper>
                </Grid>

                {/* Distribuição + Origem operacional + Top atendentes — coluna direita */}
                <Grid item xs={12} lg={4}>
                  <Stack spacing={gs}>
                    {/* Distribuição */}
                    <SubPaper p={p}>
                      <SectionLabel p={p}>Distribuição atual</SectionLabel>
                      <Stack spacing={1.1} sx={{mt:1.3}}>
                        <StatusBar label="Em atendimento" value={metrics.supportHappening} color={p.barPrimary} total={metrics.totalAttendances} p={p}/>
                        <StatusBar label="Aguardando"     value={metrics.supportPending}   color={p.barWarning} total={metrics.totalAttendances} p={p}/>
                        <StatusBar label="Finalizados"    value={metrics.supportFinished}  color={p.barSuccess} total={metrics.totalAttendances} p={p}/>
                      </Stack>
                    </SubPaper>

                    {/* Origem operacional */}
                    <SubPaper p={p}>
                      <SectionLabel p={p}>Origem operacional</SectionLabel>
                      <Box sx={{mt:1.3}}>
                        <CompareBar rows={originRows} p={p}/>
                      </Box>
                    </SubPaper>

                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* ══ Tab: NPS ══ */}
            <Box ref={paneRefs.nps}
              className={`dash-tab-pane${tab==="nps"?" active":""}`}
              sx={{p:{xs:1,sm:1.4,md:2}}}>

              <Grid container spacing={gs}>
                {/* Score Gauge */}
                <Grid item xs={12} md={5}>
                  <NpsScoreGauge
                    score={metrics.npsScore}
                    promoters={metrics.npsPromotersPerc}
                    detractors={metrics.npsDetractorsPerc}
                    neutrals={metrics.npsPassivePerc}
                    p={p}
                  />
                </Grid>

                <Grid item xs={12} md={7}>
                  <Stack spacing={gs} sx={{height:"100%"}}>
                    {/* Cards coloridos por categoria */}
                    <Grid container spacing={gs}>
                      {[
                        {
                          label: i18n.t("dashboard.assessments.prosecutors"),
                          value: `${Math.round(metrics.npsPromotersPerc)}%`,
                          color: p.npsPromoter,
                          icon:  <SentimentSatisfiedAlt/>,
                          sub:   "Clientes satisfeitos"
                        },
                        {
                          label: i18n.t("dashboard.assessments.neutral"),
                          value: `${Math.round(metrics.npsPassivePerc)}%`,
                          color: p.npsNeutral,
                          icon:  <SentimentNeutral/>,
                          sub:   "Podem ser convertidos"
                        },
                        {
                          label: i18n.t("dashboard.assessments.detractors"),
                          value: `${Math.round(metrics.npsDetractorsPerc)}%`,
                          color: p.npsDetractor,
                          icon:  <SentimentDissatisfied/>,
                          sub:   "Requerem atenção"
                        },
                      ].map(card=>(
                        <Grid item xs={12} sm={4} key={card.label}>
                          <NpsStatCard {...card} p={p}/>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Métricas de avaliação */}
                    <Grid container spacing={gs}>
                      {[
                        {label:"Aguardando avaliação", value:metrics.waitRating,              icon:<HourglassTop/>,      color:p.warning},
                        {label:"Com avaliação",        value:metrics.withRating,              icon:<StarRate/>,           color:p.primary},
                        {label:"Índice de avaliação",  value:`${metrics.percRating}%`,        icon:<AssignmentTurnedIn/>, color:p.success},
                        {label:"Sem avaliação",        value:metrics.withoutRating,           icon:<SentimentNeutral/>,   color:p.teal   },
                      ].map(c=>(
                        <Grid item xs={6} sm={6} md={6} key={c.label}>
                          <MiniStatCard {...c} p={p}/>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* ══ Tab: Atendentes ══ */}
            <Box ref={paneRefs.attendants}
              className={`dash-tab-pane${tab==="attendants"?" active":""}`}
              sx={{p:{xs:1,sm:1.4,md:2}}}>

              {/* Lista de atendentes com avatares */}
              <SubPaper p={p} sx={{mb:{xs:1.2,sm:1.5}}}>
                <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between"
                  alignItems={{xs:"flex-start",sm:"center"}} spacing={1} sx={{mb:1.5}}>
                  <Box>
                    <SectionLabel p={p}>Ranking de atendimentos</SectionLabel>
                    <Typography sx={{fontSize:{xs:13,sm:14.5},color:p.textPrimary,fontWeight:700,mt:0.2}}>
                      Atendentes do período
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {onlineCount>0 && (
                      <Box sx={{
                        display:"inline-flex",alignItems:"center",gap:0.6,
                        px:1.2,py:0.5,borderRadius:"20px",
                        backgroundColor:alpha(p.success,p.isDark?0.14:0.08),
                        border:`1px solid ${alpha(p.success,p.isDark?0.22:0.15)}`,
                      }}>
                        <Box sx={{width:6,height:6,borderRadius:"50%",backgroundColor:p.success,boxShadow:`0 0 0 2px ${alpha(p.success,0.25)}`}}/>
                        <Typography sx={{fontSize:11.5,color:p.isDark?"#4ade80":"#15803d",fontWeight:600}}>
                          {onlineCount} online
                        </Typography>
                      </Box>
                    )}
                    <Button size="small" startIcon={<Download sx={{fontSize:14}}/>} onClick={exportToExcel} sx={{
                      textTransform:"none",fontWeight:600,fontSize:{xs:12,sm:12.5},
                      borderRadius:"8px",color:p.primary,px:1.4,
                      border:`1px solid ${alpha(p.primary,p.isDark?0.25:0.18)}`,
                      backgroundColor:alpha(p.primary,p.isDark?0.08:0.05),
                      "&:hover":{backgroundColor:alpha(p.primary,p.isDark?0.14:0.09)}
                    }}>
                      Exportar XLSX
                    </Button>
                  </Stack>
                </Stack>

                {/* Ranking com avatares */}
                {ranking.length>0
                  ? <Stack spacing={0.3} sx={{mb:2}}>
                      {ranking.map((agent,i)=>(
                        <AttendantRow key={`rank-${i}`} agent={agent} index={i} maxTickets={maxTickets} p={p}/>
                      ))}
                    </Stack>
                  : <Typography sx={{fontSize:13,color:p.textMuted,py:2,textAlign:"center"}}>
                      Sem dados de atendentes para o período.
                    </Typography>
                }

                <Divider sx={{borderColor:p.divider,my:1.5}}/>

                {/* Resumo de atendimento com avatares */}
                <Typography sx={{fontSize:11,color:p.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",mb:1.2}}>
                  Resumo de atendimento
                </Typography>
                <Box className="dash-table-wrap" id="grid-attendants">
                  {attendants.length>0
                    ? <Stack spacing={0}>
                        {/* Cabeçalho */}
                        <Box sx={{
                          display:"grid",
                          gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
                          px:{xs:0.8,sm:1},py:0.6,
                          borderRadius:"8px 8px 0 0",
                          backgroundColor:p.isDark?alpha("#000",0.25):alpha(p.primary,0.04),
                          borderBottom:`1px solid ${p.divider}`,
                        }}>
                          {["Atendente","Tickets","Em atend.","Aguardando","Status"].map(h=>(
                            <Typography key={h} sx={{fontSize:10.5,color:p.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>
                              {h}
                            </Typography>
                          ))}
                        </Box>
                        {/* Linhas */}
                        {attendants.map((a,i)=>{
                          const initials=(a?.name||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
                          const isTop=i<3;
                          return (
                            <Box key={i} className="dash-row-hover" sx={{
                              display:"grid",
                              gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
                              px:{xs:0.8,sm:1},py:{xs:0.8,sm:0.9},
                              borderBottom:`1px solid ${p.divider}`,
                              borderRadius: i===attendants.length-1?"0 0 8px 8px":"0",
                              transition:"background 0.15s",
                            }}>
                              {/* Nome + avatar */}
                              <Stack direction="row" alignItems="center" spacing={1} sx={{minWidth:0}}>
                                <Box className={a?.online?"avatar-online":""} style={{"--surface-bg":p.surfaceBg}} sx={{flexShrink:0}}>
                                  <Avatar sx={{
                                    width:{xs:26,sm:30},height:{xs:26,sm:30},
                                    fontSize:{xs:10,sm:11.5},fontWeight:700,
                                    backgroundColor:isTop?alpha(p.primary,0.85):p.avatarBg,
                                    color:isTop?"#fff":p.primary,
                                    border:`1.5px solid ${alpha(p.primary,isTop?0.4:0.15)}`,
                                  }}>{initials}</Avatar>
                                </Box>
                                <Typography sx={{fontSize:{xs:12,sm:13},color:p.textSecond,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  {a?.name||"-"}
                                </Typography>
                              </Stack>
                              {/* Tickets */}
                              <Typography className="mono" sx={{fontSize:{xs:12,sm:13},color:p.textPrimary,fontWeight:700,display:"flex",alignItems:"center"}}>
                                {Number(a?.tickets||0).toLocaleString("pt-BR")}
                              </Typography>
                              {/* Em atend. */}
                              <Typography className="mono" sx={{fontSize:{xs:12,sm:13},color:p.primary,fontWeight:600,display:"flex",alignItems:"center"}}>
                                {Number(a?.ticketsHappening||0).toLocaleString("pt-BR")}
                              </Typography>
                              {/* Aguardando */}
                              <Typography className="mono" sx={{fontSize:{xs:12,sm:13},color:p.warning,fontWeight:600,display:"flex",alignItems:"center"}}>
                                {Number(a?.ticketsPending||0).toLocaleString("pt-BR")}
                              </Typography>
                              {/* Status online */}
                              <Box sx={{display:"flex",alignItems:"center"}}>
                                <Box sx={{
                                  display:"inline-flex",alignItems:"center",gap:0.5,
                                  px:0.9,py:0.2,borderRadius:"20px",
                                  backgroundColor:a?.online?alpha(p.success,p.isDark?0.14:0.08):alpha(p.textMuted,0.08),
                                  border:`1px solid ${a?.online?alpha(p.success,0.22):alpha(p.textMuted,0.15)}`,
                                }}>
                                  <Box sx={{width:5,height:5,borderRadius:"50%",backgroundColor:a?.online?p.success:p.textMuted,flexShrink:0}}/>
                                  <Typography sx={{fontSize:10.5,color:a?.online?(p.isDark?"#4ade80":"#15803d"):p.textMuted,fontWeight:600}}>
                                    {a?.online?"Online":"Offline"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    : <Typography sx={{fontSize:13,color:p.textMuted,py:2,textAlign:"center"}}>
                        Sem dados de atendentes para o período.
                      </Typography>
                  }
                </Box>
              </SubPaper>
            </Box>

          </Box>{/* fecha viewport */}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;