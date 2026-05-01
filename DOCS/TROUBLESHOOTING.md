# Dépannage - Markify

Guide de résolution des problèmes courants avec Markify.

## 🔍 Problèmes Courants

### La page ne se charge pas

#### Symptômes
- Page blanche
- Erreur JavaScript dans la console
- Modules ES6 non supportés

#### Solutions
1. **Vérifiez votre navigateur**
   - Utilisez Chrome 61+, Firefox 60+, Edge 16+, Safari 11+
   - Activez JavaScript

2. **Serveur local requis**
   ```bash
   # Avec Python
   python -m http.server 8000

   # Avec Node.js
   npx serve .
   ```

3. **Problème de CORS**
   - Ouvrez `index.html` directement depuis l'explorateur de fichiers
   - Ou utilisez un serveur local

### Les émojis ne s'affichent pas

#### Symptômes
- Carrés vides à la place des émojis
- Émojis déformés ou manquants

#### Solutions
1. **Police système**
   - Installez une police complète (Segoe UI, Noto Color Emoji)
   - Mettez à jour votre système d'exploitation

2. **Navigateur**
   - Utilisez un navigateur moderne
   - Activez le rendu des émojis

3. **Système d'exploitation**
   - Windows : Installez "Segoe UI Emoji"
   - macOS : Émojis natifs
   - Linux : Installez "Noto Color Emoji"

### La copie ne fonctionne pas

#### Symptômes
- Bouton "Copier" sans effet
- Message d'erreur "Impossible de copier"

#### Solutions
1. **API Clipboard**
   - Le site doit être en HTTPS (ou localhost)
   - Autorisez l'accès au presse-papiers

2. **Fallback automatique**
   - Markify utilise automatiquement une méthode alternative
   - Sélectionnez et copiez manuellement si nécessaire

3. **Navigateur**
   - Chrome : `chrome://settings/content/clipboard`
   - Firefox : `about:config` → `dom.events.asyncClipboard.clipboardItem`

### Les styles ne s'appliquent pas

#### Symptômes
- Clic sur bouton de style sans effet
- Aucun changement dans l'éditeur

#### Solutions
1. **Sélection de texte**
   - Sélectionnez d'abord le texte à styliser
   - Le curseur seul ne suffit pas

2. **Type de style**
   - Certains styles nécessitent une ligne entière
   - Vérifiez les exigences de chaque style

3. **Conflits**
   - Évitez de combiner Unicode et Markdown
   - Utilisez un style à la fois sur la même sélection

### L'aperçu ne se met pas à jour

#### Symptômes
- Modifications non visibles dans l'aperçu
- Désynchronisation éditeur/apercu

#### Solutions
1. **Actualisation manuelle**
   - Tapez quelque chose puis effacez
   - Changez de champ puis revenez

2. **Réinitialisation**
   - Utilisez le bouton "Réinitialiser"
   - Actualisez la page

3. **Console d'erreur**
   - Ouvrez les outils développeur (F12)
   - Vérifiez les erreurs JavaScript

### Problèmes de thème

#### Symptômes
- Thème qui ne change pas
- Styles incohérents

#### Solutions
1. **Basculement**
   - Cliquez sur 🌙/☀️ en haut à droite
   - Actualisez si nécessaire

2. **Cache navigateur**
   - Videz le cache CSS
   - Actualisez avec Ctrl+F5

3. **Support CSS**
   - Variables CSS requises
   - Navigateur moderne nécessaire

### Problèmes de langue

#### Symptômes
- Texte en anglais au lieu de français
- Mélange de langues

#### Solutions
1. **Basculement**
   - Cliquez sur "FR" en haut à droite
   - La préférence est sauvegardée

2. **Rechargement**
   - Actualisez la page après changement
   - Vérifiez la persistance

3. **Traductions manquantes**
   - Certaines chaînes peuvent être en anglais
   - Signalez pour ajout

## 🛠️ Outils de Diagnostic

### Console du Navigateur
```javascript
// Ouvrez les outils développeur (F12)
// Vérifiez l'onglet Console pour les erreurs

// Test de base
console.log('Markify loaded');

// Test des modules
import { translations } from './translations.js';
console.log('Translations:', translations);

// Test de l'état
import { state } from './config.js';
console.log('State:', state);
```

### Tests de Fonctionnalités
```javascript
// Test de la copie
navigator.clipboard.writeText('test').then(() => {
    console.log('Clipboard API works');
}).catch(err => {
    console.log('Clipboard API failed:', err);
});

// Test des émojis
const emoji = '😀';
const ctx = document.createElement('canvas').getContext('2d');
ctx.font = '16px Arial';
console.log('Emoji width:', ctx.measureText(emoji).width);
```

### Informations Système
```javascript
// Informations de debug
console.log('User Agent:', navigator.userAgent);
console.log('Language:', navigator.language);
console.log('Cookies enabled:', navigator.cookieEnabled);
console.log('Online:', navigator.onLine);
console.log('Clipboard API:', !!navigator.clipboard);
```

## 🔧 Solutions Avancées

### Mode Débogage
1. Ouvrez les outils développeur (F12)
2. Allez dans l'onglet Console
3. Rechargez la page
4. Notez toutes les erreurs JavaScript

### Réinitialisation Complète
```javascript
// Dans la console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Test en Mode Incognito
- Élimine les problèmes de cache/extension
- Test des permissions fraiches
- Vérification des cookies désactivés

### Extensions Navigateur
Certaines extensions peuvent interférer :
- Bloqueurs de pubs
- Extensions de sécurité
- Gestionnaires de mots de passe

Testez avec les extensions désactivées.

## 📞 Support

### Signaler un Bug
1. **Description claire** du problème
2. **Étapes de reproduction**
3. **Navigateur et version**
4. **Captures d'écran** si pertinent
5. **Logs de console**

### Contact
- **Discord** : [REDIOUS Server](https://discord.gg/6b4NYRNsRC)
- **GitHub Issues** : Pour les rapports de bugs techniques

### Environnements Testés
- ✅ Chrome 90+ (Windows/macOS/Linux)
- ✅ Firefox 88+ (Windows/macOS/Linux)
- ✅ Edge 90+ (Windows)
- ✅ Safari 14+ (macOS/iOS)

## 🚀 Performances

### Optimisations
- **Chargement initial** : < 2 secondes
- **Temps de réponse** : < 100ms pour les actions
- **Mémoire** : < 50MB d'utilisation

### Si lent
1. **Fermez les autres onglets**
2. **Actualisez la page**
3. **Videz le cache**
4. **Redémarrez le navigateur**

### Sur mobile
- **Connexion stable** requise
- **Mémoire suffisante** (> 500MB libre)
- **Navigateur optimisé** (pas de mode économie)

---

**Guide utilisateur :** [USER_GUIDE.md](USER_GUIDE.md) |
**Guide développeur :** [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)</content>
<parameter name="filePath">c:\CODE\discord_tools_no_official\DOCS\TROUBLESHOOTING.md