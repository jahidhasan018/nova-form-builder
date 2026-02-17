<?php
/**
 * Dependency injection container.
 *
 * @package NovaFormBuilder\Core
 */

declare(strict_types=1);

namespace NovaFormBuilder\Core;

use RuntimeException;

/**
 * Lightweight service container.
 */
class Container {
	/**
	 * Service definitions.
	 *
	 * @var array<string, callable(self):mixed>
	 */
	private array $factories = array();

	/**
	 * Instantiated services.
	 *
	 * @var array<string, mixed>
	 */
	private array $instances = array();

	/**
	 * Registers service factory.
	 *
	 * @param string                 $id      Service identifier.
	 * @param callable(self):mixed   $factory Service factory.
	 *
	 * @return void
	 */
	public function set( string $id, callable $factory ): void {
		$this->factories[ $id ] = $factory;
	}

	/**
	 * Gets service instance.
	 *
	 * @param string $id Service identifier.
	 *
	 * @return mixed
	 */
	public function get( string $id ) {
		if ( isset( $this->instances[ $id ] ) ) {
			return $this->instances[ $id ];
		}

		if ( ! isset( $this->factories[ $id ] ) ) {
			throw new RuntimeException( sprintf( 'Service "%s" is not registered.', $id ) );
		}

		$this->instances[ $id ] = $this->factories[ $id ]( $this );

		return $this->instances[ $id ];
	}
}
