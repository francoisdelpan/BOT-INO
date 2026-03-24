// config.gs

// 📂 Dossier principal pour enregistrer les images de checkpoint
const ROOT_FOLDER_URL = "https://drive.google.com/drive/folders/1ByaredU3Xxwbrp152kU36r83oc13VtPT";

// Feuilles & Portés
const SHEET_NAME_INCIDENT = "BASE DES INCIDENTS";
const RANGE_INCIDENT = SHEET_NAME_INCIDENT + "!A2:H";       // Col A: Date	/ B: PayKey / C: Caisse / D: Type Erreur / E: Etat / F: Montant / G: Quantité / H: Commentaire

const SHEET_NAME_LIST = "LISTES";
const RANGE_PAYMENT_MEANS = SHEET_NAME_LIST + "!A3:B";      // Col A: PAYKEY / Col B: Libellé
const RANGE_ERROR_TYPES = SHEET_NAME_LIST + "!D3:H";        // Col D: PAYKEY / E: Libellé / F: Criticités / G: Explications / H: errorKey
const RANGE_STATES = SHEET_NAME_LIST + "!J3:M";             // Col J: PAYKEY / K: Libellé / L: Couleurs / M: Explications

const SHEET_NAME_CHECKPOINT = "POINTS DE VERIFICATIONS";
const RANGE_STEPS = SHEET_NAME_CHECKPOINT + "!A3:B";        // Col A: Numéro / Col B: Libellé
const RANGE_CHECKPOINTS = SHEET_NAME_CHECKPOINT + "!D3:H";  // Col D: Etape / E : Instructions / F: cpKey / G: Actions / H: errorKey

const SHEET_NAME_OPERATOR = "OPERATEURS";
const RANGE_OPERATORS = SHEET_NAME_OPERATOR + "!A2:D";   // Col A: Numéro de caisson / B: Nom / C: Prénom / D: Date d'entrée

const SHEET_NAME_LOG = "LOG";

const SHEET_NAME_BR = "BR";

const SHEET_NAME_CHQ = "CHQ";

const SHEET_NAME_SUPERVISOR = "SUPERVISEURS";

const TMP_FOLDER_BR = "1EFOdB4T4XHzg4l-O0zuCHw-OFvoQP6fJ";
const TMP_FOLDER_ANOM = "1FlwxaJpRsthBM6aJ-yKd1o6xQ04U5qQC";
const TMP_FOLDER_CHQ = "1i5WGWHAP7gIplr35gfrCrT5nGSo8j8VN";
const TMP_FOLDER_DAYS = "13zQiFR2R_o4_FgIUFNsqLX249Z5PqA4a";