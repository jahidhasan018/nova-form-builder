<?php
/**
 * Email integration.
 *
 * @package NovaFormBuilder\Integrations
 */

declare(strict_types=1);

namespace NovaFormBuilder\Integrations;

class EmailIntegrationService {
	/**
	 * @param array<string,mixed> $payload Payload.
	 */
	public function send_notification( array $payload ): void {
		$recipient = (string) get_option( 'admin_email' );
		$subject   = __( 'New NovaForm submission', 'nova-form-builder' );
		$message   = wp_json_encode( $payload, JSON_PRETTY_PRINT );

		if ( false !== $message ) {
			wp_mail( $recipient, $subject, $message );
		}
	}
}
