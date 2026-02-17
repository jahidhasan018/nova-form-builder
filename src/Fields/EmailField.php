<?php
declare(strict_types=1);

namespace NovaFormBuilder\Fields;

class EmailField extends AbstractField {
	public function type(): string { return 'email'; }
}
