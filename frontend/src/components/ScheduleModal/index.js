import React, { useState, useEffect, useContext, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl      from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid             from "@material-ui/core/Grid";
import IconButton       from "@material-ui/core/IconButton";
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import Select           from "@material-ui/core/Select";
import Switch           from "@material-ui/core/Switch";
import Typography       from "@material-ui/core/Typography";
import Box              from "@material-ui/core/Box";
import Divider          from "@material-ui/core/Divider";

import DeleteOutline     from "@material-ui/icons/DeleteOutline";
import AttachFileIcon    from "@material-ui/icons/AttachFile";
import CloseIcon         from "@material-ui/icons/Close";
import ScheduleIcon      from "@material-ui/icons/Schedule";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";

import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import moment    from "moment";
import { isArray, capitalize } from "lodash";
import { head } from "lodash";

import { i18n }               from "../../translate/i18n";
import api                    from "../../services/api";
import toastError             from "../../errors/toastError";
import { AuthContext }        from "../../context/Auth/AuthContext";
import ConfirmationModal      from "../ConfirmationModal";
import MessageVariablesPicker from "../MessageVariablesPicker";
import useQueues              from "../../hooks/useQueues";
import UserStatusIcon         from "../UserModal/statusIcon";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .smd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .smd-root ::-webkit-scrollbar { width: 4px; }
    .smd-root ::-webkit-scrollbar-track { background: transparent; }
    .smd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const ScheduleSchema = Yup.object().shape({
  body:      Yup.string().min(5, "Mensagem muito curta").required("Obrigatório"),
  contactId: Yup.number().required("Obrigatório"),
  sendAt:    Yup.string().required("Obrigatório"),
});

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
      display: "flex",
      flexDirection: "column",
      maxHeight: "90vh",
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
      flexShrink: 0,
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
      overflowY: "auto",
      flex: "1 1 auto",
      "&::-webkit-scrollbar": { width: 5 },
      "&::-webkit-scrollbar-track": { background: "transparent" },
      "&::-webkit-scrollbar-thumb": {
        background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        borderRadius: 4,
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)",
      },
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

    /* ── Bloco de recorrência ── */
    recurrenceBox: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.012)",
      padding: theme.spacing(2),
    },
    recurrenceDesc: {
      fontSize: "0.78rem",
      color: textMuted,
      lineHeight: 1.6,
      marginBottom: theme.spacing(1.5),
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
      flexShrink: 0,
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
    attachButton: {
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
const ScheduleModal = ({ open, onClose, scheduleId, contactId, cleanContact, reload }) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const isMounted = useRef(true);
  const { companyId } = user;

  const initialState = {
    body: "",
    contactId: "",
    sendAt: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
    sentAt: "",
    openTicket: "enabled",
    ticketUserId: "",
    queueId: "",
    statusTicket: "closed",
    intervalo: 1,
    valorIntervalo: 0,
    enviarQuantasVezes: 1,
    tipoDias: 4,
    assinar: false,
  };

  const initialContact = { id: "", name: "", channel: "" };

  const [schedule, setSchedule]               = useState(initialState);
  const [currentContact, setCurrentContact]   = useState(initialContact);
  const [contacts, setContacts]               = useState([initialContact]);
  const [intervalo, setIntervalo]             = useState(1);
  const [tipoDias, setTipoDias]               = useState(4);
  const [attachment, setAttachment]           = useState(null);
  const attachmentFile                        = useRef(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const messageInputRef                       = useRef();
  const [channelFilter, setChannelFilter]     = useState("whatsapp");
  const [whatsapps, setWhatsapps]             = useState([]);
  const [selectedWhatsapps, setSelectedWhatsapps] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [queues, setQueues]                   = useState([]);
  const [allQueues, setAllQueues]             = useState([]);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [selectedQueue, setSelectedQueue]     = useState(null);
  const { findAll: findAllQueues }            = useQueues();
  const [options, setOptions]                 = useState([]);
  const [searchParam, setSearchParam]         = useState("");

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

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
    if (searchParam.length < 3) {
      setLoading(false);
      setSelectedQueue("");
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  useEffect(() => {
    api
      .get(`/whatsapp/filter`, { params: { session: 0, channel: channelFilter } })
      .then(({ data }) => {
        const mappedWhatsapps = data.map((w) => ({ ...w, selected: false }));
        setWhatsapps(mappedWhatsapps);
        if (mappedWhatsapps.length === 1) setSelectedWhatsapps(mappedWhatsapps[0].id);
      });
  }, [currentContact, channelFilter]);

  useEffect(() => {
    if (contactId && contacts.length) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) setCurrentContact(contact);
    }
  }, [contactId, contacts]);

  useEffect(() => {
    if (open) {
      try {
        (async () => {
          const { data: contactList } = await api.get("/contacts/list", {
            params: { companyId },
          });
          let customList = contactList.map((c) => ({ id: c.id, name: c.name, channel: c.channel }));
          if (isArray(customList)) {
            setContacts([{ id: "", name: "", channel: "" }, ...customList]);
          }
          if (contactId) {
            setSchedule((prev) => ({ ...prev, contactId }));
          }
          if (!scheduleId) return;
          const { data } = await api.get(`/schedules/${scheduleId}`);
          setSchedule((prev) => ({
            ...prev,
            ...data,
            sendAt: moment(data.sendAt).format("YYYY-MM-DDTHH:mm"),
          }));
          if (data.whatsapp)    setSelectedWhatsapps(data.whatsapp.id);
          if (data.ticketUser)  setSelectedUser(data.ticketUser);
          if (data.queueId)     setSelectedQueue(data.queueId);
          if (data.intervalo)   setIntervalo(data.intervalo);
          if (data.tipoDias)    setTipoDias(data.tipoDias);
          setCurrentContact(data.contact);
        })();
      } catch (err) {
        toastError(err);
      }
    }
  }, [scheduleId, contactId, open, user]);

  const filterOptions = createFilterOptions({ trim: true });

  const handleClose = () => {
    onClose();
    setAttachment(null);
    setSchedule(initialState);
    setSelectedWhatsapps("");
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) setAttachment(file);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":  return <Facebook style={{ color: "#3b5998", verticalAlign: "middle" }} />;
      case "instagram": return <Instagram style={{ color: "#e1306c", verticalAlign: "middle" }} />;
      case "whatsapp":  return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle" }} />;
      default: return "error";
    }
  };

  const renderOption = (option) => {
    if (option.name) {
      return (
        <>
          {IconChannel(option.channel)}
          <Typography component="span" style={{ fontSize: 14, marginLeft: 10, display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
            {option.name}
          </Typography>
        </>
      );
    }
    return `${i18n.t("newTicketModal.add")} ${option.name}`;
  };

  const handleSaveSchedule = async (values) => {
    const scheduleData = {
      ...values,
      userId: user.id,
      whatsappId: selectedWhatsapps,
      ticketUserId: selectedUser?.id || null,
      queueId: selectedQueue || null,
      intervalo: intervalo || 1,
      tipoDias: tipoDias || 4,
    };
    try {
      if (scheduleId) {
        await api.put(`/schedules/${scheduleId}`, scheduleData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/schedules/${scheduleId}/media-upload`, formData);
        }
      } else {
        const { data } = await api.post("/schedules", scheduleData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/schedules/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("scheduleModal.success"));
      if (typeof reload === "function") reload();
      if (contactId && typeof cleanContact === "function") {
        cleanContact();
        history.push("/schedules");
      }
    } catch (err) {
      toastError(err);
    }
    setCurrentContact(initialContact);
    setSchedule(initialState);
    setSelectedWhatsapps("");
    handleClose();
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText  = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos   = el.selectionStart + msgVar.length;
    setValueFunc("body", `${firstHalfText}${msgVar}${secondHalfText}`);
    await new Promise((r) => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }
    if (schedule.mediaPath) {
      await api.delete(`/schedules/${schedule.id}/media-upload`);
      setSchedule((prev) => ({ ...prev, mediaPath: null }));
      toast.success(i18n.t("scheduleModal.toasts.deleted"));
      if (typeof reload === "function") reload();
    }
  };

  return (
    <div className="smd-root">
      <FontStyle />

      <ConfirmationModal
        title={i18n.t("scheduleModal.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("scheduleModal.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
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
                  <ScheduleIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {schedule.status === "ERRO" ? "Erro de Envio" : `Mensagem ${capitalize(schedule.status)}`}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Agendamentos · Envio programado
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
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={attachmentFile}
            onChange={handleAttachmentFile}
          />
        </div>

        <Formik
          initialValues={schedule}
          enableReinitialize={true}
          validationSchema={ScheduleSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveSchedule(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
              <DialogContent className={classes.dialogContent} style={{ overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>

                {/* ── Contato & Mensagem ── */}
                <Typography className={classes.sectionLabel}>
                  Contato &amp; Mensagem
                </Typography>

                <Grid container spacing={2}>
                  {/* Contato */}
                  <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth className={classes.formControl}>
                      <Autocomplete
                        fullWidth
                        value={currentContact}
                        options={contacts}
                        onChange={(e, contact) => {
                          const id = contact ? contact.id : "";
                          setSchedule({ ...schedule, contactId: id });
                          setCurrentContact(contact || initialContact);
                          setChannelFilter(contact ? contact.channel : "whatsapp");
                        }}
                        getOptionLabel={(option) => option.name}
                        renderOption={renderOption}
                        getOptionSelected={(option, value) => value.id === option.id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            placeholder="Contato"
                            className={classes.textField}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>

                  {/* Corpo da mensagem */}
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      minRows={7}
                      multiline={true}
                      label={i18n.t("scheduleModal.form.body")}
                      name="body"
                      inputRef={messageInputRef}
                      error={touched.body && Boolean(errors.body)}
                      helperText={touched.body && errors.body}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  {/* Variables picker */}
                  <Grid item xs={12}>
                    <MessageVariablesPicker
                      disabled={isSubmitting}
                      onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                    />
                  </Grid>
                </Grid>

                <Divider className={classes.sectionDivider} />

                {/* ── Configurações de envio ── */}
                <Typography className={classes.sectionLabel}>
                  Configurações de Envio
                </Typography>

                <Grid container spacing={2}>
                  {/* WhatsApp */}
                  <Grid item xs={12} md={6}>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="whatsapp-selection-label">
                        {i18n.t("campaigns.dialog.form.whatsapp")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.whatsapp")}
                        labelId="whatsapp-selection-label"
                        id="whatsappIds"
                        name="whatsappIds"
                        required
                        error={touched.whatsappId && Boolean(errors.whatsappId)}
                        value={selectedWhatsapps || ""}
                        onChange={(e) => setSelectedWhatsapps(e.target.value)}
                      >
                        <MenuItem value="">Nenhuma</MenuItem>
                        {whatsapps && whatsapps.map((w) => (
                          <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Abrir ticket */}
                  <Grid item xs={12} md={6}>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="openTicket-selection-label">
                        {i18n.t("campaigns.dialog.form.openTicket")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.openTicket")}
                        labelId="openTicket-selection-label"
                        id="openTicket"
                        name="openTicket"
                        error={touched.openTicket && Boolean(errors.openTicket)}
                      >
                        <MenuItem value={"enabled"}>{i18n.t("campaigns.dialog.form.enabledOpenTicket")}</MenuItem>
                        <MenuItem value={"disabled"}>{i18n.t("campaigns.dialog.form.disabledOpenTicket")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Atendente */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      variant="outlined"
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
                      freeSolo
                      fullWidth
                      disabled={values.openTicket === "disabled"}
                      autoHighlight
                      noOptionsText={i18n.t("transferTicketModal.noOptions")}
                      loading={loading}
                      renderOption={(option) => (
                        <span><UserStatusIcon user={option} /> {option.name}</span>
                      )}
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
                  <Grid item xs={12} md={6}>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel>{i18n.t("transferTicketModal.fieldQueueLabel")}</InputLabel>
                      <Select
                        value={selectedQueue}
                        onChange={(e) => setSelectedQueue(e.target.value)}
                        label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
                        disabled={values.openTicket === "disabled"}
                      >
                        {queues.map((queue) => (
                          <MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Status ticket */}
                  <Grid item xs={12} md={6}>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="statusTicket-selection-label">
                        {i18n.t("campaigns.dialog.form.statusTicket")}
                      </InputLabel>
                      <Field
                        as={Select}
                        disabled={values.openTicket === "disabled"}
                        label={i18n.t("campaigns.dialog.form.statusTicket")}
                        labelId="statusTicket-selection-label"
                        id="statusTicket"
                        name="statusTicket"
                        error={touched.statusTicket && Boolean(errors.statusTicket)}
                      >
                        <MenuItem value={"closed"}>{i18n.t("campaigns.dialog.form.closedTicketStatus")}</MenuItem>
                        <MenuItem value={"open"}>{i18n.t("campaigns.dialog.form.openTicketStatus")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Data/hora */}
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("scheduleModal.form.sendAt")}
                      type="datetime-local"
                      name="sendAt"
                      error={touched.sendAt && Boolean(errors.sendAt)}
                      helperText={touched.sendAt && errors.sendAt}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Assinar */}
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          color="primary"
                          name="assinar"
                          checked={values.assinar}
                          disabled={values.openTicket === "disabled"}
                        />
                      }
                      label={
                        <Typography style={{ fontSize: "0.85rem" }}>
                          {i18n.t("scheduleModal.form.assinar")}
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>

                <Divider className={classes.sectionDivider} />

                {/* ── Recorrência ── */}
                <Typography className={classes.sectionLabel}>
                  Recorrência
                </Typography>

                <Box className={classes.recurrenceBox}>
                  <Typography className={classes.recurrenceDesc}>
                    Escolha enviar a mensagem de forma recorrente e defina o intervalo. Para envio único, mantenha os valores padrão.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControl size="small" fullWidth variant="outlined" className={classes.formControl}>
                        <InputLabel id="intervalo-label">Intervalo</InputLabel>
                        <Select
                          labelId="intervalo-label"
                          value={intervalo}
                          onChange={(e) => setIntervalo(e.target.value || 1)}
                          label="Intervalo"
                        >
                          <MenuItem value={1}>Dias</MenuItem>
                          <MenuItem value={2}>Semanas</MenuItem>
                          <MenuItem value={3}>Meses</MenuItem>
                          <MenuItem value={4}>Minutos</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Field
                        as={TextField}
                        label="Valor do Intervalo"
                        name="valorIntervalo"
                        size="small"
                        error={touched.valorIntervalo && Boolean(errors.valorIntervalo)}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Field
                        as={TextField}
                        label="Enviar quantas vezes"
                        name="enviarQuantasVezes"
                        size="small"
                        error={touched.enviarQuantasVezes && Boolean(errors.enviarQuantasVezes)}
                        variant="outlined"
                        fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl size="small" fullWidth variant="outlined" className={classes.formControl}>
                        <InputLabel id="tipoDias-label">Dias não úteis</InputLabel>
                        <Select
                          labelId="tipoDias-label"
                          value={tipoDias}
                          onChange={(e) => setTipoDias(e.target.value || 4)}
                          label="Dias não úteis"
                        >
                          <MenuItem value={4}>Enviar normalmente em dias não úteis</MenuItem>
                          <MenuItem value={5}>Enviar um dia útil antes</MenuItem>
                          <MenuItem value={6}>Enviar um dia útil depois</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* ── Anexo ── */}
                {(schedule.mediaPath || attachment) && (
                  <Box style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 16 }}>
                    <Box className={classes.attachChip}>
                      <AttachFileIcon style={{ fontSize: 14, flexShrink: 0 }} />
                      {attachment ? attachment.name : schedule.mediaName}
                    </Box>
                    <IconButton
                      size="small"
                      className={classes.attachDeleteBtn}
                      onClick={() => setConfirmationOpen(true)}
                    >
                      <DeleteOutline style={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                )}

              </DialogContent>

              {/* ── Ações ────────────────────────────────────────── */}
              <DialogActions className={classes.dialogActions}>

                {!attachment && !schedule.mediaPath && (
                  <Button
                    variant="outlined"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    startIcon={<AttachFileIcon style={{ fontSize: 15 }} />}
                    className={classes.attachButton}
                  >
                    {i18n.t("quickMessages.buttons.attach")}
                  </Button>
                )}

                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("scheduleModal.buttons.cancel")}
                </Button>

                {(schedule.sentAt === null || schedule.sentAt === "") && (
                  <div className={classes.btnWrapper}>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                      className={classes.submitButton}
                    >
                      {scheduleId
                        ? i18n.t("scheduleModal.buttons.okEdit")
                        : i18n.t("scheduleModal.buttons.okAdd")}
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

export default ScheduleModal;