# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Présentation

**Markify** — un éditeur de messages Discord côté client : styles Markdown, sélecteur d'émojis, « polices » Unicode, générateur d'horodatage Discord et aperçu Discord en direct. JavaScript vanilla pur (modules ES6), sans framework, sans étape de build, sans dépendances. Déployé en site statique sur GitHub Pages (`https://devredious.github.io/discord_tools_no_official/`).

Le code et l'UI sont pensés en français d'abord (l'anglais est une traduction secondaire). Les commentaires, messages de commit et fichiers de doc sont en français.

## Lancer / développer

Il n'y a pas de `package.json`, pas de build, pas de suite de tests. Comme l'app utilise des imports de modules ES6 (`<script type="module">`), elle **ne peut pas** être ouverte via `file://` — le navigateur bloquera le chargement des modules. Servir en HTTP :

```bash
python -m http.server 8000    # puis ouvrir http://localhost:8000
# ou
npx serve .
```

Modifier un fichier `.js`/`.css`/`.html` demande juste un rafraîchissement du navigateur. Le comportement cross-navigateur et responsive se vérifie manuellement (pas de tests automatisés).

## Architecture

Six fichiers à la racine, reliés par des imports ES6 (point d'entrée : `<script src="script.js" type="module">` dans `index.html`) :

- **`script.js`** (~1400 lignes) — le cœur de l'application. Gère tout le câblage d'événements DOM (bootstrap `DOMContentLoaded` en haut du fichier), la logique d'application des styles markdown/unicode, le rendu de l'aperçu Discord, et l'outil d'horodatage. C'est ici que vit presque tout le comportement.
- **`config.js`** — données pures + état partagé mutable. Exporte `markdownStyles` (groupes basic/headings/special), `unicodeFonts` (transformations par offset, par `map`, ou `special`), la regex `protectedPattern`, et les singletons partagés : `state` (état global mutable), `markdownButtons`/`unicodeButtons` (Maps), `activeMarkdownStyles` (Set).
- **`emoji.js`** — la base de données d'émojis (`emojiData`, indexée par catégorie) plus l'UI du sélecteur (`initEmojis`, `searchEmojis`, `showCategory`, `insertEmoji`, `handleEmojiSelection`).
- **`translations.js`** — `translations.fr` / `translations.en`, dictionnaires plats clé→chaîne consommés par le helper `t(key)` dans `script.js`. Toute chaîne visible par l'utilisateur doit avoir une clé dans **les deux** langues.
- **`index.html`** — la disposition à trois colonnes : sélecteur d'émojis (gauche) / éditeur + outil d'horodatage + aperçu (centre) / styles markdown & unicode (droite).
- **`embed.html` + `embed.js`** — la page **générateur d'embed / Components V2** (page séparée, liée depuis `index.html`). Une **bascule de mode** (`setMode('embed'|'v2')`) commute entre deux constructeurs dans la même page ; `embed.js` est le coordinateur (aperçu, JSON, copie, webhook, export/import, thème, i18n) et branche son rendu selon le mode. Fonctionnalités : aperçu façon Discord en direct (rendu markdown via `renderMarkdown`), sortie JSON, **envoi direct via webhook** (`fetch` POST, validation `WEBHOOK_RE`), **auto-persistance du brouillon** dans `localStorage` + export/import `.json`. `embed.js` importe `translations.js` et `componentsv2.js` ; il ne partage pas le `state` de `config.js`. L'URL du webhook n'est jamais persistée ni exportée.
- **`componentsv2.js`** — module autonome du constructeur **Discord Components V2** (flag `IS_COMPONENTS_V2 = 32768` ; quand présent, `content`/`embeds` sont interdits, tout passe par `components`). C'est un éditeur d'arbre de blocs (Container 17, Text Display 10, Section 9 + accessoire bouton/thumbnail, Media Gallery 12, Separator 14, File 13, Action Row 1 avec boutons/selects). Il gère son propre modèle interne (`blocks`) et son DOM ; `embed.js` le pilote via l'API exportée (`initComponentsV2`, `buildPayload`, `renderPreview`, `getDraft`/`setDraft`, `reset`, `retranslate`, `isEmpty`) et un callback `onChange`. Le modèle interne (shape des blocs) est distinct du JSON Discord — la conversion se fait dans `componentJson()`. Les éditions de champ mutent le modèle en place (pas de re-render, garde le focus) ; les opérations structurelles (ajout/suppression/déplacement) déclenchent un `rerender()` complet.
- **`style.css`** — thèmes via variables CSS ; le sombre est le défaut, `body.light` fournit les surcharges du thème clair. Contient aussi les styles de l'embed (`.embed-*`, `.discord-embed-*`). Toujours utiliser les variables CSS de thème plutôt que des couleurs en dur pour rester lisible en clair **et** en sombre.

### Mécaniques clés à connaître avant d'éditer

- **État mutable partagé.** `state` dans `config.js` est un unique objet global (`currentLang`, `currentTheme`, `activeUnicodeStyle`, `allEmojis`, etc.). Les modules le mutent directement plutôt que de se le passer. La communication inter-modules passe par le DOM (`emoji.js` émet `markify:emoji-inserted` ; `script.js` l'écoute).
- **Séquences protégées.** Les codes et liens Discord (`<#123>`, `<@123>`, `<@&123>`, `<a:name:123>`, liens markdown) sont détectés par `protectedPattern` dans `config.js`. La logique d'application des styles (`applyStyleExcludingProtected`, `splitProtectedSegments`, `isIndexInProtectedRange`) ne doit jamais découper ni encadrer l'intérieur de ces plages. Si tu touches à l'application des styles, préserve ce comportement.
- **Trois `type`s de style markdown**, appliqués différemment dans `script.js` : `style` (encadrement inline → `applyInlineStyle`), `structure` (préfixe de ligne comme `> `, `- ` → `applyStructureStyle`), `block` (bloc délimité, ex. bloc de code → `applyBlockStyle`).
- **Les polices Unicode** ne sont pas du markdown — elles réécrivent les caractères. Trois types de transformation dans `unicodeFonts` : `offset*` sur les codepoints (Bold, Italic, Monospace…), `map` explicite (Small Caps, Upside Down…), ou `special` (`zalgo`/`aesthetic`/`strikethrough`, gérés par des fonctions dédiées).
- **Ajouter une fonctionnalité qui rend du texte** implique de mettre à jour `renderPreviewMarkup` dans `script.js` pour que l'aperçu Discord la reflète.
- **Préférences partagées.** Le thème et la langue sont persistés dans `localStorage` sous les clés `markify-theme` et `markify-lang`, partagées entre `index.html` (`script.js`) et `embed.html` (`embed.js`). Chaque page lit ces clés au chargement (helpers `loadPreferences`/`savePref`) et un petit script inline dans `<body>` applique le thème avant le rendu pour éviter le flash. Le brouillon de l'embed est stocké séparément sous `markify-embed-draft`.

### Ajouter des éléments

- **Un style markdown** → ajouter un objet dans le bon groupe de `markdownStyles` (`config.js`) avec `id`, `labels.{fr,en}`, `prefix`, `suffix`, `type`, et une fonction `preview`.
- **Une police unicode** → ajouter une entrée à `unicodeFonts` (`config.js`).
- **Un émoji** → ajouter `{ e: '🔥', n: ['keyword', 'motclé'] }` à une catégorie dans `emoji.js`.
- **Une chaîne d'UI** → ajouter la clé dans `fr` et `en` de `translations.js` ; la lire via `t('key')`.

## Pièges

- **Le dossier `DOCS/` est en retard sur le code.** `DOCS/ARCHITECTURE.md`, `README.md`, etc. décrivent une version plus ancienne (ils omettent l'outil d'horodatage et d'autres ajouts récents, et certains noms de fonctions listés / fonctionnalités « futures » ne correspondent pas au source). Considérer les fichiers `.js` réels comme la source de vérité ; les `AUDIT_*.md` / `PROJECT_ANALYSIS.md` à la racine sont des rapports datés, pas la spec actuelle.
