import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton       from "@material-ui/core/IconButton";
import FormControl      from "@material-ui/core/FormControl";
import Grid             from "@material-ui/core/Grid";
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import Select           from "@material-ui/core/Select";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";

import AttachFileIcon    from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon         from "@material-ui/icons/Close";
import NotificationsIcon from "@material-ui/icons/Notifications";

import { i18n }          from "../../translate/i18n";
import api               from "../../services/api";
import toastError        from "../../errors/toastError";
import ConfirmationModal from "../ConfirmationModal";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .anm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .anm-root ::-webkit-scrollbar { width: 4px; }
    .anm-root ::-webkit-scrollbar-track { background: transparent; }
    .anm-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Obrigatório"),
  text:  Yup.string().required("Obrigatório"),
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
const AnnouncementModal = ({ open, onClose, announcementId, reload }) => {
  const classes = useStyles();

  const initialState = { title: "", text: "", priority: 3, status: true };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [announcement, setAnnouncement]         = useState(initialState);
  const [attachment, setAttachment]             = useState(null);
  const attachmentFile                          = useRef(null);

  useEffect(() => {
    try {
      (async () => {
        if (!announcementId) return;
        const { data } = await api.get(`/announcements/${announcementId}`);
        setAnnouncement((prev) => ({ ...prev, ...data }));
      })();
    } catch (err) {
      toastError(err);
    }
  }, [announcementId, open]);

  const handleClose = () => {
    setAnnouncement(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) setAttachment(file);
  };

  const handleSaveAnnouncement = async (values) => {
    try {
      if (announcementId) {
        await api.put(`/announcements/${announcementId}`, { ...values });
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "announcements");
          formData.append("file", attachment);
          await api.post(`/announcements/${announcementId}/media-upload`, formData);
        }
      } else {
        const { data } = await api.post("/announcements", { ...values });
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "announcements");
          formData.append("file", attachment);
          await api.post(`/announcements/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("announcements.toasts.success"));
      if (typeof reload === "function") reload();
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }
    if (announcement.mediaPath) {
      await api.delete(`/announcements/${announcement.id}/media-upload`);
      setAnnouncement((prev) => ({ ...prev, mediaPath: null }));
      toast.success(i18n.t("announcements.toasts.deleted"));
      if (typeof reload === "function") reload();
    }
  };

  return (
    <div className="anm-root">
      <FontStyle />

      <ConfirmationModal
        title={i18n.t("announcements.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("announcements.confirmationModal.deleteMessage")}
      </ConfirmationModal>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
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
                  <NotificationsIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {announcementId
                      ? i18n.t("announcements.dialog.edit")
                      : i18n.t("announcements.dialog.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Avisos · Comunicados do sistema
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
          initialValues={announcement}
          enableReinitialize={true}
          validationSchema={AnnouncementSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveAnnouncement(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>
                <Grid container spacing={2}>

                  {/* Título */}
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("announcements.dialog.form.title")}
                      name="title"
                      autoFocus
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  {/* Texto */}
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("announcements.dialog.form.text")}
                      name="text"
                      error={touched.text && Boolean(errors.text)}
                      helperText={touched.text && errors.text}
                      variant="outlined"
                      size="small"
                      multiline
                      minRows={7}
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  {/* Status */}
                  <Grid xs={12} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="status-label">
                        {i18n.t("announcements.dialog.form.status")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("announcements.dialog.form.status")}
                        labelId="status-label"
                        id="status"
                        name="status"
                        error={touched.status && Boolean(errors.status)}
                      >
                        <MenuItem value={true}>{i18n.t("announcements.dialog.form.active")}</MenuItem>
                        <MenuItem value={false}>{i18n.t("announcements.dialog.form.inactive")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Prioridade */}
                  <Grid xs={12} item>
                    <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                      <InputLabel id="priority-label">
                        {i18n.t("announcements.dialog.form.priority")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("announcements.dialog.form.priority")}
                        labelId="priority-label"
                        id="priority"
                        name="priority"
                        error={touched.priority && Boolean(errors.priority)}
                      >
                        <MenuItem value={1}>{i18n.t("announcements.dialog.form.high")}</MenuItem>
                        <MenuItem value={2}>{i18n.t("announcements.dialog.form.medium")}</MenuItem>
                        <MenuItem value={3}>{i18n.t("announcements.dialog.form.low")}</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                  {/* Anexo atual */}
                  {(announcement.mediaPath || attachment) && (
                    <Grid xs={12} item>
                      <Box style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Box className={classes.attachChip}>
                          <AttachFileIcon style={{ fontSize: 14, flexShrink: 0 }} />
                          {attachment ? attachment.name : announcement.mediaName}
                        </Box>
                        <IconButton
                          size="small"
                          className={classes.attachDeleteBtn}
                          onClick={() => setConfirmationOpen(true)}
                        >
                          <DeleteOutlineIcon style={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  )}

                </Grid>
              </DialogContent>

              {/* ── Ações ── */}
              <DialogActions className={classes.dialogActions}>

                {!attachment && !announcement.mediaPath && (
                  <Button
                    variant="outlined"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    startIcon={<AttachFileIcon style={{ fontSize: 15 }} />}
                    className={classes.attachButton}
                  >
                    {i18n.t("announcements.dialog.buttons.attach")}
                  </Button>
                )}

                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("announcements.dialog.buttons.cancel")}
                </Button>

                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    className={classes.submitButton}
                  >
                    {announcementId
                      ? i18n.t("announcements.dialog.buttons.edit")
                      : i18n.t("announcements.dialog.buttons.add")}
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

export default AnnouncementModal;