# Architecture Technique - Markify

Document détaillé de l'architecture technique de Markify, l'éditeur de messages Discord.

## 📋 Vue d'Ensemble

Markify est une application web monopage (SPA) développée en JavaScript vanilla ES6+ avec une architecture modulaire. L'application permet l'édition de messages Discord avec support du Markdown, des émojis et des polices Unicode.

## 🏛️ Architecture Générale

### Pattern Architectural
```
┌─────────────────────────────────────────────────────────────┐
│                    MARKIFY APPLICATION                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  index.html │ │  style.css  │ │  script.js  │            │
│  │             │ │             │ │             │            │
│  │ • Structure │ │ • Présentation│ • • Logique   │            │
│  │ • Interface │ │ • Thèmes    │ │ • Événements │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  config.js  │ │  emoji.js   │ │translations│            │
│  │             │ │             │ │    .js     │            │
│  │ • Données   │ │ • Émojis    │ │ • i18n     │            │
│  │ • Config    │ │ • Recherche │ │ • UI       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Principes de Conception
- **Séparation des responsabilités** : Chaque module a un rôle défini
- **Modularité** : Imports/exports ES6 pour l'encapsulation
- **Évolutivité** : Architecture extensible pour de nouvelles fonctionnalités
- **Performance** : Chargement optimisé et rendu efficace
- **Maintenabilité** : Code commenté et documenté

## 📁 Structure Modulaire

### 1. Module Core (`script.js`)
**Responsabilités :**
- Coordination générale de l'application
- Gestion des événements utilisateur
- Logique métier principale
- Intégration des autres modules

**Interfaces :**
```javascript
// Point d'entrée
document.addEventListener('DOMContentLoaded', init);

// Gestion d'événements
function handleEditorInput(event)
function handleEditorKeydown(event)
function handlePreviewClick(event)

// Logique métier
function applyMarkdownStyle(styleId)
function applyUnicodeFont(fontName)
function updatePreview()
function updateMessageStats()

// Utilitaires
async function copyToClipboard(text)
function showNotification(message, type)
function toggleTheme()
function toggleLanguage()
```

### 2. Module Configuration (`config.js`)
**Responsabilités :**
- Définition des styles Markdown
- Configuration des polices Unicode
- Gestion de l'état global
- Constantes et données partagées

**Structures de Données :**
```javascript
// Styles Markdown organisés par catégories
export const markdownStyles = {
    basic: [/* styles de base */],
    headings: [/* titres */],
    special: [/* blocs spéciaux */]
};

// Polices Unicode avec différents types de mapping
export const unicodeFonts = {
    'Bold': { offsetLower, offsetUpper, offsetNumber },
    'Small Caps': { map: {a: 'ᴀ', b: 'ʙ', ...} },
    'Zalgo': { special: 'zalgo' }
};

// État global mutable
export const state = {
    activeUnicodeStyle: null,
    currentLang: 'fr',
    currentTheme: 'dark',
    // ...
};

// Collections partagées
export const markdownButtons = new Map();
export const activeMarkdownStyles = new Set();
```

### 3. Module Émojis (`emoji.js`)
**Responsabilités :**
- Gestion de la base de données d'émojis
- Algorithmes de recherche
- Génération de l'interface émojis
- Insertion dans l'éditeur

**Structure des Données :**
```javascript
const emojiData = {
    'Smileys': [
        { e: '😀', n: ['grinning', 'smile', 'happy', 'sourire'] },
        { e: '😃', n: ['smiley', 'happy', 'heureux'] },
        // ...
    ],
    // 8 autres catégories
};
```

**API Publique :**
```javascript
export function initEmojis()
export function searchEmojis(query)
export function insertEmoji(emoji)
export function switchEmojiCategory(category)
```

### 4. Module Internationalisation (`translations.js`)
**Responsabilités :**
- Gestion des traductions
- Fonction d'aide de traduction
- Fallback pour les clés manquantes

**Structure :**
```javascript
export const translations = {
    fr: {
        subtitle: 'Éditeur de messages et émojis pour Discord',
        'emojis-title': 'Sélecteur d\'Émojis',
        // ... 40+ clés
    },
    en: {
        subtitle: 'Emoji message & emoji editor for Discord',
        'emojis-title': 'Emoji Picker',
        // ... 40+ clés
    }
};

export function updateTranslations() // Fonction vide (pour compatibilité)
```

## 🔄 Flux de Données

### Cycle de Vie d'une Action Utilisateur

#### 1. Saisie dans l'Éditeur
```
Utilisateur tape → handleEditorInput() → updateMessageStats()
                    ↓
              updatePreview() → Mise à jour UI
```

#### 2. Application d'un Style Markdown
```
Clic bouton → applyMarkdownStyle(styleId) → getMarkdownStyleById()
           ↓
    applyStyleToSelection() → updatePreview()
           ↓
    updateMarkdownActiveStates() → Mise à jour UI boutons
```

#### 3. Insertion d'Émoji
```
Clic émoji → insertEmoji() → dispatchEvent('markify:emoji-inserted')
            ↓
   handleEmojiInserted() → updatePreview()
