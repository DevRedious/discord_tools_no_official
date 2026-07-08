// MARKIFY - Embed Generator
import { translations } from './translations.js';
import * as V2 from './componentsv2.js';

const PREF_THEME = 'markify-theme';
const PREF_LANG = 'markify-lang';
const DRAFT_KEY = 'markify-embed-draft';

const lang = { current: 'fr' };
const theme = { current: 'dark' };
let mode = 'embed'; // 'embed' | 'v2'
let lastPayload = { embeds: [{}] };
let lastEmpty = true;

function t(key) {
    const dict = translations[lang.current] || translations.fr;
    return dict[key] !== undefined ? dict[key] : (translations.fr[key] !== undefined ? translations.fr[key] : key);
}

const DEFAULT_COLOR = '#5865F2';
const MAX_FIELDS = 25;
const WEBHOOK_RE = /^https:\/\/(?:ptb\.|canary\.)?disc(?:ord|ordapp)\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+$/;

const el = {};
let notificationTimeout = null;
let restoring = false;

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
    if (!restoreDraft()) addField();
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
        'jsonTitle', 'jsonInfo', 'embedOutput',
        'copyJsonBtn', 'resetBtn', 'notification',
        'deliveryTitle', 'webhookUrl', 'webhookLabel', 'webhookInfo',
        'sendWebhookBtn', 'webhookStatus',
        'exportBtn', 'importBtn', 'importFile',
        'modeEmbedBtn', 'modeV2Btn', 'embedPane', 'v2Pane', 'v2Toolbar', 'v2Root', 'v2Intro'
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
    el.exportBtn.addEventListener('click', exportDraft);
    el.importBtn.addEventListener('click', () => el.importFile.click());
    el.importFile.addEventListener('change', importDraft);

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

/* ---------- Fields (dynamic) ---------- */
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
        name: row.querySelector('.field-name').value.trim(),
        value: row.querySelector('.field-value').value.trim(),
        inline: row.querySelector('.field-inline').checked
    }));
}

/* ---------- Build embed object ---------- */
function buildEmbed() {
    const embed = {};

    const title = el.embedTitle.value.trim();
    if (title) embed.title = title;

    const titleUrl = el.titleUrl.value.trim();
    if (titleUrl) embed.url = titleUrl;

    const description = el.embedDescription.value.trim();
    if (description) embed.description = description;

    const colorInt = hexToInt(el.embedColorHex.value);
    if (colorInt !== null) embed.color = colorInt;

    const author = {};
    if (el.authorName.value.trim()) author.name = el.authorName.value.trim();
    if (el.authorUrl.value.trim()) author.url = el.authorUrl.value.trim();
    if (el.authorIcon.value.trim()) author.icon_url = el.authorIcon.value.trim();
    if (author.name) embed.author = author; // Discord requires a name for the author block

    const fields = collectFields().filter(f => f.name || f.value);
    if (fields.length) embed.fields = fields;

    if (el.thumbnailUrl.value.trim()) embed.thumbnail = { url: el.thumbnailUrl.value.trim() };
    if (el.imageUrl.value.trim()) embed.image = { url: el.imageUrl.value.trim() };

    const footer = {};
    if (el.footerText.value.trim()) footer.text = el.footerText.value.trim();
    if (el.footerIcon.value.trim()) footer.icon_url = el.footerIcon.value.trim();
    if (footer.text) embed.footer = footer; // footer icon needs footer text to show

    if (el.timestampToggle.checked) embed.timestamp = new Date().toISOString();

    return embed;
}

function isEmbedEmpty(embed) {
    return !embed.title && !embed.description && !embed.author &&
        !embed.fields && !embed.image && !embed.thumbnail && !embed.footer;
}

/* ---------- Render ---------- */
function render() {
    if (mode === 'v2') {
        lastPayload = V2.buildPayload();
        lastEmpty = V2.isEmpty();
        V2.renderPreview(el.embedPreview);
    } else {
        const embed = buildEmbed();
        lastPayload = { embeds: [embed] };
        lastEmpty = isEmbedEmpty(embed);
        renderPreview(embed);
    }
    el.embedOutput.textContent = JSON.stringify(lastPayload, null, 2);
    if (!restoring) saveDraft();
}

