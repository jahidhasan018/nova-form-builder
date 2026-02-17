<?php
/**
 * Settings repository contract.
 *
 * @package NovaFormBuilder\Contracts
 */

declare(strict_types=1);

namespace NovaFormBuilder\Contracts;

interface SettingsRepositoryInterface {
	/**
	 * Reads plugin option value.
	 *
	 * @param string $key     Option key.
	 * @param mixed  $default Default value.
	 *
	 * @return mixed
	 */
	public function get( string $key, $default = null );

	/**
	 * Persists plugin option value.
	 *
	 * @param string $key   Option key.
	 * @param mixed  $value Option value.
	 *
	 * @return bool
	 */
	public function set( string $key, $value ): bool;
}
