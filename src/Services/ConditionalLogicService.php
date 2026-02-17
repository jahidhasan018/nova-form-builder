<?php
/**
 * Conditional field logic evaluator.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

class ConditionalLogicService {
	/**
	 * @param array<string,mixed> $conditions Rules.
	 * @param array<string,mixed> $payload    Current values.
	 */
	public function evaluate( array $conditions, array $payload ): bool {
		foreach ( $conditions as $field => $expected ) {
			if ( ! array_key_exists( $field, $payload ) || $payload[ $field ] !== $expected ) {
				return false;
			}
		}

		return true;
	}
}
