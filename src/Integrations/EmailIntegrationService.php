<?php
/**
 * Email integration.
 *
 * @package NovaFormBuilder\Integrations
 */

declare(strict_types=1);

namespace NovaFormBuilder\Integrations;

use NovaFormBuilder\Contracts\SettingsRepositoryInterface;

class EmailIntegrationService {
	public function __construct( private SettingsRepositoryInterface $settings_repository ) {}

	/**
	 * @param array<string,mixed> $payload Payload.
	 */
	public function send_notification( array $payload ): void {
		$is_enabled = (bool) $this->settings_repository->get( 'enable_email_notifications', true );
		if ( ! $is_enabled ) {
			return;
		}

		$recipient = (string) get_option( 'admin_email' );
		$subject   = __( 'New NovaForm submission', 'nova-form-builder' );
		$message   = wp_json_encode( $payload, JSON_PRETTY_PRINT );

		if ( false !== $message ) {
			wp_mail( $recipient, $subject, $message );
		}
	}
}
