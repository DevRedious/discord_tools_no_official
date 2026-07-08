// MARKIFY - Discord Components V2 builder
// Self-contained module. embed.js drives it through the returned API.
// Spec: message flag IS_COMPONENTS_V2 = 1 << 15 (32768). When set, content/embeds
// are disabled and everything lives in `components`.

export const IS_COMPONENTS_V2 = 32768;
const MAX_TOP_LEVEL = 40;

let blocks = [];
let hooks = { t: k => k, renderMarkdown: s => s, onChange: () => {} };
let toolbarEl = null;
let listEl = null;

/* ---------------- Public API ---------------- */
export function initComponentsV2(opts) {
    hooks = {
        t: opts.t || (k => k),
        renderMarkdown: opts.renderMarkdown || (s => s),
        onChange: opts.onChange || (() => {})
    };
    toolbarEl = opts.toolbar;
    listEl = opts.list;
    rerender();
}

export function retranslate(t) {
    if (t) hooks.t = t;
    rerender();
}

export function isEmpty() {
    return blocks.length === 0;
}

export function buildPayload() {
    return { flags: IS_COMPONENTS_V2, components: blocks.map(componentJson).filter(Boolean) };
}

export function reset() {
    blocks = [];
    rerender();
}

export function getDraft() {
    return JSON.parse(JSON.stringify(blocks));
}

export function setDraft(data) {
    blocks = Array.isArray(data) ? data.map(sanitizeBlock).filter(Boolean) : [];
    rerender();
}

