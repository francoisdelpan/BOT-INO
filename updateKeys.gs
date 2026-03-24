function updateAllKeycodes() {
  updateErrorKeys();
  updateCheckpointKeys();
  SpreadsheetApp.getUi().alert("✅ Tous les keycodes ont été actualisés !");
}

function updateErrorKeys() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_LIST);
  const data = sheet.getRange(RANGE_ERROR_TYPES + sheet.getLastRow()).getValues();

  const keyColumn = 8; // Colonne H (index)
  const outputRange = sheet.getRange(3, keyColumn, data.length);
  const keys = data.map(([payKey, label]) => [generateKey(payKey, label)]);

  outputRange.setValues(keys);

  // Protection légère (avertissement uniquement)
  const protectionRange = sheet.getRange("H3:H" + (data.length + 2));
  let protection = protectionRange.protect();
  protection.setDescription("Clés erreurs générées automatiquement");
  protection.setWarningOnly(true);
}

function updateCheckpointKeys() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_CHECKPOINT);
  const data = sheet.getRange(RANGE_CHECKPOINTS + sheet.getLastRow()).getValues();
  const keyColumn = 6; // Colonne F

  const keys = data.map(([etape, label]) => {
    const prefix = `CP${etape}`;
    const cpKey = generateKey(prefix, label);
    return [cpKey];
  });

  const outputRange = sheet.getRange(3, keyColumn, keys.length);
  outputRange.setValues(keys);

  const protectionRange = sheet.getRange("F3:F" + (keys.length + 2));
  const protection = protectionRange.protect();
  protection.setDescription("Clés CP générées automatiquement");
  protection.setWarningOnly(true);
}