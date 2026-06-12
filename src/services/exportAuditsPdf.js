import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAuditsPdf(audits) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("ASALLI Pilot - Rapport des audits", 14, 20);

  doc.setFontSize(10);
  doc.text(
    `Date d'édition : ${new Date().toLocaleDateString("fr-FR")}`,
    14,
    28
  );

  autoTable(doc, {
    startY: 35,
    head: [[
      "Norme",
      "Chapitre",
      "Auditeur",
      "Résultat",
      "Date"
    ]],
    body: audits.map((audit) => [
      audit.norme,
      audit.chapitre,
      audit.auditeur,
      audit.resultat,
      audit.date_audit,
    ]),
  });

  doc.save("Rapport_Audits_ASALLI_Pilot.pdf");
}