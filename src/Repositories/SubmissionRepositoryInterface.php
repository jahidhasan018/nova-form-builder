<?php
/**
 * Submission repository contract.
 *
 * @package NovaFormBuilder\Repositories
 */

declare(strict_types=1);

namespace NovaFormBuilder\Repositories;

interface SubmissionRepositoryInterface {
	/**
	 * @param array<string,mixed> $payload Payload.
	 */
	public function insert( array $payload ): int;

	public function create_table(): void;
}
