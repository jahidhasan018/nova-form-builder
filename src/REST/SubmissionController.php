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
		private ?RateLimiter $rate_limiter = null
	) {
		$this->handler      = new SubmissionHandler( $repository, $email_integration, $webhook_integration );
		$this->rate_limiter = $this->rate_limiter ?? new RateLimiter();
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
		$errors  = $this->validate_payload( $payload );

		if ( ! empty( $errors ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'validation_failed',
					'errors'  => $errors,
				),
				422
			);
		}

		$submission_id = $this->handler->handle( $payload );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array(
					'submission_id' => $submission_id,
					'message'       => __( 'Submission received successfully.', 'nova-form-builder' ),
				),
			),
			201
		);
	}

	/**
	 * @param array<string,mixed> $payload Payload.
	 *
	 * @return array<string,string>
	 */
	private function validate_payload( array $payload ): array {
		$errors  = array();
		$form_id = isset( $payload['form_id'] ) ? (int) $payload['form_id'] : 0;
		if ( $form_id <= 0 ) {
			if ( '' === (string) ( $payload['name'] ?? '' ) ) {
				$errors['name'] = __( 'Name is required.', 'nova-form-builder' );
			}
			if ( ! is_email( (string) ( $payload['email'] ?? '' ) ) ) {
				$errors['email'] = __( 'A valid email is required.', 'nova-form-builder' );
			}
			if ( '' === (string) ( $payload['message'] ?? '' ) ) {
				$errors['message'] = __( 'Message is required.', 'nova-form-builder' );
			}
			return $errors;
		}

		$form = $this->form_repository->find( $form_id );
		if ( null === $form ) {
			$errors['form'] = __( 'Form not found.', 'nova-form-builder' );
			return $errors;
		}

		foreach ( (array) ( $form['fields'] ?? array() ) as $field ) {
			if ( ! is_array( $field ) || empty( $field['required'] ) ) {
				continue;
			}
			$key = sanitize_key( (string) ( $field['name'] ?? '' ) );
			if ( '' === $key ) {
				continue;
			}
			$value = isset( $payload[ $key ] ) ? (string) $payload[ $key ] : '';
			if ( '' === $value ) {
				$errors[ $key ] = sprintf( __( '%s is required.', 'nova-form-builder' ), sanitize_text_field( (string) ( $field['label'] ?? $key ) ) );
			}
		}

		return $errors;
	}

	/**
	 * @param array<string,mixed> $raw Input payload.
	 *
	 * @return array<string,mixed>
	 */
	private function sanitize_payload( array $raw ): array {
		$clean = array(
			'form_type' => sanitize_key( (string) ( $raw['form_type'] ?? 'contact' ) ),
			'form_id'   => isset( $raw['form_id'] ) ? (int) $raw['form_id'] : 0,
		);

		foreach ( $raw as $key => $value ) {
			$clean_key = sanitize_key( (string) $key );
			if ( in_array( $clean_key, array( 'nonce', 'website' ), true ) ) {
				continue;
			}
			$clean[ $clean_key ] = is_scalar( $value ) ? sanitize_textarea_field( (string) $value ) : '';
		}

		return $clean;
	}
}
