// MARKIFY MAIN SCRIPT
import { translations } from './translations.js';
import { initEmojis, searchEmojis } from './emoji.js';
import { markdownStyles, unicodeFonts, protectedPattern, markdownButtons, unicodeButtons, activeMarkdownStyles, state } from './config.js';

const headingStyleIds = new Set(['heading1', 'heading2', 'heading3']);
const autoContinueStyleIds = ['list', 'quote', 'multiline-quote', ...headingStyleIds];
const autoContinueExitOnEmpty = new Set(['list', 'quote', 'multiline-quote']);
const DISCORD_LIMIT = 2000;
const DISCORD_LIMIT_NITRO = 4000;

const templates = [
    {
        id: 'event-wrap-up',
        label: 'Annonce fin d\'événement',
        content: `# Fin de l’événement 🎉\n\n- Merci à toutes et tous pour votre participation.\n- Vos retours nous aideront à améliorer les prochains rendez-vous.\n\n## Donner votre avis ?\n- Un formulaire est disponible pour partager vos impressions.\n\n## À très bientôt\n- D'autres surprises arrivent très vite !`
    },
    {
        id: 'maintenance',
        label: 'Annonce maintenance',
        content: `# 🛠️ Maintenance programmée\n\n> 📅 Date : <t:1700000000:f>\n> ⏱️ Durée estimée : 30 minutes\n\nPendant cette période :\n- Les services seront indisponibles.\n- Le suivi sera communiqué en direct sur <#000000000000000000>.\n\nMerci de votre compréhension !`
    },
    {
        id: 'recruitment',
        label: 'Annonce recrutement staff',
        content: `# 👥 Recrutement Ouvert\n\nNous cherchons des modérateurs et animatrices/animateurs pour renforcer l'équipe.\n\n**Profil recherché**\n- Disponible au minimum 4h/semaine\n- À l'aise avec les outils Discord et Markify\n- Bon relationnel\n\n**Comment postuler ?**\nRemplissez ce formulaire : <https://forms.gle/example>\n\nNous reviendrons vers vous rapidement !`
    }
];

// Translation helper with fallback to English then key
function t(key) {
    const langPack = translations[state.currentLang] || {};
    const enPack = translations['en'] || {};
    return (langPack[key] ?? enPack[key] ?? key);
}

document.addEventListener('DOMContentLoaded', () => {
    const emojiSearch = document.getElementById('emojiSearch');
    if (emojiSearch) {
        emojiSearch.addEventListener('input', searchEmojis);
    }

    const editor = document.getElementById('messageEditor');
    if (editor) {
        editor.addEventListener('input', handleEditorInput);
        editor.addEventListener('keydown', handleEditorKeydown);
        state.lastEditorValue = editor.value;
    }

    const preview = document.getElementById('messagePreview');
    if (preview) {
        preview.addEventListener('click', handlePreviewClick);
    }
    const discordPreview = document.getElementById('discordPreviewContent');
    if (discordPreview) {
        discordPreview.addEventListener('click', handlePreviewClick);
    }

    const applyTemplateBtn = document.getElementById('applyTemplateBtn');
    if (applyTemplateBtn) {
        applyTemplateBtn.addEventListener('click', applySelectedTemplate);
    }
    const clearTemplateBtn = document.getElementById('clearTemplateBtn');
    if (clearTemplateBtn) {
        clearTemplateBtn.addEventListener('click', clearTemplateSelection);
    }
    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) {
        templateSelect.addEventListener('change', () => {
            const status = document.getElementById('embedStatus');
            if (status && status.dataset.locked !== 'true') {
                status.textContent = '';
                status.classList.remove('success', 'error');
            }
        });
    }

    initEmojis();
    updateTranslations();
    updatePreview();
    populateTemplates();
    initializeEmbedBuilder();
    updateMessageStats();

    document.addEventListener('markify:emoji-inserted', handleEmojiInserted);
});

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light');
    state.currentTheme = body.classList.contains('light') ? 'light' : 'dark';
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.textContent = state.currentTheme === 'light' ? '☀️' : '🌙';
    }
}

async function copyMessage() {
    const editor = document.getElementById('messageEditor');
    const text = editor.value;
    if (!text.trim()) {
        showNotification(t('no-message'), 'warning');
        return;
    }
    const success = await copyToClipboard(text);
    showNotification(success ? t('copied') : t('copy-error'), success ? 'success' : 'error');
}

