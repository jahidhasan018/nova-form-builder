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
