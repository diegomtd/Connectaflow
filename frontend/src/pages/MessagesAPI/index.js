import React, { useState, useEffect, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme as useMuiThemeV5 } from "@mui/material/styles";
import { useTheme as useMuiThemeV4 } from "@material-ui/core/styles";
import {
  Api,
  Code,
  FiberManualRecord,
  Send,
} from "@mui/icons-material";

import { Field, Form, Formik } from "formik";
import axios from "axios";

import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ─── Estilos globais (idênticos ao Dashboard) ───────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    .api-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .api-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .api-root { max-width: 100%; overflow-x: hidden; }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .api-animate { animation: fadeSlideUp 0.36s ease both; }

    .api-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .api-root ::-webkit-scrollbar-track { background: transparent; }
    .api-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

/* ─── usePalette (idêntico ao Dashboard) ─────────────────────────────────── */
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
      pageBg:      "#080e1a",
      surfaceBg:   "#0f1929",
      surfaceBg2:  "#141f30",
      border:      "rgba(255,255,255,0.065)",
      divider:     "rgba(255,255,255,0.055)",
      textPrimary: "#f0f4f8",
      textSecond:  "#8fa4be",
      textMuted:   "#4d6478",
      codeBg:      "#060d18",
      codeText:    "#7dd3fc",
      inputBg:     "rgba(255,255,255,0.04)",
      inputBorder: "rgba(255,255,255,0.12)",
      inputHover:  "rgba(255,255,255,0.22)",
    } : {
      pageBg:      "#f0f4f8",
      surfaceBg:   "#ffffff",
      surfaceBg2:  "#fafbfd",
      border:      "#e3eaf2",
      divider:     "#e8eef4",
      textPrimary: "#0d1b2a",
      textSecond:  "#3d5166",
      textMuted:   "#8fa0b0",
      codeBg:      "#f1f5f9",
      codeText:    "#1e40af",
      inputBg:     "rgba(0,0,0,0.018)",
      inputBorder: "#dbe4ed",
      inputHover:  "#a8b8c8",
    };

    return { primary, isDark, ...t };
  }, [primary, isDark]);
};

/* ─── SectionLabel (idêntico ao Dashboard) ───────────────────────────────── */
const SectionLabel = ({ children, p }) => (
  <Typography sx={{
    fontSize: { xs: 9.5, sm: 11 }, color: p.textMuted,
    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em",
  }}>
    {children}
  </Typography>
);

/* ─── CodeBlock ───────────────────────────────────────────────────────────── */
const CodeBlock = ({ children, p }) => (
  <Box component="pre" sx={{
    m: 0, p: { xs: "10px 12px", sm: "12px 14px" },
    borderRadius: "10px",
    backgroundColor: p.codeBg,
    border: `1px solid ${p.isDark ? "rgba(255,255,255,0.08)" : "#dde5ef"}`,
    color: p.codeText,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace !important",
    lineHeight: 1.75,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  }}>
    {children}
  </Box>
);

/* ─── EndpointRow ─────────────────────────────────────────────────────────── */
const EndpointRow = ({ label, value, p }) => (
  <Stack direction="row" spacing={0.75} alignItems="flex-start">
    <Typography sx={{
      fontSize: 11.5, fontWeight: 700, color: p.primary,
      minWidth: 68, flexShrink: 0, pt: 0.1,
    }}>
      {label}:
    </Typography>
    <Typography sx={{ fontSize: 11.5, color: p.textMuted, wordBreak: "break-all", lineHeight: 1.55 }}>
      {value}
    </Typography>
  </Stack>
);

/* ─── FormField ───────────────────────────────────────────────────────────── */
const FormField = ({ name, label, required, p, ...rest }) => (
  <Field
    as={TextField}
    name={name}
    label={label}
    variant="outlined"
    margin="dense"
    fullWidth
    required={required}
    size="small"
    InputProps={{
      sx: {
        borderRadius: "10px", fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: p.inputBg,
        color: p.textPrimary,
        "& fieldset": { borderColor: p.inputBorder },
        "&:hover fieldset": { borderColor: p.inputHover },
        "&.Mui-focused fieldset": { borderColor: p.primary, borderWidth: "1.5px" },
      },
    }}
    InputLabelProps={{ sx: { fontSize: 13, color: p.textMuted, fontFamily: "'DM Sans', sans-serif" } }}
    {...rest}
  />
);