function resetEditor() {
    const editor = document.getElementById('messageEditor');
    editor.value = '';
    state.lastEditorValue = '';
    activeMarkdownStyles.clear();
    state.activeUnicodeStyle = null;
    state.isApplyingUnicodeInput = false;
    updateMarkdownActiveStates();
    updateUnicodeActiveStates();
    updatePreview();
    showNotification(t('reset-done'), 'success');
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

function generateMarkdownButtons() {
    const containers = {
        basic: document.getElementById('basicMarkdown'),
        headings: document.getElementById('headingMarkdown'),
        special: document.getElementById('specialMarkdown')
    };
    markdownButtons.clear();
    Object.values(containers).forEach(container => {
        if (container) {
            container.innerHTML = '';
        }
    });
    const sample = t('style-sample') || 'Aa';
    Object.entries(markdownStyles).forEach(([group, styles]) => {
        const container = containers[group];
        if (!container) {
            return;
        }
        styles.forEach(style => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'style-btn';
            const previewContent = typeof style.preview === 'function' ? style.preview(sample) : sample;
            btn.dataset.style = style.id;
            const labels = style.labels || {};
            const label = labels[state.currentLang] ?? labels.en ?? style.id;
            btn.innerHTML = `<span class="style-preview">${previewContent}</span><span class="style-caption">${label}</span>`;
            btn.setAttribute('aria-label', label);
            btn.addEventListener('click', () => applyMarkdownStyle(style.id));
            container.appendChild(btn);
            markdownButtons.set(style.id, btn);
        });
    });
    updateMarkdownActiveStates();
}

function applyMarkdownStyle(styleId) {
    const style = getMarkdownStyleById(styleId);
    if (!style) {
        return;
    }
    let result = { applied: false, active: null };
    if (style.type === 'structure') {
        result = applyStructureStyle(style);
    } else if (style.type === 'block') {
        result = applyBlockStyle(style);
    } else {
        result = applyInlineStyle(style);
    }
    if (result.applied && typeof result.active === 'boolean') {
        if (result.active) {
            if (headingStyleIds.has(style.id)) {
                headingStyleIds.forEach(id => {
                    if (id !== style.id) {
                        activeMarkdownStyles.delete(id);
                    }
                });
            }
            activeMarkdownStyles.add(style.id);
        } else {
            activeMarkdownStyles.delete(style.id);
        }
        updateMarkdownActiveStates();
    }
}

function getMarkdownStyleById(styleId) {
    for (const styles of Object.values(markdownStyles)) {
        const match = styles.find(style => style.id === styleId);
        if (match) {
            return match;
        }
    }
    return null;
}

function updateMarkdownActiveStates() {
    markdownButtons.forEach((btn, id) => {
        btn.classList.toggle('active', activeMarkdownStyles.has(id));
    });
}

function updateUnicodeActiveStates() {
    unicodeButtons.forEach((btn, name) => {
    btn.classList.toggle('active', state.activeUnicodeStyle === name);
    });
}

function handleEditorInput(event) {
    const editor = event.target;
    if (state.isApplyingUnicodeInput) {
        state.lastEditorValue = editor.value;
        updatePreview();
        return;
    }
    if (state.activeUnicodeStyle) {
        const data = unicodeFonts[state.activeUnicodeStyle];
        if (data) {
            const diff = editor.value.length - state.lastEditorValue.length;
            let insertLength = event.data ? event.data.length : 0;
            if (!insertLength && diff > 0) {
                insertLength = diff;
            }
            if (insertLength > 0) {
                const end = editor.selectionEnd;
                const start = end - insertLength;
                if (start >= 0 && !isIndexInProtectedRange(editor.value, start) && !isIndexInProtectedRange(editor.value, end - 1)) {
                    const inserted = editor.value.slice(start, end);
                    if (inserted) {
                        const transformed = transformWithFont(inserted, data);
                        if (transformed !== inserted) {
                            state.isApplyingUnicodeInput = true;
                            editor.value = editor.value.slice(0, start) + transformed + editor.value.slice(end);
                            const caret = start + transformed.length;
                            editor.setSelectionRange(caret, caret);
                            state.isApplyingUnicodeInput = false;
                        }
                    }
                }
            }
        }
    }
    state.lastEditorValue = editor.value;
    updatePreview();
}

