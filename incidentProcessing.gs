function loadIncidentFormLists() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheetList = ss.getSheetByName(SHEET_NAME_LIST);
  const sheetOps = ss.getSheetByName(SHEET_NAME_OPERATOR);

  // Moyens de paiement
  const lastRowList = sheetList.getLastRow();
  const paymentData = sheetList.getRange(RANGE_PAYMENT_MEANS + lastRowList).getValues().filter(r => r[0] && r[1]);
  const paymentMeans = paymentData.map(r => ({ key: r[0], label: r[1] }));

  // Caissières
  const lastRowOps = sheetOps.getLastRow();
  const operatorData = sheetOps.getRange(RANGE_OPERATORS + lastRowOps).getValues().filter(r => r[0]);
  const operators = operatorData.map(r => ({
    caisse: r[0],
    lastname: r[1],
    firstname: r[2],
    label: `${r[0]} - ${r[1]} ${r[2]}`.trim()
  }));

  // Types d'erreurs
  const errorData = sheetList.getRange(RANGE_ERROR_TYPES + lastRowList).getValues().filter(r => r[0] && r[1]);
  const errorTypes = errorData.map(r => ({
    payKey: r[0],
    label: r[1],
    key: `${r[0]}_${r[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_').toUpperCase()}`,
    explication: r[3] || ""
  }));

  // États
  const stateData = sheetList.getRange(RANGE_STATES + lastRowList).getValues().filter(r => r[0] && r[1]);
  const states = stateData.map(r => ({
    payKey: r[0],
    label: r[1],
    key: r[2],
    color: r[2] ? r[2] : "#000000",
    explication: r[3] || ""
  }));

  return {
    paymentMeans,
    operators,
    errorTypes,
    states
  };
}