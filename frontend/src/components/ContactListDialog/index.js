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
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";
import IconButton       from "@material-ui/core/IconButton";

import CloseIcon      from "@material-ui/icons/Close";
import PeopleAltIcon  from "@material-ui/icons/PeopleAlt";

import { i18n }      from "../../translate/i18n";
import api           from "../../services/api";
import toastError    from "../../errors/toastError";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
    .clm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .clm-root ::-webkit-scrollbar { width: 4px; }
    .clm-root ::-webkit-scrollbar-track { background: transparent; }
    .clm-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    .clm-section-card {
      border-radius: 12px;
      border: 1px solid var(--clm-section-border);
      background: var(--clm-section-bg);
      overflow: hidden;
    }
    .clm-section-body { padding: 14px; }
  `}</style>
);

const ContactListSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
});

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg     = isDark ? "#0f1929" : "#f4f7fb";
  const cardBg        = isDark ? "#131e2e" : "#ffffff";
  const headerBg      = isDark ? "#0b1520" : "#f8fafc";
  const border        = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const sectionBorder = isDark ? "rgba(255,255,255,0.07)" : "#e8eef5";
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
      "--clm-section-border": sectionBorder,
      "--clm-section-bg":     cardBg,
    },

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

    dialogContent: {
      padding: theme.spacing(2, 2.5),
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${border}`,
      overflowY: "auto",
      flex: "1 1 auto",
      minHeight: 0,
    },

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
    },

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

/* ══════════════════════════════════════════════════════════════════════════ */
const ContactListModal = ({ open, onClose, contactListId }) => {
  const classes = useStyles();

  const initialState = { name: "" };
  const [contactList, setContactList] = useState(initialState);

  useEffect(() => {
    const fetchContactList = async () => {
      if (!contactListId) return;
      try {
        const { data } = await api.get(`/contact-lists/${contactListId}`);
        setContactList((prev) => ({ ...prev, ...data }));
      } catch (err) {
        toastError(err);
      }
    };
    fetchContactList();
  }, [contactListId, open]);

  const handleClose = () => {
    onClose();
    setContactList(initialState);
  };

  const handleSaveContactList = async (values) => {
    try {
      if (contactListId) {
        await api.put(`/contact-lists/${contactListId}`, { ...values });
      } else {
        await api.post("/contact-lists", { ...values });
      }
      toast.success(i18n.t("contactList.dialog"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className="clm-root">
      <FontStyle />

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
        {/* ── CABEÇALHO ── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}>
                  <PeopleAltIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {contactListId
                      ? i18n.t("contactLists.dialog.edit")
                      : i18n.t("contactLists.dialog.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Contatos · Listas de transmissão
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
          initialValues={contactList}
          enableReinitialize={true}
          validationSchema={ContactListSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveContactList(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>

              <DialogContent className={classes.dialogContent}>
                <div className="clm-section-card">
                  <div className="clm-section-body">
                    <Field
                      as={TextField}
                      label={i18n.t("contactLists.dialog.name")}
                      autoFocus
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.textField}
                    />
                  </div>
                </div>
              </DialogContent>

              {/* ── AÇÕES ── */}
              <DialogActions className={classes.dialogActions}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("contactLists.dialog.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    className={classes.submitButton}
                  >
                    {contactListId
                      ? i18n.t("contactLists.dialog.okEdit")
                      : i18n.t("contactLists.dialog.okAdd")}
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

export default ContactListModal;