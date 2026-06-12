import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportDashboardPdf(data) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("ASALLI Pilot - Tableau de bord QSE", 14, 20);

  doc.setFontSize(10);
  doc.text(
    `Date d'édition : ${new Date().toLocaleDateString("fr-FR")}`,
    14,
    28
  );

  autoTable(doc, {
    startY: 38,
    head: [["Indicateur", "Valeur"]],
    body: [
      ["Utilisateurs", data.utilisateurs],
      ["Causeries SSE", data.causeries],
      ["Visites SSE", data.visites],
      ["REX", data.rex],
      ["Audits ISO", data.audits],
      ["Actions ouvertes", data.actionsOuvertes],
      ["Actions en cours", data.actionsEnCours],
      ["Actions clôturées", data.actionsCloturees],
      ["Actions en retard", data.actionsEnRetard],
      ["Audits ISO 9001", data.auditsIso9001],
      ["Audits ISO 14001", data.auditsIso14001],
      ["Audits ISO 45001", data.auditsIso45001],
    ],
  });

  doc.save("Dashboard_QSE_ASALLI_Pilot.pdf");
}