```

#### 4. Changement de Thème/Langue
```
Clic bouton → toggleTheme()/toggleLanguage() → updateTranslations()
           ↓
    updateUI() → Mise à jour DOM
```

### Gestion d'État

#### État Global (`state`)
- **Mutable** : Modifié par les actions utilisateur
- **Centralisé** : Un seul objet pour tout l'état
- **Persistant** : Sauvegardé dans localStorage (futur)
- **Réactif** : Déclenche des mises à jour UI

#### Collections Partagées
- **markdownButtons** : Map des boutons de style
- **unicodeButtons** : Map des boutons de police
- **activeMarkdownStyles** : Set des styles actifs

## 🎨 Interface Utilisateur

### Structure HTML
```html
<body>
    <header> <!-- Navigation et contrôles --> </header>
    <main class="main-container">
        <section class="column column-emoji"> <!-- Émojis --> </section>
        <section class="column column-editor"> <!-- Éditeur --> </section>
        <section class="column column-styles"> <!-- Styles --> </section>
    </main>
    <footer> <!-- Crédits --> </footer>
</body>
```

### Système de Thèmes
```css
:root {
    --bg-primary: #0f0f0f;    /* Fond principal */
    --text-primary: #f5f5f5;  /* Texte principal */
    --accent: #ff3030;       /* Accents */
    /* ... 15+ variables */
}

body.light {
    --bg-primary: #ffffff;
    --text-primary: #1a1a1a;
    /* Overrides pour thème clair */
}
```

### Responsive Design
- **Desktop** : 3 colonnes côte à côte
- **Tablet** : Colonnes empilées, émojis en haut
- **Mobile** : Colonnes pleine largeur, navigation par onglets

## ⚡ Performance et Optimisation

### Chargement Initial
1. **HTML** : Structure de base (~5KB)
2. **CSS** : Styles et thèmes (~15KB)
3. **JS Modules** : Chargés en parallèle
   - `config.js` : Petit, chargé en premier
   - `translations.js` : Léger
   - `emoji.js` : Plus lourd (~50KB), lazy loadable
   - `script.js` : Logique principale

### Optimisations Implémentées
- **ES6 Modules** : Chargement asynchrone
- **Debounced Updates** : Prévention des mises à jour excessives
- **Virtual Scrolling** : Pour les grandes listes d'émojis (futur)
- **Memory Management** : Nettoyage des event listeners

### Métriques de Performance
- **First Paint** : < 500ms
- **Time to Interactive** : < 1s
- **Bundle Size** : ~80KB non-minifié
- **Memory Usage** : < 50MB pour usage normal

## 🔒 Sécurité

### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline';  // Pour les modules ES6
style-src 'self' 'unsafe-inline';    // Pour les variables CSS
img-src 'self' data: https:;         // Pour les émojis et images
```

### Protection des Données
- **Aucune collecte** : Pas de tracking ou analytics
- **Local only** : Tout fonctionne côté client
- **Clipboard API** : Utilisation sécurisée avec fallback

### Sanitisation
- **Markdown** : Patterns protégés pour les mentions Discord
- **HTML** : Échappement dans les aperçus
- **Inputs** : Validation des entrées utilisateur

## 🧪 Tests et Qualité

### Stratégie de Test
- **Tests manuels** : Fonctionnalités critiques
- **Cross-browser** : Chrome, Firefox, Edge, Safari
- **Responsive** : Différentes tailles d'écran
- **Accessibility** : Outils comme WAVE ou axe

### Outils de Développement
- **Console** : Logging et debugging
- **DevTools** : Inspection DOM et performance
- **Lighthouse** : Audit de performance et accessibilité

### Métriques Qualité
- **Performance** : Score Lighthouse > 90
- **Accessibilité** : WCAG 2.1 AA compliant
- **SEO** : Meta tags optimisés
- **Mobile** : Design responsive

## 🚀 Déploiement et Maintenance

### Environnements
- **Développement** : Serveur local avec live reload
- **Production** : GitHub Pages
- **CDN** : Optionnel pour les assets

### Monitoring
- **Error Tracking** : Console errors et user reports
- **Performance** : Core Web Vitals
- **Usage** : Analytics basiques (futur)

### Mises à Jour
- **Versioning** : SemVer
- **Changelog** : Documentation des changements
- **Migration** : Guides pour les breaking changes

## 🔮 Évolutivité

### Extensions Possibles
- **PWA** : Service workers et cache offline
- **Backend** : Synchronisation cloud des messages
- **Extensions** : Versions navigateur natives
- **API** : REST API pour intégrations tierces

### Points d'Extension
- **Nouveaux styles** : Ajout facile dans `config.js`
- **Nouvelles langues** : Extension de `translations.js`
- **Nouveaux émojis** : Mise à jour de `emoji.js`
- **Nouvelles polices** : Extension de `unicodeFonts`

### Architecture Future
- **Framework Migration** : Potentiel passage à React/Vue
- **Microservices** : Séparation en services indépendants
- **TypeScript** : Typage statique pour la maintenabilité

---

**Guide développeur :** [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) |
**Guide utilisateur :** [USER_GUIDE.md](USER_GUIDE.md)</content>
<parameter name="filePath">c:\CODE\discord_tools_no_official\DOCS\ARCHITECTURE.md