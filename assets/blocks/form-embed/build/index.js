( function ( blocks, element, blockEditor, components ) {
	var el = element.createElement;
	var useBlockProps = blockEditor.useBlockProps;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;

	blocks.registerBlockType( 'nova-form-builder/form-embed', {
		title: 'Nova Form Embed',
		icon: 'feedback',
		category: 'widgets',
		attributes: {
			formId: { type: 'number', default: 0 }
		},
		edit: function ( props ) {
			return el(
				element.Fragment,
				null,
				el( InspectorControls, null,
					el( PanelBody, { title: 'Form Settings' },
						el( TextControl, {
							label: 'Form ID',
							value: String( props.attributes.formId || '' ),
							onChange: function ( value ) {
								props.setAttributes( { formId: parseInt( value || '0', 10 ) } );
							}
						} )
					)
				),
				el( 'div', useBlockProps(), 'Nova Form Embed (ID: ' + ( props.attributes.formId || 0 ) + ')' )
			);
		},
		save: function () { return null; }
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components );
