// MARKIFY - Embed & Components V2 Generator
import { translations } from './translations.js';
import * as V2 from './componentsv2.js';
import { emojiData } from './emoji.js';

const PREF_THEME = 'markify-theme';
const PREF_LANG = 'markify-lang';
const DRAFT_KEY = 'markify-embed-draft';

const lang = { current: 'fr' };
const theme = { current: 'dark' };
let mode = 'embed'; // 'embed' | 'v2'
let lastPayload = { embeds: [{}] };
let lastEmpty = true;

const DEFAULT_COLOR = '#5865F2';
const MAX_FIELDS = 25;
const MAX_EMBEDS = 10;
const EMBED_TOTAL_LIMIT = 6000;
const WEBHOOK_RE = /^https:\/\/(?:ptb\.|canary\.)?disc(?:ord|ordapp)\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+$/;
const ALL_EMOJIS = Object.values(emojiData).flat();

// Multi-embed model: the form is a live view of embeds[activeEmbed].
let embeds = [emptyEmbedDraft()];
let activeEmbed = 0;

const el = {};
let notificationTimeout = null;
let restoring = false;

function t(key) {
    const dict = translations[lang.current] || translations.fr;
    return dict[key] !== undefined ? dict[key] : (translations.fr[key] !== undefined ? translations.fr[key] : key);
}

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    loadPreferences();
    V2.initComponentsV2({
        toolbar: el.v2Toolbar,
        list: el.v2Root,
        t,
        renderMarkdown,
        onChange: () => { if (mode === 'v2') render(); }
    });
    bindEvents();
    initEmojiPopover();
    if (!restoreDraft()) {
        loadActiveToForm();
    }
    renderEmbedTabs();
    applyTranslations();
    render();
});

function cacheElements() {
    const ids = [
        'subtitle', 'backLink', 'langBtn', 'themeBtn', 'builderTitle',
        'authorName', 'authorUrl', 'authorIcon',
        'embedTitle', 'titleUrl', 'embedDescription', 'embedColor', 'embedColorHex',
        'fieldsList', 'addFieldBtn',
        'thumbnailUrl', 'imageUrl',
        'footerText', 'footerIcon', 'timestampToggle',
        'previewColTitle', 'embedPreview', 'botName', 'botTime',
        'jsonTitle', 'jsonInfo', 'embedOutput', 'validationPanel',
        'copyJsonBtn', 'resetBtn', 'notification',
        'deliveryTitle', 'webhookUrl', 'webhookLabel', 'webhookInfo',
        'sendWebhookBtn', 'webhookStatus',
        'exportBtn', 'importBtn', 'importFile',
        'modeEmbedBtn', 'modeV2Btn', 'embedPane', 'v2Pane', 'v2Toolbar', 'v2Root', 'v2Intro',
        'embedTabs', 'emojiBtn', 'emojiPopover', 'emojiPopoverSearch', 'emojiPopoverGrid',
        'webhookUsername', 'webhookAvatar', 'webhookUsernameLabel', 'webhookAvatarLabel',
        'importJsonTitle', 'importJsonInfo', 'pasteJson', 'loadPasteBtn', 'loadPasteText', 'pasteStatus'
    ];
    ids.forEach(id => { el[id] = document.getElementById(id); });
    el.inputs = [
        el.authorName, el.authorUrl, el.authorIcon,
        el.embedTitle, el.titleUrl, el.embedDescription,
        el.thumbnailUrl, el.imageUrl,
        el.footerText, el.footerIcon
    ];
}

function bindEvents() {
    el.inputs.forEach(input => input.addEventListener('input', render));
    el.timestampToggle.addEventListener('change', render);

    el.embedColor.addEventListener('input', () => {
        el.embedColorHex.value = el.embedColor.value.toUpperCase();
        render();
    });
    el.embedColorHex.addEventListener('input', () => {
        const hex = normalizeHex(el.embedColorHex.value);
        if (hex) el.embedColor.value = hex;
        render();
    });

    el.addFieldBtn.addEventListener('click', () => {
        if (el.fieldsList.children.length >= MAX_FIELDS) {
            showNotification(t('embed-max-fields'), 'warning');
            return;
        }
        addField();
        render();
    });

    el.copyJsonBtn.addEventListener('click', copyJson);
    el.resetBtn.addEventListener('click', resetAll);
    el.langBtn.addEventListener('click', toggleLanguage);
    el.themeBtn.addEventListener('click', toggleTheme);

    el.sendWebhookBtn.addEventListener('click', sendToWebhook);
    el.webhookUsername.addEventListener('input', render);
    el.webhookAvatar.addEventListener('input', render);
    el.exportBtn.addEventListener('click', exportDraft);
    el.importBtn.addEventListener('click', () => el.importFile.click());
    el.importFile.addEventListener('change', importDraft);
    el.loadPasteBtn.addEventListener('click', loadPastedJson);

    el.modeEmbedBtn.addEventListener('click', () => setMode('embed'));
    el.modeV2Btn.addEventListener('click', () => setMode('v2'));
}

