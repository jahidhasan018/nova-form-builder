import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
  const { formTitle, submitLabel } = attributes;
  const [previewTitle, setPreviewTitle] = useState(formTitle);

  useEffect(() => {
    setPreviewTitle(formTitle);
  }, [formTitle]);

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Form Settings', 'nova-form-builder')}>
          <TextControl
            label={__('Form Title', 'nova-form-builder')}
            value={formTitle}
            onChange={(value) => setAttributes({ formTitle: value })}
          />
          <TextControl
            label={__('Submit Label', 'nova-form-builder')}
            value={submitLabel}
            onChange={(value) => setAttributes({ submitLabel: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div {...useBlockProps()}>
        <h4>{previewTitle}</h4>
        <p>{__('Dynamic field builder UI placeholder.', 'nova-form-builder')}</p>
      </div>
    </>
  );
}
