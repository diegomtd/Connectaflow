import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { MenuItem, FormControl, InputLabel, Select } from "@material-ui/core";
import { InputAdornment, IconButton } from "@material-ui/core";
import Grid             from "@material-ui/core/Grid";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";

import { Visibility, VisibilityOff } from "@material-ui/icons";
import CloseIcon           from "@material-ui/icons/Close";
import EmojiObjectsIcon    from "@material-ui/icons/EmojiObjects";
import VpnKeyIcon          from "@material-ui/icons/VpnKey";
import TuneIcon            from "@material-ui/icons/Tune";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";

import { i18n }         from "../../translate/i18n";
import api              from "../../services/api";
import toastError       from "../../errors/toastError";
import QueueSelectSingle from "../QueueSelectSingle";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500&display=swap');
    .pmd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .pmd-root ::-webkit-scrollbar { width: 4px; }
    .pmd-root ::-webkit-scrollbar-track { background: transparent; }
    .pmd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    /* Section card */
    .pmd-section-card {
      border-radius: 12px;
      border: 1px solid var(--pm-section-border);
      background: var(--pm-section-bg);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .pmd-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--pm-section-border);
      background: var(--pm-section-header-bg);
    }
    .pmd-section-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .pmd-section-body { padding: 14px; }

    /* Model badge chip */
    .pmd-model-badge {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 6px;
      font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.03em;
    }
  `}</style>
);

/* ─── Modelos permitidos ─────────────────────────────────────────────────── */
const allowedModels = [
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-4o",
  "gpt-4o-mini",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
];

const modelLabels = {
  "gpt-4.1-mini":     "GPT 4.1 Mini",
  "gpt-4.1":          "GPT 4.1",
  "gpt-4o":           "GPT 4o",
  "gpt-4o-mini":      "GPT 4o Mini",
  "gemini-1.5-flash": "Gemini 1.5 Flash",
  "gemini-1.5-pro":   "Gemini 1.5 Pro",
  "gemini-2.0-flash": "Gemini 2.0 Flash",
};

const PromptSchema = Yup.object().shape({
  name: Yup.string().min(5, "Muito curto!").max(100, "Muito longo!").required("Obrigatório"),
  prompt: Yup.string().min(50, "Muito curto!").required("Descreva o treinamento para Inteligência Artificial"),
  model: Yup.string().oneOf(allowedModels, "Modelo inválido").required("Informe o modelo"),
  maxTokens: Yup.number().min(10, "Mínimo 10 tokens").max(4096, "Máximo 4096 tokens").required("Informe o número máximo de tokens"),
  temperature: Yup.number().min(0, "Mínimo 0").max(1, "Máximo 1").required("Informe a temperatura"),
  apiKey: Yup.string().required("Informe a API Key"),
  queueId: Yup.number()
    .transform((value, originalValue) => originalValue === "" || originalValue === null ? undefined : value)
    .required("Informe a fila"),
  maxMessages: Yup.number().min(1, "Mínimo 1 mensagem").max(50, "Máximo 50 mensagens").required("Informe o número máximo de mensagens"),
  voice: Yup.string().when("model", {
    is: "gpt-4.1-mini",
    then: Yup.string().required("Informe o modo para Voz"),
    otherwise: Yup.string().notRequired(),
  }),
  voiceKey:    Yup.string().notRequired(),
  voiceRegion: Yup.string().notRequired(),
});

/* ─── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg     = isDark ? "#0f1929" : "#f4f7fb";
  const cardBg        = isDark ? "#131e2e" : "#ffffff";
  const headerBg      = isDark ? "#0b1520" : "#f8fafc";
  const border        = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const sectionBorder = isDark ? "rgba(255,255,255,0.07)" : "#e8eef5";
  const sectionHead   = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const textPrimary   = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond    = isDark ? "#8fa4be" : "#3d5166";
  const textMuted     = isDark ? "#4d6478" : "#8fa0b0";

  return {
    dialogPaper: {
      borderRadius: 18,
      border: `1px solid ${border}`,
      backgroundColor: surfaceBg,
      backgroundImage: "none",
      boxShadow: isDark
        ? "0 24px 60px rgba(0,0,0,0.55)"
        : "0 24px 60px rgba(15,23,42,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: "90vh",
      "--pm-section-border":     sectionBorder,
      "--pm-section-bg":         cardBg,
      "--pm-section-header-bg":  sectionHead,
    },

    /* ── Cabeçalho ── */
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
    titleText: {
      fontSize: "0.95rem", fontWeight: 700,
      letterSpacing: "-0.01em", lineHeight: 1,
      color: textPrimary,
    },
    titleSub: { fontSize: 11, marginTop: 3, color: textMuted },
    closeButton: {
      width: 30, height: 30, borderRadius: 8, padding: 0,
      border: `1px solid ${border}`,
      backgroundColor: "transparent",
      color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.40),
        color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.10 : 0.05),
      },
    },

    /* ── Conteúdo ── */
    dialogContent: {
      padding: theme.spacing(2, 2.5),
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${border}`,
      overflowY: "auto",
      flex: "1 1 auto",
      minHeight: 0,
    },

    /* ── Section icon colors ── */
    iconPrompt:  { backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" },
    iconKey:     { backgroundColor: alpha("#d97706", isDark ? 0.15 : 0.08), color: "#d97706" },
    iconConfig:  { backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" },
    iconVoice:   { backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" },

    /* ── Campos ── */
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
        "&.Mui-disabled fieldset": { borderColor: isDark ? "rgba(255,255,255,0.05)" : "#eef2f7" },
        "&.Mui-disabled": { opacity: 0.5 },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.82rem" },
      "& .MuiSelect-root": { fontSize: "0.83rem", color: textPrimary },
    },

    /* ── Hint text ── */
    fieldHint: {
      fontSize: "0.70rem",
      color: textMuted,
      marginTop: 4,
      lineHeight: 1.4,
    },
    errorText: {
      fontSize: "0.70rem",
      color: "#ef4444",
      marginTop: 4,
    },

    /* ── Ações ── */
    dialogActions: {
      padding: theme.spacing(1.5, 2.5, 2),
      backgroundColor: isDark ? alpha("#000", 0.10) : "#f8fafc",
      borderTop: `1px solid ${border}`,
      gap: 8, display: "flex", justifyContent: "flex-end",
      flexShrink: 0,
    },
    cancelButton: {
      borderRadius: 9, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      borderColor: border, color: textSecond,
      "&:hover": {
        borderColor: textSecond,
        backgroundColor: alpha(textSecond, isDark ? 0.07 : 0.04),
      },
    },
    btnWrapper: { position: "relative" },
    submitButton: {
      borderRadius: 9, textTransform: "none",
      fontWeight: 700, fontSize: "0.82rem", color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      "&:hover": {
        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}`,
      },
    },
    buttonProgress: {
      color: "#fff", position: "absolute",
      top: "50%", left: "50%", marginTop: -12, marginLeft: -12,
    },
  };
});

/* ── Section Card ────────────────────────────────────────────────────────── */
const SectionCard = ({ icon, iconClass, title, subtitle, children }) => (
  <div className="pmd-section-card">
    <div className="pmd-section-header">
      <div className={`pmd-section-icon ${iconClass}`}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="pmd-section-body">{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const PromptModal = ({ open, onClose, promptId }) => {
  const classes = useStyles();
  const [showApiKey, setShowApiKey] = useState(false);

  const initialState = {
    name: "",
    prompt: "",
    model: "gpt-4.1-mini",
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    maxTokens: 100,
    temperature: 1,
    apiKey: "",
    queueId: "",
    maxMessages: 10,
  };

  const [prompt, setPrompt] = useState(initialState);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) { setPrompt(initialState); return; }
      try {
        const { data } = await api.get(`/prompt/${promptId}`);
        setPrompt({
          ...initialState,
          ...data,
          queueId: data?.queueId ?? "",
          model: allowedModels.includes(data.model) ? data.model : "gpt-4.1-mini",
        });
      } catch (err) { toastError(err); }
    };
    fetchPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId, open]);

  const handleClose = () => { setPrompt(initialState); onClose(); };

  const handleSavePrompt = async (values, { setSubmitting, setErrors }) => {
    try {
      const promptData = {
        ...values,
        temperature: Number(values.temperature),
        voice: values.model === "gpt-4.1-mini" ? values.voice : "texto",
      };
      if (promptId) {
        await api.put(`/prompt/${promptId}`, promptData);
      } else {
        await api.post("/prompt", promptData);
      }
      toast.success(i18n.t("promptModal.success"));
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erro ao salvar o prompt";
      toastError(errorMessage);
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.errors) {
          const fieldErrors = {};
          parsedError.errors.forEach(error => {
            if (error.includes("NAME"))        fieldErrors.name        = error;
            if (error.includes("PROMPT"))      fieldErrors.prompt      = error;
            if (error.includes("MODEL"))       fieldErrors.model       = error;
            if (error.includes("TOKENS"))      fieldErrors.maxTokens   = error;
            if (error.includes("TEMPERATURE")) fieldErrors.temperature = error;
            if (error.includes("APIKEY"))      fieldErrors.apiKey      = error;
            if (error.includes("QUEUEID"))     fieldErrors.queueId     = error;
            if (error.includes("MESSAGES"))    fieldErrors.maxMessages = error;
            if (error.includes("VOICE"))       fieldErrors.voice       = error;
          });
          setErrors(fieldErrors);
        }
      } catch (_) {}
      setSubmitting(false);
    }
  };

  return (
    <div className="pmd-root">
      <FontStyle />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{ className: classes.dialogPaper, elevation: 0 }}
        BackdropProps={{
          style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
        }}
      >
        {/* ── CABEÇALHO ── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}>
                  <EmojiObjectsIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {promptId ? i18n.t("promptModal.title.edit") : i18n.t("promptModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Inteligência Artificial · Configuração de prompt
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={handleClose} className={classes.closeButton}>
                <CloseIcon style={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Formik
          initialValues={prompt}
          enableReinitialize={true}
          validationSchema={PromptSchema}
          onSubmit={handleSavePrompt}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>

              <DialogContent className={classes.dialogContent}>

                {/* ════ IDENTIFICAÇÃO ════ */}
                <SectionCard
                  icon={<EmojiObjectsIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconPrompt}
                  title="Identificação"
                  subtitle="Nome do prompt e fila de atendimento vinculada"
                >
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        label={i18n.t("promptModal.form.name")}
                        name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        size="small"
                        fullWidth
                        className={classes.textField}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        name="queueId"
                        component={({ field, form }) => (
                          <QueueSelectSingle
                            selectedQueueId={field.value}
                            onChange={value => form.setFieldValue("queueId", value)}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* ════ TREINAMENTO ════ */}
                <SectionCard
                  icon={<EmojiObjectsIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconPrompt}
                  title="Treinamento"
                  subtitle="Instruções de comportamento para a IA"
                >
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.prompt")}
                    name="prompt"
                    error={touched.prompt && Boolean(errors.prompt)}
                    helperText={touched.prompt && errors.prompt}
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    minRows={8}
                    className={classes.textField}
                  />
                </SectionCard>

                {/* ════ AUTENTICAÇÃO ════ */}
                <SectionCard
                  icon={<VpnKeyIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconKey}
                  title="Autenticação"
                  subtitle="Chave de API para acesso ao modelo de IA"
                >
                  <FormControl fullWidth variant="outlined" className={classes.formControl}>
                    <Field
                      as={TextField}
                      label={i18n.t("promptModal.form.apikey")}
                      name="apiKey"
                      type={showApiKey ? "text" : "password"}
                      error={touched.apiKey && Boolean(errors.apiKey)}
                      helperText={touched.apiKey && errors.apiKey}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowApiKey(v => !v)}
                              size="small"
                              style={{ color: "inherit", opacity: 0.5 }}
                            >
                              {showApiKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </FormControl>
                </SectionCard>

                {/* ════ MODELO E PARÂMETROS ════ */}
                <SectionCard
                  icon={<TuneIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconConfig}
                  title="Modelo e parâmetros"
                  subtitle="Configurações técnicas do modelo de linguagem"
                >
                  <Grid container spacing={1}>

                    {/* Modelo */}
                    <Grid item xs={12} md={6}>
                      <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                        <InputLabel>{i18n.t("promptModal.form.model")}</InputLabel>
                        <Field
                          as={Select}
                          label={i18n.t("promptModal.form.model")}
                          name="model"
                          onChange={e => {
                            setFieldValue("model", e.target.value);
                            if (e.target.value !== "gpt-4.1-mini") setFieldValue("voice", "texto");
                          }}
                        >
                          {allowedModels.map(model => (
                            <MenuItem key={model} value={model}>
                              {modelLabels[model] || model}
                            </MenuItem>
                          ))}
                        </Field>
                        {touched.model && errors.model && (
                          <div className={classes.errorText}>{errors.model}</div>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Temperatura */}
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        label={i18n.t("promptModal.form.temperature")}
                        name="temperature"
                        error={touched.temperature && Boolean(errors.temperature)}
                        helperText={touched.temperature && errors.temperature}
                        variant="outlined"
                        size="small"
                        fullWidth
                        type="number"
                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Max Tokens */}
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        label={i18n.t("promptModal.form.max_tokens")}
                        name="maxTokens"
                        error={touched.maxTokens && Boolean(errors.maxTokens)}
                        helperText={touched.maxTokens && errors.maxTokens}
                        variant="outlined"
                        size="small"
                        fullWidth
                        type="number"
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Max Messages */}
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        label={i18n.t("promptModal.form.max_messages")}
                        name="maxMessages"
                        error={touched.maxMessages && Boolean(errors.maxMessages)}
                        helperText={touched.maxMessages && errors.maxMessages}
                        variant="outlined"
                        size="small"
                        fullWidth
                        type="number"
                        className={classes.textField}
                      />
                    </Grid>

                  </Grid>
                </SectionCard>

                {/* ════ VOZ ════ */}
                <SectionCard
                  icon={<RecordVoiceOverIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconVoice}
                  title="Voz"
                  subtitle={
                    values.model !== "gpt-4.1-mini"
                      ? "Disponível apenas para o modelo GPT 4.1 Mini"
                      : "Configurações de síntese de voz via Azure"
                  }
                >
                  <Grid container spacing={1}>

                    {/* Voz */}
                    <Grid item xs={12} md={6}>
                      <FormControl
                        variant="outlined"
                        size="small"
                        fullWidth
                        className={classes.formControl}
                        margin="dense"
                        disabled={values.model !== "gpt-4.1-mini"}
                        error={touched.voice && Boolean(errors.voice)}
                      >
                        <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                        <Field as={Select} label={i18n.t("promptModal.form.voice")} name="voice">
                          <MenuItem value="texto">Texto</MenuItem>
                          <MenuItem value="pt-BR-FranciscaNeural">Francisca</MenuItem>
                          <MenuItem value="pt-BR-AntonioNeural">Antônio</MenuItem>
                          <MenuItem value="pt-BR-BrendaNeural">Brenda</MenuItem>
                          <MenuItem value="pt-BR-DonatoNeural">Donato</MenuItem>
                          <MenuItem value="pt-BR-ElzaNeural">Elza</MenuItem>
                          <MenuItem value="pt-BR-FabioNeural">Fábio</MenuItem>
                          <MenuItem value="pt-BR-GiovannaNeural">Giovanna</MenuItem>
                          <MenuItem value="pt-BR-HumbertoNeural">Humberto</MenuItem>
                          <MenuItem value="pt-BR-JulioNeural">Julio</MenuItem>
                          <MenuItem value="pt-BR-LeilaNeural">Leila</MenuItem>
                          <MenuItem value="pt-BR-LeticiaNeural">Letícia</MenuItem>
                          <MenuItem value="pt-BR-ManuelaNeural">Manuela</MenuItem>
                          <MenuItem value="pt-BR-NicolauNeural">Nicolau</MenuItem>
                          <MenuItem value="pt-BR-ValerioNeural">Valério</MenuItem>
                          <MenuItem value="pt-BR-YaraNeural">Yara</MenuItem>
                        </Field>
                        {touched.voice && errors.voice && (
                          <div className={classes.errorText}>{errors.voice}</div>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Voice Key */}
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        label={i18n.t("promptModal.form.voiceKey")}
                        name="voiceKey"
                        error={touched.voiceKey && Boolean(errors.voiceKey)}
                        helperText={touched.voiceKey && errors.voiceKey}
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={values.model !== "gpt-4.1-mini"}
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Voice Region */}
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        label={i18n.t("promptModal.form.voiceRegion")}
                        name="voiceRegion"
                        error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                        helperText={touched.voiceRegion && errors.voiceRegion}
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled={values.model !== "gpt-4.1-mini"}
                        className={classes.textField}
                      />
                    </Grid>

                  </Grid>
                </SectionCard>

              </DialogContent>

              {/* ── AÇÕES ── */}
              <DialogActions className={classes.dialogActions}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("promptModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    className={classes.submitButton}
                  >
                    {promptId
                      ? i18n.t("promptModal.buttons.okEdit")
                      : i18n.t("promptModal.buttons.okAdd")}
                  </Button>
                  {isSubmitting && (
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  )}
                </div>
              </DialogActions>

            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default PromptModal;