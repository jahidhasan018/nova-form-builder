( function ( wp ) {
	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var useEffect = wp.element.useEffect;
	var Button = wp.components.Button;
	var TabPanel = wp.components.TabPanel;
	var ToggleControl = wp.components.ToggleControl;
	var TextControl = wp.components.TextControl;
	var SelectControl = wp.components.SelectControl;
	var apiFetch = wp.apiFetch;

	apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderSettings.nonce ) );
	apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderSettings.root.replace( '/nova-form/v1', '/' ) ) );

	function App() {
		var _useState = useState( { enable_webhook: false, webhook_url: '', enable_email_notifications: true, style_preset: 'classic', enable_honeypot: true, success_message: 'Thanks for submitting the form.', submit_button_label: 'Submit', store_submissions: true } ), state = _useState[0], setState = _useState[1];
		var _useState2 = useState( '' ), msg = _useState2[0], setMsg = _useState2[1];

		useEffect( function () {
			apiFetch( { path: '/nova-form/v1/settings' } ).then( function (res) {
				if ( res && res.data ) { setState( res.data ); }
			} );
		}, [] );

		function save() {
			apiFetch( { path: '/nova-form/v1/settings', method: 'POST', data: state } ).then( function () {
				setMsg( 'Settings saved.' );
			} );
		}

		return el( 'div', null,
			el( TabPanel, { className: 'nova-settings-tabs', tabs: [
				{ name: 'general', title: 'General' },
				{ name: 'form', title: 'Form Behavior' },
				{ name: 'integrations', title: 'Integrations' },
				{ name: 'styles', title: 'Styles' }
			] }, function ( tab ) {
				if ( tab.name === 'general' ) {
					return el( 'div', null,
						el( ToggleControl, {
							label: 'Enable Email Notifications',
							checked: !! state.enable_email_notifications,
							onChange: function (value){ setState( Object.assign( {}, state, { enable_email_notifications: value } ) ); }
						} )
					);
				}
				if ( tab.name === 'form' ) {
					return el( 'div', null,
						el( TextControl, {
							label: 'Submit Button Label',
							value: state.submit_button_label || 'Submit',
							onChange: function (value){ setState( Object.assign( {}, state, { submit_button_label: value } ) ); }
						} ),
						el( TextControl, {
							label: 'Success Message',
							value: state.success_message || '',
							onChange: function (value){ setState( Object.assign( {}, state, { success_message: value } ) ); }
						} ),
						el( ToggleControl, {
							label: 'Enable Honeypot Spam Protection',
							checked: !! state.enable_honeypot,
							onChange: function (value){ setState( Object.assign( {}, state, { enable_honeypot: value } ) ); }
						} ),
						el( ToggleControl, {
							label: 'Store Form Submissions',
							checked: !! state.store_submissions,
							onChange: function (value){ setState( Object.assign( {}, state, { store_submissions: value } ) ); }
						} )
					);
				}
				if ( tab.name === 'integrations' ) {
					return el( 'div', null,
						el( ToggleControl, {
							label: 'Enable Webhook',
							checked: !! state.enable_webhook,
							onChange: function (value){ setState( Object.assign( {}, state, { enable_webhook: value } ) ); }
						} ),
						el( TextControl, {
							label: 'Webhook URL',
							value: state.webhook_url || '',
							onChange: function (value){ setState( Object.assign( {}, state, { webhook_url: value } ) ); }
						} )
					);
				}
				return el( 'div', null,
					el( SelectControl, {
						label: 'Preset Style',
						value: state.style_preset || 'classic',
						options: [
							{ label: 'Classic', value: 'classic' },
							{ label: 'Modern', value: 'modern' },
							{ label: 'Minimal', value: 'minimal' }
						],
						onChange: function (value){ setState( Object.assign( {}, state, { style_preset: value } ) ); }
					} )
				);
			} ),
			el( Button, { variant: 'primary', onClick: save }, 'Save Settings' ),
			msg ? el( 'p', null, msg ) : null
		);
	}

	var root = document.getElementById( 'nova-form-builder-settings-root' );
	if ( root ) {
		wp.element.render( el( App ), root );
	}
} )( window.wp );