function setMode(m) {
    mode = m === 'v2' ? 'v2' : 'embed';
    el.embedPane.hidden = mode !== 'embed';
    el.v2Pane.hidden = mode !== 'v2';
    el.modeEmbedBtn.classList.toggle('active', mode === 'embed');
    el.modeV2Btn.classList.toggle('active', mode === 'v2');
    el.modeEmbedBtn.setAttribute('aria-selected', mode === 'embed');
    el.modeV2Btn.setAttribute('aria-selected', mode === 'v2');
    render();
}

/* ---------- Embed fields (dynamic) ---------- */
function addField(name = '', value = '', inline = false) {
    const row = document.createElement('div');
    row.className = 'embed-field-row';
    row.innerHTML = `
        <div class="embed-field-inputs">
            <input type="text" class="field-name" maxlength="256" placeholder="${escapeAttr(t('embed-field-name'))}">
            <textarea class="field-value" maxlength="1024" placeholder="${escapeAttr(t('embed-field-value'))}"></textarea>
            <label class="embed-checkbox">
                <input type="checkbox" class="field-inline"> <span class="field-inline-label">${escapeHTML(t('embed-field-inline'))}</span>
            </label>
        </div>
        <button type="button" class="field-remove" title="${escapeAttr(t('embed-remove-field'))}" aria-label="${escapeAttr(t('embed-remove-field'))}">✕</button>
    `;
    row.querySelector('.field-name').value = name;
    row.querySelector('.field-value').value = value;
    row.querySelector('.field-inline').checked = inline;

    row.querySelectorAll('input, textarea').forEach(input => input.addEventListener('input', render));
    row.querySelector('.field-inline').addEventListener('change', render);
    row.querySelector('.field-remove').addEventListener('click', () => {
        row.remove();
        render();
    });

    el.fieldsList.appendChild(row);
}

function collectFields() {
    const rows = [...el.fieldsList.querySelectorAll('.embed-field-row')];
    return rows.map(row => ({
        name: row.querySelector('.field-name').value,
        value: row.querySelector('.field-value').value,
        inline: row.querySelector('.field-inline').checked
    }));
}

/* ---------- Multi-embed model ---------- */
function emptyEmbedDraft() {
    return {
        author: { name: '', url: '', icon: '' },
        title: '', url: '', description: '', color: DEFAULT_COLOR,
        fields: [{ name: '', value: '', inline: false }],
        thumbnail: '', image: '', footer: { text: '', icon: '' }, timestamp: false
    };
}

function collectEmbedDraft() {
    return {
        author: { name: el.authorName.value, url: el.authorUrl.value, icon: el.authorIcon.value },
        title: el.embedTitle.value,
        url: el.titleUrl.value,
        description: el.embedDescription.value,
        color: el.embedColorHex.value,
        fields: collectFields(),
        thumbnail: el.thumbnailUrl.value,
        image: el.imageUrl.value,
        footer: { text: el.footerText.value, icon: el.footerIcon.value },
        timestamp: el.timestampToggle.checked
    };
}

function applyEmbedFields(d) {
    el.authorName.value = str(d.author && d.author.name);
    el.authorUrl.value = str(d.author && d.author.url);
    el.authorIcon.value = str(d.author && d.author.icon);
    el.embedTitle.value = str(d.title);
    el.titleUrl.value = str(d.url);
    el.embedDescription.value = str(d.description);
    const hex = normalizeHex(d.color) || DEFAULT_COLOR;
    el.embedColorHex.value = hex.toUpperCase();
    el.embedColor.value = hex;
    el.thumbnailUrl.value = str(d.thumbnail);
    el.imageUrl.value = str(d.image);
    el.footerText.value = str(d.footer && d.footer.text);
    el.footerIcon.value = str(d.footer && d.footer.icon);
    el.timestampToggle.checked = !!d.timestamp;

    el.fieldsList.innerHTML = '';
    const fields = Array.isArray(d.fields) && d.fields.length ? d.fields : [{ name: '', value: '', inline: false }];
    fields.slice(0, MAX_FIELDS).forEach(f => addField(str(f.name), str(f.value), !!f.inline));
}