export function renderPreview(target) {
    const t = hooks.t;
    target.innerHTML = '';
    const payload = buildPayload();
    if (!payload.components.length) {
        const empty = document.createElement('div');
        empty.className = 'discord-embed-empty';
        empty.textContent = t('v2-empty');
        target.appendChild(empty);
        return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'v2-preview';
    payload.components.forEach(c => wrap.appendChild(previewComponent(c)));
    target.appendChild(wrap);
}

/* ---------------- Model defaults ---------------- */
const TOP_TYPES = ['container', 'text', 'section', 'gallery', 'separator', 'file', 'actionrow'];
const CHILD_TYPES = ['text', 'section', 'gallery', 'separator', 'file', 'actionrow'];

function makeBlock(type) {
    switch (type) {
        case 'text': return { type: 'text', content: '' };
        case 'separator': return { type: 'separator', divider: true, spacing: 1 };
        case 'file': return { type: 'file', url: '', spoiler: false };
        case 'gallery': return { type: 'gallery', items: [{ url: '', description: '', spoiler: false }] };
        case 'section': return { type: 'section', texts: [''], accessory: { kind: 'button', style: 2, label: '', url: '', custom_id: '', emoji: '', disabled: false } };
        case 'actionrow': return { type: 'actionrow', kind: 'buttons', buttons: [makeButton()], select: makeSelect() };
        case 'container': return { type: 'container', accent: '', spoiler: false, children: [] };
        default: return null;
    }
}

function makeButton() {
    return { style: 5, label: '', url: '', custom_id: '', emoji: '', disabled: false };
}

function makeSelect() {
    return { selectType: 3, custom_id: '', placeholder: '', min: 1, max: 1, disabled: false, options: [{ label: '', value: '', description: '', emoji: '', default: false }] };
}

function sanitizeBlock(b) {
    if (!b || typeof b !== 'object' || !TOP_TYPES.includes(b.type)) return null;
    const fresh = makeBlock(b.type);
    if (b.type === 'container') {
        fresh.accent = str(b.accent);
        fresh.spoiler = !!b.spoiler;
        fresh.children = Array.isArray(b.children) ? b.children.map(sanitizeChild).filter(Boolean) : [];
    } else {
        Object.assign(fresh, sanitizeChild(b) || {});
    }
    return fresh;
}

function sanitizeChild(b) {
    if (!b || typeof b !== 'object' || !CHILD_TYPES.includes(b.type)) return null;
    const fresh = makeBlock(b.type);
    switch (b.type) {
        case 'text': fresh.content = str(b.content); break;
        case 'separator': fresh.divider = b.divider !== false; fresh.spacing = b.spacing === 2 ? 2 : 1; break;
        case 'file': fresh.url = str(b.url); fresh.spoiler = !!b.spoiler; break;
        case 'gallery':
            fresh.items = (Array.isArray(b.items) && b.items.length ? b.items : [{}]).map(i => ({
                url: str(i.url), description: str(i.description), spoiler: !!i.spoiler
            }));
            break;
        case 'section':
            fresh.texts = (Array.isArray(b.texts) && b.texts.length ? b.texts : ['']).map(str).slice(0, 3);
            fresh.accessory = sanitizeAccessory(b.accessory);
            break;
        case 'actionrow':
            fresh.kind = b.kind === 'select' ? 'select' : 'buttons';
            fresh.buttons = (Array.isArray(b.buttons) && b.buttons.length ? b.buttons : [makeButton()]).map(sanitizeButton);
            fresh.select = sanitizeSelect(b.select);
            break;
    }
    return fresh;
}

function sanitizeAccessory(a) {
    if (!a || typeof a !== 'object') return { kind: 'none' };
    if (a.kind === 'thumbnail') return { kind: 'thumbnail', url: str(a.url), description: str(a.description), spoiler: !!a.spoiler };
    if (a.kind === 'button') return Object.assign({ kind: 'button' }, sanitizeButton(a));
    return { kind: 'none' };
}

function sanitizeButton(b) {
    const f = makeButton();
    if (b && typeof b === 'object') {
        f.style = [1, 2, 3, 4, 5].includes(b.style) ? b.style : 5;
        f.label = str(b.label); f.url = str(b.url); f.custom_id = str(b.custom_id);
        f.emoji = str(b.emoji); f.disabled = !!b.disabled;
    }
    return f;
}

function sanitizeSelect(s) {
    const f = makeSelect();
    if (s && typeof s === 'object') {
        f.selectType = [3, 5, 6, 7, 8].includes(s.selectType) ? s.selectType : 3;
        f.custom_id = str(s.custom_id); f.placeholder = str(s.placeholder);
        f.min = numOr(s.min, 1); f.max = numOr(s.max, 1); f.disabled = !!s.disabled;
        f.options = (Array.isArray(s.options) && s.options.length ? s.options : [{}]).map(o => ({
            label: str(o.label), value: str(o.value), description: str(o.description),
            emoji: str(o.emoji), default: !!o.default
        }));
    }
    return f;
}

/* ---------------- Model -> Discord JSON ---------------- */
function componentJson(b) {
    switch (b.type) {
        case 'text': return b.content.trim() ? { type: 10, content: b.content } : null;
        case 'separator': return { type: 14, divider: b.divider, spacing: b.spacing };
        case 'file': return b.url.trim() ? clean({ type: 13, file: { url: b.url.trim() }, spoiler: b.spoiler || undefined }) : null;
        case 'gallery': {
            const items = b.items.filter(i => i.url.trim()).map(i => clean({
                media: { url: i.url.trim() },
                description: i.description.trim() || undefined,
                spoiler: i.spoiler || undefined
            }));
            return items.length ? { type: 12, items } : null;
        }
        case 'section': {
            const comps = b.texts.filter(x => x.trim()).slice(0, 3).map(x => ({ type: 10, content: x }));
            if (!comps.length) return null;
            const o = { type: 9, components: comps };
            const acc = accessoryJson(b.accessory);
            if (acc) o.accessory = acc;
            return o;
        }
        case 'actionrow': {
            if (b.kind === 'select') {
                const s = selectJson(b.select);
                return s ? { type: 1, components: [s] } : null;
            }
            const btns = b.buttons.map(buttonJson).filter(Boolean).slice(0, 5);
            return btns.length ? { type: 1, components: btns } : null;
        }
        case 'container': {
            const comps = b.children.map(componentJson).filter(Boolean);
            if (!comps.length) return null;
            const o = { type: 17 };
            const ai = hexToInt(b.accent);
            if (ai !== null) o.accent_color = ai;
            if (b.spoiler) o.spoiler = true;
            o.components = comps;
            return o;
        }
        default: return null;
    }
}

function accessoryJson(acc) {
    if (!acc || acc.kind === 'none') return null;
    if (acc.kind === 'thumbnail') {
        if (!acc.url.trim()) return null;
        return clean({ type: 11, media: { url: acc.url.trim() }, description: acc.description.trim() || undefined, spoiler: acc.spoiler || undefined });
    }
    if (acc.kind === 'button') return buttonJson(acc);
    return null;
}

function buttonJson(b) {
    const o = { type: 2, style: b.style };
    if (b.style === 5) {
        if (!b.url.trim()) return null;
        o.url = b.url.trim();
    } else {
        if (!b.custom_id.trim()) return null;
        o.custom_id = b.custom_id.trim();
    }
    if (b.label.trim()) o.label = b.label.trim();
    const e = parseEmoji(b.emoji);
    if (e) o.emoji = e;
    if (b.disabled) o.disabled = true;
    if (!o.label && !o.emoji) return null; // a button needs a label or an emoji
    return o;
}

function selectJson(s) {
    if (!s.custom_id.trim()) return null;
    const o = { type: s.selectType, custom_id: s.custom_id.trim() };
    if (s.placeholder.trim()) o.placeholder = s.placeholder.trim();
    o.min_values = clampInt(s.min, 0, 25);
    o.max_values = clampInt(s.max, 1, 25);
    if (s.selectType === 3) {
        const opts = s.options.filter(op => op.label.trim()).map(op => clean({
            label: op.label.trim(),
            value: op.value.trim() || op.label.trim(),
            description: op.description.trim() || undefined,
            emoji: parseEmoji(op.emoji) || undefined,
            default: op.default || undefined
        }));
        if (!opts.length) return null;
        o.options = opts;
    }
    if (s.disabled) o.disabled = true;
    return o;
}

/* ---------------- Builder UI ---------------- */
function rerender() {
    if (!toolbarEl || !listEl) return;
    buildToolbar();
    listEl.innerHTML = '';
    blocks.forEach((b, i) => listEl.appendChild(blockCard(b, blocks, i, false)));
    hooks.onChange();
}

function buildToolbar() {
    const t = hooks.t;
    toolbarEl.innerHTML = '';
    TOP_TYPES.forEach(type => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'v2-add-btn';
        btn.textContent = '+ ' + t('v2-block-' + type);
        btn.addEventListener('click', () => {
            if (blocks.length >= MAX_TOP_LEVEL) return;
            blocks.push(makeBlock(type));
            rerender();
        });
        toolbarEl.appendChild(btn);
    });
}

