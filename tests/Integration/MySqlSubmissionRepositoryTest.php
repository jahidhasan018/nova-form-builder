<?php

declare(strict_types=1);

namespace NovaFormBuilder\Tests\Integration;

use NovaFormBuilder\Repositories\MySqlSubmissionRepository;
use PHPUnit\Framework\TestCase;

final class MySqlSubmissionRepositoryTest extends TestCase {
	public function test_repository_class_exists_for_di_resolution(): void {
		self::assertTrue( class_exists( MySqlSubmissionRepository::class ) );
	}
}
