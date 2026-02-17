<?php
/**
 * REST submission controller.
 *
 * @package NovaFormBuilder\REST
 */

declare(strict_types=1);

namespace NovaFormBuilder\REST;

use NovaFormBuilder\Integrations\EmailIntegrationService;
use NovaFormBuilder\Integrations\WebhookIntegrationService;
use NovaFormBuilder\Repositories\SubmissionRepositoryInterface;
use NovaFormBuilder\Services\FormValidator;
use NovaFormBuilder\Services\SubmissionHandler;
use NovaFormBuilder\Support\RateLimiter;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class SubmissionController {
	private SubmissionHandler $handler;

	public function __construct(
		private FormValidator $validator,
		private SubmissionRepositoryInterface $repository,
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

		$payload    = $this->sanitize_payload( (array) $request->get_json_params() );
		$validation = $this->validator->validate_submission( $payload );

		if ( ! $validation['valid'] ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'validation_failed',
					'errors'  => $validation['errors'],
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
	 * @param array<string,mixed> $raw Input payload.
	 *
	 * @return array<string,mixed>
	 */
	private function sanitize_payload( array $raw ): array {
		return array(
			'form_type' => sanitize_key( (string) ( $raw['form_type'] ?? 'contact' ) ),
			'name'      => sanitize_text_field( (string) ( $raw['name'] ?? '' ) ),
			'email'     => sanitize_email( (string) ( $raw['email'] ?? '' ) ),
			'message'   => sanitize_textarea_field( (string) ( $raw['message'] ?? '' ) ),
		);
	}
}
