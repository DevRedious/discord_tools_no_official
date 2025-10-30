// MARKIFY MAIN SCRIPT
const translations = {
    fr: {
        subtitle: 'Éditeur de messages et émojis pour Discord',
        'emojis-title': 'Sélecteur d\'Émojis',
        'emoji-search': 'Rechercher un emoji...',
        'flag-info': '💡 <strong>Astuce drapeaux :</strong> Vous pouvez combiner deux émojis de lettres régionales pour créer des drapeaux de pays !<br>Exemple : 🇫 + 🇷 = 🇫🇷',
        'editor-title': 'Éditeur de Messages',
        'how-to-use': 'Comment utiliser :',
        'how-to-content': '<ul><li>Tapez votre message dans l\'éditeur</li><li>Sélectionnez la partie à styliser</li><li>Cliquez sur un style pour l\'appliquer</li><li>Les codes Discord sont automatiquement protégés</li></ul>',
        'markdown-title': 'Styles Markdown Discord',
        'basic-formatting': 'Basique',
        'headings': 'Titres',
        'special': 'Spéciaux',
        'unicode-fonts': 'Polices Unicode',
        'unicode-warning': '⚠️ Combiner Markdown et polices Unicode peut altérer l\'affichage final sur Discord.',
        'your-message': 'Zone de Texte',
        'editor-placeholder': 'Tapez votre message ici...\n\nExemples :\n- Channel : <#123456789>\n- Rôle : <@&123456789>\n- Utilisateur : <@123456789>',
        'preview-title': 'Aperçu Discord',
        'preview-placeholder': 'Votre aperçu apparaîtra ici...',
        'copy-btn': 'Copier le message',
        'reset-btn': 'Réinitialiser',
        'footer-text': 'Site créé par',
        'footer-text2': 'pour aider les gestionnaires de serveur Discord',
        'copied': '✓ Copié !',
        'copy-error': '❌ Impossible de copier.',
        'select-text': '⚠️ Sélectionnez du texte d\'abord !',
        'style-applied': '✓ Style appliqué !',
        'markdown-order-warning': '⚠️ Ordre Markdown incorrect : placez d\'abord le symbole de structure (#, >, -), puis appliquez le style.',
        'protected-warning': '⚠️ Format protégé détecté : modification ignorée.',
        'no-message': '⚠️ Aucun message à copier !',
        'reset-done': '🔄 Éditeur réinitialisé !',
        'emoji-copied': 'Emoji ajouté et copié !',
        'no-emoji-results': 'Aucun emoji trouvé pour cette recherche.',
        'style-sample': 'Texte'
    },
    en: {
        subtitle: 'Emoji message & emoji editor for Discord',
        'emojis-title': 'Emoji Picker',
        'emoji-search': 'Search for an emoji...',
        'flag-info': '💡 <strong>Flag tip:</strong> Combine two regional letter emojis to create country flags!<br>Example: 🇫 + 🇷 = 🇫🇷',
        'editor-title': 'Message Editor',
        'how-to-use': 'How to use:',
        'how-to-content': '<ul><li>Type your message in the editor</li><li>Select the part to style</li><li>Click a style button to apply it</li><li>Discord codes are automatically protected</li></ul>',
        'markdown-title': 'Discord Markdown Styles',
        'basic-formatting': 'Basic',
        'headings': 'Headings',
        'special': 'Special',
        'unicode-fonts': 'Unicode Fonts',
        'unicode-warning': '⚠️ Combining Markdown and Unicode fonts may change the final rendering on Discord.',
        'your-message': 'Text Area',
        'editor-placeholder': 'Type your message here...\n\nExamples:\n- Channel: <#123456789>\n- Role: <@&123456789>\n- User: <@123456789>',
        'preview-title': 'Discord Preview',
        'preview-placeholder': 'Your preview will appear here...',
        'copy-btn': 'Copy message',
        'reset-btn': 'Reset',
        'footer-text': 'Website created by',
        'footer-text2': 'to help Discord server managers',
        'copied': '✓ Copied!',
        'copy-error': '❌ Unable to copy.',
        'select-text': '⚠️ Select text first!',
        'style-applied': '✓ Style applied!',
        'markdown-order-warning': '⚠️ Markdown order error: add the structure symbol (#, >, -) before applying the style.',
        'protected-warning': '⚠️ Protected Discord format detected: action ignored.',
        'no-message': '⚠️ Nothing to copy!',
        'reset-done': '🔄 Editor cleared!',
        'emoji-copied': 'Emoji added and copied!',
        'no-emoji-results': 'No emoji matches your search.',
        'style-sample': 'Text'
    }
};