function handleEditorKeydown(event) {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }
    const editor = event.target;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start !== end) {
        return;
    }
    const value = editor.value;
    const bounds = getLineBounds(value, start);
    const lineText = value.slice(bounds.start, bounds.end);
    const cursorInLine = start - bounds.start;
    const leadingMatch = lineText.match(/^\s*/);
    const leading = leadingMatch ? leadingMatch[0] : '';
    const afterLeading = lineText.slice(leading.length);
    if (!afterLeading) {
        return;
    }
    for (const id of autoContinueStyleIds) {
        const style = getMarkdownStyleById(id);
        if (!style || !style.prefix) {
            continue;
        }
        const prefix = style.prefix;
        if (!afterLeading.startsWith(prefix)) {
            continue;
        }
        const prefixStart = leading.length;
        const prefixEnd = prefixStart + prefix.length;
        if (cursorInLine < prefixEnd) {
            continue;
        }
        const contentAfterPrefix = lineText.slice(prefixEnd).trim();
        const restAfterCursor = lineText.slice(cursorInLine).trim();
        event.preventDefault();
        if (autoContinueExitOnEmpty.has(id) && !contentAfterPrefix && !restAfterCursor) {
            const beforeLine = value.slice(0, bounds.start);
            const afterLine = value.slice(bounds.end);
            const newLineText = leading;
            let updatedValue = beforeLine + newLineText + afterLine;
            let caretPosition = bounds.start + newLineText.length;
            if (updatedValue.charAt(caretPosition) !== '\n') {
                updatedValue = `${updatedValue.slice(0, caretPosition)}\n${updatedValue.slice(caretPosition)}`;
            }
            const newCaret = caretPosition + 1;
            editor.value = updatedValue;
            editor.setSelectionRange(newCaret, newCaret);
            activeMarkdownStyles.delete(id);
            if (headingStyleIds.has(id)) {
                headingStyleIds.forEach(other => {
                    if (other !== id) {
                        activeMarkdownStyles.delete(other);
                    }
                });
            }
            updateMarkdownActiveStates();
            state.lastEditorValue = editor.value;
            updatePreview();
            return;
        }
        const insertion = `\n${leading}${prefix}`;
        editor.value = value.slice(0, start) + insertion + value.slice(end);
        const newCaret = start + insertion.length;
        editor.setSelectionRange(newCaret, newCaret);
        state.lastEditorValue = editor.value;
        updatePreview();
        return;
    }

    const inlineActiveStyles = [...activeMarkdownStyles]
        .map(id => getMarkdownStyleById(id))
        .filter(style => style && style.type === 'style' && (style.prefix || style.suffix));
    if (inlineActiveStyles.length === 0) {
        return;
    }
    event.preventDefault();
    let beforeInsertion = '';
    let afterInsertion = '\n';
    [...inlineActiveStyles].reverse().forEach(style => {
        beforeInsertion += style.suffix || '';
    });
    inlineActiveStyles.forEach(style => {
        afterInsertion += style.prefix || '';
    });
    const updatedValue = value.slice(0, start) + beforeInsertion + afterInsertion + value.slice(end);
    editor.value = updatedValue;
    const caretOffset = beforeInsertion.length + 1 + inlineActiveStyles.reduce((sum, style) => sum + (style.prefix ? style.prefix.length : 0), 0);
    const newCaret = start + caretOffset;
    editor.setSelectionRange(newCaret, newCaret);
    state.lastEditorValue = editor.value;
    updatePreview();
}


function updateMessageStats() {
    const editor = document.getElementById('messageEditor');
    const charCountEl = document.getElementById('charCount');
    const charCountNitroEl = document.getElementById('charCountNitro');
    const lineCountEl = document.getElementById('lineCount');
    if (!editor || !charCountEl || !charCountNitroEl || !lineCountEl) {
        return;
    }
    const value = editor.value;
    const charLength = value.length;
    const lineCount = value ? value.split(/\r?\n/).length : 0;
    charCountEl.textContent = charLength;
    charCountNitroEl.textContent = charLength;
    lineCountEl.textContent = lineCount;
    applyLimitClass(charCountEl, charLength, DISCORD_LIMIT);
    applyLimitClass(charCountNitroEl, charLength, DISCORD_LIMIT_NITRO);
}

function applyLimitClass(element, length, limit) {
    element.classList.remove('limit-warning', 'limit-danger');
    const warningThreshold = Math.floor(limit * 0.9);
    if (length > limit) {
        element.classList.add('limit-danger');
    } else if (length >= warningThreshold) {
        element.classList.add('limit-warning');
    }
}

function populateTemplates() {
    const select = document.getElementById('templateSelect');
    if (!select) {
        return;
    }
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.label;
        select.appendChild(option);
    });
}

function applySelectedTemplate() {
    const select = document.getElementById('templateSelect');
    if (!select || !select.value) {
        showNotification(t('select-text'), 'warning');
        return;
    }
    const template = templates.find(item => item.id === select.value);
    if (!template) {
        return;
    }
    insertTemplateContent(template.content);
}

function clearTemplateSelection() {
    const select = document.getElementById('templateSelect');
    if (select) {
        select.value = '';
    }
}

