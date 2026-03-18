import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
} from "@material-ui/core";
import { alpha, useTheme } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";
import { Edit as EditIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";
import moment from "moment";
import { i18n } from "../../translate/i18n";

/* ─── Estilos injetados ──────────────────────────────────────────────────── */
const CMStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

    .cm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }

    /* Toggle Pill */
    .cm-toggle-pill {
      display: inline-flex; align-items: center;
      border-radius: 8px; overflow: hidden;
      border: 1px solid var(--cm-border); flex-shrink: 0;
    }
    .cm-toggle-btn {
      padding: 3px 10px; font-size: 0.70rem; font-weight: 600;
      cursor: pointer; border: none; outline: none;
      transition: background 0.18s, color 0.18s;
      line-height: 1.5; font-family: inherit;
    }
    .cm-toggle-btn.active-on  { background: #22c55e; color: #fff; }
    .cm-toggle-btn.active-off { background: rgba(239,68,68,0.13); color: #ef4444; }
    .cm-toggle-btn.inactive   { background: transparent; color: var(--cm-muted); }
    .cm-toggle-sep { width: 1px; background: var(--cm-border); align-self: stretch; flex-shrink: 0; }

    /* Section card */
    .cm-section-card {
      border-radius: 12px; border: 1px solid var(--cm-border);
      background: var(--cm-card-bg); overflow: hidden; margin-bottom: 16px;
    }
    .cm-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-bottom: 1px solid var(--cm-border);
      background: var(--cm-header-bg);
    }
    .cm-section-header-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cm-section-body { padding: 16px; }

    /* Status inline toggle row */
    .cm-status-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border-radius: 9px;
      border: 1px solid var(--cm-border);
      background: var(--cm-feature-bg);
      height: 100%; min-height: 40px;
    }
    .cm-status-label {
      font-size: 0.76rem; font-weight: 600; color: var(--cm-text);
    }

    /* Table */
    .cm-table-wrap {
      border-radius: 12px; border: 1px solid var(--cm-border); overflow: hidden;
    }
    .cm-table { width: 100%; border-collapse: collapse; }
    .cm-table thead tr {
      background: var(--cm-header-bg); border-bottom: 1px solid var(--cm-border);
    }
    .cm-table thead th {
      padding: 9px 12px; font-size: 0.67rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: var(--cm-muted); white-space: nowrap;
      border-bottom: 1px solid var(--cm-border);
    }
    .cm-table tbody tr {
      border-bottom: 1px solid var(--cm-border); transition: background 0.14s;
    }
    .cm-table tbody tr:last-child { border-bottom: none; }
    .cm-table tbody tr:hover { background: var(--cm-row-hover); }
    .cm-table tbody td {
      padding: 9px 12px; font-size: 0.78rem; color: var(--cm-text); white-space: nowrap;
    }

    /* Row states */
    .cm-row-warning { background: rgba(234,179,8,0.10) !important; }
    .cm-row-danger  { background: rgba(239,68,68,0.10) !important; }
    .cm-row-warning:hover { background: rgba(234,179,8,0.16) !important; }
    .cm-row-danger:hover  { background: rgba(239,68,68,0.16) !important; }

    /* Badges */
    .cm-badge-yes {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      background: rgba(34,197,94,0.12); color: #16a34a;
      border: 1px solid rgba(34,197,94,0.2);
    }
    .cm-badge-no {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      background: rgba(239,68,68,0.08); color: #dc2626;
      border: 1px solid rgba(239,68,68,0.15);
    }
    .cm-badge-warn {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      background: rgba(234,179,8,0.12); color: #b45309;
      border: 1px solid rgba(234,179,8,0.2);
    }
    .cm-plan-chip {
      display: inline-flex; align-items: center;
      padding: 2px 9px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      background: var(--cm-primary-glow); color: var(--cm-primary);
      border: 1px solid var(--cm-primary-alpha);
    }
    .cm-mono {
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 0.74rem; font-weight: 600;
    }
    .cm-recurrence {
      font-size: 0.65rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--cm-muted); margin-top: 2px;
    }
    .cm-edit-btn {
      width: 28px; height: 28px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--cm-border); background: transparent;
      cursor: pointer; color: var(--cm-muted); transition: all 0.16s;
    }
    .cm-edit-btn:hover {
      border-color: var(--cm-primary-alpha);
      color: var(--cm-primary); background: var(--cm-primary-glow);
    }
  `}</style>
);

/* ── SectionCard ── */
const SectionCard = ({ icon, iconStyle, title, subtitle, children }) => (
  <div className="cm-section-card">
    <div className="cm-section-header">
      <div className="cm-section-header-icon" style={iconStyle}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="cm-section-body">{children}</div>
  </div>
);

/* ── TogglePill ── */
const TogglePill = ({ value, onChange }) => {
  const isOn = value === true || value === "true";
  return (
    <div className="cm-toggle-pill">
      <button type="button" className={`cm-toggle-btn ${isOn ? "active-on" : "inactive"}`}
        onClick={() => !isOn && onChange(true)}>Sim</button>
      <div className="cm-toggle-sep" />
      <button type="button" className={`cm-toggle-btn ${!isOn ? "active-off" : "inactive"}`}
        onClick={() => isOn && onChange(false)}>Não</button>
    </div>
  );
};

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const cardBg   = isDark ? "#131e2e" : "#ffffff";
  const headerBg = isDark ? "#0b1520" : "#f8fafc";

  /* ── estilos comuns ao root de input (altura 40 px + texto centralizado) ── */
  const inputRoot = {
    borderRadius: 9,
    height: 40,
    overflow: "hidden",
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
    "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
    "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
    "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
  };

  /* ── estilos comuns ao <input> interno ── */
  const inputNative = {
    padding: "0 12px",
    height: "100%",
    boxSizing: "border-box",
    fontSize: "0.84rem",
    color: textPrimary,
    lineHeight: "40px",
  };

  /* ── label flutuante — posição centralizada quando recolhido ── */
  const labelBase = {
    color: textMuted,
    fontSize: "0.83rem",
    top: "50%",
    transform: "translate(12px, -50%) scale(1)",
  };
  const labelShrink = {
    top: 0,
    transform: "translate(14px, -8px) scale(0.75)",
    color: `${textMuted} !important`,
  };
  const labelFocused = {
    color: `${primary} !important`,
  };

  return {
    root: {
      "--cm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
      "--cm-card-bg":       cardBg,
      "--cm-header-bg":     headerBg,
      "--cm-muted":         textMuted,
      "--cm-text":          textPrimary,
      "--cm-primary":       primary,
      "--cm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
      "--cm-primary-glow":  alpha(primary, 0.07),
      "--cm-feature-bg":    isDark ? "rgba(255,255,255,0.02)" : "#fafcff",
      "--cm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
    },

    /* ── TextField ── */
    textField: {
      "& .MuiOutlinedInput-root": {
        ...inputRoot,
        "& input": inputNative,
        /* campo de data — centraliza também */
        "& input[type='date']": { ...inputNative, paddingRight: 8 },
      },
      "& .MuiInputLabel-root":                  labelBase,
      "& .MuiInputLabel-root.MuiInputLabel-shrink": labelShrink,
      "& .MuiInputLabel-root.Mui-focused":      labelFocused,
      /* remove padding padrão do MuiInputBase para não conflitar */
      "& .MuiInputBase-input": { padding: 0 },
    },

    /* ── FormControl / Select ── */
    formControl: {
      "& .MuiOutlinedInput-root": {
        ...inputRoot,
        /* o Select usa MuiSelect-root em vez de input */
        "& .MuiSelect-root": {
          padding: "0 32px 0 12px",   /* 32px à dir. para a seta */
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontSize: "0.84rem",
          color: textPrimary,
          boxSizing: "border-box",
        },
      },
      "& .MuiInputLabel-root":                  labelBase,
      "& .MuiInputLabel-root.MuiInputLabel-shrink": labelShrink,
      "& .MuiInputLabel-root.Mui-focused":      labelFocused,
    },

    tableWrap: { ...theme.scrollbarStyles, overflowX: "auto" },
    cancelBtn: {
      borderRadius: 9, textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed", color: textMuted,
    },
    deleteBtn: {
      borderRadius: 9, textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
      color: "#fff", backgroundColor: "#ef4444",
      "&:hover": { backgroundColor: "#dc2626" },
    },
    renewBtn: {
      borderRadius: 9, textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
      color: "#fff", backgroundColor: "#f59e0b",
      "&:hover": { backgroundColor: "#d97706" },
      boxShadow: "0 3px 10px rgba(245,158,11,0.30)",
    },
    saveBtn: {
      borderRadius: 9, textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
      color: "#fff", boxShadow: `0 3px 12px ${alpha(primary, 0.30)}`,
    },
  };
});

/* ── SVG icons ── */
const IcoBusiness = <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/></svg>;
const IcoCalendar = <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>;

/* ══════════════════════════════════════════════════════════════════════════ */
export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const [plans, setPlans]       = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "", email: "", phone: "", planId: "", status: true,
    dueDate: "", recurrence: "", password: "", ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format("YYYY-MM-DD");
      }
      return { ...prev, ...initialValue };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "" });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", { params: { companyId: initialValue.id } });
      if (isArray(data) && data.length) setFirstUser(head(data));
      setModalUser(true);
    } catch (e) { toast.error(e); }
  };

  const handleCloseModalUsers = () => { setFirstUser({}); setModalUser(false); };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      const map = { MENSAL: 1, BIMESTRAL: 2, TRIMESTRAL: 3, SEMESTRAL: 6, ANUAL: 12 };
      if (map[data.recurrence]) {
        data.dueDate = moment(data.dueDate).add(map[data.recurrence], "month").format("YYYY-MM-DD");
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers userId={firstUser.id} companyId={initialValue.id} open={modalUser} onClose={handleCloseModalUsers} />

      <Formik
        enableReinitialize
        initialValues={record}
        onSubmit={(values, { resetForm }) =>
          setTimeout(() => { handleSubmit(values); resetForm(); }, 500)
        }
      >
        {({ values, setFieldValue }) => (
          <Form style={{ width: "100%" }}>

            {/* ── Dados da empresa ── */}
            <SectionCard
              icon={IcoBusiness}
              iconStyle={{ backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" }}
              title="Dados da empresa"
              subtitle="Identificação, acesso e plano contratado"
            >
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={3}>
                  <Field as={TextField} label={i18n.t("compaies.table.name")} name="name"
                    variant="outlined" fullWidth className={classes.textField} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field as={TextField} label={i18n.t("compaies.table.email")} name="email"
                    variant="outlined" fullWidth required className={classes.textField} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field as={TextField} label={i18n.t("compaies.table.password")} name="password"
                    variant="outlined" fullWidth className={classes.textField} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field as={TextField} label={i18n.t("compaies.table.phone")} name="phone"
                    variant="outlined" fullWidth className={classes.textField} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Field as={TextField} label={i18n.t("compaies.table.document")} name="document"
                    variant="outlined" fullWidth className={classes.textField} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl variant="outlined" fullWidth className={classes.formControl}>
                    <InputLabel htmlFor="plan-selection">{i18n.t("compaies.table.plan")}</InputLabel>
                    <Field as={Select} id="plan-selection" label={i18n.t("compaies.table.plan")}
                      labelId="plan-selection-label" name="planId" required>
                      {plans.map((plan, key) => (
                        <MenuItem key={key} value={plan.id}>{plan.name}</MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <div className="cm-status-row">
                    <span className="cm-status-label">⚡ {i18n.t("compaies.table.active")}</span>
                    <TogglePill value={values.status} onChange={(v) => setFieldValue("status", v)} />
                  </div>
                </Grid>
              </Grid>
            </SectionCard>

            {/* ── Vencimento e recorrência ── */}
            <SectionCard
              icon={IcoCalendar}
              iconStyle={{ backgroundColor: alpha("#f59e0b", isDark ? 0.15 : 0.08), color: "#f59e0b" }}
              title="Vencimento e recorrência"
              subtitle="Data de vencimento e ciclo de cobrança"
            >
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth>
                    <Field as={TextField}
                      label={i18n.t("compaies.table.dueDate")}
                      type="date" name="dueDate"
                      InputLabelProps={{ shrink: true }}
                      variant="outlined" fullWidth
                      className={classes.textField}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth className={classes.formControl}>
                    <InputLabel htmlFor="recorrencia-selection">{i18n.t("compaies.table.recurrence")}</InputLabel>
                    <Field as={Select} label="Recorrência" labelId="recorrencia-selection-label"
                      id="recurrence" name="recurrence">
                      <MenuItem value="MENSAL">{i18n.t("compaies.table.monthly")}</MenuItem>
                      <MenuItem value="BIMESTRAL">{i18n.t("compaies.table.bimonthly")}</MenuItem>
                      <MenuItem value="TRIMESTRAL">{i18n.t("compaies.table.quarterly")}</MenuItem>
                      <MenuItem value="SEMESTRAL">{i18n.t("compaies.table.semester")}</MenuItem>
                      <MenuItem value="ANUAL">{i18n.t("compaies.table.yearly")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>
            </SectionCard>

            {/* ── Ações ── */}
            <Box style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, marginBottom: 20 }}>
              <ButtonWithSpinner loading={loading} onClick={onCancel} variant="outlined" className={classes.cancelBtn}>
                {i18n.t("compaies.table.clear")}
              </ButtonWithSpinner>
              {record.id !== undefined && (
                <>
                  <ButtonWithSpinner loading={loading} onClick={() => onDelete(record)}
                    variant="contained" className={classes.deleteBtn}>
                    {i18n.t("compaies.table.delete")}
                  </ButtonWithSpinner>
                  <ButtonWithSpinner loading={loading} onClick={() => incrementDueDate()}
                    variant="contained" className={classes.renewBtn}>
                    📅 {i18n.t("compaies.table.dueDate")}
                  </ButtonWithSpinner>
                </>
              )}
              <ButtonWithSpinner loading={loading} type="submit" variant="contained"
                color="primary" className={classes.saveBtn}>
                {i18n.t("compaies.table.save")}
              </ButtonWithSpinner>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const { dateToClient, datetimeToClient } = useDate();

  const renderPlan      = (row) => row.planId !== null ? row.plan?.name : "—";
  const renderPlanValue = (row) => row.planId !== null && row.plan !== null
    ? (row.plan.amount ? row.plan.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : "0,00")
    : "—";

  const rowClass = (record) => {
    if (moment(record.dueDate).isValid()) {
      const diff = moment(record.dueDate).diff(moment(), "days");
      if (diff >= 1 && diff <= 5) return "cm-row-warning";
      if (diff <= 0)              return "cm-row-danger";
    }
    return "";
  };

  const dueDateBadge = (record) => {
    if (!moment(record.dueDate).isValid()) return null;
    const diff = moment(record.dueDate).diff(moment(), "days");
    if (diff <= 0)        return <span className="cm-badge-no" style={{ marginLeft: 4 }}>Vencido</span>;
    if (diff <= 5)        return <span className="cm-badge-warn" style={{ marginLeft: 4 }}>{diff}d</span>;
    return null;
  };

  return (
    <div className={`cm-table-wrap ${classes.tableWrap}`} style={{
      "--cm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
      "--cm-card-bg":       isDark ? "#131e2e" : "#ffffff",
      "--cm-header-bg":     isDark ? "#0b1520" : "#f8fafc",
      "--cm-muted":         isDark ? "#4d6478" : "#8fa0b0",
      "--cm-text":          isDark ? "#f0f4f8" : "#0d1b2a",
      "--cm-primary":       primary,
      "--cm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
      "--cm-primary-glow":  alpha(primary, 0.07),
      "--cm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
    }}>
      <table className="cm-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th style={{ textAlign: "left" }}>{i18n.t("compaies.table.name")}</th>
            <th style={{ textAlign: "left" }}>{i18n.t("compaies.table.email")}</th>
            <th>{i18n.t("compaies.table.phone")}</th>
            <th>{i18n.t("compaies.table.plan")}</th>
            <th>{i18n.t("compaies.table.value")}</th>
            <th>{i18n.t("compaies.table.active")}</th>
            <th>{i18n.t("compaies.table.createdAt")}</th>
            <th>{i18n.t("compaies.table.dueDate")}</th>
            <th>{i18n.t("compaies.table.lastLogin")}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row, key) => (
            <tr key={key} className={rowClass(row)}>
              <td style={{ textAlign: "center" }}>
                <button className="cm-edit-btn" onClick={() => onSelect(row)} title="Editar">
                  <EditIcon style={{ fontSize: 13 }} />
                </button>
              </td>
              <td style={{ fontWeight: 600 }}>{row.name || "—"}</td>
              <td style={{ color: isDark ? "#8fa4be" : "#3d5166", fontSize: "0.75rem" }}>{row.email || "—"}</td>
              <td style={{ textAlign: "center" }}>{row.phone || "—"}</td>
              <td style={{ textAlign: "center" }}>
                {row.planId ? <span className="cm-plan-chip">{renderPlan(row)}</span> : "—"}
              </td>
              <td style={{ textAlign: "center" }}>
                <span className="cm-mono">{i18n.t("compaies.table.money")} {renderPlanValue(row)}</span>
              </td>
              <td style={{ textAlign: "center" }}>
                {row.status === false
                  ? <span className="cm-badge-no">Não</span>
                  : <span className="cm-badge-yes">Sim</span>}
              </td>
              <td style={{ textAlign: "center" }}>{dateToClient(row.createdAt)}</td>
              <td style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
                  <span>{dateToClient(row.dueDate)}</span>
                  {dueDateBadge(row)}
                </div>
                {row.recurrence && <div className="cm-recurrence">{row.recurrence}</div>}
              </td>
              <td style={{ textAlign: "center", color: isDark ? "#4d6478" : "#8fa0b0", fontSize: "0.74rem" }}>
                {datetimeToClient(row.lastLogin)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function CompaniesManager() {
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const { list, save, update, remove } = useCompanies();

  const emptyRecord = {
    name: "", email: "", phone: "", planId: "", status: true,
    dueDate: "", recurrence: "", password: "", document: "", paymentMethod: ""
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record,  setRecord]  = useState(emptyRecord);

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      setRecords(companyList);
    } catch (e) { toast.error("Não foi possível carregar a lista de registros"); }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) { await update(data); } else { await save(data); }
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) { toast.error("Não foi possível realizar a operação"); }
    setLoading(false);
  };

  const handleCancel = () => setRecord((prev) => ({ ...prev, ...emptyRecord }));
  const handleOpenDeleteDialog = () => setShowConfirmDialog(true);

  const handleSelect = (data) => {
    setRecord((prev) => ({
      ...prev,
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
      password: "",
      document: data.document || "",
      paymentMethod: data.paymentMethod || "",
    }));
  };

  return (
    <div className="cm-root" style={{
      width: "100%",
      "--cm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
      "--cm-card-bg":       isDark ? "#131e2e" : "#ffffff",
      "--cm-header-bg":     isDark ? "#0b1520" : "#f8fafc",
      "--cm-muted":         isDark ? "#4d6478" : "#8fa0b0",
      "--cm-text":          isDark ? "#f0f4f8" : "#0d1b2a",
      "--cm-primary":       primary,
      "--cm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
      "--cm-primary-glow":  alpha(primary, 0.07),
      "--cm-feature-bg":    isDark ? "rgba(255,255,255,0.02)" : "#fafcff",
      "--cm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
    }}>
      <CMStyle />

      <CompanyForm
        initialValue={record}
        onDelete={handleOpenDeleteDialog}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />

      <CompaniesManagerGrid records={records} onSelect={handleSelect} />

      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </div>
  );
}