function normalizeEmbedDraft(d) {
    d = d || {};
    return {
        author: { name: str(d.author && d.author.name), url: str(d.author && d.author.url), icon: str(d.author && d.author.icon) },
        title: str(d.title), url: str(d.url), description: str(d.description),
        color: normalizeHex(d.color) || DEFAULT_COLOR,
        fields: Array.isArray(d.fields) && d.fields.length
            ? d.fields.map(f => ({ name: str(f.name), value: str(f.value), inline: !!f.inline }))
            : [{ name: '', value: '', inline: false }],
        thumbnail: str(d.thumbnail), image: str(d.image),
        footer: { text: str(d.footer && d.footer.text), icon: str(d.footer && d.footer.icon) },
        timestamp: !!d.timestamp
    };
}

function syncActiveFromForm() {
    embeds[activeEmbed] = collectEmbedDraft();
}

function loadActiveToForm() {
    applyEmbedFields(embeds[activeEmbed]);
}

function renderEmbedTabs() {
    el.embedTabs.innerHTML = '';
    embeds.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'embed-tab' + (i === activeEmbed ? ' active' : '');
        b.textContent = t('embed-tab') + ' ' + (i + 1);
        b.addEventListener('click', () => switchEmbed(i));
        el.embedTabs.appendChild(b);
    });
    if (embeds.length < MAX_EMBEDS) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'embed-tab embed-tab-add';
        add.textContent = '+';
        add.title = t('embed-add-tab');
        add.setAttribute('aria-label', t('embed-add-tab'));
        add.addEventListener('click', addEmbed);
        el.embedTabs.appendChild(add);
    }
    if (embeds.length > 1) {
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'embed-tab embed-tab-remove';
        rm.textContent = '🗑';
        rm.title = t('embed-remove-tab');
        rm.setAttribute('aria-label', t('embed-remove-tab'));
        rm.addEventListener('click', removeEmbed);
        el.embedTabs.appendChild(rm);
    }
}

function switchEmbed(i) {
    if (i === activeEmbed) return;
    syncActiveFromForm();
    activeEmbed = i;
    loadActiveToForm();
    renderEmbedTabs();
    render();
}

function addEmbed() {
    syncActiveFromForm();
    if (embeds.length >= MAX_EMBEDS) return;
    embeds.push(emptyEmbedDraft());
    activeEmbed = embeds.length - 1;
    loadActiveToForm();
    renderEmbedTabs();
    render();
}

function removeEmbed() {
    if (embeds.length <= 1) return;
    embeds.splice(activeEmbed, 1);
    if (activeEmbed >= embeds.length) activeEmbed = embeds.length - 1;
    loadActiveToForm();
    renderEmbedTabs();
    render();
}

/* ---------- Draft -> Discord embed ---------- */
function buildEmbedFromDraft(d) {
    const embed = {};
    if (d.title && d.title.trim()) embed.title = d.title.trim();
    if (d.url && d.url.trim()) embed.url = d.url.trim();
    if (d.description && d.description.trim()) embed.description = d.description;
    const colorInt = hexToInt(d.color);
    if (colorInt !== null) embed.color = colorInt;

    const author = {};
    if (d.author && d.author.name && d.author.name.trim()) author.name = d.author.name.trim();
    if (d.author && d.author.url && d.author.url.trim()) author.url = d.author.url.trim();
    if (d.author && d.author.icon && d.author.icon.trim()) author.icon_url = d.author.icon.trim();
    if (author.name) embed.author = author;

    const fields = (d.fields || [])
        .filter(f => (f.name && f.name.trim()) || (f.value && f.value.trim()))
        .map(f => ({ name: f.name.trim() || '​', value: f.value.trim() || '​', inline: !!f.inline }));
    if (fields.length) embed.fields = fields;

    if (d.thumbnail && d.thumbnail.trim()) embed.thumbnail = { url: d.thumbnail.trim() };
    if (d.image && d.image.trim()) embed.image = { url: d.image.trim() };

    const footer = {};
    if (d.footer && d.footer.text && d.footer.text.trim()) footer.text = d.footer.text.trim();
    if (d.footer && d.footer.icon && d.footer.icon.trim()) footer.icon_url = d.footer.icon.trim();
    if (footer.text) embed.footer = footer;

    if (d.timestamp) embed.timestamp = new Date().toISOString();
    return embed;
}

