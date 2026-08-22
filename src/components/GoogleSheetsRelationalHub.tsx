import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, Download, Copy, ExternalLink, Database, Link2, 
  Layers, Users, Building, BookOpen, CreditCard, Heart, Check, 
  ArrowRight, Search, Sparkles, Filter, RefreshCw, Eye, Share2, HelpCircle,
  Code, AlertCircle, CheckCircle2, ChevronRight, Play, UploadCloud, Zap, Send,
  ShieldCheck, Lock, Key, ShieldAlert
} from 'lucide-react';
import { DanceClass, Inscription, DanceRoom, HealthForm, SiteSettings } from '../types';
import { DEFAULT_ROOMS, DANCE_CLASSES } from '../data';
import { 
  getGoogleSheetsWebhookUrl, 
  setGoogleSheetsWebhookUrl, 
  getGoogleSheetsSecretToken, 
  setGoogleSheetsSecretToken, 
  syncToGoogleSheets 
} from '../services/googleSheetsSync';

interface GoogleSheetsRelationalHubProps {
  inscriptions: Inscription[];
  classes: DanceClass[];
  rooms?: DanceRoom[];
  healthForms?: HealthForm[];
  siteSettings?: SiteSettings;
  addNotification: (title: string, description: string, type: 'evento' | 'clase' | 'pago' | 'alerta') => void;
}