function blockCard(block, list, index, isChild) {
    const t = hooks.t;
    const card = document.createElement('div');
    card.className = 'v2-card v2-card-' + block.type;

    const header = document.createElement('div');
    header.className = 'v2-card-header';
    const title = document.createElement('span');
    title.className = 'v2-card-title';
    title.textContent = t('v2-block-' + block.type);
    header.appendChild(title);

    const controls = document.createElement('div');
    controls.className = 'v2-card-controls';
    controls.appendChild(iconBtn('▲', t('v2-move-up'), () => { move(list, index, -1); rerender(); }));
    controls.appendChild(iconBtn('▼', t('v2-move-down'), () => { move(list, index, 1); rerender(); }));
    controls.appendChild(iconBtn('✕', t('v2-remove'), () => { list.splice(index, 1); rerender(); }));
    header.appendChild(controls);
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'v2-card-body';
    buildBlockBody(block, body);
    card.appendChild(body);
    return card;
}

function buildBlockBody(block, body) {
    const t = hooks.t;
    switch (block.type) {
        case 'text':
            body.appendChild(field(t('v2-text-content'), textarea(block.content, v => block.content = v)));
            break;
        case 'separator':
            body.appendChild(checkbox(t('v2-divider'), block.divider, v => block.divider = v));
            body.appendChild(field(t('v2-spacing'), selectEl([
                { value: '1', label: t('v2-spacing-small') },
                { value: '2', label: t('v2-spacing-large') }
            ], String(block.spacing), v => block.spacing = Number(v))));
            break;
        case 'file':
            body.appendChild(field(t('v2-file-url'), textInput(block.url, v => block.url = v, 'attachment://fichier.png')));
            body.appendChild(checkbox(t('v2-spoiler'), block.spoiler, v => block.spoiler = v));
            break;
        case 'gallery':
            buildGallery(block, body);
            break;
        case 'section':
            buildSection(block, body);
            break;
        case 'actionrow':
            buildActionRow(block, body);
            break;
        case 'container':
            buildContainer(block, body);
            break;
    }
}