function isBuiltEmbedEmpty(e) {
    return !e.title && !e.description && !e.author && !e.fields && !e.image && !e.thumbnail && !e.footer;
}

/* ---------- Render ---------- */
function render() {
    if (mode === 'v2') {
        lastPayload = applyOverrides(V2.buildPayload());
        lastEmpty = V2.isEmpty();
        el.embedPreview.innerHTML = '';
        V2.renderPreview(el.embedPreview);
    } else {
        if (!restoring) syncActiveFromForm();
        const built = embeds.map(buildEmbedFromDraft);
        const nonEmpty = built.filter(e => !isBuiltEmbedEmpty(e));
        lastPayload = applyOverrides({ embeds: nonEmpty.length ? nonEmpty : [{}] });
        lastEmpty = nonEmpty.length === 0;
        renderEmbedPreview(nonEmpty);
    }
    el.embedOutput.textContent = JSON.stringify(lastPayload, null, 2);
    renderValidation();
    if (!restoring) saveDraft();
}

function applyOverrides(payload) {
    const u = el.webhookUsername.value.trim();
    const a = el.webhookAvatar.value.trim();
    const out = {};
    if (u) out.username = u;
    if (a) out.avatar_url = a;
    return Object.assign(out, payload);
}

function renderEmbedPreview(builtEmbeds) {
    const target = el.embedPreview;
    target.innerHTML = '';
    if (!builtEmbeds.length) {
        const empty = document.createElement('div');
        empty.className = 'discord-embed-empty';
        empty.textContent = t('embed-preview-empty');
        target.appendChild(empty);
        return;
    }
    builtEmbeds.forEach(e => target.appendChild(buildEmbedCard(e)));
}

function buildEmbedCard(embed) {
    const card = document.createElement('div');
    card.className = 'discord-embed';
    card.style.borderColor = intToHex(embed.color);

    const content = document.createElement('div');
    content.className = 'discord-embed-content';

    if (embed.author) {
        const author = document.createElement('div');
        author.className = 'discord-embed-author';
        if (embed.author.icon_url) author.appendChild(makeImg(embed.author.icon_url, 'discord-embed-author-icon'));
        const name = document.createElement(embed.author.url ? 'a' : 'span');
        name.className = 'discord-embed-author-name';
        name.textContent = embed.author.name;
        if (embed.author.url) { name.href = embed.author.url; name.target = '_blank'; name.rel = 'noopener'; }
        author.appendChild(name);
        content.appendChild(author);
    }

    if (embed.title) {
        const title = document.createElement(embed.url ? 'a' : 'div');
        title.className = 'discord-embed-title';
        title.textContent = embed.title;
        if (embed.url) { title.href = embed.url; title.target = '_blank'; title.rel = 'noopener'; }
        content.appendChild(title);
    }

    if (embed.description) {
        const desc = document.createElement('div');
        desc.className = 'discord-embed-description';
        desc.innerHTML = renderMarkdown(embed.description);
        content.appendChild(desc);
    }

    if (embed.fields) {
        const grid = document.createElement('div');
        grid.className = 'discord-embed-fields';
        embed.fields.forEach(f => {
            const field = document.createElement('div');
            field.className = 'discord-embed-field' + (f.inline ? ' inline' : '');
            const n = document.createElement('div');
            n.className = 'discord-embed-field-name';
            n.innerHTML = renderMarkdown(f.name);
            field.appendChild(n);
            const v = document.createElement('div');
            v.className = 'discord-embed-field-value';
            v.innerHTML = renderMarkdown(f.value);
            field.appendChild(v);
            grid.appendChild(field);
        });
        content.appendChild(grid);
    }

    if (embed.image) content.appendChild(makeImg(embed.image.url, 'discord-embed-image'));

    if (embed.footer || embed.timestamp) {
        const footer = document.createElement('div');
        footer.className = 'discord-embed-footer';
        if (embed.footer && embed.footer.icon_url) footer.appendChild(makeImg(embed.footer.icon_url, 'discord-embed-footer-icon'));
        const text = document.createElement('span');
        text.className = 'discord-embed-footer-text';
        const parts = [];
        if (embed.footer && embed.footer.text) parts.push(embed.footer.text);
        if (embed.timestamp) parts.push(formatTimestamp(embed.timestamp));
        text.textContent = parts.join(' • ');
        footer.appendChild(text);
        content.appendChild(footer);
    }

    card.appendChild(content);
    if (embed.thumbnail) card.appendChild(makeImg(embed.thumbnail.url, 'discord-embed-thumbnail'));
    return card;
}

