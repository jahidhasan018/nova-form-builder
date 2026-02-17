( function ( wp ) {
	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useState = wp.element.useState;
	var Button = wp.components.Button;
	var apiFetch = wp.apiFetch;

	apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderForms.nonce ) );
	apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderForms.root.replace( '/nova-form/v1', '/' ) ) );

	function App() {
		var _useState = useState( [] ), forms = _useState[0], setForms = _useState[1];
		function load() {
			apiFetch( { path: '/nova-form/v1/forms' } ).then( function (res) {
				setForms( ( res && res.data ) ? res.data : [] );
			} );
		}
		useEffect( load, [] );

		function remove( id ) {
			apiFetch( { path: '/nova-form/v1/forms/' + id, method: 'DELETE' } ).then( load );
		}

		return el( 'div', null,
			el( Button, {
				variant: 'primary',
				onClick: function () { window.location.href = window.NovaFormBuilderForms.builderUrl; },
				style: { marginBottom: '12px' }
			}, 'Add New Form' ),
			el( 'table', { className: 'widefat striped' },
				el( 'thead', null, el( 'tr', null,
					el( 'th', null, 'ID' ),
					el( 'th', null, 'Name' ),
					el( 'th', null, 'Entries' ),
					el( 'th', null, 'Actions' )
				) ),
				el( 'tbody', null,
					forms.map( function (form) {
						return el( 'tr', { key: form.id },
							el( 'td', null, '#' + form.id ),
							el( 'td', null, form.name ),
							el( 'td', null, form.entries_count || 0 ),
							el( 'td', null,
								el( Button, {
									variant: 'secondary',
									onClick: function () { window.location.href = window.NovaFormBuilderForms.builderUrl + '&form_id=' + form.id; },
									style: { marginRight: '8px' }
								}, 'Edit' ),
								el( Button, {
									isDestructive: true,
									onClick: function () { remove( form.id ); }
								}, 'Delete' )
							)
						);
					} )
				)
			)
		);
	}

	wp.element.render( el( App ), document.getElementById( 'nova-form-builder-forms-root' ) );
} )( window.wp );