function insertTemplateContent(content) {
    const editor = document.getElementById('messageEditor');
    if (!editor) {
        return;
    }
    const start = editor.selectionStart || 0;
    const end = editor.selectionEnd || 0;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    const insertion = content.trimStart();
    const needsBreak = before && !before.endsWith('\n\n') ? '\n\n' : '';
    const newValue = `${before}${needsBreak}${insertion}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
    editor.value = newValue;
    const newCaret = before.length + needsBreak.length + insertion.length + 2;
    editor.setSelectionRange(newCaret, newCaret);
    state.lastEditorValue = editor.value;
    updatePreview();
    showNotification(t('style-applied'), 'success');
}

function initializeEmbedBuilder() {
    const title = document.getElementById('embedTitle');
    const description = document.getElementById('embedDescription');
    const colorPicker = document.getElementById('embedColor');
    const colorHex = document.getElementById('embedColorHex');
    const copyBtn = document.getElementById('copyEmbedBtn');
    if (!title || !description || !colorPicker || !colorHex) {
        return;
    }
    const handler = () => refreshEmbedOutput();
    title.addEventListener('input', handler);
    description.addEventListener('input', handler);
    colorPicker.addEventListener('input', () => {
        colorHex.value = colorPicker.value.toUpperCase();
        refreshEmbedOutput();
    });
    colorHex.addEventListener('input', () => {
        const sanitized = sanitizeHexColor(colorHex.value);
        if (sanitized) {
            colorHex.value = sanitized;
            colorPicker.value = sanitized;
        }
        refreshEmbedOutput();
    });
    if (copyBtn) {
        copyBtn.addEventListener('click', copyEmbedJson);
    }
    refreshEmbedOutput();
}

function refreshEmbedOutput() {
    const titleEl = document.getElementById('embedTitle');
    const descriptionEl = document.getElementById('embedDescription');
    const colorHexEl = document.getElementById('embedColorHex');
    const outputEl = document.getElementById('embedOutput');
    const statusEl = document.getElementById('embedStatus');
    if (!titleEl || !descriptionEl || !colorHexEl || !outputEl || !statusEl) {
        return;
    }
    const title = titleEl.value.trim();
    const description = descriptionEl.value.trim();
    const hexColor = sanitizeHexColor(colorHexEl.value) || '#FF3030';
    colorHexEl.value = hexColor;
    const colorPicker = document.getElementById('embedColor');
    if (colorPicker && colorPicker.value.toUpperCase() !== hexColor) {
        colorPicker.value = hexColor.toLowerCase();
    }
    const color = parseInt(hexColor.replace('#', ''), 16);
    const embed = {
        content: '',
        embeds: [
            {
                title: title || undefined,
                description: description || undefined,
                color
            }
        ]
    };
    outputEl.textContent = JSON.stringify(embed, null, 2);
    statusEl.textContent = `Titre ${title.length}/256 • Description ${description.length}/4096`;
    const withinLimits = title.length <= 256 && description.length <= 4096;
    statusEl.classList.toggle('success', withinLimits);
    statusEl.classList.toggle('error', !withinLimits);
}

async function copyEmbedJson() {
    const outputEl = document.getElementById('embedOutput');
    const statusEl = document.getElementById('embedStatus');
    if (!outputEl || !statusEl) {
        return;
    }
    try {
        await navigator.clipboard.writeText(outputEl.textContent);
        statusEl.textContent = 'JSON copié dans le presse-papiers.';
        statusEl.classList.add('success');
        statusEl.classList.remove('error');
    } catch (error) {
        statusEl.textContent = 'Impossible de copier le JSON.';
        statusEl.classList.add('error');
        statusEl.classList.remove('success');
    }
}

function sanitizeHexColor(value) {
    if (!value) {
        return null;
    }
    let hex = value.trim().toUpperCase();
    if (!hex.startsWith('#')) {
        hex = `#${hex}`;
    }
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        return hex;
    }
    return null;
}

function generateUnicodeButtons() {
    const grid = document.getElementById('fontGrid');
    if (!grid) {
        return;
    }
    grid.innerHTML = '';
    unicodeButtons.clear();
    const sample = t('style-sample') || 'Aa';
    Object.entries(unicodeFonts).forEach(([name, data]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'style-btn';
        const previewText = escapeHTML(transformFontSample(sample, data));
        btn.dataset.style = name;
        btn.innerHTML = `<span class="style-preview">${previewText}</span><span class="style-caption">${name}</span>`;
        btn.setAttribute('aria-label', name);
        btn.addEventListener('click', () => applyUnicodeStyle(name));
        grid.appendChild(btn);
        unicodeButtons.set(name, btn);
    });
    updateUnicodeActiveStates();
}

