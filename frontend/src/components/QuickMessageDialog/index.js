import React, { useContext, useState, useEffect, useRef } from "react";

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
import FlashOnIcon       from "@material-ui/icons/FlashOn";

import { i18n }               from "../../translate/i18n";
import { head }               from "lodash";
import api                    from "../../services/api";
import toastError             from "../../errors/toastError";
import { AuthContext }        from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner      from "../ButtonWithSpinner";
import ConfirmationModal      from "../ConfirmationModal";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .qmd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .qmd-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .qmd-root ::-webkit-scrollbar { width: 4px; }
    .qmd-root ::-webkit-scrollbar-track { background: transparent; }
    .qmd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const QuickeMessageSchema = Yup.object().shape({
  shortcode: Yup.string().required("Obrigatório"),
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
const QuickMessageDialog = ({ open, onClose, quickemessageId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const messageInputRef = useRef();

  const initialState = { shortcode: "", message: "", geral: false, status: true };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [quickemessage, setQuickemessage]       = useState(initialState);
  const [attachment, setAttachment]             = useState(null);
  const attachmentFile = useRef(null);

  useEffect(() => {
    try {
      (async () => {
        if (!quickemessageId) return;
        const { data } = await api.get(`/quick-messages/${quickemessageId}`);
        setQuickemessage((prevState) => ({ ...prevState, ...data }));
      })();
    } catch (err) { toastError(err); }
  }, [quickemessageId, open]);

  const handleClose = () => {
    setQuickemessage(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) setAttachment(file);
  };

  const handleSaveQuickeMessage = async (values) => {
    const quickemessageData = {
      ...values,
      isMedia: true,
      mediaPath: attachment
        ? String(attachment.name).replace(/ /g, "_")
        : values.mediaPath
          ? values.mediaPath.split("/").pop().replace(/ /g, "_")
          : null,
    };
    try {
      if (quickemessageId) {
        await api.put(`/quick-messages/${quickemessageId}`, quickemessageData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "quickMessage");
          formData.append("file", attachment);
          await api.post(`/quick-messages/${quickemessageId}/media-upload`, formData);
        }
      } else {
        const { data } = await api.post("/quick-messages", quickemessageData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "quickMessage");
          formData.append("file", attachment);
          await api.post(`/quick-messages/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("quickMessages.toasts.success"));
      if (typeof reload == "function") {
        console.log(reload);
        console.log("0");
        reload();
      }
    } catch (err) { toastError(err); }
    handleClose();
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }
    if (quickemessage.mediaPath) {
      await api.delete(`/quick-messages/${quickemessage.id}/media-upload`);
      setQuickemessage((prev) => ({ ...prev, mediaPath: null }));
      toast.success(i18n.t("quickMessages.toasts.deleted"));
      if (typeof reload == "function") {
        console.log(reload);
        console.log("1");
        reload();
      }
    }
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText  = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos   = el.selectionStart + msgVar.length;
    setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);
    await new Promise((r) => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  return (
    <div className="qmd-root">
      <FontStyle />

      <ConfirmationModal
        title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
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
                  <FlashOnIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {quickemessageId
                      ? i18n.t("quickMessages.dialog.edit")
                      : i18n.t("quickMessages.dialog.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Mensagens rápidas · Atalhos de texto
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
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>

        <Formik
          initialValues={quickemessage}
          enableReinitialize={true}
          validationSchema={QuickeMessageSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickeMessage(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, setFieldValue, values }) => {
            const isReadOnly = quickemessageId && values.visao && !values.geral && values.userId !== user.id;

            return (
              <Form>
                <DialogContent className={classes.dialogContent}>
                  <Grid spacing={2} container>

                    {/* Shortcode */}
                    <Grid xs={12} item>
                      <Field
                        as={TextField}
                        autoFocus
                        label={i18n.t("quickMessages.dialog.shortcode")}
                        name="shortcode"
                        disabled={isReadOnly}
                        error={touched.shortcode && Boolean(errors.shortcode)}
                        helperText={touched.shortcode && errors.shortcode}
                        variant="outlined"
                        size="small"
                        fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Mensagem */}
                    <Grid xs={12} item>
                      <Field
                        as={TextField}
                        label={i18n.t("quickMessages.dialog.message")}
                        name="message"
                        inputRef={messageInputRef}
                        error={touched.message && Boolean(errors.message)}
                        helperText={touched.message && errors.message}
                        variant="outlined"
                        size="small"
                        disabled={isReadOnly}
                        multiline={true}
                        rows={7}
                        fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Variables picker */}
                    <Grid item>
                      <MessageVariablesPicker
                        disabled={isSubmitting || isReadOnly}
                        onClick={(value) => handleClickMsgVar(value, setFieldValue)}
                      />
                    </Grid>

                    {/* Visão + Geral */}
                    <Grid xs={12} item>
                      <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                        <InputLabel id="visao-selection-label">
                          {i18n.t("quickMessages.dialog.visao")}
                        </InputLabel>
                        <Field
                          as={Select}
                          label={i18n.t("quickMessages.dialog.visao")}
                          placeholder={i18n.t("quickMessages.dialog.visao")}
                          labelId="visao-selection-label"
                          id="visao"
                          disabled={isReadOnly}
                          name="visao"
                          onChange={(e) => setFieldValue("visao", e.target.value === "true")}
                          error={touched.visao && Boolean(errors.visao)}
                          value={values.visao ? "true" : "false"}
                        >
                          <MenuItem value={"true"}>{i18n.t("announcements.active")}</MenuItem>
                          <MenuItem value={"false"}>{i18n.t("announcements.inactive")}</MenuItem>
                        </Field>
                      </FormControl>

                      {values.visao === true && (
                        <FormControl
                          variant="outlined" size="small" fullWidth
                          className={classes.formControl}
                          style={{ marginTop: 12 }}
                        >
                          <InputLabel id="geral-selection-label">
                            {i18n.t("quickMessages.dialog.geral")}
                          </InputLabel>
                          <Field
                            as={Select}
                            label={i18n.t("quickMessages.dialog.geral")}
                            placeholder={i18n.t("quickMessages.dialog.geral")}
                            labelId="geral-selection-label"
                            id="geral"
                            name="geral"
                            disabled={isReadOnly}
                            value={values.geral ? "true" : "false"}
                            error={touched.geral && Boolean(errors.geral)}
                          >
                            <MenuItem value={"true"}>{i18n.t("announcements.active")}</MenuItem>
                            <MenuItem value={"false"}>{i18n.t("announcements.inactive")}</MenuItem>
                          </Field>
                        </FormControl>
                      )}
                    </Grid>

                    {/* Anexo atual */}
                    {(quickemessage.mediaPath || attachment) && (
                      <Grid xs={12} item>
                        <Box style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Box className={classes.attachChip}>
                            <AttachFileIcon style={{ fontSize: 14, flexShrink: 0 }} />
                            {attachment ? attachment.name : quickemessage.mediaName}
                          </Box>
                          <IconButton
                            size="small"
                            className={classes.attachDeleteBtn}
                            onClick={() => setConfirmationOpen(true)}
                            disabled={isReadOnly}
                          >
                            <DeleteOutlineIcon style={{ fontSize: 15 }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}

                  </Grid>
                </DialogContent>

                {/* ── Ações ────────────────────────────────────────── */}
                <DialogActions className={classes.dialogActions}>

                  {!attachment && !quickemessage.mediaPath && (
                    <Button
                      variant="outlined"
                      onClick={() => attachmentFile.current.click()}
                      disabled={isSubmitting || isReadOnly}
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
                    {i18n.t("quickMessages.buttons.cancel")}
                  </Button>

                  <div className={classes.btnWrapper}>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting || isReadOnly}
                      className={classes.submitButton}
                    >
                      {quickemessageId
                        ? i18n.t("quickMessages.buttons.edit")
                        : i18n.t("quickMessages.buttons.add")}
                    </Button>
                    {isSubmitting && (
                      <CircularProgress size={24} className={classes.buttonProgress} />
                    )}
                  </div>

                </DialogActions>
              </Form>
            );
          }}
        </Formik>
      </Dialog>
    </div>
  );
};

export default QuickMessageDialog;