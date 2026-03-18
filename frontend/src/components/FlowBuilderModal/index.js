import React, { useState, useEffect, useRef } from "react";

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
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";

import CloseIcon      from "@material-ui/icons/Close";
import AccountTreeIcon from "@material-ui/icons/AccountTree";

import { i18n }   from "../../translate/i18n";
import api        from "../../services/api";
import toastError from "../../errors/toastError";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
    .fbm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .fbm-root ::-webkit-scrollbar { width: 4px; }
    .fbm-root ::-webkit-scrollbar-track { background: transparent; }
    .fbm-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite um nome!"),
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

    /* ── Campo ── */
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
const FlowBuilderModal = ({ open, onClose, flowId, nameWebhook = "", initialValues, onSave }) => {
  const classes   = useStyles();
  const isMounted = useRef(true);

  const [contact, setContact] = useState({ name: nameWebhook ?? "" });

  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    if (!open) return;
    setContact({ name: initialValues?.name ?? nameWebhook ?? "" });
  }, [open, initialValues, nameWebhook]);

  const handleClose = () => {
    onClose();
    setContact({ name: "" });
  };

  const handleSaveContact = async (values) => {
    try {
      if (flowId) {
        await api.put("/flowbuilder", { name: values.name, flowId });
        toast.success(i18n.t("webhookModal.toasts.update"));
      } else {
        await api.post("/flowbuilder", { name: values.name });
        toast.success(i18n.t("webhookModal.saveSuccess"));
      }
      onSave(values.name);
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="fbm-root">
      <FontStyle />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
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
                  <AccountTreeIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {flowId ? "Editar Fluxo" : "Adicionar Fluxo"}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Flow Builder · Defina o nome do fluxo
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
          enableReinitialize
          validationSchema={ContactSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContact(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>
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
              </DialogContent>

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
                    {flowId
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

export default FlowBuilderModal;