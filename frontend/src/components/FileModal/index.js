import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field, FieldArray } from "formik";
import { toast } from "react-toastify";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button           from "@material-ui/core/Button";
import TextField        from "@material-ui/core/TextField";
import Dialog           from "@material-ui/core/Dialog";
import DialogActions    from "@material-ui/core/DialogActions";
import DialogContent    from "@material-ui/core/DialogContent";
import DialogTitle      from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid             from "@material-ui/core/Grid";
import IconButton       from "@material-ui/core/IconButton";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";
import Divider          from "@material-ui/core/Divider";
import Tooltip          from "@material-ui/core/Tooltip";

import CloseIcon        from "@material-ui/icons/Close";
import FolderIcon       from "@material-ui/icons/Folder";
import AttachFileIcon   from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import AddIcon          from "@material-ui/icons/Add";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

import { i18n }        from "../../translate/i18n";
import api             from "../../services/api";
import toastError      from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500&display=swap');
    .umd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .umd-root ::-webkit-scrollbar { width: 4px; }
    .umd-root ::-webkit-scrollbar-track { background: transparent; }
    .umd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const FileListSchema = Yup.object().shape({
  name:    Yup.string().min(3, "Nome muito curto").required("Obrigatório"),
  message: Yup.string().required("Obrigatório"),
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
  const sectionBg   = isDark ? "rgba(255,255,255,0.025)" : "#f8fafc";
  const fileRowBg   = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const fileRowHover = isDark ? "rgba(255,255,255,0.055)" : "#f1f5f9";

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
      maxHeight: "92vh",
    },

    /* ── Header ── */
    dialogTitle: {
      padding: 0,
      "& > *": { padding: 0 },
      flexShrink: 0,
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

    /* ── Content ── */
    dialogContent: {
      padding: 0,
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${divider}`,
      overflowY: "auto",
      flex: "1 1 auto",
      minHeight: 0,
    },
    contentInner: {
      padding: theme.spacing(2.5, 3),
    },

    /* ── Section block ── */
    sectionBlock: {
      backgroundColor: sectionBg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: theme.spacing(2, 2.5),
      marginBottom: theme.spacing(2),
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: theme.spacing(1.5),
    },
    sectionIcon: {
      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
      backgroundColor: alpha(primary, isDark ? 0.15 : 0.08),
      border: `1px solid ${alpha(primary, isDark ? 0.22 : 0.12)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: primary,
    },
    sectionTitle: {
      fontSize: "0.69rem", fontWeight: 700,
      letterSpacing: "0.07em", textTransform: "uppercase",
      color: textMuted,
    },

    /* ── Text fields ── */
    textField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.85rem" },
      "& .MuiInputBase-input": { fontSize: "0.85rem", color: textPrimary },
      "& .MuiFormHelperText-root": { fontSize: "0.72rem", color: textMuted },
      "& .MuiInputBase-inputMultiline": {
        fontFamily: "'JetBrains Mono', monospace !important",
        fontSize: "0.82rem", lineHeight: 1.6,
      },
    },

    /* ── File option row ── */
    fileRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: theme.spacing(1, 1.5),
      borderRadius: 10,
      border: `1px solid ${border}`,
      backgroundColor: fileRowBg,
      marginBottom: theme.spacing(1),
      transition: "background 0.15s",
      "&:hover": { backgroundColor: fileRowHover },
    },
    fileRowIndex: {
      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
      backgroundColor: alpha(primary, isDark ? 0.15 : 0.08),
      border: `1px solid ${alpha(primary, isDark ? 0.22 : 0.12)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.68rem", fontWeight: 700, color: primary,
    },
    fileNameChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 6,
      backgroundColor: alpha(primary, isDark ? 0.12 : 0.06),
      border: `1px solid ${alpha(primary, isDark ? 0.2 : 0.12)}`,
      fontSize: "0.72rem",
      color: primary,
      fontWeight: 500,
      marginTop: 3,
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    attachBtn: {
      width: 30, height: 30, borderRadius: 8, padding: 0, flexShrink: 0,
      border: `1px solid ${border}`,
      backgroundColor: "transparent",
      color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.4),
        color: primary,
        backgroundColor: alpha(primary, isDark ? 0.1 : 0.05),
      },
    },
    deleteBtn: {
      width: 30, height: 30, borderRadius: 8, padding: 0, flexShrink: 0,
      border: `1px solid ${border}`,
      backgroundColor: "transparent",
      color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.4),
        color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.1 : 0.05),
      },
    },
    addFileBtn: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 600, fontSize: "0.8rem",
      borderColor: alpha(primary, 0.3),
      color: primary,
      marginTop: theme.spacing(1),
      transition: "all 0.16s",
      "&:hover": {
        borderColor: primary,
        backgroundColor: alpha(primary, isDark ? 0.1 : 0.05),
      },
    },

    divider: { backgroundColor: divider, margin: theme.spacing(0, 0, 1.5) },

    /* ── Actions ── */
    dialogActions: {
      padding: theme.spacing(1.5, 3, 2),
      backgroundColor: isDark ? alpha("#000", 0.10) : "#f8fafc",
      borderTop: `1px solid ${border}`,
      gap: 8, display: "flex", justifyContent: "flex-end",
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
    btnWrapper: { position: "relative" },
    submitButton: {
      borderRadius: 10, textTransform: "none",
      fontWeight: 700, fontSize: "0.82rem", color: "#fff",
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

/* ── Section wrapper ─────────────────────────────────────────────────────── */
const Section = ({ icon, title, children, classes }) => (
  <Box className={classes.sectionBlock}>
    <Box className={classes.sectionHeader}>
      <Box className={classes.sectionIcon}>{icon}</Box>
      <Typography className={classes.sectionTitle}>{title}</Typography>
    </Box>
    {children}
  </Box>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const FilesModal = ({ open, onClose, fileListId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [files, setFiles]                   = useState([]);
  const [selectedFileNames, setSelectedFileNames] = useState([]);

  const initialState = {
    name: "",
    message: "",
    options: [{ name: "", path: "", mediaType: "" }],
  };

  const [fileList, setFileList] = useState(initialState);

  useEffect(() => {
    try {
      (async () => {
        if (!fileListId) return;
        const { data } = await api.get(`/files/${fileListId}`);
        setFileList(data);
      })();
    } catch (err) { toastError(err); }
  }, [fileListId, open]);

  const handleClose = () => { setFileList(initialState); setFiles([]); onClose(); };

  const handleSaveFileList = async (values) => {
    const uploadFiles = async (options, filesOptions, id) => {
      const formData = new FormData();
      formData.append("fileId", id);
      formData.append("typeArch", "fileList");
      filesOptions.forEach((fileOption, index) => {
        if (fileOption.file) {
          formData.append("files", fileOption.file);
          formData.append("mediaType", fileOption.file.type);
          formData.append("name", options[index].name);
          formData.append("id", options[index].id);
        }
      });
      try {
        const { data } = await api.post(`/files/uploadList/${id}`, formData);
        setFiles([]);
        return data;
      } catch (err) { toastError(err); }
      return null;
    };

    const fileData = { ...values, userId: user.id };
    try {
      if (fileListId) {
        const { data } = await api.put(`/files/${fileListId}`, fileData);
        if (data.options.length > 0) uploadFiles(data.options, values.options, fileListId);
      } else {
        const { data } = await api.post("/files", fileData);
        if (data.options.length > 0) uploadFiles(data.options, values.options, data.id);
      }
      toast.success(i18n.t("fileModal.success"));
      if (typeof reload === "function") reload();
    } catch (err) { toastError(err); }
    handleClose();
  };

  return (
    <div className="umd-root">
      <FontStyle />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
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
                  <FolderIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {fileListId ? i18n.t("fileModal.title.edit") : i18n.t("fileModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Arquivos · Gerenciar lista de arquivos
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
          initialValues={fileList}
          enableReinitialize={true}
          validationSchema={FileListSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => { handleSaveFileList(values); actions.setSubmitting(false); }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>

              <DialogContent className={classes.dialogContent}>
                <Box className={classes.contentInner}>

                  {/* ═══ BLOCO: Identificação ═══ */}
                  <Section
                    icon={<FolderIcon style={{ fontSize: 14 }} />}
                    title="Identificação"
                    classes={classes}
                  >
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Field as={TextField}
                          label={i18n.t("fileModal.form.name")}
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          variant="outlined" size="small" fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field as={TextField}
                          label={i18n.t("fileModal.form.message")}
                          name="message"
                          multiline minRows={4} fullWidth
                          error={touched.message && Boolean(errors.message)}
                          helperText={touched.message && errors.message}
                          variant="outlined" size="small"
                          className={classes.textField}
                        />
                      </Grid>
                    </Grid>
                  </Section>

                  {/* ═══ BLOCO: Arquivos ═══ */}
                  <Section
                    icon={<InsertDriveFileIcon style={{ fontSize: 14 }} />}
                    title={i18n.t("fileModal.form.fileOptions")}
                    classes={classes}
                  >
                    <FieldArray name="options">
                      {({ push, remove }) => (
                        <>
                          {values.options && values.options.length > 0 &&
                            values.options.map((info, index) => (
                              <Box key={`${index}-info`} className={classes.fileRow}>

                                {/* Número */}
                                <Box className={classes.fileRowIndex}>{index + 1}</Box>

                                {/* Campo nome — ocupa espaço restante */}
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                  <Field as={TextField}
                                    label={i18n.t("fileModal.form.extraName")}
                                    name={`options[${index}].name`}
                                    variant="outlined" size="small" fullWidth
                                    multiline minRows={1}
                                    className={classes.textField}
                                  />
                                  {/* Arquivo selecionado / existente */}
                                  {(info.path || selectedFileNames[index]) && (
                                    <Box className={classes.fileNameChip}>
                                      <InsertDriveFileIcon style={{ fontSize: 11 }} />
                                      {info.path || selectedFileNames[index]}
                                    </Box>
                                  )}
                                </Box>

                                {/* Botão anexar */}
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const selectedFile = e.target.files[0];
                                    const updatedOptions = [...values.options];
                                    updatedOptions[index].file = selectedFile;
                                    setFiles("options", updatedOptions);
                                    const updatedFileNames = [...selectedFileNames];
                                    updatedFileNames[index] = selectedFile ? selectedFile.name : "";
                                    setSelectedFileNames(updatedFileNames);
                                  }}
                                  style={{ display: "none" }}
                                  name={`options[${index}].file`}
                                  id={`file-upload-${index}`}
                                />
                                <Tooltip title="Anexar arquivo">
                                  <label htmlFor={`file-upload-${index}`}>
                                    <IconButton component="span" size="small" className={classes.attachBtn}>
                                      <AttachFileIcon style={{ fontSize: 15 }} />
                                    </IconButton>
                                  </label>
                                </Tooltip>

                                {/* Botão remover */}
                                <Tooltip title="Remover">
                                  <IconButton
                                    size="small"
                                    className={classes.deleteBtn}
                                    onClick={() => {
                                      remove(index);
                                      const updated = [...selectedFileNames];
                                      updated.splice(index, 1);
                                      setSelectedFileNames(updated);
                                    }}
                                  >
                                    <DeleteOutlineIcon style={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ))
                          }

                          <Button
                            variant="outlined"
                            fullWidth
                            className={classes.addFileBtn}
                            startIcon={<AddIcon style={{ fontSize: 16 }} />}
                            onClick={() => {
                              push({ name: "", path: "" });
                              setSelectedFileNames([...selectedFileNames, ""]);
                            }}
                          >
                            {i18n.t("fileModal.buttons.fileOptions")}
                          </Button>
                        </>
                      )}
                    </FieldArray>
                  </Section>

                </Box>
              </DialogContent>

              {/* ── Ações ── */}
              <DialogActions className={classes.dialogActions}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("fileModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    className={classes.submitButton}
                  >
                    {fileListId
                      ? i18n.t("fileModal.buttons.okEdit")
                      : i18n.t("fileModal.buttons.okAdd")}
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

export default FilesModal;