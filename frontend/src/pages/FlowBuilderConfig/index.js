import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";

import api from "../../services/api";

import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  alpha,
} from "@mui/material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";

import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  FiberManualRecord,
  GetApp,
  LibraryBooks,
  RocketLaunch,
  Save,
  UploadFile,
} from "@mui/icons-material";
import { ConfirmationNumber } from "@material-ui/icons";
import BallotIcon from "@mui/icons-material/Ballot";

import { useParams } from "react-router-dom/cjs/react-router-dom.min";

import "reactflow/dist/style.css";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "react-flow-renderer";

import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import RemoveEdge from "./nodes/removeEdge";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import { useNodeStorage } from "../../stores/useNodeStorage";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import singleBlockNode from "./nodes/singleBlockNode";
import ticketNode from "./nodes/ticketNode";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";
import FlowImportModal from "../../components/FlowImportModal";
import { exportFlow } from "../../services/flowBuilder";

/* ─── FontStyle (padrão Announcements/Tags) ──────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .fb-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .fb-root { max-width: 100%; overflow: hidden; }
    @keyframes fbFadeSlideUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fb-animate { animation: fbFadeSlideUp 0.32s ease both; }
  `}</style>
);

/* ─── usePalette (idêntico ao Announcements) ─────────────────────────────── */
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
    const success = "#10b981", warning = "#f59e0b", danger = "#ef4444";
    const purple  = "#8b5cf6", teal = "#14b8a6";

    const t = isDark ? {
      pageBg:      "#080e1a",
      surfaceBg:   "#0f1929",
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
      inputHover:  "rgba(255,255,255,0.22)",
      sidebarBg:   "#0a1420",
      sidebarBorder:"rgba(255,255,255,0.07)",
      chipBg:      "rgba(255,255,255,0.06)",
      chipHover:   "rgba(255,255,255,0.10)",
      canvasBg:    "#060c16",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      surfaceBg2:  "#fafbfd",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
      inputHover:  "#a8b8c8",
      sidebarBg:   "#ffffff",
      sidebarBorder:"#e3eaf2",
      chipBg:      "rgba(0,0,0,0.035)",
      chipHover:   "rgba(0,0,0,0.065)",
      canvasBg:    "#f0f4f8",
    };

    return {
      primary, isDark, ...t,
      chipColor:  primary,
      success, warning, danger, purple, teal,
    };
  }, [primary, isDark]);
};

/* ─── Utilitários ────────────────────────────────────────────────────────── */
function geraStringAleatoria(tamanho) {
  var s = "";
  var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) s += c.charAt(Math.floor(Math.random() * c.length));
  return s;
}

/* ─── nodeTypes / edgeTypes (originais intactos) ─────────────────────────── */
const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
};

const edgeTypes = { buttonedge: RemoveEdge };

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start",
  },
];
const initialEdges = [];

const defaultFlowSettings = {
  reengagement: { enabled: false, minutes: 15, message: "" },
};

const normalizeFlowSettings = (settings) => {
  const raw = settings?.reengagement || {};
  return {
    reengagement: {
      enabled: Boolean(raw.enabled),
      minutes: Number(raw.minutes) > 0 ? Number(raw.minutes) : 15,
      message: String(raw.message || ""),
    },
  };
};

/* ─── HeaderBtn ──────────────────────────────────────────────────────────── */
const HeaderBtn = ({ children, onClick, startIcon, variant = "contained", p }) => {
  const isOutlined = variant === "outlined";
  return (
    <Button
      variant={variant}
      disableElevation
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        position: "relative", overflow: "hidden",
        backgroundColor: isOutlined ? "transparent" : p.primary,
        color: isOutlined ? p.primary : "#fff",
        borderColor: isOutlined ? alpha(p.primary, 0.4) : "transparent",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
        textTransform: "none", borderRadius: "10px",
        height: 38, px: 2,
        boxShadow: isOutlined ? "none" : `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(p.primary, 0.28)}`,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&::before": isOutlined ? {} : {
          content: '""', position: "absolute",
          top: 0, left: "-75%", width: "50%", height: "100%",
          background: "linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)",
          transition: "left 0.4s ease", pointerEvents: "none",
        },
        "&:hover": {
          backgroundColor: isOutlined ? alpha(p.primary, 0.06) : p.primary,
          borderColor: isOutlined ? p.primary : "transparent",
          transform: "translateY(-1px)",
          boxShadow: isOutlined ? "none" : `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 20px ${alpha(p.primary, 0.38)}`,
          "&::before": { left: "125%" },
        },
        "&:active": { transform: "translateY(0px)" },
      }}
    >
      {children}
    </Button>
  );
};

