( function ( wp ) {
	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useMemo = wp.element.useMemo;
	var useState = wp.element.useState;
	var Button = wp.components.Button;
	var Notice = wp.components.Notice;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var SelectControl = wp.components.SelectControl;
	var Spinner = wp.components.Spinner;
	var apiFetch = wp.apiFetch;

	var fieldLibrary = [
		{ type: 'text', label: 'Text' },
		{ type: 'email', label: 'Email' },
		{ type: 'textarea', label: 'Textarea' },
		{ type: 'number', label: 'Number' },
		{ type: 'tel', label: 'Phone' }
	];

	function uid() {
		return 'field_' + Math.random().toString( 36 ).slice( 2, 10 );
	}

	function normalizeField( field, index ) {
		var type = ( field && field.type ) ? String( field.type ) : 'text';
		return {
			id: field && field.id ? String( field.id ) : uid(),
			type: type,
			label: field && field.label ? String( field.label ) : 'Field ' + ( index + 1 ),
			name: field && field.name ? String( field.name ) : type + '_' + Date.now() + '_' + index,
			required: !! ( field && field.required ),
			width: ( field && String( field.width ) === '50' ) ? '50' : '100'
		};
	}

	function emptyForm() {
		return { id: 0, name: 'Contact Form', fields: [], settings: {} };
	}

	function normalizeForm( maybeForm ) {
		if ( ! maybeForm || typeof maybeForm !== 'object' ) {
			return emptyForm();
		}
		return {
			id: maybeForm.id ? Number( maybeForm.id ) : 0,
			name: maybeForm.name ? String( maybeForm.name ) : 'Untitled Form',
			settings: maybeForm.settings && typeof maybeForm.settings === 'object' ? maybeForm.settings : {},
			fields: Array.isArray( maybeForm.fields ) ? maybeForm.fields.map( normalizeField ) : []
		};
	}

	apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderForms.nonce ) );
	apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderForms.root.replace( '/nova-form/v1', '/' ) ) );

	function App() {
		var _useState = useState( [] ), forms = _useState[0], setForms = _useState[1];
		var _useState2 = useState( emptyForm() ), form = _useState2[0], setForm = _useState2[1];
		var _useState3 = useState( true ), loading = _useState3[0], setLoading = _useState3[1];
		var _useState4 = useState( false ), saving = _useState4[0], setSaving = _useState4[1];
		var _useState5 = useState( '' ), error = _useState5[0], setError = _useState5[1];
		var _useState6 = useState( '' ), success = _useState6[0], setSuccess = _useState6[1];

		function load() {
			setLoading( true );
			return apiFetch( { path: '/nova-form/v1/forms' } ).then( function (res) {
				var data = ( res && res.data && Array.isArray( res.data ) ) ? res.data : [];
				setForms( data );
				setLoading( false );
			} ).catch( function () {
				setError( 'Unable to load forms.' );
				setLoading( false );
			} );
		}

		useEffect( function () {
			load();
		}, [] );

		function resetBuilder() {
			setSuccess( '' );
			setError( '' );
			setForm( emptyForm() );
		}

		function editForm( id ) {
			setSuccess( '' );
			setError( '' );
			apiFetch( { path: '/nova-form/v1/forms/' + id } ).then( function (res) {
				setForm( normalizeForm( res && res.data ) );
			} ).catch( function () {
				setError( 'Unable to load this form for editing.' );
			} );
		}

		function createNewForm() {
			setMsg( '' );
			setForm( emptyForm() );
		}

		function editForm( id ) {
			setMsg( '' );
			apiFetch( { path: '/nova-form/v1/forms/' + id } ).then( function (res) {
				if ( res && res.data ) {
					setForm( res.data );
				}
			} );
		}

		function remove( id ) {
			if ( ! window.confirm( 'Delete this form?' ) ) {
				return;
			}
			setError( '' );
			setSuccess( '' );
			apiFetch( { path: '/nova-form/v1/forms/' + id, method: 'DELETE' } ).then( function () {
				if ( form.id === id ) {
					setForm( emptyForm() );
				}
				setSuccess( 'Form deleted.' );
				load();
			} ).catch( function () {
				setError( 'Unable to delete form.' );
			} );
		}

		function addField( template ) {
			var next = normalizeField( {
				type: template.type,
				label: template.label,
				name: template.type + '_' + Date.now()
			}, form.fields.length );
			setForm( Object.assign( {}, form, { fields: form.fields.concat( [ next ] ) } ) );
		}

		function removeField( index ) {
			var nextFields = form.fields.filter( function ( _field, i ) {
				return i !== index;
			} );
			setForm( Object.assign( {}, form, { fields: nextFields } ) );
		}

		function saveForm() {
			if ( ! form.name || ! form.name.trim() ) {
				setError( 'Form name is required.' );
				return;
			}
			setSaving( true );
			setError( '' );
			setSuccess( '' );
			apiFetch( { path: '/nova-form/v1/forms', method: 'POST', data: form } ).then( function (res) {
				var id = res && res.data ? res.data.id : 0;
				setForm( Object.assign( {}, form, { id: id } ) );
				setSuccess( 'Form saved. Shortcode: [nova_form id="' + id + '"]' );
				setSaving( false );
				load();
			} ).catch( function () {
				setError( 'Unable to save form.' );
				setSaving( false );
			} );
		}

		function updateField( index, key, value ) {
			var nextFields = form.fields.slice();
			nextFields[ index ] = Object.assign( {}, nextFields[ index ], ( function () { var o = {}; o[ key ] = value; return o; } )() );
			setForm( Object.assign( {}, form, { fields: nextFields } ) );
		}

		function moveField( index, direction ) {
			var nextFields = form.fields.slice();
			var target = index + direction;
			if ( target < 0 || target >= nextFields.length ) {
				return;
			}
			var temp = nextFields[ target ];
			nextFields[ target ] = nextFields[ index ];
			nextFields[ index ] = temp;
			setForm( Object.assign( {}, form, { fields: nextFields } ) );
		}

		var formTitle = useMemo( function () {
			return form.id ? 'Editing: ' + form.name : 'Create New Form';
		}, [ form.id, form.name ] );

		return el( 'div', { className: 'nova-admin-page' },
			el( 'div', { className: 'nova-admin-header' },
				el( 'h2', null, 'Forms Dashboard' ),
				el( 'p', null, 'Manage forms and edit structure in one screen.' ),
				el( Button, { variant: 'primary', onClick: resetBuilder }, 'Add New Form' )
			),
			error ? el( Notice, { status: 'error', isDismissible: true, onRemove: function(){ setError( '' ); } }, error ) : null,
			success ? el( Notice, { status: 'success', isDismissible: true, onRemove: function(){ setSuccess( '' ); } }, success ) : null,
			el( 'div', { className: 'nova-card' },
				loading ? el( Spinner ) : el( 'table', { className: 'widefat striped nova-table' },
					el( 'thead', null, el( 'tr', null,
						el( 'th', null, 'ID' ),
						el( 'th', null, 'Name' ),
						el( 'th', null, 'Entries' ),
						el( 'th', null, 'Actions' )
					) ),
					el( 'tbody', null,
						forms.length === 0 ? el( 'tr', null, el( 'td', { colSpan: 4 }, 'No forms yet. Create your first form below.' ) ) : forms.map( function (savedForm) {
							return el( 'tr', { key: savedForm.id },
								el( 'td', null, '#' + savedForm.id ),
								el( 'td', null, savedForm.name ),
								el( 'td', null, savedForm.entries_count || 0 ),
								el( 'td', null,
									el( Button, { variant: 'secondary', onClick: function () { editForm( savedForm.id ); }, style: { marginRight: '8px' } }, 'Edit' ),
									el( Button, { isDestructive: true, onClick: function () { remove( savedForm.id ); } }, 'Delete' )
								)
							);
						} )
					)
				)
			),
			el( 'h3', { className: 'nova-section-title' }, formTitle ),
			el( 'div', { className: 'nova-builder' },
				el( 'div', { className: 'nova-builder__panel' },
					el( 'h4', null, 'Field Library' ),
					fieldLibrary.map( function (field) {
						return el( 'div', { key: field.type, className: 'nova-builder__field nova-builder__field--selector', onClick: function () { addField( field ); } }, '+ ' + field.label );
					} )
				),
				el( 'div', { className: 'nova-builder__canvas' },
					el( TextControl, { label: 'Form Name', value: form.name, onChange: function ( value ) { setForm( Object.assign( {}, form, { name: value } ) ); } } ),
					form.fields.length === 0 ? el( 'p', { className: 'nova-muted' }, 'Add fields from the left panel to begin building.' ) : null,
					form.fields.map( function (field, index) {
						return el( 'div', { className: 'nova-builder__field', key: field.id },
							el( 'strong', null, field.type.toUpperCase() ),
							el( 'div', { style: { float: 'right', display: 'flex', gap: '6px' } },
								el( Button, { isSmall: true, onClick: function () { moveField( index, -1 ); } }, '↑' ),
								el( Button, { isSmall: true, onClick: function () { moveField( index, 1 ); } }, '↓' ),
								el( Button, { isSmall: true, isDestructive: true, onClick: function () { removeField( index ); } }, 'Remove' )
							),
							el( 'div', { className: 'nova-builder__row' },
								el( TextControl, { label: 'Label', value: field.label, onChange: function ( value ) { updateField( index, 'label', value ); } } ),
								el( TextControl, { label: 'Name', value: field.name, onChange: function ( value ) { updateField( index, 'name', value ); } } )
							),
							el( 'div', { className: 'nova-builder__row' },
								el( SelectControl, { label: 'Width', value: field.width, options: [ { label: '50%', value: '50' }, { label: '100%', value: '100' } ], onChange: function ( value ) { updateField( index, 'width', value ); } } ),
								el( ToggleControl, { label: 'Required', checked: !! field.required, onChange: function ( value ) { updateField( index, 'required', value ); } } )
							)
						);
					} ),
					el( Button, { variant: 'primary', onClick: saveForm, disabled: saving }, saving ? 'Saving...' : ( form.id ? 'Update Form' : 'Save Form' ) )
				)
			)
		);
	}

	var root = document.getElementById( 'nova-form-builder-forms-root' );
	if ( root ) {
		wp.element.render( el( App ), root );
	}
} )( window.wp );