function applyInlineStyle(style) {
    const editor = document.getElementById('messageEditor');
    const prefix = style.prefix || '';
    const suffix = style.suffix || '';
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const requiresExclusive = prefix === '**' || prefix === '__';
    if (start === end) {
        const before = value.slice(0, start);
        const after = value.slice(end);
        if (before.endsWith(prefix) && after.startsWith(suffix)) {
            editor.value = before.slice(0, -prefix.length) + after.slice(suffix.length);
            const caret = start - prefix.length;
            editor.focus();
            editor.setSelectionRange(caret, caret);
            state.lastEditorValue = editor.value;
            updatePreview();
            showNotification(t('style-applied'), 'success');
            return { applied: true, active: false };
        }
        editor.value = before + prefix + suffix + after;
        const caret = start + prefix.length;
        editor.focus();
        editor.setSelectionRange(caret, caret);
    state.lastEditorValue = editor.value;
        updatePreview();
    showNotification(t('style-applied'), 'success');
        return { applied: true, active: true };
    }
    const selection = value.slice(start, end);
    const lines = selection.split('\n');
    if (lines.some(hasInvalidMarkdownOrder)) {
        showNotification(t('markdown-order-warning'), 'warning');
        return { applied: false, active: false };
    }
    const allWrapped = lines.every(line => isLineWrappedWith(line, prefix, suffix));
    const transformed = lines.map(line => transformLineWithStyle(line, prefix, suffix, allWrapped, requiresExclusive)).join('\n');
    const before = value.slice(0, start);
    const after = value.slice(end);
    if (!allWrapped && transformed === selection) {
        showNotification(t('protected-warning'), 'warning');
        return { applied: false, active: false };
    }
    editor.value = before + transformed + after;
    const newEnd = start + transformed.length;
    editor.focus();
    editor.setSelectionRange(start, newEnd);
    state.lastEditorValue = editor.value;
    updatePreview();
    showNotification(t('style-applied'), 'success');
    return { applied: true, active: false };
}

function applyStructureStyle(style) {
    const editor = document.getElementById('messageEditor');
    const prefix = style.prefix || '';
    const value = editor.value;
    const originalStart = editor.selectionStart;
    const originalEnd = editor.selectionEnd;
    if (originalStart === originalEnd) {
        const bounds = getLineBounds(value, originalStart);
        const line = value.slice(bounds.start, bounds.end);
        const leading = line.match(/^\s*/)?.[0] || '';
        let content = line.slice(leading.length);
        const hasPrefix = content.startsWith(prefix);
        if (hasPrefix) {
            content = content.slice(prefix.length);
        } else {
            content = `${prefix}${content}`;
        }
        const newLine = leading + content;
        const before = value.slice(0, bounds.start);
        const after = value.slice(bounds.end);
        editor.value = before + newLine + after;
        const caretBase = bounds.start + leading.length;
        const caret = hasPrefix ? caretBase : caretBase + prefix.length;
        editor.focus();
        editor.setSelectionRange(caret, caret);
        state.lastEditorValue = editor.value;
        updatePreview();
        showNotification(t('style-applied'), 'success');
        return { applied: true, active: !hasPrefix };
    }
    let start = originalStart;
    let end = originalEnd;
    const selection = value.slice(start, end);
    const lines = selection.split('\n');
    const trimmedLines = lines.map(line => line.trimStart());
    const allHavePrefix = trimmedLines.every(line => !line || line.startsWith(prefix));
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
    const newContent = transformedLines.join('\n');
    if (newContent === selection) {
        showNotification(t('protected-warning'), 'warning');
        return { applied: false, active: null };
    }
    const before = value.slice(0, start);
    const after = value.slice(end);
    editor.value = before + newContent + after;
    editor.focus();
    editor.setSelectionRange(start, start + newContent.length);
    state.lastEditorValue = editor.value;
    updatePreview();
    showNotification(t('style-applied'), 'success');
    return { applied: true, active: null };
}

function applyBlockStyle(style) {
    const editor = document.getElementById('messageEditor');
    const prefix = style.prefix || '';
    const suffix = style.suffix || '';
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) {
        const before = editor.value.slice(0, start);
        const after = editor.value.slice(end);
        if (before.endsWith(prefix) && after.startsWith(suffix)) {
            editor.value = before.slice(0, -prefix.length) + after.slice(suffix.length);
            const caret = start - prefix.length;
            editor.focus();
            editor.setSelectionRange(caret, caret);
        } else {
            const insertion = `${prefix}${suffix}`;
            editor.value = before + insertion + after;
            const caret = before.length + prefix.length;
            editor.focus();
            editor.setSelectionRange(caret, caret);
        }
        state.lastEditorValue = editor.value;
        updatePreview();
        showNotification(t('style-applied'), 'success');
        return { applied: true, active: null };
    }
    const selection = editor.value.slice(start, end);
    const isWrapped = selection.startsWith(prefix) && selection.endsWith(suffix);
    const content = isWrapped ? selection.slice(prefix.length, selection.length - suffix.length) : `${prefix}${selection}${suffix}`;
    if (content === selection) {
        showNotification(t('protected-warning'), 'warning');
        return { applied: false, active: null };
    }
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    editor.value = before + content + after;
    const newEnd = start + content.length;
    editor.focus();
    editor.setSelectionRange(start, newEnd);
    state.lastEditorValue = editor.value;
    updatePreview();
    showNotification(t('style-applied'), 'success');
    return { applied: true, active: null };
}

