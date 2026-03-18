import React, { useState, useEffect, useRef, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton       from "@material-ui/core/IconButton";
import ListItemText     from "@material-ui/core/ListItemText";
import MenuItem         from "@material-ui/core/MenuItem";
import Select           from "@material-ui/core/Select";
import Typography       from "@material-ui/core/Typography";
import Box              from "@material-ui/core/Box";
import Divider          from "@material-ui/core/Divider";

import CloseIcon  from "@material-ui/icons/Close";
import FlashOnIcon from "@material-ui/icons/FlashOn";

import { Autocomplete, Checkbox, Chip, Stack } from "@mui/material";

import { i18n }        from "../../translate/i18n";
import api             from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
    .cmpf-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .cmpf-root ::-webkit-scrollbar { width: 4px; }
    .cmpf-root ::-webkit-scrollbar-track { background: transparent; }
    .cmpf-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

/* ─── makeStyles ──────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg   = isDark ? "#0f1929" : "#ffffff";
  const headerBg    = isDark ? "#0b1520" : "#f8fafc";
  const border      = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const divider     = isDark ? "rgba(255,255,255,0.055)" : "#e8eef4";
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
    },

    /* ── Cabeçalho limpo / corporativo ── */
    dialogTitle: {
      padding: 0,
      "& > *": { padding: 0 },
    },
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
    titleSub: {
      fontSize: 11, marginTop: 3,
      color: textMuted,
    },
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

    /* ── DialogContent ── */
    dialogContent: {
      padding: theme.spacing(2.5, 3),
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${divider}`,
    },

    /* ── Rótulo de campo ── */
    fieldLabel: {
      fontSize: "0.78rem",
      fontWeight: 600,
      color: textSecond,
      marginBottom: 6,
    },
    sectionDivider: {
      backgroundColor: divider,
      margin: theme.spacing(2, 0),
    },

    /* ── Campos ── */
    textField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.85rem" },
      "& .MuiInputBase-input": { fontSize: "0.85rem", color: textPrimary },
    },

    /* ── Select de conexão ── */
    connectionSelect: {
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
      fontSize: "0.85rem",
      color: textPrimary,
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: primary,
        borderWidth: "1.5px",
      },
    },

    /* ── Status row ── */
    statusRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(1, 1.5),
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
      border: `1px solid ${border}`,
    },
    statusLabel: {
      fontSize: "0.83rem",
      fontWeight: 500,
      color: textPrimary,
    },

    /* ── Badge de status de conexão ── */
    online: {
      color: "#22c55e",
      fontWeight: 700,
      fontSize: "0.72rem",
    },
    offline: {
      color: "#ef4444",
      fontWeight: 700,
      fontSize: "0.72rem",
    },

    /* ── Loading ── */
    loadingWrap: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 220,
    },

    /* ── DialogActions ── */
    dialogActions: {
      padding: theme.spacing(1.5, 3, 2),
      backgroundColor: isDark ? alpha("#000", 0.10) : "#f8fafc",
      borderTop: `1px solid ${border}`,
      gap: 8,
      display: "flex", justifyContent: "flex-end",
    },
    cancelButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      borderColor: border, color: textSecond,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: textSecond,
        backgroundColor: alpha(textSecond, isDark ? 0.07 : 0.04),
      },
    },
    submitButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 700, fontSize: "0.82rem",
      color: "#fff",
      boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 3px 12px ${alpha(primary, 0.30)}`,
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 1px 0 inset rgba(255,255,255,0.18), 0 6px 22px ${alpha(primary, 0.42)}`,
      },
    },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
const CampaignModalPhrase = ({ open, onClose, FlowCampaignId, onSave, defaultWhatsappId }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const attachmentFile = useRef(null);

  const [dataItem, setDataItem]           = useState({ name: "", phrase: "" });
  const [dataItemError, setDataItemError] = useState({ name: false, flowId: false, phrase: false, whatsappId: false });
  const [flowSelected, setFlowSelected]   = useState();
  const [flowsData, setFlowsData]         = useState([]);
  const [flowsDataComplete, setFlowsDataComplete] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp]   = useState("");
  const [whatsApps, setWhatsApps]         = useState([]);
  const [active, setActive]               = useState(true);
  const [loading, setLoading]             = useState(true);

  /* ── Pré-selecionar conexão do localStorage ── */
  useEffect(() => {
    if (!FlowCampaignId) {
      const stored = localStorage.getItem("selectedWhatsappId");
      if (stored) setSelectedWhatsapp(parseInt(stored));
    }
  }, [FlowCampaignId]);

  /* ── Buscar WhatsApps ── */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      api.get(`/whatsapp`, { params: { companyId, session: 0 } })
        .then(({ data }) => setWhatsApps(data));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  /* ── Abrir modal ── */
  useEffect(() => {
    if (open) {
      setLoading(true);
      openModal();
    }
  }, [open]);

  const getFlows = async () => {
    const flows = await api.get("/flowbuilder");
    setFlowsDataComplete(flows.data.flows);
    setFlowsData(flows.data.flows.map((f) => f.name));
    return flows.data.flows;
  };

  const detailsPhrase = async (flows) => {
    const res = await api.get(`/flowcampaign/${FlowCampaignId}`);
    setDataItem({ name: res.data.details.name, phrase: res.data.details.phrase });
    setActive(res.data.details.status);
    const nameFlow = flows.filter((f) => f.id === res.data.details.flowId);
    if (nameFlow.length > 0) {
      setFlowSelected(nameFlow[0].name);
      if (res.data.details.whatsappId) setSelectedWhatsapp(res.data.details.whatsappId);
    }
    setLoading(false);
  };

  const openModal = async () => {
    const flows = await getFlows();
    if (FlowCampaignId) {
      await detailsPhrase(flows);
    } else {
      clearData();
      setLoading(false);
    }
  };

  const clearData = () => {
    setFlowSelected();
    setDataItem({ name: "", phrase: "" });
  };

  const clearErrors = () => {
    setDataItemError({ name: false, flowId: false, whatsappId: false, phrase: false });
  };

  const handleClose = () => { onClose(); clearErrors(); };

  const applicationSaveAndEdit = () => {
    let error = 0;
    if (!dataItem.name) { setDataItemError((o) => ({ ...o, name: true })); error++; }
    if (!flowSelected)  { setDataItemError((o) => ({ ...o, flowId: true })); error++; }
    if (!dataItem.phrase) { setDataItemError((o) => ({ ...o, phrase: true })); error++; }
    if (!selectedWhatsapp) { setDataItemError((o) => ({ ...o, whatsappId: true })); error++; }
    if (error !== 0) return;

    const idFlow     = flowsDataComplete.find((f) => f.name === flowSelected)?.id;
    const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null;

    if (FlowCampaignId) {
      api.put("/flowcampaign", { id: FlowCampaignId, name: dataItem.name, flowId: idFlow, whatsappId, phrase: dataItem.phrase, status: active });
      toast.success("Frase alterada com sucesso!");
    } else {
      api.post("/flowcampaign", { name: dataItem.name, flowId: idFlow, whatsappId, phrase: dataItem.phrase });
      toast.success("Frase criada com sucesso!");
    }
    onClose();
    onSave("ok");
    clearData();
  };

  return (
    <div className="cmpf-root">
      <FontStyle />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: classes.dialogPaper, elevation: 0 }}
        BackdropProps={{
          style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
        }}
      >
        {/* ── CABEÇALHO LIMPO ───────────────────────────────────────── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}>
                  <FlashOnIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {FlowCampaignId
                      ? "Editar campanha por frase"
                      : "Nova campanha por frase"}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Campanhas · Disparo por palavra-chave
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={handleClose} className={classes.closeButton}>
                <CloseIcon style={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        {/* Input de arquivo oculto */}
        <div style={{ display: "none" }}>
          <input type="file" ref={attachmentFile} />
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <Box className={classes.loadingWrap}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* ── CONTEÚDO ── */}
        {!loading && (
          <>
            <DialogContent className={classes.dialogContent}>
              <Stack gap={2.5}>

                {/* Nome */}
                <Stack gap={0.5}>
                  <Typography className={classes.fieldLabel}>
                    Nome do disparo por frase
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    error={dataItemError.name}
                    helperText={dataItemError.name && "Campo obrigatório"}
                    defaultValue={dataItem.name}
                    onChange={(e) => setDataItem((o) => ({ ...o, name: e.target.value }))}
                    fullWidth
                    className={classes.textField}
                  />
                </Stack>

                {/* Fluxo */}
                <Stack gap={0.5}>
                  <Typography className={classes.fieldLabel}>
                    Escolha um fluxo
                  </Typography>
                  <Autocomplete
                    disablePortal
                    value={flowSelected}
                    defaultValue={flowSelected}
                    options={flowsData}
                    onChange={(_, newValue) => setFlowSelected(newValue)}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={dataItemError.flowId}
                        helperText={dataItemError.flowId && "Campo obrigatório"}
                        variant="outlined"
                        size="small"
                        placeholder="Selecione um fluxo"
                        className={classes.textField}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          style={{ borderRadius: 8 }}
                        />
                      ))
                    }
                  />
                </Stack>

                {/* Conexão */}
                <Stack gap={0.5}>
                  <Typography className={classes.fieldLabel}>
                    Conexão WhatsApp
                  </Typography>
                  <Select
                    required
                    fullWidth
                    displayEmpty
                    variant="outlined"
                    value={selectedWhatsapp}
                    error={dataItemError.whatsappId}
                    onChange={(e) => setSelectedWhatsapp(e.target.value)}
                    className={classes.connectionSelect}
                    style={{ borderRadius: 10 }}
                    MenuProps={{
                      anchorOrigin:    { vertical: "bottom", horizontal: "left" },
                      transformOrigin: { vertical: "top",    horizontal: "left" },
                      getContentAnchorEl: null,
                    }}
                    renderValue={() => {
                      if (selectedWhatsapp === "") return (
                        <span style={{ opacity: 0.45 }}>Selecione uma conexão</span>
                      );
                      const w = whatsApps.find((w) => w.id === selectedWhatsapp);
                      return w ? w.name : "Selecione uma conexão";
                    }}
                  >
                    {whatsApps?.map((whatsapp, key) => (
                      <MenuItem dense key={key} value={whatsapp.id}>
                        <ListItemText
                          primary={
                            <Box style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                              {whatsapp.name}
                              <span className={whatsapp.status === "CONNECTED" ? classes.online : classes.offline}>
                                ({whatsapp.status})
                              </span>
                            </Box>
                          }
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {dataItemError.whatsappId && (
                    <Typography style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>
                      Campo obrigatório
                    </Typography>
                  )}
                </Stack>

                {/* Frase */}
                <Stack gap={0.5}>
                  <Typography className={classes.fieldLabel}>
                    Qual frase dispara o fluxo?
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    error={dataItemError.phrase}
                    helperText={dataItemError.phrase && "Campo obrigatório"}
                    defaultValue={dataItem.phrase}
                    onChange={(e) => setDataItem((o) => ({ ...o, phrase: e.target.value }))}
                    fullWidth
                    className={classes.textField}
                  />
                </Stack>

                {/* Status */}
                <Box className={classes.statusRow}>
                  <Typography className={classes.statusLabel}>
                    Campanha ativa
                  </Typography>
                  <Checkbox
                    checked={active}
                    onChange={() => setActive((o) => !o)}
                    color="primary"
                    size="small"
                  />
                </Box>

              </Stack>
            </DialogContent>

            {/* ── Ações ── */}
            <DialogActions className={classes.dialogActions}>
              <Button
                variant="outlined"
                onClick={handleClose}
                className={classes.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={applicationSaveAndEdit}
                className={classes.submitButton}
              >
                {FlowCampaignId ? "Salvar campanha" : "Criar campanha"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default CampaignModalPhrase;