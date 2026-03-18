import React, { useState, useEffect, useContext } from "react";

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
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import Select           from "@material-ui/core/Select";
import Grid             from "@material-ui/core/Grid";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";
import InputAdornment   from "@material-ui/core/InputAdornment";

import { Colorize } from "@material-ui/icons";
import CloseIcon    from "@material-ui/icons/Close";
import LabelIcon    from "@material-ui/icons/Label";
import { ColorBox } from "material-ui-color";

import { i18n }        from "../../translate/i18n";
import api             from "../../services/api";
import toastError      from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    .tmd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .tmd-root .mono { font-family: 'JetBrains Mono', monospace !important; }
    .tmd-root ::-webkit-scrollbar { width: 4px; }
    .tmd-root ::-webkit-scrollbar-track { background: transparent; }
    .tmd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const TagSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Mensagem muito curta")
    .required("Obrigatório"),
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

    /* ── Swatch de cor ── */
    colorAdornment: {
      width: 18, height: 18,
      borderRadius: 5,
      border: `1px solid ${border}`,
      flexShrink: 0,
    },

    /* ── Color picker wrapper ── */
    colorPickerWrap: {
      marginTop: 10,
      borderRadius: 12,
      border: `1px solid ${border}`,
      overflow: "hidden",
      "& > div": { margin: "0 !important" },
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
function getRandomHexColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const TagModal = ({ open, onClose, tagId, kanban }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [lanes, setLanes]                               = useState([]);
  const [loading, setLoading]                           = useState(false);
  const [selectedLane, setSelectedLane]                 = useState([]);
  const [selectedRollbackLane, setSelectedRollbackLane] = useState([]);

  const initialState = {
    name: "",
    color: getRandomHexColor(),
    kanban: kanban,
    timeLane: 0,
    nextLaneId: 0,
    greetingMessageLane: "",
    rollbackLaneId: 0,
  };

  const [tag, setTag] = useState(initialState);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTags = async () => {
        try {
          const { data } = await api.get("/tags/", { params: { kanban: 1, tagId } });
          setLanes(data.tags);
        } catch (err) {
          toastError(err);
        }
      };
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, []);

  useEffect(() => {
    try {
      (async () => {
        if (!tagId) return;
        const { data } = await api.get(`/tags/${tagId}`);
        setTag((prevState) => ({ ...prevState, ...data }));
        if (data.nextLaneId)     setSelectedLane(data.nextLaneId);
        if (data.rollbackLaneId) setSelectedRollbackLane(data.rollbackLaneId);
      })();
    } catch (err) {
      toastError(err);
    }
  }, [tagId, open]);

  const handleClose = () => {
    setTag(initialState);
    setColorPickerModalOpen(false);
    onClose();
  };

  const handleSaveTag = async (values) => {
    const tagData = {
      ...values,
      userId: user?.id,
      kanban: kanban,
      nextLaneId: selectedLane || null,
      rollbackLaneId: selectedRollbackLane || null,
    };
    try {
      if (tagId) {
        await api.put(`/tags/${tagId}`, tagData);
      } else {
        await api.post("/tags", tagData);
      }
      toast.success(
        kanban === 0
          ? `${i18n.t("tagModal.success")}`
          : `${i18n.t("tagModal.successKanban")}`
      );
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const dialogTitle = tagId
    ? kanban === 0 ? i18n.t("tagModal.title.edit")   : i18n.t("tagModal.title.editKanban")
    : kanban === 0 ? i18n.t("tagModal.title.add")    : i18n.t("tagModal.title.addKanban");

  const dialogSub = kanban === 0
    ? "Etiquetas · Organização de contatos"
    : "Kanban · Colunas do quadro";

  return (
    <div className="tmd-root">
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
                  <LabelIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {dialogTitle}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    {dialogSub}
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
          initialValues={tag}
          enableReinitialize={true}
          validationSchema={TagSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveTag(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent className={classes.dialogContent}>
                <Grid container spacing={2}>

                  {/* Nome */}
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label={i18n.t("tagModal.form.name")}
                      name="name"
                      autoFocus
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      size="small"
                      onChange={(e) => setTag((prev) => ({ ...prev, name: e.target.value }))}
                      fullWidth
                      className={classes.textField}
                    />
                  </Grid>

                  {/* Cor */}
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label={i18n.t("tagModal.form.color")}
                      name="color"
                      id="color"
                      error={touched.color && Boolean(errors.color)}
                      helperText={touched.color && errors.color}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{ backgroundColor: values.color }}
                              className={classes.colorAdornment}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setColorPickerModalOpen(!colorPickerModalOpen)}
                            >
                              <Colorize style={{ fontSize: 17 }} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                      size="small"
                      className={classes.textField}
                    />

                    {colorPickerModalOpen && (
                      <Box className={classes.colorPickerWrap}>
                        <ColorBox
                          disableAlpha={true}
                          hslGradient={false}
                          style={{ margin: "0 auto" }}
                          value={tag.color}
                          onChange={(val) =>
                            setTag((prev) => ({ ...prev, color: `#${val.hex}` }))
                          }
                        />
                      </Box>
                    )}
                  </Grid>

                  {/* Campos Kanban */}
                  {kanban === 1 && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Field
                          as={TextField}
                          label={i18n.t("tagModal.form.timeLane")}
                          name="timeLane"
                          error={touched.timeLane && Boolean(errors.timeLane)}
                          helperText={touched.timeLane && errors.timeLane}
                          variant="outlined"
                          size="small"
                          onChange={(e) =>
                            setTag((prev) => ({ ...prev, timeLane: e.target.value }))
                          }
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                          <InputLabel id="nextLane-label">
                            {i18n.t("tagModal.form.nextLaneId")}
                          </InputLabel>
                          <Field
                            as={Select}
                            label={i18n.t("tagModal.form.nextLaneId")}
                            labelId="nextLane-label"
                            id="nextLaneId"
                            name="nextLaneId"
                            error={touched.nextLaneId && Boolean(errors.nextLaneId)}
                            value={selectedLane}
                            onChange={(e) => setSelectedLane(e.target.value || null)}
                          >
                            <MenuItem value={null}>&nbsp;</MenuItem>
                            {lanes && lanes.map((lane) => (
                              <MenuItem key={lane.id} value={lane.id}>{lane.name}</MenuItem>
                            ))}
                          </Field>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("tagModal.form.greetingMessageLane")}
                          name="greetingMessageLane"
                          rows={5}
                          multiline
                          error={touched.greetingMessageLane && Boolean(errors.greetingMessageLane)}
                          helperText={touched.greetingMessageLane && errors.greetingMessageLane}
                          variant="outlined"
                          size="small"
                          onChange={(e) =>
                            setTag((prev) => ({ ...prev, greetingMessageLane: e.target.value }))
                          }
                          fullWidth
                          className={classes.textField}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                          <InputLabel id="rollbackLane-label">
                            {i18n.t("tagModal.form.rollbackLaneId")}
                          </InputLabel>
                          <Field
                            as={Select}
                            label={i18n.t("tagModal.form.rollbackLaneId")}
                            labelId="rollbackLane-label"
                            id="rollbackLaneId"
                            name="rollbackLaneId"
                            error={touched.rollbackLaneId && Boolean(errors.rollbackLaneId)}
                            value={selectedRollbackLane}
                            onChange={(e) => setSelectedRollbackLane(e.target.value)}
                          >
                            <MenuItem value={null}>&nbsp;</MenuItem>
                            {lanes && lanes.map((lane) => (
                              <MenuItem key={lane.id} value={lane.id}>{lane.name}</MenuItem>
                            ))}
                          </Field>
                        </FormControl>
                      </Grid>
                    </>
                  )}

                </Grid>
              </DialogContent>

              {/* ── Ações ────────────────────────────────────────── */}
              <DialogActions className={classes.dialogActions}>

                <Button
                  onClick={handleClose}
                  variant="outlined"
                  disabled={isSubmitting}
                  className={classes.cancelButton}
                >
                  {i18n.t("tagModal.buttons.cancel")}
                </Button>

                <div className={classes.btnWrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    className={classes.submitButton}
                  >
                    {tagId
                      ? `${i18n.t("tagModal.buttons.okEdit")}`
                      : `${i18n.t("tagModal.buttons.okAdd")}`}
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

export default TagModal;