function makeImg(src, className) {
    const img = document.createElement('img');
    img.className = className;
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => img.classList.add('img-broken'));
    return img;
}

function formatTimestamp(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(lang.current === 'fr' ? 'fr-FR' : 'en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

/* ---------- Validation ---------- */
function renderValidation() {
    const warns = mode === 'v2' ? V2.getWarnings(t) : embedWarnings();
    el.validationPanel.innerHTML = '';
    if (!warns.length) {
        el.validationPanel.hidden = true;
        return;
    }
    el.validationPanel.hidden = false;
    warns.forEach(w => {
        const item = document.createElement('div');
        item.className = 'validation-item';
        item.textContent = w;
        el.validationPanel.appendChild(item);
    });
}

function embedWarnings() {
    const w = [];
    let total = 0;
    embeds.forEach(d => {
        total += textLen(d.author && d.author.name) + textLen(d.title) + textLen(d.description) + textLen(d.footer && d.footer.text);
        (d.fields || []).forEach(f => { total += textLen(f.name) + textLen(f.value); });
    });
    if (total > EMBED_TOTAL_LIMIT) w.push(t('embed-warn-total').replace('{n}', total));
    embeds.forEach((d, i) => {
        if ((d.fields || []).length > MAX_FIELDS) w.push(t('embed-warn-fields').replace('{i}', i + 1));
    });
    return w;
}

function textLen(v) {
    return (v || '').trim().length;
}

/* ---------- Minimal Discord markdown renderer (preview only) ---------- */
function renderMarkdown(text) {
    let s = escapeHTML(text);
    const blocks = [];
    s = s.replace(/```([\s\S]*?)```/g, (m, code) => {
        blocks.push(code.replace(/\n/g, '<br>'));
        return ` B${blocks.length - 1} `;
    });
    const out = s.split('\n').map(line => {
        const h = line.match(/^(#{1,3})\s+(.*)$/);
        if (h) return `<span class="md-h md-h${h[1].length}">${inlineMd(h[2])}</span>`;
        const li = line.match(/^\s*[-*]\s+(.*)$/);
        if (li) return `<span class="md-li">${inlineMd(li[1])}</span>`;
        const q = line.match(/^&gt;\s+(.*)$/);
        if (q) return `<span class="md-quote">${inlineMd(q[1])}</span>`;
        return inlineMd(line);
    }).join('<br>');
    return out.replace(/ B(\d+) /g, (m, i) => `<code class="md-code-block">${blocks[Number(i)]}</code>`);
}

function inlineMd(s) {
    return s
        .replace(/`([^`\n]+?)`/g, '<code class="md-code">$1</code>')
        .replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+?)__/g, '<u>$1</u>')
        .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
        .replace(/_([^_]+?)_/g, '<em>$1</em>')
        .replace(/~~([^~]+?)~~/g, '<s>$1</s>')
        .replace(/\|\|([^|]+?)\|\|/g, '<span class="md-spoiler">$1</span>');
}

/* ---------- Emoji popover (inserts into the description) ---------- */
function initEmojiPopover() {
    renderEmojiGrid('');
    el.emojiBtn.addEventListener('click', e => {
        e.stopPropagation();
        el.emojiPopover.hidden = !el.emojiPopover.hidden;
        if (!el.emojiPopover.hidden) {
            el.emojiPopoverSearch.value = '';
            renderEmojiGrid('');
            el.emojiPopoverSearch.focus();
        }
    });
    el.emojiPopoverSearch.addEventListener('input', () => renderEmojiGrid(el.emojiPopoverSearch.value));
    el.emojiPopover.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => { el.emojiPopover.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') el.emojiPopover.hidden = true; });
}

function renderEmojiGrid(query) {
    const q = query.trim().toLowerCase();
    const list = (q ? ALL_EMOJIS.filter(x => x.n.some(n => n.includes(q))) : ALL_EMOJIS).slice(0, 240);
    el.emojiPopoverGrid.innerHTML = '';
    if (!list.length) {
        const none = document.createElement('div');
        none.className = 'emoji-popover-none';
        none.textContent = t('no-emoji-results');
        el.emojiPopoverGrid.appendChild(none);
        return;
    }
    list.forEach(x => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'emoji-cell';
        b.textContent = x.e;
        b.addEventListener('click', () => insertAtCursor(el.embedDescription, x.e));
        el.emojiPopoverGrid.appendChild(b);
    });
}

function insertAtCursor(ta, text) {
    const s = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
    const e = ta.selectionEnd != null ? ta.selectionEnd : ta.value.length;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    const pos = s + text.length;
    ta.selectionStart = ta.selectionEnd = pos;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
}

/* ---------- Draft persistence (auto-save + import/export) ---------- */
function collectDraft() {
    if (mode === 'embed') syncActiveFromForm();
    return {
        mode,
        activeEmbed,
        embeds: embeds.map(normalizeEmbedDraft),
        v2: V2.getDraft(),
        overrides: { username: el.webhookUsername.value, avatar: el.webhookAvatar.value }
    };
}

function applyDraft(d) {
    if (!d || typeof d !== 'object') return false;
    restoring = true;
    try {
        let arr = Array.isArray(d.embeds) ? d.embeds : (d.embed ? [d.embed] : (isDraftFlat(d) ? [d] : []));
        embeds = arr.length ? arr.map(normalizeEmbedDraft) : [emptyEmbedDraft()];
        activeEmbed = clampInt(d.activeEmbed || 0, 0, embeds.length - 1);
        loadActiveToForm();
        renderEmbedTabs();
        el.webhookUsername.value = str(d.overrides && d.overrides.username);
        el.webhookAvatar.value = str(d.overrides && d.overrides.avatar);
        V2.setDraft(Array.isArray(d.v2) ? d.v2 : []);
    } finally {
        restoring = false;
    }
    setMode(d.mode === 'v2' ? 'v2' : 'embed');
    return true;
}

function isDraftFlat(d) {
    return !('embeds' in d) && !('embed' in d) && ('title' in d || 'description' in d || 'fields' in d);
}

function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(collectDraft())); } catch (_) { /* storage unavailable */ }
}

function restoreDraft() {
    let raw = null;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch (_) { return false; }
    if (!raw) return false;
    try {
        return applyDraft(JSON.parse(raw));
    } catch (_) {
        return false;
    }
}

function exportDraft() {
    const data = JSON.stringify(collectDraft(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markify-embed.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showNotification(t('embed-exported'), 'success');
}

function importDraft(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            if (applyDraft(data)) {
                render();
                showNotification(t('embed-imported'), 'success');
            } else {
                showNotification(t('embed-import-error'), 'error');
            }
        } catch (_) {
            showNotification(t('embed-import-error'), 'error');
        }
        el.importFile.value = '';
    };
    reader.onerror = () => {
        showNotification(t('embed-import-error'), 'error');
        el.importFile.value = '';
    };
    reader.readAsText(file);
}

/* ---------- Import a Discord message / embed JSON ---------- */
function loadPastedJson() {
    const raw = el.pasteJson.value.trim();
    if (!raw) { setPasteStatus(t('paste-error'), 'error'); return; }
    let data;
    try { data = JSON.parse(raw); } catch (_) { setPasteStatus(t('paste-error'), 'error'); return; }

    const isV2 = data && Array.isArray(data.components) && ((Number(data.flags) & 32768) || !data.embeds);
    restoring = true;
    let ok = true;
    try {
        if (isV2) {
            V2.fromDiscord(data.components);
            el.webhookUsername.value = str(data.username);
            el.webhookAvatar.value = str(data.avatar_url);
        } else {
            let arr = Array.isArray(data.embeds) ? data.embeds : (isEmbedLike(data) ? [data] : []);
            if (!arr.length) { ok = false; }
            else {
                embeds = arr.slice(0, MAX_EMBEDS).map(discordEmbedToDraft);
                activeEmbed = 0;
                el.webhookUsername.value = str(data.username);
                el.webhookAvatar.value = str(data.avatar_url);
                loadActiveToForm();
                renderEmbedTabs();
            }
        }
    } catch (_) {
        ok = false;
    } finally {
        restoring = false;
    }
    if (!ok) { setPasteStatus(t('paste-error'), 'error'); return; }
    setMode(isV2 ? 'v2' : 'embed');
    render();
    setPasteStatus(t('paste-loaded'), 'success');
}

function isEmbedLike(o) {
    return o && typeof o === 'object' &&
        ('title' in o || 'description' in o || 'fields' in o || 'author' in o || 'image' in o || 'thumbnail' in o || 'footer' in o || 'color' in o);
}

function discordEmbedToDraft(e) {
    e = e || {};
    return {
        author: { name: str(e.author && e.author.name), url: str(e.author && e.author.url), icon: str(e.author && e.author.icon_url) },
        title: str(e.title), url: str(e.url), description: str(e.description),
        color: e.color != null ? '#' + (Number(e.color) & 0xffffff).toString(16).padStart(6, '0').toUpperCase() : DEFAULT_COLOR,
        fields: Array.isArray(e.fields) && e.fields.length
            ? e.fields.map(f => ({ name: str(f.name), value: str(f.value), inline: !!f.inline }))
            : [{ name: '', value: '', inline: false }],
        thumbnail: str(e.thumbnail && e.thumbnail.url), image: str(e.image && e.image.url),
        footer: { text: str(e.footer && e.footer.text), icon: str(e.footer && e.footer.icon_url) },
        timestamp: !!e.timestamp
    };
}

function setPasteStatus(message, type) {
    el.pasteStatus.textContent = message;
    el.pasteStatus.className = 'embed-status' + (type ? ' ' + type : '');
}

/* ---------- Webhook delivery ---------- */
async function sendToWebhook() {
    const url = el.webhookUrl.value.trim();
    if (!WEBHOOK_RE.test(url)) {
        setWebhookStatus(t('embed-webhook-invalid'), 'error');
        return;
    }
    if (lastEmpty) {
        setWebhookStatus(t('embed-webhook-empty'), 'error');
        return;
    }

    el.sendWebhookBtn.disabled = true;
    setWebhookStatus(t('embed-webhook-sending'), '');
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastPayload)
        });
        if (res.ok) {
            setWebhookStatus(t('embed-webhook-success'), 'success');
        } else {
            const detail = res.status === 429 ? t('embed-webhook-rate') : `${t('embed-webhook-http')} ${res.status}`;
            setWebhookStatus(detail, 'error');
        }
    } catch (_) {
        setWebhookStatus(t('embed-webhook-network'), 'error');
    } finally {
        el.sendWebhookBtn.disabled = false;
    }
}

function setWebhookStatus(message, type) {
    el.webhookStatus.textContent = message;
    el.webhookStatus.className = 'embed-status' + (type ? ' ' + type : '');
}

/* ---------- Actions ---------- */
async function copyJson() {
    const ok = await copyToClipboard(el.embedOutput.textContent);
    showNotification(ok ? t('embed-copied') : t('copy-error'), ok ? 'success' : 'error');
}

function resetAll() {
    if (mode === 'v2') {
        V2.reset();
    } else {
        embeds = [emptyEmbedDraft()];
        activeEmbed = 0;
        loadActiveToForm();
        renderEmbedTabs();
    }
    setWebhookStatus('', '');
    render();
    showNotification(t('reset-done'), 'success');
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (_) { /* fall through */ }
    return fallbackCopy(text);
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(textarea);
    return ok;
}

function showNotification(message, type = 'success') {
    const node = el.notification;
    if (notificationTimeout) clearTimeout(notificationTimeout);
    node.textContent = message;
    node.className = `notification ${type} show`;
    notificationTimeout = setTimeout(() => {
        node.className = 'notification';
    }, 2600);
}

/* ---------- Theme / Language (shared prefs) ---------- */
function savePref(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* storage unavailable */ }
}

function loadPreferences() {
    let savedTheme = null;
    let savedLang = null;
    try {
        savedTheme = localStorage.getItem(PREF_THEME);
        savedLang = localStorage.getItem(PREF_LANG);
    } catch (_) { /* storage unavailable */ }
    theme.current = savedTheme === 'light' ? 'light' : 'dark';
    lang.current = savedLang === 'en' ? 'en' : 'fr';
    document.body.classList.toggle('light', theme.current === 'light');
    el.themeBtn.textContent = theme.current === 'dark' ? '🌙' : '☀️';
    el.langBtn.textContent = lang.current.toUpperCase();
}

function toggleTheme() {
    theme.current = theme.current === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light', theme.current === 'light');
    el.themeBtn.textContent = theme.current === 'dark' ? '🌙' : '☀️';
    savePref(PREF_THEME, theme.current);
}

function toggleLanguage() {
    lang.current = lang.current === 'fr' ? 'en' : 'fr';
    el.langBtn.textContent = lang.current.toUpperCase();
    savePref(PREF_LANG, lang.current);
    applyTranslations();
    renderEmbedTabs();
    render();
}

function applyTranslations() {
    document.documentElement.lang = lang.current;
    const map = {
        subtitle: 'embed-subtitle',
        builderTitle: 'builder-title',
        previewColTitle: 'embed-preview-title',
        jsonTitle: 'embed-json-title',
        jsonInfo: 'embed-json-info',
        deliveryTitle: 'embed-delivery-title',
        webhookLabel: 'embed-webhook-label',
        webhookInfo: 'embed-webhook-info',
        modeEmbedBtn: 'v2-mode-embed',
        modeV2Btn: 'v2-mode-v2',
        v2Intro: 'v2-intro',
        webhookUsernameLabel: 'embed-webhook-username',
        webhookAvatarLabel: 'embed-webhook-avatar',
        importJsonTitle: 'embed-import-json-title',
        importJsonInfo: 'embed-import-json-info',
        loadPasteText: 'embed-load-paste'
    };
    for (const [id, key] of Object.entries(map)) {
        if (el[id]) el[id].textContent = t(key);
    }
    V2.retranslate(t);

    setText('authorLegend', 'embed-author-legend');
    setText('authorNameLabel', 'embed-author-name');
    setText('authorUrlLabel', 'embed-author-url');
    setText('authorIconLabel', 'embed-author-icon');
    setText('bodyLegend', 'embed-body-legend');
    setText('titleLabel', 'embed-title');
    setText('titleUrlLabel', 'embed-title-url');
    setText('descriptionLabel', 'embed-description');
    setText('colorLabel', 'embed-color');
    setText('fieldsLegend', 'embed-fields-legend');
    setText('addFieldText', 'embed-add-field');
    setText('mediaLegend', 'embed-media-legend');
    setText('thumbnailLabel', 'embed-thumbnail');
    setText('imageLabel', 'embed-image');
    setText('footerLegend', 'embed-footer-legend');
    setText('footerTextLabel', 'embed-footer-text');
    setText('footerIconLabel', 'embed-footer-icon');
    setText('timestampLabel', 'embed-timestamp');
    setText('copyJsonText', 'embed-copy-json');
    setText('resetText', 'reset-btn');
    setText('sendText', 'embed-webhook-send');
    setText('exportText', 'embed-export');
    setText('importText', 'embed-import');
    setText('footerCredit', 'footer-text');
    setText('footerCredit2', 'footer-text2');

    if (el.backLink) el.backLink.textContent = '← ' + t('embed-back');
    el.webhookUrl.placeholder = 'https://discord.com/api/webhooks/...';
    el.emojiPopoverSearch.placeholder = t('emoji-search');

    el.fieldsList.querySelectorAll('.embed-field-row').forEach(row => {
        row.querySelector('.field-name').placeholder = t('embed-field-name');
        row.querySelector('.field-value').placeholder = t('embed-field-value');
        row.querySelector('.field-inline-label').textContent = t('embed-field-inline');
        const removeBtn = row.querySelector('.field-remove');
        removeBtn.title = t('embed-remove-field');
        removeBtn.setAttribute('aria-label', t('embed-remove-field'));
    });
}

function setText(id, key) {
    const node = document.getElementById(id);
    if (node) node.textContent = t(key);
}

/* ---------- Helpers ---------- */
function normalizeHex(value) {
    let v = String(value == null ? '' : value).trim();
    if (!v) return null;
    if (!v.startsWith('#')) v = '#' + v;
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v : null;
}

function hexToInt(value) {
    const hex = normalizeHex(value);
    if (!hex) return null;
    return parseInt(hex.slice(1), 16);
}

function intToHex(int) {
    if (typeof int !== 'number' || isNaN(int)) return DEFAULT_COLOR;
    return '#' + (int & 0xffffff).toString(16).padStart(6, '0');
}

function clampInt(v, lo, hi) {
    v = Math.round(Number(v) || 0);
    return Math.min(hi, Math.max(lo, v));
}

function str(v) {
    return v === undefined || v === null ? '' : String(v);
}

function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function escapeAttr(s) {
    return escapeHTML(s);
}
