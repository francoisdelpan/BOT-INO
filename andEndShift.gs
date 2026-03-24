/**
 * Retourne à la fois les étapes + checkpoints,
 * la liste des opérateurs et la liste des états par payKey.
 */
function loadAddEndShiftData() {
  const { steps } = loadCheckpointSteps();   // cp + étapes :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
  const { operators } = loadCheckpointOperators();
  const { states } = loadIncidentFormLists(); // états (flat) :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
  const { supervisors } = loadSupervisors();
  Logger.log(states);

  // grouper par payKey
  const statesByPayKey = states.reduce((acc, s) => {
    if (!acc[s.payKey]) acc[s.payKey] = [];
    acc[s.payKey].push({ key: s.key, label: s.label, color: s.color });
    return acc;
  }, {});

  Logger.log(statesByPayKey);
  return { steps, operators, statesByPayKey, supervisors };
}

function loadCheckpointSteps() {
  const ss         = SpreadsheetApp.getActiveSpreadsheet();
  const sheetCp    = ss.getSheetByName(SHEET_NAME_CHECKPOINT);
  const sheetList  = ss.getSheetByName(SHEET_NAME_LIST);

  // 1) Construire un mapping errorKey → payKey depuis LISTES (D3:H)
  const lastListRow = sheetList.getLastRow();
  const listData    = sheetList.getRange(RANGE_ERROR_TYPES).getValues().filter(r => r[0] && r[4]);
  const errorToPay = {};
  listData.forEach(r => {
    const payKey   = String(r[0]).trim();
    const errorKey = String(r[4]).trim();
    errorToPay[errorKey] = payKey;
  });

  // 2) Lire les étapes et les checkpoints
  const stepRaw = sheetCp.getRange(RANGE_STEPS).getValues().filter(r => r[0] && r[1]);
  const cpRaw   = sheetCp.getRange(RANGE_CHECKPOINTS).getValues().filter(r => r[0] && r[1]);

  // 3) Regrouper les checkpoints
  const cpByStep = {};
  cpRaw.forEach(row => {
    const stepNum   = row[0];
    const instruction= row[1];
    const cpKey     = row[2];
    const type      = row[3] || "TEX";
    const errorKey  = row[4] || "";

    // Récupérer le payKey associé via le mapping, ou fallback
    const payKey = errorToPay[errorKey] || (cpKey.includes("_") ? cpKey.split("_")[0] : cpKey);

    const cp = {
      instruction,
      cpKey,
      type,
      errorKey,
      payKey
    };

    if (!cpByStep[stepNum]) cpByStep[stepNum] = [];
    cpByStep[stepNum].push(cp);
  });

  // 4) Assembler les étapes
  const steps = stepRaw.map(([num, label]) => ({
    num,
    label,
    checkpoints: cpByStep[num] || []
  }));

  return { steps };
}

function loadCheckpointOperators() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_OPERATOR);
  const lastRow = sheet.getLastRow();

  const data = sheet.getRange(RANGE_OPERATORS + lastRow).getValues().filter(r => r[0]);

  const operators = data.map(r => ({
    caisse: r[0],
    nom: r[1] || "",
    prenom: r[2] || "",
    label: `${r[0]} - ${r[1] || ""} ${r[2] || ""}`.trim()
  }));

  return { operators };
}

function loadSupervisors() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_SUPERVISOR);
  if (!sheet) return { supervisors: [] };

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { supervisors: [] };

  // On lit de la ligne 2 à lastRow, colonnes A→C
  const data = sheet
    .getRange(2, 1, lastRow - 1, 3)
    .getValues();

  const supervisors = data
    .filter(r => r[1] && r[2])  // col B = NOM, col C = Prénom doivent exister
    .map(r => ({
      // on retourne "Prénom NOM"
      label: `${r[2].toString().trim()} ${r[1].toString().trim()}`
    }));

  return { supervisors };
}

/**
 * Lit les listes de la feuille LISTES et renvoie :
 * - paymentMeans, operators, errorTypes (existants)
 * - states : tableau flat { payKey, label, key, color, explication }
 */
/*function loadIncidentFormLists() {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const sheetList = ss.getSheetByName(SHEET_NAME_LIST);
  const lastRow   = sheetList.getLastRow();

  // J3:M → payKey / Libellé état / Couleur / Explication
  const stateData = sheetList
    .getRange(RANGE_STATES)
    .getValues()
    .filter(r => r[0] && r[1]);

  const states = stateData.map(r => ({
    payKey      : r[0],               // Col J
    label       : r[1],               // Col K
    // On génère la vraie clé à partir du libellé
    key         : r[1]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase(),
    color       : r[2] || '#000000',  // Col L
    explication : r[3] || ''          // Col M
  }));

  return {states};
}*/

/**
 * Log chaque fin de poste (avec ou sans incident)
 */
function logEndShift({ date, supervisor, caisse, nbTypeError, totalError }) {
  console.log(date);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_LOG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_LOG);
  }
  sheet.appendRow([date.replace(/-/g, ''), new Date(), supervisor, caisse, nbTypeError, totalError]);
}

function submitIncidentData(dataArray) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_INCIDENT);

  dataArray.forEach(incident => {
    sheet.appendRow([
      incident.date,
      incident.payKey,
      incident.caisse,
      incident.error,
      incident.state,
      incident.amount,
      incident.quantity,
      incident.note
    ]);
  });
}

