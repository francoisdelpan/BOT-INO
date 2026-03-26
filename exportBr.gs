/**
 * Exporte les Bons de Réduction en PDF et les enregistre dans le dossier TMP.
 *
 * @param {string} from Date de début au format "YYYY-MM-DD"
 * @param {string=} to   Date de fin au format "YYYY-MM-DD" (optionnel)
 */
function exportBRPDFBetweenDates(from, to) {
  const ss     = SpreadsheetApp.getActive();
  const brData = ss.getSheetByName(SHEET_NAME_BR).getDataRange().getValues();
  const folderBr = DriveApp.getFolderById(TMP_FOLDER_BR);

  // Codes AAAAMMJJ pour filtrage
  const fromCode = from.replace(/-/g, '');
  const toCode   = to ? to.replace(/-/g, '') : fromCode;

  // Filtrer & trier
  const rows = brData
    .filter(r => r[0] >= fromCode && r[0] <= toCode)
    //.sort((a, b) => a[1] - b[1]);
    .sort((a, b) => {
      if (a[0] !== b[0]) return a[0] > b[0] ? 1 : -1;
      const numA = parseInt(a[1].split(' -')[0], 10);
      const numB = parseInt(b[1].split(' -')[0], 10);
      return numA - numB;
    });

  // 1) Créer / réinitialiser la feuille temporaire
  const TMP_NAME = 'TMP_BR_EXPORT';
  let tmp = ss.getSheetByName(TMP_NAME);
  if (tmp) ss.deleteSheet(tmp);
  tmp = ss.insertSheet(TMP_NAME);

  // 2) Titre et en-têtes
  const title = to
    ? `BR du ${from} au ${to}`
    : `BR du ${from}`;
  tmp.getRange(1, 1)
     .setValue(title)
     .setFontWeight('bold')
     .setFontSize(14);

  const headers = ['Date','Caisse','Montant Ticket','Total BR','Ecart'];
  tmp.getRange(2, 1, 1, headers.length)
     .setValues([headers])
     .setFontWeight('bold');

  // 3) Corps de données
  const data = rows.map(r => {
    // r[0] peut être un Nombre, on le caste en string
    const code = String(r[0]).padStart(8, '0'); // s’assure qu’on a bien 8 caractères YYYYMMDD
    return [
      // JJ/MM/AAAA
      `${code.slice(6)}/${code.slice(4,6)}/${code.slice(0,4)}`,
      r[1], // caisse
      Number(r[2]), // montant ticket
      Number(r[3]), // total BR compte
      Number(r[5])  // ecart
    ];
  });
  if (data.length) {
    tmp.getRange(3, 1, data.length, headers.length).setValues(data);
  }

  // 4.1) Largeurs de colonnes
  const letterPixels = 9;
  let maxLen = headers[1].length;
  data.forEach(row => {
    maxLen = Math.max(maxLen, String(row[1]).length);
  });
  const colBWidth = maxLen * letterPixels;

  // Col A = 100px, Col B = dynamique, Col C→E = 100px
  tmp.setColumnWidth(1, 100);
  tmp.setColumnWidth(2, colBWidth);
  tmp.setColumnWidths(3, headers.length - 2, 100);

  // 4.2) Format monetaire sur Ticket / Total BR / Ecart
  if (data.length) {
    tmp.getRange(3, 3, data.length, 3)
      .setNumberFormat("0.00 €");
  }

  // 4.3) Bordures et alignement
  const fullRange = tmp.getRange(2, 1, data.length + 1, headers.length);
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
    tmp.getRange(3, 1, data.length, headers.length)
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
  const filename = `${stamp}_BR`;
  const blob = response.getBlob()
    .setName(`${filename}.pdf`);
  const fileTmpBr = folderBr.createFile(blob);

  // 7) Ouvrir le PDF dans un nouvel onglet
  const html = HtmlService.createHtmlOutput(`
    <script>
      window.open("${fileTmpBr.getUrl()}", "_blank");
      google.script.host.close();
    </script>
  `).setWidth(100).setHeight(50);
  SpreadsheetApp.getUi().showModalDialog(html, 'Export BR terminé');

  // 8) Nettoyer la feuille temporaire
  ss.deleteSheet(tmp);
  return fileTmpBr.getUrl();
}
