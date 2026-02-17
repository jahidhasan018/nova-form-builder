<?php
/**
 * Forms list admin page.
 *
 * @package NovaFormBuilder\Admin
 */

declare(strict_types=1);

namespace NovaFormBuilder\Admin;

class FormListPage {
	private const SLUG = 'nova-form-builder-forms';

	private string $plugin_url;

	public function __construct( string $plugin_url ) {
		$this->plugin_url = $plugin_url;
	}

	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function register_menu(): void {
		add_submenu_page( 'nova-form-builder', __( 'Add Form', 'nova-form-builder' ), __( 'Add Form', 'nova-form-builder' ), 'manage_options', self::SLUG, array( $this, 'render' ) );
	}

	public function enqueue_assets( string $hook_suffix ): void {
		if ( false === strpos( $hook_suffix, self::SLUG ) ) {
			return;
		}

		wp_enqueue_script( 'nova-form-builder-forms-list', $this->plugin_url . 'assets/admin/forms-list.js', array( 'wp-element', 'wp-components', 'wp-api-fetch' ), '1.0.0', true );
		wp_add_inline_script(
			'nova-form-builder-forms-list',
			'window.NovaFormBuilderForms=' . wp_json_encode(
				array(
					'root'       => esc_url_raw( rest_url( 'nova-form/v1' ) ),
					'nonce'      => wp_create_nonce( 'wp_rest' ),
					'builderUrl' => admin_url( 'admin.php?page=nova-form-builder-builder' ),
				)
			) . ';',
			'before'
		);
	}

	public function render(): void {
		echo '<div class="wrap"><h1>' . esc_html__( 'Forms', 'nova-form-builder' ) . '</h1><div id="nova-form-builder-forms-root"></div></div>';
	}
}
