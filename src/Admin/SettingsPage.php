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
	private string $hook_suffix = '';

	public function __construct( string $plugin_url ) {
		$this->plugin_url = $plugin_url;
	}

	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function register_menu(): void {
		$this->hook_suffix = (string) add_submenu_page(
			self::MENU_SLUG,
			__( 'Settings', 'nova-form-builder' ),
			__( 'Settings', 'nova-form-builder' ),
			'manage_options',
			'nova-form-builder-settings',
			array( $this, 'render' )
		);
	}

	public function enqueue_assets( string $hook_suffix ): void {
		if ( $hook_suffix !== $this->hook_suffix ) {
			return;
		}
		wp_enqueue_script( 'nova-form-builder-settings', $this->plugin_url . 'assets/admin/settings.js', array( 'wp-element', 'wp-components', 'wp-api-fetch' ), '1.0.0', true );
		wp_enqueue_style( 'wp-components' );
		wp_enqueue_style( 'nova-form-builder-settings', $this->plugin_url . 'assets/admin/settings.css', array( 'wp-components' ), '1.0.0' );
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
		echo '<div class="wrap"><div id="nova-form-builder-settings-root"></div></div>';
	}
}
