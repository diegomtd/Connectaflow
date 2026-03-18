import React, { useState, useEffect, useRef, useContext, Fragment } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import { isArray } from "lodash";

import { makeStyles, alpha } from "@material-ui/core/styles";
import Button            from "@material-ui/core/Button";
import TextField         from "@material-ui/core/TextField";
import Dialog            from "@material-ui/core/Dialog";
import DialogActions     from "@material-ui/core/DialogActions";
import DialogContent     from "@material-ui/core/DialogContent";
import DialogTitle       from "@material-ui/core/DialogTitle";
import CircularProgress  from "@material-ui/core/CircularProgress";
import IconButton        from "@material-ui/core/IconButton";
import InputAdornment    from "@material-ui/core/InputAdornment";
import FormControl       from "@material-ui/core/FormControl";
import FormControlLabel  from "@material-ui/core/FormControlLabel";
import Grid              from "@material-ui/core/Grid";
import InputLabel        from "@material-ui/core/InputLabel";
import MenuItem          from "@material-ui/core/MenuItem";
import Paper             from "@material-ui/core/Paper";
import Select            from "@material-ui/core/Select";
import Switch            from "@material-ui/core/Switch";
import Tab               from "@material-ui/core/Tab";
import Tabs              from "@material-ui/core/Tabs";
import Typography        from "@material-ui/core/Typography";
import Stepper           from "@material-ui/core/Stepper";
import Step              from "@material-ui/core/Step";
import StepLabel         from "@material-ui/core/StepLabel";
import StepContent       from "@material-ui/core/StepContent";
import Box               from "@material-ui/core/Box";
import Divider           from "@material-ui/core/Divider";

import SaveIcon                from "@material-ui/icons/Save";
import EditIcon                from "@material-ui/icons/Edit";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import DeleteOutline           from "@material-ui/icons/DeleteOutline";
import CloseIcon               from "@material-ui/icons/Close";
import QueueIcon               from "@material-ui/icons/Queue";
import { Colorize }            from "@material-ui/icons";

import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import Checkbox from "@mui/material/Checkbox";

import { i18n }              from "../../translate/i18n";
import api                   from "../../services/api";
import toastError            from "../../errors/toastError";
import ColorBoxModal         from "../ColorBoxModal";
import ConfirmationModal     from "../ConfirmationModal";
import OptionsChatBot        from "../ChatBots/options";
import CustomToolTip         from "../ToolTips";
import SchedulesForm         from "../SchedulesForm";
import useCompanySettings    from "../../hooks/useSettings/companySettings";
import { AuthContext }       from "../../context/Auth/AuthContext";
import useQueues             from "../../hooks/useQueues";
import UserStatusIcon        from "../UserModal/statusIcon";
import usePlans              from "../../hooks/usePlans";