function applyUnicodeStyle(name) {
    const data = unicodeFonts[name];
    if (!data) {
        return;
    }
    const editor = document.getElementById('messageEditor');
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start !== end) {
        const selection = editor.value.slice(start, end);
        const transformed = transformUnicodeSelection(selection, data);
        if (!transformed.changed) {
            if (transformed.reason === 'protected') {
                showNotification(t('protected-warning'), 'warning');
            } else {
                showNotification(t('style-applied'), 'success');
            }
            return;
        }
        const result = transformed.text;
        const before = editor.value.slice(0, start);
        const after = editor.value.slice(end);
        editor.value = before + result + after;
        const newEnd = start + result.length;
        editor.focus();
        editor.setSelectionRange(start, newEnd);
    state.lastEditorValue = editor.value;
        updatePreview();
    showNotification((translations[state.currentLang] || {})['style-applied'] || 'Style applied', 'success');
        return;
    }
    if (state.activeUnicodeStyle === name) {
        state.activeUnicodeStyle = null;
        updateUnicodeActiveStates();
    showNotification((translations[state.currentLang] || {})['style-applied'] || 'Style applied', 'success');
        return;
    }
    state.activeUnicodeStyle = name;
    updateUnicodeActiveStates();
    showNotification((translations[state.currentLang] || {})['style-applied'] || 'Style applied', 'success');
}

function containsProtectedSequence(text) {
    return protectedPattern.test(text);
}

function isIndexInProtectedRange(text, index) {
    if (index < 0 || index >= text.length) {
        return false;
    }
    const regex = new RegExp(protectedPattern.source, 'g');
    let match = regex.exec(text);
    while (match) {
        const start = match.index;
        const stop = start + match[0].length;
        if (index >= start && index < stop) {
            return true;
        }
        if (regex.lastIndex === match.index) {
            regex.lastIndex += 1;
        }
        match = regex.exec(text);
    }
    return false;
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

function transformLineWithStyle(line, prefix, suffix, remove, requiresExclusive = false) {
    const segments = splitStructureSegments(line);
    const content = segments.content;
    if (!content) {
        return line;
    }
    if (remove && content.startsWith(prefix) && content.endsWith(suffix)) {
        const inner = content.slice(prefix.length, content.length - suffix.length);
        return segments.leading + segments.structure + inner;
    }
    if (remove) {
        return line;
    }
    if (content.startsWith(prefix) && content.endsWith(suffix)) {
        return line;
    }
    const styled = applyStyleExcludingProtected(content, prefix, suffix, requiresExclusive);
    return segments.leading + segments.structure + styled;
}

function applyStyleExcludingProtected(content, prefix, suffix, requiresExclusive = false) {
    const matches = [...content.matchAll(new RegExp(protectedPattern.source, 'g'))];
    if (!matches.length) {
        return wrapSegmentWithStyle(content, prefix, suffix, requiresExclusive);
    }
    const parts = [];
    let lastIndex = 0;
    let changed = false;
    matches.forEach(match => {
        if (match.index > lastIndex) {
            const segment = content.slice(lastIndex, match.index);
            const styled = wrapSegmentWithStyle(segment, prefix, suffix, requiresExclusive);
            if (styled !== segment) {
                changed = true;
            }
            parts.push(styled);
        }
        parts.push(match[0]);
        lastIndex = match.index + match[0].length;
    });
    if (lastIndex < content.length) {
        const segment = content.slice(lastIndex);
        const styled = wrapSegmentWithStyle(segment, prefix, suffix, requiresExclusive);
        if (styled !== segment) {
            changed = true;
        }
        parts.push(styled);
    }
    if (!changed) {
        return content;
    }
    return parts.join('');
}

function wrapSegmentWithStyle(segment, prefix, suffix, requiresExclusive = false) {
    if (!segment.trim()) {
        return segment;
    }
    const leading = segment.match(/^\s*/)?.[0] || '';
    const trailing = segment.match(/\s*$/)?.[0] || '';
    const core = segment.slice(leading.length, segment.length - trailing.length);
    if (!core) {
        return segment;
    }
    let cleanCore = core;
    if (requiresExclusive) {
        const trimmedPrefix = prefix.trim();
        const trimmedSuffix = suffix.trim();
        if (trimmedPrefix) {
            cleanCore = cleanCore.replace(new RegExp(`^${escapeRegex(trimmedPrefix)}`), '');
        }
        if (trimmedSuffix) {
            cleanCore = cleanCore.replace(new RegExp(`${escapeRegex(trimmedSuffix)}$`), '');
        }
    }
    if (!cleanCore.trim()) {
        return segment;
    }
    if (cleanCore.startsWith(prefix) && cleanCore.endsWith(suffix)) {
        return segment;
    }
    return `${leading}${prefix}${cleanCore}${suffix}${trailing}`;
}

function splitProtectedSegments(text) {
    const regex = new RegExp(protectedPattern.source, 'g');
    const segments = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ protected: false, value: text.slice(lastIndex, match.index) });
        }
        segments.push({ protected: true, value: match[0] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
        segments.push({ protected: false, value: text.slice(lastIndex) });
    }
    return segments;
}

