<?php
/**
 * Survey block placeholder.
 *
 * @package NovaFormBuilder\Blocks
 */

declare(strict_types=1);

namespace NovaFormBuilder\Blocks;

class SurveyBlock extends AbstractBlock {
	protected function name(): string {
		return 'nova-form-builder/survey';
	}

	protected function block_json_path(): string {
		return $this->plugin_path . 'assets/blocks/survey';
	}

	public function render( array $attributes = array() ): string {
		return '<div class="nova-form-builder__survey">' . esc_html__( 'Survey form placeholder', 'nova-form-builder' ) . '</div>';
	}
}
