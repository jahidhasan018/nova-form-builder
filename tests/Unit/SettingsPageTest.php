<?php

declare(strict_types=1);

namespace NovaFormBuilder\Tests\Unit;

use NovaFormBuilder\Admin\SettingsPage;
use NovaFormBuilder\Contracts\SettingsRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class SettingsPageTest extends TestCase {
	public function test_sanitize_settings_returns_expected_shape(): void {
		$repository = $this->createMock( SettingsRepositoryInterface::class );
		$page       = new SettingsPage( $repository );

		$sanitized = $page->sanitize_settings(
			array(
				'enable_webhook'             => '1',
				'webhook_url'                => 'https://example.com/hook',
				'enable_email_notifications' => '',
			)
		);

		self::assertTrue( $sanitized['enable_webhook'] );
		self::assertSame( 'https://example.com/hook', $sanitized['webhook_url'] );
		self::assertFalse( $sanitized['enable_email_notifications'] );
	}
}
