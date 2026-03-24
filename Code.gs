function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📟 BOT-INO")
    .addItem("➕ Ajouter une fin de poste", "showAddEndShiftDialog")
    //.addItem("💳 Dépouillement par moyen de paiement", "showPaymentProcessingDialog")
    //.addItem("👤 Dépouillement par personne", "showPaymentPersonDialog")
    .addSeparator()
    //.addItem("➕ Ajouter une journée de travail", "showAddEndShiftDialog")
    .addItem("🔄 Actualiser tous les keyCodes", "updateAllKeycodes")
    .addSeparator()
    .addItem("1️⃣ Etat des BR (désactivé)", "showBRExportDeprecatedDialog")
    .addItem("2️⃣ Etat des Chèques", "showChqExportDialog")
    .addItem("3️⃣ Etat du jour", "showDaysExportDialog")
    .addSeparator()
    .addItem("📶 Export des anomalies", "showAnomaliesExportDialog")
    .addToUi();
}

function showAddEndShiftDialog() {
  const html = HtmlService.createHtmlOutputFromFile("modalAddEndShift")
    .setWidth(900)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, "Ajouter une Fin de poste – Caisse centrale");
}

function showPaymentProcessingDialog() {
  const html = HtmlService.createHtmlOutputFromFile("modalPaymentProcessing")
    .setWidth(650)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, "Dépouillement par moyen de paiement");
}

function showPaymentPersonDialog() {
  const html = HtmlService.createHtmlOutputFromFile("modalPersonProcessing")
    .setWidth(650)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, "Dépouillement par personne");
}

function showBRExportDialog() {
  const html = HtmlService
    .createHtmlOutputFromFile('modalExportBr')
    .setWidth(680)
    .setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(html, 'Etat des BR');
}

function showBRExportDeprecatedDialog() {
  SpreadsheetApp.getUi().alert("Etat des BR désactivé. L'export est conservé dans le code mais n'est plus utilisé.");
}

function showChqExportDialog() {
  const html = HtmlService
    .createHtmlOutputFromFile('modalExportChq')
    .setWidth(680)
    .setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(html, 'Etat des Chèques');
}

function showDaysExportDialog() {
  const html = HtmlService
    .createHtmlOutputFromFile('modalExportDays')
    .setWidth(680)
    .setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(html, 'Etat du jour');
}

function showAnomaliesExportDialog() {
  const html = HtmlService
    .createHtmlOutputFromFile('modalExportAnomalies')
    .setWidth(600)
    .setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, 'Export des Anomalies');
}
