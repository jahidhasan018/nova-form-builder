( function ( blocks, element, blockEditor, components, i18n ) {
	var el = element.createElement;
	var useState = element.useState;
	var useEffect = element.useEffect;
	var InspectorControls = blockEditor.InspectorControls;
	var useBlockProps = blockEditor.useBlockProps;
	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var __ = i18n.__;

	blocks.registerBlockType( 'nova-form-builder/contact-form', {
		title: __( 'Nova Contact Form', 'nova-form-builder' ),
		icon: 'email',
		category: 'widgets',
		attributes: {
			formTitle: {
				type: 'string',
				default: 'Contact Us',
			},
			submitLabel: {
				type: 'string',
				default: 'Send Message',
			},
		},
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var preview = useState( attributes.formTitle );
			var previewTitle = preview[ 0 ];
			var setPreviewTitle = preview[ 1 ];

			useEffect(
				function () {
					setPreviewTitle( attributes.formTitle );
				},
				[ attributes.formTitle ]
			);

			return el(
				element.Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __( 'Form Settings', 'nova-form-builder' ) },
						el( TextControl, {
							label: __( 'Form Title', 'nova-form-builder' ),
							value: attributes.formTitle,
							onChange: function ( value ) {
								setAttributes( { formTitle: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Submit Label', 'nova-form-builder' ),
							value: attributes.submitLabel,
							onChange: function ( value ) {
								setAttributes( { submitLabel: value } );
							},
						} )
					)
				),
				el(
					'div',
					useBlockProps(),
					el( 'h4', null, previewTitle || __( 'Contact Us', 'nova-form-builder' ) ),
					el( 'p', null, __( 'Dynamic contact form preview.', 'nova-form-builder' ) )
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.i18n );
