<?php
/**
 * Webhook integration service.
 *
 * @package NovaFormBuilder\Integrations
 */

declare(strict_types=1);

namespace NovaFormBuilder\Integrations;

use NovaFormBuilder\Contracts\SettingsRepositoryInterface;

class WebhookIntegrationService {
	public function __construct( private SettingsRepositoryInterface $settings_repository ) {}

	/**
	 * @param array<string,mixed> $payload Payload.
	 */
	public function dispatch( array $payload ): void {
		$is_enabled = (bool) $this->settings_repository->get( 'enable_webhook', false );
		$endpoint   = (string) $this->settings_repository->get( 'webhook_url', '' );

		if ( ! $is_enabled || '' === $endpoint ) {
			return;
		}

		wp_remote_post(
			$endpoint,
			array(
				'timeout' => 3,
				'body'    => wp_json_encode( $payload ),
				'headers' => array(
					'Content-Type' => 'application/json',
				),
			)
		);
	}
}
