// utils.gs

/**
 * Extrait l'ID Drive d'une URL
 * @param {string} url
 * @returns {Folder}
 */
function getFolderByUrl(url) {
  const id = url.match(/[-\w]{25,}/)[0];
  return DriveApp.getFolderById(id);
}

/**
 * Formatte un nombre sur 3 chiffres avec des zéros
 * @param {number} number
 * @returns {string}
 */
function padZero(number) {
  return String(number).padStart(3, '0');
}

/**
 * Génère un keycode pour une erreur ou un état à partir du libellé.
 * @param {string} payKey - Ex: "ESP", "CHQ"
 * @param {string} label - Libellé de l'erreur ou de l'état
 * @returns {string} - ex: "ESP_MANQUE_SIGNATURE"
 */
function generateKey(payKey, label) {
  if (!payKey || !label) return '';
  return payKey + '_' + label
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .replace(/\s+/g, '_')                            // remplace les espaces par _
    .replace(/[^A-Z0-9_]/gi, '')                     // supprime les caractères spéciaux
    .toUpperCase();
}

function showLoader(message = "Chargement...") {
  const loader = HtmlService.createHtmlOutput(`
    <div id="loaderOverlay" style="display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(255,255,255,0.85); z-index:9999; justify-content:center; align-items:center; flex-direction:column;">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <div class="mt-3 text-primary fw-bold">${message}</div>
    </div>
  `).setWidth(300).setHeight(150);
  SpreadsheetApp.getUi().showModalDialog(loader, "Chargement...");
}

function hideLoader() {
  SpreadsheetApp.getUi().alert("Chargement terminé !");
}