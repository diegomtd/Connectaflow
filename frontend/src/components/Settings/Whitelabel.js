import React, { useEffect, useState, useContext, useRef } from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import useSettings from "../../hooks/useSettings";
import { toast } from 'react-toastify';
import { makeStyles, alpha, useTheme } from "@material-ui/core/styles";
import { Typography, Box } from "@material-ui/core";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";

import {
  IconButton,
  InputAdornment,
} from "@material-ui/core";

import { Colorize, AttachFile, Delete } from "@material-ui/icons";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

import defaultLogoLight   from "../../assets/logo.png";
import defaultLogoDark    from "../../assets/logo-black.png";
import defaultLogoFavicon from "../../assets/favicon.ico";
import ColorBoxModal from "../ColorBoxModal/index.js";

/* ─── Estilos da seção card (mesmo padrão do Options) ────────────────────── */
const SectionStyle = () => (
  <style>{`
    .wl-section-card {
      border-radius: 12px;
      border: 1px solid var(--wl-border);
      background: var(--wl-card-bg);
      overflow: hidden;
      margin-bottom: 16px;
    }
    .wl-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--wl-border);
      background: var(--wl-header-bg);
    }
    .wl-section-header-icon {
      width: 26px; height: 26px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .wl-section-body { padding: 16px; }

    /* Upload card */
    .wl-upload-card {
      border-radius: 10px;
      border: 1px solid var(--wl-border);
      background: var(--wl-card-bg);
      overflow: hidden;
      transition: border-color 0.18s;
    }
    .wl-upload-card:hover { border-color: var(--wl-primary-alpha); }
    .wl-upload-card-header {
      padding: 8px 12px;
      border-bottom: 1px solid var(--wl-border);
      background: var(--wl-header-bg);
      display: flex; align-items: center; justify-content: space-between;
    }
    .wl-upload-card-body { padding: 10px 12px; }

    /* Preview boxes */
    .wl-preview-light {
      background: #ffffff;
      border-radius: 8px;
      padding: 10px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid #e3eaf2;
      min-height: 56px;
    }
    .wl-preview-dark {
      background: #1a2535;
      border-radius: 8px;
      padding: 10px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255,255,255,0.08);
      min-height: 56px;
    }
    .wl-preview-favicon {
      background: repeating-conic-gradient(#e8eef4 0% 25%, #f4f7fb 0% 50%) 0 0 / 12px 12px;
      border-radius: 8px;
      padding: 10px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid #e3eaf2;
      min-height: 56px;
    }
    .wl-preview-img { max-height: 40px; max-width: 100%; object-fit: contain; }

    /* Color swatch */
    .wl-color-field {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--wl-border);
      background: var(--wl-card-bg);
      cursor: pointer;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .wl-color-field:hover {
      border-color: var(--wl-primary-alpha);
      box-shadow: 0 0 0 3px var(--wl-primary-glow);
    }
    .wl-color-swatch {
      width: 28px; height: 28px; border-radius: 6px;
      border: 1px solid rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    .wl-color-label {
      font-size: 0.72rem; font-weight: 600;
      color: var(--wl-muted);
      text-transform: uppercase; letter-spacing: 0.07em;
    }
    .wl-color-value {
      font-size: 0.82rem; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      color: var(--wl-text);
    }
  `}</style>
);

/* ── SectionCard ── */
const SectionCard = ({ icon, iconStyle, title, subtitle, children }) => (
  <div className="wl-section-card">
    <div className="wl-section-header">
      <div className="wl-section-header-icon" style={iconStyle}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.68rem", color: "#8fa0b0", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div className="wl-section-body">{children}</div>
  </div>
);