function buildGallery(block, body) {
    const t = hooks.t;
    block.items.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'v2-subrow';
        row.appendChild(field(t('v2-url'), textInput(item.url, v => item.url = v, 'https://...')));
        row.appendChild(field(t('v2-description'), textInput(item.description, v => item.description = v)));
        row.appendChild(checkbox(t('v2-spoiler'), item.spoiler, v => item.spoiler = v));
        if (block.items.length > 1) {
            row.appendChild(iconBtn('✕', t('v2-remove'), () => { block.items.splice(i, 1); rerender(); }));
        }
        body.appendChild(row);
    });
    if (block.items.length < 10) {
        body.appendChild(addBtn(t('v2-add-gallery-item'), () => { block.items.push({ url: '', description: '', spoiler: false }); rerender(); }));
    }
}

function buildSection(block, body) {
    const t = hooks.t;
    block.texts.forEach((txt, i) => {
        const row = document.createElement('div');
        row.className = 'v2-subrow';
        row.appendChild(field(t('v2-section-text'), textInput(txt, v => block.texts[i] = v)));
        if (block.texts.length > 1) {
            row.appendChild(iconBtn('✕', t('v2-remove'), () => { block.texts.splice(i, 1); rerender(); }));
        }
        body.appendChild(row);
    });
    if (block.texts.length < 3) {
        body.appendChild(addBtn(t('v2-add-section-text'), () => { block.texts.push(''); rerender(); }));
    }

    const acc = block.accessory;
    body.appendChild(field(t('v2-accessory'), selectEl([
        { value: 'none', label: t('v2-accessory-none') },
        { value: 'button', label: t('v2-accessory-button') },
        { value: 'thumbnail', label: t('v2-accessory-thumbnail') }
    ], acc.kind, v => {
        if (v === 'button') block.accessory = { kind: 'button', style: 2, label: '', url: '', custom_id: '', emoji: '', disabled: false };
        else if (v === 'thumbnail') block.accessory = { kind: 'thumbnail', url: '', description: '', spoiler: false };
        else block.accessory = { kind: 'none' };
        rerender();
    })));

    if (acc.kind === 'button') buildButtonFields(acc, body);
    else if (acc.kind === 'thumbnail') {
        body.appendChild(field(t('v2-url'), textInput(acc.url, v => acc.url = v, 'https://...')));
        body.appendChild(field(t('v2-description'), textInput(acc.description, v => acc.description = v)));
        body.appendChild(checkbox(t('v2-spoiler'), acc.spoiler, v => acc.spoiler = v));
    }
}

function buildActionRow(block, body) {
    const t = hooks.t;
    body.appendChild(field(t('v2-actionrow-kind'), selectEl([
        { value: 'buttons', label: t('v2-kind-buttons') },
        { value: 'select', label: t('v2-kind-select') }
    ], block.kind, v => { block.kind = v; rerender(); })));

    if (block.kind === 'buttons') {
        block.buttons.forEach((btn, i) => {
            const sub = document.createElement('div');
            sub.className = 'v2-subcard';
            const h = document.createElement('div');
            h.className = 'v2-subcard-header';
            const label = document.createElement('span');
            label.textContent = t('v2-button') + ' ' + (i + 1);
            h.appendChild(label);
            if (block.buttons.length > 1) {
                h.appendChild(iconBtn('✕', t('v2-remove'), () => { block.buttons.splice(i, 1); rerender(); }));
            }
            sub.appendChild(h);
            buildButtonFields(btn, sub);
            body.appendChild(sub);
        });
        if (block.buttons.length < 5) {
            body.appendChild(addBtn(t('v2-add-button'), () => { block.buttons.push(makeButton()); rerender(); }));
        }
    } else {
        buildSelect(block.select, body);
    }
}