function transformUnicodeSelection(text, data) {
    const segments = splitProtectedSegments(text);
    const editable = segments.filter(segment => !segment.protected && segment.value);
    if (!editable.length) {
        return { text, changed: false, reason: 'protected' };
    }
    let allApplied = true;
    editable.forEach(segment => {
        const { text: normalized, applied } = normalizeFontText(segment.value, data);
        const wasApplied = applied && normalized !== segment.value;
        segment.normalized = wasApplied ? normalized : segment.value;
        segment.wasApplied = wasApplied;
        if (!wasApplied) {
            allApplied = false;
        }
    });
    if (allApplied) {
        const reverted = segments.map(segment => (segment.protected ? segment.value : segment.normalized)).join('');
        if (reverted === text) {
            return { text, changed: false, reason: 'unchanged' };
        }
        return { text: reverted, changed: true, reason: null };
    }
    let changed = false;
    const appliedText = segments.map(segment => {
        if (segment.protected) {
            return segment.value;
        }
        const transformed = transformWithFont(segment.value, data);
        if (transformed !== segment.value) {
            changed = true;
        }
        return transformed;
    }).join('');
    if (!changed) {
        return { text, changed: false, reason: 'unchanged' };
    }
    return { text: appliedText, changed: true, reason: null };
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
    const discordPreview = document.getElementById('discordPreviewContent');
    if (!editor || !preview) {
        return;
    }
    const textValue = editor.value;
    updateMessageStats();
    if (!textValue.trim()) {
        preview.textContent = t('preview-placeholder') || '';
        if (discordPreview) {
            discordPreview.textContent = t('preview-placeholder') || '';
        }
        return;
    }
    const markup = renderPreviewMarkup(textValue);
    preview.innerHTML = markup;
    if (discordPreview) {
        discordPreview.innerHTML = markup;
    }
}

