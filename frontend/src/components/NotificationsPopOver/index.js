import React, { useState, useRef, useEffect, useContext } from "react";
import { useTheme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";

import Popover    from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List       from "@material-ui/core/List";
import ListItem   from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Badge      from "@material-ui/core/Badge";
import { makeStyles } from "@material-ui/core/styles";

import ChatRoundedIcon  from "@material-ui/icons/ChatRounded";
import InboxRoundedIcon from "@material-ui/icons/InboxRounded";

import TicketListItem     from "../TicketListItem";
import useTickets         from "../../hooks/useTickets";
import { AuthContext }    from "../../context/Auth/AuthContext";
import { i18n }           from "../../translate/i18n";
import toastError         from "../../errors/toastError";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import Favicon            from "react-favicon";
import { getBackendUrl }  from "../../config";
import defaultLogoFavicon from "../../assets/favicon.ico";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { SOUND_MAP }      from "../../utils/notificationSounds";

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const useStyles = makeStyles((theme) => {
  const isDark   = theme.palette.type === "dark" || theme.mode === "dark";
  const menuBg     = isDark ? "#0e1521"                    : "#ffffff";
  const menuHeadBg = isDark ? "#080e17"                    : "#f8fafc";
  const menuHover  = isDark ? "rgba(255,255,255,0.06)"     : "#f8fafc";
  const border     = isDark ? "rgba(255,255,255,0.07)"     : "#e8edf4";
  const borderHov  = isDark ? "rgba(255,255,255,0.14)"     : "#cbd5e1";
  const textPri    = isDark ? "#e2e8f0"                    : "#0f172a";
  const shadow     = isDark
    ? "0 12px 40px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30)"
    : "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)";

  return {
    paper: {
      width: 360,
      borderRadius: "16px !important",
      border: `1px solid ${border} !important`,
      background: `${menuBg} !important`,
      boxShadow: `${shadow} !important`,
      overflow: "hidden !important",
      marginTop: 8,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 18px",
      borderBottom: `1px solid ${border}`,
      background: menuHeadBg,
    },
    headerIcon: {
      width: 38, height: 38, borderRadius: 11,
      background: "rgba(99,102,241,0.10)",
      border: "1px solid rgba(99,102,241,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#6366f1", flexShrink: 0,
      "& svg": { fontSize: "1.15rem !important" },
    },
    headerTitle: {
      fontSize: "0.875rem", fontWeight: 700, color: textPri,
      fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.2,
    },
    headerSub: {
      fontSize: "0.70rem", color: "#64748b",
      fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 1,
    },
    countBadge: {
      marginLeft: "auto",
      background: "rgba(99,102,241,0.10)",
      border: "1px solid rgba(99,102,241,0.20)",
      color: "#6366f1", fontSize: "0.68rem", fontWeight: 700,
      borderRadius: 20, padding: "2px 9px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    list: {
      maxHeight: 360, overflowY: "auto",
      padding: "8px !important",
      background: menuBg,
      "&::-webkit-scrollbar": { width: 3 },
      "&::-webkit-scrollbar-thumb": { background: "rgba(100,116,139,0.20)", borderRadius: 3 },
    },
    emptyWrap: {
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", gap: 10,
    },
    emptyIcon: {
      width: 44, height: 44, borderRadius: 12,
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(100,116,139,0.08)",
      border: `1px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8",
      "& svg": { fontSize: "1.3rem !important" },
    },
    emptyText: {
      fontSize: "0.82rem", color: "#64748b",
      fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500,
    },
  };
});

/* ── Componente ──────────────────────────────────────────────────────────── */
const NotificationsPopOver = ({ volume, notificationSound }) => {
  const classes = useStyles();
  const theme   = useTheme();
  const history = useHistory();

  const { user, socket }    = useContext(AuthContext);
  const { profile, queues } = user;
  const { setCurrentTicket, setTabOpen } = useContext(TicketsContext);

  const ticketIdUrl   = +history.location.pathname.split("/")[2];
  const ticketIdRef   = useRef(ticketIdUrl);
  const anchorEl      = useRef();
  const soundAlertRef = useRef();
  const historyRef    = useRef(history);

  const [isOpen,        setIsOpen]        = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showTicketWithoutQueue,   setShowTicketWithoutQueue]   = useState(false);
  const [showNotificationPending,  setShowNotificationPending]  = useState(false);
  const [showGroupNotification,    setShowGroupNotification]    = useState(false);
  const [, setDesktopNotifications] = useState([]);

  const { get: getSetting } = useCompanySettings();
  const { tickets }         = useTickets({ withUnreadMessages: "true" });
  const selectedSound       = SOUND_MAP[notificationSound] || SOUND_MAP.classic;

  /* settings */
  useEffect(() => {
    (async () => {
      try {
        const setting = await getSetting({ column: "showNotificationPending" });
        if (setting.showNotificationPending === true) setShowNotificationPending(true);
        if (user.allTicket === "enable")  setShowTicketWithoutQueue(true);
        if (user.allowGroup === true)     setShowGroupNotification(true);
      } catch (err) { toastError(err); }
    })();
  }, []);

  /* permission */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
  }, []);

  /* audio */
  useEffect(() => {
    const audio = new Audio(selectedSound);
    audio.preload = "auto";
    audio.volume  = Number(volume) || 1;
    soundAlertRef.current = audio;
    return () => audio.pause();
  }, [selectedSound, volume]);

  /* sync tickets */
  useEffect(() => { setNotifications(tickets); }, [tickets]);
  useEffect(() => { ticketIdRef.current = ticketIdUrl; }, [ticketIdUrl]);

  /* socket */
  useEffect(() => {
    if (!user.id) return;
    const companyId = user.companyId;

    const onConnect = () => socket.emit("joinNotification");
    if (socket.connected) socket.emit("joinNotification");

    const onTicket = (data) => {
      if (data.action === "updateUnread" || data.action === "delete") {
        setNotifications(prev => {
          const idx = prev.findIndex(t => t.id === data.ticketId);
          if (idx !== -1) { prev.splice(idx, 1); return [...prev]; }
          return prev;
        });
        setDesktopNotifications(prev => {
          const idx = prev.findIndex(n => n.tag === String(data.ticketId));
          if (idx !== -1) { prev[idx].close(); prev.splice(idx, 1); return [...prev]; }
          return prev;
        });
      }
    };

    const onMessage = (data) => {
      const queueMatchesUser = user?.queues?.some(q => String(q.id) === String(data.ticket?.queueId));
      const canAccess =
        String(profile).toLowerCase() === "admin" ||
        user?.allTicket === "enable" ||
        String(user?.allUserChat).toLowerCase() === "enabled" ||
        queueMatchesUser ||
        (!data.ticket?.queueId && showTicketWithoutQueue);

      if (
        data.action === "create" && !data.message.fromMe &&
        (data.ticket?.userId === user?.id || !data.ticket?.userId) &&
        canAccess &&
        (!["lgpd", "nps", "group"].includes(data.ticket?.status) ||
          (data.ticket?.status === "group" &&
           data.ticket?.whatsapp?.groupAsTicket === "enabled" &&
           showGroupNotification))
      ) {
        setNotifications(prev => {
          const idx = prev.findIndex(t => t.id === data.ticket.id);
          if (idx !== -1) { prev[idx] = data.ticket; return [...prev]; }
          return [data.ticket, ...prev];
        });

        if (soundAlertRef.current) {
          soundAlertRef.current.currentTime = 0;
          soundAlertRef.current.play().catch(() => {});
        }

        const shouldSkip =
          (data.message.ticketId === ticketIdRef.current && document.visibilityState === "visible") ||
          (data.ticket.userId && data.ticket.userId !== user?.id) ||
          (data.ticket.isGroup && data.ticket?.whatsapp?.groupAsTicket === "disabled" && !showGroupNotification);

        if (!shouldSkip) handleNotifications(data);
      }
    };

    socket.on("connect", onConnect);
    socket.on(`company-${companyId}-ticket`, onTicket);
    socket.on(`company-${companyId}-appMessage`, onMessage);

    return () => {
      socket.emit("leaveNotification");
      socket.off("connect", onConnect);
      socket.off(`company-${companyId}-ticket`, onTicket);
      socket.off(`company-${companyId}-appMessage`, onMessage);
    };
  }, [user, profile, queues, showTicketWithoutQueue, socket, showNotificationPending, showGroupNotification]);

  const handleNotifications = (data) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const { message, contact, ticket } = data;
    const notif = new Notification(
      `${i18n.t("tickets.notification.message")} ${contact.name}`,
      { body: `${message.body} - ${format(new Date(), "HH:mm")}`, icon: contact.urlPicture, tag: ticket.id, renotify: true }
    );
    notif.onclick = (e) => {
      e.preventDefault();
      window.focus();
      setTabOpen(ticket.status);
      historyRef.current.push(`/tickets/${ticket.uuid}`);
    };
    setDesktopNotifications(prev => {
      const idx = prev.findIndex(n => n.tag === notif.tag);
      if (idx !== -1) { prev[idx] = notif; return [...prev]; }
      return [notif, ...prev];
    });
  };

  const browserNotification = () => {
    const numbers = "⓿➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴";
    if (notifications.length > 0) {
      document.title = notifications.length < 21
        ? numbers[notifications.length] + " - " + (theme.appName || "...")
        : `(${notifications.length}) ${theme.appName || "..."}`;
    } else {
      document.title = theme.appName || "...";
    }
    return (
      <Favicon
        animated
        url={theme?.appLogoFavicon || defaultLogoFavicon}
        alertCount={notifications.length}
        iconSize={195}
      />
    );
  };

  const NotificationTicket = ({ children }) => (
    <div onClick={() => setIsOpen(false)}>{children}</div>
  );

  return (
    <>
      {browserNotification()}

      <IconButton
        onClick={() => setIsOpen(p => !p)}
        ref={anchorEl}
        aria-label="Notificações"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        <Badge overlap="rectangular" badgeContent={notifications.length} color="secondary">
          <ChatRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top",    horizontal: "right" }}
        classes={{ paper: classes.paper }}
        onClose={() => setIsOpen(false)}
      >
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerIcon}>
            <ChatRoundedIcon />
          </div>
          <div>
            <div className={classes.headerTitle}>Notificações</div>
            <div className={classes.headerSub}>Atendimentos com mensagens não lidas</div>
          </div>
          {notifications.length > 0 && (
            <span className={classes.countBadge}>{notifications.length}</span>
          )}
        </div>

        {/* Lista */}
        <List dense className={classes.list}>
          {notifications.length === 0 ? (
            <div className={classes.emptyWrap}>
              <div className={classes.emptyIcon}><InboxRoundedIcon /></div>
              <span className={classes.emptyText}>{i18n.t("notifications.noTickets")}</span>
            </div>
          ) : (
            notifications.map(ticket => (
              <NotificationTicket key={ticket.id}>
                <TicketListItem ticket={ticket} />
              </NotificationTicket>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsPopOver;