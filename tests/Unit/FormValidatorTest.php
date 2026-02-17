<?php

declare(strict_types=1);

namespace NovaFormBuilder\Tests\Unit;

use NovaFormBuilder\Services\FormValidator;
use PHPUnit\Framework\TestCase;

final class FormValidatorTest extends TestCase {
	public function test_validate_submission_returns_errors_for_invalid_payload(): void {
		$validator = new FormValidator();

		$result = $validator->validate_submission(
			array(
				'name'    => '',
				'email'   => 'invalid-email',
				'message' => '',
			)
		);

		self::assertFalse( $result['valid'] );
		self::assertArrayHasKey( 'name', $result['errors'] );
		self::assertArrayHasKey( 'email', $result['errors'] );
		self::assertArrayHasKey( 'message', $result['errors'] );
	}
}
