function submitBRData(brRows) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const name = SHEET_NAME_BR;
  let sheet  = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Entêtes A→G
    sheet.appendRow([
      "DateCodée", "Caisse", "MontantTicket", "TotalBR",
      "Reserve", "Ecart", "Nombre"
    ]);
  }
  // Vérifie que sheet n'est pas null
  if (!sheet) throw new Error("Impossible de créer ou trouver la feuille " + name);

  const values = brRows.map(r => [
    r.dateCode,
    r.caisse,
    r.ticketBR,
    r.sogec,
    r.scan,
    r.numeric,
    r.count
  ]);

  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length)
    .setValues(values);
}

function submitChqData(chqRows) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const name = SHEET_NAME_CHQ;
  let sheet  = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Entêtes A→E
    sheet.appendRow([
      "DateCodée", "Caisse", "TicketCHQ", "NbrCHQ",	"Manquant"
    ]);
  }
  // Vérifie que sheet n'est pas null
  if (!sheet) throw new Error("Impossible de créer ou trouver la feuille " + name);

  const values = chqRows.map(r => [
    r.dateCode,
    r.caisse,
    r.ticketChq,
    r.countedChq,
    r.missing
  ]);

  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length)
    .setValues(values);
}