function escapeHTML(str) {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' };
    return str.replace(/[&<>"']/g, char => entities[char] || char);
}

function renderPreviewMarkup(text) {
    if (!text) {
        return '';
    }
    const blockPlaceholders = [];
    const inlinePlaceholders = [];

    let working = text.replace(/\r\n/g, '\n');

    working = working.replace(/```([\s\S]*?)```/g, (match, code) => {
        const placeholder = `__CODE_BLOCK_${blockPlaceholders.length}__`;
        const normalized = code.replace(/^\n|\n$/g, '');
        blockPlaceholders.push(`<pre><code>${escapeHTML(normalized)}</code></pre>`);
        return placeholder;
    });

    working = working.replace(/`([^`]+)`/g, (match, code) => {
        const placeholder = `__CODE_INLINE_${inlinePlaceholders.length}__`;
        inlinePlaceholders.push(`<code class="preview-code">${escapeHTML(code)}</code>`);
        return placeholder;
    });

    let escaped = escapeHTML(working);

    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/__(.+?)__/g, '<span class="preview-underline">$1</span>');
    escaped = escaped.replace(/~~(.+?)~~/g, '<s>$1</s>');
    escaped = escaped.replace(/\*(.+?)\*/g, (match, inner) => {
        if (inner.trim() !== inner) {
            return match;
        }
        return `<em>${inner}</em>`;
    });
    escaped = escaped.replace(/\|\|(.+?)\|\|/g, '<span class="preview-spoiler">$1</span>');

    escaped = escaped.replace(/\n/g, '<br>');

    blockPlaceholders.forEach((html, index) => {
        escaped = escaped.replace(`__CODE_BLOCK_${index}__`, html);
    });
    inlinePlaceholders.forEach((html, index) => {
        escaped = escaped.replace(`__CODE_INLINE_${index}__`, html);
    });

    return escaped;
}

function handlePreviewClick(event) {
    if (event.target.classList.contains('preview-spoiler')) {
        event.target.classList.toggle('revealed');
    }
}

function showNotification(message, type = 'success') {
    const notif = document.getElementById('notification');
    if (!notif) {
        return;
    }
    notif.classList.remove('success', 'warning', 'error');
    notif.textContent = message;
    notif.classList.add('show', type);
    clearTimeout(state.notificationTimeout);
    state.notificationTimeout = setTimeout(() => {
        notif.classList.remove('show');
    }, 2000);
}

function handleEmojiInserted(event) {
    const emojiChar = event?.detail?.emoji;
    const message = emojiChar ? `${t('emoji-copied')} ${emojiChar}` : t('emoji-copied');
    showNotification(message, 'success');
}

// Simple translation update + language toggle helpers (translations module now contains data only)
function updateTranslations() {
    // regenerate UI parts that depend on translations
    generateMarkdownButtons();
    generateUnicodeButtons();
    updatePreview();
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.textContent = state.currentLang === 'fr' ? 'FR' : 'EN';
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.textContent = state.currentTheme === 'light' ? '☀️' : '🌙';

    // Update static texts and placeholders across the page
    const subtitle = document.getElementById('subtitle');
    if (subtitle) subtitle.textContent = t('subtitle');

    const emojiTitle = document.getElementById('emojiTitle');
    if (emojiTitle) emojiTitle.textContent = t('emojis-title');

    const emojiSearch = document.getElementById('emojiSearch');
    if (emojiSearch) emojiSearch.placeholder = t('emoji-search');

    const flagInfo = document.getElementById('flagInfo');
    if (flagInfo) {
        flagInfo.innerHTML = t('flag-info');
        // show the element if the translation contains visible content
        flagInfo.style.display = t('flag-info') ? '' : 'none';
    }

    const editorTitle = document.getElementById('editorTitle');
    if (editorTitle) editorTitle.textContent = t('editor-title');

    const editorInfoTitle = document.getElementById('editorInfoTitle');
    if (editorInfoTitle) editorInfoTitle.textContent = t('how-to-use');

    const editorInfoText = document.getElementById('editorInfoText');
    if (editorInfoText) editorInfoText.innerHTML = t('how-to-content');

    const textEditorTitle = document.getElementById('textEditorTitle');
    if (textEditorTitle) textEditorTitle.textContent = t('your-message');

    const messageEditor = document.getElementById('messageEditor');
    if (messageEditor) messageEditor.placeholder = t('editor-placeholder');

    const copyBtnText = document.getElementById('copyBtnText');
    if (copyBtnText) copyBtnText.textContent = t('copy-btn');

    const resetBtnText = document.getElementById('resetBtnText');
    if (resetBtnText) resetBtnText.textContent = t('reset-btn');

    const previewTitle = document.getElementById('previewTitle');
    if (previewTitle) previewTitle.textContent = t('preview-title');

    const markdownTitle = document.getElementById('markdownTitle');
    if (markdownTitle) markdownTitle.textContent = t('markdown-title');

    const basicMarkdownTitle = document.getElementById('basicMarkdownTitle');
    if (basicMarkdownTitle) basicMarkdownTitle.textContent = t('basic-formatting');

    const headingMarkdownTitle = document.getElementById('headingMarkdownTitle');
    if (headingMarkdownTitle) headingMarkdownTitle.textContent = t('headings');

    const specialMarkdownTitle = document.getElementById('specialMarkdownTitle');
    if (specialMarkdownTitle) specialMarkdownTitle.textContent = t('special');

    const fontsTitle = document.getElementById('fontsTitle');
    if (fontsTitle) fontsTitle.textContent = t('unicode-fonts');

    const fontsInfo = document.getElementById('fontsInfo');
    if (fontsInfo) fontsInfo.textContent = t('unicode-warning');

    const footerText = document.getElementById('footerText');
    if (footerText) footerText.textContent = t('footer-text');

    const footerText2 = document.getElementById('footerText2');
    if (footerText2) footerText2.textContent = t('footer-text2');
}

function toggleLanguage() {
    state.currentLang = state.currentLang === 'fr' ? 'en' : 'fr';
    updateTranslations();
}

// Attach event listeners instead of relying on inline onclick attributes
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('langBtn');
    const themeBtn = document.getElementById('themeBtn');
    const copyBtn = document.querySelector('.copy-btn');
    const resetBtn = document.querySelector('.reset-btn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (copyBtn) copyBtn.addEventListener('click', copyMessage);
    if (resetBtn) resetBtn.addEventListener('click', resetEditor);
});

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

