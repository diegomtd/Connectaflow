import React, { useState, useEffect, useRef, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head, isNil } from "lodash";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import IconButton       from "@material-ui/core/IconButton";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box              from "@material-ui/core/Box";
import FormControl      from "@material-ui/core/FormControl";
import Grid             from "@material-ui/core/Grid";
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import Select           from "@material-ui/core/Select";
import Tab              from "@material-ui/core/Tab";
import Tabs             from "@material-ui/core/Tabs";
import Typography       from "@material-ui/core/Typography";
import Divider          from "@material-ui/core/Divider";

import AttachFileIcon    from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon         from "@material-ui/icons/Close";
import CampaignIcon      from "@material-ui/icons/Send";

import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import moment from "moment";

import { i18n }          from "../../translate/i18n";
import api               from "../../services/api";
import toastError        from "../../errors/toastError";
import { AuthContext }   from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import UserStatusIcon    from "../UserModal/statusIcon";
import useQueues         from "../../hooks/useQueues";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .cpmd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .cpmd-root ::-webkit-scrollbar { width: 4px; }
    .cpmd-root ::-webkit-scrollbar-track { background: transparent; }
    .cpmd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const CampaignSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
});

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

    /* ── Rótulo de seção ── */
    sectionLabel: {
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: textMuted,
      marginBottom: theme.spacing(1.5),
      marginTop: theme.spacing(0.5),
    },
    sectionDivider: {
      backgroundColor: divider,
      margin: theme.spacing(2.5, 0),
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
      "& .MuiFormHelperText-root": { fontSize: "0.72rem", color: textMuted },
      "& .MuiInputBase-inputMultiline": {
        fontFamily: "'JetBrains Mono', monospace !important",
        fontSize: "0.82rem",
        lineHeight: 1.6,
      },
    },
    formControl: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.85rem" },
      "& .MuiSelect-root": { fontSize: "0.85rem", color: textPrimary },
    },

    /* ── Tabs de mensagens ── */
    tabsRoot: {
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
      border: `1px solid ${border}`,
      minHeight: 38,
    },
    tabRoot: {
      minHeight: 38,
      fontSize: "0.78rem",
      fontWeight: 600,
      textTransform: "none",
      color: textMuted,
      "&.Mui-selected": { color: primary },
    },
    tabPanel: {
      paddingTop: theme.spacing(2),
    },

    /* ── Chip de anexo ── */
    attachChip: {
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 12px", borderRadius: 20,
      backgroundColor: alpha(primary, isDark ? 0.14 : 0.08),
      border: `1px solid ${alpha(primary, isDark ? 0.25 : 0.18)}`,
      color: primary, fontSize: "0.78rem", fontWeight: 600,
      maxWidth: "100%", overflow: "hidden",
      textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    attachDeleteBtn: {
      width: 28, height: 28, borderRadius: 7, padding: 0,
      border: `1px solid ${border}`,
      color: textMuted, marginLeft: 4,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.45),
        color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.1 : 0.05),
      },
    },

    /* ── DialogActions ── */
    dialogActions: {
      padding: theme.spacing(1.5, 3, 2),
      backgroundColor: isDark ? alpha("#000", 0.10) : "#f8fafc",
      borderTop: `1px solid ${border}`,
      gap: 8,
      display: "flex", justifyContent: "flex-end",
      flexWrap: "wrap",
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
    outlinedButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      borderColor: alpha(primary, isDark ? 0.28 : 0.20),
      color: primary,
      backgroundColor: alpha(primary, isDark ? 0.08 : 0.05),
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.50),
        backgroundColor: alpha(primary, isDark ? 0.14 : 0.09),
      },
    },
    dangerButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      borderColor: alpha("#ef4444", isDark ? 0.35 : 0.25),
      color: "#ef4444",
      backgroundColor: alpha("#ef4444", isDark ? 0.08 : 0.04),
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.55),
        backgroundColor: alpha("#ef4444", isDark ? 0.15 : 0.08),
      },
    },
    btnWrapper: {
      position: "relative",
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
    buttonProgress: {
      color: "#fff",
      position: "absolute", top: "50%", left: "50%",
      marginTop: -12, marginLeft: -12,
    },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
const CampaignModal = ({
  open, onClose, campaignId, initialValues, onSave, resetPagination, defaultWhatsappId,
}) => {
  const classes  = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const initialState = {
    name: "", message1: "", message2: "", message3: "", message4: "", message5: "",
    confirmationMessage1: "", confirmationMessage2: "", confirmationMessage3: "",
    confirmationMessage4: "", confirmationMessage5: "",
    status: "INATIVA", confirmation: false, scheduledAt: "",
    contactListId: "", tagListId: "", companyId,
    statusTicket: "closed", openTicket: "disabled", fileListId: "",
  };

  const [campaign, setCampaign]               = useState(initialState);
  const [whatsapps, setWhatsapps]             = useState([]);
  const [whatsappId, setWhatsappId]           = useState("");
  const [files, setFiles]                     = useState([]);
  const [contactLists, setContactLists]       = useState([]);
  const [tagLists, setTagLists]               = useState([]);
  const [messageTab, setMessageTab]           = useState(0);
  const [attachment, setAttachment]           = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile                        = useRef(null);
  const [options, setOptions]                 = useState([]);
  const [queues, setQueues]                   = useState([]);
  const [allQueues, setAllQueues]             = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [searchParam, setSearchParam]         = useState("");
  const [selectedUser, setSelectedUser]       = useState(null);
  const [selectedQueue, setSelectedQueue]     = useState(null);
  const { findAll: findAllQueues }            = useQueues();

  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    if (!campaignId && defaultWhatsappId) setWhatsappId(defaultWhatsappId);
  }, [defaultWhatsappId, campaignId]);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list);
        setQueues(list);
      };
      loadQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchParam.length < 3) { setLoading(false); setSelectedQueue(""); return; }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      api.get("/users/").then(({ data }) => { setOptions(data.users); setLoading(false); })
        .catch((err) => { setLoading(false); toastError(err); });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  useEffect(() => {
    if (!isMounted.current) return;

    if (initialValues) {
      setCampaign((prev) => ({
        ...prev, ...initialValues,
        tagListId: initialValues?.tagListId === "Nenhuma" || isNil(initialValues?.tagListId)
          ? "" : initialValues?.tagListId,
      }));
    }

    api.get("/files/", { params: { companyId } }).then(({ data }) => setFiles(data.files)).catch(toastError);
    api.get(`/contact-lists/list`, { params: { companyId } }).then(({ data }) => setContactLists(data));
    api.get(`/whatsapp`, { params: { companyId, session: 0 } }).then(({ data }) => {
      setWhatsapps(data.map((w) => ({ ...w, selected: false })));
    });
    api.get(`/tags/list`, { params: { companyId, kanban: 0 } }).then(({ data }) => {
      setTagLists(data.filter((t) => t.contacts.length > 0).map((t) => ({
        id: t.id, name: `${t.name} (${t.contacts.length})`,
      })));
    }).catch(console.error);

    if (!campaignId) return;

    api.get(`/campaigns/${campaignId}`).then(({ data }) => {
      if (data?.user)  setSelectedUser(data.user);
      if (data?.queue) setSelectedQueue(data.queue.id);
      setWhatsappId(data?.whatsappId || "");
      setCampaign((prev) => {
        const next = { ...prev };
        Object.entries(data).forEach(([key, value]) => {
          if (key === "scheduledAt" && value) next[key] = moment(value).format("YYYY-MM-DDTHH:mm");
          else if (key === "tagListId") next[key] = value === "Nenhuma" || isNil(value) ? "" : value;
          else next[key] = value === null ? "" : value;
        });
        return next;
      });
    });
  }, [campaignId, open, initialValues, companyId]);

  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour = !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    setCampaignEditable(campaign.status === "INATIVA" || (campaign.status === "PROGRAMADA" && moreThenAnHour));
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => { onClose(); setCampaign(initialState); };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) setAttachment(file);
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = { ...values, whatsappId, userId: selectedUser?.id || null, queueId: selectedQueue || null };
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value) dataValues[key] = moment(value).format("YYYY-MM-DD HH:mm:ss");
        else dataValues[key] = value === "" ? null : value;
      });
      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);
        if (attachment) {
          const fd = new FormData(); fd.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, fd);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);
        if (attachment) {
          const fd = new FormData(); fd.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, fd);
        }
        if (onSave) onSave(data);
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) { toastError(err); }
  };

  const deleteMedia = async () => {
    if (attachment) { setAttachment(null); attachmentFile.current.value = null; }
    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) { toast.error(err.message); }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "EM_ANDAMENTO" }));
      resetPagination();
    } catch (err) { toast.error(err.message); }
  };

  const filterOptions = createFilterOptions({ trim: true });

  const renderMessageField = (identifier) => (
    <Field
      as={TextField}
      id={identifier} name={identifier}
      fullWidth minRows={5} multiline
      label={i18n.t(`campaigns.dialog.form.${identifier}`)}
      placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
      variant="outlined"
      helperText="Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalizadas."
      disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      className={classes.textField}
    />
  );

  const renderConfirmationMessageField = (identifier) => (
    <Field
      as={TextField}
      id={identifier} name={identifier}
      fullWidth minRows={5} multiline
      label={i18n.t(`campaigns.dialog.form.${identifier}`)}
      placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
      variant="outlined"
      disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      className={classes.textField}
    />
  );

  const renderTabContent = (msgId, confirmId) => (
    <>
      {/* eslint-disable-next-line react/prop-types */}
      {(values) => values.confirmation ? (
        <Grid spacing={2} container>
          <Grid xs={12} md={8} item>{renderMessageField(msgId)}</Grid>
          <Grid xs={12} md={4} item>{renderConfirmationMessageField(confirmId)}</Grid>
        </Grid>
      ) : renderMessageField(msgId)}
    </>
  );

  const titleLabel = campaignEditable
    ? (campaignId ? i18n.t("campaigns.dialog.update") : i18n.t("campaigns.dialog.new"))
    : i18n.t("campaigns.dialog.readonly");

  return (
    <div className="cpmd-root">
      <FontStyle />

      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
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
                  <CampaignIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>{titleLabel}</Typography>
                  <Typography className={classes.titleSub}>
                    Campanhas · Envio em massa
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
          <input type="file" ref={attachmentFile} onChange={handleAttachmentFile} />
        </div>

        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => { handleSaveCampaign(values); actions.setSubmitting(false); }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>

                {/* ── Configurações gerais ── */}
                <Typography className={classes.sectionLabel}>
                  Configurações Gerais
                </Typography>

                <Grid container spacing={2}>
                  {/* Nome */}
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>

                  {/* Confirmação */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="confirmation-label">{i18n.t("campaigns.dialog.form.confirmation")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.confirmation")}
                        labelId="confirmation-label"
                        id="confirmation" name="confirmation"
                        error={touched.confirmation && Boolean(errors.confirmation)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value={false}>Desabilitada</MenuItem>
                        <MenuItem value={true}>Habilitada</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Agendamento */}
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                      helperText={touched.scheduledAt && errors.scheduledAt}
                      variant="outlined"
                      size="small"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>

                  {/* Lista de contatos */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="contactList-label">{i18n.t("campaigns.dialog.form.contactList")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.contactList")}
                        labelId="contactList-label"
                        id="contactListId" name="contactListId"
                        error={touched.contactListId && Boolean(errors.contactListId)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {contactLists && contactLists.map((c) => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Lista de tags */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="tagList-label">{i18n.t("campaigns.dialog.form.tagList")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.tagList")}
                        labelId="tagList-label"
                        id="tagListId" name="tagListId"
                        error={touched.tagListId && Boolean(errors.tagListId)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {Array.isArray(tagLists) && tagLists.map((t) => (
                          <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* WhatsApp */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="whatsapp-label">{i18n.t("campaigns.dialog.form.whatsapp")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.whatsapp")}
                        labelId="whatsapp-label"
                        id="whatsappIds" name="whatsappIds"
                        required
                        error={touched.whatsappId && Boolean(errors.whatsappId)}
                        disabled={!campaignEditable}
                        value={whatsappId || ""}
                        onChange={(e) => setWhatsappId(e.target.value)}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {whatsapps && whatsapps.map((w) => (
                          <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Lista de arquivos */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="fileListId-label">Lista de Arquivos</InputLabel>
                      <Field
                        as={Select}
                        label="Lista de Arquivos"
                        labelId="fileListId-label"
                        id="fileListId" name="fileListId"
                        value={values.fileListId || ""}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Nenhum</MenuItem>
                        {files.map((f) => (
                          <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider className={classes.sectionDivider} />

                {/* ── Ticket ── */}
                <Typography className={classes.sectionLabel}>
                  Configurações de Ticket
                </Typography>

                <Grid container spacing={2}>
                  {/* Abrir ticket */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="openTicket-label">{i18n.t("campaigns.dialog.form.openTicket")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.openTicket")}
                        labelId="openTicket-label"
                        id="openTicket" name="openTicket"
                        error={touched.openTicket && Boolean(errors.openTicket)}
                        disabled={!campaignEditable}
                      >
                        <MenuItem value={"enabled"}>{i18n.t("campaigns.dialog.form.enabledOpenTicket")}</MenuItem>
                        <MenuItem value={"disabled"}>{i18n.t("campaigns.dialog.form.disabledOpenTicket")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Status do ticket */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="statusTicket-label">{i18n.t("campaigns.dialog.form.statusTicket")}</InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.statusTicket")}
                        labelId="statusTicket-label"
                        id="statusTicket" name="statusTicket"
                        error={touched.statusTicket && Boolean(errors.statusTicket)}
                        disabled={!campaignEditable || values.openTicket === "disabled"}
                      >
                        <MenuItem value={"closed"}>{i18n.t("campaigns.dialog.form.closedTicketStatus")}</MenuItem>
                        <MenuItem value={"pending"}>{i18n.t("campaigns.dialog.form.pendingTicketStatus")}</MenuItem>
                        <MenuItem value={"open"}>{i18n.t("campaigns.dialog.form.openTicketStatus")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Atendente */}
                  <Grid xs={12} md={4} item>
                    <Autocomplete
                      getOptionLabel={(option) => `${option.name}`}
                      value={selectedUser}
                      size="small"
                      onChange={(e, newValue) => {
                        setSelectedUser(newValue);
                        if (newValue != null && Array.isArray(newValue.queues)) {
                          if (newValue.queues.length === 1) setSelectedQueue(newValue.queues[0].id);
                          setQueues(newValue.queues);
                        } else {
                          setQueues(allQueues);
                          setSelectedQueue("");
                        }
                      }}
                      options={options}
                      filterOptions={filterOptions}
                      freeSolo fullWidth autoHighlight
                      disabled={!campaignEditable || values.openTicket === "disabled"}
                      noOptionsText={i18n.t("transferTicketModal.noOptions")}
                      loading={loading}
                      renderOption={(option) => <span><UserStatusIcon user={option} /> {option.name}</span>}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("transferTicketModal.fieldLabel")}
                          variant="outlined"
                          onChange={(e) => setSearchParam(e.target.value)}
                          className={classes.textField}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Fila */}
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel>{i18n.t("transferTicketModal.fieldQueueLabel")}</InputLabel>
                      <Select
                        value={selectedQueue}
                        onChange={(e) => setSelectedQueue(e.target.value)}
                        label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
                        required={!isNil(selectedUser)}
                        disabled={!campaignEditable || values.openTicket === "disabled"}
                      >
                        {queues.map((q) => (
                          <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider className={classes.sectionDivider} />

                {/* ── Mensagens ── */}
                <Typography className={classes.sectionLabel}>
                  Mensagens
                </Typography>

                <Tabs
                  value={messageTab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={(e, v) => setMessageTab(v)}
                  variant="fullWidth"
                  classes={{ root: classes.tabsRoot }}
                >
                  {["Msg. 1", "Msg. 2", "Msg. 3", "Msg. 4", "Msg. 5"].map((label, i) => (
                    <Tab key={i} label={label} classes={{ root: classes.tabRoot }} />
                  ))}
                </Tabs>

                <Box className={classes.tabPanel}>
                  {[
                    ["message1", "confirmationMessage1"],
                    ["message2", "confirmationMessage2"],
                    ["message3", "confirmationMessage3"],
                    ["message4", "confirmationMessage4"],
                    ["message5", "confirmationMessage5"],
                  ].map(([msgId, confirmId], i) =>
                    messageTab === i && (
                      <React.Fragment key={msgId}>
                        {values.confirmation ? (
                          <Grid spacing={2} container>
                            <Grid xs={12} md={8} item>{renderMessageField(msgId)}</Grid>
                            <Grid xs={12} md={4} item>{renderConfirmationMessageField(confirmId)}</Grid>
                          </Grid>
                        ) : renderMessageField(msgId)}
                      </React.Fragment>
                    )
                  )}
                </Box>

                {/* ── Anexo ── */}
                {(campaign.mediaPath || attachment) && (
                  <Box style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 16 }}>
                    <Box className={classes.attachChip}>
                      <AttachFileIcon style={{ fontSize: 14, flexShrink: 0 }} />
                      {attachment != null ? attachment.name : campaign.mediaName}
                    </Box>
                    {campaignEditable && (
                      <IconButton
                        size="small"
                        className={classes.attachDeleteBtn}
                        onClick={() => setConfirmationOpen(true)}
                      >
                        <DeleteOutlineIcon style={{ fontSize: 15 }} />
                      </IconButton>
                    )}
                  </Box>
                )}

              </DialogContent>

              {/* ── Ações ────────────────────────────────────────── */}
              <DialogActions className={classes.dialogActions}>

                {campaign.status === "CANCELADA" && (
                  <Button variant="outlined" onClick={restartCampaign} className={classes.outlinedButton}>
                    {i18n.t("campaigns.dialog.buttons.restart")}
                  </Button>
                )}

                {campaign.status === "EM_ANDAMENTO" && (
                  <Button variant="outlined" onClick={cancelCampaign} className={classes.dangerButton}>
                    {i18n.t("campaigns.dialog.buttons.cancel")}
                  </Button>
                )}

                {!attachment && !campaign.mediaPath && campaignEditable && (
                  <Button
                    variant="outlined"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    startIcon={<AttachFileIcon style={{ fontSize: 15 }} />}
                    className={classes.outlinedButton}
                  >
                    {i18n.t("campaigns.dialog.buttons.attach")}
                  </Button>
                )}

                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>

                {(campaignEditable || campaign.status === "CANCELADA") && (
                  <div className={classes.btnWrapper}>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                      className={classes.submitButton}
                    >
                      {campaignId
                        ? i18n.t("campaigns.dialog.buttons.edit")
                        : i18n.t("campaigns.dialog.buttons.add")}
                    </Button>
                    {isSubmitting && (
                      <CircularProgress size={24} className={classes.buttonProgress} />
                    )}
                  </div>
                )}

              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CampaignModal;