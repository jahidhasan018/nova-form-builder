(function (wp) {
	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var useEffect = wp.element.useEffect;
	var Button = wp.components.Button;
	var Notice = wp.components.Notice;
	var TabPanel = wp.components.TabPanel;
	var ToggleControl = wp.components.ToggleControl;
	var TextControl = wp.components.TextControl;
	var SelectControl = wp.components.SelectControl;
	var apiFetch = wp.apiFetch;

	// ========================
	// Lucide-style SVG Icons
	// ========================
	var svgBase = { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

	function icon(paths) {
		return el('svg', Object.assign({}, svgBase), paths);
	}

	var IconSettings = icon([el('circle', { key: '1', cx: 12, cy: 12, r: 3 }), el('path', { key: '2', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' })]);
	var IconSave = icon([el('path', { key: '1', d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }), el('polyline', { key: '2', points: '17 21 17 13 7 13 7 21' }), el('polyline', { key: '3', points: '7 3 7 8 15 8' })]);
	var IconFileText = icon([el('path', { key: '1', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }), el('polyline', { key: '2', points: '14 2 14 8 20 8' }), el('line', { key: '3', x1: 16, y1: 13, x2: 8, y2: 13 }), el('line', { key: '4', x1: 16, y1: 17, x2: 8, y2: 17 })]);
	var IconBell = icon([el('path', { key: '1', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }), el('path', { key: '2', d: 'M13.73 21a2 2 0 0 1-3.46 0' })]);
	var IconLink = icon([el('path', { key: '1', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }), el('path', { key: '2', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })]);
	var IconShield = icon([el('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })]);
	var IconPalette = icon([el('circle', { key: '1', cx: 13.5, cy: 6.5, r: 2.5 }), el('circle', { key: '2', cx: 17.5, cy: 10.5, r: 2.5 }), el('circle', { key: '3', cx: 8.5, cy: 7.5, r: 2.5 }), el('circle', { key: '4', cx: 6.5, cy: 12.5, r: 2.5 }), el('path', { key: '5', d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' })]);

	var defaultState = {
		enable_webhook: false,
		webhook_url: '',
		enable_email_notifications: true,
		email_from_name: 'Nova Forms',
		email_from_address: '',
		email_recipient: '',
		email_subject: 'New Form Submission',
		submit_button_label: 'Submit',
		success_message: 'Thanks for submitting the form.',
		error_message: 'Please fix the highlighted fields.',
		enable_honeypot: true,
		store_submissions: true,
		style_preset: 'modern',
		enable_rate_limiting: true,
		rate_limit_max: 10,
		data_retention_days: 0
	};

	apiFetch.use(apiFetch.createNonceMiddleware(window.NovaFormBuilderSettings.nonce));
	apiFetch.use(apiFetch.createRootURLMiddleware(window.NovaFormBuilderSettings.root.replace('/nova-form/v1', '/')));

	function App() {
		var _useState = useState(defaultState), state = _useState[0], setState = _useState[1];
		var _useState2 = useState(''), msg = _useState2[0], setMsg = _useState2[1];
		var _useState3 = useState(''), error = _useState3[0], setError = _useState3[1];
		var _useState4 = useState(false), saving = _useState4[0], setSaving = _useState4[1];
		var _useState5 = useState(true), loading = _useState5[0], setLoading = _useState5[1];

		useEffect(function () {
			apiFetch({ path: '/nova-form/v1/settings' }).then(function (res) {
				if (res && res.data) {
					setState(Object.assign({}, defaultState, res.data));
				}
				setLoading(false);
			}).catch(function () {
				setError('Unable to load settings.');
				setLoading(false);
			});
		}, []);

		function update(key, value) {
			var next = {};
			next[key] = value;
			setState(Object.assign({}, state, next));
		}

		function save() {
			setMsg('');
			setError('');
			setSaving(true);
			apiFetch({ path: '/nova-form/v1/settings', method: 'POST', data: state }).then(function () {
				setMsg('Settings saved successfully.');
				setSaving(false);
			}).catch(function () {
				setError('Unable to save settings.');
				setSaving(false);
			});
		}

		if (loading) {
			return el('div', { className: 'nova-settings-page' },
				el('div', { className: 'nova-settings-loading' },
					el('div', { className: 'nova-settings-spinner' }),
					el('p', null, 'Loading settings...')
				)
			);
		}

		var tabs = [
			{ name: 'form', title: 'Form Behavior', icon: null },
			{ name: 'notifications', title: 'Notifications', icon: null },
			{ name: 'integrations', title: 'Integrations', icon: null },
			{ name: 'security', title: 'Security & Privacy', icon: null },
			{ name: 'appearance', title: 'Appearance', icon: null }
		];

		return el('div', { className: 'nova-settings-page' },
			el('div', { className: 'nova-settings-header' },
				el('div', { className: 'nova-settings-header__content' },
					el('div', { className: 'nova-settings-header__icon' }, IconSettings),
					el('div', null,
						el('h2', null, 'Global Settings'),
						el('p', null, 'Configure default behavior, notifications, integrations, and design.')
					)
				),
				el(Button, {
					variant: 'primary',
					className: 'nova-settings-save-btn',
					onClick: save,
					disabled: saving
				}, el('span', { className: 'nova-btn-icon' }, IconSave), saving ? 'Saving...' : 'Save Settings')
			),
			error ? el(Notice, { status: 'error', isDismissible: true, className: 'nova-settings-notice', onRemove: function () { setError(''); } }, error) : null,
			msg ? el(Notice, { status: 'success', isDismissible: true, className: 'nova-settings-notice', onRemove: function () { setMsg(''); } }, msg) : null,
			el(TabPanel, {
				className: 'nova-settings-tabs',
				activeClass: 'is-active',
				tabs: tabs
			}, function (tab) {
				if (tab.name === 'form') {
					return el('div', { className: 'nova-settings-card' },
						el('h3', { className: 'nova-settings-card__title' }, 'Default Form Behavior'),
						el('p', { className: 'nova-settings-card__desc' }, 'These defaults apply to all new forms unless overridden per-form.'),
						el('div', { className: 'nova-settings-grid' },
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Submit Button Label',
									help: 'Default text shown on the submit button.',
									value: state.submit_button_label || 'Submit',
									onChange: function (v) { update('submit_button_label', v); }
								})
							),
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Success Message',
									help: 'Shown after a successful submission.',
									value: state.success_message || '',
									onChange: function (v) { update('success_message', v); }
								})
							),
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Error Message',
									help: 'Shown when validation fails.',
									value: state.error_message || '',
									onChange: function (v) { update('error_message', v); }
								})
							)
						),
						el('div', { className: 'nova-settings-toggles' },
							el(ToggleControl, {
								label: 'Store Form Submissions',
								help: 'Save submissions in the database for review.',
								checked: !!state.store_submissions,
								onChange: function (v) { update('store_submissions', v); }
							})
						)
					);
				}

				if (tab.name === 'notifications') {
					return el('div', { className: 'nova-settings-card' },
						el('h3', { className: 'nova-settings-card__title' }, 'Email Notifications'),
						el('p', { className: 'nova-settings-card__desc' }, 'Configure email alerts for new form submissions.'),
						el('div', { className: 'nova-settings-toggles' },
							el(ToggleControl, {
								label: 'Enable Email Notifications',
								help: 'Send an email alert on each submission.',
								checked: !!state.enable_email_notifications,
								onChange: function (v) { update('enable_email_notifications', v); }
							})
						),
						state.enable_email_notifications ? el('div', { className: 'nova-settings-grid' },
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'From Name',
									help: 'Sender name in notification emails.',
									value: state.email_from_name || '',
									onChange: function (v) { update('email_from_name', v); }
								})
							),
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'From Email Address',
									help: 'Sender email address.',
									value: state.email_from_address || '',
									onChange: function (v) { update('email_from_address', v); }
								})
							),
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Recipient Email',
									help: 'Where to send notification emails. Leave empty for admin email.',
									value: state.email_recipient || '',
									onChange: function (v) { update('email_recipient', v); }
								})
							),
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Email Subject',
									help: 'Subject line for notification emails.',
									value: state.email_subject || '',
									onChange: function (v) { update('email_subject', v); }
								})
							)
						) : null
					);
				}

				if (tab.name === 'integrations') {
					return el('div', { className: 'nova-settings-card' },
						el('h3', { className: 'nova-settings-card__title' }, 'Webhook Integration'),
						el('p', { className: 'nova-settings-card__desc' }, 'Send submission data to an external webhook endpoint.'),
						el('div', { className: 'nova-settings-toggles' },
							el(ToggleControl, {
								label: 'Enable Webhook',
								help: 'POST submission data to the URL below on each submission.',
								checked: !!state.enable_webhook,
								onChange: function (v) { update('enable_webhook', v); }
							})
						),
						state.enable_webhook ? el('div', { className: 'nova-settings-grid' },
							el('div', { className: 'nova-settings-field nova-settings-field--full' },
								el(TextControl, {
									label: 'Webhook URL',
									help: 'Full URL to send submission payload.',
									value: state.webhook_url || '',
									onChange: function (v) { update('webhook_url', v); }
								})
							)
						) : null
					);
				}

				if (tab.name === 'security') {
					return el('div', { className: 'nova-settings-card' },
						el('h3', { className: 'nova-settings-card__title' }, 'Security & Privacy'),
						el('p', { className: 'nova-settings-card__desc' }, 'Control spam protection, rate limiting, and data retention.'),
						el('div', { className: 'nova-settings-toggles' },
							el(ToggleControl, {
								label: 'Enable Honeypot Spam Protection',
								help: 'Add an invisible field to catch spam bots.',
								checked: !!state.enable_honeypot,
								onChange: function (v) { update('enable_honeypot', v); }
							}),
							el(ToggleControl, {
								label: 'Enable Rate Limiting',
								help: 'Limit submissions per IP to prevent abuse.',
								checked: !!state.enable_rate_limiting,
								onChange: function (v) { update('enable_rate_limiting', v); }
							})
						),
						state.enable_rate_limiting ? el('div', { className: 'nova-settings-grid' },
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Max Submissions per Minute',
									type: 'number',
									help: 'Maximum submissions from a single IP per minute.',
									value: String(state.rate_limit_max || 10),
									onChange: function (v) { update('rate_limit_max', parseInt(v, 10) || 10); }
								})
							)
						) : null,
						el('div', { className: 'nova-settings-grid', style: { marginTop: '16px' } },
							el('div', { className: 'nova-settings-field' },
								el(TextControl, {
									label: 'Data Retention (Days)',
									type: 'number',
									help: 'Auto-delete submissions older than this many days. 0 = keep forever.',
									value: String(state.data_retention_days || 0),
									onChange: function (v) { update('data_retention_days', parseInt(v, 10) || 0); }
								})
							)
						)
					);
				}

				// Appearance tab
				return el('div', { className: 'nova-settings-card' },
					el('h3', { className: 'nova-settings-card__title' }, 'Appearance'),
					el('p', { className: 'nova-settings-card__desc' }, 'Set the default style applied to all forms.'),
					el('div', { className: 'nova-settings-grid' },
						el('div', { className: 'nova-settings-field' },
							el(SelectControl, {
								label: 'Style Preset',
								help: 'Applies a visual theme to frontend forms.',
								value: state.style_preset || 'modern',
								options: [
									{ label: 'Modern', value: 'modern' },
									{ label: 'Classic', value: 'classic' },
									{ label: 'Minimal', value: 'minimal' }
								],
								onChange: function (v) { update('style_preset', v); }
							})
						)
					),
					el('div', { className: 'nova-settings-preview' },
						el('h4', null, 'Preview'),
						el('div', { className: 'nova-settings-preview__demo nova-style-' + (state.style_preset || 'modern') },
							el('div', { className: 'nova-settings-preview__field' },
								el('label', null, 'Sample Field'),
								el('input', { type: 'text', placeholder: 'Enter text...', readOnly: true })
							),
							el('button', { className: 'nova-settings-preview__btn' }, state.submit_button_label || 'Submit')
						)
					)
				);
			})
		);
	}

	var root = document.getElementById('nova-form-builder-settings-root');
	if (root) {
		wp.element.render(el(App), root);
	}
})(window.wp);
