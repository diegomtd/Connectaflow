import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select           from "@material-ui/core/Select";
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import FormControl      from "@material-ui/core/FormControl";
import TextField        from "@material-ui/core/TextField";
import Grid             from "@material-ui/core/Grid";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";
import IconButton       from "@material-ui/core/IconButton";

import CloseIcon        from "@material-ui/icons/Close";
import ExtensionIcon    from "@material-ui/icons/Extension";
import LinkIcon         from "@material-ui/icons/Link";
import CodeIcon         from "@material-ui/icons/Code";
import TuneIcon         from "@material-ui/icons/Tune";
import BugReportIcon    from "@material-ui/icons/BugReport";

import { i18n } from "../../translate/i18n";
import api       from "../../services/api";
import toastError from "../../errors/toastError";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500&display=swap');
    .qim-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .qim-root ::-webkit-scrollbar { width: 4px; }
    .qim-root ::-webkit-scrollbar-track { background: transparent; }
    .qim-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .qim-card {
      border-radius: 12px;
      border: 1px solid var(--qim-border);
      background: var(--qim-card-bg);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .qim-card:last-child { margin-bottom: 0; }
    .qim-card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px;
      border-bottom: 1px solid var(--qim-border);
      background: var(--qim-card-head);
    }
    .qim-card-icon {
      width: 24px; height: 24px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .qim-card-body { padding: 14px; }

    /* Type badge */
    .qim-type-badge {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 20px;
      font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.04em; text-transform: uppercase;
      margin-left: 8px;
    }
  `}</style>
);

const DialogflowSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
});

/* ─── Type metadata ───────────────────────────────────────────────────────── */
const TYPE_META = {
  dialogflow:  { label: "DialogFlow",   color: "#2563eb" },
  n8n:         { label: "N8N",          color: "#d97706" },
  webhook:     { label: "WebHook",      color: "#7c3aed" },
  typebot:     { label: "Typebot",      color: "#059669" },
  flowbuilder: { label: "FlowBuilder",  color: "#0891b2" },
};

/* ─── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg  = isDark ? "#0f1929" : "#f4f7fb";
  const cardBg     = isDark ? "#131e2e" : "#ffffff";
  const headerBg   = isDark ? "#0b1520" : "#f8fafc";
  const cardHead   = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const border     = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "#e8eef5";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond  = isDark ? "#8fa4be" : "#3d5166";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";

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
      "--qim-border":    cardBorder,
      "--qim-card-bg":   cardBg,
      "--qim-card-head": cardHead,
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
    titleText: {
      fontSize: "0.95rem", fontWeight: 700,
      letterSpacing: "-0.01em", lineHeight: 1, color: textPrimary,
    },
    titleSub: { fontSize: 11, marginTop: 3, color: textMuted },
    closeButton: {
      width: 30, height: 30, borderRadius: 8, padding: 0,
      border: `1px solid ${border}`, backgroundColor: "transparent", color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.40), color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.10 : 0.05),
      },
    },

    /* ── Content ── */
    dialogContent: {
      padding: theme.spacing(2, 2.5),
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${border}`,
      overflowY: "auto", flex: "1 1 auto", minHeight: 0,
    },

    /* ── Icon color variants ── */
    iconBlue:   { backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" },
    iconGreen:  { backgroundColor: alpha("#059669", isDark ? 0.15 : 0.08), color: "#059669" },
    iconPurple: { backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" },
    iconAmber:  { backgroundColor: alpha("#d97706", isDark ? 0.15 : 0.08), color: "#d97706" },
    iconCyan:   { backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" },

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

    /* ── Actions ── */
    dialogActions: {
      padding: theme.spacing(1.5, 2.5, 2),
      backgroundColor: isDark ? alpha("#000", 0.10) : "#f8fafc",
      borderTop: `1px solid ${border}`,
      gap: 8, display: "flex", justifyContent: "flex-end", flexShrink: 0,
    },
    testButton: {
      borderRadius: 9, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      marginRight: "auto",
      borderColor: alpha("#d97706", 0.4), color: "#d97706",
      "&:hover": {
        borderColor: "#d97706",
        backgroundColor: alpha("#d97706", isDark ? 0.07 : 0.04),
      },
    },
    cancelButton: {
      borderRadius: 9, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      borderColor: border, color: textSecond,
      "&:hover": { borderColor: textSecond, backgroundColor: alpha(textSecond, isDark ? 0.07 : 0.04) },
    },
    btnWrapper: { position: "relative" },
    submitButton: {
      borderRadius: 9, textTransform: "none",
      fontWeight: 700, fontSize: "0.82rem", color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      "&:hover": { boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}` },
    },
    buttonProgress: {
      color: "#fff", position: "absolute",
      top: "50%", left: "50%", marginTop: -12, marginLeft: -12,
    },
  };
});

/* ── Card component ──────────────────────────────────────────────────────── */
const Card = ({ icon, iconClass, title, subtitle, children }) => (
  <div className="qim-card">
    <div className="qim-card-header">
      <div className={`qim-card-icon ${iconClass}`}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="qim-card-body">{children}</div>
  </div>
);

/* ── Reusable Field wrapper ──────────────────────────────────────────────── */
const TF = ({ name, label, touched, errors, classes, multiline, minRows, ...rest }) => (
  <Field as={TextField}
    name={name} label={label}
    error={touched[name] && Boolean(errors[name])}
    helperText={touched[name] && errors[name]}
    variant="outlined" size="small" fullWidth
    multiline={multiline} minRows={minRows}
    className={classes.textField}
    {...rest}
  />
);

/* ══════════════════════════════════════════════════════════════════════════ */
const QueueIntegration = ({ open, onClose, integrationId }) => {
  const classes = useStyles();

  const initialState = {
    type: "typebot",
    name: "",
    projectName: "",
    jsonContent: "",
    language: "",
    urlN8N: "",
    typebotDelayMessage: 1000,
    typebotExpires: 1,
    typebotKeywordFinish: "",
    typebotKeywordRestart: "",
    typebotRestartMessage: "",
    typebotSlug: "",
    typebotUnknownMessage: "",
  };

  const [integration, setIntegration] = useState(initialState);

  useEffect(() => {
    (async () => {
      if (!integrationId) return;
      try {
        const { data } = await api.get(`/queueIntegration/${integrationId}`);
        setIntegration((prev) => ({ ...prev, ...data }));
      } catch (err) { toastError(err); }
    })();
    return () => setIntegration({ type: "dialogflow", name: "", projectName: "", jsonContent: "", language: "", urlN8N: "", typebotDelayMessage: 1000 });
  }, [integrationId, open]);

  const handleClose = () => { onClose(); setIntegration(initialState); };

  const handleTestSession = async (_, values) => {
    try {
      const { projectName, jsonContent, language } = values;
      await api.post(`/queueIntegration/testSession`, { projectName, jsonContent, language });
      toast.success(i18n.t("queueIntegrationModal.messages.testSuccess"));
    } catch (err) { toastError(err); }
  };

  const handleSaveDialogflow = async (values) => {
    try {
      if (["n8n", "webhook", "typebot", "flowbuilder"].includes(values.type)) values.projectName = values.name;
      if (integrationId) {
        await api.put(`/queueIntegration/${integrationId}`, values);
        toast.success(i18n.t("queueIntegrationModal.messages.editSuccess"));
      } else {
        await api.post("/queueIntegration", values);
        toast.success(i18n.t("queueIntegrationModal.messages.addSuccess"));
      }
      handleClose();
    } catch (err) { toastError(err); }
  };

  return (
    <div className="qim-root">
      <FontStyle />

      <Dialog
        open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper"
        PaperProps={{ className: classes.dialogPaper, elevation: 0 }}
        BackdropProps={{ style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" } }}
      >
        {/* ── HEADER ── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}>
                  <ExtensionIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {integrationId
                      ? i18n.t("queueIntegrationModal.title.edit")
                      : i18n.t("queueIntegrationModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Integrações · Chatbot e automações
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
          initialValues={integration}
          enableReinitialize={true}
          validationSchema={DialogflowSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => { handleSaveDialogflow(values); actions.setSubmitting(false); }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>

              <DialogContent className={classes.dialogContent}>

                {/* ── Tipo de integração ── */}
                <Card
                  icon={<ExtensionIcon style={{ fontSize: 13 }} />}
                  iconClass={classes.iconBlue}
                  title="Tipo de integração"
                  subtitle="Selecione a plataforma que deseja conectar"
                >
                  <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                    <InputLabel id="type-label">{i18n.t("queueIntegrationModal.form.type")}</InputLabel>
                    <Field as={Select} label={i18n.t("queueIntegrationModal.form.type")} name="type" labelId="type-label" required>
                      <MenuItem value="dialogflow">DialogFlow</MenuItem>
                      <MenuItem value="n8n">N8N</MenuItem>
                      <MenuItem value="webhook">WebHooks</MenuItem>
                      <MenuItem value="typebot">Typebot</MenuItem>
                      <MenuItem value="flowbuilder">FlowBuilder</MenuItem>
                    </Field>
                  </FormControl>
                </Card>

                {/* ════ DIALOGFLOW ════ */}
                {values.type === "dialogflow" && (
                  <>
                    <Card
                      icon={<CodeIcon style={{ fontSize: 13 }} />}
                      iconClass={classes.iconBlue}
                      title="Identificação — DialogFlow"
                      subtitle="Nome do projeto e idioma de resposta"
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                          <TF name="name" label={i18n.t("queueIntegrationModal.form.name")} autoFocus touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                            <InputLabel id="language-label">{i18n.t("queueIntegrationModal.form.language")}</InputLabel>
                            <Field as={Select} label={i18n.t("queueIntegrationModal.form.language")} name="language" labelId="language-label" required>
                              <MenuItem value="pt-BR">Português</MenuItem>
                              <MenuItem value="en">Inglês</MenuItem>
                              <MenuItem value="es">Español</MenuItem>
                            </Field>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TF name="projectName" label={i18n.t("queueIntegrationModal.form.projectName")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                      </Grid>
                    </Card>

                    <Card
                      icon={<CodeIcon style={{ fontSize: 13 }} />}
                      iconClass={classes.iconPurple}
                      title="Credenciais JSON"
                      subtitle="Cole o conteúdo do arquivo de chave de serviço do Google"
                    >
                      <TF name="jsonContent" label={i18n.t("queueIntegrationModal.form.jsonContent")}
                        touched={touched} errors={errors} classes={classes}
                        multiline minRows={6}
                      />
                    </Card>
                  </>
                )}

                {/* ════ N8N / WEBHOOK ════ */}
                {(values.type === "n8n" || values.type === "webhook") && (
                  <Card
                    icon={<LinkIcon style={{ fontSize: 13 }} />}
                    iconClass={values.type === "n8n" ? classes.iconAmber : classes.iconPurple}
                    title={`Configuração — ${TYPE_META[values.type]?.label}`}
                    subtitle="Nome de identificação e URL de destino"
                  >
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <TF name="name" label={i18n.t("queueIntegrationModal.form.name")} autoFocus touched={touched} errors={errors} classes={classes} />
                      </Grid>
                      <Grid item xs={12}>
                        <TF name="urlN8N" label={i18n.t("queueIntegrationModal.form.urlN8N")} touched={touched} errors={errors} classes={classes} />
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {/* ════ FLOWBUILDER ════ */}
                {values.type === "flowbuilder" && (
                  <Card
                    icon={<ExtensionIcon style={{ fontSize: 13 }} />}
                    iconClass={classes.iconCyan}
                    title="Configuração — FlowBuilder"
                    subtitle="Nome de identificação do fluxo"
                  >
                    <TF name="name" label={i18n.t("queueIntegrationModal.form.name")} autoFocus touched={touched} errors={errors} classes={classes} />
                  </Card>
                )}

                {/* ════ TYPEBOT ════ */}
                {values.type === "typebot" && (
                  <>
                    <Card
                      icon={<LinkIcon style={{ fontSize: 13 }} />}
                      iconClass={classes.iconGreen}
                      title="Conexão — Typebot"
                      subtitle="Nome, URL do servidor e slug do bot"
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                          <TF name="name" label={i18n.t("queueIntegrationModal.form.name")} autoFocus touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TF name="typebotSlug" label={i18n.t("queueIntegrationModal.form.typebotSlug")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={12}>
                          <TF name="urlN8N" label={i18n.t("queueIntegrationModal.form.urlN8N")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                      </Grid>
                    </Card>

                    <Card
                      icon={<TuneIcon style={{ fontSize: 13 }} />}
                      iconClass={classes.iconCyan}
                      title="Comportamento"
                      subtitle="Tempos de resposta, expiração e palavras-chave de controle"
                    >
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TF name="typebotExpires" label={i18n.t("queueIntegrationModal.form.typebotExpires")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={6}>
                          <TF name="typebotDelayMessage" label={i18n.t("queueIntegrationModal.form.typebotDelayMessage")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={6}>
                          <TF name="typebotKeywordFinish" label={i18n.t("queueIntegrationModal.form.typebotKeywordFinish")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={6}>
                          <TF name="typebotKeywordRestart" label={i18n.t("queueIntegrationModal.form.typebotKeywordRestart")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={12}>
                          <TF name="typebotUnknownMessage" label={i18n.t("queueIntegrationModal.form.typebotUnknownMessage")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                        <Grid item xs={12}>
                          <TF name="typebotRestartMessage" label={i18n.t("queueIntegrationModal.form.typebotRestartMessage")} touched={touched} errors={errors} classes={classes} />
                        </Grid>
                      </Grid>
                    </Card>
                  </>
                )}

              </DialogContent>

              {/* ── AÇÕES ── */}
              <DialogActions className={classes.dialogActions}>
                {values.type === "dialogflow" && (
                  <Button
                    variant="outlined"
                    onClick={(e) => handleTestSession(e, values)}
                    disabled={isSubmitting}
                    className={classes.testButton}
                    startIcon={<BugReportIcon style={{ fontSize: 15 }} />}
                  >
                    {i18n.t("queueIntegrationModal.buttons.test")}
                  </Button>
                )}
                <Button variant="outlined" onClick={handleClose} disabled={isSubmitting} className={classes.cancelButton}>
                  {i18n.t("queueIntegrationModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting} className={classes.submitButton}>
                    {integrationId
                      ? i18n.t("queueIntegrationModal.buttons.okEdit")
                      : i18n.t("queueIntegrationModal.buttons.okAdd")}
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

export default QueueIntegration;