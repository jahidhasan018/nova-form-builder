<?php
/**
 * Plugin Name: NovaForm Builder
 * Plugin URI:  https://example.com/nova-form-builder
 * Description: Enterprise-grade Gutenberg form builder with secure REST submissions.
 * Version:     1.0.0
 * Author:      NovaForm Team
 * License:     GPL-2.0-or-later
 * Text Domain: nova-form-builder
 * Requires PHP: 8.0
 *
 * @package NovaFormBuilder
 */

declare(strict_types=1);

use NovaFormBuilder\Core\Application;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$autoload_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoload_path ) ) {
	require_once $autoload_path;
} else {
	/**
	 * Lightweight PSR-4-style fallback autoloader when Composer autoload is unavailable.
	 *
	 * @param string $class Fully-qualified class name.
	 *
	 * @return void
	 */
	spl_autoload_register(
		static function ( string $class ): void {
			$prefix = 'NovaFormBuilder\\';
			if ( 0 !== strpos( $class, $prefix ) ) {
				return;
			}

			$relative_class = substr( $class, strlen( $prefix ) );
			$file           = __DIR__ . '/src/' . str_replace( '\\', '/', $relative_class ) . '.php';

			if ( file_exists( $file ) ) {
				require_once $file;
			}
		}
	);
}

/**
 * Boots the plugin application.
 *
 * @return void
 */
function nova_form_builder_bootstrap(): void {
	$app = new Application( __FILE__ );
	$app->boot();
}

add_action( 'plugins_loaded', 'nova_form_builder_bootstrap' );
