<?php
/**
 * Form embed Gutenberg block.
 *
 * @package NovaFormBuilder\Blocks
 */

declare(strict_types=1);

namespace NovaFormBuilder\Blocks;

use NovaFormBuilder\Services\ShortcodeService;

class FormEmbedBlock extends AbstractBlock {
	public function __construct( string $plugin_url, string $plugin_path, private ShortcodeService $shortcodes ) {
		parent::__construct( $plugin_url, $plugin_path );
	}

	protected function name(): string {
		return 'nova-form-builder/form-embed';
	}

	protected function block_json_path(): string {
		return $this->plugin_path . 'assets/blocks/form-embed';
	}

	public function render( array $attributes = array() ): string {
		$form_id = isset( $attributes['formId'] ) ? (int) $attributes['formId'] : 0;

		return $this->shortcodes->render_shortcode( array( 'id' => $form_id ) );
	}
}