/* ══ FlowBuilderConfig ═══════════════════════════════════════════════════════ */
export const FlowBuilderConfig = () => {
  const p       = usePalette();
  const history = useHistory();
  const { id }  = useParams();
  const storageItems = useNodeStorage();
  const { user } = useContext(AuthContext);

  /* ── estados (originais intactos) ── */
  const [loading, setLoading]                         = useState(false);
  const [pageNumber, setPageNumber]                   = useState(1);
  const [dataNode, setDataNode]                       = useState(null);
  const [hasMore, setHasMore]                         = useState(false);
  const [modalAddText, setModalAddText]               = useState(null);
  const [modalAddInterval, setModalAddInterval]       = useState(false);
  const [modalAddMenu, setModalAddMenu]               = useState(null);
  const [modalAddImg, setModalAddImg]                 = useState(null);
  const [modalAddAudio, setModalAddAudio]             = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer]   = useState(null);
  const [modalAddVideo, setModalAddVideo]             = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket]           = useState(null);
  const [modalAddTypebot, setModalAddTypebot]         = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI]           = useState(null);
  const [modalAddQuestion, setModalAddQuestion]       = useState(null);
  const [importModal, setImportModal]                 = useState(false);
  const [flowSettings, setFlowSettings]               = useState(defaultFlowSettings);
  const [searchTerm, setSearchTerm]                   = useState("");

  const connectionLineStyle = { stroke: "#9ca3af", strokeWidth: "2px" };

  /* ── addNode (original intacto) ── */
  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX = nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;

    const make = (extraData, nodeType) =>
      setNodes((old) => [...old, { id: geraStringAleatoria(30), position: { x: posX, y: posY }, data: extraData, type: nodeType }]);

    if (type === "start") {
      return setNodes(() => [{ id: "1", position: { x: posX, y: posY }, data: { label: "Inicio do fluxo" }, type: "start" }]);
    }
    if (type === "text")        return make({ label: data.text }, "message");
    if (type === "interval")    return make({ label: `Intervalo ${data.sec} seg.`, sec: data.sec }, "interval");
    if (type === "condition")   return make({ key: data.key, condition: data.condition, value: data.value }, "condition");
    if (type === "menu")        return make({ message: data.message, arrayOption: data.arrayOption }, "menu");
    if (type === "img")         return make({ url: data.url }, "img");
    if (type === "audio")       return make({ url: data.url, record: data.record }, "audio");
    if (type === "randomizer")  return make({ percent: data.percent }, "randomizer");
    if (type === "video")       return make({ url: data.url }, "video");
    if (type === "singleBlock") return make({ ...data }, "singleBlock");
    if (type === "ticket")      return make({ ...data }, "ticket");
    if (type === "typebot")     return make({ ...data }, "typebot");
    if (type === "openai")      return make({ ...data }, "openai");
    if (type === "question")    return make({ ...data }, "question");
  };

  const textAdd        = (d) => addNode("text", d);
  const intervalAdd    = (d) => addNode("interval", d);
  const conditionAdd   = (d) => addNode("condition", d);
  const menuAdd        = (d) => addNode("menu", d);
  const imgAdd         = (d) => addNode("img", d);
  const audioAdd       = (d) => addNode("audio", d);
  const randomizerAdd  = (d) => addNode("randomizer", d);
  const videoAdd       = (d) => addNode("video", d);
  const singleBlockAdd = (d) => addNode("singleBlock", d);
  const ticketAdd      = (d) => addNode("ticket", d);
  const typebotAdd     = (d) => addNode("typebot", d);
  const openaiAdd      = (d) => addNode("openai", d);
  const questionAdd    = (d) => addNode("question", d);

  /* ── fetch (original intacto) ── */
  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get(`/flowbuilder/flow/${id}`);
        if (data.flow.flow !== null) {
          const flowNodes = data.flow.flow.nodes;
          setNodes(flowNodes);
          setEdges(data.flow.flow.connections);
          setFlowSettings(normalizeFlowSettings(data.flow.flow.settings));
          const variables = flowNodes
            .filter((nd) => nd.type === "question")
            .map((v) => v.data.typebotIntegration.answerKey);
          localStorage.setItem("variables", JSON.stringify(variables));
        } else {
          setFlowSettings(defaultFlowSettings);
        }
        setLoading(false);
      } catch (err) { toastError(err); }
    }, 500);
    return () => clearTimeout(delay);
  }, [id]);

  /* ── storageItems effect (original intacto) ── */
  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => old.filter((item) => item.source !== storageItems.node && item.target !== storageItems.node));
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter((item) => item.id === storageItems.node)[0];
      const maiorX = Math.max(...nodes.map((n) => n.position.x));
      const finalY = nodes[nodes.length - 1].position.y;
      setNodes((old) => [...old, {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: { x: maiorX + 240, y: finalY },
        selected: false,
        style: { backgroundColor: "#555555", padding: 0, borderRadius: 8 },
      }]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

  const loadMore = () => setPageNumber((p) => p + 1);
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) loadMore();
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({
          ...params,
          type: "buttonedge",
          data: {
            onDelete: (idToDelete) => setEdges((prev) => prev.filter((ed) => ed.id !== idToDelete)),
          },
        }, eds)
      ),
    [setEdges]
  );

  /* ── saveFlow (original intacto) ── */
  const saveFlow = async () => {
    await api.post("/flowbuilder/flow", {
      idFlow: id,
      nodes,
      connections: edges,
      settings: { reengagement: { enabled: false, minutes: 15, message: "" } },
    });
    toast.success("Fluxo salvo com sucesso");
  };

  /* ── doubleClick / clickNode / clickEdge / updateNode (originais intactos) ── */
  const doubleClick = (event, node) => {
    setDataNode(node);
    if (node.type === "message")     setModalAddText("edit");
    if (node.type === "interval")    setModalAddInterval("edit");
    if (node.type === "menu")        setModalAddMenu("edit");
    if (node.type === "img")         setModalAddImg("edit");
    if (node.type === "audio")       setModalAddAudio("edit");
    if (node.type === "randomizer")  setModalAddRandomizer("edit");
    if (node.type === "singleBlock") setModalAddSingleBlock("edit");
    if (node.type === "ticket")      setModalAddTicket("edit");
    if (node.type === "typebot")     setModalAddTypebot("edit");
    if (node.type === "openai")      setModalAddOpenAI("edit");
    if (node.type === "question")    setModalAddQuestion("edit");
  };

  const clickNode = (event, node) => {
    setNodes((old) => old.map((item) => ({
      ...item,
      style: item.id === node.id
        ? { backgroundColor: "#6366F1", padding: 1, borderRadius: 8 }
        : { backgroundColor: "#13111C", padding: 0, borderRadius: 8 },
    })));
  };

  const clickEdge = (event, edge) => {
    setEdges((edges) => edges.map((e) =>
      e.id === edge.id
        ? { ...e, data: { ...(e.data || {}), selected: true, onDelete: (id) => setEdges((eds) => eds.filter((ed) => ed.id !== id)) } }
        : { ...e, data: { ...(e.data || {}), selected: false } }
    ));
  };

  const updateNode = (dataAlter) => {
    setNodes((old) => old.map((item) => item.id === dataAlter.id ? dataAlter : item));
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
  };

  /* ── actionSections (original intacto) ── */
  const actionSections = [
    {
      title: "Mensagens",
      items: [
        { icon: <LibraryBooks sx={{ color: "#EC5858" }} />, name: "Conteúdo", type: "content" },
        { icon: <DynamicFeed  sx={{ color: "#683AC8" }} />, name: "Menu",     type: "menu"    },
      ],
    },
    {
      title: "Lógica",
      items: [
        { icon: <CallSplit         sx={{ color: "#1FBADC" }} />, name: "Randomizador", type: "random"   },
        { icon: <AccessTime        sx={{ color: "#F7953B" }} />, name: "Intervalo",    type: "interval" },
        { icon: <ConfirmationNumber sx={{ color: "#F7953B" }} />, name: "Ticket",      type: "ticket"   },
      ],
    },
    {
      title: "Integrações",
      items: [
        { icon: <Box component="img" sx={{ width: 18, height: 18 }} src={typebotIcon} alt="icon" />, name: "TypeBot",        type: "typebot" },
        { icon: <SiOpenai style={{ color: "#0EA5E9", width: 18, height: 18 }} />,                   name: "OpenAI / Gemini", type: "openai"  },
      ],
    },
    {
      title: "Outros",
      items: [
        { icon: <RocketLaunch sx={{ color: "#3ABA38" }} />, name: "Início",   type: "start"    },
        { icon: <BallotIcon   sx={{ color: "#F7953B" }} />, name: "Pergunta", type: "question" },
      ],
    },
    {
      title: "Configurações",
      items: [
        { icon: <HiOutlinePuzzle style={{ width: 18, height: 18 }} />, name: "Em breve", type: "soon", disabled: true },
      ],
    },
  ];

  const filteredSections = actionSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const clickActions = (type) => {
    switch (type) {
      case "start":    addNode("start");               break;
      case "menu":     setModalAddMenu("create");      break;
      case "content":  setModalAddSingleBlock("create"); break;
      case "random":   setModalAddRandomizer("create"); break;
      case "interval": setModalAddInterval("create");  break;
      case "ticket":   setModalAddTicket("create");    break;
      case "typebot":  setModalAddTypebot("create");   break;
      case "openai":   setModalAddOpenAI("create");    break;
      case "question": setModalAddQuestion("create");  break;
      default: break;
    }
  };

  /* ══ RENDER ══════════════════════════════════════════════════════════════ */
  return (
    <Stack
      className="fb-root"
      sx={{
        height: "100vh",
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        overflow: "hidden",
      }}
    >
      <FontStyle />

      {/* ── Modais (originais intactos) ── */}
      <FlowBuilderAddTextModal     open={modalAddText}       onSave={textAdd}       data={dataNode} onUpdate={updateNode} close={setModalAddText}        />
      <FlowBuilderIntervalModal    open={modalAddInterval}   onSave={intervalAdd}   data={dataNode} onUpdate={updateNode} close={setModalAddInterval}     />
      <FlowBuilderMenuModal        open={modalAddMenu}       onSave={menuAdd}       data={dataNode} onUpdate={updateNode} close={setModalAddMenu}         />
      <FlowBuilderAddImgModal      open={modalAddImg}        onSave={imgAdd}        data={dataNode} onUpdate={updateNode} close={setModalAddImg}          />
      <FlowBuilderAddAudioModal    open={modalAddAudio}      onSave={audioAdd}      data={dataNode} onUpdate={updateNode} close={setModalAddAudio}        />
      <FlowBuilderRandomizerModal  open={modalAddRandomizer} onSave={randomizerAdd} data={dataNode} onUpdate={updateNode} close={setModalAddRandomizer}   />
      <FlowBuilderAddVideoModal    open={modalAddVideo}      onSave={videoAdd}      data={dataNode} onUpdate={updateNode} close={setModalAddVideo}        />
      <FlowBuilderSingleBlockModal open={modalAddSingleBlock} onSave={singleBlockAdd} data={dataNode} onUpdate={updateNode} close={setModalAddSingleBlock} />
      <FlowBuilderTicketModal      open={modalAddTicket}     onSave={ticketAdd}     data={dataNode} onUpdate={updateNode} close={setModalAddTicket}       />
      <FlowBuilderOpenAIModal      open={modalAddOpenAI}     onSave={openaiAdd}     data={dataNode} onUpdate={updateNode} close={setModalAddOpenAI}       />
      <FlowBuilderTypebotModal     open={modalAddTypebot}    onSave={typebotAdd}    data={dataNode} onUpdate={updateNode} close={setModalAddTypebot}      />
      <FlowBuilderAddQuestionModal open={modalAddQuestion}   onSave={questionAdd}   data={dataNode} onUpdate={updateNode} close={setModalAddQuestion}     />
      <FlowImportModal open={importModal} onClose={() => setImportModal(false)} />

      {/* ══ CABEÇALHO CORPORATIVO (padrão Announcements) ════════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 1, sm: 1.2 },
        pb: { xs: 0.8, sm: 1 },
        position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Decorações */}
        <Box sx={{
          position: "absolute", top: -40, right: -40,
          width: { xs: 140, md: 200 }, height: { xs: 140, md: 200 },
          borderRadius: "50%",
          background: p.isDark ? alpha(p.primary, 0.08) : alpha("#fff", 0.08),
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", bottom: -30, left: "35%",
          width: 120, height: 120, borderRadius: "50%",
          background: p.isDark ? alpha("#0ea5e9", 0.06) : alpha("#fff", 0.06),
          pointerEvents: "none",
        }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
          {/* Título */}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.25 }}>
              <Typography sx={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
              }}>
                Automação
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
              <Typography sx={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                Flow Builder
              </Typography>
            </Stack>

            <Typography sx={{
              fontSize: { xs: 16, sm: 19 }, fontWeight: 800,
              letterSpacing: "-0.02em", lineHeight: 1.15,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              Desenhe seu fluxo
            </Typography>

            <Typography sx={{
              fontSize: 12, mt: 0.25,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Construa e organize seu atendimento com blocos e conexões.
            </Typography>

            {/* Tags de status */}
            <Stack direction="row" spacing={0.8} sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.6 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 7 }} />, label: "Editando agora" },
                { icon: <Save sx={{ fontSize: 11 }} />,             label: `${nodes.length} nós` },
              ].map((tag, i) => (
                <Box key={i} sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.6,
                  px: 1, py: 0.25, borderRadius: "20px",
                  backgroundColor: p.isDark ? alpha(p.primary, 0.14) : alpha("#fff", 0.15),
                  border: `1px solid ${p.isDark ? alpha(p.primary, 0.22) : alpha("#fff", 0.22)}`,
                  backdropFilter: "blur(8px)",
                }}>
                  <Box sx={{ color: p.isDark ? p.primary : "#fff", display: "flex" }}>{tag.icon}</Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: p.isDark ? alpha("#fff", 0.8) : "#fff" }}>
                    {tag.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Botões de ação */}
          <Stack direction="row" spacing={1} sx={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
            <HeaderBtn
              variant="outlined"
              startIcon={<UploadFile sx={{ fontSize: 16 }} />}
              onClick={() => setImportModal(true)}
              p={p}
              sx={{ borderColor: p.isDark ? alpha("#fff", 0.25) : alpha("#fff", 0.5), color: p.isDark ? p.textPrimary : "#fff" }}
            >
              Importar
            </HeaderBtn>
            <HeaderBtn
              variant="outlined"
              startIcon={<GetApp sx={{ fontSize: 16 }} />}
              onClick={() => exportFlow(id)}
              p={p}
            >
              Exportar
            </HeaderBtn>
            <HeaderBtn
              startIcon={<Save sx={{ fontSize: 16 }} />}
              onClick={saveFlow}
              p={p}
            >
              Salvar
            </HeaderBtn>
          </Stack>
        </Stack>
      </Box>

      {/* ══ WORKSPACE ════════════════════════════════════════════════════════ */}
      {!loading && (
        <Box sx={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

          {/* ── SIDEBAR ── */}
          <Box
            className="fb-animate"
            sx={{
              width: 220,
              flexShrink: 0,
              backgroundColor: p.sidebarBg,
              borderRight: `1px solid ${p.sidebarBorder}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "background-color 0.3s ease",
            }}
          >
            {/* Search */}
            <Box sx={{ p: "12px 12px 8px" }}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 1.2, height: 36, borderRadius: "9px",
                backgroundColor: p.inputBg,
                border: `1px solid ${p.inputBorder}`,
                transition: "border-color 0.18s",
                "&:focus-within": { borderColor: p.primary },
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.textMuted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Box
                  component="input"
                  placeholder="Procurar bloco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    fontSize: 12.5, color: p.textPrimary, fontFamily: "'DM Sans', sans-serif",
                    "::placeholder": { color: p.textMuted },
                  }}
                />
              </Box>
            </Box>

            {/* Sections */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 2,
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": { background: alpha(p.textMuted, 0.3), borderRadius: 4 },
            }}>
              {filteredSections.map((section) => (
                <Box key={section.title} sx={{ mb: 1.5 }}>
                  {/* Section title */}
                  <Typography sx={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em",
                    textTransform: "uppercase", color: p.textMuted,
                    px: 0.5, mb: 0.6, mt: 0.4,
                  }}>
                    {section.title}
                  </Typography>

                  {/* Items grid */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
                    {section.items.map((action) => (
                      <Box
                        key={action.name}
                        component="button"
                        disabled={action.disabled}
                        onClick={() => !action.disabled && clickActions(action.type)}
                        sx={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          gap: 0.5, p: "8px 6px", borderRadius: "10px",
                          border: `1px solid ${p.border}`,
                          backgroundColor: p.chipBg,
                          cursor: action.disabled ? "not-allowed" : "pointer",
                          opacity: action.disabled ? 0.45 : 1,
                          transition: "all 0.16s",
                          "&:hover:not(:disabled)": {
                            backgroundColor: p.chipHover,
                            borderColor: alpha(p.primary, 0.35),
                            transform: "translateY(-1px)",
                            boxShadow: `0 3px 10px ${alpha(p.primary, 0.12)}`,
                          },
                          "&:active:not(:disabled)": { transform: "translateY(0)" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26 }}>
                          {action.icon}
                        </Box>
                        <Typography sx={{
                          fontSize: 10.5, fontWeight: 600, color: p.textSecond,
                          lineHeight: 1, textAlign: "center",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {action.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── CANVAS ── */}
          <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDoubleClick={doubleClick}
              onNodeClick={clickNode}
              onEdgeClick={clickEdge}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              connectionLineStyle={connectionLineStyle}
              defaultEdgeOptions={{ animated: true, className: "edge-line" }}
              style={{ width: "100%", height: "100%", backgroundColor: p.canvasBg }}
            >
              <Controls style={{
                borderRadius: 10, overflow: "hidden",
                border: `1px solid ${p.border}`,
                boxShadow: `0 4px 16px ${alpha("#000", p.isDark ? 0.35 : 0.1)}`,
              }} />
              <MiniMap
                style={{
                  borderRadius: 10,
                  border: `1px solid ${p.border}`,
                  backgroundColor: p.surfaceBg,
                  boxShadow: `0 4px 16px ${alpha("#000", p.isDark ? 0.35 : 0.1)}`,
                }}
                maskColor={alpha(p.pageBg, 0.6)}
              />
              <Background variant="dots" gap={16} size={1} color={p.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"} />
            </ReactFlow>
          </Box>
        </Box>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={{ flex: 1, gap: 2 }}
        >
          <Box sx={{
            width: 56, height: 56, borderRadius: "16px",
            backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.08),
            border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CircularProgress size={26} thickness={4} sx={{ color: p.primary }} />
          </Box>
          <Typography sx={{
            fontSize: 13, fontWeight: 600, color: p.textMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Carregando fluxo...
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};