function buildButtonFields(btn, body) {
    const t = hooks.t;
    body.appendChild(field(t('v2-button-style'), selectEl([
        { value: '1', label: t('v2-style-primary') },
        { value: '2', label: t('v2-style-secondary') },
        { value: '3', label: t('v2-style-success') },
        { value: '4', label: t('v2-style-danger') },
        { value: '5', label: t('v2-style-link') }
    ], String(btn.style), v => { btn.style = Number(v); rerender(); })));
    body.appendChild(field(t('v2-label'), textInput(btn.label, v => btn.label = v)));
    if (btn.style === 5) {
        body.appendChild(field(t('v2-url'), textInput(btn.url, v => btn.url = v, 'https://...')));
    } else {
        body.appendChild(field(t('v2-custom-id'), textInput(btn.custom_id, v => btn.custom_id = v)));
    }
    body.appendChild(field(t('v2-emoji'), textInput(btn.emoji, v => btn.emoji = v, '🔥 / name:id')));
    body.appendChild(checkbox(t('v2-disabled'), btn.disabled, v => btn.disabled = v));
}

function buildSelect(sel, body) {
    const t = hooks.t;
    body.appendChild(field(t('v2-select-type'), selectEl([
        { value: '3', label: t('v2-select-string') },
        { value: '5', label: t('v2-select-user') },
        { value: '6', label: t('v2-select-role') },
        { value: '7', label: t('v2-select-mentionable') },
        { value: '8', label: t('v2-select-channel') }
    ], String(sel.selectType), v => { sel.selectType = Number(v); rerender(); })));
    body.appendChild(field(t('v2-custom-id'), textInput(sel.custom_id, v => sel.custom_id = v)));
    body.appendChild(field(t('v2-placeholder'), textInput(sel.placeholder, v => sel.placeholder = v)));
    const minmax = document.createElement('div');
    minmax.className = 'v2-subrow';
    minmax.appendChild(field(t('v2-min'), numberInput(sel.min, v => sel.min = v)));
    minmax.appendChild(field(t('v2-max'), numberInput(sel.max, v => sel.max = v)));
    body.appendChild(minmax);
    body.appendChild(checkbox(t('v2-disabled'), sel.disabled, v => sel.disabled = v));

    if (sel.selectType === 3) {
        sel.options.forEach((op, i) => {
            const sub = document.createElement('div');
            sub.className = 'v2-subcard';
            const h = document.createElement('div');
            h.className = 'v2-subcard-header';
            const label = document.createElement('span');
            label.textContent = t('v2-option') + ' ' + (i + 1);
            h.appendChild(label);
            if (sel.options.length > 1) {
                h.appendChild(iconBtn('✕', t('v2-remove'), () => { sel.options.splice(i, 1); rerender(); }));
            }
            sub.appendChild(h);
            sub.appendChild(field(t('v2-label'), textInput(op.label, v => op.label = v)));
            sub.appendChild(field(t('v2-value'), textInput(op.value, v => op.value = v)));
            sub.appendChild(field(t('v2-description'), textInput(op.description, v => op.description = v)));
            sub.appendChild(field(t('v2-emoji'), textInput(op.emoji, v => op.emoji = v, '🔥 / name:id')));
            sub.appendChild(checkbox(t('v2-default'), op.default, v => op.default = v));
            body.appendChild(sub);
        });
        if (sel.options.length < 25) {
            body.appendChild(addBtn(t('v2-add-option'), () => { sel.options.push({ label: '', value: '', description: '', emoji: '', default: false }); rerender(); }));
        }
    }
}

