import React, { useState, useEffect, useRef, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { isNil } from "lodash";
import moment from "moment";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Dialog           from "@material-ui/core/Dialog";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import DialogActions    from "@material-ui/core/DialogActions";
import Button           from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl      from "@material-ui/core/FormControl";
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import Select           from "@material-ui/core/Select";
import TextField        from "@material-ui/core/TextField";
import Switch           from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid             from "@material-ui/core/Grid";
import Tab              from "@material-ui/core/Tab";
import Tabs             from "@material-ui/core/Tabs";
import Paper            from "@material-ui/core/Paper";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";
import IconButton       from "@material-ui/core/IconButton";
import Tooltip          from "@material-ui/core/Tooltip";

import CloseIcon          from "@material-ui/icons/Close";
import WhatsAppIcon       from "@material-ui/icons/WhatsApp";
import SettingsIcon       from "@material-ui/icons/Settings";
import MessageIcon        from "@material-ui/icons/Message";
import ExtensionIcon      from "@material-ui/icons/Extension";
import StarIcon           from "@material-ui/icons/Star";
import AccountTreeIcon    from "@material-ui/icons/AccountTree";
import ScheduleIcon       from "@material-ui/icons/Schedule";
import DeleteOutlineIcon  from "@material-ui/icons/DeleteOutline";
import AttachFileIcon     from "@material-ui/icons/AttachFile";
import { Autorenew, FileCopy } from "@material-ui/icons";

import api                from "../../services/api";
import { i18n }           from "../../translate/i18n";
import toastError         from "../../errors/toastError";
import QueueSelect        from "../QueueSelect";
import TabPanel           from "../TabPanel";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import SchedulesForm      from "../SchedulesForm";
import usePlans           from "../../hooks/usePlans";
import { AuthContext }    from "../../context/Auth/AuthContext";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500&display=swap');
    .wam-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .wam-root ::-webkit-scrollbar { width: 4px; }
    .wam-root ::-webkit-scrollbar-track { background: transparent; }
    .wam-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    /* Section card */
    .wam-card {
      border-radius: 12px;
      border: 1px solid var(--wam-border);
      background: var(--wam-card-bg);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .wam-card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px;
      border-bottom: 1px solid var(--wam-border);
      background: var(--wam-card-head);
    }
    .wam-card-icon {
      width: 24px; height: 24px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .wam-card-body { padding: 14px; }

    /* Token row */
    .wam-token-row {
      display: flex; align-items: center; gap: 6px;
      background: var(--wam-token-bg);
      border: 1px solid var(--wam-border);
      border-radius: 9px;
      padding: 4px 6px 4px 12px;
    }
    .wam-token-code {
      flex: 1; font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem; color: var(--wam-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Attach chip */
    .wam-attach {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 7px;
      border: 1px solid rgba(239,68,68,0.3);
      background: rgba(239,68,68,0.06);
      font-size: 0.74rem; color: #ef4444; font-weight: 600;
      cursor: pointer; max-width: 220px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .wam-attach:hover { background: rgba(239,68,68,0.12); }

    /* Info callout */
    .wam-info {
      padding: 8px 12px; border-radius: 8px;
      background: var(--wam-info-bg);
      border: 1px solid var(--wam-info-border);
      font-size: 0.74rem; color: var(--wam-muted);
      line-height: 1.5; margin-bottom: 10px;
    }

    /* Switch label helper */
    .wam-switch-label .MuiFormControlLabel-label { font-size: 0.80rem !important; font-weight: 500 !important; }

    /* Inline switches row */
    .wam-switches { display: flex; flex-wrap: wrap; gap: 2px 12px; margin-bottom: 10px; }
  `}</style>
);

const SessionSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
});

const DATE_TIME_LOCAL_FORMAT  = "YYYY-MM-DDTHH:mm";
const DATE_TIME_PARSE_FORMATS = [DATE_TIME_LOCAL_FORMAT, "YYYY-MM-DD HH:mm:ss.SSS Z", "YYYY-MM-DD HH:mm:ss Z", moment.ISO_8601];
const toDateTimeLocal = (value) => {
  if (isNil(value) || value === "") return "";
  const parsed = moment.parseZone(value, DATE_TIME_PARSE_FORMATS, true);
  return parsed.isValid() ? parsed.format(DATE_TIME_LOCAL_FORMAT) : "";
};

/* ─── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg     = isDark ? "#0f1929" : "#f4f7fb";
  const cardBg        = isDark ? "#131e2e" : "#ffffff";
  const headerBg      = isDark ? "#0b1520" : "#f8fafc";
  const cardHead      = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const border        = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const cardBorder    = isDark ? "rgba(255,255,255,0.07)" : "#e8eef5";
  const textPrimary   = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond    = isDark ? "#8fa4be" : "#3d5166";
  const textMuted     = isDark ? "#4d6478" : "#8fa0b0";
  const tokenBg       = isDark ? "rgba(255,255,255,0.03)" : "#f1f5f9";
  const infoBg        = isDark ? "rgba(37,99,235,0.07)" : "rgba(37,99,235,0.04)";
  const infoBorder    = alpha(primary, 0.15);

  return {
    dialogPaper: {
      borderRadius: 18,
      border: `1px solid ${border}`,
      backgroundColor: surfaceBg,
      backgroundImage: "none",
      boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.55)" : "0 24px 60px rgba(15,23,42,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: "92vh",
      "--wam-border":      cardBorder,
      "--wam-card-bg":     cardBg,
      "--wam-card-head":   cardHead,
      "--wam-muted":       textMuted,
      "--wam-token-bg":    tokenBg,
      "--wam-info-bg":     infoBg,
      "--wam-info-border": infoBorder,
    },

    /* ── Header ── */
    dialogTitle: { padding: 0, "& > *": { padding: 0 }, flexShrink: 0 },
    titleBar: {
      backgroundColor: headerBg,
      borderBottom: `1px solid ${border}`,
      padding: theme.spacing(2, 3),
    },
    titleIcon: {
      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
      backgroundColor: alpha(primary, isDark ? 0.15 : 0.08),
      border: `1.5px solid ${alpha(primary, isDark ? 0.25 : 0.15)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: primary,
    },
    titleText: { fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1, color: textPrimary },
    titleSub:  { fontSize: 11, marginTop: 3, color: textMuted },
    closeButton: {
      width: 30, height: 30, borderRadius: 8, padding: 0,
      border: `1px solid ${border}`, backgroundColor: "transparent", color: textMuted,
      transition: "all 0.16s",
      "&:hover": { borderColor: alpha("#ef4444", 0.40), color: "#ef4444", backgroundColor: alpha("#ef4444", isDark ? 0.10 : 0.05) },
    },

    /* ── Tabs ── */
    tabsWrap: { backgroundColor: surfaceBg, borderBottom: `1px solid ${border}`, flexShrink: 0 },
    tabsRoot: { minHeight: 40, padding: theme.spacing(0, 2) },
    tabRoot: {
      minHeight: 40, fontSize: "0.78rem", fontWeight: 600,
      textTransform: "none", letterSpacing: 0, color: textMuted,
      "&.Mui-selected": { color: primary, fontWeight: 700 },
    },

    /* ── Content ── */
    dialogContent: {
      padding: theme.spacing(2, 2.5),
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${border}`,
      overflowY: "auto", flex: "1 1 auto", minHeight: 0,
    },

    /* ── Card icon color variants ── */
    iconBlue:   { backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" },
    iconGreen:  { backgroundColor: alpha("#059669", isDark ? 0.15 : 0.08), color: "#059669" },
    iconPurple: { backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" },
    iconAmber:  { backgroundColor: alpha("#d97706", isDark ? 0.15 : 0.08), color: "#d97706" },
    iconCyan:   { backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" },

    /* ── Card title/sub ── */
    cardTitle: { fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2, color: textPrimary },
    cardSub:   { fontSize: "0.68rem", color: textMuted, marginTop: 1 },

    /* ── Fields ── */
    textField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 9,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.10)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.20)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.82rem" },
      "& .MuiInputBase-input": { fontSize: "0.83rem", color: textPrimary },
      "& .MuiFormHelperText-root": { fontSize: "0.70rem", color: textMuted },
      "& .MuiInputBase-inputMultiline": {
        fontFamily: "'JetBrains Mono', monospace !important",
        fontSize: "0.80rem", lineHeight: 1.6,
      },
    },
    formControl: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 9,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.10)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.20)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.82rem" },
      "& .MuiSelect-root": { fontSize: "0.83rem", color: textPrimary },
    },

    /* ── Token action btn ── */
    tokenBtn: {
      width: 28, height: 28, minWidth: "unset", borderRadius: 7, padding: 0,
      border: `1px solid ${border}`, backgroundColor: "transparent", color: textMuted,
      transition: "all 0.15s",
      "&:hover": { borderColor: alpha(primary, 0.4), color: primary, backgroundColor: alpha(primary, 0.05) },
    },

    /* ── Alert text ── */
    alertText: { fontSize: "0.72rem", color: "#ef4444", lineHeight: 1.4 },

    /* ── Schedules paper ── */
    schedulesPaper: { padding: theme.spacing(2), backgroundColor: surfaceBg, boxShadow: "none" },

    /* ── Actions ── */
    dialogActions: {
      padding: theme.spacing(1.5, 2.5, 2),
      backgroundColor: isDark ? alpha("#000", 0.10) : "#f8fafc",
      borderTop: `1px solid ${border}`,
      gap: 8, display: "flex", justifyContent: "flex-end", flexShrink: 0,
    },
    cancelButton: {
      borderRadius: 9, textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
      borderColor: border, color: textSecond,
      "&:hover": { borderColor: textSecond, backgroundColor: alpha(textSecond, isDark ? 0.07 : 0.04) },
    },
    btnWrapper: { position: "relative" },
    submitButton: {
      borderRadius: 9, textTransform: "none", fontWeight: 700, fontSize: "0.82rem", color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      "&:hover": { boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}` },
    },
    buttonProgress: { color: "#fff", position: "absolute", top: "50%", left: "50%", marginTop: -12, marginLeft: -12 },
  };
});

/* ── Reusable Card ───────────────────────────────────────────────────────── */
const Card = ({ icon, iconClass, title, subtitle, children }) => (
  <div className="wam-card">
    <div className="wam-card-header">
      <div className={`wam-card-icon ${iconClass}`}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="wam-card-body">{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const inputFileRef = useRef(null);

  const initialState = {
    name: "", greetingMessage: "", complationMessage: "", outOfHoursMessage: "",
    ratingMessage: "", isDefault: false, token: "", maxUseBotQueues: 3,
    provider: "beta", expiresTicket: 0, allowGroup: false, enableImportMessage: false,
    groupAsTicket: "disabled", timeUseBotQueues: "0", timeSendQueue: "0", sendIdQueue: 0,
    expiresTicketNPS: "0", expiresInactiveMessage: "", timeInactiveMessage: "",
    inactiveMessage: "", maxUseBotQueuesNPS: 3, whenExpiresTicket: 0,
    timeCreateNewTicket: 0, greetingMediaAttachment: "", importRecentMessages: "",
    importOldMessages: "", importOldMessagesGroups: false, integrationId: "",
    collectiveVacationEnd: "", collectiveVacationStart: "", collectiveVacationMessage: "",
    queueIdImportMessages: null,
  };

  const [whatsApp, setWhatsApp]                             = useState(initialState);
  const [autoToken, setAutoToken]                           = useState("");
  const [attachment, setAttachment]                         = useState(null);
  const [attachmentName, setAttachmentName]                 = useState("");
  const [selectedQueueIds, setSelectedQueueIds]             = useState([]);
  const [queues, setQueues]                                 = useState([]);
  const [tab, setTab]                                       = useState("general");
  const [enableImportMessage, setEnableImportMessage]       = useState(false);
  const [importOldMessagesGroups, setImportOldMessagesGroups] = useState(false);
  const [closedTicketsPostImported, setClosedTicketsPostImported] = useState(false);
  const [importOldMessages, setImportOldMessages]           = useState(moment().add(-1, "days").format("YYYY-MM-DDTHH:mm"));
  const [importRecentMessages, setImportRecentMessages]     = useState(moment().add(-1, "minutes").format("YYYY-MM-DDTHH:mm"));
  const [copied, setCopied]                                 = useState(false);
  const [schedulesEnabled, setSchedulesEnabled]             = useState(false);
  const [NPSEnabled, setNPSEnabled]                         = useState(false);
  const [showOpenAi, setShowOpenAi]                         = useState(false);
  const [showIntegrations, setShowIntegrations]             = useState(false);
  const { user }                                            = useContext(AuthContext);
  const [schedules, setSchedules]                           = useState([
    { weekday: i18n.t("queueModal.serviceHours.monday"),    weekdayEn: "monday",    startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.tuesday"),   weekdayEn: "tuesday",   startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.wednesday"), weekdayEn: "wednesday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.thursday"),  weekdayEn: "thursday",  startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.friday"),    weekdayEn: "friday",    startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: "Sábado",  weekdayEn: "saturday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: "Domingo", weekdayEn: "sunday",   startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
  ]);

  const { get: getSetting }  = useCompanySettings();
  const { getPlanCompany }   = usePlans();
  const [selectedPrompt, setSelectedPrompt]           = useState(null);
  const [prompts, setPrompts]                         = useState([]);
  const [webhooks, setWebhooks]                       = useState([]);
  const [flowIdNotPhrase, setFlowIdNotPhrase]         = useState();
  const [flowIdWelcome, setFlowIdWelcome]             = useState();
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [integrations, setIntegrations]               = useState([]);

  const generateRandomCode = (n) => {
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join("");
  };

  useEffect(() => { setAutoToken(whatsApp.token || generateRandomCode(30)); }, [whatsAppId, whatsApp.token]);

  useEffect(() => {
    (async () => {
      const companyId = user.companyId;
      const p = await getPlanCompany(undefined, companyId);
      setShowOpenAi(p.plan.useOpenAi);
      setShowIntegrations(p.plan.useIntegrations);
    })();
  }, []);

  useEffect(() => {
    (async () => { try { const { data } = await api.get("/prompt"); setPrompts(data.prompts); } catch (e) { toastError(e); } })();
  }, [whatsAppId]);

  useEffect(() => {
    (async () => {
      const s = await getSetting({ column: "scheduleType" }); setSchedulesEnabled(s.scheduleType === "connection");
      const n = await getSetting({ column: "userRating" });    setNPSEnabled(n.userRating === "enabled");
    })();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;
      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}?session=0`);
        if (data?.flowIdNotPhrase) { const { data: f } = await api.get(`flowbuilder/${data.flowIdNotPhrase}`); setFlowIdNotPhrase(f?.flow.id); }
        if (data?.flowIdWelcome)   { const { data: f } = await api.get(`flowbuilder/${data.flowIdWelcome}`);   setFlowIdWelcome(f?.flow.id); }
        setWhatsApp({ ...initialState, ...data, isDefault: Boolean(data?.isDefault), allowGroup: Boolean(data?.allowGroup) });
        setAttachmentName(data.greetingMediaAttachment);
        setAutoToken(data.token);
        setSelectedIntegration(data?.integrationId);
        data.promptId ? setSelectedPrompt(data.promptId) : setSelectedPrompt(null);
        setSelectedQueueIds(data.queues?.map((q) => q.id));
        setSchedules(data.schedules);
        if (!isNil(data?.importOldMessages)) {
          setEnableImportMessage(true);
          setImportOldMessages(toDateTimeLocal(data?.importOldMessages) || moment().add(-1, "days").format(DATE_TIME_LOCAL_FORMAT));
          setImportRecentMessages(toDateTimeLocal(data?.importRecentMessages) || moment().add(-1, "minutes").format(DATE_TIME_LOCAL_FORMAT));
          setClosedTicketsPostImported(Boolean(data?.closedTicketsPostImported));
          setImportOldMessagesGroups(Boolean(data?.importOldMessagesGroups));
        }
      } catch (err) { toastError(err); }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => { (async () => { try { const { data } = await api.get("/queue");             setQueues(data); }                            catch (e) { toastError(e); } })(); }, []);
  useEffect(() => { (async () => { try { const { data } = await api.get("/queueIntegration");  setIntegrations(data.queueIntegrations); }    catch (e) { toastError(e); } })(); }, []);
  useEffect(() => { (async () => { try { const { data } = await api.get("/flowbuilder");       setWebhooks(data.flows); }                    catch (e) { toastError(e); } })(); }, []);

  const handleChangeQueue       = (e) => { setSelectedQueueIds(e); setSelectedPrompt(null); setSelectedIntegration(null); };
  const handleChangeIntegration = (e) => { setSelectedIntegration(e.target.value); setSelectedPrompt(null); setSelectedQueueIds([]); };
  const handleChangePrompt      = (e) => { setSelectedPrompt(e.target.value); setSelectedQueueIds([]); setSelectedIntegration(null); };

  const handleSaveWhatsApp = async (values) => {
    if (!whatsAppId) setAutoToken(generateRandomCode(30));
    if (NPSEnabled) {
      if (isNil(values.ratingMessage)) { toastError(i18n.t("whatsappModal.errorRatingMessage")); return; }
      if (values.expiresTicketNPS === "0" && values.expiresTicketNPS === "") { toastError(i18n.t("whatsappModal.errorExpiresNPS")); return; }
    }
    if (values.timeSendQueue === "") values.timeSendQueue = "0";
    if ((values.sendIdQueue === 0 || values.sendIdQueue === "" || isNil(values.sendIdQueue)) && (values.timeSendQueue !== 0 && values.timeSendQueue !== "0")) {
      toastError(i18n.t("whatsappModal.errorSendQueue")); return;
    }
    const whatsappData = {
      ...values,
      flowIdWelcome: flowIdWelcome || null, flowIdNotPhrase: flowIdNotPhrase || null,
      integrationId: selectedIntegration || null, queueIds: selectedQueueIds,
      importOldMessages: enableImportMessage ? importOldMessages : null,
      importRecentMessages: enableImportMessage ? importRecentMessages : null,
      importOldMessagesGroups: importOldMessagesGroups || null,
      closedTicketsPostImported: closedTicketsPostImported || null,
      token: autoToken || null, schedules, promptId: selectedPrompt || null,
    };
    delete whatsappData["queues"];
    delete whatsappData["session"];
    try {
      if (whatsAppId) {
        if (enableImportMessage && whatsApp?.status === "CONNECTED") {
          try { setWhatsApp({ ...whatsApp, status: "qrcode" }); await api.delete(`/whatsappsession/${whatsApp.id}`); } catch (err) { toastError(err); }
        }
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
        if (attachment) { const fd = new FormData(); fd.append("file", attachment); await api.post(`/whatsapp/${whatsAppId}/media-upload`, fd); }
        if (!attachmentName && whatsApp.greetingMediaAttachment !== null) await api.delete(`/whatsapp/${whatsAppId}/media-upload`);
      } else {
        const { data } = await api.post("/whatsapp", whatsappData);
        if (attachment) { const fd = new FormData(); fd.append("file", attachment); await api.post(`/whatsapp/${data.id}/media-upload`, fd); }
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) { toastError(err); }
  };

  const handleClose = () => {
    onClose(); setWhatsApp(initialState); setEnableImportMessage(false);
    setImportOldMessagesGroups(false); setClosedTicketsPostImported(false);
    setAttachment(null); setAttachmentName(""); setCopied(false);
  };

  const handleSaveSchedules = (v) => { toast.success("Clique em salvar para registar as alterações"); setSchedules(v); };
  const handleFileUpload    = () => { const f = inputFileRef.current.files[0]; setAttachment(f); setAttachmentName(f.name); inputFileRef.current.value = null; };
  const handleDeleFile      = () => { setAttachment(null); setAttachmentName(null); };
  const handleRefreshToken  = () => setAutoToken(generateRandomCode(30));
  const handleCopyToken     = () => { navigator.clipboard.writeText(autoToken); setCopied(true); };

  const tabs = [
    { value: "general",      label: i18n.t("whatsappModal.tabs.general"),      icon: <SettingsIcon style={{ fontSize: 13 }} /> },
    { value: "messages",     label: i18n.t("whatsappModal.tabs.messages"),     icon: <MessageIcon style={{ fontSize: 13 }} /> },
    { value: "integrations", label: i18n.t("whatsappModal.tabs.integrations"), icon: <ExtensionIcon style={{ fontSize: 13 }} /> },
    { value: "chatbot",      label: "Chatbot",                                 icon: <AccountTreeIcon style={{ fontSize: 13 }} /> },
    { value: "nps",          label: i18n.t("whatsappModal.tabs.assessments"),  icon: <StarIcon style={{ fontSize: 13 }} /> },
    ...(showIntegrations ? [{ value: "flowbuilder", label: "Fluxo Padrão", icon: <AccountTreeIcon style={{ fontSize: 13 }} /> }] : []),
    ...(schedulesEnabled  ? [{ value: "schedules",  label: i18n.t("whatsappModal.tabs.schedules"), icon: <ScheduleIcon style={{ fontSize: 13 }} /> }] : []),
  ];

  return (
    <div className="wam-root">
      <FontStyle />
      <Dialog
        open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper"
        PaperProps={{ className: classes.dialogPaper, elevation: 0 }}
        BackdropProps={{ style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" } }}
      >
        {/* ── HEADER ── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}><WhatsAppIcon style={{ fontSize: 17 }} /></Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {whatsAppId ? i18n.t("whatsappModal.title.edit") : i18n.t("whatsappModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>WhatsApp · Configurações da conexão</Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={handleClose} className={classes.closeButton}>
                <CloseIcon style={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Formik
          initialValues={whatsApp} enableReinitialize validationSchema={SessionSchema}
          onSubmit={(values, actions) => { setTimeout(() => { handleSaveWhatsApp(values); actions.setSubmitting(false); }, 400); }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>

              {/* ── TABS ── */}
              <Box className={classes.tabsWrap}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                  indicatorColor="primary" textColor="primary"
                  variant="scrollable" scrollButtons="auto"
                  classes={{ root: classes.tabsRoot }}
                >
                  {tabs.map((t) => <Tab key={t.value} value={t.value} label={t.label} classes={{ root: classes.tabRoot }} />)}
                </Tabs>
              </Box>

              <DialogContent className={classes.dialogContent}>

                {/* ════ GERAL ════ */}
                <TabPanel value={tab} name="general">
                  <Grid container spacing={1}>

                    {/* Esquerda: Identificação + Token */}
                    <Grid item xs={12} md={7}>
                      <Card icon={<WhatsAppIcon style={{ fontSize: 13 }} />} iconClass={classes.iconGreen}
                        title="Identificação" subtitle="Nome da conexão e configurações gerais">
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Field as={TextField}
                              label={i18n.t("whatsappModal.form.name")} autoFocus name="name"
                              error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name}
                              variant="outlined" size="small" fullWidth className={classes.textField}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                              <InputLabel id="groupAsTicket-label">{i18n.t("whatsappModal.form.groupAsTicket")}</InputLabel>
                              <Field as={Select} label={i18n.t("whatsappModal.form.groupAsTicket")} labelId="groupAsTicket-label" name="groupAsTicket">
                                <MenuItem value="disabled">{i18n.t("whatsappModal.menuItem.disabled")}</MenuItem>
                                <MenuItem value="enabled">{i18n.t("whatsappModal.menuItem.enabled")}</MenuItem>
                              </Field>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <Box style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              <FormControlLabel className="wam-switch-label"
                                control={<Field as={Switch} color="primary" name="isDefault" checked={Boolean(values.isDefault)} />}
                                label={i18n.t("whatsappModal.form.default")}
                              />
                              <FormControlLabel className="wam-switch-label"
                                control={<Field as={Switch} color="primary" name="allowGroup" checked={Boolean(values.allowGroup)} />}
                                label={i18n.t("whatsappModal.form.group")}
                              />
                            </Box>
                          </Grid>
                          {/* Attachment */}
                          <Grid item xs={12}>
                            <Box style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <input type="file" accept="video/*,image/*" ref={inputFileRef} style={{ display: "none" }} onChange={handleFileUpload} />
                              <Button variant="outlined" size="small"
                                onClick={() => inputFileRef.current.click()}
                                startIcon={<AttachFileIcon style={{ fontSize: 13 }} />}
                                style={{ borderRadius: 8, textTransform: "none", fontSize: "0.76rem" }}>
                                {i18n.t("userModal.buttons.addImage")}
                              </Button>
                              {attachmentName && (
                                <span className="wam-attach" onClick={handleDeleFile}>
                                  <DeleteOutlineIcon style={{ fontSize: 12, flexShrink: 0 }} />
                                  {attachmentName}
                                </span>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>

                      {/* Token */}
                      <Card icon={<SettingsIcon style={{ fontSize: 13 }} />} iconClass={classes.iconBlue}
                        title="Token de acesso" subtitle="Identificador único da conexão">
                        <div className="wam-token-row">
                          <span className="wam-token-code">{autoToken}</span>
                          <Tooltip title="Gerar novo token">
                            <Button onClick={handleRefreshToken} disabled={isSubmitting} className={classes.tokenBtn} variant="text">
                              <Autorenew style={{ fontSize: 15, color: "#22c55e" }} />
                            </Button>
                          </Tooltip>
                          <Tooltip title={copied ? "Copiado!" : "Copiar token"}>
                            <Button onClick={handleCopyToken} className={classes.tokenBtn} variant="text">
                              <FileCopy style={{ fontSize: 15, color: copied ? "#2563eb" : "inherit" }} />
                            </Button>
                          </Tooltip>
                        </div>
                      </Card>
                    </Grid>

                    {/* Direita: Redirecionamento + Importação */}
                    <Grid item xs={12} md={5}>
                      <Card icon={<AccountTreeIcon style={{ fontSize: 13 }} />} iconClass={classes.iconPurple}
                        title={i18n.t("whatsappModal.form.queueRedirection")}
                        subtitle={i18n.t("whatsappModal.form.queueRedirectionDesc")}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                              <InputLabel id="sendIdQueue-label">{i18n.t("whatsappModal.form.sendIdQueue")}</InputLabel>
                              <Field as={Select} name="sendIdQueue" value={values.sendIdQueue || "0"}
                                label={i18n.t("whatsappModal.form.sendIdQueue")} labelId="sendIdQueue-label">
                                <MenuItem value={0}>&nbsp;</MenuItem>
                                {queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}
                              </Field>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.timeSendQueue")} fullWidth name="timeSendQueue"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.timeSendQueue && Boolean(errors.timeSendQueue)} helperText={touched.timeSendQueue && errors.timeSendQueue}
                            />
                          </Grid>
                        </Grid>
                      </Card>

                      <Card icon={<MessageIcon style={{ fontSize: 13 }} />} iconClass={classes.iconCyan}
                        title="Importação de mensagens" subtitle="Sincronizar histórico do WhatsApp">
                        <div className="wam-switches">
                          <FormControlLabel className="wam-switch-label"
                            label={i18n.t("whatsappModal.form.importOldMessagesEnable")}
                            control={<Switch size="small" checked={enableImportMessage} onChange={(e) => setEnableImportMessage(e.target.checked)} color="primary" />}
                          />
                          {enableImportMessage && (
                            <>
                              <FormControlLabel className="wam-switch-label"
                                label={i18n.t("whatsappModal.form.importOldMessagesGroups")}
                                control={<Switch size="small" checked={importOldMessagesGroups} onChange={(e) => setImportOldMessagesGroups(e.target.checked)} color="primary" />}
                              />
                              <FormControlLabel className="wam-switch-label"
                                label={i18n.t("whatsappModal.form.closedTicketsPostImported")}
                                control={<Switch size="small" checked={closedTicketsPostImported} onChange={(e) => setClosedTicketsPostImported(e.target.checked)} color="primary" />}
                              />
                            </>
                          )}
                        </div>
                        {enableImportMessage && (
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              <Field fullWidth as={TextField} label={i18n.t("whatsappModal.form.importOldMessages")}
                                type="datetime-local" name="importOldMessages"
                                inputProps={{ max: moment().format(DATE_TIME_LOCAL_FORMAT), min: moment().add(-2, "years").format(DATE_TIME_LOCAL_FORMAT) }}
                                InputLabelProps={{ shrink: true }} variant="outlined" size="small" className={classes.textField}
                                value={toDateTimeLocal(importOldMessages)} onChange={(e) => setImportOldMessages(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Field fullWidth as={TextField} label={i18n.t("whatsappModal.form.importRecentMessages")}
                                type="datetime-local" name="importRecentMessages"
                                inputProps={{ max: moment().format(DATE_TIME_LOCAL_FORMAT), min: toDateTimeLocal(importOldMessages) || moment().add(-2, "years").format(DATE_TIME_LOCAL_FORMAT) }}
                                InputLabelProps={{ shrink: true }} variant="outlined" size="small" className={classes.textField}
                                value={toDateTimeLocal(importRecentMessages)} onChange={(e) => setImportRecentMessages(e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                                <InputLabel id="queueIdImportMessages-label">{i18n.t("whatsappModal.form.queueIdImportMessages")}</InputLabel>
                                <Field as={Select} name="queueIdImportMessages" value={values.queueIdImportMessages || "0"}
                                  label={i18n.t("whatsappModal.form.queueIdImportMessages")} labelId="queueIdImportMessages-label">
                                  <MenuItem value={0}>&nbsp;</MenuItem>
                                  {queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}
                                </Field>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography className={classes.alertText}>{i18n.t("whatsappModal.form.importAlert")}</Typography>
                            </Grid>
                          </Grid>
                        )}
                      </Card>
                    </Grid>

                  </Grid>
                </TabPanel>

                {/* ════ MENSAGENS ════ */}
                <TabPanel value={tab} name="messages">
                  <Grid container spacing={1}>
                    {/* Coluna esquerda: saudação + conclusão */}
                    <Grid item xs={12} md={6}>
                      <Card icon={<MessageIcon style={{ fontSize: 13 }} />} iconClass={classes.iconBlue}
                        title="Início e encerramento" subtitle="Mensagens enviadas ao abrir e fechar atendimentos">
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.greetingMessage")} name="greetingMessage"
                              multiline minRows={3} fullWidth variant="outlined" size="small" className={classes.textField}
                              error={touched.greetingMessage && Boolean(errors.greetingMessage)} helperText={touched.greetingMessage && errors.greetingMessage}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.complationMessage")} name="complationMessage"
                              multiline minRows={3} fullWidth variant="outlined" size="small" className={classes.textField}
                              error={touched.complationMessage && Boolean(errors.complationMessage)} helperText={touched.complationMessage && errors.complationMessage}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                    {/* Coluna direita: fora do horário + férias */}
                    <Grid item xs={12} md={6}>
                      <Card icon={<ScheduleIcon style={{ fontSize: 13 }} />} iconClass={classes.iconAmber}
                        title="Fora do horário e férias" subtitle="Mensagens automáticas em períodos sem atendimento">
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.outOfHoursMessage")} name="outOfHoursMessage"
                              multiline minRows={3} fullWidth variant="outlined" size="small" className={classes.textField}
                              error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)} helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.collectiveVacationMessage")} name="collectiveVacationMessage"
                              multiline minRows={3} fullWidth variant="outlined" size="small" className={classes.textField}
                              error={touched.collectiveVacationMessage && Boolean(errors.collectiveVacationMessage)} helperText={touched.collectiveVacationMessage && errors.collectiveVacationMessage}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Field fullWidth as={TextField} label={i18n.t("whatsappModal.form.collectiveVacationStart")} type="date" name="collectiveVacationStart"
                              required={values.collectiveVacationMessage?.length > 0}
                              inputProps={{ min: moment().add(-10, "days").format("YYYY-MM-DD") }}
                              InputLabelProps={{ shrink: true }} variant="outlined" size="small" className={classes.textField}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Field fullWidth as={TextField} label={i18n.t("whatsappModal.form.collectiveVacationEnd")} type="date" name="collectiveVacationEnd"
                              required={values.collectiveVacationMessage?.length > 0}
                              inputProps={{ min: moment().add(-10, "days").format("YYYY-MM-DD") }}
                              InputLabelProps={{ shrink: true }} variant="outlined" size="small" className={classes.textField}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* ════ INTEGRAÇÕES ════ */}
                <TabPanel value={tab} name="integrations">
                  <Card icon={<ExtensionIcon style={{ fontSize: 13 }} />} iconClass={classes.iconPurple}
                    title="Filas & Integrações" subtitle="Vincule filas, prompts de IA e integrações externas">
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <QueueSelect selectedQueueIds={selectedQueueIds} onChange={handleChangeQueue} />
                      </Grid>
                      {showIntegrations && (
                        <Grid item xs={12} md={6}>
                          <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                            <InputLabel id="integrationId-label">{i18n.t("queueModal.form.integrationId")}</InputLabel>
                            <Select label={i18n.t("queueModal.form.integrationId")} name="integrationId"
                              value={selectedIntegration || ""} onChange={handleChangeIntegration} labelId="integrationId-label">
                              <MenuItem value={null}>Desabilitado</MenuItem>
                              {integrations.map((i) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                      {showOpenAi && (
                        <Grid item xs={12} md={6}>
                          <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                            <InputLabel>{i18n.t("whatsappModal.form.prompt")}</InputLabel>
                            <Select label={i18n.t("whatsappModal.form.prompt")} value={selectedPrompt || ""} onChange={handleChangePrompt}
                              MenuProps={{ anchorOrigin: { vertical: "bottom", horizontal: "left" }, transformOrigin: { vertical: "top", horizontal: "left" }, getContentAnchorEl: null }}>
                              {prompts.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Card>
                </TabPanel>

                {/* ════ CHATBOT ════ */}
                <TabPanel value={tab} name="chatbot">
                  <Grid container spacing={1}>
                    {/* Coluna esquerda: timings */}
                    <Grid item xs={12} md={6}>
                      <Card icon={<AccountTreeIcon style={{ fontSize: 13 }} />} iconClass={classes.iconPurple}
                        title="Tempos do chatbot" subtitle="Limites de uso e intervalos de resposta">
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.timeCreateNewTicket")} fullWidth name="timeCreateNewTicket"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.timeCreateNewTicket && Boolean(errors.timeCreateNewTicket)} helperText={touched.timeCreateNewTicket && errors.timeCreateNewTicket}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.maxUseBotQueues")} fullWidth name="maxUseBotQueues"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.maxUseBotQueues && Boolean(errors.maxUseBotQueues)} helperText={touched.maxUseBotQueues && errors.maxUseBotQueues}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.timeUseBotQueues")} fullWidth name="timeUseBotQueues"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.timeUseBotQueues && Boolean(errors.timeUseBotQueues)} helperText={touched.timeUseBotQueues && errors.timeUseBotQueues}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                    {/* Coluna direita: inatividade */}
                    <Grid item xs={12} md={6}>
                      <Card icon={<ScheduleIcon style={{ fontSize: 13 }} />} iconClass={classes.iconAmber}
                        title="Encerramento por inatividade" subtitle="Expiração e mensagens de aviso ao cliente">
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.expiresTicket")} fullWidth name="expiresTicket"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.expiresTicket && Boolean(errors.expiresTicket)} helperText={touched.expiresTicket && errors.expiresTicket}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                              <InputLabel id="whenExpiresTicket-label">{i18n.t("whatsappModal.form.whenExpiresTicket")}</InputLabel>
                              <Field as={Select} label={i18n.t("whatsappModal.form.whenExpiresTicket")} labelId="whenExpiresTicket-label" name="whenExpiresTicket">
                                <MenuItem value="0">{i18n.t("whatsappModal.form.closeLastMessageOptions1")}</MenuItem>
                                <MenuItem value="1">{i18n.t("whatsappModal.form.closeLastMessageOptions2")}</MenuItem>
                              </Field>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.timeInactiveMessage")} fullWidth name="timeInactiveMessage"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.timeInactiveMessage && Boolean(errors.timeInactiveMessage)} helperText={touched.timeInactiveMessage && errors.timeInactiveMessage}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.expiresInactiveMessage")} multiline minRows={2} fullWidth name="expiresInactiveMessage"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.expiresInactiveMessage && Boolean(errors.expiresInactiveMessage)} helperText={touched.expiresInactiveMessage && errors.expiresInactiveMessage}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Field as={TextField} label={i18n.t("whatsappModal.form.inactiveMessage")} multiline minRows={2} fullWidth name="inactiveMessage"
                              variant="outlined" size="small" className={classes.textField}
                              error={touched.inactiveMessage && Boolean(errors.inactiveMessage)} helperText={touched.inactiveMessage && errors.inactiveMessage}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* ════ NPS ════ */}
                <TabPanel value={tab} name="nps">
                  <Card icon={<StarIcon style={{ fontSize: 13 }} />} iconClass={classes.iconAmber}
                    title="Avaliações (NPS)" subtitle="Mensagem e limites de disparo da pesquisa de satisfação">
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Field as={TextField} label={i18n.t("whatsappModal.form.ratingMessage")} multiline minRows={4} fullWidth name="ratingMessage"
                          variant="outlined" size="small" className={classes.textField}
                          error={touched.ratingMessage && Boolean(errors.ratingMessage)} helperText={touched.ratingMessage && errors.ratingMessage}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field as={TextField} label={i18n.t("whatsappModal.form.maxUseBotQueuesNPS")} fullWidth name="maxUseBotQueuesNPS"
                          variant="outlined" size="small" className={classes.textField}
                          error={touched.maxUseBotQueuesNPS && Boolean(errors.maxUseBotQueuesNPS)} helperText={touched.maxUseBotQueuesNPS && errors.maxUseBotQueuesNPS}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field as={TextField} label={i18n.t("whatsappModal.form.expiresTicketNPS")} fullWidth name="expiresTicketNPS"
                          variant="outlined" size="small" className={classes.textField}
                          error={touched.expiresTicketNPS && Boolean(errors.expiresTicketNPS)} helperText={touched.expiresTicketNPS && errors.expiresTicketNPS}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </TabPanel>

                {/* ════ FLUXO PADRÃO ════ */}
                {showIntegrations && (
                  <TabPanel value={tab} name="flowbuilder">
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <Card icon={<AccountTreeIcon style={{ fontSize: 13 }} />} iconClass={classes.iconGreen}
                          title="Fluxo de boas-vindas" subtitle="Acionado para novos contatos que ainda não estão na lista">
                          <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                            <Select name="flowIdWelcome" value={flowIdWelcome || ""} onChange={(e) => setFlowIdWelcome(e.target.value)} variant="outlined">
                              <MenuItem value={null}>Desabilitado</MenuItem>
                              {webhooks.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card icon={<AccountTreeIcon style={{ fontSize: 13 }} />} iconClass={classes.iconPurple}
                          title="Fluxo de resposta padrão" subtitle="Disparado quando nenhuma palavra-chave é reconhecida">
                          <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                            <Select name="flowNotIdPhrase" value={flowIdNotPhrase || ""} onChange={(e) => setFlowIdNotPhrase(e.target.value)} variant="outlined">
                              <MenuItem value={null}>Desabilitado</MenuItem>
                              {webhooks.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Card>
                      </Grid>
                    </Grid>
                  </TabPanel>
                )}

                {/* ════ HORÁRIOS ════ */}
                <TabPanel value={tab} name="schedules">
                  {tab === "schedules" && (
                    <Paper className={classes.schedulesPaper} elevation={0}>
                      <SchedulesForm loading={false} onSubmit={handleSaveSchedules}
                        initialValues={schedules} labelSaveButton={i18n.t("whatsappModal.buttons.okAdd")}
                      />
                    </Paper>
                  )}
                </TabPanel>

              </DialogContent>

              {/* ── AÇÕES ── */}
              <DialogActions className={classes.dialogActions}>
                <Button variant="outlined" onClick={handleClose} disabled={isSubmitting} className={classes.cancelButton}>
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting} className={classes.submitButton}>
                    {whatsAppId ? i18n.t("whatsappModal.buttons.okEdit") : i18n.t("whatsappModal.buttons.okAdd")}
                  </Button>
                  {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
              </DialogActions>

            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);