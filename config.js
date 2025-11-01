// MARKIFY - Config Module
export const markdownStyles = {
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
            prefix: '```\n',
            suffix: '\n```',
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

export const unicodeFonts = {
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

export const protectedPattern = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|<#[0-9]+>|<@&[0-9]+>|<@[0-9]+>|<a?:[a-zA-Z0-9_]+:[0-9]+>)/;

// UI collections shared across modules
export const markdownButtons = new Map();
export const unicodeButtons = new Map();
export const activeMarkdownStyles = new Set();

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
