// MARKIFY MAIN SCRIPT
import { translations } from './translations.js';
import { initEmojis, searchEmojis } from './emoji.js';
import { markdownStyles, unicodeFonts, protectedPattern, markdownButtons, unicodeButtons, activeMarkdownStyles, state } from './config.js';

const headingStyleIds = new Set(['heading1', 'heading2', 'heading3']);
const autoContinueStyleIds = ['list', 'quote', 'multiline-quote', ...headingStyleIds];
const autoContinueExitOnEmpty = new Set(['list', 'quote', 'multiline-quote']);
const DISCORD_LIMIT = 2000;
const DISCORD_LIMIT_NITRO = 4000;

const TS_STYLE_ORDER = ['R', 't', 'T', 'd', 'D', 'f', 'F'];
const TS_STYLE_LABEL_KEYS = {
    R: 'timestamp-style-R',
    t: 'timestamp-style-t',
    T: 'timestamp-style-T',
    d: 'timestamp-style-d',
    D: 'timestamp-style-D',
    f: 'timestamp-style-f',
    F: 'timestamp-style-F'
};

let timestampRelativeIntervalId = null;
let timestampUiFlushRaf = 0;
let timestampVisibilityListenerBound = false;

// Translation helper with fallback to English then key
function t(key) {
    const langPack = translations[state.currentLang] || {};
    const enPack = translations['en'] || {};
    return (langPack[key] ?? enPack[key] ?? key);
}

// Shared theme/language preferences (persisted across Markify pages)
const PREF_THEME = 'markify-theme';
const PREF_LANG = 'markify-lang';

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
    if (savedTheme === 'light' || savedTheme === 'dark') state.currentTheme = savedTheme;
    if (savedLang === 'fr' || savedLang === 'en') state.currentLang = savedLang;
    document.body.classList.toggle('light', state.currentTheme === 'light');
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

    const langBtn = document.getElementById('langBtn');
    const themeBtn = document.getElementById('themeBtn');
    const copyBtn = document.querySelector('.copy-btn');
    const resetBtn = document.querySelector('.reset-btn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (copyBtn) copyBtn.addEventListener('click', copyMessage);
    if (resetBtn) resetBtn.addEventListener('click', resetEditor);

    loadPreferences();
    initEmojis();
    initTimestampTool();
    updateTranslations();
    updatePreview();
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
    savePref(PREF_THEME, state.currentTheme);
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
    if (!editor || !preview) {
        return;
    }
    const textValue = editor.value;
    updateMessageStats();
    if (!textValue.trim()) {
        preview.textContent = t('preview-placeholder') || '';
        return;
    }
    const markup = renderPreviewMarkup(textValue);
    preview.innerHTML = markup;
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

    const timestampBlockTitle = document.getElementById('timestampBlockTitle');
    if (timestampBlockTitle) timestampBlockTitle.textContent = t('timestamp-block-title');
    const timestampIntro = document.getElementById('timestampIntro');
    if (timestampIntro) timestampIntro.textContent = t('timestamp-intro');
    const tsDateBtn = document.getElementById('tsDateBtn');
    if (tsDateBtn) {
        const cal = t('timestamp-aria-calendar');
        tsDateBtn.setAttribute('aria-label', cal);
        tsDateBtn.setAttribute('title', cal);
    }
    const tsTimeBtn = document.getElementById('tsTimeBtn');
    if (tsTimeBtn) {
        const clk = t('timestamp-aria-clock');
        tsTimeBtn.setAttribute('aria-label', clk);
        tsTimeBtn.setAttribute('title', clk);
    }
    const tsDateLabel = document.getElementById('tsDateLabel');
    if (tsDateLabel) tsDateLabel.textContent = t('timestamp-date');
    const tsTimeLabel = document.getElementById('tsTimeLabel');
    if (tsTimeLabel) tsTimeLabel.textContent = t('timestamp-time');
    const tsStyleLabel = document.getElementById('tsStyleLabel');
    if (tsStyleLabel) tsStyleLabel.textContent = t('timestamp-type');
    const tsPreviewLabel = document.getElementById('tsPreviewLabel');
    if (tsPreviewLabel) tsPreviewLabel.textContent = t('timestamp-preview-label');
    const tsCopyBtnEl = document.getElementById('tsCopyBtn');
    if (tsCopyBtnEl) tsCopyBtnEl.textContent = t('timestamp-copy');
    const tsResetBtn = document.getElementById('tsResetBtn');
    if (tsResetBtn) tsResetBtn.textContent = t('timestamp-reset');
    populateTimestampStyleOptions();
    refreshTimestampUI();
}

