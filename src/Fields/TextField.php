<?php
declare(strict_types=1);

namespace NovaFormBuilder\Fields;

class TextField extends AbstractField {
	public function type(): string { return 'text'; }
}