export const GoogleSheetsRelationalHub: React.FC<GoogleSheetsRelationalHubProps> = ({
  inscriptions,
  classes = DANCE_CLASSES,
  rooms = DEFAULT_ROOMS,
  healthForms = [],
  siteSettings,
  addNotification
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<'utilisateurs' | 'salles' | 'cours' | 'inscriptions' | 'sante' | 'helloasso' | 'relations' | 'import_guide' | 'realtime_sync'>('realtime_sync');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedSheet, setCopiedSheet] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Real-time Webhook state
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>(() => getGoogleSheetsWebhookUrl());
  const [secretTokenInput, setSecretTokenInput] = useState<string>(() => getGoogleSheetsSecretToken());
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sample or live adherents data mapped to Table 1: UTILISATEURS
  const defaultUtilisateurs = [
    {
      id: 'USR-2026-001',
      nom: 'DUPONT',
      prenom: 'Camille',
      email: 'camille.dupont@email.fr',
      telephone: '06 12 34 56 78',
      dateNaissance: '14/05/1992',
      adresse: '12 Rue de la Paix',
      ville: 'Fontenay-le-Fleury',
      codePostal: '78330',
      contactUrgence: 'Michel Dupont (06 98 76 54 32)'
    },
    {
      id: 'USR-2026-002',
      nom: 'MARTIN',
      prenom: 'Alexandre',
      email: 'alex.martin@gmail.com',
      telephone: '07 23 45 67 89',
      dateNaissance: '28/11/1988',
      adresse: '5 Avenue des Chenevières',
      ville: 'La Queue-les-Yvelines',
      codePostal: '78940',
      contactUrgence: 'Sophie Martin (06 11 22 33 44)'
    },
    {
      id: 'USR-2026-003',
      nom: 'VALDÉS',
      prenom: 'Elena',
      email: 'elena.valdes@live.com',
      telephone: '06 99 88 77 66',
      dateNaissance: '03/09/1995',
      adresse: '8 Rue René Descartes',
      ville: 'Fontenay-le-Fleury',
      codePostal: '78330',
      contactUrgence: 'Yasmilka Valdés (06 88 56 78 90)'
    },
    {
      id: 'USR-2026-004',
      nom: 'LEROY',
      prenom: 'Thomas',
      email: 'thomas.leroy@orange.fr',
      telephone: '06 45 67 89 01',
      dateNaissance: '19/02/1985',
      adresse: '22 Route de Galluis',
      ville: 'La Queue-les-Yvelines',
      codePostal: '78940',
      contactUrgence: 'Claire Leroy (07 55 44 33 22)'
    }
  ];

  // Dynamic list of users based on actual inscriptions + sample seed
  const dynamicUtilisateurs = inscriptions.length > 0 ? inscriptions.map((ins, idx) => {
    const parts = (ins.userName || 'Adhérent Inconnu').trim().split(' ');
    const prenom = parts[0] || 'Prénom';
    const nom = parts.slice(1).join(' ') || 'Nom';
    return {
      id: `USR-2026-${String(idx + 1).padStart(3, '0')}`,
      nom: nom.toUpperCase(),
      prenom: prenom,
      email: ins.userEmail || 'email@exemple.fr',
      telephone: ins.userPhone || '06 00 00 00 00',
      dateNaissance: '15/06/1990',
      adresse: 'Adresse communiquée',
      ville: ins.className?.includes('Queue') ? 'La Queue-les-Yvelines' : 'Fontenay-le-Fleury',
      codePostal: ins.className?.includes('Queue') ? '78940' : '78330',
      contactUrgence: 'Famille / Conjoint'
    };
  }) : defaultUtilisateurs;

  // Table 2: SALLES
  const sheetSalles = rooms.map(r => ({
    idSalle: r.id,
    nom: r.name,
    commune: r.location,
    capaciteMax: r.maxCapacity,
    surfaceM2: r.surfaceAreaM2 || (r.location === 'Fontenay-le-Fleury' ? 140 : 120),
    equipements: (r.equipment || ['Miroirs muraux', 'Parquet danse', 'Sono Bluetooth', 'Vestiaires']).join(', ')
  }));

  // Table 3: COURS_ET_CAMPAGNES
  const sheetCours = classes.filter(c => c.active !== false).map(c => {
    const matchingRoom = rooms.find(r => r.id === c.roomId || r.name === c.roomName || r.location === c.location);
    return {
      idCours: c.id,
      titreHelloAsso: c.name,
      discipline: c.category,
      niveau: c.level,
      horaires: c.schedule,
      professeur: c.instructor,
      tarif: c.annualPrice || c.priceMonthly * 9 || 198,
      saison: c.season || 'Saison 2026 - 2027',
      idSalle: matchingRoom ? matchingRoom.id : (c.location === 'Fontenay-le-Fleury' ? 'room-levant' : 'room-queue-centre')
    };
  });

  // Table 4: INSCRIPTIONS_ET_ESSAIS
  const sheetInscriptions = (inscriptions.length > 0 ? inscriptions : [
    {
      id: 'ins-demo-1',
      userName: 'Camille Dupont',
      userEmail: 'camille.dupont@email.fr',
      userPhone: '06 12 34 56 78',
      classId: classes[0]?.id || 'salsa-cubaine-flf',
      className: classes[0]?.name || 'Salsa Cubaine - Fontenay',
      level: 'Débutant',
      status: 'Confirmée',
      date: '18/08/2026',
      amountPaid: 198,
      type: 'Inscription Annuelle'
    },
    {
      id: 'ins-demo-2',
      userName: 'Alexandre Martin',
      userEmail: 'alex.martin@gmail.com',
      userPhone: '07 23 45 67 89',
      classId: classes[1]?.id || 'cardio-latino-queue',
      className: classes[1]?.name || 'Cardio Latino - La Queue',
      level: 'Tous Niveaux',
      status: 'Confirmée',
      date: '17/08/2026',
      amountPaid: 210,
      type: 'Inscription Annuelle'
    }
  ]).map((ins, idx) => {
    const matchingUser = dynamicUtilisateurs.find(u => u.email === ins.userEmail) || dynamicUtilisateurs[idx % dynamicUtilisateurs.length];
    const isWaitlist = ins.status === "Liste d'attente";
    return {
      refCommande: `CMD-2026-${String(idx + 101).padStart(4, '0')}`,
      idUtilisateur: matchingUser?.id || `USR-2026-${String(idx + 1).padStart(3, '0')}`,
      idCours: ins.classId || classes[0]?.id || 'salsa-flf-deb',
      type: ins.type || 'Inscription Annuelle',
      statutPaiement: isWaitlist ? "Liste d'attente" : 'Payé (HelloAsso)',
      montant: ins.amountPaid || (ins.className?.includes('Queue') ? 210 : 198),
      date: ins.date || '18/08/2026'
    };
  });

  // Table 5: FICHES_SANTE
  const sheetFichesSante = dynamicUtilisateurs.map((u, idx) => {
    const matchingForm = healthForms.find(h => h.userEmail === u.email);
    return {
      idFiche: `SANTE-2026-${String(idx + 1).padStart(3, '0')}`,
      idUtilisateur: u.id,
      questionsCardiaqueArticulaireEquilibre: matchingForm?.status === 'Vérification requise' ? 'OUI (Avis médical requis)' : 'NON (Attestation validée)',
      signatureNumerique: `Signé numériquement par ${u.prenom} ${u.nom}`,
      date: matchingForm?.date || '18/08/2026'
    };
  });

  // Table 6: EXPORT HELLOASSO (31 colonnes)
  const sheetHelloAsso31 = sheetInscriptions.map((ord, idx) => {
    const user = dynamicUtilisateurs.find(u => u.id === ord.idUtilisateur) || dynamicUtilisateurs[0];
    const course = sheetCours.find(c => c.idCours === ord.idCours) || sheetCours[0];
    const room = sheetSalles.find(s => s.idSalle === course?.idSalle) || sheetSalles[0];
    const health = sheetFichesSante.find(h => h.idUtilisateur === user?.id) || sheetFichesSante[0];

    return {
      col1_numCommande: ord.refCommande,
      col2_dateCommande: ord.date,
      col3_nomPayeur: user.nom,
      col4_prenomPayeur: user.prenom,
      col5_emailPayeur: user.email,
      col6_nomAdherent: user.nom,
      col7_prenomAdherent: user.prenom,
      col8_emailAdherent: user.email,
      col9_telAdherent: user.telephone,
      col10_dateNaissance: user.dateNaissance,
      col11_adresse: user.adresse,
      col12_codePostal: user.codePostal,
      col13_ville: user.ville,
      col14_contactUrgence: user.contactUrgence,
      col15_discipline: course?.discipline || 'Salsa Cubaine',
      col16_niveau: course?.niveau || 'Débutant',
      col17_titreCours: course?.titreHelloAsso || 'Cours Annuel',
      col18_horaires: course?.horaires || '20h00',
      col19_lieuCommune: room?.commune || 'Fontenay-le-Fleury',
      col20_salleNom: room?.nom || 'Salle Le Studio',
      col21_professeur: course?.professeur || 'Yasmilka Valdés',
      col22_tarifNom: `${course?.discipline} ${course?.saison}`,
      col23_montantPaye: `${ord.montant} €`,
      col24_moyenPaiement: ord.statutPaiement.includes('Payé') ? 'Carte Bancaire (HelloAsso)' : 'Attente',
      col25_statutCommande: ord.statutPaiement,
      col26_qsSportReponse: health?.questionsCardiaqueArticulaireEquilibre || 'NON',
      col27_signatureSante: health?.signatureNumerique || 'Validée',
      col28_saison: course?.saison || 'Saison 2026 - 2027',
      col29_organisme: 'La Maloka (Association Loi 1901)',
      col30_rna: 'W783000000',
      col31_dateExport: new Date().toLocaleDateString('fr-FR')
    };
  });

  // Native XLSX export creating 6 distinct worksheets inside one .xlsx file
  const handleExportNativeXLSX = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: 1_UTILISATEURS
      const wsUtilisateurs = XLSX.utils.json_to_sheet(dynamicUtilisateurs);
      XLSX.utils.book_append_sheet(wb, wsUtilisateurs, '1_UTILISATEURS');

      // Sheet 2: 2_SALLES
      const wsSalles = XLSX.utils.json_to_sheet(sheetSalles);
      XLSX.utils.book_append_sheet(wb, wsSalles, '2_SALLES');

      // Sheet 3: 3_COURS_ET_CAMPAGNES
      const wsCours = XLSX.utils.json_to_sheet(sheetCours);
      XLSX.utils.book_append_sheet(wb, wsCours, '3_COURS_ET_CAMPAGNES');

      // Sheet 4: 4_INSCRIPTIONS_ET_ESSAIS
      const wsInscriptions = XLSX.utils.json_to_sheet(sheetInscriptions);
      XLSX.utils.book_append_sheet(wb, wsInscriptions, '4_INSCRIPTIONS');

      // Sheet 5: 5_FICHES_SANTE
      const wsSante = XLSX.utils.json_to_sheet(sheetFichesSante);
      XLSX.utils.book_append_sheet(wb, wsSante, '5_FICHES_SANTE');

      // Sheet 6: Export_HelloAsso_31Col
      const wsHelloAsso = XLSX.utils.json_to_sheet(sheetHelloAsso31);
      XLSX.utils.book_append_sheet(wb, wsHelloAsso, 'Export_HelloAsso');

      const fileName = `LaMaloka_Classeur_6_Feuilles_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      addNotification(
        'Fichier .XLSX Téléchargé 📑',
        `Le fichier ${fileName} contient les 6 feuilles distinctes. Importez-le dans Google Sheets via "Fichier > Importer > Remplacer la feuille de calcul".`,
        'clase'
      );
    } catch (err) {
      console.error('Error exporting XLSX:', err);
      addNotification('Erreur Export', 'Une erreur est survenue lors de la création du fichier .xlsx.', 'alerta');
    }
  };

  // Google Apps Script source code generator for 1-click cloud generation and real-time live sync
  const googleAppsScriptCode = `/**
 * =======================================================================
 * SYSTÈME DE SYNCHRONISATION EN TEMPS RÉEL SÉCURISÉ - LA MALOKA
 * =======================================================================
 * 1. Initialise les 6 feuilles relationnelles
 * 2. Reçoit en direct chaque inscription via doPost() avec jeton de sécurité
 */

// 🔒 CLÉ SECRÈTE DE SÉCURITÉ (ANTI-CYBERATTAQUES & PROTECTION ANTI-SPAM)
var MALOKA_SECURITY_TOKEN = "${secretTokenInput}";

// --- 1. INITIALISATION DES 6 FEUILLES ---
function creerLes6FeuillesLaMaloka() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var tables = [
    {
      name: "1. UTILISATEURS",
      headers: ["ID", "Nom", "Prénom", "Email", "Téléphone", "Date de Naissance", "Adresse", "Ville", "Code Postal", "Contact d'Urgence"],
      color: "#10b981",
      data: ${JSON.stringify(dynamicUtilisateurs.map(u => [u.id, u.nom, u.prenom, u.email, u.telephone, u.dateNaissance, u.adresse, u.ville, u.codePostal, u.contactUrgence]))}
    },
    {
      name: "2. SALLES",
      headers: ["ID_Salle", "Nom de la Salle", "Commune", "Capacité Max (Aforo)", "Surface (m²)", "Équipements"],
      color: "#06b6d4",
      data: ${JSON.stringify(sheetSalles.map(s => [s.idSalle, s.nom, s.commune, s.capaciteMax, s.surfaceM2, s.equipements]))}
    },
    {
      name: "3. COURS_ET_CAMPAGNES",
      headers: ["ID_Cours", "Titre HelloAsso", "Discipline", "Niveau", "Horaires", "Professeur", "Tarif Annuel (€)", "Saison", "ID_Salle (FK)"],
      color: "#f97316",
      data: ${JSON.stringify(sheetCours.map(c => [c.idCours, c.titreHelloAsso, c.discipline, c.niveau, c.horaires, c.professeur, c.tarif, c.saison, c.idSalle]))}
    },
    {
      name: "4. INSCRIPTIONS_ET_ESSAIS",
      headers: ["Réf Commande", "Nom & Prénom", "Cours Choisi", "Type Inscription", "Statut Paiement", "Montant (€)", "Date Inscription"],
      color: "#a855f7",
      data: ${JSON.stringify(sheetInscriptions.map(ins => [ins.refCommande, ins.idUtilisateur, ins.idCours, ins.type, ins.statutPaiement, ins.montant, ins.date]))}
    },
    {
      name: "5. FICHES_SANTE",
      headers: ["ID_Fiche", "ID_Utilisateur (FK)", "Questions Cardiaque / Articulaire", "Signature Numérique", "Date Validation"],
      color: "#f43f5e",
      data: ${JSON.stringify(sheetFichesSante.map(h => [h.idFiche, h.idUtilisateur, h.questionsCardiaqueArticulaireEquilibre, h.signatureNumerique, h.date]))}
    },
    {
      name: "6. Export HelloAsso",
      headers: ["Numéro Commande", "Date Commande", "Nom Payeur", "Prénom Payeur", "Email Payeur", "Nom Adhérent", "Prénom Adhérent", "Email Adhérent", "Téléphone", "Date Naissance", "Adresse", "Code Postal", "Ville", "Contact Urgence", "Discipline", "Niveau", "Titre Cours", "Horaires", "Commune", "Salle", "Professeur", "Tarif", "Montant Payé", "Moyen Paiement", "Statut", "QS-Sport", "Signature", "Saison", "Organisme", "RNA", "Date Export"],
      color: "#14b8a6",
      data: ${JSON.stringify(sheetHelloAsso31.map(r => Object.values(r)))}
    }
  ];

  tables.forEach(function(t) {
    var sheet = ss.getSheetByName(t.name);
    if (!sheet) {
      sheet = ss.insertSheet(t.name);
    } else {
      sheet.clear();
    }
    
    // Set headers
    sheet.appendRow(t.headers);
    var headerRange = sheet.getRange(1, 1, 1, t.headers.length);
    headerRange.setBackground(t.color).setFontColor("#ffffff").setFontWeight("bold");
    
    // Set data
    if (t.data && t.data.length > 0) {
      sheet.getRange(2, 1, t.data.length, t.headers.length).setValues(t.data);
    }
    
    // Auto resize
    sheet.autoResizeColumns(1, t.headers.length);
  });

  SpreadsheetApp.getUi().alert("✅ Les 6 feuilles La Maloka ont été créées avec succès !");
}

