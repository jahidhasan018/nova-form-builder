( function ( wp ) {
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

	var defaultState = {
		enable_webhook: false,
		webhook_url: '',
		enable_email_notifications: true,
		email_from_name: 'Nova Forms',
		email_from_address: '',
		submit_button_label: 'Submit',
		success_message: 'Thanks for submitting the form.',
		enable_honeypot: true,
		store_submissions: true,
		style_preset: 'modern'
	};

	apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderSettings.nonce ) );
	apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderSettings.root.replace( '/nova-form/v1', '/' ) ) );

	function App() {
		var _useState = useState( defaultState ), state = _useState[0], setState = _useState[1];
		var _useState2 = useState( '' ), msg = _useState2[0], setMsg = _useState2[1];
		var _useState3 = useState( '' ), error = _useState3[0], setError = _useState3[1];

		useEffect( function () {
			apiFetch( { path: '/nova-form/v1/settings' } ).then( function (res) {
				if ( res && res.data ) {
					setState( Object.assign( {}, defaultState, res.data ) );
				}
			} ).catch( function () {
				setError( 'Unable to load settings.' );
			} );
		}, [] );

		function save() {
			setMsg( '' );
			setError( '' );
			apiFetch( { path: '/nova-form/v1/settings', method: 'POST', data: state } ).then( function () {
				setMsg( 'Settings saved successfully.' );
			} ).catch( function () {
				setError( 'Unable to save settings.' );
			} );
		}

		return el( 'div', { className: 'nova-settings-page' },
			el( 'div', { className: 'nova-settings-header' },
				el( 'h2', null, 'Form Settings' ),
				el( 'p', null, 'Configure behavior, notifications, integrations, and design defaults.' )
			),
			error ? el( Notice, { status: 'error', isDismissible: true, onRemove: function(){ setError( '' ); } }, error ) : null,
			msg ? el( Notice, { status: 'success', isDismissible: true, onRemove: function(){ setMsg( '' ); } }, msg ) : null,
			el( TabPanel, { className: 'nova-settings-tabs', tabs: [
				{ name: 'form', title: 'Form Behavior' },
				{ name: 'notifications', title: 'Notifications' },
				{ name: 'integrations', title: 'Integrations' },
				{ name: 'appearance', title: 'Appearance' }
			] }, function ( tab ) {
				if ( tab.name === 'form' ) {
					return el( 'div', { className: 'nova-settings-card' },
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

				if ( tab.name === 'notifications' ) {
					return el( 'div', { className: 'nova-settings-card' },
						el( ToggleControl, {
							label: 'Enable Email Notifications',
							checked: !! state.enable_email_notifications,
							onChange: function (value){ setState( Object.assign( {}, state, { enable_email_notifications: value } ) ); }
						} ),
						el( TextControl, {
							label: 'From Name',
							value: state.email_from_name || '',
							onChange: function (value){ setState( Object.assign( {}, state, { email_from_name: value } ) ); }
						} ),
						el( TextControl, {
							label: 'From Email Address',
							value: state.email_from_address || '',
							onChange: function (value){ setState( Object.assign( {}, state, { email_from_address: value } ) ); }
						} )
					);
				}

				if ( tab.name === 'integrations' ) {
					return el( 'div', { className: 'nova-settings-card' },
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

				return el( 'div', { className: 'nova-settings-card' },
					el( SelectControl, {
						label: 'Dashboard Style Preset',
						value: state.style_preset || 'modern',
						options: [
							{ label: 'Modern', value: 'modern' },
							{ label: 'Classic', value: 'classic' },
							{ label: 'Minimal', value: 'minimal' }
						],
						onChange: function (value){ setState( Object.assign( {}, state, { style_preset: value } ) ); }
					} )
				);
			} ),
			el( Button, { variant: 'primary', onClick: save }, 'Save Settings' )
		);
	}

	var root = document.getElementById( 'nova-form-builder-settings-root' );
	if ( root ) {
		wp.element.render( el( App ), root );
	}
} )( window.wp );
