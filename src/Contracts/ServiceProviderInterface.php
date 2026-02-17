<?php
/**
 * Service provider contract.
 *
 * @package NovaFormBuilder\Contracts
 */

declare(strict_types=1);

namespace NovaFormBuilder\Contracts;

use NovaFormBuilder\Core\Container;

interface ServiceProviderInterface {
	/**
	 * Register service definitions.
	 *
	 * @param Container $container Container instance.
	 *
	 * @return void
	 */
	public function register( Container $container ): void;
}