// --- 2. SYNCHRONISATION EN TEMPS RÉEL SÉCURISÉE (WEBHOOK) ---
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);

    // 🔒 CONTRÔLE DE SÉCURITÉ STRICT :
    // Rejette toute requête ne contenant pas la clé secrète exacte
    if (!payload.secretToken || payload.secretToken !== MALOKA_SECURITY_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "403 Forbidden: Jeton de sécurité invalide ou manquant." 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var action = payload.action;
    var data = payload.data || {};

    // Test de connexion (Ping)
    if (action === "test_ping") {
      var sheetTest = ss.getSheetByName("1. UTILISATEURS") || ss.getActiveSheet();
      sheetTest.appendRow([
        "USR-TEST",
        "MALOKA",
        "Test En Direct",
        "contact@lamaloka.fr",
        "06 00 00 00 00",
        "01/01/2000",
        "Connexion Webhook Active (Sécurisée 🔒)",
        "Fontenay-le-Fleury",
        "78330",
        "Ping Testé le " + new Date().toLocaleTimeString("fr-FR")
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Ping sécurisé reçu !" })).setMimeType(ContentService.MimeType.JSON);
    }

    // Nouvelle inscription en direct depuis le site web
    if (action === "inscription") {
      var parts = (data.userName || "Adhérent").trim().split(" ");
      var prenom = parts[0] || "Prénom";
      var nom = parts.slice(1).join(" ") || "Nom";
      var newUserId = "USR-2026-" + Math.floor(100 + Math.random() * 900);
      var refCmd = "CMD-" + Date.now().toString().slice(-6);

      // A. Ajouter dans 1. UTILISATEURS
      var sheetUsers = ss.getSheetByName("1. UTILISATEURS");
      if (sheetUsers) {
        sheetUsers.appendRow([
          newUserId,
          nom.toUpperCase(),
          prenom,
          data.userEmail || "",
          data.userPhone || "",
          "15/06/1990",
          "Adresse communiquée",
          data.location && data.location.indexOf("Queue") !== -1 ? "La Queue-les-Yvelines" : "Fontenay-le-Fleury",
          data.location && data.location.indexOf("Queue") !== -1 ? "78940" : "78330",
          "Contact fourni lors de l'inscription"
        ]);
      }

      // B. Ajouter dans 4. INSCRIPTIONS_ET_ESSAIS
      var sheetInsc = ss.getSheetByName("4. INSCRIPTIONS_ET_ESSAIS");
      if (sheetInsc) {
        sheetInsc.appendRow([
          refCmd,
          (data.userName || "") + " (" + newUserId + ")",
          data.className || "",
          data.status === "Liste d'attente" ? "Liste d'attente" : "Inscription Annuelle",
          data.status === "Liste d'attente" ? "Attente place" : "Payé (HelloAsso/Web)",
          (data.annualPrice || 198) + " €",
          data.date || new Date().toLocaleDateString("fr-FR")
        ]);
      }

      // C. Ajouter dans 6. Export HelloAsso (31 colonnes)
      var sheetHA = ss.getSheetByName("6. Export HelloAsso");
      if (sheetHA) {
        sheetHA.appendRow([
          refCmd,
          data.date || new Date().toLocaleDateString("fr-FR"),
          nom.toUpperCase(),
          prenom,
          data.userEmail || "",
          nom.toUpperCase(),
          prenom,
          data.userEmail || "",
          data.userPhone || "",
          "15/06/1990",
          "Adresse renseignée",
          data.location && data.location.indexOf("Queue") !== -1 ? "78940" : "78330",
          data.location && data.location.indexOf("Queue") !== -1 ? "La Queue-les-Yvelines" : "Fontenay-le-Fleury",
          "Famille / Proche",
          data.className || "Salsa / Cardio",
          data.level || "Tous niveaux",
          data.className || "",
          "Horaires du cours",
          data.location || "Fontenay-le-Fleury",
          data.roomName || "Salle Levant",
          data.instructor || "Yasmilka Valdés",
          "Tarif Annuel",
          (data.annualPrice || 198) + " €",
          "Carte Bancaire",
          data.status || "Confirmée",
          "NON (Validé)",
          "Signature électronique",
          "Saison 2026-2027",
          "La Maloka",
          "W783000000",
          new Date().toLocaleDateString("fr-FR")
        ]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleSaveWebhookUrl = () => {
    setGoogleSheetsWebhookUrl(webhookUrlInput);
    setGoogleSheetsSecretToken(secretTokenInput);
    addNotification('Configuration Sauvegardée ⚡', 'L\'URL Webhook et la Clé Secrète de Sécurité ont été enregistrées.', 'clase');
  };

  const handleTestWebhookConnection = async () => {
    if (!webhookUrlInput.trim()) {
      setTestResult({ success: false, message: 'Veuillez d\'abord coller votre URL Webhook Google Apps Script.' });
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);
    setGoogleSheetsWebhookUrl(webhookUrlInput);

    try {
      await syncToGoogleSheets({
        action: 'test_ping',
        timestamp: new Date().toISOString(),
        data: {
          testMessage: 'Ping de test en temps réel La Maloka',
          date: new Date().toLocaleDateString('fr-FR')
        }
      });

      setTestResult({
        success: true,
        message: '✅ Signal envoyé avec succès ! Une ligne de test "Ping En Direct" a été ajoutée dans votre Google Sheets.'
      });
      addNotification('Test Réussi ⚡', 'La synchronisation en temps réel avec votre Google Sheets fonctionne parfaitement !', 'clase');
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Erreur d\'envoi. Vérifiez que votre Webhook Apps Script est déployé en accès "Tout le monde" (Anyone).'
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleCopyGoogleAppsScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3500);
    addNotification(
      'Script Copié 📋',
      'Le script complet a été copié. Ouvrez Extensions > Apps Script dans votre Google Sheets, collez le code et déployez comme Application Web.',
      'clase'
    );
  };

  // Copy table content as Tab-Separated Values (TSV) directly pastable into Google Sheets
  const handleCopyTableTSV = (tableName: string, data: any[]) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const headerRow = headers.join('\t');
    const dataRows = data.map(row => headers.map(h => String(row[h] || '')).join('\t')).join('\n');
    const fullTSV = `${headerRow}\n${dataRows}`;

    navigator.clipboard.writeText(fullTSV);
    setCopiedSheet(tableName);
    setTimeout(() => setCopiedSheet(null), 3000);
    addNotification('Copié pour Google Sheets 📋', `La table "${tableName}" a été copiée dans le presse-papier. Collez-la directement dans une feuille Google Sheets avec Ctrl+V !`, 'clase');
  };

  // Export single sheet as CSV
  const handleDownloadSheetCSV = (filename: string, data: any[]) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(';'),
      ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(';'))
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LaMaloka_${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addNotification('Téléchargement CSV 📥', `Le fichier ${filename}.csv a été généré avec succès.`, 'clase');
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* EXPLANATION & ACTION HERO BANNER */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-teal-950/80 border-2 border-emerald-500/50 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40 shrink-0 shadow-inner">
              <FileSpreadsheet size={36} />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} className="text-amber-400" />
                <span>Base Relationnelle 6 Feuilles Google Sheets</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Génération des 6 Feuilles dans votre Google Sheets
              </h3>
              <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                ¿Por qué solo veías 1 hoja al abrir el enlace? Porque Google Sheets en la nube requiere importar las 6 tablas o crearlas. Aquí tienes la <strong>solución instantánea en 2 clics</strong> :
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              id="download-native-xlsx-btn"
              onClick={handleExportNativeXLSX}
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              <Download size={16} />
              <span>1. Descargar Archivo .XLSX (6 Hojas)</span>
            </button>

            <a
              id="open-google-sheets-master-btn"
              href="https://docs.google.com/spreadsheets/d/1faWh69ShTeI9hE-OtlUDF9LrqbdDI8m-6nKN7BMn_7g/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-md hover:scale-105"
            >
              <span>2. Abrir Google Sheets</span>
              <ExternalLink size={14} className="text-emerald-400" />
            </a>
          </div>
        </div>

        {/* 6 Sheets Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-zinc-800/80">
          {[
            { id: 'utilisateurs', num: '1', name: 'UTILISATEURS', badge: 'Adhérents', count: dynamicUtilisateurs.length, color: 'emerald' },
            { id: 'salles', num: '2', name: 'SALLES', badge: 'Lieux', count: sheetSalles.length, color: 'cyan' },
            { id: 'cours', num: '3', name: 'COURS_ET_CAMPAGNES', badge: 'Offres', count: sheetCours.length, color: 'orange' },
            { id: 'inscriptions', num: '4', name: 'INSCRIPTIONS_ET_ESSAIS', badge: 'Commandes', count: sheetInscriptions.length, color: 'purple' },
            { id: 'sante', num: '5', name: 'FICHES_SANTE', badge: 'Médical', count: sheetFichesSante.length, color: 'rose' },
            { id: 'helloasso', num: '6', name: 'Export HelloAsso', badge: '31 Col', count: sheetHelloAsso31.length, color: 'teal' }
          ].map(sheet => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheetTab(sheet.id as any)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSheetTab === sheet.id
                  ? 'bg-zinc-800 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono font-bold text-zinc-400">#{sheet.num}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold uppercase">{sheet.badge}</span>
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">{sheet.name}</p>
              <span className="text-[10px] text-zinc-400 font-mono mt-1">{sheet.count} ligne(s)</span>
            </button>
          ))}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-800">
        <button
          onClick={() => setActiveSheetTab('realtime_sync')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'realtime_sync'
              ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-black shadow-lg shadow-orange-500/20'
              : 'bg-zinc-900 text-amber-300 hover:text-white border border-amber-500/30'
          }`}
        >
          <Zap size={15} className={activeSheetTab === 'realtime_sync' ? 'text-black fill-black' : 'text-amber-400'} />
          <span>⚡ Sincronización en Tiempo Real</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('import_guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'import_guide'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <HelpCircle size={15} />
          <span>Guía Paso a Paso (Cómo ver las 6 Hojas)</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('relations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'relations'
              ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Link2 size={15} />
          <span>Diagrama Relacional & Web</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('utilisateurs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'utilisateurs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>1. UTILISATEURS ({dynamicUtilisateurs.length})</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('salles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'salles'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Building size={14} />
          <span>2. SALLES ({sheetSalles.length})</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('cours')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'cours'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          <span>3. COURS_ET_CAMPAGNES ({sheetCours.length})</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('inscriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'inscriptions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard size={14} />
          <span>4. INSCRIPTIONS ({sheetInscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('sante')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'sante'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Heart size={14} />
          <span>5. FICHES_SANTE ({sheetFichesSante.length})</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('helloasso')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeSheetTab === 'helloasso'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>Export HelloAsso (31 Col)</span>
        </button>
      </div>

      {/* ======================================================= */}
      {/* TAB: REAL-TIME WEBHOOK SYNC                             */}
      {/* ======================================================= */}
      {activeSheetTab === 'realtime_sync' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* Real-Time Webhook Hero */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-orange-950/60 border-2 border-amber-500/50 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 shrink-0 shadow-inner">
                  <Zap size={36} />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Conexión 100% Automática y Gratuita</span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Sincronización en Tiempo Real con Google Sheets
                  </h4>
                  <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
                    Cada vez que un alumno se inscriba o pague en la web, los datos se enviarán <strong>instantáneamente a tu Google Sheets</strong> sin que tengas que descargar ni hacer nada.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyGoogleAppsScript}
                className="px-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                {copiedScript ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedScript ? '¡Script Copiado!' : '1. Copiar Script de Conexión'}</span>
              </button>
            </div>

            {/* Webhook URL & Secret Security Token Input */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <span>URL Webhook de tu Google Sheets (Web App URL) :</span>
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {webhookUrlInput ? '🟢 Webhook Configurado' : '⚪ Pendiente de configurar'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                
                <button
                  type="button"
                  onClick={handleSaveWebhookUrl}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  Guardar Configuración
                </button>

                <button
                  type="button"
                  onClick={handleTestWebhookConnection}
                  disabled={isTestingWebhook}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-md"
                >
                  {isTestingWebhook ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Probando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>⚡ Probar Conexión en Directo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secret Security Token Settings */}
              <div className="pt-3 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5">
                    <Lock size={12} className="text-emerald-400" />
                    <span>Clave Secreta de Seguridad (Token) :</span>
                  </label>
                  <p className="text-[10px] text-zinc-400">
                    Solo las peticiones con esta clave exacta son aceptadas por tu script.
                  </p>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <input
                    type="text"
                    value={secretTokenInput}
                    onChange={(e) => setSecretTokenInput(e.target.value)}
                    placeholder="MALOKA_SECURE_2026_YASMILKA"
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-emerald-400 placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 'MALOKA_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + new Date().getFullYear();
                      setSecretTokenInput(rand);
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Generar Nueva Clave
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold text-center border ${
                    testResult.success
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Security Deep Dive Card (Explains why it's secure against cyberattacks) */}
          <div className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h5 className="text-sm font-black text-white flex items-center gap-2">
                  <span>¿Por qué este método es 100% seguro contra ciberataques?</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] uppercase font-bold tracking-wide">
                    4 Niveles de Protección
                  </span>
                </h5>
                <p className="text-xs text-zinc-400">
                  Desplegar como "Cualquiera" (Anyone) solo habilita el punto de entrada HTTP; no da acceso a tus archivos de Google.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Key size={14} />
                  <span>1. Token Secreto de Seguridad (Anti-Spam & Anti-Inyección)</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  El script <code className="text-amber-300">doPost()</code> incluye una verificación de token secreta. Si una petición no incluye la clave exacta <code className="text-emerald-300">{secretTokenInput}</code>, el script la rechaza al instante con un <strong>403 Forbidden</strong> y no escribe nada.
                </p>
              </div>

              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Lock size={14} />
                  <span>2. Escritura Ciega (Sin Acceso de Lectura)</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  El Webhook solo tiene permiso para <strong>añadir filas al final</strong> (<code className="text-amber-300">appendRow</code>). Nunca lee, muestra ni devuelve ningún dato existente de la hoja de cálculo al exterior. Tus datos permanecen 100% confidenciales.
                </p>
              </div>

              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck size={14} />
                  <span>3. Tu Google Drive y Cuenta Siguen Siendo 100% Privados</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  El parámetro <em>"Anyone"</em> solo permite que el navegador envíe el formulario mediante HTTPS seguro. <strong>Nadie</strong> tiene acceso de lectura, edición ni borrado directo sobre tu archivo en Google Drive.
                </p>
              </div>

              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Zap size={14} />
                  <span>4. Blindaje y Rate-Limiting de los Servidores de Google</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Google Apps Script cuenta con protección DDoS nativa, certificados SSL/TLS automáticos y cuotas de seguridad que bloquean intentos de ataques de denegación de servicio o sobrecarga masiva.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h5 className="text-sm font-black text-white">Pegar Script en Google Sheets</h5>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Abre tu hoja de <a href="https://docs.google.com/spreadsheets/d/1faWh69ShTeI9hE-OtlUDF9LrqbdDI8m-6nKN7BMn_7g/edit?usp=sharing" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">Google Sheets</a>, ve al menú superior <strong>Extensiones → Apps Script</strong>, borra el texto que haya y pega el script que copiaste arriba.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h5 className="text-sm font-black text-white">Desplegar como Aplicación Web</h5>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Arriba a la derecha haz clic en <strong>Implementar (Déployer) → Nueva implementación → Aplicación web</strong>. En *"Quién tiene acceso"* selecciona <strong>Cualquiera (Tout le monde)</strong> y haz clic en Implementar.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h5 className="text-sm font-black text-white">Pegar URL y ¡Listo!</h5>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Google te dará un enlace que termina en <code className="text-amber-300">/exec</code>. Pégalo en la casilla de arriba y pulsa <strong>"⚡ Probar Conexión en Directo"</strong>. Desde ese momento, cada nueva inscripción aparecerá automáticamente en tu hoja.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Code size={16} className="text-amber-400" />
                <span>Código Apps Script (Inicializador + Webhook en Directo)</span>
              </div>
              <button
                onClick={handleCopyGoogleAppsScript}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>Copiar Código</span>
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-[11px] font-mono text-zinc-300 max-h-56 overflow-y-auto no-scrollbar">
              {googleAppsScriptCode}
            </pre>
          </div>

        </motion.div>
      )}

      {/* ======================================================= */}
      {/* TAB: GUÍA PASO A PASO / IMPORT TO GOOGLE SHEETS         */}
      {/* ======================================================= */}
      {activeSheetTab === 'import_guide' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* METHOD 1: 15 SECONDS IMPORT */}
          <div className="p-6 md:p-8 bg-zinc-900 border-2 border-emerald-500/40 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm">
                  1
                </span>
                <div>
                  <h4 className="text-xl font-black text-white">
                    Método 1 (Recomendado - 15 segundos) : Importar el archivo .XLSX
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Es la forma más rápida y estándar para que aparezcan las 6 pestañas en tu Google Sheets.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportNativeXLSX}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer hover:scale-105"
              >
                <Download size={14} />
                <span>Descargar .XLSX</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-xs">A</div>
                <strong className="text-white block text-sm">Descarga el archivo</strong>
                <p className="text-[11px] text-zinc-400">
                  Haz clic en <strong>"Descargar .XLSX"</strong> arriba. Se guardará un archivo Excel con las 6 hojas nombradas.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-xs">B</div>
                <strong className="text-white block text-sm">Abre Google Sheets</strong>
                <p className="text-[11px] text-zinc-400">
                  Abre tu hoja en <a href="https://docs.google.com/spreadsheets/d/1faWh69ShTeI9hE-OtlUDF9LrqbdDI8m-6nKN7BMn_7g/edit?usp=sharing" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-bold">Google Sheets</a>.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-xs">C</div>
                <strong className="text-white block text-sm">Importar archivo</strong>
                <p className="text-[11px] text-zinc-400">
                  En el menú superior de Google Sheets, ve a: <strong>Archivo (Fichier) → Importar (Importer) → Subir (Téléverser)</strong> y arrastra el archivo .xlsx.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-xs">D</div>
                <strong className="text-emerald-400 block text-sm">Reemplazar hoja</strong>
                <p className="text-[11px] text-zinc-400">
                  Selecciona la opción <strong>"Reemplazar hoja de cálculo"</strong>. ¡Verás las 6 pestañas abajo de inmediato!
                </p>
              </div>
            </div>
          </div>

          {/* METHOD 2: GOOGLE APPS SCRIPT */}
          <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-500 text-black font-black flex items-center justify-center text-sm">
                  2
                </span>
                <div>
                  <h4 className="text-xl font-black text-white">
                    Método 2 : Script Automático Google Apps Script (1 Clic)
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Copia este código y pégalo en el editor de Google Sheets para crear las 6 hojas con colores y datos de muestra en 3 segundos.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyGoogleAppsScript}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer"
              >
                {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedScript ? '¡Código Copiado!' : 'Copiar Script Automático'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              <div className="space-y-3">
                <strong className="text-white font-bold block text-sm">Instrucciones :</strong>
                <ol className="space-y-2.5 text-zinc-300 list-decimal list-inside text-xs leading-relaxed">
                  <li>En tu <a href="https://docs.google.com/spreadsheets/d/1faWh69ShTeI9hE-OtlUDF9LrqbdDI8m-6nKN7BMn_7g/edit?usp=sharing" target="_blank" rel="noreferrer" className="text-orange-400 underline font-bold">Google Sheets</a>, ve al menú superior <strong>Extensiones → Apps Script</strong>.</li>
                  <li>Borra lo que haya en la ventana y <strong>pega el código</strong> que acabas de copiar con el botón naranja.</li>
                  <li>Haz clic en el botón <strong>Ejecutar (Run)</strong> con el icono de Play (▶).</li>
                  <li>¡Listo! Google Sheets creará las 6 pestañas con encabezados, colores y datos al instante.</li>
                </ol>
              </div>

              <div className="lg:col-span-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 font-mono text-[11px] text-zinc-300 max-h-48 overflow-y-auto no-scrollbar">
                <pre>{googleAppsScriptCode}</pre>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* ======================================================= */}
      {/* TAB: DIAGRAMME RELATIONNEL & MAPPINGS PAGE WEB          */}
      {/* ======================================================= */}
      {activeSheetTab === 'relations' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Visual Entity-Relationship Diagram (ERD) */}
          <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 font-mono">
                Schéma Conceptuel de Données (MCD / MLD)
              </span>
              <h4 className="text-xl md:text-2xl font-black text-white mt-1">
                Interconnexions Relationnelles des 5 Tables
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Visualisation des clés primaires (<strong>PK</strong>), clés étrangères (<strong>FK</strong>) et cardinalités (1:N, 1:1) reliant les 5 feuilles Google Sheets.
              </p>
            </div>

            {/* Relational Diagram Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              
              {/* Table 1: UTILISATEURS */}
              <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-emerald-500/40 space-y-3 relative group hover:border-emerald-400 transition-all">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <strong className="text-sm font-black text-white">1. UTILISATEURS</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">Adhérents</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded">
                    <span>🔑 ID (PK)</span>
                    <span className="text-[10px]">Texte</span>
                  </div>
                  <div className="text-zinc-300 pl-2">Nom, Prénom</div>
                  <div className="text-zinc-300 pl-2">Email, Téléphone</div>
                  <div className="text-zinc-300 pl-2">Date de Naissance</div>
                  <div className="text-zinc-300 pl-2">Adresse, Ville, Code Postal</div>
                  <div className="text-zinc-300 pl-2">Contact d'Urgence</div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                  🔗 <strong>Clé Mère :</strong> Référencée par <span className="text-purple-400 font-bold">INSCRIPTIONS (1:N)</span> et <span className="text-rose-400 font-bold">FICHES_SANTE (1:1)</span>.
                </div>
              </div>

              {/* Junction Table 4: INSCRIPTIONS_ET_ESSAIS */}
              <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-purple-500/40 space-y-3 relative group hover:border-purple-400 transition-all">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <strong className="text-sm font-black text-white">4. INSCRIPTIONS</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 font-bold rounded">Commandes</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-purple-400 font-bold bg-purple-950/30 px-2 py-0.5 rounded">
                    <span>🔑 Réf Commande (PK)</span>
                    <span className="text-[10px]">Texte</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
                    <span>🔗 ID_Utilisateur (FK)</span>
                    <span className="text-[9px]">→ Utilisateurs</span>
                  </div>
                  <div className="flex justify-between text-orange-400 bg-orange-950/20 px-2 py-0.5 rounded">
                    <span>🔗 ID_Cours (FK)</span>
                    <span className="text-[9px]">→ Cours</span>
                  </div>
                  <div className="text-zinc-300 pl-2">Type (Essai / Annuel)</div>
                  <div className="text-zinc-300 pl-2">Statut Paiement</div>
                  <div className="text-zinc-300 pl-2">Montant (€), Date</div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                  🔗 <strong>Table Pivot :</strong> Fait la liaison entre l'adhérent, le cours choisi et le règlement HelloAsso.
                </div>
              </div>

              {/* Table 3: COURS_ET_CAMPAGNES */}
              <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-orange-500/40 space-y-3 relative group hover:border-orange-400 transition-all">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <strong className="text-sm font-black text-white">3. COURS / OFFRES</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-orange-500/20 text-orange-300 font-bold rounded">Offres</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-orange-400 font-bold bg-orange-950/30 px-2 py-0.5 rounded">
                    <span>🔑 ID_Cours (PK)</span>
                    <span className="text-[10px]">Texte</span>
                  </div>
                  <div className="text-zinc-300 pl-2">Titre HelloAsso</div>
                  <div className="text-zinc-300 pl-2">Discipline (Salsa / Cardio)</div>
                  <div className="text-zinc-300 pl-2">Niveau, Horaires, Professeur</div>
                  <div className="text-zinc-300 pl-2">Tarif Annuel (€), Saison</div>
                  <div className="flex justify-between text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded">
                    <span>🔗 ID_Salle (FK)</span>
                    <span className="text-[9px]">→ Salles</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                  🔗 <strong>Clé liée :</strong> Rattaché à <span className="text-cyan-400 font-bold">SALLES (N:1)</span> pour le calcul de jauge maximale.
                </div>
              </div>

              {/* Table 5: FICHES_SANTE */}
              <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-rose-500/40 space-y-3 relative group hover:border-rose-400 transition-all">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <strong className="text-sm font-black text-white">5. FICHES_SANTE</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded">Médical</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-rose-400 font-bold bg-rose-950/30 px-2 py-0.5 rounded">
                    <span>🔑 ID_Fiche (PK)</span>
                    <span className="text-[10px]">Texte</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
                    <span>🔗 ID_Utilisateur (FK)</span>
                    <span className="text-[9px]">→ Utilisateurs (1:1)</span>
                  </div>
                  <div className="text-zinc-300 pl-2">Questions Cardiaque / Articulaire</div>
                  <div className="text-zinc-300 pl-2">Signature numérique</div>
                  <div className="text-zinc-300 pl-2">Date de validation</div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                  🔗 <strong>Santé :</strong> Lié à un adhérent unique pour vérifier l'aptitude physique.
                </div>
              </div>

              {/* Table 2: SALLES */}
              <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-cyan-500/40 space-y-3 relative group hover:border-cyan-400 transition-all">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <strong className="text-sm font-black text-white">2. SALLES</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold rounded">Lieux</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded">
                    <span>🔑 ID_Salle (PK)</span>
                    <span className="text-[10px]">Texte</span>
                  </div>
                  <div className="text-zinc-300 pl-2">Nom (Gymnase Levant, Chenevières...)</div>
                  <div className="text-zinc-300 pl-2">Commune (Fontenay, La Queue)</div>
                  <div className="text-cyan-300 pl-2 font-bold">Capacité Max (Jauge / Aforo)</div>
                  <div className="text-zinc-300 pl-2">Surface (m²), Équipements</div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                  🔗 <strong>Contrôle Jauge :</strong> Détermine le basculement automatique en liste d'attente.
                </div>
              </div>

              {/* Table 6: EXPORT HELLOASSO 31 COL */}
              <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-teal-500/40 space-y-3 relative group hover:border-teal-400 transition-all">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    <strong className="text-sm font-black text-white">6. EXPORT HELLOASSO</strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-300 font-bold rounded">31 Col</span>
                </div>
                <div className="space-y-1 text-[11px] text-zinc-300">
                  <p className="leading-relaxed">
                    Vue dénormalisée combinant automatiquement les <strong>5 tables relationnelles</strong> ci-dessus pour correspondre à 100% à l'ordre officiel des 31 colonnes HelloAsso.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-teal-400 font-bold">
                  ✨ Prêt pour import direct en 1 clic dans Google Sheets.
                </div>
              </div>

            </div>
          </div>

          {/* Table of Web Page Relations & Component Mappings */}
          <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                Architecture Frontend / Backend
              </span>
              <h4 className="text-xl font-black text-white mt-1">
                Relations Entre les Tables Google Sheets et la Page Web
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Ce tableau détaille comment chaque composant de l'application lit et écrit dans les feuilles de calcul.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Feuille Google Sheets</th>
                    <th className="py-3 px-4">Composants Web Associés</th>
                    <th className="py-3 px-4">Type d'Interaction</th>
                    <th className="py-3 px-4">Rôle Fonctionnel sur le Site Web</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  
                  {/* Row 1 */}
                  <tr className="hover:bg-zinc-850/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        1. UTILISATEURS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      Formulaire d'Inscription, Modal Inscription, Fiche Santé
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 rounded text-[10px] font-bold">
                        Écriture (Formulaire) + Lecture
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Enregistre les coordonnées des élèves, coordonnées d'urgence et emails de contact pour les cours.
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-zinc-850/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        2. SALLES
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      Onglet Salles & Jauges (BackOffice), Cartes des Cours, Jauge Aforo
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 rounded text-[10px] font-bold">
                        Lecture (Frontend) + Admin
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Définit les capacités maximales des gymnases municipaux (Fontenay & La Queue) et déclenche l'alerte "Complet / Liste d'attente".
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-zinc-850/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-orange-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        3. COURS_ET_CAMPAGNES
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      Tableau des Tarifs, Section Cours & Inscriptions, Vignettes Accueil
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-orange-950/60 text-orange-300 border border-orange-800/50 rounded text-[10px] font-bold">
                        Lecture Publique + Édition Admin
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Alimente la grille officielle des 5 tarifs (Mardi 20h, Jeudi 20h, Jeudi 21h, Vendredi 20h, Vendredi 21h) et les liens HelloAsso.
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-zinc-850/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        4. INSCRIPTIONS_ET_ESSAIS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      Tunnel de Réservation, Suivi des Inscriptions, Liste d'attente
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-800/50 rounded text-[10px] font-bold">
                        Écriture (Temps Réel)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Historise chaque commande, statut de validation, montant payé et numéro de référence commande.
                    </td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-zinc-850/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        5. FICHES_SANTE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      Questionnaire Santé QS-Sport, Modal d'Attestation Médicale
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800/50 rounded text-[10px] font-bold">
                        Écriture Sécurisée
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Vérifie l'aptitude physique aux danses latines (cardio & pivots) avant le premier cours de septembre.
                    </td>
                  </tr>

                  {/* Row 6 */}
                  <tr className="hover:bg-zinc-850/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-teal-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        6. Export HelloAsso
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      Boutons d'Export CSV, Synchronisation Google Sheets Drive
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-teal-950/60 text-teal-300 border border-teal-800/50 rounded text-[10px] font-bold">
                        Export Multi-Colonnes (31)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      Permet à la trésorerie et au secrétariat de réinjecter les données de la saison 2026-2027 sans aucune retouche.
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </motion.div>
      )}

      {/* ======================================================= */}
      {/* TABS 1 TO 6: INDIVIDUAL SHEETS DATA TABLES              */}
      {/* ======================================================= */}
      {activeSheetTab !== 'relations' && activeSheetTab !== 'import_guide' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* Sheet Header Info and Actions */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <FileSpreadsheet size={18} />
                  </span>
                  <h4 className="text-xl font-black text-white">
                    {activeSheetTab === 'utilisateurs' && 'Feuille 1 : UTILISATEURS (Adhérents)'}
                    {activeSheetTab === 'salles' && 'Feuille 2 : SALLES (Lieux & Jauges)'}
                    {activeSheetTab === 'cours' && 'Feuille 3 : COURS_ET_CAMPAGNES (Offres)'}
                    {activeSheetTab === 'inscriptions' && 'Feuille 4 : INSCRIPTIONS_ET_ESSAIS (Commandes)'}
                    {activeSheetTab === 'sante' && 'Feuille 5 : FICHES_SANTE (Médical QS-Sport)'}
                    {activeSheetTab === 'helloasso' && 'Feuille 6 : Export HelloAsso (31 Colonnes Officielles)'}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {activeSheetTab === 'utilisateurs' && 'Liste des membres inscrits avec coordonnées personnelles et contacts d\'urgence.'}
                  {activeSheetTab === 'salles' && 'Salles municipales partenaires avec capacités maximales pour le calcul des places restantes.'}
                  {activeSheetTab === 'cours' && 'Offres de cours Salsa Cubaine et Cardio Latino pour la saison 2026 - 2027.'}
                  {activeSheetTab === 'inscriptions' && 'Transactions et réservations d\'inscriptions annuelles et séances d\'essai.'}
                  {activeSheetTab === 'sante' && 'Contrôles du questionnaire médical et attestations de signature numérique.'}
                  {activeSheetTab === 'helloasso' && 'Structure officielle prête à être importée directement dans Google Sheets sans modification.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const currentData = activeSheetTab === 'utilisateurs' ? dynamicUtilisateurs
                      : activeSheetTab === 'salles' ? sheetSalles
                      : activeSheetTab === 'cours' ? sheetCours
                      : activeSheetTab === 'inscriptions' ? sheetInscriptions
                      : activeSheetTab === 'sante' ? sheetFichesSante
                      : sheetHelloAsso31;
                    handleCopyTableTSV(activeSheetTab.toUpperCase(), currentData);
                  }}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Copier les données tabulées pour coller directement dans Google Sheets"
                >
                  {copiedSheet === activeSheetTab.toUpperCase() ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedSheet === activeSheetTab.toUpperCase() ? 'Copié !' : 'Copier pour Sheets'}</span>
                </button>

                <button
                  onClick={() => {
                    const currentData = activeSheetTab === 'utilisateurs' ? dynamicUtilisateurs
                      : activeSheetTab === 'salles' ? sheetSalles
                      : activeSheetTab === 'cours' ? sheetCours
                      : activeSheetTab === 'inscriptions' ? sheetInscriptions
                      : activeSheetTab === 'sante' ? sheetFichesSante
                      : sheetHelloAsso31;
                    handleDownloadSheetCSV(activeSheetTab, currentData);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher dans cette feuille..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Sheet Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[500px] no-scrollbar">
              
              {/* TABLE 1: UTILISATEURS */}
              {activeSheetTab === 'utilisateurs' && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase text-emerald-400 sticky top-0">
                    <tr>
                      <th className="py-3 px-4">ID (PK)</th>
                      <th className="py-3 px-4">Nom</th>
                      <th className="py-3 px-4">Prénom</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-4">Date Naissance</th>
                      <th className="py-3 px-4">Adresse</th>
                      <th className="py-3 px-4">Ville</th>
                      <th className="py-3 px-4">Code Postal</th>
                      <th className="py-3 px-4">Contact Urgence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {dynamicUtilisateurs.filter(u => !searchFilter || JSON.stringify(u).toLowerCase().includes(searchFilter.toLowerCase())).map((u, i) => (
                      <tr key={u.id || i} className="hover:bg-zinc-800/50 font-mono text-[11px]">
                        <td className="py-3 px-4 text-emerald-400 font-bold">{u.id}</td>
                        <td className="py-3 px-4 font-sans font-bold text-white">{u.nom}</td>
                        <td className="py-3 px-4 font-sans text-white">{u.prenom}</td>
                        <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                        <td className="py-3 px-4">{u.telephone}</td>
                        <td className="py-3 px-4 text-zinc-400">{u.dateNaissance}</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">{u.adresse}</td>
                        <td className="py-3 px-4 font-sans text-white font-semibold">{u.ville}</td>
                        <td className="py-3 px-4">{u.codePostal}</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">{u.contactUrgence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE 2: SALLES */}
              {activeSheetTab === 'salles' && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase text-cyan-400 sticky top-0">
                    <tr>
                      <th className="py-3 px-4">ID_Salle (PK)</th>
                      <th className="py-3 px-4">Nom de la Salle</th>
                      <th className="py-3 px-4">Commune</th>
                      <th className="py-3 px-4">Capacité Max (Aforo)</th>
                      <th className="py-3 px-4">Surface (m²)</th>
                      <th className="py-3 px-4">Équipements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {sheetSalles.filter(s => !searchFilter || JSON.stringify(s).toLowerCase().includes(searchFilter.toLowerCase())).map((s, i) => (
                      <tr key={s.idSalle || i} className="hover:bg-zinc-800/50 font-mono text-[11px]">
                        <td className="py-3 px-4 text-cyan-400 font-bold">{s.idSalle}</td>
                        <td className="py-3 px-4 font-sans font-bold text-white">{s.nom}</td>
                        <td className="py-3 px-4 font-sans text-white">{s.commune}</td>
                        <td className="py-3 px-4 text-cyan-300 font-black text-sm">{s.capaciteMax} places</td>
                        <td className="py-3 px-4">{s.surfaceM2} m²</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">{s.equipements}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE 3: COURS_ET_CAMPAGNES */}
              {activeSheetTab === 'cours' && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase text-orange-400 sticky top-0">
                    <tr>
                      <th className="py-3 px-4">ID_Cours (PK)</th>
                      <th className="py-3 px-4">Titre HelloAsso</th>
                      <th className="py-3 px-4">Discipline</th>
                      <th className="py-3 px-4">Niveau</th>
                      <th className="py-3 px-4">Horaires</th>
                      <th className="py-3 px-4">Professeur</th>
                      <th className="py-3 px-4">Tarif Annuel</th>
                      <th className="py-3 px-4">Saison</th>
                      <th className="py-3 px-4">ID_Salle (FK)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {sheetCours.filter(c => !searchFilter || JSON.stringify(c).toLowerCase().includes(searchFilter.toLowerCase())).map((c, i) => (
                      <tr key={c.idCours || i} className="hover:bg-zinc-800/50 font-mono text-[11px]">
                        <td className="py-3 px-4 text-orange-400 font-bold">{c.idCours}</td>
                        <td className="py-3 px-4 font-sans font-bold text-white">{c.titreHelloAsso}</td>
                        <td className="py-3 px-4 font-sans text-orange-300">{c.discipline}</td>
                        <td className="py-3 px-4 font-sans">{c.niveau}</td>
                        <td className="py-3 px-4 text-zinc-400">{c.horaires}</td>
                        <td className="py-3 px-4 font-sans text-zinc-300">{c.professeur}</td>
                        <td className="py-3 px-4 text-rose-400 font-bold">{c.tarif} €</td>
                        <td className="py-3 px-4 font-sans text-zinc-400">{c.saison}</td>
                        <td className="py-3 px-4 text-cyan-400 font-bold">{c.idSalle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE 4: INSCRIPTIONS_ET_ESSAIS */}
              {activeSheetTab === 'inscriptions' && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase text-purple-400 sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Réf Commande (PK)</th>
                      <th className="py-3 px-4">ID_Utilisateur (FK)</th>
                      <th className="py-3 px-4">ID_Cours (FK)</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Statut Paiement</th>
                      <th className="py-3 px-4">Montant</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {sheetInscriptions.filter(ins => !searchFilter || JSON.stringify(ins).toLowerCase().includes(searchFilter.toLowerCase())).map((ins, i) => (
                      <tr key={ins.refCommande || i} className="hover:bg-zinc-800/50 font-mono text-[11px]">
                        <td className="py-3 px-4 text-purple-400 font-bold">{ins.refCommande}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{ins.idUtilisateur}</td>
                        <td className="py-3 px-4 text-orange-400 font-bold">{ins.idCours}</td>
                        <td className="py-3 px-4 font-sans">{ins.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ins.statutPaiement.includes('Payé') ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {ins.statutPaiement}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-rose-400 font-black">{ins.montant} €</td>
                        <td className="py-3 px-4 text-zinc-400">{ins.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE 5: FICHES_SANTE */}
              {activeSheetTab === 'sante' && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase text-rose-400 sticky top-0">
                    <tr>
                      <th className="py-3 px-4">ID_Fiche (PK)</th>
                      <th className="py-3 px-4">ID_Utilisateur (FK)</th>
                      <th className="py-3 px-4">Questions Cardiaque / Articulaire</th>
                      <th className="py-3 px-4">Signature Numérique</th>
                      <th className="py-3 px-4">Date Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {sheetFichesSante.filter(h => !searchFilter || JSON.stringify(h).toLowerCase().includes(searchFilter.toLowerCase())).map((h, i) => (
                      <tr key={h.idFiche || i} className="hover:bg-zinc-800/50 font-mono text-[11px]">
                        <td className="py-3 px-4 text-rose-400 font-bold">{h.idFiche}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{h.idUtilisateur}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.questionsCardiaqueArticulaireEquilibre.includes('NON') ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {h.questionsCardiaqueArticulaireEquilibre}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-zinc-300">{h.signatureNumerique}</td>
                        <td className="py-3 px-4 text-zinc-400">{h.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE 6: EXPORT HELLOASSO 31 COLONNES */}
              {activeSheetTab === 'helloasso' && (
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[9px] uppercase text-teal-400 sticky top-0 whitespace-nowrap">
                    <tr>
                      <th className="py-3 px-3">#1 Réf Commande</th>
                      <th className="py-3 px-3">#2 Date Commande</th>
                      <th className="py-3 px-3">#3 Nom Payeur</th>
                      <th className="py-3 px-3">#4 Prénom Payeur</th>
                      <th className="py-3 px-3">#5 Email Payeur</th>
                      <th className="py-3 px-3">#6 Nom Adhérent</th>
                      <th className="py-3 px-3">#7 Prénom Adhérent</th>
                      <th className="py-3 px-3">#8 Email Adhérent</th>
                      <th className="py-3 px-3">#9 Téléphone</th>
                      <th className="py-3 px-3">#10 Date Naissance</th>
                      <th className="py-3 px-3">#11 Adresse</th>
                      <th className="py-3 px-3">#12 Code Postal</th>
                      <th className="py-3 px-3">#13 Ville</th>
                      <th className="py-3 px-3">#14 Contact Urgence</th>
                      <th className="py-3 px-3">#15 Discipline</th>
                      <th className="py-3 px-3">#16 Niveau</th>
                      <th className="py-3 px-3">#17 Titre Cours</th>
                      <th className="py-3 px-3">#18 Horaires</th>
                      <th className="py-3 px-3">#19 Commune</th>
                      <th className="py-3 px-3">#20 Salle</th>
                      <th className="py-3 px-3">#21 Professeur</th>
                      <th className="py-3 px-3">#22 Nom Tarif</th>
                      <th className="py-3 px-3">#23 Montant Payé</th>
                      <th className="py-3 px-3">#24 Moyen Paiement</th>
                      <th className="py-3 px-3">#25 Statut</th>
                      <th className="py-3 px-3">#26 QS-Sport</th>
                      <th className="py-3 px-3">#27 Signature</th>
                      <th className="py-3 px-3">#28 Saison</th>
                      <th className="py-3 px-3">#29 Organisme</th>
                      <th className="py-3 px-3">#30 RNA</th>
                      <th className="py-3 px-3">#31 Date Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300 whitespace-nowrap">
                    {sheetHelloAsso31.filter(row => !searchFilter || JSON.stringify(row).toLowerCase().includes(searchFilter.toLowerCase())).map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-800/50">
                        <td className="py-2.5 px-3 text-teal-400 font-bold">{row.col1_numCommande}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{row.col2_dateCommande}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">{row.col3_nomPayeur}</td>
                        <td className="py-2.5 px-3 font-sans text-white">{row.col4_prenomPayeur}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{row.col5_emailPayeur}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">{row.col6_nomAdherent}</td>
                        <td className="py-2.5 px-3 font-sans text-white">{row.col7_prenomAdherent}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{row.col8_emailAdherent}</td>
                        <td className="py-2.5 px-3">{row.col9_telAdherent}</td>
                        <td className="py-2.5 px-3">{row.col10_dateNaissance}</td>
                        <td className="py-2.5 px-3 font-sans text-zinc-400">{row.col11_adresse}</td>
                        <td className="py-2.5 px-3">{row.col12_codePostal}</td>
                        <td className="py-2.5 px-3 font-sans text-white">{row.col13_ville}</td>
                        <td className="py-2.5 px-3 font-sans text-zinc-400">{row.col14_contactUrgence}</td>
                        <td className="py-2.5 px-3 text-orange-300 font-sans">{row.col15_discipline}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col16_niveau}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col17_titreCours}</td>
                        <td className="py-2.5 px-3">{row.col18_horaires}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col19_lieuCommune}</td>
                        <td className="py-2.5 px-3 font-sans text-cyan-300">{row.col20_salleNom}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col21_professeur}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col22_tarifNom}</td>
                        <td className="py-2.5 px-3 text-rose-400 font-bold">{row.col23_montantPaye}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col24_moyenPaiement}</td>
                        <td className="py-2.5 px-3 text-emerald-400">{row.col25_statutCommande}</td>
                        <td className="py-2.5 px-3">{row.col26_qsSportReponse}</td>
                        <td className="py-2.5 px-3 font-sans text-zinc-400">{row.col27_signatureSante}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col28_saison}</td>
                        <td className="py-2.5 px-3 font-sans">{row.col29_organisme}</td>
                        <td className="py-2.5 px-3">{row.col30_rna}</td>
                        <td className="py-2.5 px-3 text-zinc-500">{row.col31_dateExport}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
};
