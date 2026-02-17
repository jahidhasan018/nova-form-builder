<?php
/**
 * WordPress option-backed forms repository.
 *
 * @package NovaFormBuilder\Repositories
 */

declare(strict_types=1);

namespace NovaFormBuilder\Repositories;

use NovaFormBuilder\Contracts\FormRepositoryInterface;

class WordPressFormRepository implements FormRepositoryInterface {
	private const OPTION_NAME = 'nova_form_builder_forms';

	public function all(): array {
		$forms = get_option( self::OPTION_NAME, array() );

		return is_array( $forms ) ? array_values( $forms ) : array();
	}

	public function find( int $id ): ?array {
		foreach ( $this->all() as $form ) {
			if ( isset( $form['id'] ) && (int) $form['id'] === $id ) {
				return $form;
			}
		}

		return null;
	}

	public function save( array $payload ): int {
		$forms = $this->all();
		$id    = isset( $payload['id'] ) ? (int) $payload['id'] : 0;

		if ( $id <= 0 ) {
			$existing_ids = array_map(
				static fn ( array $form ): int => isset( $form['id'] ) ? (int) $form['id'] : 0,
				$forms
			);
			$id           = empty( $existing_ids ) ? 1 : ( max( $existing_ids ) + 1 );
		}

		$sanitized = array(
			'id'         => $id,
			'name'       => sanitize_text_field( (string) ( $payload['name'] ?? 'Untitled Form' ) ),
			'settings'   => isset( $payload['settings'] ) && is_array( $payload['settings'] ) ? $payload['settings'] : array(),
			'fields'     => isset( $payload['fields'] ) && is_array( $payload['fields'] ) ? $payload['fields'] : array(),
			'updated_at' => gmdate( 'c' ),
		);

		$replaced = false;
		foreach ( $forms as $index => $form ) {
			if ( isset( $form['id'] ) && (int) $form['id'] === $id ) {
				$forms[ $index ] = $sanitized;
				$replaced        = true;
				break;
			}
		}

		if ( ! $replaced ) {
			$forms[] = $sanitized;
		}

		update_option( self::OPTION_NAME, array_values( $forms ), false );

		return $id;
	}
}