/* ── UploadCard ── */
const UploadCard = ({ label, value, onUpload, onDelete, inputId, inputRef, previewSlot, isDark, primary }) => (
  <div className="wl-upload-card">
    <div className="wl-upload-card-header">
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isDark ? "#8fa4be" : "#3d5166" }}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {value && (
          <IconButton size="small" onClick={onDelete} style={{ color: "#ef4444", padding: 4 }}>
            <Delete style={{ fontSize: 14 }} />
          </IconButton>
        )}
        <input type="file" id={inputId} ref={inputRef} style={{ display: "none" }} onChange={onUpload} />
        <label htmlFor={inputId}>
          <IconButton
            size="small" component="span"
            style={{ color: isDark ? alpha(primary, 0.8) : primary, padding: 4 }}
          >
            <AttachFile style={{ fontSize: 14 }} />
          </IconButton>
        </label>
      </div>
    </div>
    <div className="wl-upload-card-body">
      {previewSlot}
      {value && (
        <div style={{
          marginTop: 6, fontSize: "0.68rem", color: isDark ? "#4d6478" : "#8fa0b0",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {value}
        </div>
      )}
      {!value && (
        <div style={{ fontSize: "0.70rem", color: isDark ? "#4d6478" : "#8fa0b0", textAlign: "center", marginTop: 4 }}>
          Nenhuma imagem enviada — usando padrão
        </div>
      )}
    </div>
  </div>
);

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const cardBg   = isDark ? "#131e2e" : "#ffffff";
  const headerBg = isDark ? "#0b1520" : "#f8fafc";

  return {
    root: {
      "--wl-border":        isDark ? "rgba(255,255,255,0.07)" : "#e8eef5",
      "--wl-card-bg":       cardBg,
      "--wl-header-bg":     headerBg,
      "--wl-muted":         textMuted,
      "--wl-text":          textPrimary,
      "--wl-primary-alpha": isDark ? alpha(primary, 0.4) : alpha(primary, 0.35),
      "--wl-primary-glow":  alpha(primary, 0.08),
    },
    textField: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.018)",
        "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#dbe4ed" },
        "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.22)" : "#a8b8c8" },
        "&.Mui-focused fieldset": { borderColor: primary, borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.92rem" },
      "& .MuiInputBase-input": { fontSize: "0.92rem", color: textPrimary, padding: "18px 14px" },
      "& .MuiInputLabel-outlined": { transform: "translate(14px, 18px) scale(1)" },
      "& .MuiInputLabel-outlined.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" },
    },
    standardField: {
      "& .MuiInput-underline:before": { borderBottomColor: isDark ? "rgba(255,255,255,0.15)" : "#dbe4ed" },
      "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: isDark ? "rgba(255,255,255,0.3)" : "#a8b8c8" },
      "& .MuiInput-underline:after": { borderBottomColor: primary },
      "& .MuiInputLabel-root": { color: textMuted, fontSize: "0.85rem" },
      "& .MuiInputBase-input": { fontSize: "0.88rem", color: textPrimary, paddingBottom: 6 },
    },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Whitelabel(props) {
  const { settings } = props;
  const classes = useStyles();
  const theme   = useTheme();
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const [settingsLoaded, setSettingsLoaded] = useState({});
  const { getCurrentUserInfo } = useAuth();
  const [currentUser, setCurrentUser] = useState({});

  const { colorMode } = useContext(ColorModeContext);
  const [primaryColorLightModalOpen, setPrimaryColorLightModalOpen] = useState(false);
  const [primaryColorDarkModalOpen,  setPrimaryColorDarkModalOpen]  = useState(false);

  const logoLightInput   = useRef(null);
  const logoDarkInput    = useRef(null);
  const logoFaviconInput = useRef(null);
  const appNameInput     = useRef(null);
  const [appName, setAppName] = useState(settingsLoaded.appName || "");

  const { update } = useSettings();

  /* ── todas as funções originais preservadas ── */
  function updateSettingsLoaded(key, value) {
    console.log("|=========== updateSettingsLoaded ==========|");
    console.log(key, value);
    console.log("|===========================================|");
    if (key === 'primaryColorLight' || key === 'primaryColorDark' || key === 'appName') {
      localStorage.setItem(key, value);
    }
    const newSettings = { ...settingsLoaded };
    newSettings[key] = value;
    setSettingsLoaded(newSettings);
  }

  useEffect(() => {
    getCurrentUserInfo().then((u) => setCurrentUser(u));
    if (Array.isArray(settings) && settings.length) {
      const primaryColorLight = settings.find((s) => s.key === "primaryColorLight")?.value;
      const primaryColorDark  = settings.find((s) => s.key === "primaryColorDark")?.value;
      const appLogoLight      = settings.find((s) => s.key === "appLogoLight")?.value;
      const appLogoDark       = settings.find((s) => s.key === "appLogoDark")?.value;
      const appLogoFavicon    = settings.find((s) => s.key === "appLogoFavicon")?.value;
      const appName           = settings.find((s) => s.key === "appName")?.value;
      setAppName(appName || "");
      setSettingsLoaded({ ...settingsLoaded, primaryColorLight, primaryColorDark, appLogoLight, appLogoDark, appLogoFavicon, appName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleSaveSetting(key, value) {
    await update({ key, value });
    updateSettingsLoaded(key, value);
    toast.success("Operação atualizada com sucesso.");
  }

  const uploadLogo = async (e, mode) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("typeArch", "logo");
    formData.append("mode", mode);
    formData.append("file", file);
    await api.post("/settings-whitelabel/logo", formData, {
      onUploadProgress: (event) => {
        let progress = Math.round((event.loaded * 100) / event.total);
        console.log(`A imagem está ${progress}% carregada... `);
      },
    }).then((response) => {
      updateSettingsLoaded(`appLogo${mode}`, response.data);
      colorMode[`setAppLogo${mode}`](getBackendUrl() + "/public/" + response.data);
    }).catch((err) => {
      console.error("Houve um problema ao realizar o upload da imagem.");
      console.log(err);
    });
  };

  /* ── ícones SVG inline ── */
  const IconPalette = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/></svg>;
  const IconImage   = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>;
  const IconText    = <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/></svg>;

  return (
    <div className={classes.root}>
      <SectionStyle />

      <OnlyForSuperUser
        user={currentUser}
        yes={() => (
          <>
            {/* ══ NOME DO SISTEMA ════════════════════════════════════════ */}
            <SectionCard
              icon={IconText}
              iconStyle={{ backgroundColor: alpha("#2563eb", isDark ? 0.15 : 0.08), color: "#2563eb" }}
              title="Identidade do sistema"
              subtitle="Nome exibido em toda a plataforma"
            >
              <FormControl style={{ width: "100%", maxWidth: 320 }}>
                <TextField
                  id="appname-field"
                  label="Nome do sistema"
                  variant="outlined"
                  name="appName"
                  value={appName}
                  inputRef={appNameInput}
                  className={classes.textField}
                  onChange={(e) => setAppName(e.target.value)}
                  onBlur={async () => {
                    await handleSaveSetting("appName", appName);
                    colorMode.setAppName(appName || "Multi100");
                  }}
                />
              </FormControl>
            </SectionCard>

            {/* ══ CORES PRIMÁRIAS ════════════════════════════════════════ */}
            <SectionCard
              icon={IconPalette}
              iconStyle={{ backgroundColor: alpha("#7c3aed", isDark ? 0.15 : 0.08), color: "#7c3aed" }}
              title="Cores primárias"
              subtitle="Cor principal do sistema nos modos claro e escuro"
            >
              <Grid container spacing={2}>
                {/* Modo Claro */}
                <Grid item xs={12} sm={6}>
                  <Typography style={{ fontSize: "0.70rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: isDark ? "#4d6478" : "#8fa0b0", marginBottom: 8 }}>
                    Modo claro
                  </Typography>
                  <div
                    className="wl-color-field"
                    onClick={() => setPrimaryColorLightModalOpen(true)}
                  >
                    <div
                      className="wl-color-swatch"
                      style={{ backgroundColor: settingsLoaded.primaryColorLight || "#e8eef5" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="wl-color-label">Cor primária claro</div>
                      <div className="wl-color-value">
                        {settingsLoaded.primaryColorLight || "—"}
                      </div>
                    </div>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPrimaryColorLightModalOpen(true); }}
                      style={{ color: isDark ? alpha(primary, 0.7) : primary, padding: 4 }}>
                      <Colorize style={{ fontSize: 15 }} />
                    </IconButton>
                  </div>
                  <ColorBoxModal
                    open={primaryColorLightModalOpen}
                    handleClose={() => setPrimaryColorLightModalOpen(false)}
                    onChange={(color) => {
                      handleSaveSetting("primaryColorLight", `#${color.hex}`);
                      colorMode.setPrimaryColorLight(`#${color.hex}`);
                    }}
                    currentColor={settingsLoaded.primaryColorLight}
                  />
                </Grid>

                {/* Modo Escuro */}
                <Grid item xs={12} sm={6}>
                  <Typography style={{ fontSize: "0.70rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: isDark ? "#4d6478" : "#8fa0b0", marginBottom: 8 }}>
                    Modo escuro
                  </Typography>
                  <div
                    className="wl-color-field"
                    onClick={() => setPrimaryColorDarkModalOpen(true)}
                  >
                    <div
                      className="wl-color-swatch"
                      style={{ backgroundColor: settingsLoaded.primaryColorDark || "#1a2535" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="wl-color-label">Cor primária escuro</div>
                      <div className="wl-color-value">
                        {settingsLoaded.primaryColorDark || "—"}
                      </div>
                    </div>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPrimaryColorDarkModalOpen(true); }}
                      style={{ color: isDark ? alpha(primary, 0.7) : primary, padding: 4 }}>
                      <Colorize style={{ fontSize: 15 }} />
                    </IconButton>
                  </div>
                  <ColorBoxModal
                    open={primaryColorDarkModalOpen}
                    handleClose={() => setPrimaryColorDarkModalOpen(false)}
                    onChange={(color) => {
                      handleSaveSetting("primaryColorDark", `#${color.hex}`);
                      colorMode.setPrimaryColorDark(`#${color.hex}`);
                    }}
                    currentColor={settingsLoaded.primaryColorDark}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* ══ LOGOTIPOS ═════════════════════════════════════════════ */}
            <SectionCard
              icon={IconImage}
              iconStyle={{ backgroundColor: alpha("#0891b2", isDark ? 0.15 : 0.08), color: "#0891b2" }}
              title="Logotipos"
              subtitle="Imagens do sistema nos modos claro, escuro e favicon"
            >
              <Grid container spacing={2}>
                {/* Logo claro */}
                <Grid item xs={12} sm={4}>
                  <UploadCard
                    label="Logotipo claro"
                    value={settingsLoaded.appLogoLight}
                    inputId="upload-logo-light-button"
                    inputRef={logoLightInput}
                    isDark={isDark}
                    primary={primary}
                    onUpload={(e) => uploadLogo(e, "Light")}
                    onDelete={() => {
                      handleSaveSetting("appLogoLight", "");
                      colorMode.setAppLogoLight(defaultLogoLight);
                    }}
                    previewSlot={
                      <div className="wl-preview-light">
                        <img
                          className="wl-preview-img"
                          alt="light-logo-preview"
                          style={{ content: `url(${settingsLoaded.appLogoLight ? (getBackendUrl() + "/public/" + settingsLoaded.appLogoLight) : defaultLogoLight})` }}
                        />
                      </div>
                    }
                  />
                </Grid>

                {/* Logo escuro */}
                <Grid item xs={12} sm={4}>
                  <UploadCard
                    label="Logotipo escuro"
                    value={settingsLoaded.appLogoDark}
                    inputId="upload-logo-dark-button"
                    inputRef={logoDarkInput}
                    isDark={isDark}
                    primary={primary}
                    onUpload={(e) => uploadLogo(e, "Dark")}
                    onDelete={() => {
                      handleSaveSetting("appLogoDark", "");
                      colorMode.setAppLogoDark(defaultLogoDark);
                    }}
                    previewSlot={
                      <div className="wl-preview-dark">
                        <img
                          className="wl-preview-img"
                          alt="dark-logo-preview"
                          style={{ content: `url(${settingsLoaded.appLogoDark ? (getBackendUrl() + "/public/" + settingsLoaded.appLogoDark) : defaultLogoDark})` }}
                        />
                      </div>
                    }
                  />
                </Grid>

                {/* Favicon */}
                <Grid item xs={12} sm={4}>
                  <UploadCard
                    label="Favicon"
                    value={settingsLoaded.appLogoFavicon}
                    inputId="upload-logo-favicon-button"
                    inputRef={logoFaviconInput}
                    isDark={isDark}
                    primary={primary}
                    onUpload={(e) => uploadLogo(e, "Favicon")}
                    onDelete={() => {
                      handleSaveSetting("appLogoFavicon", "");
                      colorMode.setAppLogoFavicon(defaultLogoFavicon);
                    }}
                    previewSlot={
                      <div className="wl-preview-favicon">
                        <img
                          className="wl-preview-img"
                          alt="favicon-preview"
                          style={{ maxHeight: 32, content: `url(${settingsLoaded.appLogoFavicon ? (getBackendUrl() + "/public/" + settingsLoaded.appLogoFavicon) : defaultLogoFavicon})` }}
                        />
                      </div>
                    }
                  />
                </Grid>
              </Grid>
            </SectionCard>
          </>
        )}
      />
    </div>
  );
}