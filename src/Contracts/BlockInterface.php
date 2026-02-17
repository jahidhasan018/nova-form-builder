<?php
/**
 * Block contract.
 *
 * @package NovaFormBuilder\Contracts
 */

declare(strict_types=1);

namespace NovaFormBuilder\Contracts;

interface BlockInterface {
	public function register(): void;
}
