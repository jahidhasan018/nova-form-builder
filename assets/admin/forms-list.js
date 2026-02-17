( function ( wp ) {
	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useState = wp.element.useState;
	var Button = wp.components.Button;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var SelectControl = wp.components.SelectControl;
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

	function emptyForm() {
		return { id: 0, name: 'Contact Form', fields: [] };
	}

	apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderForms.nonce ) );
	apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderForms.root.replace( '/nova-form/v1', '/' ) ) );

	function App() {
		var _useState = useState( [] ), forms = _useState[0], setForms = _useState[1];
		var _useState2 = useState( emptyForm() ), form = _useState2[0], setForm = _useState2[1];
		var _useState3 = useState( '' ), msg = _useState3[0], setMsg = _useState3[1];

		function load() {
			apiFetch( { path: '/nova-form/v1/forms' } ).then( function (res) {
				setForms( ( res && res.data ) ? res.data : [] );
			} );
		}

		useEffect( load, [] );

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
			apiFetch( { path: '/nova-form/v1/forms/' + id, method: 'DELETE' } ).then( function () {
				if ( form.id === id ) {
					setForm( emptyForm() );
				}
				setMsg( 'Form deleted.' );
				load();
			} );
		}

		function addField( template ) {
			var next = {
				id: uid(),
				type: template.type,
				label: template.label,
				name: template.type + '_' + Date.now(),
				required: false,
				width: '100'
			};
			setForm( Object.assign( {}, form, { fields: form.fields.concat( [ next ] ) } ) );
		}

		function saveForm() {
			apiFetch( { path: '/nova-form/v1/forms', method: 'POST', data: form } ).then( function (res) {
				setMsg( 'Form saved. Shortcode: [nova_form id="' + res.data.id + '"]' );
				setForm( Object.assign( {}, form, { id: res.data.id } ) );
				load();
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

		return el( 'div', null,
			el( 'h2', null, 'Add Form' ),
			el( 'p', null, 'Create, edit, and delete forms without leaving this page.' ),
			el( Button, {
				variant: 'primary',
				onClick: createNewForm,
				style: { marginBottom: '12px' }
			}, 'Add New Form' ),
			el( 'table', { className: 'widefat striped', style: { marginBottom: '24px' } },
				el( 'thead', null, el( 'tr', null,
					el( 'th', null, 'ID' ),
					el( 'th', null, 'Name' ),
					el( 'th', null, 'Entries' ),
					el( 'th', null, 'Actions' )
				) ),
				el( 'tbody', null,
					forms.map( function (savedForm) {
						return el( 'tr', { key: savedForm.id },
							el( 'td', null, '#' + savedForm.id ),
							el( 'td', null, savedForm.name ),
							el( 'td', null, savedForm.entries_count || 0 ),
							el( 'td', null,
								el( Button, {
									variant: 'secondary',
									onClick: function () { editForm( savedForm.id ); },
									style: { marginRight: '8px' }
								}, 'Edit' ),
								el( Button, {
									isDestructive: true,
									onClick: function () { remove( savedForm.id ); }
								}, 'Delete' )
							)
						);
					} )
				)
			),
			el( 'div', { className: 'nova-builder' },
				el( 'div', { className: 'nova-builder__panel' },
					el( 'h2', null, 'Fields' ),
					fieldLibrary.map( function (field) {
						return el( 'div', { key: field.type, className: 'nova-builder__field', onClick: function () { addField( field ); } }, '+ ' + field.label );
					} )
				),
				el( 'div', { className: 'nova-builder__canvas' },
					el( TextControl, { label: 'Form Name', value: form.name, onChange: function ( value ) { setForm( Object.assign( {}, form, { name: value } ) ); } } ),
					form.fields.map( function (field, index) {
						return el( 'div', { className: 'nova-builder__field', key: field.id },
							el( 'strong', null, field.type.toUpperCase() ),
							el( 'div', { style: { float: 'right' } },
								el( Button, { isSmall: true, onClick: function () { moveField( index, -1 ); } }, '↑' ),
								el( Button, { isSmall: true, onClick: function () { moveField( index, 1 ); } }, '↓' )
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
					el( Button, { variant: 'primary', onClick: saveForm }, form.id ? 'Update Form' : 'Save Form' ),
					msg ? el( 'p', null, msg ) : null
				)
			)
		);
	}

	var root = document.getElementById( 'nova-form-builder-forms-root' );
	if ( root ) {
		wp.element.render( el( App ), root );
	}
} )( window.wp );
