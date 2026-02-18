<?php

declare(strict_types=1);

namespace NovaFormBuilder\Tests\Unit;

use NovaFormBuilder\Services\FormSchema;
use PHPUnit\Framework\TestCase;

final class FormSchemaTest extends TestCase {
	public function test_normalize_form_adds_schema_defaults(): void {
		$schema = new FormSchema();

		$normalized = $schema->normalize_form(
			array(
				'name'   => 'Contact',
				'fields' => array(
					array(
						'type'  => 'email',
						'label' => 'Email',
						'name'  => 'email',
					),
				),
			)
		);

		self::assertSame( 2, $normalized['schema_version'] );
		self::assertSame( 'Submit', $normalized['settings']['submit_label'] );
		self::assertSame( 'email', $normalized['fields'][0]['name'] );
	}

	public function test_validate_field_names_detects_duplicates(): void {
		$schema = new FormSchema();

		$errors = $schema->validate_field_names(
			array(
				array( 'name' => 'email' ),
				array( 'name' => 'email' ),
			)
		);

		self::assertArrayHasKey( 'email', $errors );
	}

	public function test_validate_submission_returns_type_errors(): void {
		$schema = new FormSchema();
		$form   = $schema->normalize_form(
			array(
				'fields' => array(
					array( 'type' => 'email', 'label' => 'Email', 'name' => 'email', 'required' => true ),
					array( 'type' => 'number', 'label' => 'Age', 'name' => 'age', 'required' => true ),
				),
			)
		);

		$errors = $schema->validate_submission(
			$form,
			array(
				'email' => 'nope',
				'age'   => 'abc',
			)
		);

		self::assertArrayHasKey( 'email', $errors );
		self::assertArrayHasKey( 'age', $errors );
	}
}