function buildContainer(block, body) {
    const t = hooks.t;
    const meta = document.createElement('div');
    meta.className = 'v2-subrow';
    const accentWrap = field(t('v2-accent'), textInput(block.accent, v => block.accent = v, '#5865F2'));
    meta.appendChild(accentWrap);
    body.appendChild(meta);
    body.appendChild(checkbox(t('v2-spoiler'), block.spoiler, v => block.spoiler = v));

    const nested = document.createElement('div');
    nested.className = 'v2-nested';
    block.children.forEach((child, i) => nested.appendChild(blockCard(child, block.children, i, true)));
    body.appendChild(nested);

    const tools = document.createElement('div');
    tools.className = 'v2-toolbar v2-toolbar-nested';
    CHILD_TYPES.forEach(type => {
        tools.appendChild(addBtn('+ ' + t('v2-block-' + type), () => { block.children.push(makeBlock(type)); rerender(); }));
    });
    body.appendChild(tools);
}

/* ---------------- Preview ---------------- */
function previewComponent(c) {
    switch (c.type) {
        case 17: {
            const box = document.createElement('div');
            box.className = 'discord-embed v2-container';
            box.style.borderColor = c.accent_color != null ? intToHex(c.accent_color) : 'var(--border)';
            const content = document.createElement('div');
            content.className = 'discord-embed-content';
            (c.components || []).forEach(ch => content.appendChild(previewComponent(ch)));
            box.appendChild(content);
            if (c.spoiler) box.classList.add('v2-spoilered');
            return box;
        }
        case 10: {
            const d = document.createElement('div');
            d.className = 'discord-embed-description';
            d.innerHTML = hooks.renderMarkdown(c.content);
            return d;
        }
        case 9: {
            const row = document.createElement('div');
            row.className = 'v2-section';
            const left = document.createElement('div');
            left.className = 'v2-section-text';
            (c.components || []).forEach(tc => {
                const d = document.createElement('div');
                d.className = 'discord-embed-description';
                d.innerHTML = hooks.renderMarkdown(tc.content);
                left.appendChild(d);
            });
            row.appendChild(left);
            if (c.accessory) row.appendChild(previewAccessory(c.accessory));
            return row;
        }
        case 12: {
            const grid = document.createElement('div');
            grid.className = 'v2-gallery';
            (c.items || []).forEach(it => grid.appendChild(previewImg(it.media && it.media.url)));
            return grid;
        }
        case 14: {
            const sep = document.createElement('div');
            sep.className = 'v2-separator' + (c.spacing === 2 ? ' large' : '') + (c.divider === false ? ' no-divider' : '');
            return sep;
        }
        case 13: {
            const f = document.createElement('div');
            f.className = 'v2-file';
            f.textContent = '📎 ' + fileName((c.file && c.file.url) || '');
            return f;
        }
        case 1: {
            const row = document.createElement('div');
            row.className = 'v2-actionrow';
            (c.components || []).forEach(comp => {
                if (comp.type === 2) row.appendChild(previewButton(comp));
                else row.appendChild(previewSelect(comp));
            });
            return row;
        }
        default:
            return document.createElement('div');
    }
}

function previewAccessory(acc) {
    if (acc.type === 2) { const w = document.createElement('div'); w.className = 'v2-accessory'; w.appendChild(previewButton(acc)); return w; }
    if (acc.type === 11) return previewImg(acc.media && acc.media.url, 'discord-embed-thumbnail');
    return document.createElement('div');
}

function previewButton(b) {
    const el = document.createElement(b.url ? 'a' : 'span');
    el.className = 'v2-btn v2-btn-style-' + (b.style || 2);
    if (b.url) { el.href = b.url; el.target = '_blank'; el.rel = 'noopener'; }
    if (b.disabled) el.classList.add('disabled');
    const label = (b.emoji && (b.emoji.name || '')) ? b.emoji.name + ' ' : '';
    el.textContent = label + (b.label || (b.url ? '🔗' : ''));
    return el;
}

