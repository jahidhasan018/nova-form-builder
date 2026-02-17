<?php
/**
 * React settings admin page.
 *
 * @package NovaFormBuilder\Admin
 */

declare(strict_types=1);

namespace NovaFormBuilder\Admin;

class SettingsPage {
	private const MENU_SLUG = 'nova-form-builder';

	private string $plugin_url;

	public function __construct( string $plugin_url ) {
		$this->plugin_url = $plugin_url;
	}

	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function register_menu(): void {
		add_menu_page(
			__( 'NovaForm Builder', 'nova-form-builder' ),
			__( 'NovaForm Builder', 'nova-form-builder' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render' ),
			'dashicons-feedback',
			58
		);
	}

	public function enqueue_assets( string $hook_suffix ): void {
		if ( false === strpos( $hook_suffix, self::MENU_SLUG ) ) {
			return;
		}
		wp_enqueue_script( 'nova-form-builder-settings', $this->plugin_url . 'assets/admin/settings.js', array( 'wp-element', 'wp-components', 'wp-api-fetch' ), '1.0.0', true );
		wp_enqueue_style( 'nova-form-builder-settings', $this->plugin_url . 'assets/admin/settings.css', array(), '1.0.0' );
		wp_add_inline_script(
			'nova-form-builder-settings',
			'window.NovaFormBuilderSettings=' . wp_json_encode(
				array(
					'root'  => esc_url_raw( rest_url( 'nova-form/v1' ) ),
					'nonce' => wp_create_nonce( 'wp_rest' ),
				)
			) . ';',
			'before'
		);
	}

	public function render(): void {
		echo '<div class="wrap"><h1>' . esc_html__( 'NovaForm Settings', 'nova-form-builder' ) . '</h1><div id="nova-form-builder-settings-root"></div></div>';
	}
}
