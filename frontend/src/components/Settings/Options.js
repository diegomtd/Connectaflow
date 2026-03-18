import React, { useEffect, useState } from "react";

import Grid from "@material-ui/core/Grid";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

import useSettings from "../../hooks/useSettings";
import { makeStyles, alpha, useTheme } from "@material-ui/core/styles";
import { Tab, Tabs, TextField } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { toast } from "react-toastify";

/* ─── Estilos do Toggle Pill ─────────────────────────────────────────────── */
const TogglePillStyle = () => (
  <style>{`
    .opt-toggle-pill {
      display: inline-flex; align-items: center;
      border-radius: 8px; overflow: hidden;
      border: 1px solid var(--opt-border);
      flex-shrink: 0;
    }
    .opt-toggle-btn {
      padding: 4px 11px;
      font-size: 0.72rem; font-weight: 600;
      cursor: pointer; border: none; outline: none;
      transition: background 0.18s, color 0.18s;
      line-height: 1.5; font-family: inherit;
    }
    .opt-toggle-btn:disabled { cursor: not-allowed; opacity: 0.6; }
    .opt-toggle-btn.active-on  { background: #22c55e; color: #fff; }
    .opt-toggle-btn.active-off { background: rgba(239,68,68,0.13); color: #ef4444; }
    .opt-toggle-btn.inactive   { background: transparent; color: var(--opt-muted, #8fa0b0); }
    .opt-toggle-sep { width: 1px; background: var(--opt-border); align-self: stretch; flex-shrink: 0; }

    .opt-section-card {
      border-radius: 12px;
      border: 1px solid var(--opt-border);
      background: var(--opt-card-bg);
      overflow: hidden;
      margin-bottom: 16px;
    }
    .opt-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--opt-border);
      background: var(--opt-header-bg);
    }
    .opt-section-header-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .opt-section-body { padding: 14px; }

    /* Grid de toggles: 2 colunas em telas médias/grandes */
    .opt-toggle-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0;
    }
    @media (max-width: 600px) {
      .opt-toggle-grid { grid-template-columns: 1fr; }
    }

    .opt-toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 8px;
      border-bottom: 1px solid var(--opt-border);
    }
    /* Remove borda inferior do último item de cada coluna */
    .opt-toggle-row:last-child  { border-bottom: none; }

    /* Separa as duas colunas com uma linha vertical */
    .opt-toggle-grid .opt-toggle-row:nth-child(odd) {
      border-right: 1px solid var(--opt-border);
      padding-right: 14px;
    }
    .opt-toggle-grid .opt-toggle-row:nth-child(even) {
      padding-left: 14px;
    }
    /* Em mobile, remove a borda direita */
    @media (max-width: 600px) {
      .opt-toggle-grid .opt-toggle-row:nth-child(odd) {
        border-right: none;
        padding-right: 8px;
      }
      .opt-toggle-grid .opt-toggle-row:nth-child(even) {
        padding-left: 8px;
      }
    }
  `}</style>
);

/* ── TogglePill ── */
const TogglePill = ({ value, onChange, loading }) => {
  const isOn = value === true || value === "enabled" || value === "enable";
  return (
    <div className="opt-toggle-pill">
      <button
        type="button"
        className={`opt-toggle-btn ${isOn ? "active-on" : "inactive"}`}
        onClick={() => !isOn && !loading && onChange(true)}
        disabled={loading}
      >
        Ativo
      </button>
      <div className="opt-toggle-sep" />
      <button
        type="button"
        className={`opt-toggle-btn ${!isOn ? "active-off" : "inactive"}`}
        onClick={() => isOn && !loading && onChange(false)}
        disabled={loading}
      >
        Inativo
      </button>
    </div>
  );
};

/* ── ToggleRow ── */
const ToggleRow = ({ label, description, value, onChange, loading }) => {
  const theme  = useTheme();
  const isDark = theme.palette.type === "dark";
  return (
    <div className="opt-toggle-row">
      <div style={{ flex: 1, paddingRight: 10 }}>
        <div style={{ fontSize: "0.79rem", fontWeight: 600, color: isDark ? "#e2eaf4" : "#1a2b3c", lineHeight: 1.3 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: "0.69rem", color: isDark ? "#4d6478" : "#8fa0b0", marginTop: 2, lineHeight: 1.4 }}>
            {description}
          </div>
        )}
        {loading && (
          <div style={{ fontSize: "0.67rem", color: "#2563eb", marginTop: 2 }}>
            {i18n.t("settings.settings.options.updating")}
          </div>
        )}
      </div>
      <TogglePill value={value} onChange={onChange} loading={loading} />
    </div>
  );
};