const markdownStyles = {
    basic: [
        {
            id: 'bold',
            labels: { fr: 'Gras', en: 'Bold' },
            prefix: '**',
            suffix: '**',
            type: 'style',
            preview: sample => `<strong>${sample}</strong>`
        },
        {
            id: 'italic',
            labels: { fr: 'Italique', en: 'Italic' },
            prefix: '*',
            suffix: '*',
            type: 'style',
            preview: sample => `<em>${sample}</em>`
        },
        {
            id: 'underline',
            labels: { fr: 'Souligné', en: 'Underline' },
            prefix: '__',
            suffix: '__',
            type: 'style',
            preview: sample => `<span class="preview-underline">${sample}</span>`
        },
        {
            id: 'strikethrough',
            labels: { fr: 'Barré', en: 'Strikethrough' },
            prefix: '~~',
            suffix: '~~',
            type: 'style',
            preview: sample => `<s>${sample}</s>`
        },
        {
            id: 'spoiler',
            labels: { fr: 'Spoiler', en: 'Spoiler' },
            prefix: '||',
            suffix: '||',
            type: 'style',
            preview: sample => `<span class="preview-spoiler">${sample}</span>`
        },
        {
            id: 'inline-code',
            labels: { fr: 'Code inline', en: 'Inline code' },
            prefix: '`',
            suffix: '`',
            type: 'style',
            preview: sample => `<code class="preview-code">${sample}</code>`
        }
    ],
    headings: [
        {
            id: 'heading1',
            labels: { fr: 'Titre 1', en: 'Heading 1' },
            prefix: '# ',
            suffix: '',
            type: 'structure',
            preview: sample => `<span class="preview-heading h1">${sample}</span>`
        },
        {
            id: 'heading2',
            labels: { fr: 'Titre 2', en: 'Heading 2' },
            prefix: '## ',
            suffix: '',
            type: 'structure',
            preview: sample => `<span class="preview-heading h2">${sample}</span>`
        },
        {
            id: 'heading3',
            labels: { fr: 'Titre 3', en: 'Heading 3' },
            prefix: '### ',
            suffix: '',
            type: 'structure',
            preview: sample => `<span class="preview-heading h3">${sample}</span>`
        }
    ],
    special: [
        {
            id: 'quote',
            labels: { fr: 'Citation', en: 'Quote' },
            prefix: '> ',
            suffix: '',
            type: 'structure',
            preview: sample => `<span class="preview-quote">&gt; ${sample}</span>`
        },
        {
            id: 'multiline-quote',
            labels: { fr: 'Citation multi-ligne', en: 'Multiline quote' },
            prefix: '>>> ',
            suffix: '',
            type: 'structure',
            preview: sample => `<span class="preview-quote">&gt;&gt;&gt; ${sample}</span>`
        },
        {
            id: 'codeblock',
            labels: { fr: 'Bloc de code', en: 'Code block' },
            prefix: '```
',
            suffix: '
```',
            type: 'block',
            preview: sample => `<span class="preview-code">${sample}</span>`
        },
        {
            id: 'list',
            labels: { fr: 'Liste', en: 'List' },
            prefix: '- ',
            suffix: '',
            type: 'structure',
            preview: sample => `<span class="preview-list">${sample}</span>`
        }
    ]
};


const unicodeFonts = {
    'Bold': { offsetLower: 0x1d41a, offsetUpper: 0x1d400, offsetNumber: 0x1d7ce },
    'Italic': { offsetLower: 0x1d44e, offsetUpper: 0x1d434 },
    'Bold Italic': { offsetLower: 0x1d482, offsetUpper: 0x1d468 },
    'Sans Serif': { offsetLower: 0x1d5ba, offsetUpper: 0x1d5a0, offsetNumber: 0x1d7e2 },
    'Sans Bold': { offsetLower: 0x1d5f4, offsetUpper: 0x1d5da, offsetNumber: 0x1d7ec },
    'Monospace': { offsetLower: 0x1d68a, offsetUpper: 0x1d670, offsetNumber: 0x1d7f6 },
    'Double': { offsetLower: 0x1d552, offsetUpper: 0x1d538, offsetNumber: 0x1d7d8 },
    'Script': { offsetLower: 0x1d4b6, offsetUpper: 0x1d4ae },
    'Fraktur': { offsetLower: 0x1d586, offsetUpper: 0x1d56c },
    'Fullwidth': { offsetLower: 0xff41, offsetUpper: 0xff21, offsetNumber: 0xff10 },
    'Small Caps': { map: { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' } },
    'Upside Down': { map: { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z' }, reverse: true },
    'Wavy': { map: { a: 'ค', b: '๖', c: '¢', d: '໓', e: 'ē', f: 'f', g: 'ງ', h: 'h', i: 'i', j: 'ว', k: 'k', l: 'l', m: '๓', n: 'ຖ', o: '໐', p: 'p', q: '๑', r: 'r', s: 'Ş', t: 't', u: 'น', v: 'ง', w: 'ຟ', x: 'x', y: 'ฯ', z: 'ຊ' } },
    'Zalgo': { special: 'zalgo' },
    'Aesthetic': { special: 'aesthetic' },
    'Strikethrough': { special: 'strikethrough' }
};

const protectedPattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|<#[0-9]+>|<@&[0-9]+>|<@[0-9]+>)/;

const emojiData = {
    'Smileys': [
        {e: '😀', n: ['grinning', 'smile', 'happy', 'sourire']}, {e: '😃', n: ['smiley', 'happy', 'heureux']}, {e: '😄', n: ['smile', 'laugh', 'rire']}, {e: '😁', n: ['grin', 'sourire']}, {e: '😆', n: ['laughing', 'rire']}, {e: '😅', n: ['sweat', 'smile']}, {e: '🤣', n: ['rofl', 'mdr']}, {e: '😂', n: ['joy', 'tears', 'larme']}, {e: '🙂', n: ['smile']}, {e: '😉', n: ['wink', 'clin']}, {e: '😊', n: ['blush']}, {e: '😇', n: ['angel', 'ange']}, {e: '🥰', n: ['love', 'amour', 'coeur']}, {e: '😍', n: ['heart', 'eyes']}, {e: '🤩', n: ['star', 'etoile']}, {e: '😘', n: ['kiss', 'bisou']}, {e: '😋', n: ['yum', 'miam']}, {e: '😛', n: ['tongue', 'langue']}, {e: '😜', n: ['wink', 'tongue']}, {e: '🤪', n: ['crazy', 'fou']}, {e: '😝', n: ['tongue']}, {e: '🤑', n: ['money', 'argent']}, {e: '🤗', n: ['hug', 'calin']}, {e: '🤭', n: ['oops']}, {e: '🤫', n: ['shh', 'chut']}, {e: '🤔', n: ['thinking']}, {e: '🤐', n: ['zipper']}, {e: '🤨', n: ['raised', 'eyebrow']}, {e: '😐', n: ['neutral']}, {e: '😑', n: ['expressionless']}, {e: '😶', n: ['no', 'mouth']}, {e: '😏', n: ['smirk']}, {e: '😒', n: ['unamused']}, {e: '🙄', n: ['rolling', 'eyes']}, {e: '😬', n: ['grimacing']}, {e: '🤥', n: ['lying']}, {e: '😌', n: ['relieved']}, {e: '😔', n: ['pensive']}, {e: '😪', n: ['sleepy']}, {e: '🤤', n: ['drooling']}, {e: '😴', n: ['sleeping', 'dormir']}, {e: '😷', n: ['mask', 'sick', 'malade']}, {e: '🤒', n: ['thermometer', 'sick']}, {e: '🤕', n: ['bandage']}, {e: '🤢', n: ['nauseated']}, {e: '🤮', n: ['vomiting']}, {e: '🤧', n: ['sneezing']}, {e: '🥵', n: ['hot']}, {e: '🥶', n: ['cold', 'froid']}, {e: '😵', n: ['dizzy']}, {e: '🤯', n: ['mind', 'blown']}, {e: '🥳', n: ['party', 'fete']}, {e: '😎', n: ['sunglasses', 'cool']}, {e: '🤓', n: ['nerd']}, {e: '🧐', n: ['monocle']}, {e: '😕', n: ['confused']}, {e: '😟', n: ['worried']}, {e: '🙁', n: ['slightly', 'frown']}, {e: '☹️', n: ['frown']}, {e: '😮', n: ['open', 'mouth']}, {e: '😯', n: ['hushed']}, {e: '😲', n: ['astonished']}, {e: '😳', n: ['flushed']}, {e: '🥺', n: ['pleading']}, {e: '😦', n: ['frowning']}, {e: '😧', n: ['anguished']}, {e: '😨', n: ['fearful', 'peur']}, {e: '😰', n: ['anxious', 'sweat']}, {e: '😥', n: ['sad', 'triste']}, {e: '😢', n: ['cry', 'pleurer']}, {e: '😭', n: ['loudly', 'crying']}, {e: '😱', n: ['scream']}, {e: '😖', n: ['confounded']}, {e: '😣', n: ['persevering']}, {e: '😞', n: ['disappointed']}, {e: '😓', n: ['downcast', 'sweat']}, {e: '😩', n: ['weary']}, {e: '😫', n: ['tired']}, {e: '🥱', n: ['yawning']}, {e: '😤', n: ['triumph']}, {e: '😡', n: ['angry', 'colere']}, {e: '😠', n: ['anger']}, {e: '🤬', n: ['cursing']}, {e: '👿', n: ['imp']}, {e: '💀', n: ['skull', 'mort', 'death']}, {e: '☠️', n: ['skull', 'crossbones']}, {e: '💩', n: ['poop', 'caca']}, {e: '🤡', n: ['clown']}, {e: '👹', n: ['ogre']}, {e: '👺', n: ['goblin']}, {e: '👻', n: ['ghost', 'fantome']}, {e: '👽', n: ['alien']}, {e: '👾', n: ['alien', 'space']}, {e: '🤖', n: ['robot']}, {e: '😺', n: ['cat', 'smile', 'chat']}, {e: '😸', n: ['cat', 'grin']}, {e: '😹', n: ['cat', 'joy']}, {e: '😻', n: ['cat', 'heart']}, {e: '😼', n: ['cat', 'smirk']}, {e: '😽', n: ['cat', 'kiss']}, {e: '🙀', n: ['cat', 'scream']}, {e: '😿', n: ['cat', 'cry']}, {e: '😾', n: ['cat', 'pouting']}
    ],
    'Gestes': [
        {e: '👋', n: ['wave', 'salut', 'hello']}, {e: '🤚', n: ['hand', 'raised', 'main']}, {e: '🖐️', n: ['hand', 'fingers']}, {e: '✋', n: ['hand', 'stop']}, {e: '🖖', n: ['vulcan', 'spock']}, {e: '👌', n: ['ok', 'okay']}, {e: '🤏', n: ['pinching']}, {e: '✌️', n: ['victory', 'peace']}, {e: '🤞', n: ['crossed', 'fingers']}, {e: '🤟', n: ['love', 'you']}, {e: '🤘', n: ['horns', 'rock']}, {e: '🤙', n: ['call', 'me']}, {e: '👈', n: ['left', 'gauche']}, {e: '👉', n: ['right', 'droite']}, {e: '👆', n: ['up', 'haut']}, {e: '🖕', n: ['middle', 'finger']}, {e: '👇', n: ['down', 'bas']}, {e: '☝️', n: ['point', 'up']}, {e: '👍', n: ['thumbs', 'up', 'like']}, {e: '👎', n: ['thumbs', 'down', 'dislike']}, {e: '✊', n: ['fist', 'poing']}, {e: '👊', n: ['fist', 'bump']}, {e: '🤛', n: ['left', 'fist']}, {e: '🤜', n: ['right', 'fist']}, {e: '👏', n: ['clap', 'applause']}, {e: '🙌', n: ['raising', 'hands']}, {e: '👐', n: ['open', 'hands']}, {e: '🤲', n: ['palms', 'together']}, {e: '🤝', n: ['handshake']}, {e: '🙏', n: ['pray', 'thanks', 'merci']}, {e: '✍️', n: ['writing', 'ecrire']}, {e: '💅', n: ['nail', 'polish']}, {e: '🤳', n: ['selfie']}, {e: '💪', n: ['muscle', 'strong', 'fort']}, {e: '🦾', n: ['mechanical', 'arm']}, {e: '🦿', n: ['mechanical', 'leg']}, {e: '🦵', n: ['leg', 'jambe']}, {e: '🦶', n: ['foot', 'pied']}, {e: '👂', n: ['ear', 'oreille']}, {e: '🦻', n: ['ear', 'hearing']}, {e: '👃', n: ['nose', 'nez']}, {e: '🧠', n: ['brain', 'cerveau']}, {e: '🦷', n: ['tooth', 'dent']}, {e: '🦴', n: ['bone', 'os']}, {e: '👀', n: ['eyes', 'yeux']}, {e: '👁️', n: ['eye', 'oeil']}, {e: '👅', n: ['tongue', 'langue']}, {e: '👄', n: ['lips', 'levres', 'kiss']}
    ],
    'Personnes': [
        {e: '👶', n: ['baby', 'bebe']}, {e: '🧒', n: ['child', 'enfant']}, {e: '👦', n: ['boy', 'garcon']}, {e: '👧', n: ['girl', 'fille']}, {e: '🧑', n: ['person', 'personne']}, {e: '👨', n: ['man', 'homme']}, {e: '👩', n: ['woman', 'femme']}, {e: '🧓', n: ['older', 'person']}, {e: '👴', n: ['old', 'man']}, {e: '👵', n: ['old', 'woman']}, {e: '👨‍⚕️', n: ['doctor', 'docteur', 'medecin']}, {e: '👩‍⚕️', n: ['doctor', 'woman']}, {e: '👨‍🎓', n: ['student', 'etudiant']}, {e: '👩‍🎓', n: ['student', 'woman']}, {e: '👨‍🏫', n: ['teacher', 'professeur']}, {e: '👩‍🏫', n: ['teacher', 'woman']}, {e: '👨‍⚖️', n: ['judge', 'juge']}, {e: '👩‍⚖️', n: ['judge', 'woman']}, {e: '👨‍🌾', n: ['farmer', 'agriculteur']}, {e: '👩‍🌾', n: ['farmer', 'woman']}, {e: '👨‍🍳', n: ['cook', 'chef', 'cuisinier']}, {e: '👩‍🍳', n: ['cook', 'woman']}, {e: '👨‍🔧', n: ['mechanic']}, {e: '👩‍🔧', n: ['mechanic', 'woman']}, {e: '👨‍🏭', n: ['factory', 'worker']}, {e: '👩‍🏭', n: ['factory', 'woman']}, {e: '👨‍💼', n: ['office', 'worker', 'bureau']}, {e: '👩‍💼', n: ['office', 'woman']}, {e: '👨‍🔬', n: ['scientist']}, {e: '👩‍🔬', n: ['scientist', 'woman']}, {e: '👨‍💻', n: ['technologist', 'dev', 'programmer']}, {e: '👩‍💻', n: ['technologist', 'woman']}, {e: '👨‍🎤', n: ['singer', 'chanteur']}, {e: '👩‍🎤', n: ['singer', 'woman']}, {e: '👨‍🎨', n: ['artist', 'artiste']}, {e: '👩‍🎨', n: ['artist', 'woman']}, {e: '👨‍✈️', n: ['pilot']}, {e: '👩‍✈️', n: ['pilot', 'woman']}, {e: '👨‍🚀', n: ['astronaut']}, {e: '👩‍🚀', n: ['astronaut', 'woman']}, {e: '👨‍🚒', n: ['firefighter', 'pompier']}, {e: '👩‍🚒', n: ['firefighter', 'woman']}, {e: '👮', n: ['police', 'cop']}, {e: '👮‍♂️', n: ['police', 'man']}, {e: '👮‍♀️', n: ['police', 'woman']}, {e: '🕵️', n: ['detective']}, {e: '💂', n: ['guard']}, {e: '👷', n: ['construction', 'worker']}, {e: '🤴', n: ['prince']}, {e: '👸', n: ['princess', 'princesse']}, {e: '👳', n: ['turban']}, {e: '👲', n: ['person', 'skullcap']}, {e: '🧕', n: ['headscarf']}, {e: '🤵', n: ['tuxedo']}, {e: '👰', n: ['bride', 'mariee']}, {e: '🤰', n: ['pregnant', 'enceinte']}, {e: '🤱', n: ['breastfeeding']}, {e: '👼', n: ['angel', 'ange']}, {e: '🎅', n: ['santa', 'noel', 'christmas']}, {e: '🤶', n: ['mrs', 'claus']}, {e: '🦸', n: ['superhero']}, {e: '🦹', n: ['supervillain']}, {e: '🧙', n: ['mage', 'wizard', 'magicien']}, {e: '🧚', n: ['fairy', 'fee']}, {e: '🧛', n: ['vampire']}, {e: '🧜', n: ['merperson', 'sirene']}, {e: '🧝', n: ['elf', 'elfe']}, {e: '🧞', n: ['genie']}, {e: '🧟', n: ['zombie']}, {e: '💆', n: ['massage']}, {e: '💇', n: ['haircut', 'coiffure']}, {e: '🚶', n: ['walking', 'marcher']}, {e: '🧍', n: ['standing']}, {e: '🧎', n: ['kneeling']}, {e: '🏃', n: ['running', 'courir']}, {e: '💃', n: ['dancing', 'danser']}, {e: '🕺', n: ['dancing', 'man']}, {e: '🕴️', n: ['suit', 'levitating']}, {e: '👯', n: ['people', 'bunny']}, {e: '🧖', n: ['sauna']}, {e: '🧗', n: ['climbing', 'escalade']}, {e: '🤺', n: ['fencing']}, {e: '🏇', n: ['horse', 'racing']}, {e: '⛷️', n: ['skier', 'ski']}, {e: '🏂', n: ['snowboard']}, {e: '🏌️', n: ['golf']}, {e: '🏄', n: ['surfing', 'surf']}, {e: '🚣', n: ['rowing', 'boat']}, {e: '🏊', n: ['swimming', 'nager']}, {e: '⛹️', n: ['basketball']}, {e: '🏋️', n: ['weightlifting']}, {e: '🚴', n: ['biking', 'velo']}, {e: '🚵', n: ['mountain', 'bike']}, {e: '🤸', n: ['cartwheeling']}, {e: '🤼', n: ['wrestling']}, {e: '🤽', n: ['water', 'polo']}, {e: '🤾', n: ['handball']}, {e: '🤹', n: ['juggling']}, {e: '🧘', n: ['lotus', 'yoga', 'meditation']}, {e: '🛀', n: ['bath', 'bain']}, {e: '🛌', n: ['sleeping', 'bed', 'lit']}
    ],
    'Animaux': [
        {e: '🐶', n: ['dog', 'chien']}, {e: '🐱', n: ['cat', 'chat']}, {e: '🐭', n: ['mouse', 'souris']}, {e: '🐹', n: ['hamster']}, {e: '🐰', n: ['rabbit', 'lapin']}, {e: '🦊', n: ['fox', 'renard']}, {e: '🐻', n: ['bear', 'ours']}, {e: '🐼', n: ['panda']}, {e: '🐨', n: ['koala']}, {e: '🐯', n: ['tiger', 'tigre']}, {e: '🦁', n: ['lion']}, {e: '🐮', n: ['cow', 'vache']}, {e: '🐷', n: ['pig', 'cochon']}, {e: '🐽', n: ['pig', 'nose']}, {e: '🐸', n: ['frog', 'grenouille']}, {e: '🐵', n: ['monkey', 'singe']}, {e: '🙈', n: ['see', 'no', 'evil']}, {e: '🙉', n: ['hear', 'no', 'evil']}, {e: '🙊', n: ['speak', 'no', 'evil']}, {e: '🐒', n: ['monkey']}, {e: '🐔', n: ['chicken', 'poulet']}, {e: '🐧', n: ['penguin', 'pingouin']}, {e: '🐦', n: ['bird', 'oiseau']}, {e: '🐤', n: ['baby', 'chick']}, {e: '🐣', n: ['hatching', 'chick']}, {e: '🐥', n: ['front', 'chick']}, {e: '🦆', n: ['duck', 'canard']}, {e: '🦅', n: ['eagle', 'aigle']}, {e: '🦉', n: ['owl', 'hibou']}, {e: '🦇', n: ['bat', 'chauve', 'souris']}, {e: '🐺', n: ['wolf', 'loup']}, {e: '🐗', n: ['boar', 'sanglier']}, {e: '🐴', n: ['horse', 'cheval']}, {e: '🦄', n: ['unicorn', 'licorne']}, {e: '🐝', n: ['bee', 'abeille']}, {e: '🐛', n: ['bug', 'insect']}, {e: '🦋', n: ['butterfly', 'papillon']}, {e: '🐌', n: ['snail', 'escargot']}, {e: '🐞', n: ['ladybug', 'coccinelle']}, {e: '🐜', n: ['ant', 'fourmi']}, {e: '🦟', n: ['mosquito', 'moustique']}, {e: '🦗', n: ['cricket']}, {e: '🕷️', n: ['spider', 'araignee']}, {e: '🦂', n: ['scorpion']}, {e: '🐢', n: ['turtle', 'tortue']}, {e: '🐍', n: ['snake', 'serpent']}, {e: '🦎', n: ['lizard', 'lezard']}, {e: '🦖', n: ['dinosaur', 't-rex']}, {e: '🦕', n: ['dinosaur']}, {e: '🐙', n: ['octopus', 'pieuvre']}, {e: '🦑', n: ['squid', 'calamar']}, {e: '🦐', n: ['shrimp', 'crevette']}, {e: '🦞', n: ['lobster', 'homard']}, {e: '🦀', n: ['crab', 'crabe']}, {e: '🐡', n: ['blowfish', 'poisson']}, {e: '🐠', n: ['tropical', 'fish', 'poisson']}, {e: '🐟', n: ['fish', 'poisson']}, {e: '🐬', n: ['dolphin', 'dauphin']}, {e: '🐳', n: ['whale', 'baleine']}, {e: '🐋', n: ['whale']}, {e: '🦈', n: ['shark', 'requin']}, {e: '🐊', n: ['crocodile']}, {e: '🐅', n: ['tiger']}, {e: '🐆', n: ['leopard']}, {e: '🦓', n: ['zebra', 'zebre']}, {e: '🦍', n: ['gorilla', 'gorille']}, {e: '🦧', n: ['orangutan']}, {e: '🐘', n: ['elephant']}, {e: '🦛', n: ['hippopotamus']}, {e: '🦏', n: ['rhinoceros']}, {e: '🐪', n: ['camel', 'chameau']}, {e: '🐫', n: ['camel']}, {e: '🦒', n: ['giraffe', 'girafe']}, {e: '🦘', n: ['kangaroo', 'kangourou']}, {e: '🐃', n: ['water', 'buffalo']}, {e: '🐂', n: ['ox']}, {e: '🐄', n: ['cow']}, {e: '🐎', n: ['horse']}, {e: '🐖', n: ['pig']}, {e: '🐏', n: ['ram', 'mouton']}, {e: '🐑', n: ['sheep', 'mouton']}, {e: '🦙', n: ['llama']}, {e: '🐐', n: ['goat', 'chevre']}, {e: '🦌', n: ['deer', 'cerf']}, {e: '🐕', n: ['dog']}, {e: '🐩', n: ['poodle']}, {e: '🦮', n: ['guide', 'dog']}, {e: '🐕‍🦺', n: ['service', 'dog']}, {e: '🐈', n: ['cat']}, {e: '🐓', n: ['rooster', 'coq']}, {e: '🦃', n: ['turkey', 'dinde']}, {e: '🦚', n: ['peacock', 'paon']}, {e: '🦜', n: ['parrot', 'perroquet']}, {e: '🦢', n: ['swan', 'cygne']}, {e: '🦩', n: ['flamingo']}, {e: '🕊️', n: ['dove', 'colombe']}, {e: '🐇', n: ['rabbit']}, {e: '🦝', n: ['raccoon']}, {e: '🦨', n: ['skunk']}, {e: '🦡', n: ['badger', 'blaireau']}, {e: '🦦', n: ['otter', 'loutre']}, {e: '🦥', n: ['sloth', 'paresseux']}, {e: '🐁', n: ['mouse']}, {e: '🐀', n: ['rat']}, {e: '🐿️', n: ['chipmunk', 'ecureuil']}, {e: '🦔', n: ['hedgehog', 'herisson']}, {e: '🐾', n: ['paw', 'prints', 'patte']}, {e: '🐉', n: ['dragon']}, {e: '🐲', n: ['dragon', 'face']}, {e: '🌵', n: ['cactus']}, {e: '🎄', n: ['christmas', 'tree', 'noel']}, {e: '🌲', n: ['evergreen', 'tree', 'arbre']}, {e: '🌳', n: ['deciduous', 'tree']}, {e: '🌴', n: ['palm', 'tree', 'palmier']}, {e: '🌱', n: ['seedling', 'plante']}, {e: '🌿', n: ['herb', 'herbe']}, {e: '☘️', n: ['shamrock', 'trefle']}, {e: '🍀', n: ['four', 'leaf', 'clover']}, {e: '🎍', n: ['bamboo']}, {e: '🎋', n: ['tanabata']}, {e: '🍃', n: ['leaves', 'feuilles']}, {e: '🍂', n: ['fallen', 'leaf']}, {e: '🍁', n: ['maple', 'leaf', 'feuille']}, {e: '🌾', n: ['sheaf', 'rice']}, {e: '💐', n: ['bouquet', 'flowers', 'fleurs']}, {e: '🌷', n: ['tulip', 'tulipe']}, {e: '🌹', n: ['rose']}, {e: '🥀', n: ['wilted', 'flower']}, {e: '🌺', n: ['hibiscus']}, {e: '🌸', n: ['cherry', 'blossom']}, {e: '🌼', n: ['blossom', 'fleur']}, {e: '🌻', n: ['sunflower', 'tournesol']}, {e: '🌞', n: ['sun', 'face', 'soleil']}, {e: '🌝', n: ['full', 'moon', 'lune']}, {e: '🌛', n: ['first', 'quarter', 'moon']}, {e: '🌜', n: ['last', 'quarter', 'moon']}, {e: '🌚', n: ['new', 'moon']}, {e: '🌕', n: ['full', 'moon']}, {e: '🌖', n: ['waning', 'gibbous']}, {e: '🌗', n: ['last', 'quarter']}, {e: '🌘', n: ['waning', 'crescent']}, {e: '🌑', n: ['new', 'moon']}, {e: '🌒', n: ['waxing', 'crescent']}, {e: '🌓', n: ['first', 'quarter']}, {e: '🌔', n: ['waxing', 'gibbous']}, {e: '🌙', n: ['crescent', 'moon']}, {e: '🌎', n: ['earth', 'americas', 'terre']}, {e: '🌍', n: ['earth', 'europe', 'africa']}, {e: '🌏', n: ['earth', 'asia']}, {e: '💫', n: ['dizzy', 'star', 'etoile']}, {e: '⭐', n: ['star', 'etoile']}, {e: '🌟', n: ['glowing', 'star']}, {e: '✨', n: ['sparkles', 'etincelles']}, {e: '⚡', n: ['lightning', 'eclair']}, {e: '☄️', n: ['comet', 'comete']}, {e: '💥', n: ['collision', 'boom']}, {e: '🔥', n: ['fire', 'feu', 'flame']}, {e: '🌪️', n: ['tornado']}, {e: '🌈', n: ['rainbow', 'arc', 'en', 'ciel']}, {e: '☀️', n: ['sun', 'soleil']}, {e: '🌤️', n: ['sun', 'cloud']}, {e: '⛅', n: ['cloud', 'sun', 'nuage']}, {e: '🌥️', n: ['cloud']}, {e: '☁️', n: ['cloud', 'nuage']}, {e: '🌦️', n: ['sun', 'rain']}, {e: '🌧️', n: ['rain', 'pluie']}, {e: '⛈️', n: ['thunder', 'rain']}, {e: '🌩️', n: ['cloud', 'lightning']}, {e: '🌨️', n: ['cloud', 'snow', 'neige']}, {e: '❄️', n: ['snowflake', 'neige']}, {e: '☃️', n: ['snowman', 'bonhomme', 'neige']}, {e: '⛄', n: ['snowman']}, {e: '🌬️', n: ['wind', 'vent']}, {e: '💨', n: ['dashing']}, {e: '💧', n: ['droplet', 'eau', 'water']}, {e: '💦', n: ['sweat', 'droplets']}, {e: '☔', n: ['umbrella', 'rain', 'parapluie']}, {e: '☂️', n: ['umbrella']}, {e: '🌊', n: ['wave', 'water', 'vague']}, {e: '🌫️', n: ['fog', 'brouillard']}
    ],
    'Nourriture': [
        {e: '🍇', n: ['grapes', 'raisin']}, {e: '🍈', n: ['melon']}, {e: '🍉', n: ['watermelon', 'pasteque']}, {e: '🍊', n: ['tangerine', 'orange']}, {e: '🍋', n: ['lemon', 'citron']}, {e: '🍌', n: ['banana', 'banane']}, {e: '🍍', n: ['pineapple', 'ananas']}, {e: '🥭', n: ['mango', 'mangue']}, {e: '🍎', n: ['apple', 'pomme', 'red']}, {e: '🍏', n: ['apple', 'green']}, {e: '🍐', n: ['pear', 'poire']}, {e: '🍑', n: ['peach', 'peche']}, {e: '🍒', n: ['cherries', 'cerise']}, {e: '🍓', n: ['strawberry', 'fraise']}, {e: '🥝', n: ['kiwi']}, {e: '🍅', n: ['tomato', 'tomate']}, {e: '🥥', n: ['coconut', 'noix', 'coco']}, {e: '🥑', n: ['avocado', 'avocat']}, {e: '🍆', n: ['eggplant', 'aubergine']}, {e: '🥔', n: ['potato', 'pomme', 'terre']}, {e: '🥕', n: ['carrot', 'carotte']}, {e: '🌽', n: ['corn', 'mais']}, {e: '🌶️', n: ['hot', 'pepper', 'piment']}, {e: '🥒', n: ['cucumber', 'concombre']}, {e: '🥬', n: ['leafy', 'green']}, {e: '🥦', n: ['broccoli', 'brocoli']}, {e: '🧄', n: ['garlic', 'ail']}, {e: '🧅', n: ['onion', 'oignon']}, {e: '🍄', n: ['mushroom', 'champignon']}, {e: '🥜', n: ['peanuts', 'cacahuete']}, {e: '🌰', n: ['chestnut', 'chataigne']}, {e: '🍞', n: ['bread', 'pain']}, {e: '🥐', n: ['croissant']}, {e: '🥖', n: ['baguette', 'bread', 'pain']}, {e: '🥨', n: ['pretzel']}, {e: '🥯', n: ['bagel']}, {e: '🥞', n: ['pancakes', 'crepes']}, {e: '🧇', n: ['waffle', 'gaufre']}, {e: '🧀', n: ['cheese', 'fromage']}, {e: '🍖', n: ['meat', 'bone', 'viande']}, {e: '🍗', n: ['poultry', 'leg', 'poulet']}, {e: '🥩', n: ['cut', 'meat', 'viande']}, {e: '🥓', n: ['bacon']}, {e: '🍔', n: ['hamburger', 'burger']}, {e: '🍟', n: ['fries', 'frites']}, {e: '🍕', n: ['pizza']}, {e: '🌭', n: ['hot', 'dog']}, {e: '🥪', n: ['sandwich']}, {e: '🌮', n: ['taco']}, {e: '🌯', n: ['burrito']}, {e: '🥙', n: ['stuffed', 'flatbread']}, {e: '🧆', n: ['falafel']}, {e: '🥚', n: ['egg', 'oeuf']}, {e: '🍳', n: ['cooking', 'egg']}, {e: '🥘', n: ['paella', 'shallow', 'pan']}, {e: '🍲', n: ['pot', 'food']}, {e: '🥣', n: ['bowl', 'spoon', 'bol']}, {e: '🥗', n: ['salad', 'salade']}, {e: '🍿', n: ['popcorn', 'pop', 'corn']}, {e: '🧈', n: ['butter', 'beurre']}, {e: '🧂', n: ['salt', 'sel']}, {e: '🥫', n: ['canned', 'food', 'conserve']}, {e: '🍱', n: ['bento', 'box']}, {e: '🍘', n: ['rice', 'cracker']}, {e: '🍙', n: ['rice', 'ball']}, {e: '🍚', n: ['cooked', 'rice', 'riz']}, {e: '🍛', n: ['curry', 'rice']}, {e: '🍜', n: ['steaming', 'bowl', 'noodles']}, {e: '🍝', n: ['spaghetti', 'pasta', 'pates']}, {e: '🍠', n: ['roasted', 'sweet', 'potato']}, {e: '🍢', n: ['oden']}, {e: '🍣', n: ['sushi']}, {e: '🍤', n: ['fried', 'shrimp', 'crevette']}, {e: '🍥', n: ['fish', 'cake']}, {e: '🥮', n: ['moon', 'cake']}, {e: '🍡', n: ['dango']}, {e: '🥟', n: ['dumpling']}, {e: '🥠', n: ['fortune', 'cookie']}, {e: '🥡', n: ['takeout', 'box']}, {e: '🦀', n: ['crab', 'crabe']}, {e: '🦞', n: ['lobster', 'homard']}, {e: '🦐', n: ['shrimp', 'crevette']}, {e: '🦑', n: ['squid', 'calamar']}, {e: '🦪', n: ['oyster', 'huitre']}, {e: '🍦', n: ['soft', 'ice', 'cream', 'glace']}, {e: '🍧', n: ['shaved', 'ice']}, {e: '🍨', n: ['ice', 'cream', 'glace']}, {e: '🍩', n: ['doughnut', 'donut']}, {e: '🍪', n: ['cookie', 'biscuit']}, {e: '🎂', n: ['birthday', 'cake', 'gateau', 'anniversaire']}, {e: '🍰', n: ['shortcake', 'cake', 'gateau']}, {e: '🧁', n: ['cupcake']}, {e: '🥧', n: ['pie', 'tarte']}, {e: '🍫', n: ['chocolate', 'chocolat']}, {e: '🍬', n: ['candy', 'bonbon']}, {e: '🍭', n: ['lollipop', 'sucette']}, {e: '🍮', n: ['custard', 'creme']}, {e: '🍯', n: ['honey', 'pot', 'miel']}, {e: '🍼', n: ['baby', 'bottle', 'biberon']}, {e: '🥛', n: ['milk', 'lait']}, {e: '☕', n: ['coffee', 'cafe']}, {e: '🍵', n: ['tea', 'the']}, {e: '🧃', n: ['juice', 'box', 'jus']}, {e: '🧉', n: ['mate']}, {e: '🧊', n: ['ice', 'cube', 'glace']}, {e: '🥤', n: ['cup', 'straw']}, {e: '🍶', n: ['sake']}, {e: '🍺', n: ['beer', 'mug', 'biere']}, {e: '🍻', n: ['clinking', 'beer', 'mugs']}, {e: '🥂', n: ['clinking', 'glasses', 'champagne']}, {e: '🍷', n: ['wine', 'glass', 'vin']}, {e: '🥃', n: ['tumbler', 'glass', 'whisky']}, {e: '🍸', n: ['cocktail', 'martini']}, {e: '🍹', n: ['tropical', 'drink']}, {e: '🍾', n: ['bottle', 'popping', 'cork', 'champagne']}, {e: '🧋', n: ['bubble', 'tea']}, {e: '🥄', n: ['spoon', 'cuillere']}, {e: '🍴', n: ['fork', 'knife', 'fourchette', 'couteau']}, {e: '🍽️', n: ['plate', 'cutlery', 'assiette']}
    ],
    'Activites': [
        {e: '⚽', n: ['soccer', 'football', 'foot']}, {e: '🏀', n: ['basketball', 'basket']}, {e: '🏈', n: ['football', 'american']}, {e: '⚾', n: ['baseball']}, {e: '🥎', n: ['softball']}, {e: '🎾', n: ['tennis']}, {e: '🏐', n: ['volleyball', 'volley']}, {e: '🏉', n: ['rugby']}, {e: '🥏', n: ['flying', 'disc', 'frisbee']}, {e: '🎱', n: ['billiards', 'pool']}, {e: '🪀', n: ['yo-yo']}, {e: '🏓', n: ['ping', 'pong', 'table', 'tennis']}, {e: '🏸', n: ['badminton']}, {e: '🏒', n: ['ice', 'hockey']}, {e: '🏑', n: ['field', 'hockey']}, {e: '🥍', n: ['lacrosse']}, {e: '🏏', n: ['cricket']}, {e: '🥅', n: ['goal', 'net', 'but']}, {e: '⛳', n: ['flag', 'hole', 'golf']}, {e: '🪁', n: ['kite', 'cerf-volant']}, {e: '🏹', n: ['bow', 'arrow', 'arc']}, {e: '🎣', n: ['fishing', 'peche']}, {e: '🤿', n: ['diving', 'mask', 'plongee']}, {e: '🥊', n: ['boxing', 'glove', 'boxe']}, {e: '🥋', n: ['martial', 'arts', 'uniform', 'judo']}, {e: '🎽', n: ['running', 'shirt']}, {e: '🛹', n: ['skateboard']}, {e: '🛼', n: ['roller', 'skate']}, {e: '🛷', n: ['sled', 'luge']}, {e: '⛸️', n: ['ice', 'skate', 'patin']}, {e: '🥌', n: ['curling', 'stone']}, {e: '🎿', n: ['skis', 'ski']}, {e: '⛷️', n: ['skier']}, {e: '🏂', n: ['snowboarder']}, {e: '🪂', n: ['parachute']}, {e: '🏋️', n: ['weightlifter', 'musculation']}, {e: '🤼', n: ['wrestlers', 'wrestling']}, {e: '🤸', n: ['cartwheeler', 'gym']}, {e: '🤺', n: ['fencer', 'escrime']}, {e: '🤾', n: ['handball']}, {e: '🏌️', n: ['golfer']}, {e: '🏇', n: ['horse', 'racing', 'equitation']}, {e: '🧘', n: ['lotus', 'position', 'yoga', 'meditation']}, {e: '🏄', n: ['surfer', 'surf']}, {e: '🏊', n: ['swimmer', 'natation']}, {e: '🤽', n: ['water', 'polo']}, {e: '🚣', n: ['rowboat']}, {e: '🧗', n: ['climber', 'escalade']}, {e: '🚵', n: ['mountain', 'biker', 'vtt']}, {e: '🚴', n: ['bicyclist', 'cycliste', 'velo']}, {e: '🏆', n: ['trophy', 'trophee']}, {e: '🥇', n: ['first', 'medal', 'gold', 'or']}, {e: '🥈', n: ['second', 'medal', 'silver', 'argent']}, {e: '🥉', n: ['third', 'medal', 'bronze']}, {e: '🏅', n: ['medal', 'medaille']}, {e: '🎖️', n: ['military', 'medal']}, {e: '🏵️', n: ['rosette']}, {e: '🎗️', n: ['reminder', 'ribbon']}, {e: '🎫', n: ['ticket', 'billet']}, {e: '🎟️', n: ['admission', 'tickets']}, {e: '🎪', n: ['circus', 'tent', 'cirque']}, {e: '🤹', n: ['juggling', 'jongleur']}, {e: '🎭', n: ['performing', 'arts', 'theatre']}, {e: '🩰', n: ['ballet', 'shoes']}, {e: '🎨', n: ['artist', 'palette', 'art', 'peinture']}, {e: '🎬', n: ['clapper', 'board', 'cinema']}, {e: '🎤', n: ['microphone', 'micro']}, {e: '🎧', n: ['headphone', 'casque']}, {e: '🎼', n: ['musical', 'score', 'partition']}, {e: '🎹', n: ['musical', 'keyboard', 'piano']}, {e: '🥁', n: ['drum', 'batterie']}, {e: '🎷', n: ['saxophone']}, {e: '🎺', n: ['trumpet', 'trompette']}, {e: '🎸', n: ['guitar', 'guitare']}, {e: '🪕', n: ['banjo']}, {e: '🎻', n: ['violin', 'violon']}, {e: '🎲', n: ['dice', 'game', 'de']}, {e: '♟️', n: ['chess', 'pawn', 'echecs']}, {e: '🎯', n: ['dart', 'target', 'cible']}, {e: '🎳', n: ['bowling']}, {e: '🎮', n: ['video', 'game', 'jeu', 'console']}, {e: '🎰', n: ['slot', 'machine', 'casino']}, {e: '🧩', n: ['puzzle', 'piece']}
    ],
    'Voyages': [
        {e: '🚗', n: ['car', 'automobile', 'voiture']}, {e: '🚕', n: ['taxi']}, {e: '🚙', n: ['suv', 'car']}, {e: '🚌', n: ['bus']}, {e: '🚎', n: ['trolleybus']}, {e: '🏎️', n: ['racing', 'car', 'course']}, {e: '🚓', n: ['police', 'car']}, {e: '🚑', n: ['ambulance']}, {e: '🚒', n: ['fire', 'engine', 'pompier']}, {e: '🚐', n: ['minibus']}, {e: '🚚', n: ['delivery', 'truck', 'camion']}, {e: '🚛', n: ['articulated', 'lorry']}, {e: '🚜', n: ['tractor', 'tracteur']}, {e: '🛴', n: ['scooter', 'kick']}, {e: '🛵', n: ['motor', 'scooter']}, {e: '🏍️', n: ['motorcycle', 'moto']}, {e: '🛺', n: ['auto', 'rickshaw']}, {e: '🚲', n: ['bicycle', 'velo']}, {e: '🛞', n: ['wheel', 'roue']}, {e: '🚨', n: ['police', 'light', 'sirene']}, {e: '🚥', n: ['horizontal', 'traffic', 'light']}, {e: '🚦', n: ['vertical', 'traffic', 'light', 'feu']}, {e: '🛑', n: ['stop', 'sign']}, {e: '🚧', n: ['construction', 'travaux']}, {e: '⚓', n: ['anchor', 'ancre']}, {e: '⛵', n: ['sailboat', 'voilier']}, {e: '🛶', n: ['canoe']}, {e: '🚤', n: ['speedboat']}, {e: '🛳️', n: ['passenger', 'ship', 'navire']}, {e: '⛴️', n: ['ferry']}, {e: '🛥️', n: ['motor', 'boat']}, {e: '🚢', n: ['ship', 'bateau']}, {e: '✈️', n: ['airplane', 'avion']}, {e: '🛩️', n: ['small', 'airplane']}, {e: '🛫', n: ['airplane', 'departure', 'decollage']}, {e: '🛬', n: ['airplane', 'arrival', 'atterrissage']}, {e: '🪂', n: ['parachute']}, {e: '💺', n: ['seat', 'siege']}, {e: '🚁', n: ['helicopter', 'helicoptere']}, {e: '🚟', n: ['suspension', 'railway']}, {e: '🚠', n: ['mountain', 'cableway', 'telepherique']}, {e: '🚡', n: ['aerial', 'tramway']}, {e: '🛰️', n: ['satellite']}, {e: '🚀', n: ['rocket', 'fusee']}, {e: '🛸', n: ['flying', 'saucer', 'ufo', 'ovni']}, {e: '🛎️', n: ['bellhop', 'bell']}, {e: '🧳', n: ['luggage', 'bagage', 'valise']}, {e: '⌛', n: ['hourglass', 'sablier']}, {e: '⏳', n: ['hourglass', 'flowing']}, {e: '⌚', n: ['watch', 'montre']}, {e: '⏰', n: ['alarm', 'clock', 'reveil']}, {e: '⏱️', n: ['stopwatch', 'chronometre']}, {e: '⏲️', n: ['timer', 'clock', 'minuteur']}, {e: '🕰️', n: ['mantelpiece', 'clock']}, {e: '🕛', n: ['twelve', 'clock']}, {e: '🕧', n: ['twelve-thirty']}, {e: '🕐', n: ['one', 'clock']}, {e: '🕜', n: ['one-thirty']}, {e: '🕑', n: ['two', 'clock']}, {e: '🕝', n: ['two-thirty']}, {e: '🕒', n: ['three', 'clock']}, {e: '🕞', n: ['three-thirty']}, {e: '🕓', n: ['four', 'clock']}, {e: '🕟', n: ['four-thirty']}, {e: '🕔', n: ['five', 'clock']}, {e: '🕠', n: ['five-thirty']}, {e: '🕕', n: ['six', 'clock']}, {e: '🕡', n: ['six-thirty']}, {e: '🕖', n: ['seven', 'clock']}, {e: '🕢', n: ['seven-thirty']}, {e: '🕗', n: ['eight', 'clock']}, {e: '🕣', n: ['eight-thirty']}, {e: '🕘', n: ['nine', 'clock']}, {e: '🕤', n: ['nine-thirty']}, {e: '🕙', n: ['ten', 'clock']}, {e: '🕥', n: ['ten-thirty']}, {e: '🕚', n: ['eleven', 'clock']}, {e: '🕦', n: ['eleven-thirty']}, {e: '🌑', n: ['new', 'moon', 'lune']}, {e: '🌒', n: ['waxing', 'crescent']}, {e: '🌓', n: ['first', 'quarter']}, {e: '🌔', n: ['waxing', 'gibbous']}, {e: '🌕', n: ['full', 'moon']}, {e: '🌖', n: ['waning', 'gibbous']}, {e: '🌗', n: ['last', 'quarter']}, {e: '🌘', n: ['waning', 'crescent']}, {e: '🌙', n: ['crescent', 'moon']}, {e: '🌚', n: ['new', 'moon', 'face']}, {e: '🌛', n: ['first', 'quarter', 'face']}, {e: '🌜', n: ['last', 'quarter', 'face']}, {e: '🌡️', n: ['thermometer', 'temperature']}, {e: '☀️', n: ['sun', 'soleil']}, {e: '🌝', n: ['full', 'moon', 'face']}, {e: '🌞', n: ['sun', 'face']}, {e: '🪐', n: ['ringed', 'planet', 'saturne']}, {e: '⭐', n: ['star', 'etoile']}, {e: '🌟', n: ['glowing', 'star']}, {e: '🌠', n: ['shooting', 'star', 'etoile', 'filante']}, {e: '🌌', n: ['milky', 'way', 'galaxy', 'galaxie']}, {e: '☁️', n: ['cloud', 'nuage']}, {e: '⛅', n: ['sun', 'behind', 'cloud']}, {e: '⛈️', n: ['cloud', 'lightning', 'rain']}, {e: '🌤️', n: ['sun', 'small', 'cloud']}, {e: '🌥️', n: ['sun', 'large', 'cloud']}, {e: '🌦️', n: ['sun', 'behind', 'rain', 'cloud']}, {e: '🌧️', n: ['cloud', 'rain', 'pluie']}, {e: '🌨️', n: ['cloud', 'snow', 'neige']}, {e: '🌩️', n: ['cloud', 'lightning']}, {e: '🌪️', n: ['tornado']}, {e: '🌫️', n: ['fog', 'brouillard']}, {e: '🌬️', n: ['wind', 'face', 'vent']}, {e: '🌀', n: ['cyclone']}, {e: '🌈', n: ['rainbow', 'arc-en-ciel']}, {e: '🌂', n: ['closed', 'umbrella', 'parapluie']}, {e: '☂️', n: ['umbrella']}, {e: '☔', n: ['umbrella', 'rain', 'drops']}, {e: '⛱️', n: ['umbrella', 'ground']}, {e: '⚡', n: ['lightning', 'eclair']}, {e: '❄️', n: ['snowflake', 'neige']}, {e: '☃️', n: ['snowman', 'bonhomme']}, {e: '⛄', n: ['snowman', 'without', 'snow']}, {e: '☄️', n: ['comet', 'comete']}, {e: '🔥', n: ['fire', 'feu']}, {e: '💧', n: ['droplet', 'goutte', 'eau']}, {e: '🌊', n: ['water', 'wave', 'vague']}
    ],
    'Objets': [
        {e: '⌚', n: ['watch', 'montre']}, {e: '📱', n: ['mobile', 'phone', 'telephone', 'portable']}, {e: '📲', n: ['phone', 'arrow']}, {e: '💻', n: ['laptop', 'ordinateur', 'computer']}, {e: '⌨️', n: ['keyboard', 'clavier']}, {e: '🖥️', n: ['desktop', 'computer']}, {e: '🖨️', n: ['printer', 'imprimante']}, {e: '🖱️', n: ['computer', 'mouse', 'souris']}, {e: '🖲️', n: ['trackball']}, {e: '🕹️', n: ['joystick']}, {e: '🗜️', n: ['clamp']}, {e: '💾', n: ['floppy', 'disk', 'disquette']}, {e: '💿', n: ['optical', 'disk', 'cd']}, {e: '📀', n: ['dvd']}, {e: '📼', n: ['videocassette', 'vhs']}, {e: '📷', n: ['camera', 'appareil', 'photo']}, {e: '📸', n: ['camera', 'flash']}, {e: '📹', n: ['video', 'camera']}, {e: '🎥', n: ['movie', 'camera', 'cinema']}, {e: '📽️', n: ['film', 'projector']}, {e: '🎞️', n: ['film', 'frames']}, {e: '📞', n: ['telephone', 'receiver']}, {e: '☎️', n: ['telephone']}, {e: '📟', n: ['pager']}, {e: '📠', n: ['fax', 'machine']}, {e: '📺', n: ['television', 'tv']}, {e: '📻', n: ['radio']}, {e: '🎙️', n: ['studio', 'microphone']}, {e: '🎚️', n: ['level', 'slider']}, {e: '🎛️', n: ['control', 'knobs']}, {e: '🧭', n: ['compass', 'boussole']}, {e: '⏱️', n: ['stopwatch', 'chronometre']}, {e: '⏲️', n: ['timer', 'clock', 'minuteur']}, {e: '⏰', n: ['alarm', 'clock', 'reveil']}, {e: '🕰️', n: ['mantelpiece', 'clock']}, {e: '⌛', n: ['hourglass', 'done', 'sablier']}, {e: '⏳', n: ['hourglass', 'not', 'done']}, {e: '📡', n: ['satellite', 'antenna']}, {e: '🔋', n: ['battery', 'batterie', 'pile']}, {e: '🔌', n: ['electric', 'plug', 'prise']}, {e: '💡', n: ['light', 'bulb', 'ampoule', 'idee']}, {e: '🔦', n: ['flashlight', 'lampe', 'torche']}, {e: '🕯️', n: ['candle', 'bougie']}, {e: '🪔', n: ['diya', 'lamp']}, {e: '🧯', n: ['fire', 'extinguisher', 'extincteur']}, {e: '🛢️', n: ['oil', 'drum', 'baril']}, {e: '💸', n: ['money', 'with', 'wings', 'argent']}, {e: '💵', n: ['dollar', 'banknote']}, {e: '💴', n: ['yen', 'banknote']}, {e: '💶', n: ['euro', 'banknote']}, {e: '💷', n: ['pound', 'banknote']}, {e: '💰', n: ['money', 'bag', 'sac', 'argent']}, {e: '💳', n: ['credit', 'card', 'carte']}, {e: '🪙', n: ['coin', 'piece']}, {e: '💎', n: ['gem', 'stone', 'diamant']}, {e: '⚖️', n: ['balance', 'scale']}, {e: '🪜', n: ['ladder', 'echelle']}, {e: '🧰', n: ['toolbox']}, {e: '🪛', n: ['screwdriver', 'tournevis']}, {e: '🔧', n: ['wrench', 'cle']}, {e: '🔨', n: ['hammer', 'marteau']}, {e: '⚒️', n: ['hammer', 'pick']}, {e: '🛠️', n: ['hammer', 'wrench']}, {e: '⛏️', n: ['pick', 'pioche']}, {e: '🪚', n: ['saw', 'scie']}, {e: '🔩', n: ['nut', 'bolt', 'ecrou']}, {e: '⚙️', n: ['gear', 'engrenage']}, {e: '🪤', n: ['mouse', 'trap', 'piege']}, {e: '🧱', n: ['brick', 'brique']}, {e: '⛓️', n: ['chains', 'chaine']}, {e: '🧲', n: ['magnet', 'aimant']}, {e: '🔫', n: ['pistol', 'gun', 'pistolet']}, {e: '💣', n: ['bomb', 'bombe']}, {e: '🧨', n: ['firecracker']}, {e: '🪓', n: ['axe', 'hache']}, {e: '🔪', n: ['kitchen', 'knife', 'couteau']}, {e: '🗡️', n: ['dagger', 'sword', 'epee']}, {e: '⚔️', n: ['crossed', 'swords']}, {e: '🛡️', n: ['shield', 'bouclier']}, {e: '🚬', n: ['cigarette']}, {e: '⚰️', n: ['coffin', 'cercueil']}, {e: '⚱️', n: ['funeral', 'urn', 'urne']}, {e: '🏺', n: ['amphora']}, {e: '🔮', n: ['crystal', 'ball', 'boule', 'cristal']}, {e: '📿', n: ['prayer', 'beads']}, {e: '🧿', n: ['nazar', 'amulet']}, {e: '💈', n: ['barber', 'pole']}, {e: '⚗️', n: ['alembic']}, {e: '🔭', n: ['telescope']}, {e: '🔬', n: ['microscope']}, {e: '🕳️', n: ['hole', 'trou']}, {e: '🩹', n: ['adhesive', 'bandage', 'pansement']}, {e: '🩺', n: ['stethoscope']}, {e: '💊', n: ['pill', 'pilule', 'medicament']}, {e: '💉', n: ['syringe', 'seringue']}, {e: '🩸', n: ['drop', 'blood', 'sang']}, {e: '🧬', n: ['dna']}, {e: '🦠', n: ['microbe', 'virus']}, {e: '🧫', n: ['petri', 'dish']}, {e: '🧪', n: ['test', 'tube']}, {e: '🌡️', n: ['thermometer']}, {e: '🧹', n: ['broom', 'balai']}, {e: '🧺', n: ['basket', 'panier']}, {e: '🧻', n: ['roll', 'paper', 'papier']}, {e: '🚽', n: ['toilet', 'toilette']}, {e: '🚰', n: ['potable', 'water', 'eau']}, {e: '🚿', n: ['shower', 'douche']}, {e: '🛁', n: ['bathtub', 'baignoire']}, {e: '🛀', n: ['person', 'taking', 'bath', 'bain']}, {e: '🧼', n: ['soap', 'savon']}, {e: '🪒', n: ['razor', 'rasoir']}, {e: '🧽', n: ['sponge', 'eponge']}, {e: '🧴', n: ['lotion', 'bottle']}, {e: '🛎️', n: ['bellhop', 'bell']}, {e: '🔑', n: ['key', 'cle']}, {e: '🗝️', n: ['old', 'key']}, {e: '🚪', n: ['door', 'porte']}, {e: '🪑', n: ['chair', 'chaise']}, {e: '🛋️', n: ['couch', 'lamp', 'canape']}, {e: '🛏️', n: ['bed', 'lit']}, {e: '🧸', n: ['teddy', 'bear', 'ours', 'peluche']}, {e: '🖼️', n: ['framed', 'picture', 'cadre', 'tableau']}, {e: '🪞', n: ['mirror', 'miroir']}, {e: '🪟', n: ['window', 'fenetre']}, {e: '🛍️', n: ['shopping', 'bags', 'courses']}, {e: '🎁', n: ['wrapped', 'gift', 'cadeau']}, {e: '🎈', n: ['balloon', 'ballon']}, {e: '🎏', n: ['carp', 'streamer']}, {e: '🎀', n: ['ribbon', 'ruban']}, {e: '🎊', n: ['confetti', 'ball']}, {e: '🎉', n: ['party', 'popper', 'fete']}, {e: '🎎', n: ['japanese', 'dolls']}, {e: '🏮', n: ['red', 'paper', 'lantern']}, {e: '🎐', n: ['wind', 'chime']}, {e: '🧧', n: ['red', 'envelope']}, {e: '✉️', n: ['envelope', 'enveloppe', 'lettre']}, {e: '📩', n: ['envelope', 'down', 'arrow']}, {e: '📨', n: ['incoming', 'envelope']}, {e: '📧', n: ['e-mail', 'email', 'courrier']}, {e: '💌', n: ['love', 'letter', 'amour']}, {e: '📥', n: ['inbox', 'tray']}, {e: '📤', n: ['outbox', 'tray']}, {e: '📦', n: ['package', 'colis', 'paquet']}, {e: '🏷️', n: ['label', 'etiquette']}, {e: '📪', n: ['closed', 'mailbox', 'lowered', 'flag']}, {e: '📫', n: ['closed', 'mailbox', 'raised', 'flag']}, {e: '📬', n: ['open', 'mailbox', 'raised', 'flag']}, {e: '📭', n: ['open', 'mailbox', 'lowered', 'flag']}, {e: '📮', n: ['postbox', 'boite', 'lettre']}, {e: '🗳️', n: ['ballot', 'box']}, {e: '✏️', n: ['pencil', 'crayon']}, {e: '✒️', n: ['black', 'nib', 'plume']}, {e: '🖋️', n: ['fountain', 'pen', 'stylo']}, {e: '🖊️', n: ['pen']}, {e: '🖌️', n: ['paintbrush', 'pinceau']}, {e: '🖍️', n: ['crayon']}, {e: '📝', n: ['memo', 'note']}, {e: '💼', n: ['briefcase', 'valise', 'travail']}, {e: '📁', n: ['file', 'folder', 'dossier']}, {e: '📂', n: ['open', 'file', 'folder']}, {e: '🗂️', n: ['card', 'index', 'dividers']}, {e: '📅', n: ['calendar', 'calendrier']}, {e: '📆', n: ['tear-off', 'calendar']}, {e: '🗒️', n: ['spiral', 'notepad']}, {e: '🗓️', n: ['spiral', 'calendar']}, {e: '📇', n: ['card', 'index']}, {e: '📈', n: ['chart', 'increasing', 'hausse']}, {e: '📉', n: ['chart', 'decreasing', 'baisse']}, {e: '📊', n: ['bar', 'chart', 'graphique']}, {e: '📋', n: ['clipboard', 'presse-papier']}, {e: '📌', n: ['pushpin', 'punaise']}, {e: '📍', n: ['round', 'pushpin', 'pin']}, {e: '📎', n: ['paperclip', 'trombone']}, {e: '🖇️', n: ['linked', 'paperclips']}, {e: '📏', n: ['straight', 'ruler', 'regle']}, {e: '📐', n: ['triangular', 'ruler']}, {e: '✂️', n: ['scissors', 'ciseaux']}, {e: '🗃️', n: ['card', 'file', 'box']}, {e: '🗄️', n: ['file', 'cabinet', 'classeur']}, {e: '🗑️', n: ['wastebasket', 'corbeille', 'poubelle']}, {e: '🔒', n: ['locked', 'cadenas', 'verrouille']}, {e: '🔓', n: ['unlocked', 'ouvert']}, {e: '🔏', n: ['locked', 'pen']}, {e: '🔐', n: ['locked', 'key']}, {e: '🔑', n: ['key', 'cle']}, {e: '🗝️', n: ['old', 'key']}, {e: '🔨', n: ['hammer', 'marteau']}, {e: '🪓', n: ['axe', 'hache']}, {e: '⛏️', n: ['pick']}, {e: '⚒️', n: ['hammer', 'pick']}, {e: '🛠️', n: ['hammer', 'wrench', 'outils']}, {e: '🗡️', n: ['dagger', 'sword']}, {e: '⚔️', n: ['crossed', 'swords']}, {e: '🔫', n: ['pistol', 'gun']}, {e: '🏹', n: ['bow', 'arrow', 'arc']}, {e: '🛡️', n: ['shield', 'bouclier']}, {e: '🔧', n: ['wrench', 'cle']}, {e: '🔩', n: ['nut', 'bolt']}, {e: '⚙️', n: ['gear', 'engrenage']}, {e: '🗜️', n: ['clamp']}, {e: '⚖️', n: ['balance', 'scale', 'justice']}, {e: '🦯', n: ['white', 'cane']}, {e: '🔗', n: ['link', 'lien']}, {e: '⛓️', n: ['chains', 'chaine']}, {e: '🧰', n: ['toolbox', 'boite', 'outils']}, {e: '🧲', n: ['magnet', 'aimant']}, {e: '⚗️', n: ['alembic']}, {e: '🧪', n: ['test', 'tube']}, {e: '🧫', n: ['petri', 'dish']}, {e: '🧬', n: ['dna']}, {e: '🔬', n: ['microscope']}, {e: '🔭', n: ['telescope']}, {e: '📡', n: ['satellite', 'antenna']}, {e: '💉', n: ['syringe', 'seringue', 'injection']}, {e: '🩸', n: ['drop', 'blood', 'sang']}, {e: '💊', n: ['pill', 'pilule', 'medicament']}, {e: '🩹', n: ['adhesive', 'bandage', 'pansement']}, {e: '🩺', n: ['stethoscope']}, {e: '🚪', n: ['door', 'porte']}, {e: '🛏️', n: ['bed', 'lit']}, {e: '🛋️', n: ['couch', 'lamp', 'canape']}, {e: '🪑', n: ['chair', 'chaise']}, {e: '🚽', n: ['toilet', 'wc', 'toilette']}, {e: '🚿', n: ['shower', 'douche']}, {e: '🛁', n: ['bathtub', 'baignoire']}, {e: '🪒', n: ['razor', 'rasoir']}, {e: '🧴', n: ['lotion', 'bottle']}, {e: '🧷', n: ['safety', 'pin', 'epingle']}, {e: '🧹', n: ['broom', 'balai']}, {e: '🧺', n: ['basket', 'panier']}, {e: '🧻', n: ['roll', 'paper', 'papier']}, {e: '🧼', n: ['soap', 'savon']}, {e: '🧽', n: ['sponge', 'eponge']}, {e: '🧯', n: ['fire', 'extinguisher', 'extincteur']}, {e: '🛒', n: ['shopping', 'cart', 'caddie', 'chariot']}
    ],
    'Symboles': [
        {e: '❤️', n: ['red', 'heart', 'coeur', 'amour', 'love', 'rouge']}, {e: '🧡', n: ['orange', 'heart', 'coeur']}, {e: '💛', n: ['yellow', 'heart', 'coeur', 'jaune']}, {e: '💚', n: ['green', 'heart', 'coeur', 'vert']}, {e: '💙', n: ['blue', 'heart', 'coeur', 'bleu']}, {e: '💜', n: ['purple', 'heart', 'coeur', 'violet']}, {e: '🖤', n: ['black', 'heart', 'coeur', 'noir']}, {e: '🤍', n: ['white', 'heart', 'coeur', 'blanc']}, {e: '🤎', n: ['brown', 'heart', 'coeur', 'marron']}, {e: '💔', n: ['broken', 'heart', 'coeur', 'brise']}, {e: '❣️', n: ['heart', 'exclamation', 'coeur']}, {e: '💕', n: ['two', 'hearts', 'deux', 'coeurs']}, {e: '💞', n: ['revolving', 'hearts', 'coeurs']}, {e: '💓', n: ['beating', 'heart', 'coeur']}, {e: '💗', n: ['growing', 'heart', 'coeur']}, {e: '💖', n: ['sparkling', 'heart', 'coeur']}, {e: '💘', n: ['heart', 'arrow', 'coeur', 'fleche']}, {e: '💝', n: ['heart', 'ribbon', 'coeur']}, {e: '💟', n: ['heart', 'decoration', 'coeur']}, {e: '☮️', n: ['peace', 'symbol', 'paix']}, {e: '✝️', n: ['latin', 'cross', 'croix']}, {e: '☪️', n: ['star', 'crescent']}, {e: '🕉️', n: ['om']}, {e: '☸️', n: ['wheel', 'dharma']}, {e: '✡️', n: ['star', 'david']}, {e: '🔯', n: ['dotted', 'star']}, {e: '🕎', n: ['menorah']}, {e: '☯️', n: ['yin', 'yang']}, {e: '☦️', n: ['orthodox', 'cross']}, {e: '🛐', n: ['place', 'worship']}, {e: '⛎', n: ['ophiuchus']}, {e: '♈', n: ['aries', 'belier']}, {e: '♉', n: ['taurus', 'taureau']}, {e: '♊', n: ['gemini', 'gemeaux']}, {e: '♋', n: ['cancer']}, {e: '♌', n: ['leo', 'lion']}, {e: '♍', n: ['virgo', 'vierge']}, {e: '♎', n: ['libra', 'balance']}, {e: '♏', n: ['scorpio', 'scorpion']}, {e: '♐', n: ['sagittarius', 'sagittaire']}, {e: '♑', n: ['capricorn', 'capricorne']}, {e: '♒', n: ['aquarius', 'verseau']}, {e: '♓', n: ['pisces', 'poissons']}, {e: '🆔', n: ['id', 'button', 'identite']}, {e: '⚛️', n: ['atom', 'symbol', 'atome']}, {e: '🉑', n: ['japanese', 'accept', 'button']}, {e: '☢️', n: ['radioactive', 'radioactif']}, {e: '☣️', n: ['biohazard']}, {e: '📴', n: ['mobile', 'phone', 'off']}, {e: '📳', n: ['vibration', 'mode']}, {e: '🈶', n: ['japanese', 'not', 'free', 'charge']}, {e: '🈚', n: ['japanese', 'free', 'charge']}, {e: '🈸', n: ['japanese', 'application']}, {e: '🈺', n: ['japanese', 'open', 'business']}, {e: '🈷️', n: ['japanese', 'monthly', 'amount']}, {e: '✴️', n: ['eight-pointed', 'star', 'etoile']}, {e: '🆚', n: ['vs', 'button', 'versus', 'contre']}, {e: '💮', n: ['white', 'flower', 'fleur']}, {e: '🉐', n: ['japanese', 'bargain']}, {e: '㊙️', n: ['japanese', 'secret']}, {e: '㊗️', n: ['japanese', 'congratulations']}, {e: '🈴', n: ['japanese', 'passing', 'grade']}, {e: '🈵', n: ['japanese', 'no', 'vacancy']}, {e: '🈹', n: ['japanese', 'discount']}, {e: '🈲', n: ['japanese', 'prohibited']}, {e: '🅰️', n: ['blood', 'type']}, {e: '🅱️', n: ['blood', 'type']}, {e: '🆎', n: ['ab', 'blood', 'type']}, {e: '🆑', n: ['cl', 'button']}, {e: '🅾️', n: ['blood', 'type']}, {e: '🆘', n: ['sos', 'button']}, {e: '❌', n: ['cross', 'mark', 'croix', 'non']}, {e: '⭕', n: ['hollow', 'red', 'circle', 'cercle']}, {e: '🛑', n: ['stop', 'sign']}, {e: '⛔', n: ['no', 'entry', 'interdit']}, {e: '📛', n: ['name', 'badge']}, {e: '🚫', n: ['prohibited', 'interdit']}, {e: '💯', n: ['hundred', 'points', 'cent']}, {e: '💢', n: ['anger', 'symbol', 'colere']}, {e: '♨️', n: ['hot', 'springs', 'chaud']}, {e: '🚷', n: ['no', 'pedestrians']}, {e: '🚯', n: ['no', 'littering']}, {e: '🚳', n: ['no', 'bicycles']}, {e: '🚱', n: ['non-potable', 'water']}, {e: '🔞', n: ['no', 'one', 'under', 'eighteen']}, {e: '📵', n: ['no', 'mobile', 'phones']}, {e: '🚭', n: ['no', 'smoking', 'fumer', 'interdit']}, {e: '❗', n: ['exclamation', 'mark']}, {e: '❕', n: ['white', 'exclamation', 'mark']}, {e: '❓', n: ['question', 'mark']}, {e: '❔', n: ['white', 'question', 'mark']}, {e: '‼️', n: ['double', 'exclamation', 'mark']}, {e: '⁉️', n: ['exclamation', 'question', 'mark']}, {e: '🔅', n: ['dim', 'button']}, {e: '🔆', n: ['bright', 'button']}, {e: '〽️', n: ['part', 'alternation', 'mark']}, {e: '⚠️', n: ['warning', 'attention', 'danger']}, {e: '🚸', n: ['children', 'crossing', 'enfants']}, {e: '🔱', n: ['trident', 'emblem']}, {e: '⚜️', n: ['fleur-de-lis']}, {e: '🔰', n: ['japanese', 'symbol', 'beginner']}, {e: '♻️', n: ['recycling', 'symbol', 'recyclage']}, {e: '✅', n: ['check', 'mark', 'button', 'valide']}, {e: '🈯', n: ['japanese', 'reserved']}, {e: '💹', n: ['chart', 'increasing', 'yen']}, {e: '❇️', n: ['sparkle']}, {e: '✳️', n: ['eight-spoked', 'asterisk']}, {e: '❎', n: ['cross', 'mark', 'button']}, {e: '🌐', n: ['globe', 'meridians', 'monde', 'web']}, {e: '💠', n: ['diamond', 'shape', 'blue', 'flower']}, {e: 'Ⓜ️', n: ['circled', 'metro']}, {e: '🌀', n: ['cyclone', 'spiral']}, {e: '💤', n: ['zzz', 'sleep', 'dormir']}, {e: '🏧', n: ['atm', 'sign']}, {e: '🚾', n: ['water', 'closet', 'wc', 'toilettes']}, {e: '♿', n: ['wheelchair', 'symbol', 'handicap']}, {e: '🅿️', n: ['parking', 'button']}, {e: '🈳', n: ['japanese', 'vacancy']}, {e: '🈂️', n: ['japanese', 'service', 'charge']}, {e: '🛂', n: ['passport', 'control']}, {e: '🛃', n: ['customs']}, {e: '🛄', n: ['baggage', 'claim']}, {e: '🛅', n: ['left', 'luggage', 'bagage']}, {e: '🚹', n: ['men', 'room', 'hommes']}, {e: '🚺', n: ['women', 'room', 'femmes']}, {e: '🚼', n: ['baby', 'symbol', 'bebe']}, {e: '🚻', n: ['restroom', 'toilettes']}, {e: '🚮', n: ['litter', 'bin', 'sign', 'poubelle']}, {e: '🎦', n: ['cinema']}, {e: '📶', n: ['antenna', 'bars', 'signal', 'reseau']}, {e: '🈁', n: ['japanese', 'here']}, {e: '🔣', n: ['input', 'symbols']}, {e: 'ℹ️', n: ['information', 'info']}, {e: '🔤', n: ['input', 'latin', 'letters']}, {e: '🔡', n: ['input', 'latin', 'lowercase']}, {e: '🔠', n: ['input', 'latin', 'uppercase']}, {e: '🆖', n: ['ng', 'button']}, {e: '🆗', n: ['ok', 'button']}, {e: '🆙', n: ['up', 'button']}, {e: '🆒', n: ['cool', 'button']}, {e: '🆕', n: ['new', 'button', 'nouveau']}, {e: '🆓', n: ['free', 'button', 'gratuit']}, {e: '0️⃣', n: ['keycap', 'zero']}, {e: '1️⃣', n: ['keycap', 'one', 'un']}, {e: '2️⃣', n: ['keycap', 'two', 'deux']}, {e: '3️⃣', n: ['keycap', 'three', 'trois']}, {e: '4️⃣', n: ['keycap', 'four', 'quatre']}, {e: '5️⃣', n: ['keycap', 'five', 'cinq']}, {e: '6️⃣', n: ['keycap', 'six']}, {e: '7️⃣', n: ['keycap', 'seven', 'sept']}, {e: '8️⃣', n: ['keycap', 'eight', 'huit']}, {e: '9️⃣', n: ['keycap', 'nine', 'neuf']}, {e: '🔟', n: ['keycap', 'ten', 'dix']}, {e: '🔢', n: ['input', 'numbers', 'chiffres']}, {e: '#️⃣', n: ['keycap', 'hashtag']}, {e: '*️⃣', n: ['keycap', 'asterisk']}, {e: '⏏️', n: ['eject', 'button']}, {e: '▶️', n: ['play', 'button', 'jouer']}, {e: '⏸️', n: ['pause', 'button']}, {e: '⏯️', n: ['play', 'pause', 'button']}, {e: '⏹️', n: ['stop', 'button', 'arreter']}, {e: '⏺️', n: ['record', 'button', 'enregistrer']}, {e: '⏭️', n: ['next', 'track', 'button', 'suivant']}, {e: '⏮️', n: ['last', 'track', 'button', 'precedent']}, {e: '⏩', n: ['fast-forward', 'button', 'avance', 'rapide']}, {e: '⏪', n: ['fast', 'reverse', 'button', 'retour']}, {e: '⏫', n: ['fast', 'up', 'button']}, {e: '⏬', n: ['fast', 'down', 'button']}, {e: '◀️', n: ['reverse', 'button']}, {e: '🔼', n: ['upwards', 'button', 'haut']}, {e: '🔽', n: ['downwards', 'button', 'bas']}, {e: '➡️', n: ['right', 'arrow', 'fleche', 'droite']}, {e: '⬅️', n: ['left', 'arrow', 'fleche', 'gauche']}, {e: '⬆️', n: ['up', 'arrow', 'fleche', 'haut']}, {e: '⬇️', n: ['down', 'arrow', 'fleche', 'bas']}, {e: '↗️', n: ['up-right', 'arrow', 'fleche']}, {e: '↘️', n: ['down-right', 'arrow', 'fleche']}, {e: '↙️', n: ['down-left', 'arrow', 'fleche']}, {e: '↖️', n: ['up-left', 'arrow', 'fleche']}, {e: '↕️', n: ['up-down', 'arrow', 'fleche']}, {e: '↔️', n: ['left-right', 'arrow', 'fleche']}, {e: '↩️', n: ['right', 'arrow', 'curving', 'left']}, {e: '↪️', n: ['left', 'arrow', 'curving', 'right']}, {e: '⤴️', n: ['right', 'arrow', 'curving', 'up']}, {e: '⤵️', n: ['right', 'arrow', 'curving', 'down']}, {e: '🔀', n: ['shuffle', 'tracks', 'button', 'aleatoire']}, {e: '🔁', n: ['repeat', 'button', 'repeter']}, {e: '🔂', n: ['repeat', 'single', 'button']}, {e: '🔄', n: ['counterclockwise', 'arrows', 'button', 'actualiser']}, {e: '🔃', n: ['clockwise', 'vertical', 'arrows']}, {e: '🎵', n: ['musical', 'note', 'musique']}, {e: '🎶', n: ['musical', 'notes', 'musique']}, {e: '➕', n: ['plus', 'sign', 'addition']}, {e: '➖', n: ['minus', 'sign', 'soustraction', 'moins']}, {e: '➗', n: ['division', 'sign']}, {e: '✖️', n: ['multiplication', 'sign']}, {e: '♾️', n: ['infinity', 'infini']}, {e: '💲', n: ['heavy', 'dollar', 'sign']}, {e: '💱', n: ['currency', 'exchange', 'change']}, {e: '™️', n: ['trade', 'mark']}, {e: '©️', n: ['copyright']}, {e: '®️', n: ['registered']}, {e: '〰️', n: ['wavy', 'dash']}, {e: '➰', n: ['curly', 'loop']}, {e: '➿', n: ['double', 'curly', 'loop']}, {e: '🔚', n: ['end', 'arrow', 'fin']}, {e: '🔙', n: ['back', 'arrow', 'retour']}, {e: '🔛', n: ['on', 'arrow']}, {e: '🔝', n: ['top', 'arrow']}, {e: '🔜', n: ['soon', 'arrow', 'bientot']}, {e: '✔️', n: ['check', 'mark', 'valide']}, {e: '☑️', n: ['check', 'box', 'mark']}, {e: '🔘', n: ['radio', 'button']}, {e: '⚪', n: ['white', 'circle', 'blanc']}, {e: '⚫', n: ['black', 'circle', 'noir']}, {e: '🔴', n: ['red', 'circle', 'rouge']}, {e: '🔵', n: ['blue', 'circle', 'bleu']}, {e: '🟤', n: ['brown', 'circle', 'marron']}, {e: '🟣', n: ['purple', 'circle', 'violet']}, {e: '🟢', n: ['green', 'circle', 'vert']}, {e: '🟡', n: ['yellow', 'circle', 'jaune']}, {e: '🟠', n: ['orange', 'circle']}, {e: '🔺', n: ['red', 'triangle', 'pointed', 'up', 'rouge']}, {e: '🔻', n: ['red', 'triangle', 'pointed', 'down']}, {e: '🔸', n: ['small', 'orange', 'diamond']}, {e: '🔹', n: ['small', 'blue', 'diamond']}, {e: '🔶', n: ['large', 'orange', 'diamond']}, {e: '🔷', n: ['large', 'blue', 'diamond']}, {e: '🔳', n: ['white', 'square', 'button']}, {e: '🔲', n: ['black', 'square', 'button']}, {e: '▪️', n: ['black', 'small', 'square']}, {e: '▫️', n: ['white', 'small', 'square']}, {e: '◾', n: ['black', 'medium-small', 'square']}, {e: '◽', n: ['white', 'medium-small', 'square']}, {e: '◼️', n: ['black', 'medium', 'square']}, {e: '◻️', n: ['white', 'medium', 'square']}, {e: '⬛', n: ['black', 'large', 'square']}, {e: '⬜', n: ['white', 'large', 'square']}, {e: '🟥', n: ['red', 'square', 'rouge']}, {e: '🟧', n: ['orange', 'square']}, {e: '🟨', n: ['yellow', 'square', 'jaune']}, {e: '🟩', n: ['green', 'square', 'vert']}, {e: '🟦', n: ['blue', 'square', 'bleu']}, {e: '🟪', n: ['purple', 'square', 'violet']}, {e: '🟫', n: ['brown', 'square', 'marron']}, {e: '🔈', n: ['speaker', 'low', 'volume', 'haut-parleur']}, {e: '🔇', n: ['muted', 'speaker', 'muet']}, {e: '🔉', n: ['speaker', 'medium', 'volume']}, {e: '🔊', n: ['speaker', 'high', 'volume', 'son', 'fort']}, {e: '🔔', n: ['bell', 'cloche', 'notification']}, {e: '🔕', n: ['bell', 'slash', 'mute', 'silencieux']}, {e: '📣', n: ['megaphone', 'porte-voix']}, {e: '📢', n: ['loudspeaker', 'haut-parleur']}, {e: '💬', n: ['speech', 'balloon', 'message', 'bulle']}, {e: '💭', n: ['thought', 'balloon', 'pensee']}, {e: '🗯️', n: ['right', 'anger', 'bubble']}, {e: '♠️', n: ['spade', 'suit', 'pique']}, {e: '♣️', n: ['club', 'suit', 'trefle']}, {e: '♥️', n: ['heart', 'suit', 'coeur']}, {e: '♦️', n: ['diamond', 'suit', 'carreau']}, {e: '🃏', n: ['joker']}, {e: '🎴', n: ['flower', 'playing', 'cards']}, {e: '🀄', n: ['mahjong', 'red', 'dragon']}, {e: '🕐', n: ['one', 'clock', 'heure']}, {e: '🕑', n: ['two', 'clock']}, {e: '🕒', n: ['three', 'clock']}, {e: '🕓', n: ['four', 'clock']}, {e: '🕔', n: ['five', 'clock']}, {e: '🕕', n: ['six', 'clock']}, {e: '🕖', n: ['seven', 'clock']}, {e: '🕗', n: ['eight', 'clock']}, {e: '🕘', n: ['nine', 'clock']}, {e: '🕙', n: ['ten', 'clock']}, {e: '🕚', n: ['eleven', 'clock']}, {e: '🕛', n: ['twelve', 'clock']}
    ],
    'Drapeaux': [
        {e: '🏁', n: ['checkered', 'flag', 'drapeau', 'damier']}, {e: '🚩', n: ['triangular', 'flag', 'rouge']}, {e: '🎌', n: ['crossed', 'flags']}, {e: '🏴', n: ['black', 'flag', 'noir']}, {e: '🏳️', n: ['white', 'flag', 'blanc']}, {e: '🏳️‍🌈', n: ['rainbow', 'flag', 'lgbt', 'pride']}, {e: '🏳️‍⚧️', n: ['transgender', 'flag', 'trans']}, {e: '🏴‍☠️', n: ['pirate', 'flag']}, {e: '🇦🇨', n: ['ascension', 'island']}, {e: '🇦🇩', n: ['andorra', 'andorre']}, {e: '🇦🇪', n: ['united', 'arab', 'emirates']}, {e: '🇦🇫', n: ['afghanistan']}, {e: '🇦🇬', n: ['antigua', 'barbuda']}, {e: '🇦🇮', n: ['anguilla']}, {e: '🇦🇱', n: ['albania', 'albanie']}, {e: '🇦🇲', n: ['armenia', 'armenie']}, {e: '🇦🇴', n: ['angola']}, {e: '🇦🇶', n: ['antarctica', 'antarctique']}, {e: '🇦🇷', n: ['argentina', 'argentine']}, {e: '🇦🇸', n: ['american', 'samoa']}, {e: '🇦🇹', n: ['austria', 'autriche']}, {e: '🇦🇺', n: ['australia', 'australie']}, {e: '🇦🇼', n: ['aruba']}, {e: '🇦🇽', n: ['aland', 'islands']}, {e: '🇦🇿', n: ['azerbaijan']}, {e: '🇧🇦', n: ['bosnia', 'herzegovina', 'bosnie']}, {e: '🇧🇧', n: ['barbados', 'barbade']}, {e: '🇧🇩', n: ['bangladesh']}, {e: '🇧🇪', n: ['belgium', 'belgique']}, {e: '🇧🇫', n: ['burkina', 'faso']}, {e: '🇧🇬', n: ['bulgaria', 'bulgarie']}, {e: '🇧🇭', n: ['bahrain']}, {e: '🇧🇮', n: ['burundi']}, {e: '🇧🇯', n: ['benin']}, {e: '🇧🇱', n: ['st', 'barthelemy']}, {e: '🇧🇲', n: ['bermuda', 'bermudes']}, {e: '🇧🇳', n: ['brunei']}, {e: '🇧🇴', n: ['bolivia', 'bolivie']}, {e: '🇧🇶', n: ['caribbean', 'netherlands']}, {e: '🇧🇷', n: ['brazil', 'bresil']}, {e: '🇧🇸', n: ['bahamas']}, {e: '🇧🇹', n: ['bhutan']}, {e: '🇧🇻', n: ['bouvet', 'island']}, {e: '🇧🇼', n: ['botswana']}, {e: '🇧🇾', n: ['belarus']}, {e: '🇧🇿', n: ['belize']}, {e: '🇨🇦', n: ['canada']}, {e: '🇨🇨', n: ['cocos', 'islands']}, {e: '🇨🇩', n: ['congo', 'kinshasa']}, {e: '🇨🇫', n: ['central', 'african', 'republic']}, {e: '🇨🇬', n: ['congo', 'brazzaville']}, {e: '🇨🇭', n: ['switzerland', 'suisse']}, {e: '🇨🇮', n: ['cote', 'ivoire']}, {e: '🇨🇰', n: ['cook', 'islands']}, {e: '🇨🇱', n: ['chile', 'chili']}, {e: '🇨🇲', n: ['cameroon', 'cameroun']}, {e: '🇨🇳', n: ['china', 'chine']}, {e: '🇨🇴', n: ['colombia', 'colombie']}, {e: '🇨🇵', n: ['clipperton', 'island']}, {e: '🇨🇷', n: ['costa', 'rica']}, {e: '🇨🇺', n: ['cuba']}, {e: '🇨🇻', n: ['cape', 'verde']}, {e: '🇨🇼', n: ['curacao']}, {e: '🇨🇽', n: ['christmas', 'island']}, {e: '🇨🇾', n: ['cyprus', 'chypre']}, {e: '🇨🇿', n: ['czechia', 'czech', 'republic', 'tcheque']}, {e: '🇩🇪', n: ['germany', 'allemagne', 'deutsch']}, {e: '🇩🇬', n: ['diego', 'garcia']}, {e: '🇩🇯', n: ['djibouti']}, {e: '🇩🇰', n: ['denmark', 'danemark']}, {e: '🇩🇲', n: ['dominica', 'dominique']}, {e: '🇩🇴', n: ['dominican', 'republic', 'dominicaine']}, {e: '🇩🇿', n: ['algeria', 'algerie']}, {e: '🇪🇦', n: ['ceuta', 'melilla']}, {e: '🇪🇨', n: ['ecuador', 'equateur']}, {e: '🇪🇪', n: ['estonia', 'estonie']}, {e: '🇪🇬', n: ['egypt', 'egypte']}, {e: '🇪🇭', n: ['western', 'sahara']}, {e: '🇪🇷', n: ['eritrea', 'erythree']}, {e: '🇪🇸', n: ['spain', 'espagne', 'spanish']}, {e: '🇪🇹', n: ['ethiopia', 'ethiopie']}, {e: '🇪🇺', n: ['european', 'union', 'europe', 'eu']}, {e: '🇫🇮', n: ['finland', 'finlande']}, {e: '🇫🇯', n: ['fiji', 'fidji']}, {e: '🇫🇰', n: ['falkland', 'islands']}, {e: '🇫🇲', n: ['micronesia']}, {e: '🇫🇴', n: ['faroe', 'islands']}, {e: '🇫🇷', n: ['france', 'french', 'francais']}, {e: '🇬🇦', n: ['gabon']}, {e: '🇬🇧', n: ['united', 'kingdom', 'uk', 'britain', 'great', 'british', 'angleterre', 'royaume', 'uni']}, {e: '🇬🇩', n: ['grenada', 'grenade']}, {e: '🇬🇪', n: ['georgia', 'georgie']}, {e: '🇬🇫', n: ['french', 'guiana']}, {e: '🇬🇬', n: ['guernsey']}, {e: '🇬🇭', n: ['ghana']}, {e: '🇬🇮', n: ['gibraltar']}, {e: '🇬🇱', n: ['greenland']}, {e: '🇬🇲', n: ['gambia', 'gambie']}, {e: '🇬🇳', n: ['guinea', 'guinee']}, {e: '🇬🇵', n: ['guadeloupe']}, {e: '🇬🇶', n: ['equatorial', 'guinea']}, {e: '🇬🇷', n: ['greece', 'grece']}, {e: '🇬🇸', n: ['south', 'georgia', 'sandwich']}, {e: '🇬🇹', n: ['guatemala']}, {e: '🇬🇺', n: ['guam']}, {e: '🇬🇼', n: ['guinea-bissau']}, {e: '🇬🇾', n: ['guyana']}, {e: '🇭🇰', n: ['hong', 'kong']}, {e: '🇭🇲', n: ['heard', 'mcdonald', 'islands']}, {e: '🇭🇳', n: ['honduras']}, {e: '🇭🇷', n: ['croatia', 'croatie']}, {e: '🇭🇹', n: ['haiti']}, {e: '🇭🇺', n: ['hungary', 'hongrie']}, {e: '🇮🇨', n: ['canary', 'islands', 'canaries']}, {e: '🇮🇩', n: ['indonesia', 'indonesie']}, {e: '🇮🇪', n: ['ireland', 'irlande']}, {e: '🇮🇱', n: ['israel']}, {e: '🇮🇲', n: ['isle', 'man']}, {e: '🇮🇳', n: ['india', 'inde']}, {e: '🇮🇴', n: ['british', 'indian', 'ocean']}, {e: '🇮🇶', n: ['iraq', 'irak']}, {e: '🇮🇷', n: ['iran']}, {e: '🇮🇸', n: ['iceland', 'islande']}, {e: '🇮🇹', n: ['italy', 'italie', 'italian']}, {e: '🇯🇪', n: ['jersey']}, {e: '🇯🇲', n: ['jamaica', 'jamaique']}, {e: '🇯🇴', n: ['jordan', 'jordanie']}, {e: '🇯🇵', n: ['japan', 'japon', 'japanese']}, {e: '🇰🇪', n: ['kenya']}, {e: '🇰🇬', n: ['kyrgyzstan']}, {e: '🇰🇭', n: ['cambodia', 'cambodge']}, {e: '🇰🇮', n: ['kiribati']}, {e: '🇰🇲', n: ['comoros', 'comores']}, {e: '🇰🇳', n: ['st', 'kitts', 'nevis']}, {e: '🇰🇵', n: ['north', 'korea', 'coree', 'nord']}, {e: '🇰🇷', n: ['south', 'korea', 'coree', 'sud']}, {e: '🇰🇼', n: ['kuwait', 'koweit']}, {e: '🇰🇾', n: ['cayman', 'islands']}, {e: '🇰🇿', n: ['kazakhstan']}, {e: '🇱🇦', n: ['laos']}, {e: '🇱🇧', n: ['lebanon', 'liban']}, {e: '🇱🇨', n: ['st', 'lucia']}, {e: '🇱🇮', n: ['liechtenstein']}, {e: '🇱🇰', n: ['sri', 'lanka']}, {e: '🇱🇷', n: ['liberia']}, {e: '🇱🇸', n: ['lesotho']}, {e: '🇱🇹', n: ['lithuania', 'lituanie']}, {e: '🇱🇺', n: ['luxembourg']}, {e: '🇱🇻', n: ['latvia', 'lettonie']}, {e: '🇱🇾', n: ['libya', 'libye']}, {e: '🇲🇦', n: ['morocco', 'maroc']}, {e: '🇲🇨', n: ['monaco']}, {e: '🇲🇩', n: ['moldova', 'moldavie']}, {e: '🇲🇪', n: ['montenegro']}, {e: '🇲🇫', n: ['st', 'martin']}, {e: '🇲🇬', n: ['madagascar']}, {e: '🇲🇭', n: ['marshall', 'islands']}, {e: '🇲🇰', n: ['north', 'macedonia']}, {e: '🇲🇱', n: ['mali']}, {e: '🇲🇲', n: ['myanmar', 'burma']}, {e: '🇲🇳', n: ['mongolia', 'mongolie']}, {e: '🇲🇴', n: ['macao']}, {e: '🇲🇵', n: ['northern', 'mariana']}, {e: '🇲🇶', n: ['martinique']}, {e: '🇲🇷', n: ['mauritania', 'mauritanie']}, {e: '🇲🇸', n: ['montserrat']}, {e: '🇲🇹', n: ['malta', 'malte']}, {e: '🇲🇺', n: ['mauritius', 'maurice']}, {e: '🇲🇻', n: ['maldives']}, {e: '🇲🇼', n: ['malawi']}, {e: '🇲🇽', n: ['mexico', 'mexique']}, {e: '🇲🇾', n: ['malaysia', 'malaisie']}, {e: '🇲🇿', n: ['mozambique']}, {e: '🇳🇦', n: ['namibia', 'namibie']}, {e: '🇳🇨', n: ['new', 'caledonia', 'caledonie']}, {e: '🇳🇪', n: ['niger']}, {e: '🇳🇫', n: ['norfolk', 'island']}, {e: '🇳🇬', n: ['nigeria']}, {e: '🇳🇮', n: ['nicaragua']}, {e: '🇳🇱', n: ['netherlands', 'pays', 'bas', 'holland']}, {e: '🇳🇴', n: ['norway', 'norvege']}, {e: '🇳🇵', n: ['nepal']}, {e: '🇳🇷', n: ['nauru']}, {e: '🇳🇺', n: ['niue']}, {e: '🇳🇿', n: ['new', 'zealand', 'zelande']}, {e: '🇴🇲', n: ['oman']}, {e: '🇵🇦', n: ['panama']}, {e: '🇵🇪', n: ['peru', 'perou']}, {e: '🇵🇫', n: ['french', 'polynesia', 'polynesie']}, {e: '🇵🇬', n: ['papua', 'new', 'guinea']}, {e: '🇵🇭', n: ['philippines']}, {e: '🇵🇰', n: ['pakistan']}, {e: '🇵🇱', n: ['poland', 'pologne']}, {e: '🇵🇲', n: ['st', 'pierre', 'miquelon']}, {e: '🇵🇳', n: ['pitcairn', 'islands']}, {e: '🇵🇷', n: ['puerto', 'rico']}, {e: '🇵🇸', n: ['palestinian', 'territories', 'palestine']}, {e: '🇵🇹', n: ['portugal', 'portuguese']}, {e: '🇵🇼', n: ['palau']}, {e: '🇵🇾', n: ['paraguay']}, {e: '🇶🇦', n: ['qatar']}, {e: '🇷🇪', n: ['reunion']}, {e: '🇷🇴', n: ['romania', 'roumanie']}, {e: '🇷🇸', n: ['serbia', 'serbie']}, {e: '🇷🇺', n: ['russia', 'russie', 'russian']}, {e: '🇷🇼', n: ['rwanda']}, {e: '🇸🇦', n: ['saudi', 'arabia', 'arabie']}, {e: '🇸🇧', n: ['solomon', 'islands']}, {e: '🇸🇨', n: ['seychelles']}, {e: '🇸🇩', n: ['sudan', 'soudan']}, {e: '🇸🇪', n: ['sweden', 'suede']}, {e: '🇸🇬', n: ['singapore', 'singapour']}, {e: '🇸🇭', n: ['st', 'helena']}, {e: '🇸🇮', n: ['slovenia', 'slovenie']}, {e: '🇸🇯', n: ['svalbard', 'jan', 'mayen']}, {e: '🇸🇰', n: ['slovakia', 'slovaquie']}, {e: '🇸🇱', n: ['sierra', 'leone']}, {e: '🇸🇲', n: ['san', 'marino']}, {e: '🇸🇳', n: ['senegal']}, {e: '🇸🇴', n: ['somalia', 'somalie']}, {e: '🇸🇷', n: ['suriname']}, {e: '🇸🇸', n: ['south', 'sudan', 'soudan', 'sud']}, {e: '🇸🇹', n: ['sao', 'tome', 'principe']}, {e: '🇸🇻', n: ['el', 'salvador']}, {e: '🇸🇽', n: ['sint', 'maarten']}, {e: '🇸🇾', n: ['syria', 'syrie']}, {e: '🇸🇿', n: ['eswatini', 'swaziland']}, {e: '🇹🇦', n: ['tristan', 'cunha']}, {e: '🇹🇨', n: ['turks', 'caicos']}, {e: '🇹🇩', n: ['chad', 'tchad']}, {e: '🇹🇫', n: ['french', 'southern', 'territories']}, {e: '🇹🇬', n: ['togo']}, {e: '🇹🇭', n: ['thailand', 'thailande']}, {e: '🇹🇯', n: ['tajikistan']}, {e: '🇹🇰', n: ['tokelau']}, {e: '🇹🇱', n: ['timor-leste']}, {e: '🇹🇲', n: ['turkmenistan']}, {e: '🇹🇳', n: ['tunisia', 'tunisie']}, {e: '🇹🇴', n: ['tonga']}, {e: '🇹🇷', n: ['turkey', 'turquie', 'turkish']}, {e: '🇹🇹', n: ['trinidad', 'tobago']}, {e: '🇹🇻', n: ['tuvalu']}, {e: '🇹🇼', n: ['taiwan']}, {e: '🇹🇿', n: ['tanzania', 'tanzanie']}, {e: '🇺🇦', n: ['ukraine']}, {e: '🇺🇬', n: ['uganda', 'ouganda']}, {e: '🇺🇲', n: ['us', 'outlying', 'islands']}, {e: '🇺🇳', n: ['united', 'nations', 'un', 'onu']}, {e: '🇺🇸', n: ['united', 'states', 'america', 'usa', 'us', 'etats', 'unis', 'american']}, {e: '🇺🇾', n: ['uruguay']}, {e: '🇺🇿', n: ['uzbekistan']}, {e: '🇻🇦', n: ['vatican', 'city']}, {e: '🇻🇨', n: ['st', 'vincent', 'grenadines']}, {e: '🇻🇪', n: ['venezuela']}, {e: '🇻🇬', n: ['british', 'virgin', 'islands']}, {e: '🇻🇮', n: ['us', 'virgin', 'islands']}, {e: '🇻🇳', n: ['vietnam']}, {e: '🇻🇺', n: ['vanuatu']}, {e: '🇼🇫', n: ['wallis', 'futuna']}, {e: '🇼🇸', n: ['samoa']}, {e: '🇽🇰', n: ['kosovo']}, {e: '🇾🇪', n: ['yemen']}, {e: '🇾🇹', n: ['mayotte']}, {e: '🇿🇦', n: ['south', 'africa', 'afrique', 'sud']}, {e: '🇿🇲', n: ['zambia', 'zambie']}, {e: '🇿🇼', n: ['zimbabwe']}
    ]
};


let currentLang = 'fr';
let currentTheme = 'dark';
let currentCategory = 'Smileys';
let allEmojis = [];
let notificationTimeout;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('emojiSearch').addEventListener('input', searchEmojis);
    document.getElementById('messageEditor').addEventListener('input', updatePreview);
    document.getElementById('messagePreview').addEventListener('click', handlePreviewClick);
    initEmojis();
    initMarkdownButtons();
    initFontButtons();
    updateTranslations();
    updatePreview();
});

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light');
    currentTheme = body.classList.contains('light') ? 'light' : 'dark';
    document.getElementById('themeBtn').textContent = currentTheme === 'light' ? '☀️ ' : '🌙 ';
}

function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    document.documentElement.lang = currentLang;
    document.getElementById('langBtn').textContent = currentLang === 'fr' ? 'FR' : 'EN';
    updateTranslations();
    initMarkdownButtons();
    initFontButtons();
    const query = document.getElementById('emojiSearch').value.trim();
    if (query) {
        searchEmojis();
    } else {
        showCategory(currentCategory, false);
    }
    updatePreview();
}

function updateTranslations() {
    const t = translations[currentLang];
    document.documentElement.lang = currentLang;
    document.getElementById('subtitle').textContent = t.subtitle;
    document.getElementById('emojiTitle').textContent = t['emojis-title'];
    const searchInput = document.getElementById('emojiSearch');
    searchInput.placeholder = t['emoji-search'];
    const flagInfo = document.getElementById('flagInfo');
    flagInfo.innerHTML = t['flag-info'];
    document.getElementById('editorTitle').textContent = t['editor-title'];
    document.getElementById('editorInfoTitle').textContent = t['how-to-use'];
    document.getElementById('editorInfoText').innerHTML = t['how-to-content'];
    document.getElementById('markdownTitle').textContent = t['markdown-title'];
    document.getElementById('basicMarkdownTitle').textContent = t['basic-formatting'];
    document.getElementById('headingMarkdownTitle').textContent = t['headings'];
    document.getElementById('specialMarkdownTitle').textContent = t['special'];
    document.getElementById('fontsTitle').textContent = t['unicode-fonts'];
    document.getElementById('fontsInfo').textContent = t['unicode-warning'];
    document.getElementById('textEditorTitle').textContent = t['your-message'];
    document.getElementById('messageEditor').placeholder = t['editor-placeholder'];
    document.getElementById('copyBtnText').textContent = t['copy-btn'];
    document.getElementById('resetBtnText').textContent = t['reset-btn'];
    document.getElementById('previewTitle').textContent = t['preview-title'];
    document.getElementById('footerText').textContent = t['footer-text'];
    document.getElementById('footerText2').textContent = t['footer-text2'];

    const editorValue = document.getElementById('messageEditor').value;
    if (!editorValue) {
        document.getElementById('messagePreview').textContent = t['preview-placeholder'];
    }
}

function initEmojis() {
    const tabsContainer = document.getElementById('emojiTabs');
    tabsContainer.innerHTML = '';
    const categories = Object.keys(emojiData);
    categories.forEach((category, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tab';
        btn.dataset.category = category;
        btn.textContent = category;
        btn.addEventListener('click', () => showCategory(category));
        if (index === 0) {
            btn.classList.add('active');
            currentCategory = category;
        }
        tabsContainer.appendChild(btn);
    });
    allEmojis = categories.reduce((acc, key) => acc.concat(emojiData[key]), []);
    showCategory(currentCategory);
}

function showCategory(category, resetSearch = true) {
    currentCategory = category;
    document.querySelectorAll('#emojiTabs .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    if (resetSearch) {
        document.getElementById('emojiSearch').value = '';
    }
    document.getElementById('flagInfo').style.display = category === 'Drapeaux' ? 'block' : 'none';
    displayEmojis(emojiData[category]);
}

function displayEmojis(emojis) {
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';
    if (!emojis || emojis.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = translations[currentLang]['no-emoji-results'];
        grid.appendChild(empty);
        return;
    }
    emojis.forEach(emoji => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'emoji-item';
        button.textContent = emoji.e;
        button.title = emoji.n.join(', ');
        button.addEventListener('click', () => handleEmojiSelection(emoji.e));
        grid.appendChild(button);
    });
}

function searchEmojis() {
    const query = document.getElementById('emojiSearch').value.trim().toLowerCase();
    if (!query) {
        showCategory(currentCategory, false);
        return;
    }
    const filtered = allEmojis.filter(emoji => emoji.n.some(name => name.toLowerCase().includes(query)));
    displayEmojis(filtered);
}

async function copyMessage() {
    const editor = document.getElementById('messageEditor');
    const text = editor.value;
    if (!text.trim()) {
        showNotification(translations[currentLang]['no-message'], 'warning');
        return;
    }
    const success = await copyToClipboard(text);
    showNotification(success ? translations[currentLang]['copied'] : translations[currentLang]['copy-error'], success ? 'success' : 'error');
}

function resetEditor() {
    document.getElementById('messageEditor').value = '';
    updatePreview();
    showNotification(translations[currentLang]['reset-done'], 'success');
}

async function handleEmojiSelection(emojiChar) {
    insertEmoji(emojiChar);
    const success = await copyToClipboard(emojiChar);
    showNotification(success ? translations[currentLang]['emoji-copied'] : translations[currentLang]['copy-error'], success ? 'success' : 'error');
}

function insertEmoji(emojiChar) {
    const editor = document.getElementById('messageEditor');
    const start = editor.selectionStart ?? editor.value.length;
    const end = editor.selectionEnd ?? start;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    editor.value = before + emojiChar + after;
    const newPosition = start + emojiChar.length;
    editor.focus();
    editor.setSelectionRange(newPosition, newPosition);
    updatePreview();
}

async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            return fallbackCopy(text);
        }
    }
    return fallbackCopy(text);
}

function fallbackCopy(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch (error) {
        return false;
    }
}

function initMarkdownButtons() {
    const containers = {
        basic: document.getElementById('basicMarkdown'),
        headings: document.getElementById('headingMarkdown'),
        special: document.getElementById('specialMarkdown')
    };
    Object.values(containers).forEach(container => {
        container.innerHTML = '';
    });
    const sample = translations[currentLang]['style-sample'];
    Object.entries(markdownStyles).forEach(([group, styles]) => {
        styles.forEach(style => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'style-btn';
            const previewContent = typeof style.preview === 'function' ? style.preview(sample) : sample;
            btn.innerHTML = `<span class="style-preview">${previewContent}</span><span class="style-caption">${style.labels[currentLang]}</span>`;
            btn.setAttribute('aria-label', style.labels[currentLang]);
            btn.addEventListener('click', () => applyMarkdown(style));
            containers[group].appendChild(btn);
        });
    });
}

function applyMarkdown(style) {
    if (!style) {
        return;
    }
    if (style.type === 'structure') {
        applyStructureStyle(style);
        return;
    }
    if (style.type === 'block') {
        applyBlockStyle(style);
        return;
    }
    applyInlineStyle(style);
}

function initFontButtons() {
    const grid = document.getElementById('fontGrid');
    grid.innerHTML = '';
    const sample = translations[currentLang]['style-sample'];
    Object.entries(unicodeFonts).forEach(([name, data]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'style-btn';
        const previewText = escapeHTML(transformFontSample(sample, data));
        btn.innerHTML = `<span class="style-preview">${previewText}</span><span class="style-caption">${name}</span>`;
        btn.setAttribute('aria-label', name);
        btn.addEventListener('click', () => applyFont(name, data));
        grid.appendChild(btn);
    });
}

function applyInlineStyle(style) {
    const editor = document.getElementById('messageEditor');
    const prefix = style.prefix || '';
    const suffix = style.suffix || '';
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) {
        const before = value.slice(0, start);
        const after = value.slice(end);
        if (before.endsWith(prefix) && after.startsWith(suffix)) {
            editor.value = before.slice(0, -prefix.length) + after.slice(suffix.length);
            const caret = start - prefix.length;
            editor.focus();
            editor.setSelectionRange(caret, caret);
            updatePreview();
            showNotification(translations[currentLang]['style-applied'], 'success');
            return;
        }
        editor.value = before + prefix + suffix + after;
        const caret = start + prefix.length;
        editor.focus();
        editor.setSelectionRange(caret, caret);
        updatePreview();
        showNotification(translations[currentLang]['style-applied'], 'success');
        return;
    }
    const selection = value.slice(start, end);
    const lines = selection.split('
');
    if (lines.some(hasInvalidMarkdownOrder)) {
        showNotification(translations[currentLang]['markdown-order-warning'], 'warning');
        return;
    }
    const allWrapped = lines.every(line => isLineWrappedWith(line, prefix, suffix));
    if (containsProtectedSequence(selection) && !allWrapped) {
        showNotification(translations[currentLang]['protected-warning'], 'warning');
        return;
    }
    const transformed = lines.map(line => transformLineWithStyle(line, prefix, suffix, allWrapped)).join('
');
    const before = value.slice(0, start);
    const after = value.slice(end);
    editor.value = before + transformed + after;
    const newEnd = start + transformed.length;
    editor.focus();
    editor.setSelectionRange(start, newEnd);
    updatePreview();
    showNotification(translations[currentLang]['style-applied'], 'success');
}

function applyStructureStyle(style) {
    const editor = document.getElementById('messageEditor');
    const prefix = style.prefix || '';
    const value = editor.value;
    const originalStart = editor.selectionStart;
    const originalEnd = editor.selectionEnd;
    let start = originalStart;
    let end = originalEnd;
    if (start === end) {
        const bounds = getLineBounds(value, start);
        start = bounds.start;
        end = bounds.end;
    }
    const selection = value.slice(start, end);
    const lines = selection.split('
');
    const trimmedLines = lines.map(line => line.trimStart());
    const allHavePrefix = trimmedLines.every(line => !line || line.startsWith(prefix));
    if (containsProtectedSequence(selection) && !allHavePrefix) {
        showNotification(translations[currentLang]['protected-warning'], 'warning');
        return;
    }
    const transformedLines = lines.map(line => {
        if (!line) {
            return line;
        }
        const leading = line.slice(0, line.length - line.trimStart().length);
        let trimmed = line.trimStart();
        if (allHavePrefix) {
            if (trimmed.startsWith(prefix)) {
                trimmed = trimmed.slice(prefix.length);
            }
        } else if (trimmed && !trimmed.startsWith(prefix)) {
            trimmed = `${prefix}${trimmed}`;
        }
        return leading + trimmed;
    });
    const newContent = transformedLines.join('
');
    const before = value.slice(0, start);
    const after = value.slice(end);
    editor.value = before + newContent + after;
    if (originalStart === originalEnd) {
        let caret = originalStart;
        if (allHavePrefix) {
            caret = Math.max(start, originalStart - prefix.length);
        } else {
            caret = originalStart + prefix.length;
        }
        editor.focus();
        editor.setSelectionRange(caret, caret);
    } else {
        editor.focus();
        editor.setSelectionRange(start, start + newContent.length);
    }
    updatePreview();
    showNotification(translations[currentLang]['style-applied'], 'success');
}

function applyBlockStyle(style) {
    const editor = document.getElementById('messageEditor');
    const prefix = style.prefix || '';
    const suffix = style.suffix || '';
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) {
        showNotification(translations[currentLang]['select-text'], 'warning');
        return;
    }
    const selection = editor.value.slice(start, end);
    const isWrapped = selection.startsWith(prefix) && selection.endsWith(suffix);
    if (containsProtectedSequence(selection) && !isWrapped) {
        showNotification(translations[currentLang]['protected-warning'], 'warning');
        return;
    }
    const content = isWrapped ? selection.slice(prefix.length, selection.length - suffix.length) : `${prefix}${selection}${suffix}`;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    editor.value = before + content + after;
    const newEnd = start + content.length;
    editor.focus();
    editor.setSelectionRange(start, newEnd);
    updatePreview();
    showNotification(translations[currentLang]['style-applied'], 'success');
}

function applyFont(name, data) {
    const editor = document.getElementById('messageEditor');
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) {
        showNotification(translations[currentLang]['select-text'], 'warning');
        return;
    }
    const selection = editor.value.slice(start, end);
    const { text: normalizedText, applied } = normalizeFontText(selection, data);
    if (containsProtectedSequence(selection) && !applied) {
        showNotification(translations[currentLang]['protected-warning'], 'warning');
        return;
    }
    const result = applied ? normalizedText : transformWithFont(selection, data);
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    editor.value = before + result + after;
    const newEnd = start + result.length;
    editor.focus();
    editor.setSelectionRange(start, newEnd);
    updatePreview();
    showNotification(translations[currentLang]['style-applied'], 'success');
}

function containsProtectedSequence(text) {
    return protectedPattern.test(text);
}

function hasInvalidMarkdownOrder(line) {
    const trimmed = line.trim();
    if (!trimmed) {
        return false;
    }
    const match = trimmed.match(/(#{1,3}\s|>{1,3}\s|[-*]\s|\d+\.\s)/);
    if (!match) {
        return false;
    }
    const index = trimmed.indexOf(match[0]);
    if (index <= 0) {
        return false;
    }
    const prefix = trimmed.slice(0, index);
    return /(\*|_|~~|\|\|)/.test(prefix);
}

function splitStructureSegments(line) {
    const leading = line.match(/^\s*/)?.[0] || '';
    let remainder = line.slice(leading.length);
    const structureParts = [];
    const structureRegex = /^(#{1,3}\s|>{1,3}\s|[-*]\s|\d+\.\s)/;
    let match = structureRegex.exec(remainder);
    while (match) {
        structureParts.push(match[0]);
        remainder = remainder.slice(match[0].length);
        match = structureRegex.exec(remainder);
    }
    return { leading, structure: structureParts.join(''), content: remainder };
}

function isLineWrappedWith(line, prefix, suffix) {
    if (!prefix && !suffix) {
        return false;
    }
    const { content } = splitStructureSegments(line);
    return content.startsWith(prefix) && content.endsWith(suffix) && content.length >= prefix.length + suffix.length;
}

function transformLineWithStyle(line, prefix, suffix, remove) {
    const segments = splitStructureSegments(line);
    const content = segments.content;
    if (!content) {
        return line;
    }
    if (remove && content.startsWith(prefix) && content.endsWith(suffix)) {
        const inner = content.slice(prefix.length, content.length - suffix.length);
        return segments.leading + segments.structure + inner;
    }
    if (!remove && content.startsWith(prefix) && content.endsWith(suffix)) {
        return line;
    }
    if (remove) {
        return line;
    }
    return segments.leading + segments.structure + prefix + content + suffix;
}

function getLineBounds(text, index) {
    const before = text.lastIndexOf('\n', index - 1);
    const after = text.indexOf('\n', index);
    return {
        start: before === -1 ? 0 : before + 1,
        end: after === -1 ? text.length : after
    };
}

function transformFontSample(sample, data) {
    return transformWithFont(sample, data);
}

function transformWithFont(text, data) {
    if (!text) {
        return text;
    }
    if (data.special === 'zalgo') {
        return addZalgo(text);
    }
    if (data.special === 'aesthetic') {
        return text.split('').join(' ');
    }
    if (data.special === 'strikethrough') {
        return text.split('').map(char => char + '\u0336').join('');
    }
    let converted = text.split('').map(char => mapCharacter(char, data)).join('');
    if (data.reverse) {
        converted = converted.split('').reverse().join('');
    }
    return converted;
}

function normalizeFontText(text, data) {
    if (!text) {
        return { text, applied: false };
    }
    if (data.special === 'zalgo') {
        const cleaned = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
        return { text: cleaned, applied: cleaned.length !== text.length };
    }
    if (data.special === 'aesthetic') {
        const applied = /\S\s\S/.test(text);
        const normalized = text.replace(/\s+/g, spaces => {
            if (spaces.length === 1) {
                return '';
            }
            const original = Math.max(spaces.length - 2, 1);
            return ' '.repeat(original);
        });
        return { text: normalized, applied };
    }
    if (data.special === 'strikethrough') {
        const applied = text.includes('\u0336');
        return { text: text.replace(/\u0336/g, ''), applied };
    }
    let working = text;
    if (data.reverse) {
        working = working.split('').reverse().join('');
    }
    let applied = false;
    let restored;
    if (data.map) {
        const reverseMap = data._reverseMap || (data._reverseMap = Object.fromEntries(Object.entries(data.map).map(([key, value]) => [value, key])));
        restored = working.split('').map(char => {
            if (reverseMap[char]) {
                applied = true;
                return reverseMap[char];
            }
            return char;
        }).join('');
    } else {
        restored = working.split('').map(char => {
            const base = reverseMapCharacter(char, data);
            if (base !== char) {
                applied = true;
            }
            return base;
        }).join('');
    }
    if (!applied) {
        return { text, applied: false };
    }
    return { text: restored, applied: true };
}

function reverseMapCharacter(char, data) {
    const code = char.codePointAt(0);
    if (data.offsetLower !== undefined && code >= data.offsetLower && code < data.offsetLower + 26) {
        return String.fromCodePoint(97 + (code - data.offsetLower));
    }
    if (data.offsetUpper !== undefined && code >= data.offsetUpper && code < data.offsetUpper + 26) {
        return String.fromCodePoint(65 + (code - data.offsetUpper));
    }
    if (data.offsetNumber !== undefined && code >= data.offsetNumber && code < data.offsetNumber + 10) {
        return String.fromCodePoint(48 + (code - data.offsetNumber));
    }
    return char;
}

function mapCharacter(char, data) {
    const lower = char.toLowerCase();
    if (data.map && data.map[lower]) {
        return data.map[lower];
    }
    const code = char.codePointAt(0);
    if (code >= 97 && code <= 122 && data.offsetLower !== undefined) {
        return String.fromCodePoint(data.offsetLower + (code - 97));
    }
    if (code >= 65 && code <= 90 && data.offsetUpper !== undefined) {
        return String.fromCodePoint(data.offsetUpper + (code - 65));
    }
    if (code >= 48 && code <= 57 && data.offsetNumber !== undefined) {
        return String.fromCodePoint(data.offsetNumber + (code - 48));
    }
    return char;
}

function addZalgo(text) {
    const zalgoChars = ['̀', '́', '̂', '̃', '̄', '̅', '̆', '̇', '̈', '̉', '̊', '̋', '̌', '̍', '̎', '̏', '̐', '̑', '̒', '̓', '̔', '̕', '̖', '̗', '̘', '̙', '̚', '̛', '̜', '̝', '̞', '̟', '̠', '̡', '̢', '̣', '̤', '̥', '̦', '̧', '̨', '̩', '̪', '̫', '̬', '̭', '̮', '̯', '̰', '̱', '̲', '̳', '̴', '̵', '̶'];
    return text.split('').map(char => {
        let result = char;
        for (let i = 0; i < 3; i += 1) {
            result += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
        }
        return result;
    }).join('');
}

function updatePreview() {
    const editor = document.getElementById('messageEditor');
    const preview = document.getElementById('messagePreview');
    const text = editor.value;
    if (!text) {
        preview.textContent = translations[currentLang]['preview-placeholder'];
        return;
    }
    const codeBlocks = [];
    let processed = text.replace(/```([\s\S]*?)```/g, (_, code) => {
        const token = `__CODEBLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code>${escapeHTML(code)}</code></pre>`);
        return token;
    });
    processed = escapeHTML(processed);
    processed = processed.replace(/`([^`]+)`/g, (_, code) => `<code style="background:var(--code-bg);padding:2px 4px;border-radius:3px;">${code}</code>`);
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    processed = processed.replace(/__(.+?)__/g, '<u>$1</u>');
    processed = processed.replace(/~~(.+?)~~/g, '<s>$1</s>');
    processed = processed.replace(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');
    processed = processed.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    processed = processed.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    processed = processed.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    processed = processed.replace(/^>>> (.+)$/gm, '<blockquote>$1</blockquote>');
    processed = processed.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    processed = processed.replace(/^- (.+)$/gm, '<div class="list-item">• $1</div>');
    processed = processed.replace(/\n/g, '<br>');
    codeBlocks.forEach((block, index) => {
        processed = processed.replace(`__CODEBLOCK_${index}__`, block);
    });
    preview.innerHTML = processed;
}

function escapeHTML(str) {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' };
    return str.replace(/[&<>"']/g, char => entities[char] || char);
}

function handlePreviewClick(event) {
    if (event.target.classList.contains('spoiler')) {
        event.target.classList.toggle('revealed');
    }
}

function showNotification(message, type = 'success') {
    const notif = document.getElementById('notification');
    notif.classList.remove('success', 'warning', 'error');
    notif.textContent = message;
    notif.classList.add('show', type);
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notif.classList.remove('show');
    }, 2000);
}
