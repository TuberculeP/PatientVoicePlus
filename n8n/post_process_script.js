// =============================================================
//  NODE CODE n8n : Post-traitement de la réponse Ollama
//  À placer après le node HTTP Request → Ollama
// =============================================================

// ---------- 1. WHITELIST DES TAGS LLM AUTORISÉS ----------
const TAGS_VALIDES = [
  // Émotion
  "enervement-modere",
  "enervement-fort",
  "insultes",
  "menace",
  // Qualité commentaire
  "commentaire-clair",
  "commentaire-flou",
  "commentaire-non-exploitable",
  "besoin-relecture-humaine",
  // Auteur & contexte
  "auteur-patient",
  "auteur-indetermine",
  "premiere-visite",
  "hospitalisation",
  "fin-de-sejour",
  // Relation humaine
  "relation-humaine-positive",
  "relation-humaine-negative",
  "manque-de-respect",
  "discrimination-ressentie",
  // Information
  "information-insuffisante",
  "information-contradictoire",
  "explications-insuffisantes",
  "manque-de-transparence",
  // Organisation
  "probleme-planning",
  "acces-aux-soins",
  "parcours-desorganise",
  // Soins & rééducation
  "qualite-reeducation",
  "gestion-de-la-douleur",
  "manque-de-suivi",
  // Sécurité
  "securite-soins",
  "incident-signale",
  "respect-de-lintimite",
  // Environnement
  "hygiene",
  "confort-environnement",
  "confort-hebergement",
  "accessibilite-locaux",
  // Accessibilité numérique
  "difficulte-parcours-numerique",
  "besoin-accompagnement-specifique",
  // Administratif
  "probleme-administratif",
  "probleme-facturation",
  // Sortie
  "probleme-sortie-continuite",
];

// ---------- 2. RÉCUPÉRATION DES DONNÉES ----------
const raw =
  $input.first().json.output ||
  $input.first().json.response ||
  $input.first().json.text ||
  "";
const ollamaResponse = String(raw).trim();
const messageOriginal = $("Webhook").first().json.body.message || "";
const formId = $("Webhook").first().json.body.form_id || "";

// ---------- 3. PARSING SÉCURISÉ DU JSON ----------
let parsed;
try {
  if (!ollamaResponse) {
    throw new Error("Réponse LLM vide ou undefined");
  }

  // Nettoyage défensif : retire d'éventuels blocs markdown ```json ... ```
  const cleaned = ollamaResponse
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  parsed = JSON.parse(cleaned);

  if (!parsed.analyse || !Array.isArray(parsed.tags)) {
    throw new Error(
      "Structure JSON invalide : champs analyse ou tags manquants",
    );
  }
} catch (err) {
  return [
    {
      json: {
        form_id: formId,
        success: false,
        error: err.message,
        raw_response: ollamaResponse,
        message_original: messageOriginal,
        analyse: null,
        tags: ["besoin-relecture-humaine", "erreur-parsing"],
        needs_human_review: true,
        timestamp: new Date().toISOString(),
      },
    },
  ];
}

// ---------- 4. FILTRAGE PAR WHITELIST ----------
const tags_bruts = parsed.tags.map((t) => t.toLowerCase().trim());
const tags_filtres = tags_bruts.filter((t) => TAGS_VALIDES.includes(t));
const tags_rejetes = tags_bruts.filter((t) => !TAGS_VALIDES.includes(t));

// ---------- 5. CORRECTION DE COHÉRENCE ----------
function corrigerCoherence(tags, message) {
  const t = new Set(tags);
  const m = message.toLowerCase();

  // --- Détection "proche du patient" → force auteur-indetermine
  const mots_proche =
    /\b(ma m[èe]re|mon p[èe]re|mon mari|ma femme|mon fils|ma fille|mon fr[èe]re|ma s[œoe]ur|mes parents|mon conjoint|ma conjointe|mon proche|mon ami|mon amie|mon oncle|ma tante|mon grand[- ]p[èe]re|ma grand[- ]m[èe]re)\b/i;
  if (mots_proche.test(m)) {
    t.delete("auteur-patient");
    t.add("auteur-indetermine");
  }

  // --- Force probleme-planning si mention temporelle/RDV
  if (
    /\b(\d+\s*h(eures?)?\s*d['e]?\s*attente|attente de \d+|temps d['e]?\s*attente|retard|annulation|annulé|reporté|reporter|reprogramm|changement de (rdv|rendez-vous)|prise de (rdv|rendez-vous))\b/i.test(
      m,
    )
  ) {
    t.add("probleme-planning");
  }

  // --- Retire tags de contexte non justifiés
  if (
    t.has("premiere-visite") &&
    !/\b(premi[èe]re fois|premi[èe]re visite|jamais venu|nouveau patient)\b/i.test(
      m,
    )
  ) {
    t.delete("premiere-visite");
  }
  if (
    t.has("hospitalisation") &&
    !/\b(hospitali[sz][éeè]|s[éeè]jour|chambre|nuit|hospit)\b/i.test(m)
  ) {
    t.delete("hospitalisation");
  }
  if (
    t.has("fin-de-sejour") &&
    !/\b(sortie|sorti|sortir|quitt[éeè]|fin de s[éeè]jour|[àa] la sortie)\b/i.test(
      m,
    )
  ) {
    t.delete("fin-de-sejour");
  }

  // --- Forcer cohérence menace/insultes
  if (t.has("menace") && !t.has("besoin-relecture-humaine")) {
    t.add("besoin-relecture-humaine");
  }

  // --- Forcer un niveau d'énervement si oublié
  if (!t.has("enervement-modere") && !t.has("enervement-fort")) {
    t.add("enervement-modere"); // défaut sûr
  }

  // --- Forcer un statut auteur si oublié
  if (!t.has("auteur-patient") && !t.has("auteur-indetermine")) {
    t.add("auteur-indetermine"); // défaut prudent
  }

  // --- Forcer un statut commentaire si oublié
  if (
    !t.has("commentaire-clair") &&
    !t.has("commentaire-flou") &&
    !t.has("commentaire-non-exploitable")
  ) {
    t.add("commentaire-flou"); // défaut prudent
  }

  return [...t];
}

