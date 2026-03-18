import React, { useState, useEffect, useContext } from "react";
import qs from "query-string";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import { Link as RouterLink } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import ColorModeContext from "../../layout/themeContext";
import { useTheme } from "@material-ui/core/styles";
import { Helmet } from "react-helmet";

// ── Ícones MUI (mesmos do Login corrigido) ──────────────────────────────────
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import BuildIcon from "@material-ui/icons/Build";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";

const UserSchema = Yup.object().shape({
  name: Yup.string().min(2).max(50).required("Obrigatório"),
  companyName: Yup.string().min(2).max(50).required("Obrigatório"),
  password: Yup.string().min(5).max(50),
  email: Yup.string().email("Email inválido").required("Obrigatório"),
  phone: Yup.string().required("Obrigatório"),
  planId: Yup.string().required("Selecione um plano"),
});

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

const resolveImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("http")) return value;
  if (!backendUrl) return value;
  const base = backendUrl.replace(/\/+$/, "");
  const clean = value.replace(/^\/+/, "");
  return `${base}/${clean}`;
};

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

function SignUp() {
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName } = colorMode;
  const theme = useTheme();
  const history = useHistory();
  const { getPlanList } = usePlans();

  // =========================================================================
  // isDark: derivado direto do tema MUI (única fonte de verdade).
  // Quando o sistema troca o tema, o MUI recria o ThemeProvider com
  // palette.type = "dark" | "light", re-renderizando este componente
  // automaticamente. Nenhum observer é necessário.
  // =========================================================================
  const isDark = theme.palette.type === "dark";

  const [plans, setPlans] = useState([]);
  const [openPlans, setOpenPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formikHelpers, setFormikHelpers] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isCardHover, setIsCardHover] = useState(false);
  const [isSignupHover, setIsSignupHover] = useState(false);
  const [isLoginHover, setIsLoginHover] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredPlanId, setHoveredPlanId] = useState(null);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);

  // WhatsApp Widget
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [isWhatsAppHover, setIsWhatsAppHover] = useState(false);
  const [showBalloon, setShowBalloon] = useState(false);

  // Customização
  const [backgroundImage, setBackgroundImage] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const [logoImageDark, setLogoImageDark] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const params = qs.parse(window.location.search);
  const companyId = params.companyId || null;

  const initialState = {
    name: "", email: "", password: "", phone: "",
    companyId, companyName: "", planId: "",
  };

  // ── Paleta de cores por tema (idêntica ao Login) ─────────────────────────
  const colors = isDark
    ? {
        pageBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        cardBg: 'rgba(22, 30, 46, 0.97)',
        cardBgHover: 'rgba(26, 35, 54, 1)',
        cardBorder: 'rgba(59,130,246,0.27)',
        cardBorderHover: 'rgba(59,130,246,0.55)',
        cardShadow: '0 10px 40px rgba(0,0,0,0.5)',
        cardShadowHover: '0 20px 50px rgba(0,0,0,0.6)',
        headingColor: '#f1f5f9',
        subTextColor: '#94a3b8',
        labelColor: '#cbd5e1',
        inputBg: '#0f172a',
        inputBorder: '#334155',
        inputColor: '#f1f5f9',
        inputPlaceholder: '#475569',
        iconColor: '#64748b',
        errorColor: '#f87171',
        modalBg: '#131e2e',
        modalBorder: 'rgba(255,255,255,0.07)',
        modalHeaderBg: 'rgba(255,255,255,0.03)',
        planBorder: 'rgba(255,255,255,0.08)',
        planBg: '#131e2e',
        planText: '#f0f4f8',
        planMuted: '#4d6478',
        planSelected: 'rgba(0,120,212,0.25)',
        planSelectedBorder: '#0078d4',
        divider: 'rgba(255,255,255,0.07)',
        closeBtnBg: 'rgba(255,255,255,0.05)',
        closeBtnBorder: 'rgba(255,255,255,0.12)',
        closeBtnColor: '#8fa0b0',
      }
    : {
        pageBg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBgHover: 'rgba(255, 255, 255, 1)',
        cardBorder: 'rgba(59,130,246,0.2)',
        cardBorderHover: 'rgba(59,130,246,0.4)',
        cardShadow: '0 10px 40px rgba(37,99,235,0.15)',
        cardShadowHover: '0 20px 50px rgba(59,130,246,0.25)',
        headingColor: '#1f2937',
        subTextColor: '#6b7280',
        labelColor: '#374151',
        inputBg: '#f9fafb',
        inputBorder: '#d1d5db',
        inputColor: '#1f2937',
        inputPlaceholder: '#9ca3af',
        iconColor: '#9ca3af',
        errorColor: '#ef4444',
        modalBg: '#ffffff',
        modalBorder: '#edebe9',
        modalHeaderBg: '#f8fafc',
        planBorder: '#e5e7eb',
        planBg: '#ffffff',
        planText: '#1f2937',
        planMuted: '#6b7280',
        planSelected: 'rgba(0,120,212,0.04)',
        planSelectedBorder: '#0078d4',
        divider: '#e5e7eb',
        closeBtnBg: 'transparent',
        closeBtnBorder: '#6b7280',
        closeBtnColor: '#374151',
      };

  // useEffect resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useEffect branding
  useEffect(() => {
    const fetchCustomizationSettings = async () => {
      try {
        const { data } = await openApi.get("/global-config/public-branding");
        if (data.loginBackground) setBackgroundImage(data.loginBackground);
        if (data.loginLogo) setLogoImage(data.loginLogo);
        if (data.loginLogoDark) setLogoImageDark(data.loginLogoDark);
        if (data.loginWhatsapp) setWhatsappNumber(data.loginWhatsapp.replace(/[^\d]/g, ''));

        const whatsappResponse = await fetch(`${backendUrl}/settings/whatsappNumber`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (whatsappResponse.ok) {
          const whatsappData = await whatsappResponse.json();
          if (whatsappData.whatsappNumber) setWhatsappNumber(whatsappData.whatsappNumber);
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
      }
    };
    fetchCustomizationSettings();
  }, []);

  // useEffect userCreation
  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch user creation status");
        const data = await response.json();
        const isEnabled = data.userCreation === "enabled";
        setUserCreationEnabled(isEnabled);
        if (!isEnabled) {
          toast.info("Cadastro de novos usuários está desabilitado.");
          history.push("/login");
        }
      } catch (err) {
        console.error("Erro ao verificar userCreation:", err);
        setUserCreationEnabled(false);
        toast.error("Erro ao verificar permissão de cadastro.");
        history.push("/login");
      }
    };
    fetchUserCreationStatus();
  }, [history]);

  // useEffect planos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const planList = await getPlanList({ listPublic: "false" });
        setPlans(planList);
      } catch (error) {
        toastError(error);
      }
    };
    fetchData();
  }, [getPlanList]);

  // useEffect balão WhatsApp
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showWhatsAppMenu) {
        setShowBalloon(true);
        setTimeout(() => setShowBalloon(false), 5000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [showWhatsAppMenu]);

  // Funções auxiliares
  const updatePasswordStrength = (password) => setPasswordStrength(calculatePasswordStrength(password));
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleSignUp = async (values) => {
    setLoading(true);
    try {
      await openApi.post("/auth/signup", values);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setLoading(false);
        history.push("/login");
      }, 8000);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleClosePlans = () => setOpenPlans(false);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    if (formikHelpers) formikHelpers.setFieldValue("planId", planId);
    handleClosePlans();
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    setLoading(false);
    history.push("/login");
  };

  const handleWhatsAppClick = (option) => {
    const phone = whatsappNumber || "5592986143081";
    let message = "";
    switch (option) {
      case "compras":    message = "Olá! Gostaria de fazer uma compra."; break;
      case "suporte":    message = "Olá! Preciso de suporte técnico."; break;
      case "financeiro": message = "Olá! Tenho uma dúvida financeira."; break;
      case "consultor":  message = "Olá! Gostaria de falar com um consultor."; break;
      default:           message = "Olá!";
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    setShowWhatsAppMenu(false);
  };

  const getPasswordStrengthColor = (s) => s <= 2 ? "#f44336" : s <= 4 ? "#ff9800" : "#4caf50";
  const getPasswordStrengthText  = (s) => s <= 2 ? "Senha fraca" : s <= 4 ? "Senha média" : "Senha forte";

  if (!userCreationEnabled) return null;

  const useCustomBackground = backgroundImage
    && backgroundImage.trim() !== ''
    && !backgroundImage.includes('login-background-default.png');

  // Cor primária do tema MUI
  const primaryColor = theme.palette.primary.main || '#2563eb';
  const primaryDark  = theme.palette.primary.dark  || '#1e40af';

  const globalStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      25% { transform: translateY(-20px) translateX(10px); }
      50% { transform: translateY(-10px) translateX(-10px); }
      75% { transform: translateY(-30px) translateX(5px); }
    }
    @keyframes spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50%       { transform: scale(1.3); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { transform: scale(0); }
      to   { transform: scale(1); }
    }
    @keyframes bounceIn {
      0%   { opacity: 0; transform: scale(0.3) translateY(20px); }
      50%  { opacity: 1; transform: scale(1.05); }
      70%  { transform: scale(0.9); }
      100% { transform: scale(1) translateY(0); }
    }
    input::placeholder { color: ${colors.inputPlaceholder} !important; opacity: 1; }
  `;

  // ── Estilos reutilizáveis para inputs ────────────────────────────────────
  const inputStyle = (name) => ({
    width: '100%',
    paddingLeft: '3rem',
    paddingRight: '1rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    background: colors.inputBg,
    border: focusedInput === name ? `1px solid ${primaryColor}` : `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem',
    color: colors.inputColor,
    transition: 'all 0.2s',
    outline: 'none',
    boxShadow: focusedInput === name ? `0 0 0 3px ${primaryColor}33` : 'none',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: colors.labelColor,
    marginBottom: '0.5rem',
    transition: 'color 0.3s ease',
  };

  const iconWrapStyle = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.iconColor,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  return (
    <>
      <Helmet>
        <title>{appName || "CHATPAGEPRO"}</title>
        <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
        <style>{globalStyles}</style>
      </Helmet>

      {/* ── CSS do Widget WhatsApp ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .wa-widget * { font-family: 'DM Sans', system-ui, sans-serif !important; }
        .wa-option-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 11px;
          background: transparent;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e3eaf2'};
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          text-align: left;
          margin-bottom: 6px;
          outline: none;
        }
        .wa-option-btn:last-child { margin-bottom: 0; }
        .wa-option-btn:hover {
          transform: translateX(3px);
          border-color: rgba(37,211,102,0.35) !important;
        }
      `}</style>

      <div style={{
        background: useCustomBackground
          ? `url('${resolveImageUrl(backgroundImage, "")}')`
          : colors.pageBg,
        backgroundSize: useCustomBackground ? 'cover' : 'auto',
        backgroundPosition: useCustomBackground ? 'center center' : 'initial',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        transition: 'background 0.3s ease',
      }}>

        {/* ── Luzes animadas (sem background customizado) ── */}
        {!useCustomBackground && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            {[
              { w: 300, h: 300, color: `rgba(99,102,241,${isDark?'0.35':'0.25'})`, top: '15%', left: '5%', delay: '0s' },
              { w: 250, h: 250, color: `rgba(236,72,153,${isDark?'0.30':'0.22'})`, top: '55%', right: '10%', delay: '2s' },
              { w: 200, h: 200, color: `rgba(59,130,246,${isDark?'0.30':'0.20'})`, bottom: '25%', left: '15%', delay: '4s' },
              { w: 220, h: 220, color: `rgba(168,85,247,${isDark?'0.30':'0.20'})`, top: '40%', left: '50%', delay: '1s' },
              { w: 280, h: 280, color: `rgba(14,165,233,${isDark?'0.30':'0.22'})`, bottom: '10%', right: '30%', delay: '3s' },
              { w: 240, h: 240, color: `rgba(244,114,182,${isDark?'0.28':'0.20'})`, top: '5%', right: '25%', delay: '5s' },
            ].map((b, i) => (
              <div key={i} style={{
                position: 'absolute', borderRadius: '50%', filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: b.w, height: b.h,
                background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
                top: b.top, left: b.left, right: b.right, bottom: b.bottom,
                animationDelay: b.delay,
              }} />
            ))}
          </div>
        )}

        {/* ── Formas geométricas (desktop, sem background customizado) ── */}
        {!useCustomBackground && !isMobile && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {[
              { color: `rgba(99,102,241,${isDark?'0.7':'0.5'})`,  dur: '12s', dir: '',        top: '15%',  left: '8%'   },
              { color: `rgba(236,72,153,${isDark?'0.7':'0.5'})`,  dur: '15s', dir: 'reverse', top: '70%',  right: '12%' },
              { color: `rgba(14,165,233,${isDark?'0.65':'0.45'})`,dur: '10s', dir: '',        bottom:'25%',left: '25%'  },
              { color: `rgba(168,85,247,${isDark?'0.65':'0.45'})`,dur: '18s', dir: 'reverse', top: '45%',  right: '8%'  },
              { color: `rgba(59,130,246,${isDark?'0.65':'0.48'})`,dur: '14s', dir: '',        top: '8%',   right: '35%' },
            ].map((s, i) => (
              <div key={i} style={{
                position: 'absolute', width: 80, height: 80,
                border: `1px solid ${s.color}`,
                background: 'transparent',
                animation: `spin ${s.dur} linear infinite ${s.dir}`,
                filter: `drop-shadow(0 0 8px ${s.color})`,
                top: s.top, left: s.left, right: s.right, bottom: s.bottom,
              }} />
            ))}
            {[
              { sz: 25, color: `rgba(99,102,241,${isDark?'0.6':'0.4'})`,   dur: '5s',   top: '25%',  right: '20%', delay: '0s'   },
              { sz: 35, color: `rgba(236,72,153,${isDark?'0.6':'0.4'})`,   dur: '6s',   bottom:'35%',right: '25%', delay: '1s'   },
              { sz: 20, color: `rgba(14,165,233,${isDark?'0.55':'0.35'})`,  dur: '4.5s', top: '60%',  left: '15%',  delay: '2s'   },
              { sz: 30, color: `rgba(168,85,247,${isDark?'0.55':'0.38'})`,  dur: '5.5s', top: '35%',  left: '40%',  delay: '0.5s' },
              { sz: 28, color: `rgba(59,130,246,${isDark?'0.50':'0.32'})`,  dur: '4.8s', bottom:'15%',left: '35%',  delay: '1.5s' },
              { sz: 22, color: `rgba(244,114,182,${isDark?'0.52':'0.35'})`, dur: '5.2s', top: '12%',  left: '60%',  delay: '2.5s' },
            ].map((c, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: c.sz, height: c.sz, borderRadius: '50%',
                background: `radial-gradient(circle, ${c.color}, transparent)`,
                animation: `pulse ${c.dur} ease-in-out infinite`,
                filter: `drop-shadow(0 0 12px ${c.color})`,
                top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                animationDelay: c.delay,
              }} />
            ))}
          </div>
        )}

        {/* ── Card de cadastro ── */}
        <div style={{ width: '100%', maxWidth: '32rem', position: 'relative', zIndex: 10 }}>
          <div
            style={{
              background: isCardHover ? colors.cardBgHover : colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isCardHover ? colors.cardBorderHover : colors.cardBorder}`,
              transition: 'all 0.3s ease',
              position: 'relative', zIndex: 10,
              boxShadow: isCardHover ? colors.cardShadowHover : colors.cardShadow,
              borderRadius: '1rem',
              padding: '2rem',
              transform: isCardHover ? 'translateY(-5px)' : 'translateY(0)',
              animation: 'fadeIn 0.8s ease-out',
            }}
            onMouseEnter={() => setIsCardHover(true)}
            onMouseLeave={() => setIsCardHover(false)}
          >
            {/* ── Header / Logo ── */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {logoImage ? (
                <img
                  src={
                    isDark && logoImageDark
                      ? resolveImageUrl(logoImageDark, "/logo.png")
                      : resolveImageUrl(logoImage, "/logo.png")
                  }
                  alt="Logo"
                  style={{
                    display: 'block', margin: '0 auto 1.5rem',
                    maxWidth: isMobile ? '180px' : '250px', height: 'auto',
                    // Se não houver logo escura específica, aplica inversão suave no dark mode
                    filter: isDark && !logoImageDark
                      ? 'brightness(1.15) invert(1) hue-rotate(180deg) saturate(0.8)'
                      : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                />
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h1 style={{
                    fontSize: '1.875rem', fontWeight: 'bold',
                    background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem',
                  }}>
                    Dtalk Pro
                  </h1>
                  <div style={{
                    width: '5rem', height: '0.25rem',
                    background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`,
                    margin: '0 auto', borderRadius: '9999px',
                  }} />
                </div>
              )}
              <div style={{
                width: '5rem', height: '0.25rem',
                background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`,
                margin: '0 auto 1rem', borderRadius: '9999px',
              }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.headingColor, marginBottom: '0.5rem', transition: 'color 0.3s' }}>
                Criar Conta
              </h2>
              <p style={{ color: colors.subTextColor, fontSize: '0.875rem', transition: 'color 0.3s' }}>
                Preencha os dados para começar
              </p>
            </div>

            {/* ── Formulário ── */}
            <Formik initialValues={initialState} validationSchema={UserSchema} onSubmit={handleSignUp}>
              {({ touched, errors, isSubmitting, setFieldValue, values }) => {
                if (!formikHelpers) setFormikHelpers({ setFieldValue });
                return (
                  <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Nome da Empresa */}
                    <div>
                      <label style={labelStyle}>Nome da Empresa</label>
                      <div style={{ position: 'relative', transform: focusedInput === 'companyName' ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s' }}>
                        <div style={iconWrapStyle}>
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <Field name="companyName" type="text" placeholder="Sua empresa" style={inputStyle('companyName')} onFocus={() => setFocusedInput('companyName')} onBlur={() => setFocusedInput(null)} />
                      </div>
                      {touched.companyName && errors.companyName && <div style={{ color: colors.errorColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.companyName}</div>}
                    </div>

                    {/* Nome + Telefone */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.25rem' : '1rem' }}>
                      {/* Nome */}
                      <div>
                        <label style={labelStyle}>Nome Completo</label>
                        <div style={{ position: 'relative', transform: focusedInput === 'name' ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s' }}>
                          <div style={iconWrapStyle}>
                            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <Field name="name" type="text" placeholder="Seu nome" style={inputStyle('name')} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} />
                        </div>
                        {touched.name && errors.name && <div style={{ color: colors.errorColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</div>}
                      </div>
                      {/* Telefone */}
                      <div>
                        <label style={labelStyle}>Telefone</label>
                        <div style={{ position: 'relative', transform: focusedInput === 'phone' ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s' }}>
                          <div style={iconWrapStyle}>
                            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <Field name="phone" type="tel" placeholder="(11) 99999-9999" style={inputStyle('phone')} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)} />
                        </div>
                        {touched.phone && errors.phone && <div style={{ color: colors.errorColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone}</div>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label style={labelStyle}>Email</label>
                      <div style={{ position: 'relative', transform: focusedInput === 'email' ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s' }}>
                        <div style={iconWrapStyle}>
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <Field name="email" type="email" placeholder="seu@email.com" style={inputStyle('email')} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} />
                      </div>
                      {touched.email && errors.email && <div style={{ color: colors.errorColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</div>}
                    </div>

                    {/* Senha + Plano */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.25rem' : '1rem' }}>
                      {/* Senha */}
                      <div>
                        <label style={labelStyle}>Senha</label>
                        <div style={{ position: 'relative', transform: focusedInput === 'password' ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s' }}>
                          <div style={iconWrapStyle}>
                            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <Field
                            name="password"
                            type={passwordVisible ? "text" : "password"}
                            placeholder="••••••••"
                            style={{ ...inputStyle('password'), paddingRight: '3rem' }}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            onChange={(e) => { setFieldValue("password", e.target.value); updatePasswordStrength(e.target.value); }}
                          />
                          <button type="button" onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', color: colors.iconColor }}>
                            {passwordVisible ? (
                              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                            ) : (
                              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                        {values.password && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <div style={{ flex: 1, height: '3px', backgroundColor: isDark ? '#1e293b' : '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '2px', transition: 'all 0.3s ease', width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getPasswordStrengthColor(passwordStrength) }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '500', color: getPasswordStrengthColor(passwordStrength), whiteSpace: 'nowrap' }}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                        )}
                        {touched.password && errors.password && <div style={{ color: colors.errorColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</div>}
                      </div>

                      {/* Plano */}
                      <div>
                        <label style={labelStyle}>Plano</label>
                        <div style={{ position: 'relative', transform: focusedInput === 'planId' ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s' }}>
                          <div style={{ ...iconWrapStyle, zIndex: 1 }}>
                            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOpenPlans(true)}
                            onFocus={() => setFocusedInput('planId')}
                            onBlur={() => setFocusedInput(null)}
                            style={{ ...inputStyle('planId'), paddingRight: '3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: selectedPlan ? colors.inputColor : colors.iconColor }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedPlan ? plans.find(p => p.id === selectedPlan)?.name || "Escolher Plano" : "Escolher Plano"}
                            </span>
                            <svg style={{ width: '1rem', height: '1rem', color: colors.iconColor, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        {touched.planId && errors.planId && <div style={{ color: colors.errorColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.planId}</div>}
                      </div>
                    </div>

                    {/* Botão Criar Conta */}
                    <button
                      type="submit"
                      disabled={loading || isSubmitting}
                      style={{
                        width: '100%',
                        background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`,
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: (loading || isSubmitting) ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        transform: isSignupHover && !loading && !isSubmitting ? 'translateY(-1px)' : 'translateY(0)',
                        boxShadow: isSignupHover && !loading && !isSubmitting ? `0 10px 25px ${primaryColor}66` : 'none',
                        opacity: (loading || isSubmitting) ? 0.6 : 1,
                      }}
                      onMouseEnter={() => setIsSignupHover(true)}
                      onMouseLeave={() => setIsSignupHover(false)}
                    >
                      {loading || isSubmitting ? "Criando conta..." : (i18n.t("signup.buttons.submit") || "Criar Conta")}
                    </button>
                  </Form>
                );
              }}
            </Formik>

            {/* Link de login */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: colors.subTextColor, fontSize: '0.875rem' }}>
                Já tem uma conta?{' '}
                <RouterLink
                  to="/login"
                  style={{ color: isLoginHover ? primaryDark : primaryColor, fontWeight: '500', transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={() => setIsLoginHover(true)}
                  onMouseLeave={() => setIsLoginHover(false)}
                >
                  {i18n.t("signup.buttons.login") || "Fazer login"}
                </RouterLink>
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            WhatsApp Widget — mesmo padrão do Login corrigido
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wa-widget" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>

          {/* Balão "Estamos online" */}
          {showBalloon && !showWhatsAppMenu && (
            <div
              onClick={() => { setShowBalloon(false); setShowWhatsAppMenu(true); }}
              style={{
                position: 'absolute', bottom: '78px', right: '0',
                background: isDark ? '#131e2e' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e3eaf2'}`,
                borderRadius: '14px', padding: '12px 16px',
                boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.55)' : '0 20px 50px rgba(15,23,42,0.14)',
                minWidth: '210px',
                animation: 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(37,211,102,0.12)', border: '1.5px solid rgba(37,211,102,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WhatsAppIcon style={{ fontSize: 17, color: '#25D366' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#f0f4f8' : '#0d1b2a', lineHeight: 1.2, marginBottom: '3px' }}>
                    Olá! Estamos online.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)', animation: 'pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: '0.70rem', color: isDark ? '#4d6478' : '#8fa0b0' }}>Como podemos ajudar?</span>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '-7px', right: '22px', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${isDark ? '#131e2e' : '#ffffff'}` }} />
            </div>
          )}

          {/* Painel principal */}
          {showWhatsAppMenu && (
            <div style={{
              position: 'absolute', bottom: '78px', right: '0',
              width: '310px', borderRadius: '18px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`,
              background: isDark ? '#0f1929' : '#f4f7fb',
              boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.55)' : '0 24px 60px rgba(15,23,42,0.18)',
              overflow: 'hidden', animation: 'slideUp 0.25s ease-out',
            }}>

              {/* Barra de título */}
              <div style={{ background: isDark ? '#0b1520' : '#f8fafc', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: 'rgba(37,211,102,0.12)', border: '1.5px solid rgba(37,211,102,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WhatsAppIcon style={{ fontSize: 16, color: '#25D366' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, color: isDark ? '#f0f4f8' : '#0d1b2a' }}>
                      Atendimento
                    </div>
                    <div style={{ fontSize: '0.68rem', marginTop: 3, color: isDark ? '#4d6478' : '#8fa0b0', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)', animation: 'pulse 2s ease-in-out infinite' }} />
                      Estamos online
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWhatsAppMenu(false)}
                  style={{
                    width: 28, height: 28, borderRadius: 8, padding: 0,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`,
                    background: 'transparent',
                    color: isDark ? '#4d6478' : '#8fa0b0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.16s',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2';
                    e.currentTarget.style.color = isDark ? '#4d6478' : '#8fa0b0';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >✕</button>
              </div>

              {/* Corpo */}
              <div style={{ padding: '12px' }}>
                {/* Card de saudação */}
                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5'}`, background: isDark ? '#131e2e' : '#ffffff', overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(37,211,102,0.12)', border: '1.5px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem' }}>👋</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#f0f4f8' : '#0d1b2a' }}>Como podemos ajudar?</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: '0.74rem', lineHeight: 1.5, color: isDark ? '#8fa4be' : '#3d5166' }}>
                      Selecione o departamento desejado e nossa equipe responderá imediatamente.
                    </p>
                  </div>
                </div>

                {/* Opções */}
                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5'}`, background: isDark ? '#131e2e' : '#ffffff', overflow: 'hidden' }}>
                  <div style={{ padding: '10px' }}>
                    {[
                      { id: 'compras',    label: 'Compras',             desc: 'Pedidos e aquisições',      Icon: ShoppingCartIcon, hoverBg: isDark ? 'rgba(59,130,246,0.12)'  : 'rgba(59,130,246,0.07)',  iconBg: isDark ? 'rgba(59,130,246,0.15)'  : 'rgba(59,130,246,0.08)',  iconColor: '#3b82f6' },
                      { id: 'suporte',    label: 'Suporte Técnico',     desc: 'Dúvidas e problemas',       Icon: BuildIcon,        hoverBg: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.07)', iconBg: isDark ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.08)', iconColor: '#a855f7' },
                      { id: 'financeiro', label: 'Financeiro',          desc: 'Cobranças e pagamentos',    Icon: AttachMoneyIcon,  hoverBg: isDark ? 'rgba(34,197,94,0.12)'  : 'rgba(34,197,94,0.07)',  iconBg: isDark ? 'rgba(34,197,94,0.15)'  : 'rgba(34,197,94,0.08)',  iconColor: '#22c55e' },
                      { id: 'consultor',  label: 'Falar com Consultor', desc: 'Atendimento personalizado', Icon: PersonOutlineIcon,hoverBg: isDark ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.07)', iconBg: isDark ? 'rgba(236,72,153,0.15)' : 'rgba(236,72,153,0.08)', iconColor: '#ec4899' },
                    ].map((opt) => (
                      <button key={opt.id} className="wa-option-btn" onClick={() => handleWhatsAppClick(opt.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = opt.hoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: opt.iconBg, border: `1.5px solid ${opt.iconColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <opt.Icon style={{ fontSize: 15, color: opt.iconColor }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#f0f4f8' : '#0d1b2a', lineHeight: 1.2 }}>{opt.label}</div>
                          <div style={{ fontSize: '0.67rem', marginTop: 2, color: isDark ? '#4d6478' : '#8fa0b0' }}>{opt.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.35, color: isDark ? '#f0f4f8' : '#0d1b2a' }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div style={{ padding: '8px 14px 10px', background: isDark ? 'rgba(0,0,0,0.10)' : '#f8fafc', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.68rem', color: isDark ? '#4d6478' : '#8fa0b0' }}>Resposta em tempo real</span>
              </div>
            </div>
          )}

          {/* Botão flutuante */}
          <button
            onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
            onMouseEnter={() => setIsWhatsAppHover(true)}
            onMouseLeave={() => setIsWhatsAppHover(false)}
            style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: 'none', cursor: 'pointer',
              boxShadow: isWhatsAppHover ? '0 12px 30px rgba(37,211,102,0.55)' : '0 6px 20px rgba(37,211,102,0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              transform: isWhatsAppHover ? 'scale(1.08)' : 'scale(1)',
              animation: 'scaleIn 0.4s ease-out', position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(37,211,102,0.35)', animation: 'pulse 2.5s ease-in-out infinite' }} />
            <WhatsAppIcon style={{ fontSize: 30, color: 'white', position: 'relative', zIndex: 1 }} />
          </button>

          {/* Tooltip */}
          {!showWhatsAppMenu && isWhatsAppHover && (
            <div style={{
              position: 'absolute', bottom: '50%', right: '74px', transform: 'translateY(50%)',
              background: isDark ? '#131e2e' : '#0d1b2a', color: 'white',
              padding: '6px 12px', borderRadius: '8px',
              fontSize: '0.76rem', fontWeight: 600, whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)', animation: 'fadeIn 0.15s ease-out',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.1)'}`,
            }}>
              Fale conosco no WhatsApp
              <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `5px solid ${isDark ? '#131e2e' : '#0d1b2a'}` }} />
            </div>
          )}
        </div>

        {/* ══ Modal de Planos ══ */}
        {openPlans && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={handleClosePlans}
          >
            <div
              style={{ background: colors.modalBg, borderRadius: '8px', padding: isMobile ? '1.5rem' : '2.5rem', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', animation: 'slideUp 0.4s ease-out' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${colors.divider}` }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%)`, marginBottom: '1rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                  <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: '600', color: colors.planText, margin: '0 0 0.5rem 0' }}>Escolha seu Plano</h2>
                <p style={{ color: colors.planMuted, fontSize: '1rem', margin: 0 }}>Selecione o plano ideal para sua empresa crescer</p>
              </div>

              {/* Grid de planos */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
                {plans.map((plan) => {
                  const isSelected = plan.id === selectedPlan;
                  const isHovered = hoveredPlanId === plan.id;
                  const isFree = plan.amount === 0 || plan.amount === "0" || plan.name.toLowerCase().includes("gratuito");
                  return (
                    <div
                      key={plan.id}
                      style={{
                        position: 'relative',
                        border: isSelected ? `2px solid ${primaryColor}` : `1px solid ${colors.planBorder}`,
                        borderRadius: '6px', padding: '1.5rem', cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                        background: isSelected ? colors.planSelected : colors.planBg,
                        transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: isSelected ? `0 4px 12px ${primaryColor}26` : isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                      onClick={() => handlePlanSelect(plan.id)}
                      onMouseEnter={() => setHoveredPlanId(plan.id)}
                      onMouseLeave={() => setHoveredPlanId(null)}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: primaryColor, color: 'white', padding: '0.25rem 0.5rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          Ativo
                        </div>
                      )}
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.planText, margin: '0 0 0.5rem 0', paddingRight: isSelected ? '3.5rem' : '0' }}>{plan.name}</h3>
                      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: primaryColor, display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.25rem' }}>
                        {isFree ? <span>Grátis</span> : <><span style={{ fontSize: '1rem', fontWeight: '600' }}>R$</span><span>{plan.amount}</span></>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {[
                          { label: 'Atendentes', value: plan.users,       bg: isDark ? 'rgba(0,120,212,0.15)' : '#f0f9ff', stroke: primaryColor },
                          { label: 'Conexões',   value: plan.connections, bg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4', stroke: '#10b981'    },
                          { label: 'Filas',      value: plan.queues,      bg: isDark ? 'rgba(139,92,246,0.15)' : '#faf5ff', stroke: '#8b5cf6'    },
                        ].map(f => (
                          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '4px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="16" height="16" fill="none" stroke={f.stroke} viewBox="0 0 24 24" strokeWidth="2">
                                {f.label === 'Atendentes' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                                {f.label === 'Conexões'   && <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                                {f.label === 'Filas'      && <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
                              </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.75rem', color: colors.planMuted }}>{f.label}</div>
                              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: colors.planText }}>{f.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handlePlanSelect(plan.id); }}
                        style={{ width: '100%', padding: '0.625rem', background: isSelected ? primaryColor : 'transparent', color: isSelected ? 'white' : primaryColor, border: isSelected ? 'none' : `1.5px solid ${primaryColor}`, borderRadius: '4px', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.background = isSelected ? primaryDark : primaryColor; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isSelected ? primaryColor : 'transparent'; e.currentTarget.style.color = isSelected ? 'white' : primaryColor; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        {isSelected ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Selecionado
                          </span>
                        ) : 'Selecionar'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Fechar */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.divider}` }}>
                <button
                  style={{ padding: '0.625rem 1.75rem', background: colors.closeBtnBg, border: `1.5px solid ${colors.closeBtnBorder}`, color: colors.closeBtnColor, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.15s ease', fontWeight: '600', fontSize: '0.8125rem' }}
                  onClick={handleClosePlans}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = colors.closeBtnBg; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ Modal de Sucesso ══ */}
        {showSuccessModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: isDark ? '#131e2e' : 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '450px', width: '90%', margin: '1rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'transparent'}` }}>
              <div style={{ width: 80, height: 80, background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`, borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.headingColor, margin: '0 0 1rem 0' }}>Conta criada com sucesso!</h3>
              <p style={{ color: colors.subTextColor, lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                Parabéns! Sua conta foi criada com sucesso. Você já pode fazer login e começar a usar nossa plataforma.
              </p>
              <button
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`, color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={handleGoToLogin}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 25px ${primaryColor}66`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Ir para Login
              </button>
              <p style={{ color: colors.planMuted, fontSize: '0.875rem', margin: '1rem 0 0 0' }}>
                Redirecionando automaticamente em alguns segundos...
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SignUp;