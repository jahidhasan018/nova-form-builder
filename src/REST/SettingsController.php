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
					'email_from_name'            => (string) $this->settings->get( 'email_from_name', 'Nova Forms' ),
					'email_from_address'         => (string) $this->settings->get( 'email_from_address', '' ),
					'email_recipient'            => (string) $this->settings->get( 'email_recipient', '' ),
					'email_subject'              => (string) $this->settings->get( 'email_subject', 'New Form Submission' ),
					'submit_button_label'        => (string) $this->settings->get( 'submit_button_label', 'Submit' ),
					'success_message'            => (string) $this->settings->get( 'success_message', 'Thanks for submitting the form.' ),
					'error_message'              => (string) $this->settings->get( 'error_message', 'Please fix the highlighted fields.' ),
					'enable_honeypot'            => (bool) $this->settings->get( 'enable_honeypot', true ),
					'store_submissions'          => (bool) $this->settings->get( 'store_submissions', true ),
					'style_preset'               => (string) $this->settings->get( 'style_preset', 'modern' ),
					'enable_rate_limiting'        => (bool) $this->settings->get( 'enable_rate_limiting', true ),
					'rate_limit_max'              => (int) $this->settings->get( 'rate_limit_max', 10 ),
					'data_retention_days'         => (int) $this->settings->get( 'data_retention_days', 0 ),
				),
			)
		);
	}

	public function store( WP_REST_Request $request ): WP_REST_Response {
		$payload = (array) $request->get_json_params();
		$this->settings->set( 'enable_webhook', ! empty( $payload['enable_webhook'] ) );
		$this->settings->set( 'webhook_url', esc_url_raw( (string) ( $payload['webhook_url'] ?? '' ) ) );
		$this->settings->set( 'enable_email_notifications', ! empty( $payload['enable_email_notifications'] ) );
		$this->settings->set( 'email_from_name', sanitize_text_field( (string) ( $payload['email_from_name'] ?? 'Nova Forms' ) ) );
		$this->settings->set( 'email_from_address', sanitize_email( (string) ( $payload['email_from_address'] ?? '' ) ) );
		$this->settings->set( 'email_recipient', sanitize_email( (string) ( $payload['email_recipient'] ?? '' ) ) );
		$this->settings->set( 'email_subject', sanitize_text_field( (string) ( $payload['email_subject'] ?? 'New Form Submission' ) ) );
		$this->settings->set( 'submit_button_label', sanitize_text_field( (string) ( $payload['submit_button_label'] ?? 'Submit' ) ) );
		$this->settings->set( 'success_message', sanitize_text_field( (string) ( $payload['success_message'] ?? 'Thanks for submitting the form.' ) ) );
		$this->settings->set( 'error_message', sanitize_text_field( (string) ( $payload['error_message'] ?? 'Please fix the highlighted fields.' ) ) );
		$this->settings->set( 'enable_honeypot', ! empty( $payload['enable_honeypot'] ) );
		$this->settings->set( 'store_submissions', ! empty( $payload['store_submissions'] ) );
		$preset = sanitize_key( (string) ( $payload['style_preset'] ?? 'modern' ) );
		$this->settings->set( 'style_preset', in_array( $preset, array( 'classic', 'modern', 'minimal' ), true ) ? $preset : 'modern' );
		$this->settings->set( 'enable_rate_limiting', ! empty( $payload['enable_rate_limiting'] ) );
		$this->settings->set( 'rate_limit_max', max( 1, min( 100, (int) ( $payload['rate_limit_max'] ?? 10 ) ) ) );
		$this->settings->set( 'data_retention_days', max( 0, (int) ( $payload['data_retention_days'] ?? 0 ) ) );

		return $this->show();
	}
}
