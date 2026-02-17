<?php
/**
 * Webhook integration service.
 *
 * @package NovaFormBuilder\Integrations
 */

declare(strict_types=1);

namespace NovaFormBuilder\Integrations;

class WebhookIntegrationService {
	/**
	 * @param array<string,mixed> $payload Payload.
	 */
	public function dispatch( array $payload ): void {
		$endpoint = (string) get_option( 'nova_form_builder_webhook_url', '' );
		if ( '' === $endpoint ) {
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
