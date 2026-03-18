import React, { useContext, useEffect, useState } from "react";
import { makeStyles, alpha } from "@material-ui/core/styles";
import Modal           from "@material-ui/core/Modal";
import Backdrop        from "@material-ui/core/Backdrop";
import Fade            from "@material-ui/core/Fade";
import Table           from "@material-ui/core/Table";
import TableBody       from "@material-ui/core/TableBody";
import TableCell       from "@material-ui/core/TableCell";
import TableContainer  from "@material-ui/core/TableContainer";
import TableHead       from "@material-ui/core/TableHead";
import TableRow        from "@material-ui/core/TableRow";
import IconButton      from "@material-ui/core/IconButton";
import Box             from "@material-ui/core/Box";
import Typography      from "@material-ui/core/Typography";

import DeleteIcon  from "@material-ui/icons/Delete";
import CloseIcon   from "@material-ui/icons/Close";
import LabelIcon   from "@material-ui/icons/Label";

import api               from "../../services/api";
import { AuthContext }   from "../../context/Auth/AuthContext";

/* ─── Fontes globais ──────────────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
    .ctlm-root * { font-family: 'DM Sans', system-ui, sans-serif !important; }
    .ctlm-root ::-webkit-scrollbar { width: 5px; }
    .ctlm-root ::-webkit-scrollbar-track { background: transparent; }
    .ctlm-root ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.25); border-radius: 4px; }
    .ctlm-root ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.45); }
  `}</style>
);

const useStyles = makeStyles((theme) => {
  const isDark  = theme.palette.type === "dark";
  const primary = theme.palette.primary.main || "#2563eb";

  const surfaceBg   = isDark ? "#0f1929" : "#ffffff";
  const headerBg    = isDark ? "#0b1520" : "#f8fafc";
  const border      = isDark ? "rgba(255,255,255,0.065)" : "#e3eaf2";
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const textSecond  = isDark ? "#8fa4be" : "#3d5166";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";
  const rowHover    = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.018)";

  return {
    /* ── Modal overlay ── */
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(2),
    },

    /* ── Paper ── */
    paper: {
      backgroundColor: surfaceBg,
      backgroundImage: "none",
      borderRadius: 18,
      border: `1px solid ${border}`,
      boxShadow: isDark
        ? "0 24px 60px rgba(0,0,0,0.55)"
        : "0 24px 60px rgba(15,23,42,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 560,
      maxHeight: "80vh",
      outline: "none",
    },

    /* ── Cabeçalho limpo / corporativo ── */
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

    /* ── Tabela ── */
    tableContainer: {
      flex: "1 1 auto",
      overflowY: "auto",
      backgroundColor: surfaceBg,
    },
    tableHead: {
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
      "& .MuiTableCell-head": {
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: textMuted,
        borderBottom: `1px solid ${border}`,
        padding: theme.spacing(1.2, 2),
      },
    },
    tableRow: {
      transition: "background 0.12s",
      "&:hover": { backgroundColor: rowHover },
      "& .MuiTableCell-body": {
        fontSize: "0.83rem",
        color: textSecond,
        borderBottom: `1px solid ${border}`,
        padding: theme.spacing(1.2, 2),
      },
      "&:last-child .MuiTableCell-body": {
        borderBottom: "none",
      },
    },
    cellId: {
      fontSize: "0.75rem !important",
      color: `${textMuted} !important`,
      fontFamily: "'JetBrains Mono', monospace !important",
    },
    cellName: {
      fontWeight: "600 !important",
      color: `${textPrimary} !important`,
    },
    deleteButton: {
      width: 28, height: 28, borderRadius: 7, padding: 0,
      border: `1px solid ${border}`,
      color: textMuted,
      transition: "all 0.16s",
      "&:hover": {
        borderColor: alpha("#ef4444", 0.40),
        color: "#ef4444",
        backgroundColor: alpha("#ef4444", isDark ? 0.10 : 0.05),
      },
    },
  };
});

/* ══════════════════════════════════════════════════════════════════════════ */
const handleRemoveContactTag = async (contactId, tagId) => {
  await api.delete(`/tags-contacts/${tagId}/${contactId}`);
};

const ContactTagListModal = ({ open, onClose, tag }) => {
  const classes = useStyles();
  const [tagList, setTagList] = useState(tag.contacts);
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        if (data.tag.id === tag.id && data.tag?.contacts?.length > 0) {
          setTagList(data.tag.contacts);
        }
        if (data.tag.id === tag.id && data.tag?.contacts?.length === 0) {
          setTagList([]);
          onClose();
        }
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);
    return () => { socket.off(`company${user.companyId}-tag`, onCompanyTags); };
  }, []);

  if (!tagList.length) return <></>;

  return (
    <>
      <FontStyle />
      <Modal
        className={classes.modal}
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          style: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.35)" },
        }}
      >
        <Fade in={open}>
          <div className={`ctlm-root ${classes.paper}`}>

            {/* ── CABEÇALHO LIMPO ── */}
            <Box className={classes.titleBar}>
              <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Box className={classes.titleIcon}>
                    <LabelIcon style={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography className={classes.titleText}>
                      {tag.name}
                    </Typography>
                    <Typography className={classes.titleSub}>
                      Etiqueta · {tagList.length} contato{tagList.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Box>

                <IconButton size="small" onClick={onClose} className={classes.closeButton}>
                  <CloseIcon style={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            </Box>

            {/* ── TABELA ── */}
            <TableContainer className={classes.tableContainer}>
              <Table size="small" stickyHeader>
                <TableHead className={classes.tableHead}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Número</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tagList.map((contact) => (
                    <TableRow key={contact.id} className={classes.tableRow}>
                      <TableCell className={classes.cellId}>
                        #{contact.id}
                      </TableCell>
                      <TableCell className={classes.cellName}>
                        {contact.name}
                      </TableCell>
                      <TableCell>
                        {contact.number}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          className={classes.deleteButton}
                          onClick={() => handleRemoveContactTag(contact.id, tag.id)}
                        >
                          <DeleteIcon style={{ fontSize: 15 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </div>
        </Fade>
      </Modal>
    </>
  );
};

export default ContactTagListModal;