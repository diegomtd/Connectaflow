import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import Typography       from "@material-ui/core/Typography";
import IconButton       from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import Switch           from "@material-ui/core/Switch";
import Box              from "@material-ui/core/Box";
import Grid             from "@material-ui/core/Grid";
import Divider          from "@material-ui/core/Divider";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon         from "@material-ui/icons/Close";
import PersonIcon        from "@material-ui/icons/Person";
import AddIcon           from "@material-ui/icons/Add";

import { i18n }          from "../../translate/i18n";
import api               from "../../services/api";
import toastError        from "../../errors/toastError";
import { TagsContainer } from "../TagsContainer";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .cmd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .cmd-root ::-webkit-scrollbar { width: 4px; }
    .cmd-root ::-webkit-scrollbar-track { background: transparent; }
    .cmd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const ContactSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(250, "Too Long!").required("Required"),
  number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email"),
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
    },

    /* ── Info row (whatsapp, lgpd, chatbot) ── */
    infoRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: theme.spacing(1, 1.5),
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
      border: `1px solid ${border}`,
    },
    infoLabel: {
      fontSize: "0.8rem",
      color: textMuted,
      fontWeight: 500,
      flexShrink: 0,
    },
    infoValue: {
      fontSize: "0.8rem",
      color: textPrimary,
      fontWeight: 600,
    },

    /* ── Switch row (chatbot) ── */
    switchRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(0.5, 1.5),
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
      border: `1px solid ${border}`,
    },
    switchLabel: {
      fontSize: "0.82rem",
      color: textPrimary,
      fontWeight: 500,
    },

    /* ── Extra info row ── */
    extraAttr: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    extraTextField: {
      flex: 1,
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
    deleteExtraBtn: {
      width: 30, height: 30, borderRadius: 8, padding: 0,
      border: `1px solid ${border}`,
      color: textMuted,
      flexShrink: 0,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.40),
        color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.10 : 0.05),
      },
    },
    addExtraBtn: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 600, fontSize: "0.82rem",
      borderColor: alpha(primary, isDark ? 0.28 : 0.20),
      color: primary,
      backgroundColor: alpha(primary, isDark ? 0.08 : 0.05),
      width: "100%",
      marginTop: 4,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.50),
        backgroundColor: alpha(primary, isDark ? 0.14 : 0.09),
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
const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
  const classes  = useStyles();
  const isMounted = useRef(true);

  const initialState = {
    name: "", number: "", email: "",
    disableBot: false, lgpdAcceptedAt: "",
  };

  const [contact, setContact]       = useState(initialState);
  const [disableBot, setDisableBot] = useState(false);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prev) => ({ ...prev, ...initialValues }));
      }
      if (!contactId) return;
      try {
        const { data } = await api.get(`/contacts/${contactId}`);
        if (isMounted.current) {
          setContact(data);
          setDisableBot(data.disableBot);
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchContact();
  }, [contactId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setContact(initialState);
  };

  const handleSaveContact = async (values) => {
    try {
      if (contactId) {
        await api.put(`/contacts/${contactId}`, { ...values, disableBot });
        handleClose();
      } else {
        const { data } = await api.post("/contacts", { ...values, disableBot });
        if (onSave) onSave(data);
        handleClose();
      }
      toast.success(i18n.t("contactModal.success"));
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="cmd-root">
      <FontStyle />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
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
                  <PersonIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {contactId
                      ? i18n.t("contactModal.title.edit")
                      : i18n.t("contactModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Contatos · Informações do cliente
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
          initialValues={contact}
          enableReinitialize={true}
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContact(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>

                {/* ── Informações principais ── */}
                <Typography className={classes.sectionLabel}>
                  {i18n.t("contactModal.form.mainInfo")}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.name")}
                      name="name"
                      autoFocus
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.number")}
                      name="number"
                      error={touched.number && Boolean(errors.number)}
                      helperText={touched.number && errors.number}
                      placeholder="5513912344321"
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label={i18n.t("contactModal.form.email")}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      placeholder="Email address"
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TagsContainer contact={contact} />
                  </Grid>
                </Grid>

                <Divider className={classes.sectionDivider} />

                {/* ── Status / Dados ── */}
                <Typography className={classes.sectionLabel}>
                  Status &amp; Dados
                </Typography>

                <Grid container spacing={1}>
                  {/* Chatbot switch */}
                  <Grid item xs={12}>
                    <Box className={classes.switchRow}>
                      <Typography className={classes.switchLabel}>
                        {i18n.t("contactModal.form.chatBotContact")}
                      </Typography>
                      <Switch
                        size="small"
                        checked={disableBot}
                        onChange={() => setDisableBot(!disableBot)}
                        name="disableBot"
                        color="primary"
                      />
                    </Box>
                  </Grid>

                  {/* WhatsApp */}
                  {contact?.whatsapp && (
                    <Grid item xs={12}>
                      <Box className={classes.infoRow}>
                        <Typography className={classes.infoLabel}>
                          {i18n.t("contactModal.form.whatsapp")}
                        </Typography>
                        <Typography className={classes.infoValue}>
                          {contact.whatsapp.name}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* LGPD */}
                  <Grid item xs={12}>
                    <Box className={classes.infoRow}>
                      <Typography className={classes.infoLabel}>
                        {i18n.t("contactModal.form.termsLGDP")}
                      </Typography>
                      <Typography className={classes.infoValue}>
                        {contact?.lgpdAcceptedAt
                          ? format(new Date(contact.lgpdAcceptedAt), "dd/MM/yyyy 'às' HH:mm")
                          : "—"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider className={classes.sectionDivider} />

                {/* ── Informações extras ── */}
                <Typography className={classes.sectionLabel}>
                  {i18n.t("contactModal.form.extraInfo")}
                </Typography>

                <FieldArray name="extraInfo">
                  {({ push, remove }) => (
                    <>
                      {values.extraInfo &&
                        values.extraInfo.length > 0 &&
                        values.extraInfo.map((info, index) => (
                          <Box className={classes.extraAttr} key={`${index}-info`}>
                            <Field
                              as={TextField}
                              label={i18n.t("contactModal.form.extraName")}
                              name={`extraInfo[${index}].name`}
                              variant="outlined"
                              size="small"
                              className={classes.extraTextField}
                            />
                            <Field
                              as={TextField}
                              label={i18n.t("contactModal.form.extraValue")}
                              name={`extraInfo[${index}].value`}
                              variant="outlined"
                              size="small"
                              className={classes.extraTextField}
                            />
                            <IconButton
                              size="small"
                              className={classes.deleteExtraBtn}
                              onClick={() => remove(index)}
                            >
                              <DeleteOutlineIcon style={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ))}

                      <Button
                        variant="outlined"
                        startIcon={<AddIcon style={{ fontSize: 15 }} />}
                        className={classes.addExtraBtn}
                        onClick={() => push({ name: "", value: "" })}
                      >
                        {i18n.t("contactModal.buttons.addExtraInfo")}
                      </Button>
                    </>
                  )}
                </FieldArray>

              </DialogContent>

              {/* ── Ações ────────────────────────────────────────── */}
              <DialogActions className={classes.dialogActions}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>

                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    className={classes.submitButton}
                  >
                    {contactId
                      ? i18n.t("contactModal.buttons.okEdit")
                      : i18n.t("contactModal.buttons.okAdd")}
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

export default ContactModal;