import React, { useState, useEffect } from "react";
import {
    makeStyles,
    Paper,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@material-ui/core";
import { alpha, useTheme } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";
import { Edit as EditIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";

/* ─── Estilos injetados ──────────────────────────────────────────────────── */
const PMStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

    .pm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }

    /* Toggle Pill */
    .pm-toggle-pill {
      display: inline-flex; align-items: center;
      border-radius: 8px; overflow: hidden;
      border: 1px solid var(--pm-border); flex-shrink: 0;
    }
    .pm-toggle-btn {
      padding: 3px 11px; font-size: 0.70rem; font-weight: 600;
      cursor: pointer; border: none; outline: none;
      transition: background 0.18s, color 0.18s;
      line-height: 1.5; font-family: inherit;
    }
    .pm-toggle-btn.active-on  { background: #22c55e; color: #fff; }
    .pm-toggle-btn.active-off { background: rgba(239,68,68,0.13); color: #ef4444; }
    .pm-toggle-btn.inactive   { background: transparent; color: var(--pm-muted); }
    .pm-toggle-sep { width: 1px; background: var(--pm-border); align-self: stretch; }

    /* Section card */
    .pm-section-card {
      border-radius: 12px; border: 1px solid var(--pm-border);
      background: var(--pm-card-bg); overflow: hidden; margin-bottom: 16px;
    }
    .pm-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-bottom: 1px solid var(--pm-border);
      background: var(--pm-header-bg);
    }
    .pm-section-header-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pm-section-body { padding: 16px; }

    /* Feature toggle row */
    .pm-feature-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 12px; border-bottom: 1px solid var(--pm-border);
    }
    .pm-feature-row:last-child { border-bottom: none; }
    .pm-feature-label {
      font-size: 0.78rem; font-weight: 500; color: var(--pm-text);
    }
    .pm-feature-col-header {
      font-size: 0.67rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--pm-muted); padding: 7px 12px;
      border-bottom: 1px solid var(--pm-border);
      background: var(--pm-header-bg);
    }
    .pm-feature-2col {
      display: grid; grid-template-columns: 1fr 1fr;
    }
    .pm-feature-col {
      border-right: 1px solid var(--pm-border);
    }
    .pm-feature-col:last-child { border-right: none; }

    /* Table */
    .pm-table-wrap { border-radius: 12px; border: 1px solid var(--pm-border); overflow: hidden; }
    .pm-table { width: 100%; border-collapse: collapse; }
    .pm-table thead tr { background: var(--pm-header-bg); }
    .pm-table thead th {
      padding: 9px 12px; font-size: 0.67rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: var(--pm-muted); white-space: nowrap;
      border-bottom: 1px solid var(--pm-border);
    }
    .pm-table tbody tr { border-bottom: 1px solid var(--pm-border); transition: background 0.14s; }
    .pm-table tbody tr:last-child { border-bottom: none; }
    .pm-table tbody tr:hover { background: var(--pm-row-hover); }
    .pm-table tbody td { padding: 9px 12px; font-size: 0.78rem; color: var(--pm-text); white-space: nowrap; }
    .pm-badge-yes {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      background: rgba(34,197,94,0.12); color: #16a34a; border: 1px solid rgba(34,197,94,0.2);
    }
    .pm-badge-no {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.15);
    }
    .pm-edit-btn {
      width: 28px; height: 28px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--pm-border); background: transparent;
      cursor: pointer; color: var(--pm-muted); transition: all 0.16s;
    }
    .pm-edit-btn:hover {
      border-color: var(--pm-primary-alpha); color: var(--pm-primary); background: var(--pm-primary-glow);
    }
    .pm-amount { font-family: 'JetBrains Mono', monospace !important; font-size: 0.76rem; font-weight: 600; }
  `}</style>
);

/* ── SectionCard ── */
const SectionCard = ({ icon, iconStyle, title, subtitle, children }) => (
    <div className="pm-section-card">
        <div className="pm-section-header">
            <div className="pm-section-header-icon" style={iconStyle}>{icon}</div>
            <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
                {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
            </div>
        </div>
        <div className="pm-section-body">{children}</div>
    </div>
);

/* ── TogglePill ── */
const TogglePill = ({ value, onChange }) => {
    const isOn = value === true || value === "true";
    return (
        <div className="pm-toggle-pill">
            <button type="button" className={`pm-toggle-btn ${isOn ? "active-on" : "inactive"}`}
                onClick={() => !isOn && onChange(true)}>
                {i18n.t("plans.form.yes")}
            </button>
            <div className="pm-toggle-sep" />
            <button type="button" className={`pm-toggle-btn ${!isOn ? "active-off" : "inactive"}`}
                onClick={() => isOn && onChange(false)}>
                {i18n.t("plans.form.no")}
            </button>
        </div>
    );
};

/* ── FeatureRow ── */
const FeatureRow = ({ label, fieldName, values, setFieldValue }) => (
    <div className="pm-feature-row">
        <span className="pm-feature-label">{label}</span>
        <TogglePill value={values[fieldName]} onChange={(v) => setFieldValue(fieldName, v)} />
    </div>
);

const useStyles = makeStyles((theme) => {
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";
    const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
    const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";

    /* ── estilos comuns ao root de input (altura 40px + texto centralizado) ── */
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
        textField: {
            "& .MuiOutlinedInput-root": {
                ...inputRoot,
                "& input": inputNative,
            },
            "& .MuiInputLabel-root":                      labelBase,
            "& .MuiInputLabel-root.MuiInputLabel-shrink": labelShrink,
            "& .MuiInputLabel-root.Mui-focused":          labelFocused,
            /* remove padding padrão do MuiInputBase para não conflitar */
            "& .MuiInputBase-input": { padding: 0 },
        },
        cancelBtn: {
            borderRadius: 9, textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed", color: textMuted,
        },
        deleteBtn: {
            borderRadius: 9, textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
            color: "#fff", backgroundColor: "#ef4444",
            "&:hover": { backgroundColor: "#dc2626" },
        },
        saveBtn: {
            borderRadius: 9, textTransform: "none", fontWeight: 700, fontSize: "0.82rem",
            color: "#fff", boxShadow: `0 3px 12px ${alpha(primary, 0.30)}`,
        },
        tableWrap: { ...theme.scrollbarStyles, overflowX: "auto" },
    };
});

/* ── SVG icons ── */
const IcoClipboard = <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>;
const IcoModules   = <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;

/* Divididos em 2 colunas para ficar organizado */
const FEATURES_COL_A = [
    { field: "useWhatsapp",    label: "WhatsApp"                        },
    { field: "useFacebook",    label: "Facebook"                        },
    { field: "useInstagram",   label: "Instagram"                       },
    { field: "useCampaigns",   label: i18n.t("plans.form.campaigns")    },
    { field: "useSchedules",   label: i18n.t("plans.form.schedules")    },
];
const FEATURES_COL_B = [
    { field: "useInternalChat",label: "Chat Interno"  },
    { field: "useExternalApi", label: "API Externa"   },
    { field: "useKanban",      label: "Kanban"        },
    { field: "useOpenAi",      label: "Talk.Ai"       },
    { field: "useIntegrations",label: "Integrações"   },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles();
    const theme   = useTheme();
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";

    const [record, setRecord] = useState({
        name: '', users: 0, connections: 0, queues: 0, amount: 0,
        useWhatsapp: true, useFacebook: true, useInstagram: true,
        useCampaigns: true, useSchedules: true, useInternalChat: true,
        useExternalApi: true, useKanban: true, useOpenAi: true,
        useIntegrations: true, isPublic: true
    });

    useEffect(() => { setRecord(initialValue); }, [initialValue]);

    return (
        <Formik
            enableReinitialize
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => { onSubmit(values); resetForm(); }, 500)
            }
        >
            {({ values, setFieldValue }) => (
                <Form style={{ width: "100%" }}>
                    <Grid container spacing={2}>

                        {/* ── Coluna esquerda: dados básicos ── */}
                        <Grid item xs={12} md={7}>
                            <SectionCard
                                icon={IcoClipboard}
                                iconStyle={{ backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" }}
                                title="Dados do plano"
                                subtitle="Nome, limites, valor e visibilidade"
                            >
                                <Grid container spacing={1}>
                                    {/* Nome — linha inteira */}
                                    <Grid item xs={12}>
                                        <Field as={TextField} label={i18n.t("plans.form.name")} name="name"
                                            variant="outlined" fullWidth className={classes.textField} />
                                    </Grid>

                                    {/* Limites — 3 campos iguais */}
                                    <Grid item xs={4}>
                                        <Field as={TextField} label={i18n.t("plans.form.users")} name="users"
                                            variant="outlined" fullWidth type="number" className={classes.textField} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Field as={TextField} label={i18n.t("plans.form.connections")} name="connections"
                                            variant="outlined" fullWidth type="number" className={classes.textField} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Field as={TextField} label="Filas" name="queues"
                                            variant="outlined" fullWidth type="number" className={classes.textField} />
                                    </Grid>

                                    {/* Valor */}
                                    <Grid item xs={12} sm={6}>
                                        <Field as={TextField} label="Valor (R$)" name="amount"
                                            variant="outlined" fullWidth className={classes.textField} />
                                    </Grid>

                                    {/* Público */}
                                    <Grid item xs={12} sm={6}>
                                        <div style={{
                                            display: "flex", alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "0 12px", borderRadius: 9, height: 40,
                                            border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#dbe4ed"}`,
                                            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.018)",
                                        }}>
                                            <span style={{ fontSize: "0.78rem", fontWeight: 500,
                                                color: isDark ? "#f0f4f8" : "#0d1b2a" }}>
                                                {i18n.t("plans.form.public")}
                                            </span>
                                            <TogglePill value={values.isPublic}
                                                onChange={(v) => setFieldValue("isPublic", v)} />
                                        </div>
                                    </Grid>
                                </Grid>
                            </SectionCard>
                        </Grid>

                        {/* ── Coluna direita: funcionalidades ── */}
                        <Grid item xs={12} md={5}>
                            <SectionCard
                                icon={IcoModules}
                                iconStyle={{ backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" }}
                                title="Módulos incluídos"
                                subtitle="Recursos disponíveis neste plano"
                            >
                                {/* 2 colunas de toggles */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e8eef5"}`,
                                    borderRadius: 9, overflow: "hidden" }}>
                                    {/* Coluna A */}
                                    <div style={{ borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e8eef5"}` }}>
                                        {FEATURES_COL_A.map((f) => (
                                            <FeatureRow key={f.field} label={f.label}
                                                fieldName={f.field} values={values} setFieldValue={setFieldValue} />
                                        ))}
                                    </div>
                                    {/* Coluna B */}
                                    <div>
                                        {FEATURES_COL_B.map((f) => (
                                            <FeatureRow key={f.field} label={f.label}
                                                fieldName={f.field} values={values} setFieldValue={setFieldValue} />
                                        ))}
                                    </div>
                                </div>
                            </SectionCard>
                        </Grid>
                    </Grid>

                    {/* ── Ações ── */}
                    <Box style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4, marginBottom: 20 }}>
                        <ButtonWithSpinner loading={loading} onClick={onCancel}
                            variant="outlined" className={classes.cancelBtn}>
                            {i18n.t("plans.form.clear")}
                        </ButtonWithSpinner>
                        {record.id !== undefined && (
                            <ButtonWithSpinner loading={loading} onClick={() => onDelete(record)}
                                variant="contained" className={classes.deleteBtn}>
                                {i18n.t("plans.form.delete")}
                            </ButtonWithSpinner>
                        )}
                        <ButtonWithSpinner loading={loading} type="submit"
                            variant="contained" color="primary" className={classes.saveBtn}>
                            {i18n.t("plans.form.save")}
                        </ButtonWithSpinner>
                    </Box>
                </Form>
            )}
        </Formik>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function PlansManagerGrid(props) {
    const { records, onSelect } = props;
    const classes = useStyles();
    const theme   = useTheme();
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";

    const Badge = ({ val }) =>
        val === false
            ? <span className="pm-badge-no">{i18n.t("plans.form.no")}</span>
            : <span className="pm-badge-yes">{i18n.t("plans.form.yes")}</span>;

    const ALL_FEATURES = [...FEATURES_COL_A, ...FEATURES_COL_B];

    return (
        <div className={`pm-table-wrap ${classes.tableWrap}`} style={{
            "--pm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
            "--pm-header-bg":     isDark ? "#0b1520" : "#f8fafc",
            "--pm-muted":         isDark ? "#4d6478" : "#8fa0b0",
            "--pm-text":          isDark ? "#f0f4f8" : "#0d1b2a",
            "--pm-primary":       primary,
            "--pm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
            "--pm-primary-glow":  alpha(primary, 0.07),
            "--pm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
        }}>
            <table className="pm-table">
                <thead>
                    <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ textAlign: "left" }}>{i18n.t("plans.form.name")}</th>
                        <th>{i18n.t("plans.form.users")}</th>
                        <th>{i18n.t("plans.form.connections")}</th>
                        <th>Filas</th>
                        <th>Valor</th>
                        <th>{i18n.t("plans.form.public")}</th>
                        {ALL_FEATURES.map(f => <th key={f.field}>{f.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {records.map((row) => (
                        <tr key={row.id}>
                            <td style={{ textAlign: "center" }}>
                                <button className="pm-edit-btn" onClick={() => onSelect(row)} title="Editar">
                                    <EditIcon style={{ fontSize: 13 }} />
                                </button>
                            </td>
                            <td style={{ fontWeight: 600 }}>{row.name || "—"}</td>
                            <td style={{ textAlign: "center" }}>{row.users || "—"}</td>
                            <td style={{ textAlign: "center" }}>{row.connections || "—"}</td>
                            <td style={{ textAlign: "center" }}>{row.queues || "—"}</td>
                            <td style={{ textAlign: "center" }}>
                                <span className="pm-amount">
                                    {i18n.t("plans.form.money")}{" "}
                                    {row.amount ? row.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : "0,00"}
                                </span>
                            </td>
                            <td style={{ textAlign: "center" }}><Badge val={row.isPublic} /></td>
                            {ALL_FEATURES.map(f => (
                                <td key={f.field} style={{ textAlign: "center" }}>
                                    <Badge val={row[f.field]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function PlansManager() {
    const classes = useStyles();
    const theme   = useTheme();
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";
    const { list, save, update, remove } = usePlans();

    const emptyRecord = {
        id: undefined, name: '', users: 0, connections: 0, queues: 0, amount: 0,
        useWhatsapp: true, useFacebook: true, useInstagram: true,
        useCampaigns: true, useSchedules: true, useInternalChat: true,
        useExternalApi: true, useKanban: true, useOpenAi: true,
        useIntegrations: true, isPublic: true
    };

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [records,  setRecords]  = useState([]);
    const [record,   setRecord]   = useState(emptyRecord);

    useEffect(() => {
        async function fetchData() { await loadPlans(); }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record]);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const planList = await list();
            setRecords(planList);
        } catch (e) { toast.error('Não foi possível carregar a lista de registros'); }
        setLoading(false);
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (data.id !== undefined) { await update(data); } else { await save(data); }
            await loadPlans();
            handleCancel();
            toast.success('Operação realizada com sucesso!');
        } catch (e) {
            toast.error('Não foi possível realizar a operação. Verifique se já existe um plano com o mesmo nome ou se os campos foram preenchidos corretamente');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await remove(record.id);
            await loadPlans();
            handleCancel();
            toast.success('Operação realizada com sucesso!');
        } catch (e) { toast.error('Não foi possível realizar a operação'); }
        setLoading(false);
    };

    const handleCancel           = () => setRecord({ ...emptyRecord });
    const handleOpenDeleteDialog = () => setShowConfirmDialog(true);

    const handleSelect = (data) => {
        setRecord({
            id: data.id,
            name: data.name || '',
            users: data.users || 0,
            connections: data.connections || 0,
            queues: data.queues || 0,
            amount: data.amount?.toLocaleString('pt-br', { minimumFractionDigits: 2 }) || 0,
            useWhatsapp:    data.useWhatsapp    !== false,
            useFacebook:    data.useFacebook    !== false,
            useInstagram:   data.useInstagram   !== false,
            useCampaigns:   data.useCampaigns   !== false,
            useSchedules:   data.useSchedules   !== false,
            useInternalChat:data.useInternalChat!== false,
            useExternalApi: data.useExternalApi !== false,
            useKanban:      data.useKanban      !== false,
            useOpenAi:      data.useOpenAi      !== false,
            useIntegrations:data.useIntegrations!== false,
            isPublic: data.isPublic,
        });
    };

    return (
        <div className="pm-root" style={{
            width: "100%",
            "--pm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
            "--pm-card-bg":       isDark ? "#131e2e" : "#ffffff",
            "--pm-header-bg":     isDark ? "#0b1520" : "#f8fafc",
            "--pm-muted":         isDark ? "#4d6478" : "#8fa0b0",
            "--pm-text":          isDark ? "#f0f4f8" : "#0d1b2a",
            "--pm-primary":       primary,
            "--pm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
            "--pm-primary-glow":  alpha(primary, 0.07),
            "--pm-feature-bg":    isDark ? "rgba(255,255,255,0.02)" : "#fafcff",
            "--pm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
        }}>
            <PMStyle />
            <PlanManagerForm
                initialValue={record}
                onDelete={handleOpenDeleteDialog}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
            />
            <PlansManagerGrid records={records} onSelect={handleSelect} />
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