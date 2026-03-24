/**
 * @param {{from:string, to:string, errKeys:string[], caisse:string}} params
 * @return {string} URL du PDF
 */
function exportAnomaliesPDFBetweenDates(params) {
  const { from, to, errKeys, caisse } = params;
  const ss        = SpreadsheetApp.getActive();
  const sheetSrc     = ss.getSheetByName(SHEET_NAME_INCIDENT);
  if (!sheetSrc) throw new Error(`La feuille ${SHEET_NAME_INCIDENT} est introuvable.`);
  const data      = sheetSrc.getDataRange().getValues().slice(1); // skip header
  const folder    = DriveApp.getFolderById(TMP_FOLDER_ANOM);

  function toCode(val) {
    const date = val instanceof Date ? val : new Date(val);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd');
  }

  const fCode = from.replace(/-/g,''), 
        tCode = (to || from).replace(/-/g,'');
  //Logger.log(`fCode : ${fCode} / tCode : ${tCode}`);
  //Logger.log(`Err : ${String(errKeys)}`);
  const stringifyKeys = errKeys.map(e => e.errorKey);
  //Logger.log(stringifyKeys);

  // filtrage + tri
  const rows = data
    .filter(r => {
      //Logger.log(r);

      const code = toCode(r[0]);
      r[0] = toCode(r[0]);
      //Logger.log(`Code : ${code}`);
      if (code < fCode || code > tCode)        return false;

      //Logger.log(`Err : ${String(r[3])}`);
      //Logger.log(`err: ${stringifyKeys.indexOf(r[3])}`);
      if (errKeys.length && stringifyKeys.indexOf(String(r[3])) < 0) return false;
      
      //Logger.log(`Caisse : ${caisse} ; r[2]: ${r[2]} ---> ${caisse == String(r[2])}`);
      if (caisse && caisse !== String(r[2]))  return false;
      return true;
    })
    .sort((a, b) => {
      const da = toCode(a[0]), db = toCode(b[0]);
      if (da !== db) {
        return da > db ? 1 : -1;            // priorité n°1 : date
      }
      // priorité n°2 : erreur (string)
      if (a[3] !== b[3]) {
        return a[3] > b[3] ? 1 : -1;
      }
      // priorité n°3 : caisse (string)
      if (a[2] !== b[2]) {
        return a[2] > b[2] ? 1 : -1;
      }
      return 0;
    });

    // SORTING A TESTER.

  // 2) Création du nouveau classeur
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  const title = to
    ? `${stamp} Anomalies ${from}→${to}`
    : `${stamp} Anomalies ${from}`;

  const newSs = SpreadsheetApp.create(title);
  // déplacer dans le dossier TMP
  DriveApp.getFileById(newSs.getId()).moveTo(folder);

  const sheetTmp = newSs.getSheets()[0];
  sheetTmp.setName('Export Anomalies');

  // 3) En-tête
  sheetTmp.getRange(1,1)
       .setValue(to
          ? `Anomalies du ${from} au ${to}`
          : `Anomalies du ${from}`)
       .setFontWeight('bold')
       .setFontSize(14);
  const headers = ['Date','Erreur','Caisse','Montant (€)','Quantité'];
  sheetTmp.getRange(2,1,1,headers.length)
       .setValues([headers])
       .setFontWeight('bold');

  // 4) Corps
  const out = rows.map(r => {
    // formatter la date
    const Y    = r[0].slice(0, 4);
    const M    = r[0].slice(4, 6);
    const D    = r[0].slice(6, 8);
    return [
      `${D}/${M}/${Y}`,  // JJ/MM/AAAA
      r[3],              // errorKey
      r[2],              // caisse
      parseFloat(r[5]),  // montant
      parseInt(r[6]) || 0// quantité
    ];
  });
  if (out.length) {
    sheetTmp.getRange(3, 1, out.length, headers.length).setValues(out);
  }

  // 5) Mise en forme
  const full = sheetTmp.getRange(2,1,out.length+1,headers.length);
  full.setHorizontalAlignment('center')
      .setBorder(true,true,true,true,true,true);
  // alternance des lignes gris clair
  out.forEach((_,i) => {
    if (i % 2 === 0) {
      sheetTmp.getRange(3+i,1,1,headers.length)
           .setBackground('#CCCCCC');
    }
  });
  // format monétaire
  sheetTmp.getRange(3,4,out.length,1)
    .setNumberFormat('#,##0.00 €');
  
  /*
  // 6) Générer le PDF
  const urlBase  = ss.getUrl().replace(/\/edit$/, '');
  const exportUrl = `${urlBase}/export?format=pdf&gid=${tmp.getSheetId()}` +
    '&portrait=true&fitw=true&size=A4' +
    '&sheetnames=false&printtitle=false&pagenumbers=true' +
    '&gridlines=false&fzr=false' +
    '&top_margin=0.5&bottom_margin=0.5&left_margin=0.5&right_margin=0.5';

  const blob = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  }).getBlob()
    .setName(`${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss')}_Anomalies.pdf`);

  const file = folder.createFile(blob);*/

  // 7) Ouvrir et nettoyer
  const html = HtmlService
    .createHtmlOutput(`<script>
      window.open("${newSs.getUrl()}","_blank");
      google.script.host.close();
    </script>`)
    .setWidth(100)
    .setHeight(50);
  SpreadsheetApp.getUi().showModalDialog(html, 'Export Anomalies');

  return newSs.getUrl();
}

function test()
{

  const from    = '2025-05-25';
  const to      = '2025-05-27';
  const errKeys = [
    {
      payKey: 'BR',
      errorKey: 'BR_DATE_DEPASSEE',
      label: 'Test',
      desc: 'Test'
    },
    {
      payKey:'CAT',
      errorKey: 'CAT_INVERSION_AVEC_BR',
      label: 'Test',
      desc: 'Test'
    }
  ];
  const caisse  = '120 - LEGARDINIER EMY';
  return exportAnomaliesPDFBetweenDates({from, to, errKeys, caisse})
}
