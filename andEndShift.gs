/**
 * Retourne à la fois les étapes + checkpoints,
 * la liste des opérateurs et la liste des états par payKey.
 */
function loadAddEndShiftData() {
  const cacheKey = 'loadAddEndShiftData:v1';
  const cached = getCachedJson(cacheKey);
  if (cached) {
    return cached;
  }

  const { steps } = loadCheckpointSteps();
  const { operators } = loadCheckpointOperators();
  const { states } = loadIncidentFormLists();
  const { supervisors } = loadSupervisors();

  // grouper par payKey
  const statesByPayKey = states.reduce((acc, s) => {
    if (!acc[s.payKey]) acc[s.payKey] = [];
    acc[s.payKey].push({ key: s.key, label: s.label, color: s.color });
    return acc;
  }, {});

  return putCachedJson(cacheKey, { steps, operators, statesByPayKey, supervisors }, 300);
}

function loadCheckpointSteps() {
  const errorToPay = getCheckpointErrorToPayMap();
  const stepRaw = getCheckpointStepRows();
  const cpRaw = getCheckpointRows();

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
  const operators = getOperatorRows().map(r => ({
    caisse: r[0],
    nom: r[1] || "",
    prenom: r[2] || "",
    label: `${r[0]} - ${r[1] || ""} ${r[2] || ""}`.trim()
  }));

  return { operators };
}

function loadSupervisors() {
  const supervisors = getSupervisorRows()
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
  appendEndShiftLogRow({
    dateCode: date.replace(/-/g, ''),
    createdAt: new Date(),
    supervisor,
    caisse,
    nbTypeError,
    totalError
  });
}

function submitIncidentData(dataArray) {
  appendIncidentRows(dataArray);
}

function submitEndShiftData({ date, supervisor, caisse, incidents }) {
  const rows = incidents || [];
  const totalError = rows.reduce((sum, row) => sum + (row.quantity || 0), 0);

  appendIncidentRows(rows);
  appendEndShiftLogRow({
    dateCode: date.replace(/-/g, ''),
    createdAt: new Date(),
    supervisor,
    caisse,
    nbTypeError: rows.length,
    totalError
  });

  return {
    incidentCount: rows.length,
    totalError
  };
}
