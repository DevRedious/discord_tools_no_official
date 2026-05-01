# Prompt de Génération - Markify Discord Message Editor

## 📋 Description du Projet

Markify est une application web monopage (SPA) permettant de créer et formater des messages Discord avec support du Markdown, des émojis et des polices Unicode. L'application offre un éditeur en temps réel avec aperçu Discord intégré.

## 🎯 Fonctionnalités Principales

### 1. Éditeur de Messages Discord
- Éditeur de texte en temps réel avec aperçu Discord
- Support complet du Markdown Discord :
  - Styles inline : **gras**, *italique*, __souligné__, ~~barré~~, `code inline`, ||spoiler||
  - Titres : # H1, ## H2, ### H3
  - Blocs spéciaux : citations (> ), blocs de code (```), listes (- )
- Protection automatique des codes Discord (mentions, canaux, rôles)
- Comptage de caractères (limites standard 2000 et Nitro 4000)
- Copie en un clic vers le presse-papiers

### 2. Sélecteur d'Émojis
- Collection complète d'émojis organisée par catégories (10 catégories)
- Recherche par nom ou mot-clé
- Insertion directe dans l'éditeur
- Plus de 1350 émojis disponibles

### 3. Polices Unicode
- 15 polices différentes : Bold, Italic, Script, Monospace, Small Caps, Upside Down, Zalgo, Aesthetic, etc.
- Transformation en temps réel du texte sélectionné
- Mode actif pour transformation automatique à la saisie

### 4. Interface Utilisateur
- Thème sombre/clair avec basculement
- Internationalisation (Français/Anglais)
- Design responsive (desktop, tablette, mobile)
- Notifications visuelles pour les actions utilisateur

## 🛠️ Stack Technologique

### Frontend
- **HTML5** : Structure sémantique avec balises modernes
- **CSS3** : 
  - Variables CSS pour les thèmes (`:root`, `body.light`)
  - Grid Layout pour la mise en page responsive
  - Flexbox pour l'alignement
  - Media queries pour le responsive design
  - Transitions et animations CSS
- **JavaScript ES6+** :
  - Modules ES6 (`import`/`export`)
  - Classes et fonctions fléchées
  - Template literals
  - Destructuring
  - Map et Set pour les collections
  - Async/await pour les opérations asynchrones

### Architecture
- **Pattern** : Architecture modulaire avec séparation des responsabilités
- **Modules** :
  - `script.js` : Logique principale et coordination
  - `config.js` : Configuration (styles Markdown, polices Unicode, état global)
  - `emoji.js` : Gestion des émojis et recherche
  - `translations.js` : Internationalisation (FR/EN)
- **État global** : Objet `state` partagé entre modules
- **Collections** : Maps et Sets pour les boutons et styles actifs

### APIs Navigateur Utilisées
- **Clipboard API** : `navigator.clipboard.writeText()` avec fallback `document.execCommand()`
- **DOM API** : Manipulation du DOM, événements, sélection de texte
- **Event API** : Custom events pour la communication entre modules

## 📁 Structure des Fichiers

```
discord_tools_no_official/
├── index.html          # Page principale (140 lignes)
├── style.css           # Styles CSS (817 lignes)
├── script.js            # Logique principale (1117 lignes)
├── config.js           # Configuration (151 lignes)
├── emoji.js            # Gestion des émojis (1452 lignes)
├── translations.js      # Internationalisation (71 lignes)
├── favicon.svg         # Icône du site
└── DOCS/               # Documentation
    ├── ARCHITECTURE.md
    ├── USER_GUIDE.md
    ├── DEVELOPER_GUIDE.md
    └── PROJECT_PROMPT.md (ce fichier)
```

## 🔧 Détails Techniques par Module

### 1. `index.html`
**Responsabilités :**
- Structure HTML sémantique
- Meta tags pour SEO et réseaux sociaux
- Points d'entrée pour les scripts

**Éléments clés :**
- 3 colonnes principales : émojis, éditeur, styles
- Zones interactives avec IDs pour le JavaScript
- Pas de CSP stricte (pour compatibilité)

### 2. `script.js` (1117 lignes)
**Responsabilités :**
- Initialisation de l'application
- Gestion des événements utilisateur
- Application des styles Markdown
- Transformation des polices Unicode
- Rendu de l'aperçu Discord
- Gestion du clipboard

**Fonctions principales :**
```javascript
// Initialisation
document.addEventListener('DOMContentLoaded', init);

// Styles Markdown
function applyMarkdownStyle(styleId)
function applyInlineStyle(style)
function applyStructureStyle(style)
function applyBlockStyle(style)

// Polices Unicode
function applyUnicodeStyle(name)
function transformWithFont(text, data)
function normalizeFontText(text, data)

// Aperçu
function updatePreview()
function renderPreviewMarkup(text)
function escapeHTML(str)

// Utilitaires
function copyToClipboard(text)
function showNotification(message, type)
function toggleTheme()
function toggleLanguage()
```

**Constantes importantes :**
- `DISCORD_LIMIT = 2000` (limite standard)
- `DISCORD_LIMIT_NITRO = 4000` (limite Nitro)
- `headingStyleIds` : Set des IDs de titres
- `autoContinueStyleIds` : Styles qui continuent sur nouvelle ligne

### 3. `config.js` (151 lignes)
**Responsabilités :**
- Définition des styles Markdown
- Configuration des polices Unicode
- Pattern de protection des codes Discord
- État global de l'application

**Structures de données :**
```javascript
// Styles Markdown organisés par catégories
export const markdownStyles = {
    basic: [...],      // Styles inline
    headings: [...],   // Titres H1-H3
    special: [...]     // Citations, code blocks, listes
};

// Polices Unicode avec différents types
export const unicodeFonts = {
    'Bold': { offsetLower, offsetUpper, offsetNumber },
    'Small Caps': { map: {...} },
    'Zalgo': { special: 'zalgo' },
    // ... 15 polices au total
};

// Pattern pour protéger les codes Discord
export const protectedPattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|<#[0-9]+>|<@&[0-9]+>|<@[0-9]+>|<a?:[a-zA-Z0-9_]+:[0-9]+>)/;

// État global
export const state = {
    activeUnicodeStyle: null,
    lastEditorValue: '',
    isApplyingUnicodeInput: false,
    currentLang: 'fr',
    currentTheme: 'dark',
    currentCategory: 'Smileys',
    allEmojis: [],
    notificationTimeout: null
};
```

### 4. `emoji.js` (1452 lignes)
**Responsabilités :**
- Base de données d'émojis (1350+ émojis)
- Initialisation de l'interface émojis
- Recherche d'émojis
- Insertion dans l'éditeur

**Structure des données :**
```javascript
const emojiData = {
    'Smileys': [
        { e: '😀', n: ['grinning', 'smile', 'happy', 'sourire'] },
        // ... 108 émojis
    ],
    'Gestes': [...],
    'Personnes': [...],
    'Animaux': [...],
    'Nourriture': [...],
    'Activites': [...],
    'Voyages': [...],
    'Objets': [...],
    'Symboles': [...],
    'Drapeaux': [...]
};
```

**Fonctions principales :**
```javascript
function initEmojis()           // Initialise les onglets et affiche la première catégorie
function displayEmojis(emojis) // Affiche les émojis dans la grille
function searchEmojis()        // Recherche dans tous les émojis
function showCategory(category) // Affiche une catégorie spécifique
function insertEmoji(emojiChar) // Insère un émoji dans l'éditeur
```

### 5. `translations.js` (71 lignes)
**Responsabilités :**
- Traductions FR/EN
- Fonction helper pour les traductions

**Structure :**
```javascript
export const translations = {
    fr: {
        subtitle: '...',
        'emojis-title': '...',
        // ... 30+ clés de traduction
    },
    en: {
        // Traductions anglaises
    }
};
```

### 6. `style.css` (817 lignes)
**Responsabilités :**
- Styles globaux et reset
- Variables CSS pour les thèmes
- Layout responsive (3 colonnes → empilées sur mobile)
- Styles des composants (boutons, grilles, formulaires)
- Animations et transitions

**Variables CSS principales :**
```css
:root {
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
    --text-primary: #f5f5f5;
    --accent: #ff3030;
    /* ... 15+ variables */
}

body.light {
    /* Overrides pour le thème clair */
}
```

## 🎨 Design et UX

### Palette de Couleurs
- **Thème sombre** : Fond #0f0f0f, Texte #f5f5f5, Accent #ff3030
- **Thème clair** : Fond #ffffff, Texte #1a1a1a, Accent #c10000

### Layout
- **Desktop** : 3 colonnes côte à côte (émojis | éditeur | styles)
- **Tablette** : Colonnes empilées verticalement
- **Mobile** : Colonnes pleine largeur avec navigation optimisée

### Composants UI
- Boutons avec états actifs/inactifs
- Grilles responsives avec `grid-template-columns: repeat(auto-fill, minmax(...))`
- Zones de texte avec compteurs de caractères
- Notifications toast en bas de page
- Onglets pour les catégories d'émojis

## 🔄 Flux de Données

### Cycle de Vie d'une Action
1. **Saisie utilisateur** → `handleEditorInput()` → `updatePreview()` → Mise à jour UI
2. **Clic style** → `applyMarkdownStyle()` → Modification texte → `updatePreview()`
3. **Clic émoji** → `insertEmoji()` → Event `markify:emoji-inserted` → `updatePreview()`
4. **Recherche émoji** → `searchEmojis()` → Filtrage → `displayEmojis()`

### Gestion d'État
- **État global** : Objet `state` muté par les actions
- **Collections actives** : `activeMarkdownStyles` (Set), `markdownButtons` (Map)
- **Cache** : `state.allEmojis` pour la recherche rapide

## 📝 Prompt de Génération Complet

```
Créez une application web monopage (SPA) appelée "Markify" - un éditeur de messages Discord avec support Markdown, émojis et polices Unicode.

ARCHITECTURE:
- Utilisez JavaScript ES6+ avec modules (import/export)
- Structure modulaire : script.js (logique principale), config.js (configuration), emoji.js (émojis), translations.js (i18n)
- Pas de framework (vanilla JS)
- Pas de build step (fichiers JS directement dans le HTML)

FONCTIONNALITÉS REQUISES:

1. ÉDITEUR DE MESSAGES DISCORD:
   - Textarea avec aperçu en temps réel
   - Support Markdown Discord complet :
     * Styles inline : **gras**, *italique*, __souligné__, ~~barré~~, `code`, ||spoiler||
     * Titres : # H1, ## H2, ### H3
     * Citations : > citation simple, >>> citation multi-ligne
     * Code blocks : ```code```
     * Listes : - item
   - Protection automatique des codes Discord (<#123>, <@123>, <@&123>)
   - Comptage caractères (limites 2000/4000)
   - Bouton copier avec Clipboard API + fallback
   - Bouton réinitialiser

2. SÉLECTEUR D'ÉMOJIS:
   - 10 catégories : Smileys, Gestes, Personnes, Animaux, Nourriture, Activités, Voyages, Objets, Symboles, Drapeaux
   - Plus de 1350 émojis avec noms de recherche multilingues
   - Barre de recherche avec filtrage en temps réel
   - Onglets pour changer de catégorie
   - Insertion directe dans l'éditeur au clic

3. POLICES UNICODE:
   - 15 polices : Bold, Italic, Bold Italic, Sans Serif, Sans Bold, Monospace, Double, Script, Fraktur, Fullwidth, Small Caps, Upside Down, Wavy, Zalgo, Aesthetic, Strikethrough
   - Transformation du texte sélectionné
   - Mode actif pour transformation automatique à la saisie
   - Protection des codes Discord lors de la transformation

4. INTERFACE UTILISATRICE:
   - Thème sombre/clair avec toggle
   - Internationalisation FR/EN avec toggle
   - Design responsive (3 colonnes → empilées sur mobile)
   - Notifications visuelles pour les actions
   - Variables CSS pour les thèmes

STRUCTURE DES FICHIERS:
- index.html : Structure HTML sémantique, meta tags SEO
- style.css : Styles avec variables CSS, grid layout, responsive
- script.js : Logique principale (~1100 lignes)
- config.js : Configuration styles Markdown, polices Unicode, état global
- emoji.js : Base de données émojis et fonctions de gestion (~1450 lignes)
- translations.js : Traductions FR/EN (~70 lignes)

DÉTAILS TECHNIQUES:

JavaScript:
- Modules ES6 avec import/export
- Utilisation de Map et Set pour les collections
- Event listeners sur DOMContentLoaded
- Custom events pour communication inter-modules
- Gestion d'erreurs avec try/catch
- Fallback pour Clipboard API (document.execCommand)

CSS:
- Variables CSS dans :root pour thème sombre
- Override dans body.light pour thème clair
- Grid layout : grid-template-columns: repeat(auto-fill, minmax(...))
- Media queries pour responsive
- Transitions CSS pour animations fluides

HTML:
- Structure sémantique (header, main, section, footer)
- IDs pour ciblage JavaScript
- Attributs ARIA pour accessibilité (optionnel mais recommandé)
- Meta tags pour SEO et réseaux sociaux

LOGIQUE MÉTIER:

Styles Markdown:
- Détection de la sélection dans le textarea
- Application/retrait des préfixes/suffixes
- Gestion des styles exclusifs (gras/italique)
- Protection des codes Discord
- Continuation automatique sur nouvelle ligne (Enter)

Polices Unicode:
- Transformation caractère par caractère avec mapping Unicode
- Gestion des polices spéciales (Zalgo, Aesthetic)
- Normalisation pour retirer les transformations
- Protection des codes Discord

Émojis:
- Chargement de toutes les catégories au démarrage
- Construction d'un tableau plat pour recherche rapide
- Filtrage par mots-clés dans les noms
- Affichage dans une grille responsive

Aperçu:
- Parsing du Markdown avec regex
- Échappement HTML pour sécurité
- Rendu avec balises HTML appropriées
- Mise à jour en temps réel

ÉTAT GLOBAL:
```javascript
const state = {
    activeUnicodeStyle: null,
    lastEditorValue: '',
    isApplyingUnicodeInput: false,
    currentLang: 'fr',
    currentTheme: 'dark',
    currentCategory: 'Smileys',
    allEmojis: [],
    notificationTimeout: null
};
```

COLLECTIONS PARTAGÉES:
- markdownButtons: Map<id, buttonElement>
- unicodeButtons: Map<name, buttonElement>
- activeMarkdownStyles: Set<id>

PATTERNS IMPORTANTS:
- Protection Discord: /(\[[^\]]+\]\(https?:\/\/[^)]+\)|<#[0-9]+>|<@&[0-9]+>|<@[0-9]+>|<a?:[a-zA-Z0-9_]+:[0-9]+>)/
- Styles auto-continue: ['list', 'quote', 'multiline-quote', 'heading1', 'heading2', 'heading3']

CONSTANTES:
- DISCORD_LIMIT = 2000
- DISCORD_LIMIT_NITRO = 4000

STYLES MARKDOWN (exemple):
```javascript
{
    id: 'bold',
    labels: { fr: 'Gras', en: 'Bold' },
    prefix: '**',
    suffix: '**',
    type: 'style',
    preview: sample => `<strong>${sample}</strong>`
}
```

POLICES UNICODE (exemple):
```javascript
'Bold': { 
    offsetLower: 0x1d41a, 
    offsetUpper: 0x1d400, 
    offsetNumber: 0x1d7ce 
}
```

ÉMOJIS (exemple):
```javascript
{ e: '😀', n: ['grinning', 'smile', 'happy', 'sourire'] }
```

FONCTIONS CLÉS À IMPLÉMENTER:
- initEmojis() : Initialise les onglets et affiche la première catégorie
- displayEmojis(emojis) : Affiche les émojis dans la grille
- searchEmojis() : Recherche et filtre les émojis
- applyMarkdownStyle(styleId) : Applique un style Markdown
- applyUnicodeStyle(name) : Active/applique une police Unicode
- updatePreview() : Met à jour l'aperçu Discord
- renderPreviewMarkup(text) : Parse le Markdown et génère le HTML
- copyToClipboard(text) : Copie avec Clipboard API + fallback
- toggleTheme() : Bascule entre thème sombre/clair
- toggleLanguage() : Bascule entre FR/EN

GESTION DES ÉVÉNEMENTS:
- DOMContentLoaded : Initialisation
- input sur textarea : Mise à jour aperçu + stats
- keydown sur textarea : Gestion Enter pour continuation styles
- click sur boutons styles : Application style
- click sur émojis : Insertion dans éditeur
- input sur recherche émojis : Filtrage

CSS RESPONSIVE:
- Desktop : 3 colonnes côte à côte
- Tablet : Colonnes empilées
- Mobile : Colonnes pleine largeur, navigation optimisée

GESTION DES ERREURS:
- Try/catch pour Clipboard API
- Fallback pour setSelectionRange
- Validation des données avant traitement

OPTIMISATIONS:
- Pas de lazy loading (simplicité)
- Tous les émojis chargés au démarrage
- Recherche par filtrage simple (pas d'index)
- Pas de virtual scrolling

SÉCURITÉ:
- Échappement HTML dans l'aperçu
- Validation des entrées utilisateur
- Protection des codes Discord

Créez cette application avec un code propre, bien commenté, et fonctionnel.
```

## 🚀 Instructions de Déploiement

### Développement Local
1. Cloner le dépôt
2. Ouvrir `index.html` dans un navigateur moderne
3. Ou utiliser un serveur local :
   ```bash
   python -m http.server 8000
   # Ou
   npx serve
   ```

### Production
- Déployer sur GitHub Pages, Netlify, Vercel, ou tout hébergeur statique
- Aucun build nécessaire (fichiers statiques)
- Tous les fichiers doivent être dans le même répertoire

## 📊 Métriques du Projet

- **Lignes de code** : ~3600 lignes
- **Fichiers JavaScript** : 4 modules
- **Émojis** : 1350+ émojis dans 10 catégories
- **Styles Markdown** : 12 styles différents
- **Polices Unicode** : 15 polices
- **Traductions** : 2 langues (FR/EN), 30+ clés
- **Taille totale** : ~80KB non-minifié

## 🔍 Points d'Attention

### Limitations Actuelles
- Pas de lazy loading des émojis (tous chargés au démarrage)
- Pas de virtual scrolling pour les grandes listes
- Pas de CSP stricte (pour compatibilité)
- Pas de Twemoji (utilise les émojis Unicode natifs)

### Améliorations Possibles
- Lazy loading des émojis par catégorie
- Debouncing sur la recherche
- Virtual scrolling pour performance
- CSP plus stricte avec nonces
- Tests unitaires
- TypeScript pour le typage

## 📚 Références

- [Discord Markdown Guide](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-)
- [Unicode Fonts](https://unicode.org/)
- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

**Note** : Ce prompt peut être utilisé avec n'importe quel assistant IA ou développeur pour recréer le projet Markify de zéro.
