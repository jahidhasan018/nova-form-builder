<?php
/**
 * Multi-step form block placeholder.
 *
 * @package NovaFormBuilder\Blocks
 */

declare(strict_types=1);

namespace NovaFormBuilder\Blocks;

class MultiStepFormBlock extends AbstractBlock {
	protected function name(): string {
		return 'nova-form-builder/multi-step-form';
	}

	protected function block_json_path(): string {
		return $this->plugin_path . 'assets/blocks/multi-step-form';
	}

	public function render( array $attributes = array() ): string {
		return '<div class="nova-form-builder__multi-step">' . esc_html__( 'Multi-step form placeholder', 'nova-form-builder' ) . '</div>';
	}
}
