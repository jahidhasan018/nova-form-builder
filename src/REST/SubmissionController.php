<?php
/**
 * REST submission controller.
 *
 * @package NovaFormBuilder\REST
 */

declare(strict_types=1);

namespace NovaFormBuilder\REST;

use NovaFormBuilder\Contracts\FormRepositoryInterface;
use NovaFormBuilder\Integrations\EmailIntegrationService;
use NovaFormBuilder\Integrations\WebhookIntegrationService;
use NovaFormBuilder\Repositories\SubmissionRepositoryInterface;
use NovaFormBuilder\Services\FormSchema;
use NovaFormBuilder\Services\SubmissionHandler;
use NovaFormBuilder\Support\RateLimiter;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class SubmissionController {
	private SubmissionHandler $handler;

	public function __construct(
		private SubmissionRepositoryInterface $repository,
		private FormRepositoryInterface $form_repository,
		EmailIntegrationService $email_integration,
		WebhookIntegrationService $webhook_integration,
		private ?RateLimiter $rate_limiter = null,
		private ?FormSchema $schema = null
	) {
		$this->handler      = new SubmissionHandler( $repository, $email_integration, $webhook_integration );
		$this->rate_limiter = $this->rate_limiter ?? new RateLimiter();
		$this->schema       = $this->schema ?? new FormSchema();
	}

	public function register_routes(): void {
		register_rest_route(
			'nova-form/v1',
			'/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'submit' ),
				'permission_callback' => array( $this, 'can_submit' ),
			)
		);
	}

	/**
	 * @return true|WP_Error
	 */
	public function can_submit() {
		return true;
	}

	public function submit( WP_REST_Request $request ): WP_REST_Response {
		$nonce = (string) $request->get_header( 'X-WP-Nonce' );
		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'invalid_nonce',
					'message' => __( 'Security nonce validation failed.', 'nova-form-builder' ),
				),
				403
			);
		}

		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
		if ( $this->rate_limiter->too_many_attempts( $ip, 10, 60 ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'rate_limited',
					'message' => __( 'Too many requests. Please try again shortly.', 'nova-form-builder' ),
				),
				429
			);
		}

		$payload = $this->sanitize_payload( (array) $request->get_json_params() );
		$form_id = isset( $payload['form_id'] ) ? (int) $payload['form_id'] : 0;

		if ( $form_id <= 0 ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'invalid_form',
					'message' => __( 'Invalid form submission.', 'nova-form-builder' ),
					'errors'  => array( 'form_id' => __( 'Form ID is required.', 'nova-form-builder' ) ),
				),
				422
			);
		}

		$form = $this->form_repository->find( $form_id );
		if ( null === $form ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'form_not_found',
					'message' => __( 'The selected form was not found.', 'nova-form-builder' ),
					'errors'  => array( 'form_id' => __( 'Form not found.', 'nova-form-builder' ) ),
				),
				404
			);
		}

		$normalized_form = $this->schema->normalize_form( $form );
		$errors          = $this->schema->validate_submission( $normalized_form, $payload );

		if ( ! empty( $errors ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'validation_failed',
					'message' => (string) ( $normalized_form['settings']['error_message'] ?? __( 'Please fix the highlighted fields.', 'nova-form-builder' ) ),
					'errors'  => $errors,
				),
				422
			);
		}

		$submission_payload = $payload;
		$submission_payload['schema_version'] = (int) ( $normalized_form['schema_version'] ?? FormSchema::SCHEMA_VERSION );
		$submission_payload['meta']           = array(
			'form_name'   => sanitize_text_field( (string) ( $normalized_form['name'] ?? '' ) ),
			'created_at'  => gmdate( 'c' ),
			'ip_hash'     => md5( $ip . NONCE_SALT ),
			'user_agent'  => isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_USER_AGENT'] ) ) : '',
		);
		$submission_id = $this->handler->handle( $submission_payload );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array(
					'submission_id' => $submission_id,
					'message'       => (string) ( $normalized_form['settings']['success_message'] ?? __( 'Submission received successfully.', 'nova-form-builder' ) ),
					'redirect_url'  => (string) ( $normalized_form['settings']['redirect_url'] ?? '' ),
				),
			),
			201
		);
	}

	/**
	 * @param array<string,mixed> $raw Input payload.
	 *
	 * @return array<string,mixed>
	 */
	private function sanitize_payload( array $raw ): array {
		$clean = array(
			'form_type' => sanitize_key( (string) ( $raw['form_type'] ?? 'custom' ) ),
			'form_id'   => isset( $raw['form_id'] ) ? (int) $raw['form_id'] : 0,
		);

		foreach ( $raw as $key => $value ) {
			$clean_key = sanitize_key( (string) $key );
			if ( in_array( $clean_key, array( 'nonce', 'website' ), true ) ) {
				continue;
			}
			if ( is_array( $value ) ) {
				$clean[ $clean_key ] = array_map( static fn ( $item ) => sanitize_text_field( (string) $item ), $value );
				continue;
			}
			$clean[ $clean_key ] = is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';
		}

		return $clean;
	}
}
