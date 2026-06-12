import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportActionsPdf(actions) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("ASALLI Pilot - Plan d'actions correctives", 14, 20);

  doc.setFontSize(10);
  doc.text(
    `Date d'édition : ${new Date().toLocaleDateString("fr-FR")}`,
    14,
    28
  );

  autoTable(doc, {
    startY: 35,
    head: [["Titre", "Responsable", "Statut", "Échéance"]],
    body: actions.map((action) => [
      action.titre,
      action.responsable,
      action.statut,
      action.echeance,
    ]),
  });

  doc.save("Plan_Actions_ASALLI_Pilot.pdf");
}