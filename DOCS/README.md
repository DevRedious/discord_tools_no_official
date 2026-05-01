# Markify - Discord Message Editor

Markify est un éditeur de messages et sélecteur d'émojis pour Discord, conçu pour aider les gestionnaires de serveur Discord à créer des messages stylisés avec du Markdown, des émojis et des polices Unicode.

## 🌟 Fonctionnalités

### Éditeur de Messages
- **Éditeur en temps réel** avec aperçu Discord intégré
- **Styles Markdown Discord** : gras, italique, souligné, barré, spoiler, code inline
- **Titres** : H1, H2, H3
- **Blocs spéciaux** : citations, blocs de code, listes
- **Protection automatique** des codes Discord (mentions, canaux, rôles)

### Sélecteur d'Émojis
- **Collection complète** d'émojis organisée par catégories
- **Recherche intelligente** par nom ou mot-clé
- **Insertion directe** dans l'éditeur
- **Astuce drapeaux** : combinaison d'émojis régionaux

### Polices Unicode
- **15 polices différentes** : Gras, Italique, Script, Monospace, etc.
- **Effets spéciaux** : Zalgo, Upside Down, Aesthetic
- **Aperçu en temps réel**

### Fonctionnalités Utiles
- **Comptage de caractères** (limites standard et Nitro)
- **Thème sombre/clair** avec basculement automatique
- **Internationalisation** (Français/Anglais)
- **Copie en un clic** vers le presse-papiers
- **Réinitialisation rapide** de l'éditeur

## 🚀 Utilisation

### Installation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/devredious/discord_tools_no_official.git
   cd discord_tools_no_official
   ```

2. Ouvrez `index.html` dans votre navigateur web

### Utilisation de Base
1. **Tapez votre message** dans la zone de texte centrale
2. **Sélectionnez le texte** à styliser
3. **Cliquez sur un style** dans la colonne de droite pour l'appliquer
4. **Ajoutez des émojis** en cliquant dessus dans la colonne de gauche
5. **Prévisualisez** le résultat dans la section "Aperçu Discord"
6. **Copiez le message** avec le bouton "Copier le message"

### Raccourcis et Astuces
- Les **codes Discord** (`<#123>`, `<@123>`, `<@&123>`) sont automatiquement protégés
- Utilisez la **recherche d'émojis** pour trouver rapidement ce dont vous avez besoin
- Combinez **deux émojis régionaux** pour créer des drapeaux de pays
- Le **compte de caractères** vous indique les limites Discord

## 🛠️ Architecture Technique

### Structure des Fichiers
```
discord_tools_no_official/
├── index.html          # Page principale
├── style.css           # Styles CSS
├── script.js           # Logique principale
├── config.js           # Configuration et données
├── emoji.js            # Gestion des émojis
├── translations.js     # Internationalisation
└── DOCS/               # Documentation
```

### Technologies Utilisées
- **HTML5** pour la structure
- **CSS3** avec variables CSS pour les thèmes
- **JavaScript ES6+** modules
- **API Clipboard** pour la copie
- **Responsive Design** pour tous les appareils

### Modules JavaScript
- **`config.js`** : Configuration des styles Markdown et polices Unicode
- **`emoji.js`** : Gestion des émojis et recherche
- **`translations.js`** : Support multilingue
- **`script.js`** : Logique principale de l'application

## 🎨 Personnalisation

### Ajouter de Nouveaux Styles Markdown
Modifiez `config.js` dans la section `markdownStyles` :

```javascript
{
    id: 'nouveau-style',
    labels: { fr: 'Nouveau', en: 'New' },
    prefix: '**',
    suffix: '**',
    type: 'style',
    preview: sample => `<strong>${sample}</strong>`
}
```

### Ajouter des Émojis
Modifiez `emoji.js` dans la section appropriée :

```javascript
{ e: '🔥', n: ['fire', 'feu', 'hot', 'chaud'] }
```

### Ajouter une Langue
Modifiez `translations.js` :

```javascript
es: {
    subtitle: 'Editor de mensajes y emojis para Discord',
    // ... autres traductions
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

### Types de Contributions
- **Corrections de bugs**
- **Nouvelles fonctionnalités**
- **Améliorations de l'interface**
- **Nouvelles langues**
- **Documentation**

## 📄 Licence

Ce projet est créé par [REDIOUS](https://discord.gg/6b4NYRNsRC) pour aider les gestionnaires de serveur Discord.

## 🙏 Remerciements

- Merci à la communauté Discord pour l'inspiration
- Émojis fournis par Unicode Consortium
- Icônes et design inspirés des meilleures pratiques UX

---

**Lien du projet :** [https://devredious.github.io/discord_tools_no_official/](https://devredious.github.io/discord_tools_no_official/)</content>
<parameter name="filePath">c:\CODE\discord_tools_no_official\DOCS\README.md