function previewSelect(s) {
    const el = document.createElement('div');
    el.className = 'v2-select';
    el.textContent = s.placeholder || '⯆';
    return el;
}

function previewImg(url, cls) {
    const img = document.createElement('img');
    img.className = cls || 'v2-gallery-img';
    img.src = url || '';
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => img.classList.add('img-broken'));
    return img;
}

/* ---------------- Small DOM builders ---------------- */
function field(labelText, inputEl) {
    const wrap = document.createElement('div');
    wrap.className = 'embed-field';
    const label = document.createElement('label');
    label.textContent = labelText;
    wrap.appendChild(label);
    wrap.appendChild(inputEl);
    return wrap;
}

function textInput(value, oninput, placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('input', () => { oninput(input.value); hooks.onChange(); });
    return input;
}

function numberInput(value, oninput) {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '25';
    input.value = value == null ? '' : value;
    input.addEventListener('input', () => { oninput(input.value === '' ? 0 : Number(input.value)); hooks.onChange(); });
    return input;
}

function textarea(value, oninput) {
    const ta = document.createElement('textarea');
    ta.value = value || '';
    ta.addEventListener('input', () => { oninput(ta.value); hooks.onChange(); });
    return ta;
}

function selectEl(options, value, onchange) {
    const sel = document.createElement('select');
    sel.className = 'v2-select-input';
    options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        if (o.value === value) opt.selected = true;
        sel.appendChild(opt);
    });
    sel.addEventListener('change', () => onchange(sel.value));
    return sel;
}

function checkbox(labelText, checked, onchange) {
    const label = document.createElement('label');
    label.className = 'embed-checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    input.addEventListener('change', () => { onchange(input.checked); hooks.onChange(); });
    const span = document.createElement('span');
    span.textContent = labelText;
    label.appendChild(input);
    label.appendChild(span);
    return label;
}

function iconBtn(glyph, title, onclick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v2-icon-btn';
    btn.textContent = glyph;
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.addEventListener('click', onclick);
    return btn;
}

function addBtn(text, onclick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v2-add-btn';
    btn.textContent = text;
    btn.addEventListener('click', onclick);
    return btn;
}

/* ---------------- Helpers ---------------- */
function move(list, index, delta) {
    const to = index + delta;
    if (to < 0 || to >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(to, 0, item);
}

function clean(obj) {
    Object.keys(obj).forEach(k => { if (obj[k] === undefined) delete obj[k]; });
    return obj;
}

function parseEmoji(value) {
    const s = str(value).trim();
    if (!s) return null;
    let m = s.match(/^<(a)?:(\w+):(\d+)>$/);
    if (m) return clean({ id: m[3], name: m[2], animated: m[1] ? true : undefined });
    m = s.match(/^(\w+):(\d+)$/);
    if (m) return { id: m[2], name: m[1] };
    if (/^\d+$/.test(s)) return { id: s };
    return { name: s };
}

function hexToInt(value) {
    let v = str(value).trim();
    if (!v) return null;
    if (!v.startsWith('#')) v = '#' + v;
    return /^#[0-9a-fA-F]{6}$/.test(v) ? parseInt(v.slice(1), 16) : null;
}

function intToHex(int) {
    if (typeof int !== 'number' || isNaN(int)) return 'var(--border)';
    return '#' + (int & 0xffffff).toString(16).padStart(6, '0');
}

function clampInt(v, lo, hi) {
    v = Math.round(Number(v) || 0);
    return Math.min(hi, Math.max(lo, v));
}

function numOr(v, d) {
    const n = Number(v);
    return isNaN(n) ? d : n;
}

function fileName(url) {
    const clean = String(url).split('?')[0].split('#')[0];
    const parts = clean.split('/');
    return parts[parts.length - 1] || url || 'fichier';
}

function str(v) {
    return v === undefined || v === null ? '' : String(v);
}
