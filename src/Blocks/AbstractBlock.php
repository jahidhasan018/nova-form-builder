<?php
/**
 * Abstract dynamic block.
 *
 * @package NovaFormBuilder\Blocks
 */

declare(strict_types=1);

namespace NovaFormBuilder\Blocks;

use NovaFormBuilder\Contracts\BlockInterface;

abstract class AbstractBlock implements BlockInterface {
	protected string $plugin_url;

	protected string $plugin_path;

	public function __construct( string $plugin_url, string $plugin_path ) {
		$this->plugin_url  = $plugin_url;
		$this->plugin_path = $plugin_path;
	}

	abstract protected function name(): string;

	abstract protected function block_json_path(): string;

	/**
	 * @param array<string,mixed> $attributes Attributes.
	 *
	 * @return string
	 */
	abstract public function render( array $attributes = array() ): string;

	public function register(): void {
		register_block_type(
			$this->block_json_path(),
			array(
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Optional frontend assets registration hook.
	 *
	 * @return void
	 */
	public function enqueue_assets(): void {
		// Extension point.
	}
}