/* ─── SendForm ────────────────────────────────────────────────────────────── */
const SendForm = ({ initialValues, onSubmit, hasFile = false, p, setFile }) => (
  <Formik
    initialValues={initialValues}
    enableReinitialize
    onSubmit={(values, actions) => {
      setTimeout(async () => {
        await onSubmit(values);
        actions.setSubmitting(false);
        actions.resetForm();
        if (hasFile) {
          const el = document.getElementById("medias");
          if (el) { el.files = null; el.value = null; }
        }
      }, 400);
    }}
  >
    {({ isSubmitting }) => (
      <Form>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <FormField
              name="token"
              label={i18n.t(`messagesAPI.${hasFile ? "mediaMessage" : "textMessage"}.token`)}
              required
              p={p}
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              name="number"
              label={i18n.t(`messagesAPI.${hasFile ? "mediaMessage" : "textMessage"}.number`)}
              required
              p={p}
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              name="body"
              label={i18n.t("messagesAPI.textMessage.body")}
              required={!hasFile}
              p={p}
            />
          </Grid>
          <Grid item xs={6}>
            <FormField name="userId"  label={i18n.t("messagesAPI.textMessage.userId")}  p={p} />
          </Grid>
          <Grid item xs={6}>
            <FormField name="queueId" label={i18n.t("messagesAPI.textMessage.queueId")} p={p} />
          </Grid>

          {hasFile && (
            <Grid item xs={12}>
              <Box sx={{
                p: "10px 12px", borderRadius: "10px",
                border: `1.5px dashed ${alpha(p.primary, p.isDark ? 0.30 : 0.22)}`,
                backgroundColor: alpha(p.primary, p.isDark ? 0.06 : 0.03),
              }}>
                <Typography sx={{
                  fontSize: 11, color: p.textMuted,
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.6,
                }}>
                  Arquivo de mídia *
                </Typography>
                <input
                  type="file"
                  name="medias"
                  id="medias"
                  required
                  onChange={(e) => setFile(e.target.files)}
                  style={{ fontSize: 13, color: p.textSecond, fontFamily: "'DM Sans', sans-serif" }}
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12} sx={{ textAlign: "right", mt: 0.5 }}>
            <Button
              type="submit"
              variant="contained"
              disableElevation
              startIcon={isSubmitting ? null : <Send sx={{ fontSize: 14 }} />}
              sx={{
                position: "relative", overflow: "hidden",
                backgroundColor: p.primary, color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fontSize: 13, textTransform: "none",
                borderRadius: "10px", height: 36, px: 2.5,
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
              {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "Enviar"}
            </Button>
          </Grid>
        </Grid>
      </Form>
    )}
  </Formik>
);

/* ─── MessagePanel — doc + form em SubPaper ───────────────────────────────── */
const MessagePanel = ({ title, number, instructions, endpointRows, codeSnippet, initialValues, onSubmit, hasFile, p, setFile }) => (
  <Paper
    elevation={0}
    className="api-animate"
    sx={{
      height: "100%",
      borderRadius: "14px",
      border: `1px solid ${p.border}`,
      backgroundColor: p.surfaceBg,
      p: { xs: "14px", sm: "18px 20px" },
      display: "flex", flexDirection: "column", gap: 2,
    }}
  >
    {/* Cabeçalho do painel */}
    <Box>
      <SectionLabel p={p}>Método {number}</SectionLabel>
      <Typography sx={{
        fontSize: { xs: 14, sm: 15.5 }, fontWeight: 700,
        color: p.textPrimary, mt: 0.3, lineHeight: 1.2,
      }}>
        {title}
      </Typography>
    </Box>

    {/* Instruções */}
    <Typography sx={{ fontSize: 12.5, color: p.textSecond, lineHeight: 1.65 }}>
      {instructions}
    </Typography>

    {/* Endpoint / método / headers */}
    <Stack spacing={0.5}>
      {endpointRows.map(([k, v]) => (
        <EndpointRow key={k} label={k} value={v} p={p} />
      ))}
    </Stack>

    {/* Código de exemplo */}
    <CodeBlock p={p}>{codeSnippet}</CodeBlock>

    {/* Divisor com label */}
    <Stack direction="row" alignItems="center" spacing={1.2}>
      <Box sx={{ flex: 1, height: "1px", backgroundColor: p.divider }} />
      <Stack direction="row" spacing={0.6} alignItems="center">
        <Code sx={{ fontSize: 13, color: p.primary }} />
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: p.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Teste de Envio
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, height: "1px", backgroundColor: p.divider }} />
    </Stack>

    {/* Formulário */}
    <SendForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      hasFile={hasFile}
      p={p}
      setFile={setFile}
    />
  </Paper>
);

/* ─── MessagesAPI ─────────────────────────────────────────────────────────── */
const MessagesAPI = () => {
  const p       = usePalette();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();

  const [file, setFile] = useState({});

  const [formMessageTextData]  = useState({ token: "", number: "", body: "",   userId: "", queueId: "" });
  const [formMessageMediaData] = useState({ token: "", number: "", medias: "", body: "", userId: "", queueId: "" });

  useEffect(() => {
    async function fetchData() {
      const companyId   = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => history.push("/"), 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send";

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    try {
      await axios.request({
        url: getEndpoint(), method: "POST",
        data: { number, body, userId, queueId },
        headers: { "Content-type": "application/json", "Authorization": `Bearer ${values.token}` },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append("number",  values.number);
      data.append("body",    values.body ? values.body : firstFile.name);
      data.append("userId",  values.userId);
      data.append("queueId", values.queueId);
      data.append("medias",  firstFile);
      await axios.request({
        url: getEndpoint(), method: "POST", data,
        headers: { "Content-type": "multipart/form-data", "Authorization": `Bearer ${values.token}` },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const endpointInfo = [
    ["Endpoint", getEndpoint()],
    ["Método",   "POST"],
  ];

  return (
    <Box
      className="api-root"
      sx={{
        width: "100%",
        minHeight: "calc(100% - 48px)",
        py: 0, px: 0,
        backgroundColor: p.pageBg,
        transition: "background-color 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FontStyle />

      {/* ══ CABEÇALHO CORPORATIVO (idêntico ao Dashboard) ══════════════════ */}
      <Box sx={{
        background: p.isDark
          ? `linear-gradient(135deg, #0d1b2e 0%, #0a1520 60%, ${alpha(p.primary, 0.12)} 100%)`
          : `linear-gradient(135deg, ${p.primary} 0%, ${alpha(p.primary, 0.82)} 55%, ${alpha("#0ea5e9", 0.9)} 100%)`,
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3, md: 3.5 },
        pb: { xs: 2, sm: 2.5, md: 3 },
        position: "relative", overflow: "hidden",
      }}>
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

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Breadcrumb */}
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.8 }}>
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha(p.primary, 0.8) : alpha("#fff", 0.7),
              }}>
                Integrações
              </Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: p.isDark ? alpha(p.primary, 0.5) : alpha("#fff", 0.45) }} />
              <Typography sx={{
                fontSize: { xs: 10, sm: 11 }, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: p.isDark ? alpha("#fff", 0.5) : alpha("#fff", 0.55),
              }}>
                API de Mensagens
              </Typography>
            </Stack>

            {/* Título */}
            <Typography sx={{
              fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: p.isDark ? p.textPrimary : "#ffffff",
            }}>
              {i18n.t("messagesAPI.API.title")}
            </Typography>

            {/* Subtítulo */}
            <Typography sx={{
              fontSize: { xs: 12, sm: 13.5 }, mt: 0.6,
              color: p.isDark ? p.textMuted : alpha("#fff", 0.72),
              display: { xs: "none", sm: "block" },
            }}>
              Envie mensagens de texto e mídia via requisição HTTP autenticada.
            </Typography>

            {/* Meta-tags */}
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.2, sm: 1.5 }, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { icon: <FiberManualRecord sx={{ fontSize: 8 }} />, label: "REST API" },
                { icon: <Api sx={{ fontSize: 12 }} />,             label: "HTTP · Bearer Token" },
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
        </Stack>
      </Box>

      {/* ── Conteúdo ── */}
      <Box sx={{
        px: { xs: 1, sm: 1.5, md: 2.5 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        flex: 1, display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2 },
      }}>

        {/* ── Visão geral + Instruções ── */}
        <Paper
          elevation={0}
          className="api-animate"
          sx={{
            borderRadius: "14px",
            border: `1px solid ${p.border}`,
            backgroundColor: p.surfaceBg,
            p: { xs: "14px", sm: "18px 20px" },
            animationDelay: "80ms",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.5, pb: 1.5, borderBottom: `1px solid ${p.divider}` }}
          >
            <Box>
              <SectionLabel p={p}>Visão geral</SectionLabel>
              <Typography sx={{
                fontSize: { xs: 13.5, sm: 15 }, fontWeight: 700,
                color: p.textPrimary, mt: 0.3,
              }}>
                {i18n.t("messagesAPI.API.methods.title")}
              </Typography>
            </Box>
            {/* Badge REST */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.7,
              px: 1.3, py: 0.45, borderRadius: "8px",
              backgroundColor: alpha(p.primary, p.isDark ? 0.14 : 0.08),
              border: `1px solid ${alpha(p.primary, p.isDark ? 0.25 : 0.16)}`,
            }}>
              <Api sx={{ fontSize: 14, color: p.primary }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: p.primary }}>
                REST API
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            {/* Métodos disponíveis */}
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.8}>
                {[
                  i18n.t("messagesAPI.API.methods.messagesText"),
                  i18n.t("messagesAPI.API.methods.messagesMidia"),
                ].map((m, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{
                      width: 20, height: 20, borderRadius: "6px", flexShrink: 0,
                      backgroundColor: alpha(p.primary, p.isDark ? 0.16 : 0.09),
                      color: p.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10.5, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      border: `1px solid ${alpha(p.primary, p.isDark ? 0.22 : 0.14)}`,
                    }}>
                      {i + 1}
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: p.textSecond, lineHeight: 1.6 }}>
                      {m}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            {/* Instruções de número */}
            <Grid item xs={12} sm={6}>
              <Box sx={{
                p: "10px 14px", borderRadius: "10px",
                backgroundColor: alpha(p.primary, p.isDark ? 0.08 : 0.04),
                border: `1px solid ${alpha(p.primary, p.isDark ? 0.18 : 0.10)}`,
              }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: p.primary, mb: 0.6 }}>
                  {i18n.t("messagesAPI.API.instructions.title")}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: p.textSecond, mb: 0.5 }}>
                  {i18n.t("messagesAPI.API.instructions.comments")}
                </Typography>
                <Stack spacing={0.35}>
                  {[
                    i18n.t("messagesAPI.API.instructions.comments1"),
                    `${i18n.t("messagesAPI.API.instructions.comments2")}: ${i18n.t("messagesAPI.API.instructions.codeCountry")} + ${i18n.t("messagesAPI.API.instructions.code")} + ${i18n.t("messagesAPI.API.instructions.number")}`,
                  ].map((item, i) => (
                    <Stack key={i} direction="row" spacing={0.7} alignItems="flex-start">
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: p.textMuted, mt: 0.75, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12, color: p.textMuted, lineHeight: 1.55 }}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ══ Painéis lado a lado: Texto (esquerda) · Mídia (direita) ═════════ */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ flex: 1, alignItems: "stretch" }}>

          {/* ── 1. Mensagens de Texto ── */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <MessagePanel
              title={i18n.t("messagesAPI.API.text.title")}
              number="01"
              instructions={i18n.t("messagesAPI.API.text.instructions")}
              endpointRows={[
                ...endpointInfo,
                ["Headers", "Authorization Bearer · Content-Type: application/json"],
              ]}
              codeSnippet={`{
  "number":        "558599999999",
  "body":          "Mensagem",
  "userId":        ID do usuário ou "",
  "queueId":       ID da fila ou "",
  "sendSignature": true | false,
  "closeTicket":   true | false
}`}
              initialValues={formMessageTextData}
              onSubmit={handleSendTextMessage}
              hasFile={false}
              p={p}
              setFile={setFile}
            />
          </Grid>

          {/* ── 2. Mensagens de Mídia ── */}
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <MessagePanel
              title={i18n.t("messagesAPI.API.media.title")}
              number="02"
              instructions={i18n.t("messagesAPI.API.media.instructions")}
              endpointRows={[
                ...endpointInfo,
                ["Headers", "Authorization Bearer · Content-Type: multipart/form-data"],
              ]}
              codeSnippet={`FormData:
  number:        558599999999
  body:          Mensagem (opcional)
  userId:        ID do usuário ou ""
  queueId:       ID da fila ou ""
  medias:        arquivo
  sendSignature: true | false
  closeTicket:   true | false`}
              initialValues={formMessageMediaData}
              onSubmit={handleSendMediaMessage}
              hasFile={true}
              p={p}
              setFile={setFile}
            />
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default MessagesAPI;