let tags_corriges = corrigerCoherence(tags_filtres, messageOriginal);

// ---------- 6. ENRICHISSEMENT : TAGS MÉTA CALCULÉS ----------
function enrichirTagsMeta(tags, message) {
  const t = new Set(tags);

  // --- Détection données personnelles par regex
  const regex_email = /\b[\w.-]+@[\w.-]+\.\w+\b/;
  const regex_tel = /\b0[1-9](?:[\s.-]?\d{2}){4}\b/;
  const regex_nom =
    /\b(M\.|Mme|Mlle|Monsieur|Madame|Dr\.?|Docteur)\s+[A-ZÉÈÀÂÇ][a-zéèàâçï]+/;
  const regex_signature =
    /(cordialement|sinc[èe]rement|bien [àa] vous|merci d['e]avance)[\s,.]*\n*\s*[A-ZÉÈÀ][a-zéèàâçï]+/i;

  if (
    regex_email.test(message) ||
    regex_tel.test(message) ||
    regex_nom.test(message) ||
    regex_signature.test(message)
  ) {
    t.add("donnees-personnelles-detectees");
  }

  // --- Calcul gravité
  const tags_graves = [
    "menace",
    "discrimination-ressentie",
    "securite-soins",
    "incident-signale",
    "manque-de-respect",
  ];
  const tags_moyens = [
    "enervement-fort",
    "insultes",
    "manque-de-suivi",
    "information-contradictoire",
    "relation-humaine-negative",
    "gestion-de-la-douleur",
  ];

  const has_grave = [...t].some((x) => tags_graves.includes(x));
  const has_moyen = [...t].some((x) => tags_moyens.includes(x));

  if (has_grave) {
    t.add("gravite-elevee");
    t.add("audit-prioritaire");
    t.add("besoin-relecture-humaine");
  } else if (has_moyen) {
    t.add("gravite-moyenne");
    t.add("audit-potentiel");
  } else {
    t.add("gravite-faible");
  }

  // --- Quota
  if (t.has("commentaire-non-exploitable")) {
    t.add("exclu-du-quota");
  } else {
    t.add("compte-dans-quota");
  }

  // --- Longueur du commentaire
  const nb_mots = message.trim().split(/\s+/).filter(Boolean).length;
  if (nb_mots < 10) {
    t.add("commentaire-court");
  } else if (nb_mots > 150) {
    t.add("commentaire-long");
  }

  // --- Impact (heuristique simple, à affiner avec ta base)
  if (
    /\b(tout le monde|tous les patients|le service entier|plusieurs personnes|la plupart)\b/i.test(
      message,
    )
  ) {
    t.add("impact-collectif");
  } else {
    t.add("impact-individuel");
  }

  return [...t];
}

const tags_finaux = enrichirTagsMeta(tags_corriges, messageOriginal);

// ---------- 7. SORTIE FINALE ----------
return [
  {
    json: {
      form_id: formId,
      success: true,
      analyse: parsed.analyse,
      tags: tags_finaux,
      message_original: messageOriginal,

      // Métadonnées techniques utiles
      needs_human_review: tags_finaux.includes("besoin-relecture-humaine"),
      audit_level: tags_finaux.includes("audit-prioritaire")
        ? "prioritaire"
        : tags_finaux.includes("audit-potentiel")
          ? "potentiel"
          : "aucun",
      in_quota: tags_finaux.includes("compte-dans-quota"),
      has_pii: tags_finaux.includes("donnees-personnelles-detectees"),

      // Debug (à retirer en prod si tu veux)
      tags_llm_bruts: tags_bruts,
      tags_rejetes_whitelist: tags_rejetes,

      timestamp: new Date().toISOString(),
    },
  },
];
