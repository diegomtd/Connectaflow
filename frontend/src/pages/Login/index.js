import { i18n } from "../../translate/i18n";

import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, TextField, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { IconButton, InputAdornment, Switch } from "@mui/material";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import BuildIcon from "@material-ui/icons/Build";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import { Helmet } from "react-helmet";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import defaultLoginLogo from "../../assets/login-logo-default.png";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

// resolve URL vinda do backend (relativa ou absoluta) com fallback
const resolveImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("http")) return value;
  if (!backendUrl) return value;
  const base = backendUrl.replace(/\/+$/, "");
  const clean = value.replace(/^\/+/, "");
  return `${base}/${clean}`;
};

// Função para calcular força da senha
const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const Login = () => {
  const theme = useTheme();
  const { handleLogin } = useContext(AuthContext);

  const [user, setUser] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [branding, setBranding] = useState({
    loginLogo: "/logo.png",
    loginLogoDark: null,   // logo alternativa para tema escuro
    loginBackground: null,
    loginWhatsapp: "https://wa.me/5500000000000",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isCardHover, setIsCardHover] = useState(false);
  const [isLoginHover, setIsLoginHover] = useState(false);
  const [isSignupHover, setIsSignupHover] = useState(false);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [isWhatsAppHover, setIsWhatsAppHover] = useState(false);
  const [showBalloon, setShowBalloon] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // =========================================================================
  // isDark: derivado direto do tema MUI (única fonte de verdade).
  // O sistema salva o tema no localStorage e recria o ThemeProvider com
  // palette.type = "dark" | "light", re-renderizando este componente
  // automaticamente. Nenhum observer é necessário.
  // =========================================================================
  const isDark = theme.palette.type === "dark";

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  // ========= Buscar settings globais ============
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get("/global-config/public-branding");

        setBranding({
          loginLogo: data.loginLogo || "/logo.png",
          loginLogoDark: data.loginLogoDark || null, // logo alternativa escura (opcional)
          loginBackground: data.loginBackground || null,
          loginWhatsapp: data.loginWhatsapp || "https://wa.me/5500000000000",
        });
      } catch (err) {
        console.error("Erro ao carregar branding:", err);
      }
    };

    fetchBranding();
  }, []);

  // ========== Verificar se cadastro está habilitado ==========
  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const { data } = await api.get("/settings/userCreation");
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch (err) {
        setUserCreationEnabled(false);
      }
    };

    fetchUserCreationStatus();
  }, []);

  // Effect para resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect para balão do WhatsApp
  useEffect(() => {
    const showBalloonInterval = setInterval(() => {
      if (!showWhatsAppMenu) {
        setShowBalloon(true);
        setTimeout(() => setShowBalloon(false), 5000);
      }
    }, 15000);

    return () => clearInterval(showBalloonInterval);
  }, [showWhatsAppMenu]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("i18nextLng") || "pt";
    i18n.changeLanguage(lang);
    handleLogin(user);
  };

  const handleChangeInput = (name, value) => {
    setUser({ ...user, [name]: value });
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Handler para WhatsApp
  const handleWhatsAppClick = (option) => {
    const phone = branding.loginWhatsapp.replace(/[^\d]/g, '');
    let message = "";

    switch (option) {
      case "compras":
        message = "Olá! Gostaria de fazer uma compra.";
        break;
      case "suporte":
        message = "Olá! Preciso de suporte técnico.";
        break;
      case "financeiro":
        message = "Olá! Tenho uma dúvida financeira.";
        break;
      case "consultor":
        message = "Olá! Gostaria de falar com um consultor.";
        break;
      default:
        message = "Olá!";
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowWhatsAppMenu(false);
  };

  // Função para cor da barra de força da senha
  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return "#f44336";
    if (strength <= 4) return "#ff9800";
    return "#4caf50";
  };

  // Função para texto da força da senha
  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return "Senha fraca";
    if (strength > 2 && strength <= 4) return "Senha média";
    return "Senha forte";
  };

  const primaryColor = theme.palette.primary.main || '#2563eb';
  const primaryDark = theme.palette.primary.dark || '#1e40af';

  // ========= Paleta de cores por tema =============
  const colors = isDark
    ? {
        pageBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        cardBg: 'rgba(22, 30, 46, 0.97)',
        cardBgHover: 'rgba(26, 35, 54, 1)',
        cardBorder: `${primaryColor}44`,
        cardBorderHover: `${primaryColor}88`,
        cardShadow: `0 10px 40px rgba(0,0,0,0.5)`,
        cardShadowHover: `0 20px 50px rgba(0,0,0,0.6)`,
        headingColor: '#f1f5f9',
        subTextColor: '#94a3b8',
        labelColor: '#cbd5e1',
        inputBg: '#0f172a',
        inputBgFocus: '#0f172a',
        inputBorder: '#334155',
        inputColor: '#f1f5f9',
        inputPlaceholder: '#475569',
        iconColor: '#64748b',
        toggleBg: '#1e293b',
        dividerColor: '#1e293b',
        footerBg: 'rgba(15, 23, 42, 0.5)',
        footerBorder: '#1e293b',
        balloonBg: 'rgba(22, 30, 46, 0.98)',
        balloonBorder: 'rgba(59, 130, 246, 0.3)',
        menuBg: 'rgba(22, 30, 46, 0.98)',
        menuBorder: 'rgba(59, 130, 246, 0.25)',
        menuFooterBg: 'rgba(15, 23, 42, 0.6)',
        menuFooterBorder: '#1e293b',
        menuOptionBorder: 'rgba(51, 65, 85, 0.8)',
        menuOptionText: '#e2e8f0',
        tooltipBg: 'rgba(241, 245, 249, 0.95)',
        tooltipColor: '#0f172a',
        separatorColor: '#334155',
        errorColor: '#f87171',
      }
    : {
        pageBg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBgHover: 'rgba(255, 255, 255, 1)',
        cardBorder: `${primaryColor}33`,
        cardBorderHover: `${primaryColor}66`,
        cardShadow: `0 10px 40px ${primaryColor}26`,
        cardShadowHover: `0 20px 50px ${primaryColor}40`,
        headingColor: '#1f2937',
        subTextColor: '#6b7280',
        labelColor: '#374151',
        inputBg: '#f9fafb',
        inputBgFocus: '#f9fafb',
        inputBorder: '#d1d5db',
        inputColor: '#1f2937',
        inputPlaceholder: '#9ca3af',
        iconColor: '#9ca3af',
        toggleBg: '#e5e7eb',
        dividerColor: '#e5e7eb',
        footerBg: 'rgba(249, 250, 251, 0.5)',
        footerBorder: 'rgba(226, 232, 240, 0.8)',
        balloonBg: 'rgba(255, 255, 255, 0.98)',
        balloonBorder: 'rgba(59, 130, 246, 0.2)',
        menuBg: 'rgba(255, 255, 255, 0.98)',
        menuBorder: 'rgba(59, 130, 246, 0.2)',
        menuFooterBg: 'rgba(249, 250, 251, 0.5)',
        menuFooterBorder: 'rgba(226, 232, 240, 0.8)',
        menuOptionBorder: 'rgba(226, 232, 240, 0.8)',
        menuOptionText: '#1f2937',
        tooltipBg: 'rgba(31, 41, 55, 0.95)',
        tooltipColor: 'white',
        separatorColor: 'rgba(226, 232, 240, 0.8)',
        errorColor: '#ef4444',
      };

  const globalStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      25% { transform: translateY(-20px) translateX(10px); }
      50% { transform: translateY(-10px) translateX(-10px); }
      75% { transform: translateY(-30px) translateX(5px); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 0.8;
      }
      50% { 
        transform: scale(1.3);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3) translateY(20px);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1) translateY(0);
      }
    }

    input::placeholder {
      color: ${colors.inputPlaceholder} !important;
      opacity: 1;
    }
  `;

  // Determina se deve usar background customizado ou padrão
  const useCustomBackground = branding.loginBackground
    && branding.loginBackground.trim() !== ''
    && !branding.loginBackground.includes('login-background-default.png');

  return (
    <>
      <Helmet>
        <title>Login</title>
        <style>{globalStyles}</style>
      </Helmet>

      <div style={{
        background: useCustomBackground
          ? `url('${resolveImageUrl(branding.loginBackground, "")}')`
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
        {/* Animated Lights Background - Apenas se NÃO tiver background customizado */}
        {!useCustomBackground && (
          <>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
            }}>
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: '300px',
                height: '300px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0.15) 40%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 70%)',
                top: '15%',
                left: '5%',
                animationDelay: '0s',
              }}></div>
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: '250px',
                height: '250px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(236, 72, 153, 0.22) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 70%)',
                top: '55%',
                right: '10%',
                animationDelay: '2s',
              }}></div>
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: '200px',
                height: '200px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.12) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
                bottom: '25%',
                left: '15%',
                animationDelay: '4s',
              }}></div>
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: '220px',
                height: '220px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.12) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
                top: '40%',
                left: '50%',
                animationDelay: '1s',
              }}></div>
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: '280px',
                height: '280px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 70%)',
                bottom: '10%',
                right: '30%',
                animationDelay: '3s',
              }}></div>
              <div style={{
                position: 'absolute',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite',
                width: '240px',
                height: '240px',
                background: isDark
                  ? 'radial-gradient(circle, rgba(244, 114, 182, 0.28) 0%, rgba(244, 114, 182, 0.12) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, rgba(244, 114, 182, 0.09) 50%, transparent 70%)',
                top: '5%',
                right: '25%',
                animationDelay: '5s',
              }}></div>
            </div>

            {/* Geometric Shapes */}
            {!isMobile && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
              }}>
                <div style={{
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  border: `1px solid rgba(99, 102, 241, ${isDark ? '0.7' : '0.5'})`,
                  background: 'transparent',
                  animation: 'spin 12s linear infinite',
                  filter: `drop-shadow(0 0 8px rgba(99, 102, 241, ${isDark ? '0.7' : '0.5'}))`,
                  top: '15%',
                  left: '8%',
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  border: `1px solid rgba(236, 72, 153, ${isDark ? '0.7' : '0.5'})`,
                  background: 'transparent',
                  animation: 'spin 15s linear infinite reverse',
                  filter: `drop-shadow(0 0 8px rgba(236, 72, 153, ${isDark ? '0.7' : '0.5'}))`,
                  top: '70%',
                  right: '12%',
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '80px',
                  height: '80px',
                  border: `1px solid rgba(14, 165, 233, ${isDark ? '0.65' : '0.45'})`,
                  background: 'transparent',
                  animation: 'spin 10s linear infinite',
                  filter: `drop-shadow(0 0 8px rgba(14, 165, 233, ${isDark ? '0.65' : '0.45'}))`,
                  bottom: '25%',
                  left: '25%',
                }}></div>

                <div style={{
                  position: 'absolute',
                  width: '25px',
                  height: '25px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(99, 102, 241, ${isDark ? '0.6' : '0.4'}), rgba(99, 102, 241, ${isDark ? '0.4' : '0.25'}))`,
                  animation: 'pulse 5s ease-in-out infinite',
                  filter: `drop-shadow(0 0 12px rgba(99, 102, 241, ${isDark ? '0.6' : '0.4'}))`,
                  top: '25%',
                  right: '20%',
                  animationDelay: '0s',
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(236, 72, 153, ${isDark ? '0.6' : '0.4'}), rgba(236, 72, 153, ${isDark ? '0.4' : '0.25'}))`,
                  animation: 'pulse 6s ease-in-out infinite',
                  filter: `drop-shadow(0 0 12px rgba(236, 72, 153, ${isDark ? '0.6' : '0.4'}))`,
                  bottom: '35%',
                  right: '25%',
                  animationDelay: '1s',
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, rgba(14, 165, 233, ${isDark ? '0.55' : '0.35'}), rgba(14, 165, 233, ${isDark ? '0.35' : '0.2'}))`,
                  animation: 'pulse 4.5s ease-in-out infinite',
                  filter: `drop-shadow(0 0 12px rgba(14, 165, 233, ${isDark ? '0.55' : '0.35'}))`,
                  top: '60%',
                  left: '15%',
                  animationDelay: '2s',
                }}></div>
              </div>
            )}
          </>
        )}

        <div style={{
          width: '100%',
          maxWidth: '28rem',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Login Card */}
          <div
            style={{
              background: isCardHover ? colors.cardBgHover : colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isCardHover ? colors.cardBorderHover : colors.cardBorder}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 10,
              boxShadow: isCardHover ? colors.cardShadowHover : colors.cardShadow,
              borderRadius: '1rem',
              padding: isMobile ? '2rem' : '2rem',
              transform: isCardHover ? 'translateY(-5px)' : 'translateY(0)',
              animation: 'fadeIn 0.8s ease-out',
            }}
            onMouseEnter={() => setIsCardHover(true)}
            onMouseLeave={() => setIsCardHover(false)}
          >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img
                src={
                  isDark && branding.loginLogoDark
                    ? resolveImageUrl(branding.loginLogoDark, defaultLoginLogo)
                    : resolveImageUrl(branding.loginLogo, defaultLoginLogo)
                }
                alt="Logo"
                style={{
                  display: 'block',
                  margin: '0 auto 1.5rem',
                  maxWidth: isMobile ? '180px' : '250px',
                  height: 'auto',
                  // Se não tiver logo escura específica, aplica inversão suave no dark mode
                  filter: isDark && !branding.loginLogoDark
                    ? 'brightness(1.15) invert(1) hue-rotate(180deg) saturate(0.8)'
                    : 'none',
                  transition: 'filter 0.3s ease',
                }}
              />
              <div style={{
                width: '5rem',
                height: '0.25rem',
                background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`,
                margin: '0 auto 1rem',
                borderRadius: '9999px',
              }}></div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: colors.headingColor,
                marginBottom: '0.5rem',
                transition: 'color 0.3s ease',
              }}>
                Bem-vindo
              </h2>
              <p style={{
                color: colors.subTextColor,
                fontSize: '0.875rem',
                transition: 'color 0.3s ease',
              }}>
                Entre na sua conta para continuar
              </p>
            </div>

            {error && (
              <Typography style={{ color: colors.errorColor, marginBottom: '1rem' }}>
                {error}
              </Typography>
            )}

            {/* Login Form */}
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: colors.labelColor,
                  marginBottom: '0.5rem',
                  transition: 'color 0.3s ease',
                }}>
                  Email
                </label>
                <div style={{
                  position: 'relative',
                  transform: focusedInput === 'email' ? 'scale(1.02)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}>
                    <EmailIcon style={{ fontSize: '1.25rem' }} />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => handleChangeInput('email', e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      background: colors.inputBg,
                      border: focusedInput === 'email' ? `1px solid ${primaryColor}` : `1px solid ${colors.inputBorder}`,
                      borderRadius: '0.5rem',
                      color: colors.inputColor,
                      transition: 'all 0.2s',
                      outline: 'none',
                      boxShadow: focusedInput === 'email' ? `0 0 0 3px ${primaryColor}33` : 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: colors.labelColor,
                  marginBottom: '0.5rem',
                  transition: 'color 0.3s ease',
                }}>
                  Senha
                </label>
                <div style={{
                  position: 'relative',
                  transform: focusedInput === 'password' ? 'scale(1.02)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}>
                    <LockIcon style={{ fontSize: '1.25rem' }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                    onChange={(e) => handleChangeInput('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '3rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      background: colors.inputBg,
                      border: focusedInput === 'password' ? `1px solid ${primaryColor}` : `1px solid ${colors.inputBorder}`,
                      borderRadius: '0.5rem',
                      color: colors.inputColor,
                      transition: 'all 0.2s',
                      outline: 'none',
                      boxShadow: focusedInput === 'password' ? `0 0 0 3px ${primaryColor}33` : 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      color: colors.iconColor,
                    }}
                  >
                    {showPassword ? <VisibilityOff style={{ fontSize: '1.25rem' }} /> : <Visibility style={{ fontSize: '1.25rem' }} />}
                  </button>
                </div>

                {/* Barra de força da senha */}
                {user.password && (
                  <>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: isDark ? '#1e293b' : '#e0e0e0',
                      borderRadius: '2px',
                      marginTop: '0.5rem',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength)
                      }} />
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      marginTop: '0.25rem',
                      color: getPasswordStrengthColor(passwordStrength)
                    }}>
                      {getPasswordStrengthText(passwordStrength)}
                    </div>
                  </>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: colors.labelColor,
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                }}>
                  <div
                    onClick={() => handleChangeInput("remember", !user.remember)}
                    style={{
                      position: 'relative',
                      width: '44px',
                      height: '24px',
                      background: user.remember
                        ? `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`
                        : colors.toggleBg,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      width: '20px',
                      height: '20px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      transform: user.remember ? 'translateX(20px)' : 'translateX(0)',
                    }}></div>
                  </div>
                  <span style={{ marginLeft: '0.75rem' }}>Lembrar de mim</span>
                </label>
                <RouterLink
                  to="/forgot-password"
                  style={{
                    color: primaryColor,
                    fontWeight: '500',
                    textDecoration: 'none',
                  }}
                >
                  Esqueceu a senha?
                </RouterLink>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: `linear-gradient(to right, ${primaryColor}, ${primaryDark})`,
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transform: isLoginHover ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: isLoginHover ? `0 10px 25px ${primaryColor}66` : 'none',
                }}
                onMouseEnter={() => setIsLoginHover(true)}
                onMouseLeave={() => setIsLoginHover(false)}
              >
                Entrar
              </button>

              {/* Sign Up Button */}
              {userCreationEnabled && (
                <button
                  type="button"
                  onClick={() => window.location.href = '/signup'}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: primaryColor,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    border: `2px solid ${primaryColor}`,
                    cursor: 'pointer',
                    outline: 'none',
                    transform: isSignupHover ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: isSignupHover ? `0 10px 25px ${primaryColor}33` : 'none',
                  }}
                  onMouseEnter={() => setIsSignupHover(true)}
                  onMouseLeave={() => setIsSignupHover(false)}
                >
                  Cadastre-se
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ═══ WhatsApp Widget ═══ */}
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
          .wa-close-btn {
            width: 28px; height: 28px; border-radius: 7px;
            border: 1px solid rgba(255,255,255,0.25);
            background: rgba(255,255,255,0.15);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.15s; color: white;
            flex-shrink: 0;
          }
          .wa-close-btn:hover { background: rgba(255,255,255,0.25); }
        `}</style>

        <div className="wa-widget" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
        }}>
          {/* ── Balão "Estamos online" ── */}
          {showBalloon && !showWhatsAppMenu && (
            <div
              onClick={() => { setShowBalloon(false); setShowWhatsAppMenu(true); }}
              style={{
                position: 'absolute',
                bottom: '78px',
                right: '0',
                background: isDark ? '#131e2e' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e3eaf2'}`,
                borderRadius: '14px',
                padding: '12px 16px',
                boxShadow: isDark
                  ? '0 20px 50px rgba(0,0,0,0.55)'
                  : '0 20px 50px rgba(15,23,42,0.14)',
                minWidth: '210px',
                animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Ícone WhatsApp pequeno */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                  background: 'rgba(37,211,102,0.12)',
                  border: '1.5px solid rgba(37,211,102,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <WhatsAppIcon style={{ fontSize: 17, color: '#25D366' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.82rem', fontWeight: 700,
                    color: isDark ? '#f0f4f8' : '#0d1b2a',
                    lineHeight: 1.2, marginBottom: '3px',
                  }}>
                    Olá! Estamos online.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 6px rgba(34,197,94,0.7)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: '0.70rem', color: isDark ? '#4d6478' : '#8fa0b0' }}>
                      Como podemos ajudar?
                    </span>
                  </div>
                </div>
              </div>
              {/* Cauda do balão */}
              <div style={{
                position: 'absolute', bottom: '-7px', right: '22px',
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: `7px solid ${isDark ? '#131e2e' : '#ffffff'}`,
              }} />
            </div>
          )}

          {/* ── Painel principal (estilo UserModal) ── */}
          {showWhatsAppMenu && (
            <div style={{
              position: 'absolute',
              bottom: '78px',
              right: '0',
              width: '310px',
              borderRadius: '18px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`,
              background: isDark ? '#0f1929' : '#f4f7fb',
              boxShadow: isDark
                ? '0 24px 60px rgba(0,0,0,0.55)'
                : '0 24px 60px rgba(15,23,42,0.18)',
              overflow: 'hidden',
              animation: 'slideUp 0.25s ease-out',
            }}>

              {/* Barra de título — igual ao titleBar do UserModal */}
              <div style={{
                background: isDark ? '#0b1520' : '#f8fafc',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`,
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {/* titleIcon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: 'rgba(37,211,102,0.12)',
                    border: '1.5px solid rgba(37,211,102,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <WhatsAppIcon style={{ fontSize: 16, color: '#25D366' }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.88rem', fontWeight: 700,
                      letterSpacing: '-0.01em', lineHeight: 1,
                      color: isDark ? '#f0f4f8' : '#0d1b2a',
                    }}>
                      Atendimento
                    </div>
                    <div style={{
                      fontSize: '0.68rem', marginTop: 3,
                      color: isDark ? '#4d6478' : '#8fa0b0',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#22c55e',
                        boxShadow: '0 0 6px rgba(34,197,94,0.7)',
                        animation: 'pulse 2s ease-in-out infinite',
                      }} />
                      Estamos online
                    </div>
                  </div>
                </div>
                {/* closeButton */}
                <button
                  className="wa-close-btn"
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
                >
                  ✕
                </button>
              </div>

              {/* Corpo — section-card com as opções */}
              <div style={{ padding: '12px' }}>
                {/* Saudação */}
                <div style={{
                  borderRadius: 12,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5'}`,
                  background: isDark ? '#131e2e' : '#ffffff',
                  overflow: 'hidden',
                  marginBottom: 10,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 12px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5'}`,
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: 'rgba(37,211,102,0.12)',
                      border: '1.5px solid rgba(37,211,102,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '0.7rem' }}>👋</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: isDark ? '#f0f4f8' : '#0d1b2a',
                    }}>
                      Como podemos ajudar?
                    </span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{
                      margin: 0, fontSize: '0.74rem', lineHeight: 1.5,
                      color: isDark ? '#8fa4be' : '#3d5166',
                    }}>
                      Selecione o departamento desejado e nossa equipe responderá imediatamente.
                    </p>
                  </div>
                </div>

                {/* Seção de departamentos */}
                <div style={{
                  borderRadius: 12,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8eef5'}`,
                  background: isDark ? '#131e2e' : '#ffffff',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px' }}>
                    {[
                      { id: 'compras',    label: 'Compras',             desc: 'Pedidos e aquisições',       Icon: ShoppingCartIcon, hoverBg: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)',   iconBg: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',  iconColor: '#3b82f6' },
                      { id: 'suporte',    label: 'Suporte Técnico',     desc: 'Dúvidas e problemas',        Icon: BuildIcon,         hoverBg: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.07)',  iconBg: isDark ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.08)', iconColor: '#a855f7' },
                      { id: 'financeiro', label: 'Financeiro',          desc: 'Cobranças e pagamentos',     Icon: AttachMoneyIcon,   hoverBg: isDark ? 'rgba(34,197,94,0.12)'  : 'rgba(34,197,94,0.07)',   iconBg: isDark ? 'rgba(34,197,94,0.15)'  : 'rgba(34,197,94,0.08)',  iconColor: '#22c55e' },
                      { id: 'consultor',  label: 'Falar com Consultor', desc: 'Atendimento personalizado',  Icon: PersonOutlineIcon, hoverBg: isDark ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.07)',  iconBg: isDark ? 'rgba(236,72,153,0.15)' : 'rgba(236,72,153,0.08)', iconColor: '#ec4899' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        className="wa-option-btn"
                        onClick={() => handleWhatsAppClick(opt.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = opt.hoverBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Ícone MUI — mesmo padrão do section-header-icon do UserModal */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: opt.iconBg,
                          border: `1.5px solid ${opt.iconColor}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <opt.Icon style={{ fontSize: 15, color: opt.iconColor }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.78rem', fontWeight: 700,
                            color: isDark ? '#f0f4f8' : '#0d1b2a',
                            lineHeight: 1.2,
                          }}>
                            {opt.label}
                          </div>
                          <div style={{
                            fontSize: '0.67rem', marginTop: 2,
                            color: isDark ? '#4d6478' : '#8fa0b0',
                          }}>
                            {opt.desc}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.75rem', opacity: 0.35,
                          color: isDark ? '#f0f4f8' : '#0d1b2a',
                        }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rodapé — igual ao dialogActions */}
              <div style={{
                padding: '8px 14px 10px',
                background: isDark ? 'rgba(0,0,0,0.10)' : '#f8fafc',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : '#e3eaf2'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                <span style={{ fontSize: '0.68rem', color: isDark ? '#4d6478' : '#8fa0b0' }}>
                  Resposta em tempo real
                </span>
              </div>
            </div>
          )}

          {/* ── Botão flutuante ── */}
          <button
            onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
            onMouseEnter={() => setIsWhatsAppHover(true)}
            onMouseLeave={() => setIsWhatsAppHover(false)}
            style={{
              width: '60px', height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isWhatsAppHover
                ? '0 12px 30px rgba(37,211,102,0.55)'
                : '0 6px 20px rgba(37,211,102,0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isWhatsAppHover ? 'scale(1.08)' : 'scale(1)',
              animation: 'scaleIn 0.4s ease-out',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(37,211,102,0.35)',
              animation: 'pulse 2.5s ease-in-out infinite',
            }} />
            <WhatsAppIcon style={{ fontSize: 30, color: 'white', position: 'relative', zIndex: 1 }} />
          </button>

          {/* ── Tooltip ── */}
          {!showWhatsAppMenu && isWhatsAppHover && (
            <div style={{
              position: 'absolute',
              bottom: '50%', right: '74px',
              transform: 'translateY(50%)',
              background: isDark ? '#131e2e' : '#0d1b2a',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem', fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              animation: 'fadeIn 0.15s ease-out',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.1)'}`,
            }}>
              Fale conosco no WhatsApp
              <div style={{
                position: 'absolute', right: '-5px', top: '50%',
                transform: 'translateY(-50%)',
                width: 0, height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: `5px solid ${isDark ? '#131e2e' : '#0d1b2a'}`,
              }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;