function toggleLanguage() {
    state.currentLang = state.currentLang === 'fr' ? 'en' : 'fr';
    savePref(PREF_LANG, state.currentLang);
    updateTranslations();
}

function getTimestampLocale() {
    return state.currentLang === 'fr' ? 'fr-FR' : 'en-US';
}

function padDateInput(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function padTimeInput(d) {
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
}

function setTimestampInputsFromDate(d) {
    const dateEl = document.getElementById('tsDate');
    const timeEl = document.getElementById('tsTime');
    if (dateEl) dateEl.value = padDateInput(d);
    if (timeEl) timeEl.value = padTimeInput(d);
}

function resetTimestampToNow() {
    setTimestampInputsFromDate(new Date());
    refreshTimestampUI();
}

function readTimestampUnixSeconds() {
    const dateEl = document.getElementById('tsDate');
    const timeEl = document.getElementById('tsTime');
    if (!dateEl || !timeEl || !dateEl.value || !timeEl.value) {
        return null;
    }
    const d = new Date(`${dateEl.value}T${timeEl.value}:00`);
    const sec = Math.floor(d.getTime() / 1000);
    return Number.isFinite(sec) ? sec : null;
}

function formatTimestampPreview(unixSec, style) {
    const loc = getTimestampLocale();
    const date = new Date(unixSec * 1000);
    if (style === 'R') {
        const now = Math.floor(Date.now() / 1000);
        let diff = unixSec - now;
        const rtf = new Intl.RelativeTimeFormat(state.currentLang === 'fr' ? 'fr' : 'en', { numeric: 'auto' });
        const ad = Math.abs(diff);
        if (ad < 60) return rtf.format(diff, 'second');
        const diffMin = Math.trunc(diff / 60);
        if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
        const diffHr = Math.trunc(diff / 3600);
        if (Math.abs(diffHr) < 48) return rtf.format(diffHr, 'hour');
        const diffDay = Math.trunc(diff / 86400);
        if (Math.abs(diffDay) < 14) return rtf.format(diffDay, 'day');
        const diffWeek = Math.trunc(diff / 604800);
        if (Math.abs(diffWeek) < 8) return rtf.format(diffWeek, 'week');
        const diffMonth = Math.trunc(diff / 2592000);
        if (Math.abs(diffMonth) < 24) return rtf.format(diffMonth, 'month');
        return rtf.format(Math.trunc(diff / 31536000), 'year');
    }
    if (style === 't') {
        return new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit' }).format(date);
    }
    if (style === 'T') {
        return new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
    }
    if (style === 'd') {
        return new Intl.DateTimeFormat(loc, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    }
    if (style === 'D') {
        return new Intl.DateTimeFormat(loc, { dateStyle: 'long' }).format(date);
    }
    if (style === 'f') {
        return new Intl.DateTimeFormat(loc, { dateStyle: 'long', timeStyle: 'short' }).format(date);
    }
    if (style === 'F') {
        return new Intl.DateTimeFormat(loc, { dateStyle: 'full', timeStyle: 'short' }).format(date);
    }
    return String(unixSec);
}

function buildTimestampCode(unixSec, style) {
    return `<t:${unixSec}:${style}>`;
}

function populateTimestampStyleOptions() {
    const sel = document.getElementById('tsStyle');
    if (!sel) {
        return;
    }
    const current = sel.value && TS_STYLE_ORDER.includes(sel.value) ? sel.value : 'R';
    sel.innerHTML = '';
    TS_STYLE_ORDER.forEach(style => {
        const opt = document.createElement('option');
        opt.value = style;
        opt.textContent = t(TS_STYLE_LABEL_KEYS[style]);
        sel.appendChild(opt);
    });
    sel.value = TS_STYLE_ORDER.includes(current) ? current : 'R';
}

function refreshTimestampUI() {
    const out = document.getElementById('tsOutput');
    const prev = document.getElementById('tsPreview');
    const styleEl = document.getElementById('tsStyle');
    const unix = readTimestampUnixSeconds();
    const style = styleEl && styleEl.value ? styleEl.value : 'R';
    if (unix == null) {
        if (out) out.value = '';
        if (prev) prev.textContent = '—';
        return;
    }
    if (out) out.value = buildTimestampCode(unix, style);
    if (prev) prev.textContent = formatTimestampPreview(unix, style);
}

async function copyTimestampCode() {
    const out = document.getElementById('tsOutput');
    const text = out && out.value ? out.value.trim() : '';
    if (!text) {
        showNotification(t('copy-error'), 'error');
        return;
    }
    const success = await copyToClipboard(text);
    showNotification(success ? t('copied') : t('copy-error'), success ? 'success' : 'error');
}

function openNativePicker(input) {
    if (!input || typeof input.showPicker !== 'function') {
        input?.focus();
        return;
    }
    input.showPicker().catch(() => input.focus());
}

function initTimestampTool() {
    const dateEl = document.getElementById('tsDate');
    const timeEl = document.getElementById('tsTime');
    const styleEl = document.getElementById('tsStyle');
    const copyEl = document.getElementById('tsCopyBtn');
    const resetEl = document.getElementById('tsResetBtn');
    if (!dateEl || !timeEl || !styleEl) {
        return;
    }
    populateTimestampStyleOptions();
    resetTimestampToNow();
    const scheduleTimestampUiRefresh = () => {
        if (timestampUiFlushRaf) {
            cancelAnimationFrame(timestampUiFlushRaf);
        }
        timestampUiFlushRaf = requestAnimationFrame(() => {
            timestampUiFlushRaf = 0;
            refreshTimestampUI();
        });
    };
    dateEl.addEventListener('change', scheduleTimestampUiRefresh);
    dateEl.addEventListener('input', scheduleTimestampUiRefresh);
    timeEl.addEventListener('change', scheduleTimestampUiRefresh);
    timeEl.addEventListener('input', scheduleTimestampUiRefresh);
    styleEl.addEventListener('change', scheduleTimestampUiRefresh);

    const bindPickerOpener = (input, labelId) => {
        const lbl = document.getElementById(labelId);
        if (lbl) {
            lbl.addEventListener('click', ev => {
                if (ev.target === input) return;
                ev.preventDefault();
                openNativePicker(input);
            });
        }
        const wrap = input.closest('.timestamp-tap');
        if (wrap) {
            wrap.addEventListener('click', ev => {
                if (ev.target === input || input.contains(ev.target)) return;
                if (ev.target.closest('label')) return;
                if (ev.target.closest('.timestamp-icon-btn')) return;
                openNativePicker(input);
            });
        }
    };
    bindPickerOpener(dateEl, 'tsDateLabel');
    bindPickerOpener(timeEl, 'tsTimeLabel');

    const dateIconBtn = document.getElementById('tsDateBtn');
    const timeIconBtn = document.getElementById('tsTimeBtn');
    if (dateIconBtn) {
        dateIconBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openNativePicker(dateEl);
        });
    }
    if (timeIconBtn) {
        timeIconBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openNativePicker(timeEl);
        });
    }

    if (copyEl) copyEl.addEventListener('click', copyTimestampCode);
    if (resetEl) resetEl.addEventListener('click', resetTimestampToNow);

    let relativeTickRaf = 0;
    const tickRelativePreview = () => {
        if (relativeTickRaf) cancelAnimationFrame(relativeTickRaf);
        relativeTickRaf = requestAnimationFrame(() => {
            relativeTickRaf = 0;
            const st = document.getElementById('tsStyle');
            if (st && st.value === 'R') {
                refreshTimestampUI();
            }
        });
    };
    const startRelativeTicker = () => {
        if (timestampRelativeIntervalId) {
            clearInterval(timestampRelativeIntervalId);
        }
        timestampRelativeIntervalId = setInterval(tickRelativePreview, 15000);
    };
    const stopRelativeTicker = () => {
        if (timestampRelativeIntervalId) {
            clearInterval(timestampRelativeIntervalId);
            timestampRelativeIntervalId = null;
        }
    };
    if (!timestampVisibilityListenerBound) {
        timestampVisibilityListenerBound = true;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopRelativeTicker();
            } else {
                tickRelativePreview();
                startRelativeTicker();
            }
        });
    }
    startRelativeTicker();
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

