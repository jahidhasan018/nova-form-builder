( function ( wp ) {
	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var useEffect = wp.element.useEffect;
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
		{ type: 'tel', label: 'Phone' },
	];

	function uid() {
		return 'field_' + Math.random().toString( 36 ).slice( 2, 10 );
	}

	function App() {
		var _useState = useState( [] ), forms = _useState[0], setForms = _useState[1];
		var _useState2 = useState( { id: 0, name: 'Contact Form', fields: [] } ), form = _useState2[0], setForm = _useState2[1];
		var _useState3 = useState( '' ), msg = _useState3[0], setMsg = _useState3[1];

		apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderAdmin.nonce ) );
		apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderAdmin.root.replace( '/nova-form/v1', '/' ) ) );

		useEffect( function () {
			apiFetch( { path: '/nova-form/v1/forms' } ).then( function (res) {
				if ( res && res.data ) { setForms( res.data ); }
			} );
		}, [] );

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
			apiFetch( {
				path: '/nova-form/v1/forms',
				method: 'POST',
				data: form,
			} ).then( function (res) {
				setMsg( 'Form saved. Shortcode: [nova_form id="' + res.data.id + '"]' );
				setForm( Object.assign( {}, form, { id: res.data.id } ) );
				return apiFetch( { path: '/nova-form/v1/forms' } );
			} ).then( function (listRes){
				if ( listRes && listRes.data ) { setForms( listRes.data ); }
			} );
		}

		function updateField( index, key, value ) {
			var nextFields = form.fields.slice();
			nextFields[ index ] = Object.assign( {}, nextFields[ index ], ( function(){ var o = {}; o[ key ] = value; return o; } )() );
			setForm( Object.assign( {}, form, { fields: nextFields } ) );
		}

		return el( 'div', { className: 'nova-builder' },
			el( 'div', { className: 'nova-builder__panel' },
				el( 'h2', null, 'Fields' ),
				fieldLibrary.map( function (field) {
					return el( 'div', {
						key: field.type,
						className: 'nova-builder__field',
						onClick: function () { addField( field ); }
					}, '+ ' + field.label );
				} ),
				el( 'hr' ),
				el( 'h2', null, 'Forms' ),
				forms.map( function (saved) {
					return el( Button, {
						key: saved.id,
						variant: 'secondary',
						onClick: function(){ setForm( saved ); setMsg( '' ); },
						style: { display: 'block', marginBottom: '8px' }
					}, saved.name + ' (#' + saved.id + ')' );
				} )
			),
			el( 'div', { className: 'nova-builder__canvas' },
				el( TextControl, {
					label: 'Form Name',
					value: form.name,
					onChange: function ( value ) { setForm( Object.assign( {}, form, { name: value } ) ); }
				} ),
				form.fields.map( function (field, index) {
					return el( 'div', { className: 'nova-builder__field', key: field.id },
						el( 'div', { className: 'nova-builder__row' },
							el( TextControl, {
								label: 'Label',
								value: field.label,
								onChange: function( value ){ updateField( index, 'label', value ); }
							} ),
							el( TextControl, {
								label: 'Name',
								value: field.name,
								onChange: function( value ){ updateField( index, 'name', value ); }
							} )
						),
						el( 'div', { className: 'nova-builder__row' },
							el( SelectControl, {
								label: 'Width',
								value: field.width,
								options: [ { label: '50%', value: '50' }, { label: '100%', value: '100' } ],
								onChange: function( value ){ updateField( index, 'width', value ); }
							} ),
							el( ToggleControl, {
								label: 'Required',
								checked: !! field.required,
								onChange: function( value ){ updateField( index, 'required', value ); }
							} )
						)
					);
				} ),
				el( Button, { variant: 'primary', onClick: saveForm }, 'Save Form' ),
				msg ? el( 'p', null, msg ) : null
			)
		);
	}

	wp.element.render( el( App ), document.getElementById( 'nova-form-builder-admin-root' ) );
} )( window.wp );
