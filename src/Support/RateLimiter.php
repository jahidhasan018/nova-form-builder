<?php
/**
 * Basic transient-based rate limiter.
 *
 * @package NovaFormBuilder\Support
 */

declare(strict_types=1);

namespace NovaFormBuilder\Support;

class RateLimiter {
	public function too_many_attempts( string $identifier, int $max_attempts, int $window_seconds ): bool {
		$key      = 'nova_form_rate_' . md5( $identifier );
		$attempts = (int) get_transient( $key );

		if ( $attempts >= $max_attempts ) {
			return true;
		}

		set_transient( $key, $attempts + 1, $window_seconds );

		return false;
	}
}
