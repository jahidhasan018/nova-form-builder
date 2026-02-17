<?php
/**
 * Submission validation service.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

class FormValidator {
	/**
	 * @param array<string,mixed> $payload Submission payload.
	 *
	 * @return array{valid:bool,errors:array<string,string>}
	 */
	public function validate_submission( array $payload ): array {
		$errors = array();

		$name = sanitize_text_field( (string) ( $payload['name'] ?? '' ) );
		if ( '' === $name ) {
			$errors['name'] = __( 'Name is required.', 'nova-form-builder' );
		}

		$email = sanitize_email( (string) ( $payload['email'] ?? '' ) );
		if ( ! is_email( $email ) ) {
			$errors['email'] = __( 'A valid email is required.', 'nova-form-builder' );
		}

		$message = sanitize_textarea_field( (string) ( $payload['message'] ?? '' ) );
		if ( '' === $message ) {
			$errors['message'] = __( 'Message is required.', 'nova-form-builder' );
		}

		return array(
			'valid'  => 0 === count( $errors ),
			'errors' => $errors,
		);
	}
}
