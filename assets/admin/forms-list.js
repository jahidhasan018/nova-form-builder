(function (wp) {
	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useRef = wp.element.useRef;
	var useCallback = wp.element.useCallback;
	var useMemo = wp.element.useMemo;
	var useState = wp.element.useState;
	var Button = wp.components.Button;
	var Notice = wp.components.Notice;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var ToggleControl = wp.components.ToggleControl;
	var SelectControl = wp.components.SelectControl;
	var Spinner = wp.components.Spinner;
	var apiFetch = wp.apiFetch;

	/* ======================== SVG Icons ======================== */
	var svgBase = { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
	function icon(paths, size) {
		var props = Object.assign({}, svgBase);
		if (size) { props.width = size; props.height = size; }
		return el('svg', props, paths);
	}
	var IconPlus = icon([el('line', { key: '1', x1: 12, y1: 5, x2: 12, y2: 19 }), el('line', { key: '2', x1: 5, y1: 12, x2: 19, y2: 12 })]);
	var IconArrowLeft = icon([el('line', { key: '1', x1: 19, y1: 12, x2: 5, y2: 12 }), el('polyline', { key: '2', points: '12 19 5 12 12 5' })]);
	var IconSave = icon([el('path', { key: '1', d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }), el('polyline', { key: '2', points: '17 21 17 13 7 13 7 21' }), el('polyline', { key: '3', points: '7 3 7 8 15 8' })]);
	var IconEye = icon([el('path', { key: '1', d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }), el('circle', { key: '2', cx: 12, cy: 12, r: 3 })]);
	var IconEyeOff = icon([el('path', { key: '1', d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' }), el('path', { key: '2', d: 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' }), el('line', { key: '3', x1: 1, y1: 1, x2: 23, y2: 23 })]);
	var IconCopy = icon([el('rect', { key: '1', x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }), el('path', { key: '2', d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })]);
	var IconTrash2 = icon([el('polyline', { key: '1', points: '3 6 5 6 21 6' }), el('path', { key: '2', d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })]);
	var IconEdit = icon([el('path', { key: '1', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }), el('path', { key: '2', d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })]);
	var IconClipboard = icon([el('path', { key: '1', d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }), el('rect', { key: '2', x: 8, y: 2, width: 8, height: 4, rx: 1, ry: 1 })]);
	var IconCheck = icon([el('polyline', { key: '1', points: '20 6 9 17 4 12' })]);
	var IconGripVertical = icon([el('circle', { key: '1', cx: 9, cy: 12, r: 1 }), el('circle', { key: '2', cx: 9, cy: 5, r: 1 }), el('circle', { key: '3', cx: 9, cy: 19, r: 1 }), el('circle', { key: '4', cx: 15, cy: 12, r: 1 }), el('circle', { key: '5', cx: 15, cy: 5, r: 1 }), el('circle', { key: '6', cx: 15, cy: 19, r: 1 })], 16);
	var IconSettings = icon([el('circle', { key: '1', cx: 12, cy: 12, r: 3 }), el('path', { key: '2', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' })]);
	var IconX = icon([el('line', { key: '1', x1: 18, y1: 6, x2: 6, y2: 18 }), el('line', { key: '2', x1: 6, y1: 6, x2: 18, y2: 18 })]);
	var IconLayout = icon([el('rect', { key: '1', x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }), el('line', { key: '2', x1: 3, y1: 9, x2: 21, y2: 9 }), el('line', { key: '3', x1: 9, y1: 21, x2: 9, y2: 9 })]);
	var IconFileText = icon([el('path', { key: '1', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }), el('polyline', { key: '2', points: '14 2 14 8 20 8' }), el('line', { key: '3', x1: 16, y1: 13, x2: 8, y2: 13 }), el('line', { key: '4', x1: 16, y1: 17, x2: 8, y2: 17 })]);
	var IconBarChart = icon([el('line', { key: '1', x1: 12, y1: 20, x2: 12, y2: 10 }), el('line', { key: '2', x1: 18, y1: 20, x2: 18, y2: 4 }), el('line', { key: '3', x1: 6, y1: 20, x2: 6, y2: 16 })]);
	var IconLayers = icon([el('polygon', { key: '1', points: '12 2 2 7 12 12 22 7 12 2' }), el('polyline', { key: '2', points: '2 17 12 22 22 17' }), el('polyline', { key: '3', points: '2 12 12 17 22 12' })]);
	var IconCode = icon([el('polyline', { key: '1', points: '16 18 22 12 16 6' }), el('polyline', { key: '2', points: '8 6 2 12 8 18' })]);
	var IconColumns = icon([el('rect', { key: '1', x: 3, y: 3, width: 18, height: 18, rx: 2 }), el('line', { key: '2', x1: 12, y1: 3, x2: 12, y2: 21 })]);

	// Field type icons
	var IconType = icon([el('polyline', { key: '1', points: '4 7 4 4 20 4 20 7' }), el('line', { key: '2', x1: 9, y1: 20, x2: 15, y2: 20 }), el('line', { key: '3', x1: 12, y1: 4, x2: 12, y2: 20 })]);
	var IconMail = icon([el('path', { key: '1', d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }), el('polyline', { key: '2', points: '22 6 12 13 2 6' })]);
	var IconAlignLeft = icon([el('line', { key: '1', x1: 17, y1: 10, x2: 3, y2: 10 }), el('line', { key: '2', x1: 21, y1: 6, x2: 3, y2: 6 }), el('line', { key: '3', x1: 21, y1: 14, x2: 3, y2: 14 }), el('line', { key: '4', x1: 17, y1: 18, x2: 3, y2: 18 })]);
	var IconHash = icon([el('line', { key: '1', x1: 4, y1: 9, x2: 20, y2: 9 }), el('line', { key: '2', x1: 4, y1: 15, x2: 20, y2: 15 }), el('line', { key: '3', x1: 10, y1: 3, x2: 8, y2: 21 }), el('line', { key: '4', x1: 16, y1: 3, x2: 14, y2: 21 })]);
	var IconPhone = icon([el('path', { key: '1', d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z' })]);
	var IconLink = icon([el('path', { key: '1', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }), el('path', { key: '2', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })]);
	var IconList = icon([el('line', { key: '1', x1: 8, y1: 6, x2: 21, y2: 6 }), el('line', { key: '2', x1: 8, y1: 12, x2: 21, y2: 12 }), el('line', { key: '3', x1: 8, y1: 18, x2: 21, y2: 18 }), el('line', { key: '4', x1: 3, y1: 6, x2: 3.01, y2: 6 }), el('line', { key: '5', x1: 3, y1: 12, x2: 3.01, y2: 12 }), el('line', { key: '6', x1: 3, y1: 18, x2: 3.01, y2: 18 })]);
	var IconCircle = icon([el('circle', { key: '1', cx: 12, cy: 12, r: 10 })]);
	var IconCheckSquare = icon([el('polyline', { key: '1', points: '9 11 12 14 22 4' }), el('path', { key: '2', d: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' })]);
	var IconSquare = icon([el('rect', { key: '1', x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 })]);
	var IconCalendar = icon([el('rect', { key: '1', x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }), el('line', { key: '2', x1: 16, y1: 2, x2: 16, y2: 6 }), el('line', { key: '3', x1: 8, y1: 2, x2: 8, y2: 6 }), el('line', { key: '4', x1: 3, y1: 10, x2: 21, y2: 10 })]);
	var IconClock = icon([el('circle', { key: '1', cx: 12, cy: 12, r: 10 }), el('polyline', { key: '2', points: '12 6 12 12 16 14' })]);
	var IconPaperclip = icon([el('path', { key: '1', d: 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48' })]);
	var IconShield = icon([el('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })]);

	var fieldLibrary = {
		basic: [
			{ type: 'text', label: 'Text', icon: IconType },
			{ type: 'email', label: 'Email', icon: IconMail },
			{ type: 'textarea', label: 'Textarea', icon: IconAlignLeft },
			{ type: 'number', label: 'Number', icon: IconHash },
			{ type: 'tel', label: 'Phone', icon: IconPhone },
			{ type: 'url', label: 'URL', icon: IconLink }
		],
		choice: [
			{ type: 'select', label: 'Select', icon: IconList },
			{ type: 'radio', label: 'Radio', icon: IconCircle },
			{ type: 'checkbox-group', label: 'Checkbox Group', icon: IconCheckSquare },
			{ type: 'checkbox', label: 'Checkbox', icon: IconSquare }
		],
		advanced: [
			{ type: 'date', label: 'Date', icon: IconCalendar },
			{ type: 'time', label: 'Time', icon: IconClock },
			{ type: 'file', label: 'File Upload', icon: IconPaperclip },
			{ type: 'hidden', label: 'Hidden', icon: IconEyeOff },
			{ type: 'consent', label: 'Consent', icon: IconShield },
			{ type: 'html', label: 'HTML Block', icon: IconCode }
		]
	};

	function uid() { return 'f_' + Math.random().toString(36).slice(2, 10); }
	function rowId() { return 'row_' + Math.random().toString(36).slice(2, 10); }

	function getFieldIcon(type) {
		var all = fieldLibrary.basic.concat(fieldLibrary.choice).concat(fieldLibrary.advanced);
		for (var i = 0; i < all.length; i++) { if (all[i].type === type) return all[i].icon; }
		return IconType;
	}

	function makeField(type) {
		var label = type.charAt(0).toUpperCase() + type.slice(1);
		var f = { id: uid(), type: type, label: label, name: type + '_' + uid(), placeholder: '', help_text: '', required: false, default_value: '', choices: [], accept: '', max_file_size_kb: 0, html: '' };
		if (type === 'select' || type === 'radio' || type === 'checkbox-group') {
			f.choices = [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }, { label: 'Option 3', value: 'option_3' }];
		}
		return f;
	}

	function makeRow(colCount) {
		var w = Math.floor(10000 / colCount) / 100;
		var cols = [];
		for (var i = 0; i < colCount; i++) cols.push({ width: w, fields: [] });
		return { id: rowId(), columns: cols };
	}

	var COLUMN_PRESETS = [
		{ label: '1 Column', value: [100] },
		{ label: '2 Columns (50/50)', value: [50, 50] },
		{ label: '2 Columns (33/67)', value: [33.33, 66.67] },
		{ label: '2 Columns (67/33)', value: [66.67, 33.33] },
		{ label: '2 Columns (25/75)', value: [25, 75] },
		{ label: '2 Columns (75/25)', value: [75, 25] },
		{ label: '3 Columns (33/33/33)', value: [33.33, 33.33, 33.34] },
		{ label: '4 Columns (25/25/25/25)', value: [25, 25, 25, 25] }
	];

	function emptyForm() {
		return { id: 0, name: 'Contact Form', schema_version: 3, settings: { submit_label: 'Submit', success_message: 'Thanks for submitting the form.', error_message: 'Please fix the highlighted fields.', redirect_url: '', spam_honeypot: true, style_preset: 'modern' }, rows: [], fields: [] };
	}

	function normalizeFormRows(form) {
		if (form.rows && form.rows.length) return form;
		if (!form.fields || !form.fields.length) { form.rows = []; return form; }
		form.rows = form.fields.map(function (f) {
			return { id: rowId(), columns: [{ width: 100, fields: [Object.assign({}, f, { id: f.id || uid() })] }] };
		});
		return form;
	}

	function flattenFields(rows) {
		var fields = [];
		(rows || []).forEach(function (row) {
			(row.columns || []).forEach(function (col) {
				(col.fields || []).forEach(function (f) { fields.push(f); });
			});
		});
		return fields;
	}

	/* ===================== Drag & Drop State ===================== */
	var dragState = { type: null, fieldType: null, field: null, sourceRowId: null, sourceColIdx: null, sourceFieldIdx: null };

	function clearDrag() {
		dragState.type = null; dragState.fieldType = null; dragState.field = null;
		dragState.sourceRowId = null; dragState.sourceColIdx = null; dragState.sourceFieldIdx = null;
		document.querySelectorAll('.nova-drop-active').forEach(function (el) { el.classList.remove('nova-drop-active'); });
	}

	/* ===================== Field Preview Renderer ===================== */
	function FieldPreview(props) {
		var f = props.field;
		var type = f.type;
		var reqMark = f.required ? el('span', { style: { color: '#dc2626', fontWeight: 700 } }, ' *') : null;

		if (type === 'html' || type === 'section') {
			return el('div', { className: 'nova-field-preview-static', dangerouslySetInnerHTML: { __html: f.html || f.label } });
		}

		var labelEl = type !== 'hidden' ? el('label', { className: 'nova-preview-label' }, f.label, reqMark) : null;
		var helpEl = f.help_text ? el('small', { className: 'nova-preview-help' }, f.help_text) : null;
		var inputEl = null;

		if (type === 'textarea') {
			inputEl = el('textarea', { className: 'nova-preview-input', placeholder: f.placeholder || '', defaultValue: f.default_value || '', rows: 3, readOnly: true });
		} else if (type === 'select') {
			var opts = [el('option', { key: 'ph', value: '' }, f.placeholder || 'Select an option')];
			(f.choices || []).forEach(function (c, i) {
				var lbl = typeof c === 'string' ? c : (c.label || '');
				var val = typeof c === 'string' ? c : (c.value || lbl);
				opts.push(el('option', { key: i, value: val }, lbl));
			});
			inputEl = el('select', { className: 'nova-preview-input' }, opts);
		} else if (type === 'radio') {
			inputEl = el('div', { className: 'nova-preview-choices' }, (f.choices || []).map(function (c, i) {
				var lbl = typeof c === 'string' ? c : (c.label || '');
				return el('label', { key: i, className: 'nova-preview-choice' }, el('input', { type: 'radio', name: f.name, readOnly: true }), ' ', lbl);
			}));
		} else if (type === 'checkbox-group') {
			inputEl = el('div', { className: 'nova-preview-choices' }, (f.choices || []).map(function (c, i) {
				var lbl = typeof c === 'string' ? c : (c.label || '');
				return el('label', { key: i, className: 'nova-preview-choice' }, el('input', { type: 'checkbox', readOnly: true }), ' ', lbl);
			}));
		} else if (type === 'checkbox' || type === 'consent') {
			inputEl = el('label', { className: 'nova-preview-choice' }, el('input', { type: 'checkbox', readOnly: true }), ' ', f.placeholder || f.default_value || 'Yes');
		} else if (type === 'file') {
			inputEl = el('input', { type: 'file', className: 'nova-preview-input', disabled: true, accept: f.accept || '' });
		} else {
			var itype = ['text', 'email', 'number', 'tel', 'url', 'date', 'time', 'hidden'].indexOf(type) >= 0 ? type : 'text';
			inputEl = el('input', { type: itype, className: 'nova-preview-input', placeholder: f.placeholder || '', defaultValue: f.default_value || '', readOnly: true });
		}

		return el('div', { className: 'nova-field-preview' }, labelEl, inputEl, helpEl);
	}

	/* ===================== FieldInspector Component ===================== */
	function FieldInspector(props) {
		var field = props.field;
		var onChange = props.onChange;
		var onClose = props.onClose;
		if (!field) return null;

		function upd(key, val) { var o = Object.assign({}, field); o[key] = val; onChange(o); }

		var hasChoices = ['select', 'radio', 'checkbox-group'].indexOf(field.type) >= 0;
		var choices = field.choices || [];

		return el('div', { className: 'nova-inspector' },
			el('div', { className: 'nova-inspector-header' },
				el('span', { className: 'nova-inspector-icon' }, IconSettings),
				el('strong', null, 'Field Settings'),
				el('button', { className: 'nova-inspector-close', onClick: onClose }, IconX)
			),
			el('div', { className: 'nova-inspector-body' },
				el(TextControl, { label: 'Label', value: field.label, onChange: function (v) { upd('label', v); } }),
				el(TextControl, { label: 'Field Key', value: field.name, onChange: function (v) { upd('name', v.toLowerCase().replace(/[^a-z0-9_]/g, '_')); } }),
				field.type !== 'checkbox' && field.type !== 'consent' ? el(TextControl, { label: 'Placeholder', value: field.placeholder || '', onChange: function (v) { upd('placeholder', v); } }) : null,
				el(TextControl, { label: 'Help Text', value: field.help_text || '', onChange: function (v) { upd('help_text', v); } }),
				el(ToggleControl, { label: 'Required', checked: !!field.required, onChange: function (v) { upd('required', v); } }),
				field.type === 'file' ? el(TextControl, { label: 'Accepted File Types', value: field.accept || '', onChange: function (v) { upd('accept', v); }, help: 'e.g. .pdf,.jpg,.png' }) : null,
				field.type === 'html' ? el(TextareaControl, { label: 'HTML Content', value: field.html || '', onChange: function (v) { upd('html', v); } }) : null,
				hasChoices ? el('div', { className: 'nova-inspector-choices' },
					el('label', { className: 'nova-inspector-choices-label' }, 'Options'),
					choices.map(function (c, i) {
						var lbl = typeof c === 'string' ? c : (c.label || '');
						var val = typeof c === 'string' ? c : (c.value || '');
						return el('div', { key: i, className: 'nova-choice-row' },
							el('input', {
								type: 'text', placeholder: 'Label', value: lbl, className: 'nova-choice-input', onChange: function (e) {
									var nc = choices.slice(); nc[i] = { label: e.target.value, value: val || e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }; upd('choices', nc);
								}
							}),
							el('input', {
								type: 'text', placeholder: 'Value', value: val, className: 'nova-choice-input nova-choice-val', onChange: function (e) {
									var nc = choices.slice(); nc[i] = { label: lbl, value: e.target.value }; upd('choices', nc);
								}
							}),
							el('button', { className: 'nova-choice-remove', onClick: function () { var nc = choices.slice(); nc.splice(i, 1); upd('choices', nc); } }, IconX)
						);
					}),
					el('button', { className: 'nova-choice-add', onClick: function () { upd('choices', choices.concat([{ label: 'Option ' + (choices.length + 1), value: 'option_' + (choices.length + 1) }])); } }, IconPlus, ' Add Option')
				) : null
			)
		);
	}

	/* ===================== FormListView ===================== */
	function FormListView(props) {
		return el('div', { className: 'nova-forms-list' },
			el('div', { className: 'nova-list-header' },
				el('div', { className: 'nova-list-header__icon' }, IconClipboard),
				el('div', null, el('h2', { className: 'nova-list-title' }, 'Forms'), el('p', { className: 'nova-list-subtitle' }, props.forms.length + ' form(s)')),
				el('div', { style: { marginLeft: 'auto' } },
					el(Button, { variant: 'primary', className: 'nova-btn-add', onClick: props.onAdd }, el('span', { className: 'nova-btn-icon' }, IconPlus), 'Add New Form')
				)
			),
			props.loading ? el('div', { className: 'nova-loading' }, el(Spinner, null)) : null,
			!props.loading && props.forms.length === 0 ? el('div', { className: 'nova-empty' }, el('p', null, 'No forms yet. Click "Add New Form" to get started.')) : null,
			el('div', { className: 'nova-cards-grid' },
				props.forms.map(function (form) {
					return el('div', { key: form.id, className: 'nova-form-card' },
						el('div', { className: 'nova-form-card__header' },
							el('span', { className: 'nova-form-card__icon' }, IconFileText),
							el('strong', null, form.name)
						),
						el('div', { className: 'nova-form-card__meta' },
							el('span', null, IconLayers, ' ', (form.fields || []).length, ' fields'),
							el('span', null, IconBarChart, ' ', form.entries_count || 0, ' entries')
						),
						el('div', { className: 'nova-form-card__actions' },
							el(Button, { variant: 'secondary', className: 'nova-card-btn', onClick: function () { props.onEdit(form); } }, IconEdit, ' Edit'),
							el(Button, { className: 'nova-card-btn', onClick: function () { props.onDuplicate(form.id); } }, IconCopy, ' Duplicate'),
							el(Button, { isDestructive: true, className: 'nova-card-btn', onClick: function () { if (confirm('Delete "' + form.name + '"?')) props.onDelete(form.id); } }, IconTrash2, ' Delete')
						),
						el('div', { className: 'nova-form-card__shortcode' }, '[nova_form id="' + form.id + '"]')
					);
				})
			)
		);
	}

	/* ===================== Column Builder Canvas ===================== */
	function BuilderCanvas(props) {
		var rows = props.rows;
		var setRows = props.setRows;
		var selectedField = props.selectedField;
		var setSelectedField = props.setSelectedField;
		var setDirty = props.setDirty;

		function updateRows(newRows) { setRows(newRows); setDirty(true); }

		function addRow(preset) {
			var cols = preset.map(function (w) { return { width: w, fields: [] }; });
			updateRows(rows.concat([{ id: rowId(), columns: cols }]));
		}

		function deleteRow(rIdx) { var nr = rows.slice(); nr.splice(rIdx, 1); updateRows(nr); }

		function moveRow(rIdx, dir) {
			var nr = rows.slice();
			var target = rIdx + dir;
			if (target < 0 || target >= nr.length) return;
			var tmp = nr[rIdx]; nr[rIdx] = nr[target]; nr[target] = tmp;
			updateRows(nr);
		}

		function changeRowLayout(rIdx, preset) {
			var nr = rows.slice();
			var row = Object.assign({}, nr[rIdx]);
			var allFields = [];
			(row.columns || []).forEach(function (c) { allFields = allFields.concat(c.fields || []); });
			var newCols = preset.map(function (w) { return { width: w, fields: [] }; });
			allFields.forEach(function (f, i) { newCols[i % newCols.length].fields.push(f); });
			row.columns = newCols;
			nr[rIdx] = row;
			updateRows(nr);
		}

		function addFieldToCol(rIdx, cIdx, fieldType) {
			var nr = JSON.parse(JSON.stringify(rows));
			nr[rIdx].columns[cIdx].fields.push(makeField(fieldType));
			updateRows(nr);
		}

		function removeField(rIdx, cIdx, fIdx) {
			var nr = JSON.parse(JSON.stringify(rows));
			nr[rIdx].columns[cIdx].fields.splice(fIdx, 1);
			updateRows(nr);
			setSelectedField(null);
		}

		function updateField(rIdx, cIdx, fIdx, newField) {
			var nr = JSON.parse(JSON.stringify(rows));
			nr[rIdx].columns[cIdx].fields[fIdx] = newField;
			updateRows(nr);
			setSelectedField({ rIdx: rIdx, cIdx: cIdx, fIdx: fIdx, field: newField });
		}

		/* Drag handlers */
		function handleFieldDragStart(e, rIdx, cIdx, fIdx) {
			dragState.type = 'move';
			dragState.sourceRowId = rIdx;
			dragState.sourceColIdx = cIdx;
			dragState.sourceFieldIdx = fIdx;
			dragState.field = JSON.parse(JSON.stringify(rows[rIdx].columns[cIdx].fields[fIdx]));
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', 'field');
		}

		function handleLibraryDragStart(e, fieldType) {
			dragState.type = 'new';
			dragState.fieldType = fieldType;
			e.dataTransfer.effectAllowed = 'copy';
			e.dataTransfer.setData('text/plain', 'new');
		}

		function handleColDrop(e, rIdx, cIdx, insertIdx) {
			e.preventDefault();
			e.stopPropagation();
			var nr = JSON.parse(JSON.stringify(rows));
			if (dragState.type === 'new') {
				var nf = makeField(dragState.fieldType);
				var idx = typeof insertIdx === 'number' ? insertIdx : nr[rIdx].columns[cIdx].fields.length;
				nr[rIdx].columns[cIdx].fields.splice(idx, 0, nf);
			} else if (dragState.type === 'move' && dragState.field) {
				nr[dragState.sourceRowId].columns[dragState.sourceColIdx].fields.splice(dragState.sourceFieldIdx, 1);
				var targetIdx = typeof insertIdx === 'number' ? insertIdx : nr[rIdx].columns[cIdx].fields.length;
				nr[rIdx].columns[cIdx].fields.splice(targetIdx, 0, dragState.field);
			}
			clearDrag();
			updateRows(nr);
		}

		function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = dragState.type === 'new' ? 'copy' : 'move'; }

		/* Render rows */
		return el('div', { className: 'nova-builder-canvas' },
			rows.map(function (row, rIdx) {
				return el('div', { key: row.id || rIdx, className: 'nova-builder-row' },
					el('div', { className: 'nova-row-toolbar' },
						el('span', { className: 'nova-row-label' }, 'Row ', rIdx + 1),
						el('div', { className: 'nova-row-actions' },
							el('select', {
								className: 'nova-row-layout-select', value: '', onChange: function (e) {
									var idx = parseInt(e.target.value);
									if (!isNaN(idx) && COLUMN_PRESETS[idx]) changeRowLayout(rIdx, COLUMN_PRESETS[idx].value);
									e.target.value = '';
								}
							},
								el('option', { value: '' }, 'Change Layout'),
								COLUMN_PRESETS.map(function (p, pi) { return el('option', { key: pi, value: pi }, p.label); })
							),
							el('button', { className: 'nova-row-btn', onClick: function () { moveRow(rIdx, -1); }, title: 'Move Up', disabled: rIdx === 0 }, '↑'),
							el('button', { className: 'nova-row-btn', onClick: function () { moveRow(rIdx, 1); }, title: 'Move Down', disabled: rIdx === rows.length - 1 }, '↓'),
							el('button', { className: 'nova-row-btn nova-row-btn-danger', onClick: function () { deleteRow(rIdx); }, title: 'Delete Row' }, IconTrash2)
						)
					),
					el('div', { className: 'nova-row-columns' },
						row.columns.map(function (col, cIdx) {
							return el('div', {
								key: cIdx, className: 'nova-builder-column', style: { width: col.width + '%', flex: '0 0 ' + col.width + '%' },
								onDragOver: handleDragOver,
								onDrop: function (e) { handleColDrop(e, rIdx, cIdx); }
							},
								el('div', { className: 'nova-col-header' }, el('span', null, Math.round(col.width) + '%')),
								col.fields.length === 0
									? el('div', { className: 'nova-col-empty' }, el('span', null, IconPlus, ' Drop field here'))
									: col.fields.map(function (f, fIdx) {
										var isSelected = selectedField && selectedField.rIdx === rIdx && selectedField.cIdx === cIdx && selectedField.fIdx === fIdx;
										return el('div', {
											key: f.id || fIdx, className: 'nova-canvas-field' + (isSelected ? ' is-selected' : ''), draggable: true,
											onDragStart: function (e) { handleFieldDragStart(e, rIdx, cIdx, fIdx); },
											onDragEnd: clearDrag,
											onClick: function (e) { e.stopPropagation(); setSelectedField({ rIdx: rIdx, cIdx: cIdx, fIdx: fIdx, field: f }); }
										},
											el('div', { className: 'nova-canvas-field-grip' }, IconGripVertical),
											el('div', { className: 'nova-canvas-field-icon' }, getFieldIcon(f.type)),
											el('div', { className: 'nova-canvas-field-info' },
												el('span', { className: 'nova-canvas-field-label' }, f.label, f.required ? el('span', { className: 'nova-required-badge' }, '*') : null),
												el('span', { className: 'nova-canvas-field-type' }, f.type, ' · ', f.name)
											),
											el('button', { className: 'nova-canvas-field-remove', onClick: function (e) { e.stopPropagation(); removeField(rIdx, cIdx, fIdx); } }, IconX)
										);
									})
							);
						})
					)
				);
			}),
			el('div', { className: 'nova-add-row-bar' },
				el('span', { className: 'nova-add-row-label' }, 'Add Row:'),
				COLUMN_PRESETS.slice(0, 5).map(function (p, i) {
					return el('button', { key: i, className: 'nova-add-row-btn', onClick: function () { addRow(p.value); }, title: p.label },
						p.value.map(function (w, wi) { return el('span', { key: wi, className: 'nova-preset-col', style: { width: w + '%' } }); })
					);
				})
			)
		);
	}

	/* ===================== Form Settings Tab ===================== */
	function FormSettingsTab(props) {
		var s = props.settings;
		function upd(k, v) { var ns = Object.assign({}, s); ns[k] = v; props.onChange(ns); }
		return el('div', { className: 'nova-form-settings-panel' },
			el('div', { className: 'nova-settings-section' },
				el('h3', null, el('span', { className: 'nova-section-icon' }, IconFileText), ' General'),
				el('div', { className: 'nova-settings-grid' },
					el(TextControl, { label: 'Submit Button Label', value: s.submit_label || '', onChange: function (v) { upd('submit_label', v); } }),
					el(TextControl, { label: 'Success Message', value: s.success_message || '', onChange: function (v) { upd('success_message', v); } }),
					el(TextControl, { label: 'Error Message', value: s.error_message || '', onChange: function (v) { upd('error_message', v); } }),
					el(TextControl, { label: 'Redirect URL', value: s.redirect_url || '', onChange: function (v) { upd('redirect_url', v); } })
				)
			),
			el('div', { className: 'nova-settings-section' },
				el('h3', null, el('span', { className: 'nova-section-icon' }, IconShield), ' Security'),
				el(ToggleControl, { label: 'Enable Honeypot', checked: !!s.spam_honeypot, onChange: function (v) { upd('spam_honeypot', v); }, help: 'Add a hidden field to catch spam bots.' })
			),
			el('div', { className: 'nova-settings-section' },
				el('h3', null, el('span', { className: 'nova-section-icon' }, IconEye), ' Appearance'),
				el(SelectControl, {
					label: 'Style Preset', value: s.style_preset || 'modern', onChange: function (v) { upd('style_preset', v); }, options: [
						{ label: 'Modern', value: 'modern' }, { label: 'Classic', value: 'classic' }, { label: 'Minimal', value: 'minimal' }
					]
				})
			)
		);
	}

	/* ===================== Preview Tab ===================== */
	function PreviewTab(props) {
		var rows = props.rows;
		var settings = props.settings;
		return el('div', { className: 'nova-preview-container' },
			el('div', { className: 'nova-preview-form' },
				el('h3', { className: 'nova-preview-title' }, props.formName),
				rows.map(function (row, rIdx) {
					return el('div', { key: row.id || rIdx, className: 'nova-preview-row' },
						row.columns.map(function (col, cIdx) {
							return el('div', { key: cIdx, className: 'nova-preview-column', style: { width: col.width + '%', flex: '0 0 ' + col.width + '%' } },
								col.fields.map(function (f, fIdx) {
									return el('div', { key: f.id || fIdx, className: 'nova-preview-field-block' }, el(FieldPreview, { field: f }));
								})
							);
						})
					);
				}),
				el('button', { className: 'nova-preview-submit', type: 'button' }, settings.submit_label || 'Submit')
			)
		);
	}

	/* ===================== Main App ===================== */
	function App() {
		var _view = useState('list');
		var view = _view[0]; var setView = _view[1];
		var _forms = useState([]);
		var forms = _forms[0]; var setForms = _forms[1];
		var _loading = useState(true);
		var loading = _loading[0]; var setLoading = _loading[1];
		var _form = useState(null);
		var form = _form[0]; var setForm = _form[1];
		var _dirty = useState(false);
		var dirty = _dirty[0]; var setDirty = _dirty[1];
		var _saving = useState(false);
		var saving = _saving[0]; var setSaving = _saving[1];
		var _notice = useState(null);
		var notice = _notice[0]; var setNotice = _notice[1];
		var _tab = useState('builder');
		var tab = _tab[0]; var setTab = _tab[1];
		var _selectedField = useState(null);
		var selectedField = _selectedField[0]; var setSelectedField = _selectedField[1];

		function loadForms() {
			setLoading(true);
			apiFetch({ path: '/nova-form/v1/forms' }).then(function (res) {
				setForms(res.data || []);
			}).catch(function () { }).finally(function () { setLoading(false); });
		}
		useEffect(loadForms, []);

		function openEditor(f) {
			var normalized = normalizeFormRows(JSON.parse(JSON.stringify(f)));
			setForm(normalized);
			setDirty(false);
			setTab('builder');
			setSelectedField(null);
			setView('editor');
		}

		function createNew() { openEditor(emptyForm()); }

		function saveForm() {
			if (!form) return;
			setSaving(true);
			var payload = Object.assign({}, form, { fields: flattenFields(form.rows) });
			apiFetch({ path: '/nova-form/v1/forms', method: 'POST', data: payload }).then(function (res) {
				if (res.success) {
					setForm(Object.assign({}, form, { id: res.data.id }));
					setDirty(false);
					setNotice({ type: 'success', msg: 'Form saved!' });
					loadForms();
				}
			}).catch(function () { setNotice({ type: 'error', msg: 'Error saving form.' }); }).finally(function () { setSaving(false); });
		}

		function duplicateForm(id) {
			apiFetch({ path: '/nova-form/v1/forms/' + id + '/duplicate', method: 'POST' }).then(function () { loadForms(); setNotice({ type: 'success', msg: 'Form duplicated!' }); });
		}

		function deleteForm(id) {
			apiFetch({ path: '/nova-form/v1/forms/' + id, method: 'DELETE' }).then(function () { loadForms(); setNotice({ type: 'success', msg: 'Form deleted.' }); });
		}

		function handleFieldChange(newField) {
			if (!selectedField || !form) return;
			var nr = JSON.parse(JSON.stringify(form.rows));
			nr[selectedField.rIdx].columns[selectedField.cIdx].fields[selectedField.fIdx] = newField;
			setForm(Object.assign({}, form, { rows: nr }));
			setSelectedField(Object.assign({}, selectedField, { field: newField }));
			setDirty(true);
		}

		/* Field Library panel */
		function FieldLibraryPanel() {
			return el('div', { className: 'nova-field-library' },
				el('div', { className: 'nova-field-library-header' }, el('span', { className: 'nova-fl-icon' }, IconLayers), el('strong', null, 'Field Library')),
				Object.keys(fieldLibrary).map(function (group) {
					return el('div', { key: group, className: 'nova-fl-group' },
						el('div', { className: 'nova-fl-group-title' }, group.toUpperCase()),
						fieldLibrary[group].map(function (ft) {
							return el('div', {
								key: ft.type, className: 'nova-fl-item', draggable: true,
								onDragStart: function (e) {
									dragState.type = 'new';
									dragState.fieldType = ft.type;
									e.dataTransfer.effectAllowed = 'copy';
									e.dataTransfer.setData('text/plain', 'new');
								}
							}, el('span', { className: 'nova-fl-item-icon' }, ft.icon), ft.label);
						})
					);
				})
			);
		}

		if (view === 'list') {
			return el('div', { className: 'nova-admin-page' },
				notice ? el(Notice, { status: notice.type, isDismissible: true, onRemove: function () { setNotice(null); }, className: 'nova-notice' }, notice.msg) : null,
				el(FormListView, { forms: forms, loading: loading, onAdd: createNew, onEdit: openEditor, onDuplicate: duplicateForm, onDelete: deleteForm })
			);
		}

		/* Editor view */
		var rows = form ? form.rows || [] : [];
		var settings = form ? form.settings || {} : {};

		return el('div', { className: 'nova-admin-page nova-editor-page' },
			notice ? el(Notice, { status: notice.type, isDismissible: true, onRemove: function () { setNotice(null); }, className: 'nova-notice' }, notice.msg) : null,
			el('div', { className: 'nova-editor-topbar' },
				el('div', { className: 'nova-topbar-left' },
					el(Button, { className: 'nova-back-btn', onClick: function () { if (!dirty || confirm('Discard unsaved changes?')) { setView('list'); setSelectedField(null); } } }, IconArrowLeft, ' Forms'),
					el('input', { className: 'nova-form-name-input', value: form ? form.name : '', onChange: function (e) { setForm(Object.assign({}, form, { name: e.target.value })); setDirty(true); } }),
					el('span', { className: 'nova-save-status' + (dirty ? ' is-dirty' : '') }, dirty ? 'Unsaved changes' : el('span', null, IconCheck, ' Saved'))
				),
				el('div', { className: 'nova-topbar-center' },
					el('button', { className: 'nova-tab-btn' + (tab === 'builder' ? ' is-active' : ''), onClick: function () { setTab('builder'); } }, IconLayout, ' Form Builder'),
					el('button', { className: 'nova-tab-btn' + (tab === 'settings' ? ' is-active' : ''), onClick: function () { setTab('settings'); } }, IconSettings, ' Form Settings'),
					el('button', { className: 'nova-tab-btn' + (tab === 'preview' ? ' is-active' : ''), onClick: function () { setTab('preview'); } }, IconEye, ' Preview')
				),
				el('div', { className: 'nova-topbar-right' },
					form && form.id ? el(Button, { className: 'nova-shortcode-btn', onClick: function () { navigator.clipboard.writeText('[nova_form id="' + form.id + '"]'); setNotice({ type: 'success', msg: 'Shortcode copied!' }); } }, IconCode, ' Shortcode') : null,
					el(Button, { variant: 'primary', className: 'nova-save-btn', onClick: saveForm, disabled: saving }, el('span', { className: 'nova-btn-icon' }, IconSave), saving ? 'Saving...' : 'Save Form')
				)
			),
			tab === 'builder' ? el('div', { className: 'nova-builder-layout' },
				el(FieldLibraryPanel, null),
				el('div', { className: 'nova-builder-main' },
					el(BuilderCanvas, { rows: rows, setRows: function (nr) { setForm(Object.assign({}, form, { rows: nr })); }, selectedField: selectedField, setSelectedField: setSelectedField, setDirty: setDirty })
				),
				selectedField ? el(FieldInspector, { field: selectedField.field, onChange: handleFieldChange, onClose: function () { setSelectedField(null); } }) : null
			) : null,
			tab === 'settings' ? el(FormSettingsTab, { settings: settings, onChange: function (ns) { setForm(Object.assign({}, form, { settings: ns })); setDirty(true); } }) : null,
			tab === 'preview' ? el(PreviewTab, { rows: rows, settings: settings, formName: form ? form.name : '' }) : null
		);
	}

	wp.element.render(el(App), document.getElementById('nova-form-builder-forms-root'));
}(window.wp));
