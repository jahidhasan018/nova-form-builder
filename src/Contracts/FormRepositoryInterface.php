<?php
/**
 * Form repository contract.
 *
 * @package NovaFormBuilder\Contracts
 */

declare(strict_types=1);

namespace NovaFormBuilder\Contracts;

interface FormRepositoryInterface {
	/**
	 * @return array<int,array<string,mixed>>
	 */
	public function all(): array;

	/**
	 * @return array<string,mixed>|null
	 */
	public function find( int $id ): ?array;

	/**
	 * @param array<string,mixed> $payload Form payload.
	 */
	public function save( array $payload ): int;
}
