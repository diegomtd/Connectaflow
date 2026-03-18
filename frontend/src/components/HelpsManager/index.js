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
    IconButton
} from "@material-ui/core";
import { alpha, useTheme } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";
import { Edit as EditIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import useHelps from "../../hooks/useHelps";
import { i18n } from "../../translate/i18n";

/* ─── Estilos injetados ──────────────────────────────────────────────────── */
const HMStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

    .hm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }

    .hm-section-card {
      border-radius: 12px; border: 1px solid var(--hm-border);
      background: var(--hm-card-bg); overflow: hidden; margin-bottom: 16px;
    }
    .hm-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-bottom: 1px solid var(--hm-border);
      background: var(--hm-header-bg);
    }
    .hm-section-header-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .hm-section-body { padding: 16px; }

    /* Table */
    .hm-table-wrap {
      border-radius: 12px; border: 1px solid var(--hm-border); overflow: hidden;
    }
    .hm-table { width: 100%; border-collapse: collapse; }
    .hm-table thead tr {
      background: var(--hm-header-bg); border-bottom: 1px solid var(--hm-border);
    }
    .hm-table thead th {
      padding: 9px 14px; font-size: 0.67rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: var(--hm-muted); white-space: nowrap;
      border-bottom: 1px solid var(--hm-border);
    }
    .hm-table tbody tr {
      border-bottom: 1px solid var(--hm-border); transition: background 0.14s;
    }
    .hm-table tbody tr:last-child { border-bottom: none; }
    .hm-table tbody tr:hover { background: var(--hm-row-hover); }
    .hm-table tbody td { padding: 10px 14px; font-size: 0.78rem; color: var(--hm-text); }

    .hm-title-cell { font-weight: 600; }
    .hm-desc-cell  { color: var(--hm-muted); font-size: 0.76rem; max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hm-video-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 20px; font-size: 0.67rem; font-weight: 700;
      font-family: 'JetBrains Mono', monospace !important;
      background: var(--hm-primary-glow); color: var(--hm-primary);
      border: 1px solid var(--hm-primary-alpha);
      max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .hm-edit-btn {
      width: 28px; height: 28px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--hm-border); background: transparent;
      cursor: pointer; color: var(--hm-muted); transition: all 0.16s;
    }
    .hm-edit-btn:hover {
      border-color: var(--hm-primary-alpha);
      color: var(--hm-primary); background: var(--hm-primary-glow);
    }
  `}</style>
);

const SectionCard = ({ icon, iconStyle, title, subtitle, children }) => (
    <div className="hm-section-card">
        <div className="hm-section-header">
            <div className="hm-section-header-icon" style={iconStyle}>{icon}</div>
            <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
                {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
            </div>
        </div>
        <div className="hm-section-body">{children}</div>
    </div>
);

const useStyles = makeStyles((theme) => {
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";
    const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
    const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";

    return {
        textField: {
            "& .MuiOutlinedInput-root": {
                borderRadius: 9,
                height: 40,
                overflow: "hidden",
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
                "& input": {
                    padding: "0 12px",
                    height: "100%",
                    boxSizing: "border-box",
                    fontSize: "0.84rem",
                    color: textPrimary,
                    lineHeight: "40px",
                },
                "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
                "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
                "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
            },
            "& .MuiInputBase-input": { padding: 0 },
            "& .MuiInputLabel-root": {
                color: textMuted,
                fontSize: "0.83rem",
                top: "50%",
                transform: "translate(12px, -50%) scale(1)",
            },
            "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                top: 0,
                transform: "translate(14px, -8px) scale(0.75)",
                color: `${textMuted} !important`,
            },
            "& .MuiInputLabel-root.Mui-focused": {
                color: `${primary} !important`,
            },
        },
        cancelBtn: {
            borderRadius: 9, textTransform: "none", fontWeight: 600, fontSize: "0.82rem",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed",
            color: textMuted,
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

const IcoHelp  = <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>;

/* ══════════════════════════════════════════════════════════════════════════ */
export function HelpManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles();
    const theme   = useTheme();
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";

    const [record, setRecord] = useState(initialValue);
    useEffect(() => { setRecord(initialValue); }, [initialValue]);

    return (
        <Formik
            enableReinitialize
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => { onSubmit(values); resetForm(); }, 500)
            }
        >
            {() => (
                <Form style={{ width: "100%" }}>
                    <SectionCard
                        icon={IcoHelp}
                        iconStyle={{ backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" }}
                        title="Artigo de ajuda"
                        subtitle="Título, vídeo de referência e descrição do conteúdo"
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Field as={TextField} label="Título" name="title"
                                    variant="outlined" fullWidth className={classes.textField} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Field as={TextField} label={i18n.t("helps.settings.codeVideo")} name="video"
                                    variant="outlined" fullWidth className={classes.textField} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Field as={TextField} label={i18n.t("helps.settings.description")} name="description"
                                    variant="outlined" fullWidth className={classes.textField} />
                            </Grid>
                        </Grid>

                        <Box style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12 }}>
                            <ButtonWithSpinner loading={loading} onClick={onCancel} variant="outlined" className={classes.cancelBtn}>
                                {i18n.t("helps.settings.clear")}
                            </ButtonWithSpinner>
                            {record.id !== undefined && (
                                <ButtonWithSpinner loading={loading} onClick={() => onDelete(record)}
                                    variant="contained" className={classes.deleteBtn}>
                                    {i18n.t("helps.settings.delete")}
                                </ButtonWithSpinner>
                            )}
                            <ButtonWithSpinner loading={loading} type="submit" variant="contained"
                                color="primary" className={classes.saveBtn}>
                                {i18n.t("helps.settings.save")}
                            </ButtonWithSpinner>
                        </Box>
                    </SectionCard>
                </Form>
            )}
        </Formik>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function HelpsManagerGrid(props) {
    const { records, onSelect } = props;
    const classes = useStyles();
    const theme   = useTheme();
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";

    return (
        <div className={`hm-table-wrap ${classes.tableWrap}`} style={{
            "--hm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
            "--hm-header-bg":     isDark ? "#0b1520" : "#f8fafc",
            "--hm-muted":         isDark ? "#4d6478" : "#8fa0b0",
            "--hm-text":          isDark ? "#f0f4f8" : "#0d1b2a",
            "--hm-primary":       primary,
            "--hm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
            "--hm-primary-glow":  alpha(primary, 0.07),
            "--hm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
        }}>
            <table className="hm-table">
                <thead>
                    <tr>
                        <th style={{ width: 40 }}></th>
                        <th style={{ textAlign: "left" }}>Título</th>
                        <th style={{ textAlign: "left" }}>{i18n.t("helps.settings.description")}</th>
                        <th style={{ textAlign: "left" }}>Vídeo</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((row) => (
                        <tr key={row.id}>
                            <td style={{ textAlign: "center" }}>
                                <button className="hm-edit-btn" onClick={() => onSelect(row)} title="Editar">
                                    <EditIcon style={{ fontSize: 13 }} />
                                </button>
                            </td>
                            <td className="hm-title-cell">{row.title || "—"}</td>
                            <td className="hm-desc-cell">{row.description || "—"}</td>
                            <td>
                                {row.video
                                    ? <span className="hm-video-chip">▶ {row.video}</span>
                                    : <span style={{ color: "var(--hm-muted)", fontSize: "0.74rem" }}>—</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function HelpsManager() {
    const theme   = useTheme();
    const isDark  = theme.palette.type === "dark";
    const primary = theme.palette.primary.main || "#2563eb";
    const { list, save, update, remove } = useHelps();

    const emptyRecord = { title: '', description: '', video: '' };

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [record,  setRecord]  = useState(emptyRecord);

    useEffect(() => {
        async function fetchData() { await loadHelps(); }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadHelps = async () => {
        setLoading(true);
        try {
            const helpList = await list();
            setRecords(helpList);
        } catch (e) { toast.error('Não foi possível carregar a lista de registros'); }
        setLoading(false);
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (data.id !== undefined) { await update(data); } else { await save(data); }
            await loadHelps();
            handleCancel();
            toast.success('Operação realizada com sucesso!');
        } catch (e) {
            toast.error('Não foi possível realizar a operação. Verifique se já existe um artigo com o mesmo nome ou se os campos foram preenchidos corretamente');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await remove(record.id);
            await loadHelps();
            handleCancel();
            toast.success('Operação realizada com sucesso!');
        } catch (e) { toast.error('Não foi possível realizar a operação'); }
        setLoading(false);
    };

    const handleCancel           = () => setRecord({ ...emptyRecord });
    const handleOpenDeleteDialog = () => setShowConfirmDialog(true);
    const handleSelect = (data) => setRecord({
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        video: data.video || '',
    });

    return (
        <div className="hm-root" style={{
            width: "100%",
            "--hm-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
            "--hm-card-bg":       isDark ? "#131e2e" : "#ffffff",
            "--hm-header-bg":     isDark ? "#0b1520" : "#f8fafc",
            "--hm-muted":         isDark ? "#4d6478" : "#8fa0b0",
            "--hm-text":          isDark ? "#f0f4f8" : "#0d1b2a",
            "--hm-primary":       primary,
            "--hm-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.3),
            "--hm-primary-glow":  alpha(primary, 0.07),
            "--hm-feature-bg":    isDark ? "rgba(255,255,255,0.02)" : "#fafcff",
            "--hm-row-hover":     isDark ? "rgba(255,255,255,0.025)" : alpha(primary, 0.025),
        }}>
            <HMStyle />

            <HelpManagerForm
                initialValue={record}
                onDelete={handleOpenDeleteDialog}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
            />

            <HelpsManagerGrid records={records} onSelect={handleSelect} />

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