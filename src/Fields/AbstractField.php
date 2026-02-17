<?php
/**
 * Abstract field entity.
 *
 * @package NovaFormBuilder\Fields
 */

declare(strict_types=1);

namespace NovaFormBuilder\Fields;

abstract class AbstractField {
	public function __construct(
		protected string $name,
		protected string $label,
		protected bool $required = false
	) {}

	public function name(): string { return $this->name; }
	public function label(): string { return $this->label; }
	public function required(): bool { return $this->required; }

	abstract public function type(): string;
}
