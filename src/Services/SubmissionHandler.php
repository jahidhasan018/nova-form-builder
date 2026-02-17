<?php
/**
 * Coordinates submission persistence and integrations.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

use NovaFormBuilder\Integrations\EmailIntegrationService;
use NovaFormBuilder\Integrations\WebhookIntegrationService;
use NovaFormBuilder\Repositories\SubmissionRepositoryInterface;

class SubmissionHandler {
	public function __construct(
		private SubmissionRepositoryInterface $repository,
		private EmailIntegrationService $email_integration,
		private WebhookIntegrationService $webhook_integration
	) {}

	/**
	 * @param array<string,mixed> $payload Sanitized payload.
	 *
	 * @return int Insert ID.
	 */
	public function handle( array $payload ): int {
		$submission_id = $this->repository->insert( $payload );
		$this->email_integration->send_notification( $payload );
		$this->webhook_integration->dispatch( $payload );

		return $submission_id;
	}
}