function renderPreview(embed) {
    const wrapper = el.embedPreview;
    wrapper.innerHTML = '';

    if (isEmbedEmpty(embed)) {
        const empty = document.createElement('div');
        empty.className = 'discord-embed-empty';
        empty.textContent = t('embed-preview-empty');
        wrapper.appendChild(empty);
        return;
    }

    const card = document.createElement('div');
    card.className = 'discord-embed';
    card.style.borderColor = intToHex(embed.color);

    const content = document.createElement('div');
    content.className = 'discord-embed-content';

    // Author
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

    // Title (Discord does not render markdown in titles, only a masked link via url)
    if (embed.title) {
        const title = document.createElement(embed.url ? 'a' : 'div');
        title.className = 'discord-embed-title';
        title.textContent = embed.title;
        if (embed.url) { title.href = embed.url; title.target = '_blank'; title.rel = 'noopener'; }
        content.appendChild(title);
    }

    // Description (markdown-rendered)
    if (embed.description) {
        const desc = document.createElement('div');
        desc.className = 'discord-embed-description';
        desc.innerHTML = renderMarkdown(embed.description);
        content.appendChild(desc);
    }

    // Fields
    if (embed.fields) {
        const grid = document.createElement('div');
        grid.className = 'discord-embed-fields';
        embed.fields.forEach(f => {
            const field = document.createElement('div');
            field.className = 'discord-embed-field' + (f.inline ? ' inline' : '');
            if (f.name) {
                const n = document.createElement('div');
                n.className = 'discord-embed-field-name';
                n.innerHTML = renderMarkdown(f.name);
                field.appendChild(n);
            }
            if (f.value) {
                const v = document.createElement('div');
                v.className = 'discord-embed-field-value';
                v.innerHTML = renderMarkdown(f.value);
                field.appendChild(v);
            }
            grid.appendChild(field);
        });
        content.appendChild(grid);
    }

    // Image
    if (embed.image) {
        content.appendChild(makeImg(embed.image.url, 'discord-embed-image'));
    }

    // Footer
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

    // Thumbnail (top-right)
    if (embed.thumbnail) {
        card.appendChild(makeImg(embed.thumbnail.url, 'discord-embed-thumbnail'));
    }

    wrapper.appendChild(card);
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

/* ---------- Minimal Discord markdown renderer (preview only) ---------- */
function renderMarkdown(text) {
    let html = escapeHTML(text);
    html = html.replace(/```([\s\S]*?)```/g, (m, code) => `<code class="md-code-block">${code.replace(/\n/g, '<br>')}</code>`);
    html = html.replace(/`([^`\n]+?)`/g, '<code class="md-code">$1</code>');
    html = html.replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+?)__/g, '<u>$1</u>');
    html = html.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+?)_/g, '<em>$1</em>');
    html = html.replace(/~~([^~]+?)~~/g, '<s>$1</s>');
    html = html.replace(/\|\|([^|]+?)\|\|/g, '<span class="md-spoiler">$1</span>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

/* ---------- Color helpers ---------- */
function normalizeHex(value) {
    let v = String(value).trim();
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
    return '#' + int.toString(16).padStart(6, '0');
}

/* ---------- Draft persistence (auto-save + import/export) ---------- */
function collectDraft() {
    // Serialize the raw builder inputs so a load restores the form exactly.
    // The webhook URL is intentionally excluded (never persisted or exported).
    return {
        mode,
        embed: collectEmbedDraft(),
        v2: V2.getDraft()
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

function applyDraft(d) {
    if (!d || typeof d !== 'object') return false;
    restoring = true;
    try {
        // Backward compatible: old drafts were the flat embed object itself.
        const embedData = (d.embed && typeof d.embed === 'object') ? d.embed : d;
        applyEmbedFields(embedData);
        V2.setDraft(Array.isArray(d.v2) ? d.v2 : []);
    } finally {
        restoring = false;
    }
    setMode(d.mode === 'v2' ? 'v2' : 'embed');
    return true;
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
    const fields = Array.isArray(d.fields) ? d.fields : [];
    if (fields.length) {
        fields.slice(0, MAX_FIELDS).forEach(f => addField(str(f.name), str(f.value), !!f.inline));
    } else {
        addField();
    }
}

function str(v) {
    return v === undefined || v === null ? '' : String(v);
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
        el.inputs.forEach(input => { input.value = ''; });
        el.embedColor.value = DEFAULT_COLOR;
        el.embedColorHex.value = DEFAULT_COLOR;
        el.timestampToggle.checked = false;
        el.fieldsList.innerHTML = '';
        addField();
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
        v2Intro: 'v2-intro'
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

    // Refresh dynamic field placeholders/labels
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

/* ---------- Escaping ---------- */
function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function escapeAttr(str) {
    return escapeHTML(str);
}
