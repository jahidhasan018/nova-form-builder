<?php
/**
 * WordPress options-backed settings repository.
 *
 * @package NovaFormBuilder\Repositories
 */

declare(strict_types=1);

namespace NovaFormBuilder\Repositories;

use NovaFormBuilder\Contracts\SettingsRepositoryInterface;

class WordPressSettingsRepository implements SettingsRepositoryInterface {
	private const OPTION_NAME = 'nova_form_builder_settings';

	/**
	 * @return array<string,mixed>
	 */
	private function get_all(): array {
		$settings = get_option( self::OPTION_NAME, array() );

		return is_array( $settings ) ? $settings : array();
	}

	public function get( string $key, $default = null ) {
		$settings = $this->get_all();

		return $settings[ $key ] ?? $default;
	}

	public function set( string $key, $value ): bool {
		$settings         = $this->get_all();
		$settings[ $key ] = $value;

		return update_option( self::OPTION_NAME, $settings, false );
	}
}