/* ─── Fontes ─────────────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500&display=swap');
    .qmd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .qmd-root ::-webkit-scrollbar { width: 4px; }
    .qmd-root ::-webkit-scrollbar-track { background: transparent; }
    .qmd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  `}</style>
);

const QueueSchema = Yup.object().shape({
  name:  Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
  greetingMessage: Yup.string(),
  chatbots: Yup.array()
    .of(Yup.object().shape({ name: Yup.string().min(4, "too short").required("Required") }))
    .required("Must have friends"),
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
  const stepperBg   = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)";

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

    /* ── Header ── */
    dialogTitle: { padding: 0, "& > *": { padding: 0 }, flexShrink: 0 },
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
      letterSpacing: "-0.01em", lineHeight: 1, color: textPrimary,
    },
    titleSub: { fontSize: 11, marginTop: 3, color: textMuted },
    closeButton: {
      width: 30, height: 30, borderRadius: 8, padding: 0,
      border: `1px solid ${border}`,
      backgroundColor: "transparent", color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.40), color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.10 : 0.05),
      },
    },

    /* ── Tabs ── */
    tabsWrap: {
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${border}`,
      flexShrink: 0,
    },
    tabsRoot: { minHeight: 40, padding: theme.spacing(0, 2) },
    tabRoot: {
      minHeight: 40, fontSize: "0.78rem", fontWeight: 600,
      textTransform: "none", letterSpacing: 0, color: textMuted,
      "&.Mui-selected": { color: primary, fontWeight: 700 },
    },

    /* ── Content ── */
    dialogContent: {
      padding: theme.spacing(2.5, 3),
      backgroundColor: surfaceBg,
      borderBottom: `1px solid ${divider}`,
      overflowY: "auto",
      flex: "1 1 auto",
      minHeight: 0,
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
        fontSize: "0.82rem", lineHeight: 1.6,
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

    /* ── Color swatch ── */
    colorAdornment: { width: 20, height: 20, borderRadius: 5, border: `1px solid ${border}` },

    /* ── Switches / inline rows ── */
    switchRow: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: theme.spacing(1, 1.5), borderRadius: 10, marginBottom: theme.spacing(1),
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
      border: `1px solid ${border}`,
    },
    switchLabel: { fontSize: "0.83rem", fontWeight: 500, color: textPrimary },

    /* ── Section divider ── */
    sectionLabel: {
      fontSize: "0.72rem", fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
      color: textMuted, marginBottom: theme.spacing(1), marginTop: theme.spacing(2),
    },
    sectionDivider: { backgroundColor: divider, margin: theme.spacing(2, 0, 1.5) },

    /* ── Stepper (chatbots) ── */
    stepperWrap: {
      borderRadius: 12,
      border: `1px solid ${border}`,
      backgroundColor: stepperBg,
      padding: theme.spacing(1, 1.5),
      marginTop: theme.spacing(1),
      "& .MuiStepLabel-label": { fontSize: "0.83rem", color: textPrimary },
      "& .MuiStepConnector-line": { borderColor: border },
    },
    greetingMessage: {
      cursor: "pointer", display: "flex", alignItems: "center",
      "& > *:not(:last-child)": { marginRight: theme.spacing(1) },
    },
    stepActionBtn: {
      width: 28, height: 28, borderRadius: 7, padding: 0,
      border: `1px solid ${border}`, color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha(primary, 0.45), color: primary,
        backgroundColor: alpha(primary, isDark ? 0.1 : 0.05),
      },
    },
    stepDeleteBtn: {
      width: 28, height: 28, borderRadius: 7, padding: 0,
      border: `1px solid ${border}`, color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.45), color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.1 : 0.05),
      },
    },
    addOptionLabel: {
      fontSize: "0.8rem", fontWeight: 600, color: primary, cursor: "pointer",
    },

    /* ── Schedules tab ── */
    schedulesPaper: {
      padding: theme.spacing(2.5, 3),
      backgroundColor: surfaceBg,
      flex: "1 1 auto", minHeight: 0, overflowY: "auto",
    },

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

/* ══════════════════════════════════════════════════════════════════════════ */
const QueueModal = ({ open, onClose, queueId, onEdit }) => {
  const classes = useStyles();

  const initialState = {
    name: "", color: "", greetingMessage: "", chatbots: [],
    outOfHoursMessage: "", orderQueue: "", tempoRoteador: 0,
    ativarRoteador: false, integrationId: "", fileListId: "", closeTicket: false,
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue]         = useState(initialState);
  const greetingRef               = useRef();
  const [activeStep, setActiveStep]   = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isStepContent, setIsStepContent]       = useState(true);
  const [isNameEdit, setIsNamedEdit]             = useState(null);
  const [isGreetingMessageEdit, setGreetingMessageEdit] = useState(null);
  const [queues, setQueues]           = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const [tab, setTab]                 = useState(0);
  const [file, setFile]               = useState([]);
  const { user }                      = useContext(AuthContext);
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading]         = useState(false);
  const [selectedQueueOption, setSelectedQueueOption] = useState("");
  const { findAll: findAllQueues }    = useQueues();
  const [allQueues, setAllQueues]     = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const isMounted                     = useRef(true);
  const [showOpenAi, setShowOpenAi]   = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  const initialStateSchedule = [
    { weekday: i18n.t("queueModal.serviceHours.monday"),    weekdayEn: "monday",    startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.tuesday"),   weekdayEn: "tuesday",   startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.wednesday"), weekdayEn: "wednesday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.thursday"),  weekdayEn: "thursday",  startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: i18n.t("queueModal.serviceHours.friday"),    weekdayEn: "friday",    startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: "Sábado",  weekdayEn: "saturday", startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
    { weekday: "Domingo", weekdayEn: "sunday",   startTimeA: "08:00", endTimeA: "12:00", startTimeB: "13:00", endTimeB: "18:00" },
  ];
  const [schedules, setSchedules] = useState(initialStateSchedule);
  const companyId = user.companyId;

  const { get: getSetting } = useCompanySettings();
  const { getPlanCompany }  = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const setting = await getSetting({ column: "scheduleType" });
      if (setting.scheduleType === "queue") setSchedulesEnabled(true);
    };
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", { params: { companyId } });
        setFile(data.files || []);
      } catch (err) { toastError(err); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prev) => ({ ...prev, ...data }));
        if (isArray(data.schedules) && data.schedules.length > 0) setSchedules(data.schedules);
      } catch (err) { toastError(err); }
    })();
    return () => {
      setQueue({ name: "", color: "", greetingMessage: "", chatbots: [],
        outOfHoursMessage: "", orderQueue: "", tempoRoteador: "", ativarRoteador: false,
        integrationId: "", fileListId: "", closeTicket: false });
    };
  }, [queueId, open]);

  useEffect(() => {
    if (isMounted.current) {
      const loadQueues = async () => {
        const list = await findAllQueues();
        setAllQueues(list); setQueues(list);
      };
      loadQueues();
    }
  }, []);

  useEffect(() => {
    if (searchParam.length < 3) { setLoading(false); setSelectedQueueOption(""); return; }
    const delayDebounceFn = setTimeout(() => {
      (async () => {
        try {
          const { data } = await api.get("/users/");
          setUserOptions(data.users); setLoading(false);
        } catch (err) { setLoading(false); toastError(err); }
      })();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queueIntegration");
        setIntegrations(data.queueIntegrations);
      } catch (err) { toastError(err); }
    })();
  }, []);

  useEffect(() => {
    if (activeStep) setSelectedQueueOption(queue.chatbots[activeStep]?.optQueueId);
    if (activeStep === isNameEdit) setIsStepContent(false);
    else setIsStepContent(true);
  }, [isNameEdit, activeStep, queue.chatbots]);

  const handleClose = () => {
    onClose(); setIsNamedEdit(null); setActiveStep(null); setGreetingMessageEdit(null);
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values); setTab(0);
  };

  const filterOptions = createFilterOptions({ trim: true });

  const handleDeleteQueue = async (optionsId) => {
    try {
      await api.delete(`/chatbot/${optionsId}`);
      const { data } = await api.get(`/queue/${queueId}`);
      setQueue(initialState); setQueue(data);
      setIsNamedEdit(null); setGreetingMessageEdit(null);
      toast.success(`${i18n.t("queues.toasts.deleted")}`);
    } catch (err) { toastError(err); }
  };

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) await api.put(`/queue/${queueId}`, { ...values, schedules });
      else await api.post("/queue", { ...values, schedules });
      toast.success(`${i18n.t("queues.toasts.success")}`);
      handleClose();
    } catch (err) { toastError(err); }
  };

  const handleSaveBot = async (values) => {
    try {
      if (queueId) {
        const { data } = await api.put(`/queue/${queueId}`, values);
        if (data.chatbots?.length) { onEdit(data); setQueue(data); }
      } else {
        const { data } = await api.post("/queue", values);
        if (data.chatbots?.length) { setQueue(data); onEdit(data); handleClose(); }
      }
      setIsNamedEdit(null); setGreetingMessageEdit(null);
      toast.success(`${i18n.t("queues.toasts.success")}`);
    } catch (err) { toastError(err); }
  };

  return (
    <div className="qmd-root">
      <FontStyle />

      <ConfirmationModal
        title={selectedQueue && `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name}?`}
        open={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setSelectedQueue(null); }}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("queueModal.title.confirmationDelete")}
      </ConfirmationModal>

      <Dialog
        maxWidth="md"
        fullWidth
        open={open}
        onClose={handleClose}
        scroll="paper"
        PaperProps={{ className: classes.dialogPaper, elevation: 0 }}
        BackdropProps={{
          style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
        }}
      >
        {/* ── CABEÇALHO LIMPO ── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}>
                  <QueueIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {queueId ? i18n.t("queueModal.title.edit") : i18n.t("queueModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Filas · Configurações e chatbot
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={handleClose} className={classes.closeButton}>
                <CloseIcon style={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        {/* ── TABS ── */}
        <Box className={classes.tabsWrap}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            classes={{ root: classes.tabsRoot }}
          >
            <Tab label={i18n.t("queueModal.title.queueData")} classes={{ root: classes.tabRoot }} />
            {schedulesEnabled && <Tab label={i18n.t("queueModal.title.text")} classes={{ root: classes.tabRoot }} />}
          </Tabs>
        </Box>

        {/* ════════════ ABA 0: DADOS DA FILA ════════════ */}
        {tab === 0 && (
          <Formik
            initialValues={queue}
            validateOnChange={false}
            enableReinitialize={true}
            validationSchema={QueueSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => { handleSaveQueue(values); actions.setSubmitting(false); }, 400);
            }}
          >
            {({ setFieldValue, touched, errors, isSubmitting, values }) => (
              <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
                <DialogContent className={classes.dialogContent} style={{ overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
                  <Grid container spacing={2}>

                    {/* Nome */}
                    <Grid item xs={12} md={7}>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.name")}
                        autoFocus name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined" size="small" fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Cor */}
                    <Grid item xs={12} md={3}>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.color")}
                        name="color" id="color"
                        onFocus={() => { setColorPickerModalOpen(true); greetingRef.current.focus(); }}
                        error={touched.color && Boolean(errors.color)}
                        helperText={touched.color && errors.color}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <div style={{ backgroundColor: values.color }} className={classes.colorAdornment} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <IconButton size="small" onClick={() => setColorPickerModalOpen(!colorPickerModalOpen)}>
                              <Colorize style={{ fontSize: 16 }} />
                            </IconButton>
                          ),
                        }}
                        variant="outlined" size="small" fullWidth
                        className={classes.textField}
                      />
                      <ColorBoxModal
                        open={colorPickerModalOpen}
                        handleClose={() => setColorPickerModalOpen(false)}
                        onChange={(color) => setFieldValue("color", `#${color.hex}`)}
                        currentColor={values.color}
                      />
                    </Grid>

                    {/* Ordem */}
                    <Grid item xs={12} md={2}>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.orderQueue")}
                        name="orderQueue"
                        error={touched.orderQueue && Boolean(errors.orderQueue)}
                        helperText={touched.orderQueue && errors.orderQueue}
                        variant="outlined" size="small" fullWidth
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Switches: Fechar ticket + Roteador */}
                    <Grid item xs={12} md={6}>
                      <Box className={classes.switchRow}>
                        <Typography className={classes.switchLabel}>
                          {i18n.t("queueModal.form.closeTicket")}
                        </Typography>
                        <Field as={Switch} color="primary" name="closeTicket" checked={values.closeTicket} size="small" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box className={classes.switchRow}>
                        <Typography className={classes.switchLabel}>
                          {i18n.t("queueModal.form.rotate")}
                        </Typography>
                        <Field as={Switch} color="primary" name="ativarRoteador" checked={values.ativarRoteador} size="small" />
                      </Box>
                    </Grid>

                    {/* Tempo roteador */}
                    <Grid item xs={12} md={4}>
                      <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                        <InputLabel>{i18n.t("queueModal.form.timeRotate")}</InputLabel>
                        <Field as={Select} name="tempoRoteador" label={i18n.t("queueModal.form.timeRotate")}>
                          <MenuItem value="0" disabled>{i18n.t("queueModal.form.timeRotate")}</MenuItem>
                          {["2","5","10","15","30","45","60"].map((v) => (
                            <MenuItem key={v} value={v}>{v} minutos</MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>

                    {/* Integração */}
                    {showIntegrations && (
                      <Grid item xs={12} md={4}>
                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                          <InputLabel id="integrationId-label">{i18n.t("queueModal.form.integrationId")}</InputLabel>
                          <Field as={Select} name="integrationId" label={i18n.t("queueModal.form.integrationId")} labelId="integrationId-label" value={values.integrationId || ""}>
                            <MenuItem value="">Nenhum</MenuItem>
                            {integrations.map((i) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
                          </Field>
                        </FormControl>
                      </Grid>
                    )}

                    {/* Lista de arquivos */}
                    <Grid item xs={12} md={showIntegrations ? 4 : 8}>
                      <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                        <InputLabel id="fileListId-label">{i18n.t("queueModal.form.fileListId")}</InputLabel>
                        <Field as={Select} name="fileListId" label={i18n.t("queueModal.form.fileListId")} labelId="fileListId-label" value={values.fileListId || ""}>
                          <MenuItem value="">Nenhum</MenuItem>
                          {file.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                        </Field>
                      </FormControl>
                    </Grid>

                    {/* Mensagem de saudação */}
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.greetingMessage")}
                        name="greetingMessage"
                        multiline minRows={4} fullWidth
                        inputRef={greetingRef}
                        error={touched.greetingMessage && Boolean(errors.greetingMessage)}
                        helperText={touched.greetingMessage && errors.greetingMessage}
                        variant="outlined" size="small"
                        className={classes.textField}
                      />
                    </Grid>

                    {/* Mensagem fora do horário */}
                    {schedulesEnabled && (
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.outOfHoursMessage")}
                          name="outOfHoursMessage"
                          multiline rows={4} fullWidth required
                          error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                          helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
                          variant="outlined" size="small"
                          className={classes.textField}
                        />
                      </Grid>
                    )}

                    {/* ── CHATBOT STEPPER ── */}
                    <Grid item xs={12}>
                      <Box style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <Typography className={classes.sectionLabel}>
                          {i18n.t("queueModal.bot.title")}
                        </Typography>
                        <CustomToolTip
                          title={i18n.t("queueModal.bot.toolTipTitle")}
                          content={i18n.t("queueModal.bot.toolTip")}
                        >
                          <HelpOutlineOutlinedIcon style={{ fontSize: 15, color: "#8fa0b0" }} />
                        </CustomToolTip>
                      </Box>

                      <FieldArray name="chatbots">
                        {({ push, remove }) => (
                          <Box className={classes.stepperWrap}>
                            <Stepper nonLinear activeStep={activeStep} orientation="vertical" style={{ backgroundColor: "transparent", padding: 0 }}>
                              {values.chatbots?.length > 0 && values.chatbots.map((info, index) => (
                                <Step key={`${info.id ?? index}-chatbots`} onClick={() => setActiveStep(index)}>
                                  <StepLabel>
                                    {isNameEdit !== index && queue.chatbots[index]?.name ? (
                                      <div className={classes.greetingMessage}>
                                        <Typography style={{ fontSize: "0.83rem" }}>{values.chatbots[index].name}</Typography>
                                        <IconButton size="small" className={classes.stepActionBtn}
                                          onClick={() => { setIsNamedEdit(index); setIsStepContent(false); }}>
                                          <EditIcon style={{ fontSize: 14 }} />
                                        </IconButton>
                                        <IconButton size="small" className={classes.stepDeleteBtn}
                                          onClick={() => { setSelectedQueue(info); setConfirmModalOpen(true); }}>
                                          <DeleteOutline style={{ fontSize: 14 }} />
                                        </IconButton>
                                      </div>
                                    ) : (
                                      <Grid spacing={1} container>
                                        <Grid xs={12} md={12} item>
                                          <Field as={TextField} name={`chatbots[${index}].name`}
                                            variant="outlined" size="small" autoFocus fullWidth
                                            label={i18n.t("queueModal.form.greetingMessage")}
                                            disabled={isSubmitting} className={classes.textField}
                                            error={touched?.chatbots?.[index]?.name && Boolean(errors.chatbots?.[index]?.name)}
                                          />
                                        </Grid>
                                        <Grid xs={12} md={8} item>
                                          <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                            <InputLabel id={`queueType-${index}`}>{i18n.t("queueModal.form.queueType")}</InputLabel>
                                            <Field as={Select} name={`chatbots[${index}].queueType`} fullWidth
                                              labelId={`queueType-${index}`} label={i18n.t("queueModal.form.queueType")}
                                              error={touched?.chatbots?.[index]?.queueType && Boolean(errors?.chatbots?.[index]?.queueType)}
                                            >
                                              <MenuItem value="text">{i18n.t("queueModal.bot.text")}</MenuItem>
                                              <MenuItem value="attendent">{i18n.t("queueModal.bot.attendent")}</MenuItem>
                                              <MenuItem value="queue">{i18n.t("queueModal.bot.queue")}</MenuItem>
                                              {showIntegrations && <MenuItem value="integration">{i18n.t("queueModal.bot.integration")}</MenuItem>}
                                              <MenuItem value="file">{i18n.t("queueModal.bot.file")}</MenuItem>
                                            </Field>
                                          </FormControl>
                                        </Grid>
                                        <Grid xs={12} md={4} item style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                          <FormControlLabel
                                            control={
                                              <Field as={Checkbox} color="primary" name={`chatbots[${index}].closeTicket`}
                                                checked={values.chatbots[index].closeTicket || false} size="small" />
                                            }
                                            labelPlacement="top"
                                            label={<Typography style={{ fontSize: "0.72rem" }}>{i18n.t("queueModal.form.closeTicket")}</Typography>}
                                          />
                                          <IconButton size="small" className={classes.stepActionBtn}
                                            onClick={() => values.chatbots[index].name ? handleSaveBot(values) : null}
                                            disabled={isSubmitting}>
                                            <SaveIcon style={{ fontSize: 14 }} />
                                          </IconButton>
                                          <IconButton size="small" className={classes.stepDeleteBtn}
                                            onClick={() => remove(index)} disabled={isSubmitting}>
                                            <DeleteOutline style={{ fontSize: 14 }} />
                                          </IconButton>
                                        </Grid>
                                      </Grid>
                                    )}
                                  </StepLabel>

                                  {isStepContent && queue.chatbots[index] && (
                                    <StepContent>
                                      {isGreetingMessageEdit !== index ? (
                                        <div className={classes.greetingMessage}>
                                          <Typography color="textSecondary" style={{ fontSize: "0.78rem" }}>Message:</Typography>
                                          <Typography style={{ fontSize: "0.83rem" }}>{values.chatbots[index].greetingMessage}</Typography>
                                          {!queue.chatbots[index]?.greetingMessage && (
                                            <CustomToolTip title={i18n.t("queueModal.bot.toolTipMessageTitle")} content={i18n.t("queueModal.bot.toolTipMessageContent")}>
                                              <HelpOutlineOutlinedIcon color="secondary" style={{ marginLeft: 4, fontSize: 15 }} />
                                            </CustomToolTip>
                                          )}
                                          <IconButton size="small" className={classes.stepActionBtn} onClick={() => setGreetingMessageEdit(index)}>
                                            <EditIcon style={{ fontSize: 14 }} />
                                          </IconButton>
                                        </div>
                                      ) : (
                                        <Grid spacing={1} container>
                                          {/* Text / Queue / Attendent / Integration / File — message field */}
                                          {["text","queue","attendent","integration","file"].includes(queue.chatbots[index].queueType) && (
                                            <Grid xs={12} item>
                                              <Field as={TextField} name={`chatbots[${index}].greetingMessage`}
                                                label={i18n.t("queueModal.form.message")}
                                                variant="outlined" size="small" fullWidth multiline
                                                className={classes.textField}
                                              />
                                            </Grid>
                                          )}

                                          {/* Queue selector */}
                                          {queue.chatbots[index].queueType === "queue" && (
                                            <Grid xs={12} md={8} item>
                                              <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                                <InputLabel id={`opt-queue-${index}`}>{i18n.t("queueModal.form.queue")}</InputLabel>
                                                <Field as={Select} name={`chatbots[${index}].optQueueId`} labelId={`opt-queue-${index}`}>
                                                  {queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}
                                                </Field>
                                              </FormControl>
                                            </Grid>
                                          )}

                                          {/* Attendent: user + queue */}
                                          {queue.chatbots[index].queueType === "attendent" && (
                                            <>
                                              <Grid xs={12} md={4} item>
                                                <Autocomplete
                                                  style={{ marginTop: 4 }}
                                                  variant="outlined"
                                                  getOptionLabel={(o) => `${o.name}`}
                                                  value={queue.chatbots[index].user}
                                                  onChange={(_, newValue) => {
                                                    setFieldValue(`chatbots[${index}].optUserId`, newValue?.id ?? null);
                                                    if (newValue?.queues?.length === 1) {
                                                      setSelectedQueueOption(newValue.queues[0].id);
                                                      setFieldValue(`chatbots[${index}].optQueueId`, newValue.queues[0].id);
                                                    }
                                                    setQueues(newValue?.queues ?? allQueues);
                                                    if (!newValue) setSelectedQueueOption("");
                                                  }}
                                                  options={userOptions}
                                                  filterOptions={filterOptions}
                                                  freeSolo fullWidth autoHighlight
                                                  noOptionsText={i18n.t("transferTicketModal.noOptions")}
                                                  loading={loading} size="small"
                                                  renderOption={(o) => <span><UserStatusIcon user={o} /> {o.name}</span>}
                                                  renderInput={(params) => (
                                                    <TextField {...params}
                                                      label={i18n.t("transferTicketModal.fieldLabel")}
                                                      variant="outlined" size="small"
                                                      onChange={(e) => setSearchParam(e.target.value)}
                                                      className={classes.textField}
                                                      InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                          <Fragment>
                                                            {loading ? <CircularProgress color="inherit" size={16} /> : null}
                                                            {params.InputProps.endAdornment}
                                                          </Fragment>
                                                        ),
                                                      }}
                                                    />
                                                  )}
                                                />
                                              </Grid>
                                              <Grid xs={12} md={4} item>
                                                <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                                  <InputLabel>{i18n.t("transferTicketModal.fieldQueueLabel")}</InputLabel>
                                                  <Select value={selectedQueueOption}
                                                    onChange={(e) => { setSelectedQueueOption(e.target.value); setFieldValue(`chatbots[${index}].optQueueId`, e.target.value); }}
                                                    label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}>
                                                    {queues.map((q) => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}
                                                  </Select>
                                                </FormControl>
                                              </Grid>
                                            </>
                                          )}

                                          {/* Integration selector */}
                                          {queue.chatbots[index].queueType === "integration" && (
                                            <Grid xs={12} md={8} item>
                                              <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                                <InputLabel id={`opt-int-${index}`}>{i18n.t("queueModal.form.integration")}</InputLabel>
                                                <Field as={Select} name={`chatbots[${index}].optIntegrationId`} labelId={`opt-int-${index}`}>
                                                  {integrations.map((i) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
                                                </Field>
                                              </FormControl>
                                            </Grid>
                                          )}

                                          {/* File selector */}
                                          {queue.chatbots[index].queueType === "file" && (
                                            <Grid xs={12} md={8} item>
                                              <FormControl variant="outlined" size="small" fullWidth className={classes.formControl}>
                                                <InputLabel>Selecione um Arquivo</InputLabel>
                                                <Field as={Select} name={`chatbots[${index}].optFileId`}>
                                                  {file.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                                                </Field>
                                              </FormControl>
                                            </Grid>
                                          )}

                                          <Grid xs={12} item style={{ display: "flex", justifyContent: "flex-end" }}>
                                            <IconButton size="small" className={classes.stepActionBtn}
                                              onClick={() => handleSaveBot(values)} disabled={isSubmitting}>
                                              <SaveIcon style={{ fontSize: 14 }} />
                                            </IconButton>
                                          </Grid>
                                        </Grid>
                                      )}
                                      <OptionsChatBot chatBotId={info.id} />
                                    </StepContent>
                                  )}
                                </Step>
                              ))}

                              {/* Adicionar opção */}
                              <Step>
                                <StepLabel onClick={() => push({ name: "", value: "" })}>
                                  <Typography className={classes.addOptionLabel}>
                                    {i18n.t("queueModal.bot.addOptions")}
                                  </Typography>
                                </StepLabel>
                              </Step>
                            </Stepper>
                          </Box>
                        )}
                      </FieldArray>
                    </Grid>

                  </Grid>
                </DialogContent>

                <DialogActions className={classes.dialogActions}>
                  <Button variant="outlined" onClick={handleClose} disabled={isSubmitting} className={classes.cancelButton}>
                    {i18n.t("queueModal.buttons.cancel")}
                  </Button>
                  <div className={classes.btnWrapper}>
                    <Button type="submit" color="primary" variant="contained" disabled={isSubmitting} className={classes.submitButton}>
                      {queueId ? i18n.t("queueModal.buttons.okEdit") : i18n.t("queueModal.buttons.okAdd")}
                    </Button>
                    {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
                  </div>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}

        {/* ════════════ ABA 1: HORÁRIOS ════════════ */}
        {tab === 1 && (
          <Box className={classes.schedulesPaper}>
            <SchedulesForm
              loading={false}
              onSubmit={handleSaveSchedules}
              initialValues={schedules}
              labelSaveButton={i18n.t("whatsappModal.buttons.okAdd")}
            />
          </Box>
        )}
      </Dialog>
    </div>
  );
};

export default QueueModal;