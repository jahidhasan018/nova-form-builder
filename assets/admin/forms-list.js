( function ( wp ) {
	var el = wp.element.createElement;
	var useEffect = wp.element.useEffect;
	var useMemo = wp.element.useMemo;
	var useState = wp.element.useState;
	var Button = wp.components.Button;
	var Card = wp.components.Card;
	var CardBody = wp.components.CardBody;
	var Notice = wp.components.Notice;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var ToggleControl = wp.components.ToggleControl;
	var SelectControl = wp.components.SelectControl;
	var Spinner = wp.components.Spinner;
	var apiFetch = wp.apiFetch;

	var fieldLibrary = {
		basic: [
			{ type: 'text', label: 'Text' },
			{ type: 'email', label: 'Email' },
			{ type: 'textarea', label: 'Textarea' },
			{ type: 'number', label: 'Number' },
			{ type: 'tel', label: 'Phone' },
			{ type: 'url', label: 'URL' }
		],
		choice: [
			{ type: 'select', label: 'Select' },
			{ type: 'radio', label: 'Radio' },
			{ type: 'checkbox-group', label: 'Checkbox Group' },
			{ type: 'checkbox', label: 'Checkbox' }
		],
		advanced: [
			{ type: 'date', label: 'Date' },
			{ type: 'time', label: 'Time' },
			{ type: 'file', label: 'File Upload' },
			{ type: 'hidden', label: 'Hidden' },
			{ type: 'consent', label: 'Consent' },
			{ type: 'html', label: 'HTML Block' }
		]
	};

	function uid() {
		return 'field_' + Math.random().toString( 36 ).slice( 2, 10 );
	}

	function slugifyName( input ) {
		return String( input || '' ).toLowerCase().replace( /[^a-z0-9_]+/g, '_' ).replace( /^_+|_+$/g, '' );
	}

	function emptyForm() {
		return {
			id: 0,
			name: 'Contact Form',
			schema_version: 2,
			settings: {
				submit_label: 'Submit',
				success_message: 'Thanks for submitting the form.',
				error_message: 'Please fix the highlighted fields.',
				redirect_url: '',
				spam_honeypot: true,
				style_preset: 'modern'
			},
			fields: []
		};
	}

	function normalizeField( field, index ) {
		var type = ( field && field.type ) ? String( field.type ) : 'text';
		var label = field && field.label ? String( field.label ) : 'Field ' + ( index + 1 );
		return {
			id: field && field.id ? String( field.id ) : uid(),
			type: type,
			label: label,
			name: field && field.name ? String( field.name ) : slugifyName( label ) || type + '_' + index,
			placeholder: field && field.placeholder ? String( field.placeholder ) : '',
			help_text: field && field.help_text ? String( field.help_text ) : '',
			required: !! ( field && field.required ),
			default_value: field && field.default_value ? String( field.default_value ) : '',
			columns: [ 1, 2, 3 ].indexOf( Number( field && field.columns ) ) !== -1 ? Number( field.columns ) : 1,
			choices: Array.isArray( field && field.choices ) ? field.choices : [],
			html: field && field.html ? String( field.html ) : ''
		};
	}

	function normalizeForm( maybeForm ) {
		if ( !maybeForm || typeof maybeForm !== 'object' ) {
			return emptyForm();
		}
		var base = emptyForm();
		return {
			id: maybeForm.id ? Number( maybeForm.id ) : 0,
			name: maybeForm.name ? String( maybeForm.name ) : base.name,
			schema_version: maybeForm.schema_version ? Number( maybeForm.schema_version ) : 2,
			settings: Object.assign( {}, base.settings, maybeForm.settings || {} ),
			fields: Array.isArray( maybeForm.fields ) ? maybeForm.fields.map( normalizeField ) : []
		};
	}

	function cloneForm( form ) {
		return JSON.parse( JSON.stringify( form ) );
	}

	apiFetch.use( apiFetch.createNonceMiddleware( window.NovaFormBuilderForms.nonce ) );
	apiFetch.use( apiFetch.createRootURLMiddleware( window.NovaFormBuilderForms.root.replace( '/nova-form/v1', '/' ) ) );

	function App() {
		var _useState = useState( [] ), forms = _useState[0], setForms = _useState[1];
		var _useState2 = useState( emptyForm() ), form = _useState2[0], setForm = _useState2[1];
		var _useState3 = useState( null ), selectedId = _useState3[0], setSelectedId = _useState3[1];
		var _useState4 = useState( null ), dragId = _useState4[0], setDragId = _useState4[1];
		var _useState5 = useState( false ), loading = _useState5[0], setLoading = _useState5[1];
		var _useState6 = useState( false ), saving = _useState6[0], setSaving = _useState6[1];
		var _useState7 = useState( '' ), error = _useState7[0], setError = _useState7[1];
		var _useState8 = useState( '' ), success = _useState8[0], setSuccess = _useState8[1];
		var _useState9 = useState( '' ), preview = _useState9[0], setPreview = _useState9[1];
		var _useState10 = useState( emptyForm() ), baseline = _useState10[0], setBaseline = _useState10[1];
		var hasUnsaved = useMemo( function () {
			return JSON.stringify( form ) !== JSON.stringify( baseline );
		}, [ form, baseline ] );

		useEffect( function () {
			function onBeforeUnload( event ) {
				if ( hasUnsaved ) {
					event.preventDefault();
					event.returnValue = '';
				}
			}
			window.addEventListener( 'beforeunload', onBeforeUnload );
			return function () { window.removeEventListener( 'beforeunload', onBeforeUnload ); };
		}, [ hasUnsaved ] );

		function load() {
			setLoading( true );
			return apiFetch( { path: '/nova-form/v1/forms?per_page=100' } ).then( function (res) {
				setForms( ( res && res.data ) ? res.data : [] );
				setLoading( false );
			} ).catch( function () {
				setError( 'Unable to load forms.' );
				setLoading( false );
			} );
		}

		useEffect( function () { load(); }, [] );

		function resetBuilder() {
			setForm( emptyForm() );
			setBaseline( emptyForm() );
			setSelectedId( null );
			setPreview( '' );
			setError( '' );
			setSuccess( '' );
		}

		function openForm( id ) {
			if ( hasUnsaved && !window.confirm( 'You have unsaved changes. Continue?' ) ) {
				return;
			}
			setError( '' );
			apiFetch( { path: '/nova-form/v1/forms/' + id } ).then( function (res) {
				var next = normalizeForm( res && res.data );
				setForm( next );
				setBaseline( cloneForm( next ) );
				setSelectedId( next.fields[0] ? next.fields[0].id : null );
				setPreview( '' );
			} ).catch( function () {
				setError( 'Unable to open form.' );
			} );
		}

		function addField( template ) {
			var next = normalizeField( { type: template.type, label: template.label }, form.fields.length );
			setForm( Object.assign( {}, form, { fields: form.fields.concat( [ next ] ) } ) );
			setSelectedId( next.id );
		}

		function updateField( fieldId, key, value ) {
			setForm( Object.assign( {}, form, {
				fields: form.fields.map( function ( item ) {
					if ( item.id !== fieldId ) {
						return item;
					}
					var nextItem = Object.assign( {}, item, ( function () { var o = {}; o[key] = value; return o; }() ) );
					if ( key === 'label' && ! item.name ) {
						nextItem.name = slugifyName( value );
					}
					return nextItem;
				} )
			} ) );
		}

		function removeField( fieldId ) {
			setForm( Object.assign( {}, form, {
				fields: form.fields.filter( function ( item ) { return item.id !== fieldId; } )
			} ) );
			if ( selectedId === fieldId ) {
				setSelectedId( null );
			}
		}

		function duplicateField( fieldId ) {
			var idx = form.fields.findIndex( function ( item ) { return item.id === fieldId; } );
			if ( idx < 0 ) { return; }
			var source = form.fields[idx];
			var copy = Object.assign( {}, source, {
				id: uid(),
				name: source.name + '_copy'
			} );
			var nextFields = form.fields.slice();
			nextFields.splice( idx + 1, 0, copy );
			setForm( Object.assign( {}, form, { fields: nextFields } ) );
			setSelectedId( copy.id );
		}

		function reorderField( overId ) {
			if ( !dragId || !overId || dragId === overId ) {
				return;
			}
			var oldIndex = form.fields.findIndex( function ( item ) { return item.id === dragId; } );
			var newIndex = form.fields.findIndex( function ( item ) { return item.id === overId; } );
			if ( oldIndex < 0 || newIndex < 0 ) {
				return;
			}
			var nextFields = form.fields.slice();
			var moved = nextFields.splice( oldIndex, 1 )[0];
			nextFields.splice( newIndex, 0, moved );
			setForm( Object.assign( {}, form, { fields: nextFields } ) );
		}

		function validateBeforeSave() {
			var errors = [];
			var seen = {};
			form.fields.forEach( function ( field ) {
				if ( !field.name || !/^[a-z0-9_]+$/.test( field.name ) ) {
					errors.push( 'Field key "' + field.label + '" is invalid. Use lowercase letters, numbers, underscores.' );
				}
				if ( seen[field.name] ) {
					errors.push( 'Duplicate field key: ' + field.name );
				}
				seen[field.name] = true;
			} );
			if ( !form.name.trim() ) {
				errors.push( 'Form name is required.' );
			}
			return errors;
		}

		function saveForm() {
			var validationErrors = validateBeforeSave();
			if ( validationErrors.length ) {
				setError( validationErrors[0] );
				return;
			}
			setSaving( true );
			setError( '' );
			apiFetch( { path: '/nova-form/v1/forms', method: 'POST', data: form } ).then( function (res) {
				var id = res && res.data ? Number( res.data.id ) : 0;
				var next = Object.assign( {}, form, { id: id } );
				setForm( next );
				setBaseline( cloneForm( next ) );
				setSuccess( 'Form saved. Shortcode: [nova_form id="' + id + '"]' );
				setSaving( false );
				load();
			} ).catch( function (err) {
				setSaving( false );
				setError( err && err.message ? err.message : 'Unable to save form.' );
			} );
		}

		function deleteForm( id ) {
			if ( !window.confirm( 'Delete this form?' ) ) {
				return;
			}
			apiFetch( { path: '/nova-form/v1/forms/' + id, method: 'DELETE' } ).then( function () {
				if ( form.id === id ) {
					resetBuilder();
				}
				setSuccess( 'Form deleted.' );
				load();
			} );
		}

		function duplicateForm( id ) {
			apiFetch( { path: '/nova-form/v1/forms/' + id + '/duplicate', method: 'POST' } ).then( function () {
				setSuccess( 'Form duplicated.' );
				load();
			} ).catch( function () {
				setError( 'Unable to duplicate form.' );
			} );
		}

		function copyShortcode() {
			if ( !form.id ) {
				setError( 'Save the form first to copy shortcode.' );
				return;
			}
			navigator.clipboard.writeText( '[nova_form id="' + form.id + '"]' ).then( function () {
				setSuccess( 'Shortcode copied.' );
			} );
		}

		var selectedField = form.fields.find( function ( item ) { return item.id === selectedId; } ) || null;
		var formTitle = form.id ? 'Editing: ' + form.name : 'Create New Form';

		return el( 'div', { className: 'nova-admin-page' },
			el( 'div', { className: 'nova-admin-header' },
				el( 'div', null, el( 'h2', null, 'Nova Form Builder' ), el( 'p', null, hasUnsaved ? 'Unsaved changes' : 'All changes saved' ) ),
				el( 'div', { style: { display: 'flex', gap: '8px' } },
					el( Button, { variant: 'secondary', onClick: function(){ setPreview( preview ? '' : 'on' ); } }, preview ? 'Close Preview' : 'Preview Form' ),
					el( Button, { variant: 'secondary', onClick: copyShortcode }, 'Copy Shortcode' ),
					el( Button, { variant: 'primary', onClick: saveForm, disabled: saving }, saving ? 'Saving...' : 'Save Form' )
				)
			),
			error ? el( Notice, { status: 'error', isDismissible: true, onRemove: function(){ setError( '' ); } }, error ) : null,
			success ? el( Notice, { status: 'success', isDismissible: true, onRemove: function(){ setSuccess( '' ); } }, success ) : null,
			el( Card, null, el( CardBody, null,
				loading ? el( Spinner ) : el( 'table', { className: 'widefat striped nova-table' },
					el( 'thead', null, el( 'tr', null, el( 'th', null, 'Name' ), el( 'th', null, 'Entries' ), el( 'th', null, 'Actions' ) ) ),
					el( 'tbody', null, forms.length ? forms.map( function ( item ) {
						return el( 'tr', { key: item.id },
							el( 'td', null, item.name + ' (#' + item.id + ')' ),
							el( 'td', null, item.entries_count || 0 ),
							el( 'td', null,
								el( Button, { variant: 'secondary', onClick: function(){ openForm( item.id ); }, style:{ marginRight:'6px' } }, 'Edit' ),
								el( Button, { variant: 'secondary', onClick: function(){ duplicateForm( item.id ); }, style:{ marginRight:'6px' } }, 'Duplicate' ),
								el( Button, { isDestructive: true, onClick: function(){ deleteForm( item.id ); } }, 'Delete' )
							)
						);
					} ) : el( 'tr', null, el( 'td', { colSpan: 3 }, 'No forms found.' ) ) )
				)
			)),
			el( 'h3', { className: 'nova-section-title' }, formTitle ),
			el( TextControl, { label: 'Form Name', value: form.name, onChange: function(value){ setForm( Object.assign( {}, form, { name: value } ) ); } } ),
			preview ? el( 'div', { className: 'nova-card' },
				el( 'h4', null, 'Preview' ),
				el( 'p', null, 'This preview mirrors field order and labels.' ),
				form.fields.map( function ( field ) {
					return el( 'div', { key: field.id, style: { marginBottom: '8px' } }, el( 'strong', null, field.label ), el( 'div', null, field.type ) );
				} )
			) : null,
			el( 'div', { className: 'nova-builder' },
				el( 'aside', { className: 'nova-builder__panel' },
					el( 'h4', null, 'Basic' ),
					fieldLibrary.basic.map( function ( item ) {
						return el( 'div', { key: item.type, className: 'nova-builder__field nova-builder__field--selector', onClick: function(){ addField( item ); } }, '+ ' + item.label );
					} ),
					el( 'h4', null, 'Choice' ),
					fieldLibrary.choice.map( function ( item ) {
						return el( 'div', { key: item.type, className: 'nova-builder__field nova-builder__field--selector', onClick: function(){ addField( item ); } }, '+ ' + item.label );
					} ),
					el( 'h4', null, 'Advanced' ),
					fieldLibrary.advanced.map( function ( item ) {
						return el( 'div', { key: item.type, className: 'nova-builder__field nova-builder__field--selector', onClick: function(){ addField( item ); } }, '+ ' + item.label );
					} ),
					el( Button, { variant: 'secondary', onClick: resetBuilder, style: { marginTop: '10px' } }, 'New Form' )
				),
				el( 'main', { className: 'nova-builder__canvas' },
					form.fields.length ? form.fields.map( function ( field ) {
						return el( 'div', {
							key: field.id,
							className: 'nova-builder__field ' + ( selectedId === field.id ? 'is-selected' : '' ),
							draggable: true,
							onDragStart: function(){ setDragId( field.id ); },
							onDragOver: function(e){ e.preventDefault(); },
							onDrop: function(){ reorderField( field.id ); },
							onClick: function(){ setSelectedId( field.id ); }
						},
							el( 'div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
								el( 'div', null, el( 'strong', null, field.label || field.type ), el( 'div', { className: 'nova-muted' }, field.name ) ),
								el( 'div', { style: { display: 'flex', gap: '6px' } },
									el( Button, { isSmall: true, onClick: function(e){ e.stopPropagation(); duplicateField( field.id ); } }, 'Duplicate' ),
									el( Button, { isSmall: true, isDestructive: true, onClick: function(e){ e.stopPropagation(); removeField( field.id ); } }, 'Delete' )
								)
							)
						);
					} ) : el( 'p', { className: 'nova-muted' }, 'Drag fields from the library to start building.' )
				),
				el( 'aside', { className: 'nova-builder__panel' },
					el( 'h4', null, selectedField ? 'Field Inspector' : 'Form Settings' ),
					selectedField ? el( 'div', null,
						el( TextControl, { label: 'Label', value: selectedField.label, onChange: function(v){ updateField( selectedField.id, 'label', v ); } } ),
						el( TextControl, { label: 'Key', value: selectedField.name, onChange: function(v){ updateField( selectedField.id, 'name', slugifyName( v ) ); } } ),
						el( TextControl, { label: 'Placeholder', value: selectedField.placeholder || '', onChange: function(v){ updateField( selectedField.id, 'placeholder', v ); } } ),
						el( TextareaControl, { label: 'Help Text', value: selectedField.help_text || '', onChange: function(v){ updateField( selectedField.id, 'help_text', v ); } } ),
						el( SelectControl, { label: 'Columns', value: String( selectedField.columns || 1 ), options: [ {label:'1 Column', value:'1'}, {label:'2 Columns', value:'2'}, {label:'3 Columns', value:'3'} ], onChange: function(v){ updateField( selectedField.id, 'columns', Number( v ) ); } } ),
						el( ToggleControl, { label: 'Required', checked: !!selectedField.required, onChange: function(v){ updateField( selectedField.id, 'required', v ); } } ),
						[ 'select', 'radio', 'checkbox-group' ].indexOf( selectedField.type ) !== -1 ? el( TextareaControl, { label: 'Choices (one per line)', value: ( selectedField.choices || [] ).join( '\n' ), onChange: function(v){ updateField( selectedField.id, 'choices', v.split('\n').map(function(x){ return x.trim(); }).filter(Boolean) ); } } ) : null,
						selectedField.type === 'html' ? el( TextareaControl, { label: 'HTML Content', value: selectedField.html || '', onChange: function(v){ updateField( selectedField.id, 'html', v ); } } ) : null
					) : el( 'div', null,
						el( TextControl, { label: 'Submit Label', value: form.settings.submit_label || 'Submit', onChange: function(v){ setForm( Object.assign( {}, form, { settings: Object.assign( {}, form.settings, { submit_label: v } ) } ) ); } } ),
						el( TextControl, { label: 'Success Message', value: form.settings.success_message || '', onChange: function(v){ setForm( Object.assign( {}, form, { settings: Object.assign( {}, form.settings, { success_message: v } ) } ) ); } } ),
						el( TextControl, { label: 'Error Message', value: form.settings.error_message || '', onChange: function(v){ setForm( Object.assign( {}, form, { settings: Object.assign( {}, form.settings, { error_message: v } ) } ) ); } } ),
						el( TextControl, { label: 'Redirect URL', value: form.settings.redirect_url || '', onChange: function(v){ setForm( Object.assign( {}, form, { settings: Object.assign( {}, form.settings, { redirect_url: v } ) } ) ); } } ),
						el( SelectControl, { label: 'Style Preset', value: form.settings.style_preset || 'modern', options: [ {label:'Modern', value:'modern'}, {label:'Classic', value:'classic'}, {label:'Minimal', value:'minimal'} ], onChange: function(v){ setForm( Object.assign( {}, form, { settings: Object.assign( {}, form.settings, { style_preset: v } ) } ) ); } } ),
						el( ToggleControl, { label: 'Enable Honeypot', checked: form.settings.spam_honeypot !== false, onChange: function(v){ setForm( Object.assign( {}, form, { settings: Object.assign( {}, form.settings, { spam_honeypot: v } ) } ) ); } } )
					)
				)
			)
		);
	}

	var root = document.getElementById( 'nova-form-builder-forms-root' );
	if ( root ) {
		wp.element.render( el( App ), root );
	}
}( window.wp ) );
