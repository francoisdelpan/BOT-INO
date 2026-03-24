function getSheetOrThrow(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Feuille introuvable : ${sheetName}`);
  }
  return sheet;
}

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function appendObjectsAsRows(sheetName, columns, rows) {
  if (!rows.length) return;

  const headers = columns.map(column => column.label);
  const sheet = getOrCreateSheet(sheetName, headers);
  const values = rows.map(row => columns.map(column => row[column.key]));
  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, columns.length)
    .setValues(values);
}

function getValues(range) {
  return SpreadsheetApp.getActiveSpreadsheet().getRange(range).getValues();
}

function getFilteredValues(range, predicate) {
  return getValues(range).filter(predicate);
}

function getCheckpointErrorToPayMap() {
  const listData = getFilteredValues(RANGE_ERROR_TYPES, row => row[0] && row[4]);
  return listData.reduce((acc, row) => {
    const payKey = String(row[0]).trim();
    const errorKey = String(row[4]).trim();
    acc[errorKey] = payKey;
    return acc;
  }, {});
}

function getCheckpointStepRows() {
  return getFilteredValues(RANGE_STEPS, row => row[0] && row[1]);
}

function getCheckpointRows() {
  return getFilteredValues(RANGE_CHECKPOINTS, row => row[0] && row[1]);
}

function getOperatorRows() {
  return getFilteredValues(`${RANGE_OPERATORS}${getSheetOrThrow(SHEET_NAME_OPERATOR).getLastRow()}`, row => row[0]);
}

function getSupervisorRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_SUPERVISOR);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
}

function appendIncidentRows(incidents) {
  appendObjectsAsRows(SHEET_NAME_INCIDENT, [
    { key: 'date', label: 'Date' },
    { key: 'payKey', label: 'PayKey' },
    { key: 'caisse', label: 'Caisse' },
    { key: 'error', label: 'Type Erreur' },
    { key: 'state', label: 'Etat' },
    { key: 'amount', label: 'Montant' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'note', label: 'Commentaire' }
  ], incidents);
}

function appendEndShiftLogRow(logEntry) {
  appendObjectsAsRows(SHEET_NAME_LOG, [
    { key: 'dateCode', label: 'DateCodée' },
    { key: 'createdAt', label: 'Horodatage' },
    { key: 'supervisor', label: 'Superviseur' },
    { key: 'caisse', label: 'Caisse' },
    { key: 'nbTypeError', label: 'NbTypeError' },
    { key: 'totalError', label: 'TotalError' }
  ], [logEntry]);
}

function appendBrRows(brRows) {
  appendObjectsAsRows(SHEET_NAME_BR, [
    { key: 'dateCode', label: 'DateCodée' },
    { key: 'caisse', label: 'Caisse' },
    { key: 'ticketBR', label: 'MontantTicket' },
    { key: 'sogec', label: 'TotalBR' },
    { key: 'scan', label: 'Reserve' },
    { key: 'numeric', label: 'Ecart' },
    { key: 'count', label: 'Nombre' }
  ], brRows);
}

function appendChqRows(chqRows) {
  appendObjectsAsRows(SHEET_NAME_CHQ, [
    { key: 'dateCode', label: 'DateCodée' },
    { key: 'caisse', label: 'Caisse' },
    { key: 'ticketChq', label: 'TicketCHQ' },
    { key: 'countedChq', label: 'NbrCHQ' },
    { key: 'missing', label: 'Manquant' }
  ], chqRows);
}
