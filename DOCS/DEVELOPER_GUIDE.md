# Guide Développeur - Markify

Guide complet pour les développeurs souhaitant contribuer à Markify ou l'utiliser comme base pour leurs propres projets.

## 📚 Table des Matières

1. [Architecture](#architecture)
2. [Structure des Fichiers](#structure-des-fichiers)
3. [API et Modules](#api-et-modules)
4. [Développement](#développement)
5. [Tests et Débogage](#tests-et-débogage)
6. [Déploiement](#déploiement)
7. [Contribution](#contribution)
8. [Migration et Mises à Jour](#migration-et-mises-à-jour)

## 🏗️ Architecture

### Architecture Générale
Markify suit une architecture modulaire en JavaScript ES6+ avec séparation claire des responsabilités :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   index.html    │    │    script.js    │    │     config.js   │
│                 │    │                 │    │                 │
│ • Structure     │◄──►│ • Logique       │◄──►│ • Configuration │
│ • Interface     │    │ • Événements    │    │ • Données       │
│ • Métadonnées   │    │ • Coordination  │    │ • Constantes    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              ▲
                              │
                 ┌─────────────────┐    ┌─────────────────┐
                 │    emoji.js     │    │ translations.js │
                 │                 │    │                 │
                 │ • Gestion       │    │ • i18n          │
                 │ • Recherche     │    │ • Localisation  │
                 └─────────────────┘    └─────────────────┘
```

### Principes de Conception
- **Modularité** : Chaque fichier a une responsabilité unique
- **Séparation des données** : Configuration séparée de la logique
- **Internationalisation** : Support multilingue intégré
- **Responsive** : Design adaptatif
- **Performance** : Chargement optimisé et lazy loading

## 📁 Structure des Fichiers

### Fichiers Principaux

#### `index.html`
- **Rôle** : Structure HTML principale
- **Contenu** : Interface utilisateur en 3 colonnes
- **Meta tags** : SEO et partage social
- **Scripts** : Chargement des modules ES6

#### `style.css`
- **Variables CSS** : Thèmes sombre/clair
- **Responsive** : Media queries pour mobile
- **Animations** : Transitions fluides
- **Accessibilité** : Contraste et focus

#### `script.js`
- **Coordination** : Point d'entrée principal
- **Événements** : Gestion des interactions utilisateur
- **Logique métier** : Application des styles et émojis
- **API** : Intégration clipboard et notifications

#### `config.js`
- **Données** : Styles Markdown et polices Unicode
- **État** : Variables globales d'application
- **Constantes** : Limites Discord et catégories
- **Collections** : Maps et Sets partagés

#### `emoji.js`
- **Base de données** : Collection complète d'émojis
- **Recherche** : Algorithme de recherche floue
- **Interface** : Génération de l'UI émojis
- **Insertion** : Logique d'ajout dans l'éditeur

#### `translations.js`
- **Dictionnaires** : Textes en français et anglais
- **Fonction d'aide** : `t()` pour la traduction
- **Fallback** : Gestion des clés manquantes

## 🔧 API et Modules

### Module `config.js`

#### Exports Principaux
```javascript
export const markdownStyles = { /* ... */ };
export const unicodeFonts = { /* ... */ };
export const protectedPattern = /.../;
export const state = { /* ... */ };
export const markdownButtons = new Map();
export const unicodeButtons = new Map();
export const activeMarkdownStyles = new Set();
```

#### Structure des Styles Markdown
```javascript
{
    id: 'bold',                    // Identifiant unique
    labels: { fr: 'Gras', en: 'Bold' }, // Labels multilingues
    prefix: '**',                  // Préfixe Markdown
    suffix: '**',                  // Suffixe Markdown
    type: 'style',                 // 'style', 'structure', 'block'
    preview: sample => `<strong>${sample}</strong>` // Fonction d'aperçu
}
```

#### Structure des Polices Unicode
```javascript
{
    'Bold': {
        offsetLower: 0x1d41a,      // Offset pour minuscules
        offsetUpper: 0x1d400,      // Offset pour majuscules
        offsetNumber: 0x1d7ce      // Offset pour chiffres
    },
    'Small Caps': {
        map: { a: 'ᴀ', b: 'ʙ', /* ... */ } // Mapping direct
    },
    'Zalgo': { special: 'zalgo' }  // Traitement spécial
}
```

### Module `script.js`

#### Fonctions Principales
```javascript
// Gestion des événements
document.addEventListener('DOMContentLoaded', init);
function handleEditorInput(event) { /* ... */ }
function handleEditorKeydown(event) { /* ... */ }

// Application des styles
function applyMarkdownStyle(styleId) { /* ... */ }
function applyUnicodeFont(fontName) { /* ... */ }

// Utilitaires
async function copyToClipboard(text) { /* ... */ }
function showNotification(message, type) { /* ... */ }
function updatePreview() { /* ... */ }
```

#### Gestion d'État
```javascript
const state = {
    activeUnicodeStyle: null,
    lastEditorValue: '',
    isApplyingUnicodeInput: false,
    currentLang: 'fr',
    currentTheme: 'dark',
    currentCategory: 'Smileys'
};
```

### Module `emoji.js`

#### Structure des Données
```javascript
const emojiData = {
    'Smileys': [
        { e: '😀', n: ['grinning', 'smile', 'happy', 'sourire'] },
        // e: emoji, n: names array
    ]
};
```

#### Fonctions d'API
```javascript
export function initEmojis() { /* Initialisation */ }
export function searchEmojis(query) { /* Recherche */ }
export function insertEmoji(emoji) { /* Insertion */ }
```

## 💻 Développement

### Prérequis
- **Navigateur moderne** avec support ES6 modules
- **Éditeur** : VS Code recommandé
- **Git** pour le contrôle de version
- **Node.js** (optionnel pour les outils de développement)

### Configuration du Développement
1. **Clonez le dépôt** :
   ```bash
   git clone https://github.com/devredious/discord_tools_no_official.git
   cd discord_tools_no_official
   ```

2. **Ouvrez dans VS Code** :
   ```bash
   code .
   ```

3. **Lancez un serveur local** (recommandé) :
   ```bash
   # Avec Python
   python -m http.server 8000

   # Avec Node.js
   npx serve .
   ```

### Workflow de Développement
1. **Créez une branche** pour votre fonctionnalité
2. **Modifiez les fichiers** selon vos besoins
3. **Testez dans le navigateur**
4. **Vérifiez la console** pour les erreurs
5. **Committez vos changements**

### Ajout de Nouvelles Fonctionnalités

#### Nouveau Style Markdown
1. **Ajoutez dans `config.js`** :
   ```javascript
   special: [
       // ... styles existants
       {
           id: 'new-style',
           labels: { fr: 'Nouveau', en: 'New' },
           prefix: '***',
           suffix: '***',
           type: 'style',
           preview: sample => `<em><strong>${sample}</strong></em>`
       }
   ]
   ```

2. **Implémentez la logique** dans `script.js` si nécessaire

#### Nouvelle Police Unicode
1. **Ajoutez dans `config.js`** :
   ```javascript
   export const unicodeFonts = {
       // ... polices existantes
       'New Font': {
           offsetLower: 0x????,
           offsetUpper: 0x????,
           offsetNumber: 0x????
       }
   };
   ```

2. **Testez la conversion** des caractères

#### Nouvelle Catégorie d'Émojis
1. **Ajoutez dans `emoji.js`** :
   ```javascript
   const emojiData = {
       // ... catégories existantes
       'New Category': [
           { e: '🔥', n: ['fire', 'feu'] }
       ]
   };
   ```

2. **Mettez à jour `config.js`** :
   ```javascript
   export const emojiCategories = [
       // ... catégories existantes
       'New Category'
   ];
   ```

## 🧪 Tests et Débogage

### Tests Manuels
- **Fonctionnalités de base** : Saisie, styles, émojis
- **Thèmes** : Basculement sombre/clair
- **Langues** : Changement FR/EN
- **Responsive** : Différentes tailles d'écran
- **Navigateurs** : Chrome, Firefox, Edge, Safari

### Outils de Débogage
```javascript
// Console logging
console.log('Debug info:', variable);

// Breakpoints dans VS Code
debugger;

// Inspection des éléments
// Clic droit > Inspecter

// Test des API
navigator.clipboard.writeText('test');
```

### Validation des Changements
- **Fonctionnalité** : Le nouveau code fonctionne-t-il ?
- **Performance** : Pas de ralentissement notable
- **UI/UX** : Interface intuitive et cohérente
- **Accessibilité** : Respect des standards WCAG
- **Compatibilité** : Fonctionne sur tous les navigateurs cibles

## 🚀 Déploiement

### Déploiement GitHub Pages
Le projet est configuré pour GitHub Pages :

1. **Poussez vers main** :
   ```bash
   git add .
   git commit -m "New feature"
   git push origin main
   ```

2. **Activez GitHub Pages** dans les paramètres du dépôt

3. **URL de production** : `https://devredious.github.io/discord_tools_no_official/`

### Déploiement Autre
Pour d'autres plateformes :

1. **Copiez tous les fichiers** `.html`, `.css`, `.js`
2. **Assurez-vous** que les modules ES6 sont supportés
3. **Testez l'URL** finale

### Optimisations de Production
- **Minification** : Utilisez des outils comme Terser
- **Compression** : Gzip/Brotli pour les assets
- **Cache** : Headers appropriés pour le cache
- **CDN** : Optionnel pour les assets statiques

## 🤝 Contribution

### Processus de Contribution
1. **Forkez** le projet
2. **Créez une branche** : `git checkout -b feature/nouvelle-fonction`
3. **Commitez** : `git commit -m "Ajoute nouvelle fonctionnalité"`
4. **Poussez** : `git push origin feature/nouvelle-fonction`
5. **PR** : Ouvrez une Pull Request

### Standards de Code
- **ES6+** : Utilisez les dernières fonctionnalités JavaScript
- **Modulaire** : Un fichier = une responsabilité
- **Commenté** : Code autodocumenté avec commentaires JSDoc
- **Accessible** : Respect des standards d'accessibilité
- **Performant** : Évitez les boucles inutiles et optimisez

### Types de Contributions
- **🐛 Bug fixes** : Corrections de bugs
- **✨ Features** : Nouvelles fonctionnalités
- **🎨 UI/UX** : Améliorations d'interface
- **🌐 i18n** : Nouvelles langues
- **📚 Docs** : Amélioration de la documentation
- **⚡ Performance** : Optimisations

## 🔄 Migration et Mises à Jour

### Mises à Jour Majeures
- **v2.0** : Refonte complète avec React/Vue (futur)
- **v1.x** : Améliorations et corrections

### Migration depuis v1.0
- **Structure** : Réorganisée en modules ES6
- **API** : Changements dans les noms de fonctions
- **Styles** : Variables CSS pour les thèmes

### Compatibilité
- **Navigateurs** : ES6+ support requis
- **Mobile** : Responsive design
- **Accessibilité** : WCAG 2.1 AA

### Roadmap
- [ ] **React Migration** : Refonte avec framework moderne
- [ ] **PWA** : Application web progressive
- [ ] **Extensions** : Versions Chrome/Firefox
- [ ] **API** : Backend pour synchronisation
- [ ] **Collaboration** : Édition en temps réel

---

**Documentation utilisateur :** [USER_GUIDE.md](USER_GUIDE.md) |
**README principal :** [README.md](README.md)</content>
<parameter name="filePath">c:\CODE\discord_tools_no_official\DOCS\DEVELOPER_GUIDE.md