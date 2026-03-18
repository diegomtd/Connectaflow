import React, { useState, useEffect, useContext, useRef } from "react";

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
import Select           from "@material-ui/core/Select";
import InputLabel       from "@material-ui/core/InputLabel";
import MenuItem         from "@material-ui/core/MenuItem";
import FormControl      from "@material-ui/core/FormControl";
import Grid             from "@material-ui/core/Grid";
import IconButton       from "@material-ui/core/IconButton";
import Box              from "@material-ui/core/Box";
import Typography       from "@material-ui/core/Typography";
import Divider          from "@material-ui/core/Divider";

import CloseIcon  from "@material-ui/icons/Close";
import PersonIcon from "@material-ui/icons/Person";
import SecurityIcon from "@material-ui/icons/Security";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import SettingsIcon from "@material-ui/icons/Settings";

import { i18n }          from "../../translate/i18n";
import api               from "../../services/api";
import toastError        from "../../errors/toastError";
import QueueSelect       from "../QueueSelect";
import { AuthContext }   from "../../context/Auth/AuthContext";
import useWhatsApps      from "../../hooks/useWhatsApps";
import { Can }           from "../Can";
import AvatarUploader    from "../AvatarUpload";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@500&display=swap');
    .umd-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .umd-root ::-webkit-scrollbar { width: 4px; }
    .umd-root ::-webkit-scrollbar-track { background: transparent; }
    .umd-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }

    /* Toggle pill button */
    .toggle-pill {
      display: inline-flex; align-items: center; gap: 0;
      border-radius: 8px; overflow: hidden;
      border: 1px solid var(--section-border);
      flex-shrink: 0;
    }
    .toggle-pill-btn {
      padding: 4px 11px;
      font-size: 0.72rem; font-weight: 600;
      cursor: pointer; border: none; outline: none;
      transition: background 0.18s, color 0.18s;
      line-height: 1.5;
      font-family: inherit;
    }
    .toggle-pill-btn.active-on {
      background: #22c55e; color: #fff;
    }
    .toggle-pill-btn.active-off {
      background: rgba(239,68,68,0.13); color: #ef4444;
    }
    .toggle-pill-btn.inactive {
      background: transparent; color: var(--text-muted, #8fa0b0);
    }
    .toggle-pill-sep {
      width: 1px; height: 100%; background: var(--section-border);
      flex-shrink: 0; align-self: stretch;
    }

    /* Section card */
    .section-card {
      border-radius: 12px;
      border: 1px solid var(--section-border);
      background: var(--section-bg);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--section-border);
      background: var(--section-header-bg);
    }
    .section-header-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .section-body { padding: 14px; }
  `}</style>
);

const UserSchema = Yup.object().shape({
  name:       Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  password:   Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email:      Yup.string().email("Invalid email").required("Required"),
  allHistoric: Yup.string().nullable(),
});

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg     = isDark ? "#0f1929" : "#f4f7fb";
  const cardBg        = isDark ? "#131e2e" : "#ffffff";
  const headerBg      = isDark ? "#0b1520" : "#f8fafc";
  const border        = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const sectionBorder = isDark ? "rgba(255,255,255,0.07)" : "#e8eef5";
  const sectionHead   = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
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
      "--section-border": sectionBorder,
      "--section-bg": cardBg,
      "--section-header-bg": sectionHead,
      "--text-muted": textMuted,
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

    /* Section icon colors */
    iconIdentity:   { backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" },
    iconSchedule:   { backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" },
    iconAccess:     { backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" },
    iconPerms:      { backgroundColor: alpha("#059669", isDark ? 0.15 : 0.08), color: "#059669" },

    sectionTitle: {
      fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.01em",
      color: textPrimary,
    },
    sectionSub: { fontSize: "0.70rem", color: textMuted, marginTop: 1 },

    /* Campos */
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
      "& .MuiInputBase-inputMultiline": {
        fontFamily: "'JetBrains Mono', monospace !important",
        fontSize: "0.80rem", lineHeight: 1.6,
      },
    },
    formControl: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 9,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.10)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.20)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.82rem" },
      "& .MuiSelect-root": { fontSize: "0.83rem", color: textPrimary },
    },

    /* Toggle row */
    toggleRow: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: `1px solid ${sectionBorder}`,
      "&:last-child": { borderBottom: "none", paddingBottom: 0 },
      "&:first-child": { paddingTop: 0 },
    },
    toggleLabel: { fontSize: "0.80rem", fontWeight: 500, color: textPrimary },
    toggleDesc:  { fontSize: "0.70rem", color: textMuted, marginTop: 1 },

    /* Avatar */
    avatarWrap: {
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: theme.spacing(1.5, 0, 1),
    },
    removeAvatarBtn: {
      borderRadius: 8, textTransform: "none",
      fontWeight: 600, fontSize: "0.74rem",
      marginTop: theme.spacing(1),
      borderColor: alpha("#ef4444", 0.30),
      color: "#ef4444",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.55),
        backgroundColor: alpha("#ef4444", isDark ? 0.1 : 0.05),
      },
    },

    /* Actions */
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

/* ── Toggle Pill Component ───────────────────────────────────────────────── */
const TogglePill = ({ value, onChange }) => {
  const isOn = value === true || value === "enabled" || value === "enable";
  return (
    <div className="toggle-pill">
      <button
        type="button"
        className={`toggle-pill-btn ${isOn ? "active-on" : "inactive"}`}
        onClick={() => !isOn && onChange(true)}
      >
        Ativo
      </button>
      <div className="toggle-pill-sep" />
      <button
        type="button"
        className={`toggle-pill-btn ${!isOn ? "active-off" : "inactive"}`}
        onClick={() => isOn && onChange(false)}
      >
        Inativo
      </button>
    </div>
  );
};

/* ── Toggle Row for boolean permissions ─────────────────────────────────── */
const PermToggle = ({ label, description, name, classes, values, setFieldValue, trueVal = "enabled", falseVal = "disabled" }) => {
  const raw = values[name];
  const isOn = raw === true || raw === "enabled" || raw === "enable";
  return (
    <div className={classes.toggleRow}>
      <div style={{ flex: 1, paddingRight: 12 }}>
        <div className={classes.toggleLabel}>{label}</div>
        {description && <div className={classes.toggleDesc}>{description}</div>}
      </div>
      <TogglePill
        value={isOn}
        onChange={(newVal) => setFieldValue(name, newVal ? trueVal : falseVal)}
      />
    </div>
  );
};

/* ── Section Card ────────────────────────────────────────────────────────── */
const SectionCard = ({ icon, iconClass, title, subtitle, children }) => (
  <div className="section-card">
    <div className="section-header">
      <div className={`section-header-icon ${iconClass}`}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="section-body">{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();

  const initialState = {
    name: "", email: "", password: "", profile: "user",
    startWork: "00:00", endWork: "23:59", farewellMessage: "",
    allTicket: "disable", allowGroup: false,
    defaultTheme: "light", defaultMenu: "open",
    allHistoric: "disabled", allUserChat: "disabled",
    userClosePendingTicket: "enabled", showDashboard: "disabled",
    allowRealTime: "disabled", allowConnections: "disabled",
    canViewAllContacts: false,
  };

  const { user: loggedInUser } = useContext(AuthContext);
  const [user, setUser]                         = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [whatsappId, setWhatsappId]             = useState("");
  const { whatsApps }                           = useWhatsApps();
  const [avatar, setAvatar]                     = useState(null);
  const startWorkRef                            = useRef();
  const endWorkRef                              = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        const userData = {
          ...data,
          name: data?.name ?? "", email: data?.email ?? "",
          password: "",
          startWork: data?.startWork ?? "00:00",
          endWork: data?.endWork ?? "23:59",
          farewellMessage: data?.farewellMessage ?? "",
          canViewAllContacts: !!data.canViewAllContacts,
        };
        setUser((prev) => ({ ...prev, ...userData }));
        setSelectedQueueIds(data.queues?.map((q) => q.id));
        setWhatsappId(data.whatsappId || "");
      } catch (err) { toastError(err); }
    };
    fetchUser();
  }, [userId, open]);

  const handleClose = () => { onClose(); setUser(initialState); setWhatsappId(""); };

  const handleSaveUser = async (values) => {
    const uploadAvatar = async (file) => {
      try {
        const formData = new FormData();
        formData.append("userId", file.id);
        formData.append("typeArch", "user");
        formData.append("profileImage", avatar);
        const { data } = await api.post(`/users/${file.id}/media-upload`, formData);
        localStorage.setItem("profileImage", data.user.profileImage);
      } catch (err) { toastError(err); }
    };

    const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
    try {
      if (userId) {
        const { data } = await api.put(`/users/${userId}`, userData);
        if (avatar && (!user?.profileImage || user?.profileImage !== avatar.name)) await uploadAvatar(data);
      } else {
        const { data } = await api.post("/users", userData);
        if (avatar) await uploadAvatar(data);
      }
      handleClose();
      toast.success(i18n.t("userModal.success"));
      if (userId === loggedInUser.id) window.location.reload();
    } catch (err) { toastError(err); }
  };

  return (
    <div className="umd-root">
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
        {/* ── CABEÇALHO ── */}
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Box className={classes.titleBar}>
            <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Box className={classes.titleIcon}>
                  <PersonIcon style={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography className={classes.titleText}>
                    {userId ? i18n.t("userModal.title.edit") : i18n.t("userModal.title.add")}
                  </Typography>
                  <Typography className={classes.titleSub}>
                    Usuários · Configurações da conta
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
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => { handleSaveUser(values); actions.setSubmitting(false); }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>

              <DialogContent className={classes.dialogContent}>

                {/* ════ IDENTIDADE ════ */}
                <SectionCard
                  icon={<PersonIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconIdentity}
                  title="Dados do usuário"
                  subtitle="Nome, e-mail, senha e avatar"
                >
                  {/* Avatar */}
                  <Box className={classes.avatarWrap}>
                    <FormControl>
                      <AvatarUploader
                        setAvatar={setAvatar}
                        avatar={user.profileImage}
                        companyId={user.companyId}
                      />
                      {user.profileImage && (
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.removeAvatarBtn}
                          onClick={() => {
                            user.profileImage = null;
                            setFieldValue("profileImage", null);
                            setAvatar(null);
                          }}
                        >
                          {i18n.t("userModal.title.removeImage")}
                        </Button>
                      )}
                    </FormControl>
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                      <Field as={TextField}
                        label={i18n.t("userModal.form.name")}
                        name="name" autoFocus
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined" size="small" fullWidth
                        className={classes.textField}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field as={TextField}
                        label={i18n.t("userModal.form.password")}
                        type="password" name="password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        variant="outlined" size="small" fullWidth
                        className={classes.textField}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field as={TextField}
                        label={i18n.t("userModal.form.email")}
                        name="email"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        variant="outlined" size="small" fullWidth
                        className={classes.textField}
                      />
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* ════ CONEXÃO E FILAS ════ */}
                <SectionCard
                  icon={<SettingsIcon style={{ fontSize: 14 }} />}
                  iconClass={classes.iconSchedule}
                  title="Conexão e filas"
                  subtitle="WhatsApp padrão e filas de atendimento"
                >
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Can role={loggedInUser.profile} perform="user-modal:editProfile" yes={() => (
                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                          <InputLabel>{i18n.t("userModal.form.whatsapp")}</InputLabel>
                          <Field as={Select} value={whatsappId} onChange={(e) => setWhatsappId(e.target.value)} label={i18n.t("userModal.form.whatsapp")}>
                            <MenuItem value="">&nbsp;</MenuItem>
                            {whatsApps.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                          </Field>
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid item xs={12}>
                      <Can role={loggedInUser.profile} perform="user-modal:editQueues" yes={() => (
                        <QueueSelect selectedQueueIds={selectedQueueIds} onChange={setSelectedQueueIds} fullWidth />
                      )} />
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* ════ HORÁRIO ════ */}
                <Can role={loggedInUser.profile} perform="user-modal:editProfile" yes={() => (
                  <SectionCard
                    icon={<AccessTimeIcon style={{ fontSize: 14 }} />}
                    iconClass={classes.iconSchedule}
                    title="Horário de trabalho"
                    subtitle="Início e fim do expediente"
                  >
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Field as={TextField}
                          label={i18n.t("userModal.form.startWork")}
                          type="time" name="startWork"
                          inputRef={startWorkRef}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 600 }}
                          error={touched.startWork && Boolean(errors.startWork)}
                          helperText={touched.startWork && errors.startWork}
                          variant="outlined" size="small" fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field as={TextField}
                          label={i18n.t("userModal.form.endWork")}
                          type="time" name="endWork"
                          inputRef={endWorkRef}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 600 }}
                          error={touched.endWork && Boolean(errors.endWork)}
                          helperText={touched.endWork && errors.endWork}
                          variant="outlined" size="small" fullWidth
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                          <InputLabel>{i18n.t("userModal.form.defaultTheme")}</InputLabel>
                          <Field as={Select} label={i18n.t("userModal.form.defaultTheme")} name="defaultTheme">
                            <MenuItem value="light">{i18n.t("userModal.form.defaultThemeLight")}</MenuItem>
                            <MenuItem value="dark">{i18n.t("userModal.form.defaultThemeDark")}</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                          <InputLabel>{i18n.t("userModal.form.defaultMenu")}</InputLabel>
                          <Field as={Select} label={i18n.t("userModal.form.defaultMenu")} name="defaultMenu">
                            <MenuItem value="open">{i18n.t("userModal.form.defaultMenuOpen")}</MenuItem>
                            <MenuItem value="closed">{i18n.t("userModal.form.defaultMenuClosed")}</MenuItem>
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Field as={TextField}
                          label={i18n.t("userModal.form.farewellMessage")}
                          name="farewellMessage"
                          multiline minRows={3} fullWidth
                          variant="outlined" size="small"
                          className={classes.textField}
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                )} />

                {/* ════ ACESSO ════ */}
                <Can role={loggedInUser.profile} perform="user-modal:editProfile" yes={() => (
                  <>
                    {/* Perfil de acesso */}
                    <SectionCard
                      icon={<SecurityIcon style={{ fontSize: 14 }} />}
                      iconClass={classes.iconAccess}
                      title="Nível de acesso"
                      subtitle="Perfil e permissões de administração"
                    >
                      <FormControl variant="outlined" size="small" fullWidth className={classes.formControl} margin="dense">
                        <InputLabel id="profile-label">{i18n.t("userModal.form.profile")}</InputLabel>
                        <Field as={Select} label={i18n.t("userModal.form.profile")} name="profile" labelId="profile-label" required>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                        </Field>
                      </FormControl>
                    </SectionCard>

                    {/* Permissões toggle */}
                    <SectionCard
                      icon={<SecurityIcon style={{ fontSize: 14 }} />}
                      iconClass={classes.iconPerms}
                      title="Permissões"
                      subtitle="Controle de funcionalidades por usuário"
                    >
                      {/* canViewAllContacts */}
                      <div className={classes.toggleRow}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <div className={classes.toggleLabel}>{i18n.t("userModal.form.canViewAllContacts")}</div>
                          <div className={classes.toggleDesc}>Permite visualizar contatos de todos os usuários, não apenas os próprios.</div>
                        </div>
                        <TogglePill
                          value={values.canViewAllContacts}
                          onChange={(v) => setFieldValue("canViewAllContacts", v)}
                        />
                      </div>

                      <PermToggle
                        label={i18n.t("userModal.form.allTicket")}
                        description="Acesso a todos os tickets do sistema, independente da fila ou atribuição."
                        name="allTicket" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                        trueVal="enable" falseVal="disable"
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.allowGroup")}
                        description="Habilita participação e gerenciamento de tickets em grupos de WhatsApp."
                        name="allowGroup" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                        trueVal={true} falseVal={false}
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.allHistoric")}
                        description="Visualização do histórico completo de conversas de outros atendentes."
                        name="allHistoric" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.allUserChat")}
                        description="Acesso ao chat interno entre usuários do sistema."
                        name="allUserChat" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.userClosePendingTicket")}
                        description="Permite encerrar tickets que ainda estão com status pendente."
                        name="userClosePendingTicket" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.allowConnections")}
                        description="Gerenciar conexões de WhatsApp e outros canais de atendimento."
                        name="allowConnections" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.showDashboard")}
                        description="Exibe o painel de indicadores e métricas de atendimento."
                        name="showDashboard" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                      />

                      <PermToggle
                        label={i18n.t("userModal.form.allowRealTime")}
                        description="Acesso ao monitoramento de atendimentos em tempo real."
                        name="allowRealTime" classes={classes}
                        values={values} setFieldValue={setFieldValue}
                      />
                    </SectionCard>
                  </>
                )} />

              </DialogContent>

              {/* ── AÇÕES ── */}
              <DialogActions className={classes.dialogActions}>
                <Button variant="outlined" onClick={handleClose} disabled={isSubmitting} className={classes.cancelButton}>
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <div className={classes.btnWrapper}>
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting} className={classes.submitButton}>
                    {userId ? i18n.t("userModal.buttons.okEdit") : i18n.t("userModal.buttons.okAdd")}
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

export default UserModal;