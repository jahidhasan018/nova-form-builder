<?php
/**
 * REST settings controller.
 *
 * @package NovaFormBuilder\REST
 */

declare(strict_types=1);

namespace NovaFormBuilder\REST;

use NovaFormBuilder\Contracts\SettingsRepositoryInterface;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class SettingsController {
	public function __construct( private SettingsRepositoryInterface $settings ) {}

	public function register_routes(): void {
		register_rest_route(
			'nova-form/v1',
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'show' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'store' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);
	}

	/** @return true|WP_Error */
	public function can_manage() {
		return current_user_can( 'manage_options' ) ? true : new WP_Error( 'forbidden', __( 'Not allowed.', 'nova-form-builder' ), array( 'status' => 403 ) );
	}

	public function show(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array(
					'enable_webhook'             => (bool) $this->settings->get( 'enable_webhook', false ),
					'webhook_url'                => (string) $this->settings->get( 'webhook_url', '' ),
					'enable_email_notifications' => (bool) $this->settings->get( 'enable_email_notifications', true ),
					'style_preset'               => (string) $this->settings->get( 'style_preset', 'classic' ),
				),
			)
		);
	}

	public function store( WP_REST_Request $request ): WP_REST_Response {
		$payload = (array) $request->get_json_params();
		$this->settings->set( 'enable_webhook', ! empty( $payload['enable_webhook'] ) );
		$this->settings->set( 'webhook_url', esc_url_raw( (string) ( $payload['webhook_url'] ?? '' ) ) );
		$this->settings->set( 'enable_email_notifications', ! empty( $payload['enable_email_notifications'] ) );
		$preset = sanitize_key( (string) ( $payload['style_preset'] ?? 'classic' ) );
		$this->settings->set( 'style_preset', in_array( $preset, array( 'classic', 'modern', 'minimal' ), true ) ? $preset : 'classic' );

		return $this->show();
	}
}
