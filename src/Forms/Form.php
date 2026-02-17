<?php
/**
 * Form entity.
 *
 * @package NovaFormBuilder\Forms
 */

declare(strict_types=1);

namespace NovaFormBuilder\Forms;

use NovaFormBuilder\Fields\AbstractField;

class Form {
	/** @var AbstractField[] */
	private array $fields;

	public function __construct(
		private string $id,
		private string $title,
		array $fields = array()
	) {
		$this->fields = $fields;
	}

	public function id(): string {
		return $this->id;
	}

	public function title(): string {
		return $this->title;
	}

	/** @return AbstractField[] */
	public function fields(): array {
		return $this->fields;
	}
}
