<?php
/**
 * Admin React form builder page.
 *
 * @package NovaFormBuilder\Admin
 */

declare(strict_types=1);

namespace NovaFormBuilder\Admin;

class FormBuilderPage {
	private const SLUG = 'nova-form-builder-builder';

	private const PARENT_SLUG = 'nova-form-builder';

	private string $plugin_url;

	public function __construct( string $plugin_url ) {
		$this->plugin_url = $plugin_url;
	}

	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function register_menu(): void {
		add_submenu_page(
			self::PARENT_SLUG,
			__( 'Form Builder', 'nova-form-builder' ),
			__( 'Form Builder', 'nova-form-builder' ),
			'manage_options',
			self::SLUG,
			array( $this, 'render' )
		);
	}

	/**
	 * @param string $hook_suffix Current page hook.
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		if ( false === strpos( $hook_suffix, self::SLUG ) ) {
			return;
		}

		wp_enqueue_script(
			'nova-form-builder-admin',
			$this->plugin_url . 'assets/admin/form-builder.js',
			array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
			'1.0.0',
			true
		);

		wp_enqueue_style(
			'nova-form-builder-admin',
			$this->plugin_url . 'assets/admin/form-builder.css',
			array(),
			'1.0.0'
		);

		$form_id = isset( $_GET['form_id'] ) ? (int) $_GET['form_id'] : 0;

		wp_add_inline_script(
			'nova-form-builder-admin',
			'window.NovaFormBuilderAdmin=' . wp_json_encode(
				array(
					'root'    => esc_url_raw( rest_url( 'nova-form/v1' ) ),
					'nonce'   => wp_create_nonce( 'wp_rest' ),
					'form_id' => $form_id,
				)
			) . ';',
			'before'
		);
	}

	public function render(): void {
		echo '<div class="wrap"><h1>' . esc_html__( 'NovaForm Builder', 'nova-form-builder' ) . '</h1><div id="nova-form-builder-admin-root"></div></div>';
	}
}