/* ── SectionCard ── */
const SectionCard = ({ icon, iconStyle, title, subtitle, children, grid = false }) => (
  <div className="opt-section-card">
    <div className="opt-section-header">
      <div className="opt-section-header-icon" style={iconStyle}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="opt-section-body">
      {grid ? <div className="opt-toggle-grid">{children}</div> : children}
    </div>
  </div>
);

/* ─── useStyles ──────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const cardBg   = isDark ? "#131e2e" : "#ffffff";
  const headerBg = isDark ? "#0b1520" : "#f8fafc";

  return {
    root: {
      "--opt-border":    isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
      "--opt-card-bg":   cardBg,
      "--opt-header-bg": headerBg,
      "--opt-muted":     textMuted,
    },
    selectContainer: { width: "100%", textAlign: "left" },
    textField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.92rem" },
      "& .MuiInputBase-input": { fontSize: "0.92rem", color: textPrimary, padding: "18px 14px" },
      "& .MuiInputLabel-outlined": { transform: "translate(14px, 18px) scale(1)" },
      "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" },
      "& .MuiFormHelperText-root": { fontSize: "0.72rem", color: textMuted },
    },
    selectField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.92rem" },
      "& .MuiSelect-root": { fontSize: "0.92rem", color: textPrimary, padding: "18px 14px" },
      "& .MuiInputLabel-outlined": { transform: "translate(14px, 18px) scale(1)" },
      "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" },
      "& .MuiFormHelperText-root": { fontSize: "0.72rem", color: textMuted },
    },
  };
});

/* ── helpers de feedback ── */
const toastOn  = (label) => toast.success(`✅ ${label}: Ativado`);
const toastOff = (label) => toast.info(`🔕 ${label}: Desativado`);
const feedback = (label, isOn) => isOn ? toastOn(label) : toastOff(label);

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Options(props) {
  const { oldSettings, settings, scheduleTypeChanged, user } = props;
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  /* ── states ── */
  const [userRating,    setUserRating]    = useState("disabled");
  const [scheduleType,  setScheduleType]  = useState("disabled");
  const [chatBotType,   setChatBotType]   = useState("text");

  const [loadingUserRating,   setLoadingUserRating]   = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);

  const [userCreation,        setUserCreation]        = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);

  const [SendGreetingAccepted,        setSendGreetingAccepted]        = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [UserRandom,        setUserRandom]        = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);

  const [SettingsTransfTicket,        setSettingsTransfTicket]        = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [AcceptCallWhatsapp,        setAcceptCallWhatsapp]        = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] = useState(false);

  const [sendSignMessage,        setSendSignMessage]        = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues,        setSendGreetingMessageOneQueues]        = useState("enabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const [sendQueuePosition,        setSendQueuePosition]        = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] = useState(false);

  const [sendFarewellWaitingTicket,        setSendFarewellWaitingTicket]        = useState("enabled");
  const [loadingSendFarewellWaitingTicket, setLoadingSendFarewellWaitingTicket] = useState(false);

  const [acceptAudioMessageContact,        setAcceptAudioMessageContact]        = useState("enabled");
  const [loadingAcceptAudioMessageContact, setLoadingAcceptAudioMessageContact] = useState(false);

  const [enableLGPD,        setEnableLGPD]        = useState("disabled");
  const [loadingEnableLGPD, setLoadingEnableLGPD] = useState(false);

  const [lgpdMessage,        setLGPDMessage]        = useState("");
  const [loadinglgpdMessage, setLoadingLGPDMessage] = useState(false);

  const [lgpdLink,        setLGPDLink]        = useState("");
  const [loadingLGPDLink, setLoadingLGPDLink] = useState(false);

  const [lgpdDeleteMessage,        setLGPDDeleteMessage]        = useState("disabled");
  const [loadingLGPDDeleteMessage, setLoadingLGPDDeleteMessage] = useState(false);

  const [lgpdConsent,        setLGPDConsent]        = useState("disabled");
  const [loadingLGPDConsent, setLoadingLGPDConsent] = useState(false);

  const [lgpdHideNumber,        setLGPDHideNumber]        = useState("disabled");
  const [loadingLGPDHideNumber, setLoadingLGPDHideNumber] = useState(false);

  const [requiredTag,        setRequiredTag]        = useState("enabled");
  const [loadingRequiredTag, setLoadingRequiredTag] = useState(false);

  const [closeTicketOnTransfer,        setCloseTicketOnTransfer]        = useState(false);
  const [loadingCloseTicketOnTransfer, setLoadingCloseTicketOnTransfer] = useState(false);

  const [directTicketsToWallets,        setDirectTicketsToWallets]        = useState(false);
  const [loadingDirectTicketsToWallets, setLoadingDirectTicketsToWallets] = useState(false);

  const [transferMessage,        setTransferMessage]        = useState("Seu Atendimento foi Transferido para o setor ${queue.name},Aguarde atendimento por favor...");
  const [loadingTransferMessage, setLoadingTransferMessage] = useState(false);

  const [greetingAcceptedMessage,        setGreetingAcceptedMessage]        = useState("");
  const [loadingGreetingAcceptedMessage, setLoadingGreetingAcceptedMessage] = useState(false);

  const [AcceptCallWhatsappMessage,        setAcceptCallWhatsappMessage]        = useState("");
  const [loadingAcceptCallWhatsappMessage, setLoadingAcceptCallWhatsappMessage] = useState(false);

  const [sendQueuePositionMessage,        setSendQueuePositionMessage]        = useState("");
  const [loadingSendQueuePositionMessage, setLoadingSendQueuePositionMessage] = useState(false);

  const [showNotificationPending,        setShowNotificationPending]        = useState(false);
  const [loadingShowNotificationPending, setLoadingShowNotificationPending] = useState(false);

  const [apiTranscription,        setApiTranscription]        = useState("");
  const [loadingApiTranscription, setLoadingApiTranscription] = useState(false);

  const { update: updateUserCreation } = useSettings();
  const { update } = useCompanySettings();

  const isSuper = () => user.super;
  const isOn    = (v) => v === "enabled" || v === true;
  const toVal   = (bool) => bool ? "enabled" : "disabled";

  /* ── useEffects ── */
  useEffect(() => {
    if (Array.isArray(oldSettings) && oldSettings.length) {
      const userPar = oldSettings.find((s) => s.key === "userCreation");
      if (userPar) setUserCreation(userPar.value);
      const transcriptionSetting = oldSettings.find((s) => s.key === "apiTranscription");
      if (transcriptionSetting) setApiTranscription(transcriptionSetting.value);
    }
  }, [oldSettings]);

  useEffect(() => {
    for (const [key, value] of Object.entries(settings)) {
      if (key === "userRating")                   setUserRating(value);
      if (key === "scheduleType")                 setScheduleType(value);
      if (key === "chatBotType")                  setChatBotType(value);
      if (key === "acceptCallWhatsapp")           setAcceptCallWhatsapp(value);
      if (key === "userRandom")                   setUserRandom(value);
      if (key === "sendGreetingMessageOneQueues") setSendGreetingMessageOneQueues(value);
      if (key === "sendSignMessage")              setSendSignMessage(value);
      if (key === "sendFarewellWaitingTicket")    setSendFarewellWaitingTicket(value);
      if (key === "sendGreetingAccepted")         setSendGreetingAccepted(value);
      if (key === "sendQueuePosition")            setSendQueuePosition(value);
      if (key === "acceptAudioMessageContact")    setAcceptAudioMessageContact(value);
      if (key === "enableLGPD")                   setEnableLGPD(value);
      if (key === "requiredTag")                  setRequiredTag(value);
      if (key === "lgpdDeleteMessage")            setLGPDDeleteMessage(value);
      if (key === "lgpdHideNumber")               setLGPDHideNumber(value);
      if (key === "lgpdConsent")                  setLGPDConsent(value);
      if (key === "lgpdMessage")                  setLGPDMessage(value);
      if (key === "sendMsgTransfTicket")          setSettingsTransfTicket(value);
      if (key === "lgpdLink")                     setLGPDLink(value);
      if (key === "DirectTicketsToWallets")       setDirectTicketsToWallets(value);
      if (key === "closeTicketOnTransfer")        setCloseTicketOnTransfer(value);
      if (key === "transferMessage")              setTransferMessage(value);
      if (key === "greetingAcceptedMessage")      setGreetingAcceptedMessage(value);
      if (key === "AcceptCallWhatsappMessage")    setAcceptCallWhatsappMessage(value);
      if (key === "sendQueuePositionMessage")     setSendQueuePositionMessage(value);
      if (key === "showNotificationPending")      setShowNotificationPending(value);
    }
  }, [settings]);

  /* ── handlers (todos preservados + toast de feedback) ── */
  async function handleChangeUserCreation(value) {
    setUserCreation(value); setLoadingUserCreation(true);
    await updateUserCreation({ key: "userCreation", value });
    feedback(i18n.t("settings.settings.options.creationCompanyUser"), isOn(value));
    setLoadingUserCreation(false);
  }
  async function handleApiTranscription(value) {
    setApiTranscription(value); setLoadingApiTranscription(true);
    await updateUserCreation({ key: "apiTranscription", value });
    setLoadingApiTranscription(false);
  }
  async function handleChangeUserRating(value) {
    setUserRating(value); setLoadingUserRating(true);
    await update({ column: "userRating", data: value });
    feedback(i18n.t("settings.settings.options.evaluations"), isOn(value));
    setLoadingUserRating(false);
  }
  async function handleScheduleType(value) {
    setScheduleType(value); setLoadingScheduleType(true);
    await update({ column: "scheduleType", data: value });
    toast.success(`📅 Agendamento: ${value === "disabled" ? "Desativado" : value}`);
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") scheduleTypeChanged(value);
  }
  async function handleChatBotType(value) {
    setChatBotType(value);
    await update({ column: "chatBotType", data: value });
    toast.success(`🤖 Tipo do bot: ${value}`);
  }
  async function handleLGPDMessage(value) {
    setLGPDMessage(value); setLoadingLGPDMessage(true);
    await update({ column: "lgpdMessage", data: value });
    setLoadingLGPDMessage(false);
  }
  async function handletransferMessage(value) {
    setTransferMessage(value); setLoadingTransferMessage(true);
    await update({ column: "transferMessage", data: value });
    setLoadingTransferMessage(false);
  }
  async function handleGreetingAcceptedMessage(value) {
    setGreetingAcceptedMessage(value); setLoadingGreetingAcceptedMessage(true);
    await update({ column: "greetingAcceptedMessage", data: value });
    setLoadingGreetingAcceptedMessage(false);
  }
  async function handleAcceptCallWhatsappMessage(value) {
    setAcceptCallWhatsappMessage(value); setLoadingAcceptCallWhatsappMessage(true);
    await update({ column: "AcceptCallWhatsappMessage", data: value });
    setLoadingAcceptCallWhatsappMessage(false);
  }
  async function handlesendQueuePositionMessage(value) {
    setSendQueuePositionMessage(value); setLoadingSendQueuePositionMessage(true);
    await update({ column: "sendQueuePositionMessage", data: value });
    setLoadingSendQueuePositionMessage(false);
  }
  async function handleShowNotificationPending(value) {
    setShowNotificationPending(value); setLoadingShowNotificationPending(true);
    await update({ column: "showNotificationPending", data: value });
    feedback(i18n.t("settings.settings.options.showNotificationPending"), isOn(value));
    setLoadingShowNotificationPending(false);
  }
  async function handleLGPDLink(value) {
    setLGPDLink(value); setLoadingLGPDLink(true);
    await update({ column: "lgpdLink", data: value });
    setLoadingLGPDLink(false);
  }
  async function handleLGPDDeleteMessage(value) {
    setLGPDDeleteMessage(value); setLoadingLGPDDeleteMessage(true);
    await update({ column: "lgpdDeleteMessage", data: value });
    feedback(i18n.t("settings.settings.LGPD.obfuscateMessageDelete"), isOn(value));
    setLoadingLGPDDeleteMessage(false);
  }
  async function handleLGPDConsent(value) {
    setLGPDConsent(value); setLoadingLGPDConsent(true);
    await update({ column: "lgpdConsent", data: value });
    feedback(i18n.t("settings.settings.LGPD.alwaysConsent"), isOn(value));
    setLoadingLGPDConsent(false);
  }
  async function handleLGPDHideNumber(value) {
    setLGPDHideNumber(value); setLoadingLGPDHideNumber(true);
    await update({ column: "lgpdHideNumber", data: value });
    feedback(i18n.t("settings.settings.LGPD.obfuscatePhoneUser"), isOn(value));
    setLoadingLGPDHideNumber(false);
  }
  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value); setLoadingSendGreetingAccepted(true);
    await update({ column: "sendGreetingAccepted", data: value });
    feedback(i18n.t("settings.settings.options.sendGreetingAccepted"), isOn(value));
    setLoadingSendGreetingAccepted(false);
  }
  async function handleUserRandom(value) {
    setUserRandom(value); setLoadingUserRandom(true);
    await update({ column: "userRandom", data: value });
    feedback(i18n.t("settings.settings.options.userRandom"), isOn(value));
    setLoadingUserRandom(false);
  }
  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value); setLoadingSettingsTransfTicket(true);
    await update({ column: "sendMsgTransfTicket", data: value });
    feedback(i18n.t("settings.settings.options.sendMsgTransfTicket"), isOn(value));
    setLoadingSettingsTransfTicket(false);
  }
  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value); setLoadingAcceptCallWhatsapp(true);
    await update({ column: "acceptCallWhatsapp", data: value });
    feedback(i18n.t("settings.settings.options.acceptCallWhatsapp"), isOn(value));
    setLoadingAcceptCallWhatsapp(false);
  }
  async function handleSendSignMessage(value) {
    setSendSignMessage(value); setLoadingSendSignMessage(true);
    await update({ column: "sendSignMessage", data: value });
    localStorage.setItem("sendSignMessage", value === "enabled" ? true : false);
    feedback(i18n.t("settings.settings.options.sendSignMessage"), isOn(value));
    setLoadingSendSignMessage(false);
  }
  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value); setLoadingSendGreetingMessageOneQueues(true);
    await update({ column: "sendGreetingMessageOneQueues", data: value });
    feedback(i18n.t("settings.settings.options.sendGreetingMessageOneQueues"), isOn(value));
    setLoadingSendGreetingMessageOneQueues(false);
  }
  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value); setLoadingSendQueuePosition(true);
    await update({ column: "sendQueuePosition", data: value });
    feedback(i18n.t("settings.settings.options.sendQueuePosition"), isOn(value));
    setLoadingSendQueuePosition(false);
  }
  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value); setLoadingSendFarewellWaitingTicket(true);
    await update({ column: "sendFarewellWaitingTicket", data: value });
    feedback(i18n.t("settings.settings.options.sendFarewellWaitingTicket"), isOn(value));
    setLoadingSendFarewellWaitingTicket(false);
  }
  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value); setLoadingAcceptAudioMessageContact(true);
    await update({ column: "acceptAudioMessageContact", data: value });
    feedback(i18n.t("settings.settings.options.acceptAudioMessageContact"), isOn(value));
    setLoadingAcceptAudioMessageContact(false);
  }
  async function handleEnableLGPD(value) {
    setEnableLGPD(value); setLoadingEnableLGPD(true);
    await update({ column: "enableLGPD", data: value });
    feedback(i18n.t("settings.settings.options.enableLGPD"), isOn(value));
    setLoadingEnableLGPD(false);
  }
  async function handleRequiredTag(value) {
    setRequiredTag(value); setLoadingRequiredTag(true);
    await update({ column: "requiredTag", data: value });
    feedback(i18n.t("settings.settings.options.requiredTag"), isOn(value));
    setLoadingRequiredTag(false);
  }
  async function handleCloseTicketOnTransfer(value) {
    setCloseTicketOnTransfer(value); setLoadingCloseTicketOnTransfer(true);
    await update({ column: "closeTicketOnTransfer", data: value });
    feedback(i18n.t("settings.settings.options.closeTicketOnTransfer"), isOn(value));
    setLoadingCloseTicketOnTransfer(false);
  }
  async function handleDirectTicketsToWallets(value) {
    setDirectTicketsToWallets(value); setLoadingDirectTicketsToWallets(true);
    await update({ column: "DirectTicketsToWallets", data: value });
    feedback(i18n.t("settings.settings.options.DirectTicketsToWallets"), isOn(value));
    setLoadingDirectTicketsToWallets(false);
  }

  /* ─── ícones SVG inline ─── */
  const IconUser     = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>;
  const IconMsg      = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>;
  const IconPhone    = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>;
  const IconShield   = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>;
  const IconTune     = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/></svg>;
  const IconEnvelope = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>;

  return (
    <div className={classes.root}>
      <TogglePillStyle />

      {/* ══ Acesso e conta ══════════════════════════════════════════════ */}
      <SectionCard grid
        icon={IconUser}
        iconStyle={{ backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" }}
        title="Acesso e conta"
        subtitle="Criação de usuários, avaliações e controles gerais"
      >
        {isSuper() && (
          <ToggleRow
            label={i18n.t("settings.settings.options.creationCompanyUser")}
            description="Permite criar novas empresas e usuários"
            value={userCreation} loading={loadingUserCreation}
            onChange={(v) => handleChangeUserCreation(toVal(v))}
          />
        )}
        <ToggleRow
          label={i18n.t("settings.settings.options.evaluations")}
          description="Avaliações de atendimento pelos contatos"
          value={userRating} loading={loadingUserRating}
          onChange={(v) => handleChangeUserRating(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.userRandom")}
          description="Distribui atendimentos aleatoriamente"
          value={UserRandom} loading={loadingUserRandom}
          onChange={(v) => handleUserRandom(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.sendSignMessage")}
          description="Atendente pode retirar própria assinatura"
          value={sendSignMessage} loading={loadingSendSignMessage}
          onChange={(v) => handleSendSignMessage(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.requiredTag")}
          description="Exige etiqueta ao finalizar atendimento"
          value={requiredTag} loading={loadingRequiredTag}
          onChange={(v) => handleRequiredTag(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.showNotificationPending")}
          description="Notificações de tickets pendentes"
          value={showNotificationPending} loading={loadingShowNotificationPending}
          onChange={(v) => handleShowNotificationPending(v)}
        />
      </SectionCard>

      {/* ══ Mensagens automáticas ════════════════════════════════════════ */}
      <SectionCard grid
        icon={IconMsg}
        iconStyle={{ backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" }}
        title="Mensagens automáticas"
        subtitle="Saudações, transferências e posição na fila"
      >
        <ToggleRow
          label={i18n.t("settings.settings.options.sendGreetingAccepted")}
          description="Saudação ao aceitar o ticket"
          value={SendGreetingAccepted} loading={loadingSendGreetingAccepted}
          onChange={(v) => handleSendGreetingAccepted(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.sendMsgTransfTicket")}
          description="Avisa contato ao transferir setor"
          value={SettingsTransfTicket} loading={loadingSettingsTransfTicket}
          onChange={(v) => handleSettingsTransfTicket(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.sendGreetingMessageOneQueues")}
          description="Saudação quando houver somente 1 fila"
          value={sendGreetingMessageOneQueues} loading={loadingSendGreetingMessageOneQueues}
          onChange={(v) => handleSendGreetingMessageOneQueues(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.sendQueuePosition")}
          description="Informa posição do contato na fila"
          value={sendQueuePosition} loading={loadingSendQueuePosition}
          onChange={(v) => handleSendQueuePosition(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.sendFarewellWaitingTicket")}
          description="Despedida ao mover para aguardando"
          value={sendFarewellWaitingTicket} loading={loadingSendFarewellWaitingTicket}
          onChange={(v) => handleSendFarewellWaitingTicket(toVal(v))}
        />
      </SectionCard>

      {/* ══ Canais e mídia ══════════════════════════════════════════════ */}
      <SectionCard grid
        icon={IconPhone}
        iconStyle={{ backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" }}
        title="Canais e mídia"
        subtitle="Ligações, áudios e comportamento de transferência"
      >
        <ToggleRow
          label={i18n.t("settings.settings.options.acceptCallWhatsapp")}
          description="Responde chamadas recebidas pelo WhatsApp"
          value={AcceptCallWhatsapp} loading={loadingAcceptCallWhatsapp}
          onChange={(v) => handleAcceptCallWhatsapp(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.acceptAudioMessageContact")}
          description="Aceita mensagens de áudio do contato"
          value={acceptAudioMessageContact} loading={loadingAcceptAudioMessageContact}
          onChange={(v) => handleAcceptAudioMessageContact(toVal(v))}
        />
        <ToggleRow
          label={i18n.t("settings.settings.options.closeTicketOnTransfer")}
          description="Fecha ticket ao transferir para outro setor"
          value={closeTicketOnTransfer} loading={loadingCloseTicketOnTransfer}
          onChange={(v) => handleCloseTicketOnTransfer(v)}
        />
      </SectionCard>

      {/* ══ LGPD ════════════════════════════════════════════════════════ */}
      <SectionCard grid
        icon={IconShield}
        iconStyle={{ backgroundColor: alpha("#059669", isDark ? 0.15 : 0.08), color: "#059669" }}
        title="LGPD e privacidade"
        subtitle="Conformidade com a Lei Geral de Proteção de Dados"
      >
        <ToggleRow
          label={i18n.t("settings.settings.options.enableLGPD")}
          description="Ativa o módulo de conformidade com a LGPD"
          value={enableLGPD} loading={loadingEnableLGPD}
          onChange={(v) => handleEnableLGPD(toVal(v))}
        />
      </SectionCard>

      {/* ══ LGPD expandido ══════════════════════════════════════════════ */}
      {enableLGPD === "enabled" && (
        <>
          <Grid spacing={3} container style={{ marginBottom: 10 }}>
            <Tabs
              value={0} indicatorColor="primary" textColor="primary"
              scrollButtons="on" variant="scrollable"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f2f2f2",
                borderRadius: 4, width: "100%",
              }}
            >
              <Tab label={i18n.t("settings.settings.LGPD.title")} />
            </Tabs>
          </Grid>
          <Grid spacing={2} container style={{ marginBottom: 16 }}>
            <Grid xs={12} item>
              <FormControl className={classes.selectContainer}>
                <TextField
                  id="lgpdMessage" name="lgpdMessage" variant="outlined"
                  multiline minRows={3}
                  label={i18n.t("settings.settings.LGPD.welcome")}
                  value={lgpdMessage} className={classes.textField}
                  onChange={(e) => handleLGPDMessage(e.target.value)}
                />
                <FormHelperText>{loadinglgpdMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12} item>
              <FormControl className={classes.selectContainer}>
                <TextField
                  id="lgpdLink" name="lgpdLink" variant="outlined"
                  label={i18n.t("settings.settings.LGPD.linkLGPD")}
                  value={lgpdLink} className={classes.textField}
                  onChange={(e) => handleLGPDLink(e.target.value)}
                />
                <FormHelperText>{loadingLGPDLink && i18n.t("settings.settings.options.updating")}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12} item>
              <SectionCard grid
                icon={IconShield}
                iconStyle={{ backgroundColor: alpha("#059669", isDark ? 0.15 : 0.08), color: "#059669" }}
                title="Opções LGPD"
                subtitle="Controle de dados, consentimento e privacidade"
              >
                <ToggleRow
                  label={i18n.t("settings.settings.LGPD.obfuscateMessageDelete")}
                  description="Oculta mensagens deletadas pelo contato"
                  value={lgpdDeleteMessage} loading={loadingLGPDDeleteMessage}
                  onChange={(v) => handleLGPDDeleteMessage(toVal(v))}
                />
                <ToggleRow
                  label={i18n.t("settings.settings.LGPD.alwaysConsent")}
                  description="Sempre solicita confirmação de consentimento"
                  value={lgpdConsent} loading={loadingLGPDConsent}
                  onChange={(v) => handleLGPDConsent(toVal(v))}
                />
                <ToggleRow
                  label={i18n.t("settings.settings.LGPD.obfuscatePhoneUser")}
                  description="Oculta número de telefone para atendentes"
                  value={lgpdHideNumber} loading={loadingLGPDHideNumber}
                  onChange={(v) => handleLGPDHideNumber(toVal(v))}
                />
              </SectionCard>
            </Grid>
          </Grid>
        </>
      )}

      {/* ══ Configurações avançadas ══════════════════════════════════════ */}
      <SectionCard
        icon={IconTune}
        iconStyle={{ backgroundColor: alpha("#f59e0b", isDark ? 0.15 : 0.08), color: "#f59e0b" }}
        title="Configurações avançadas"
        subtitle="Agendamento de expediente e tipo de chatbot"
      >
        <Grid container spacing={2} style={{ paddingTop: 4 }}>
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth className={classes.selectField}>
              <InputLabel id="schedule-type-label">
                {i18n.t("settings.settings.options.officeScheduling")}
              </InputLabel>
              <Select
                labelId="schedule-type-label" value={scheduleType}
                label={i18n.t("settings.settings.options.officeScheduling")}
                onChange={(e) => handleScheduleType(e.target.value)}
              >
                <MenuItem value={"disabled"}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={"queue"}>{i18n.t("settings.settings.options.queueManagement")}</MenuItem>
                <MenuItem value={"company"}>{i18n.t("settings.settings.options.companyManagement")}</MenuItem>
                <MenuItem value={"connection"}>{i18n.t("settings.settings.options.connectionManagement")}</MenuItem>
              </Select>
              <FormHelperText>{loadingScheduleType && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth className={classes.selectField}>
              <InputLabel id="chatbot-type-label">
                {i18n.t("settings.settings.options.chatBotType")}
              </InputLabel>
              <Select
                labelId="chatbot-type-label" value={chatBotType}
                label={i18n.t("settings.settings.options.chatBotType")}
                onChange={(e) => handleChatBotType(e.target.value)}
              >
                <MenuItem value={"text"}>Texto</MenuItem>
              </Select>
              <FormHelperText>{loadingScheduleType && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══ Mensagens customizadas ═══════════════════════════════════════ */}
      <SectionCard
        icon={IconEnvelope}
        iconStyle={{ backgroundColor: alpha("#db2777", isDark ? 0.15 : 0.08), color: "#db2777" }}
        title="Mensagens customizadas"
        subtitle="Textos das mensagens automáticas do sistema"
      >
        <Grid container spacing={2} style={{ paddingTop: 4 }}>
          <Grid item xs={12} sm={6}>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="transferMessage" name="transferMessage" variant="outlined"
                multiline minRows={3}
                label={i18n.t("settings.settings.customMessages.transferMessage")}
                value={transferMessage} required={SettingsTransfTicket === "enabled"}
                className={classes.textField}
                onChange={(e) => handletransferMessage(e.target.value)}
              />
              <FormHelperText>{loadingTransferMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="greetingAcceptedMessage" name="greetingAcceptedMessage" variant="outlined"
                multiline minRows={3}
                label={i18n.t("settings.settings.customMessages.greetingAcceptedMessage")}
                value={greetingAcceptedMessage} required={SendGreetingAccepted === "enabled"}
                className={classes.textField}
                onChange={(e) => handleGreetingAcceptedMessage(e.target.value)}
              />
              <FormHelperText>{loadingGreetingAcceptedMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="AcceptCallWhatsappMessage" name="AcceptCallWhatsappMessage" variant="outlined"
                multiline minRows={3}
                label={i18n.t("settings.settings.customMessages.AcceptCallWhatsappMessage")}
                value={AcceptCallWhatsappMessage} required={AcceptCallWhatsapp === "disabled"}
                className={classes.textField}
                onChange={(e) => handleAcceptCallWhatsappMessage(e.target.value)}
              />
              <FormHelperText>{loadingAcceptCallWhatsappMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="sendQueuePositionMessage" name="sendQueuePositionMessage" variant="outlined"
                multiline minRows={3}
                label={i18n.t("settings.settings.customMessages.sendQueuePositionMessage")}
                value={sendQueuePositionMessage} required={sendQueuePosition === "enabled"}
                className={classes.textField}
                onChange={(e) => handlesendQueuePositionMessage(e.target.value)}
              />
              <FormHelperText>{loadingSendQueuePositionMessage && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="apiTranscription" name="apiTranscription" variant="outlined"
                type="password"
                label="Chave da API de Transcrição (OpenAI)"
                placeholder="coloque sua chave da openai..."
                value={apiTranscription} className={classes.textField}
                onChange={(e) => handleApiTranscription(e.target.value)}
              />
              <FormHelperText>{loadingApiTranscription && i18n.t("settings.settings.options.updating")}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </SectionCard>
    </div>
  );
}