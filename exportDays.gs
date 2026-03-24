/**
 * Exporte les Logs en PDF et les enregistre dans le dossier TMP.
 *
 * @param {string} from Date de début au format "YYYY-MM-DD"
 * @param {string=} to   Date de fin au format "YYYY-MM-DD" (optionnel)
 */
function exportDaysPDFBetweenDates(from, to) {
  const ss     = SpreadsheetApp.getActive();
  const daysData = ss.getSheetByName(SHEET_NAME_LOG).getDataRange().getValues();
  const folderDays = DriveApp.getFolderById(TMP_FOLDER_DAYS);

  // Codes AAAAMMJJ pour filtrage
  const fromCode = from.replace(/-/g, '');
  const toCode   = to ? to.replace(/-/g, '') : fromCode;

  // Filtrer & trier
  const rows = daysData
    .filter(r => r[0] >= fromCode && r[0] <= toCode)
    //.sort((a, b) => a[1] - b[1]);
    .sort((a, b) => {
      if (a[0] !== b[0]) return a[0] > b[0] ? 1 : -1;
      const numA = parseInt(a[3].split(' -')[0], 10);
      const numB = parseInt(b[3].split(' -')[0], 10);
      return numA - numB;
    });

  // 1) Créer / réinitialiser la feuille temporaire
  const TMP_NAME = 'TMP_DAYS_EXPORT';
  let tmp = ss.getSheetByName(TMP_NAME);
  if (tmp) ss.deleteSheet(tmp);
  tmp = ss.insertSheet(TMP_NAME);

  // 2) Titre et en-têtes
  const title = to
    ? `LOG du ${from} au ${to}`
    : `LOG du ${from}`;
  tmp.getRange(1, 1)
     .setValue(title)
     .setFontWeight('bold')
     .setFontSize(14);

  const totals = {endShiftNumber: 0, typeErrorNumber: 0, totalErrorNumber: 0};

  // 3) Corps de données
  const data = rows.map(r => {
    // r[0] peut être un Nombre, on le caste en string
    const code = String(r[0]).padStart(8, '0'); // s’assure qu’on a bien 8 caractères YYYYMMDD
    totals.endShiftNumber += 1;
    totals.typeErrorNumber += r[4];
    totals.totalErrorNumber += r[5];
    return [
      // JJ/MM/AAAA
      `${code.slice(6)}/${code.slice(4,6)}/${code.slice(0,4)}`,
      r[1].toString().replace(/\sGMT.*$/, ''),
      r[2], // supervisor
      r[3], // caisse
      Number(r[4]), // nbr d'erreur différentes
      Number(r[5]) // nbr total d'erreur
    ];
  });

  const headersTotals = ['', '', 'Totaux : ',totals.endShiftNumber, totals.typeErrorNumber, totals.totalErrorNumber];
  tmp.getRange(2, 1, 1, headersTotals.length)
     .setValues([headersTotals])
     .setFontWeight('bold');

  const headers = ['Date', "Horodatage", 'Superviseurs', 'Caisses', "Type d'erreur différentes", "Nombre total d'erreur"];
  tmp.getRange(3, 1, 1, headers.length)
     .setValues([headers])
     .setFontWeight('bold')
     .setWrap(true);
  tmp.setRowHeight(3, 40);
  
  if (data.length) {
    tmp.getRange(4, 1, data.length, headers.length).setValues(data);
  }

  // 4.1) Largeurs de colonnes
  const letterPixels = 6;
  let maxLen = headers[1].length;
  data.forEach(row => {
    maxLen = Math.max(maxLen, String(row[1]).length);
  });
  const colBWidth = maxLen * letterPixels;

  // Col A = 100px, Col B = dynamique, Col C→F = 100px
  tmp.setColumnWidth(1, 80);
  tmp.setColumnWidth(2, 180);
  tmp.setColumnWidth(3, 140);
  tmp.setColumnWidth(4, 220);
  tmp.setColumnWidths(5, headers.length - 2, 90);  // RETOUR A LA LIGNE

  // 4.3) Bordures et alignement
  const fullRange = tmp.getRange(3, 1, data.length + 1, headers.length);
  fullRange
    .setHorizontalAlignment('center')
    .setBorder(true, true, true, true, true, true);

  // 4.4) Zebra-striping (gris clair sur une ligne sur deux)
  const bgColors = [];
  for (let i = 0; i < data.length; i++) {
    // pour la i-ième ligne de données (start row = 3 dans la feuille),
    // on alterne : i even → blanc, i odd → gris clair
    bgColors.push(
      Array(headers.length).fill(i % 2
        ? '#e6e6e6'  // gris clair
        : '#ffffff'  // blanc
      )
    );
  }
  if (data.length) {
    tmp.getRange(4, 1, data.length, headers.length)
       .setBackgrounds(bgColors);
  }

  SpreadsheetApp.flush();
  // 5) Construire l’URL d’export PDF
  const urlBase = ss.getUrl().replace(/\/edit$/, '');
  const exportUrl =
    `${urlBase}/export?format=pdf&gid=${tmp.getSheetId()}` +
    `&portrait=true&size=A4` +
    `&sheetnames=false&printtitle=false&pagenumbers=true` +
    `&gridlines=false&fzr=false` +
    `&top_margin=0.5&bottom_margin=0.5&left_margin=0.5&right_margin=0.5`;

  // 6) Télécharger le PDF et créer le fichier dans Drive
  const oauthToken = ScriptApp.getOAuthToken();
  const response   = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: `Bearer ${oauthToken}` }
  });
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  const filename = `${stamp}_DAYS`;
  const blob = response.getBlob()
    .setName(`${filename}.pdf`);
  const fileTmpDays = folderDays.createFile(blob);

  // 7) Ouvrir le PDF dans un nouvel onglet
  const html = HtmlService.createHtmlOutput(`
    <script>
      window.open("${fileTmpDays.getUrl()}", "_blank");
      google.script.host.close();
    </script>
  `).setWidth(100).setHeight(50);
  SpreadsheetApp.getUi().showModalDialog(html, 'Export LOG terminé');

  // 8) Nettoyer la feuille temporaire
  ss.deleteSheet(tmp);
  return fileTmpDays.getUrl();
}