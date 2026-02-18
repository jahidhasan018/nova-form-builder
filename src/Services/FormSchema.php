<?php
/**
 * Form schema normalization and validation.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

class FormSchema {
	public const SCHEMA_VERSION = 2;

	/**
	 * @return string[]
	 */
	public function allowed_field_types(): array {
		return array(
			'text',
			'email',
			'textarea',
			'number',
			'tel',
			'url',
			'select',
			'radio',
			'checkbox',
			'checkbox-group',
			'date',
			'time',
			'file',
			'hidden',
			'html',
			'section',
			'consent'
		);
	}

	/**
	 * @param array<string,mixed> $payload
	 *
	 * @return array<string,mixed>
	 */
	public function normalize_form( array $payload ): array {
		$fields = array();
		foreach ( (array) ( $payload['fields'] ?? array() ) as $field ) {
			if ( ! is_array( $field ) ) {
				continue;
			}
			$fields[] = $this->normalize_field( $field );
		}

		$settings = (array) ( $payload['settings'] ?? array() );
		$settings = array(
			'submit_label'    => sanitize_text_field( (string) ( $settings['submit_label'] ?? 'Submit' ) ),
			'success_message' => sanitize_text_field( (string) ( $settings['success_message'] ?? 'Thanks for submitting the form.' ) ),
			'error_message'   => sanitize_text_field( (string) ( $settings['error_message'] ?? 'Please fix the highlighted fields.' ) ),
			'redirect_url'    => esc_url_raw( (string) ( $settings['redirect_url'] ?? '' ) ),
			'spam_honeypot'   => ! isset( $settings['spam_honeypot'] ) || ! empty( $settings['spam_honeypot'] ),
			'style_preset'    => sanitize_key( (string) ( $settings['style_preset'] ?? 'modern' ) ),
		);

		$layout = array();
		foreach ( $fields as $field ) {
			$layout[] = array(
				'field'   => $field['name'],
				'columns' => (int) ( $field['columns'] ?? 1 ),
			);
		}

		return array(
			'id'             => isset( $payload['id'] ) ? (int) $payload['id'] : 0,
			'name'           => sanitize_text_field( (string) ( $payload['name'] ?? 'Untitled Form' ) ),
			'schema_version' => self::SCHEMA_VERSION,
			'settings'       => $settings,
			'layout'         => $layout,
			'fields'         => $fields,
		);
	}

	/**
	 * @param array<string,mixed> $field
	 *
	 * @return array<string,mixed>
	 */
	public function normalize_field( array $field ): array {
		$type = sanitize_key( (string) ( $field['type'] ?? 'text' ) );
		if ( ! in_array( $type, $this->allowed_field_types(), true ) ) {
			$type = 'text';
		}

		$name = sanitize_key( (string) ( $field['name'] ?? 'field_' . wp_generate_uuid4() ) );
		if ( '' === $name ) {
			$name = 'field_' . wp_generate_uuid4();
		}

		$choices = array();
		foreach ( (array) ( $field['choices'] ?? array() ) as $choice ) {
			$choice_label = sanitize_text_field( (string) $choice );
			if ( '' !== $choice_label ) {
				$choices[] = $choice_label;
			}
		}

		$columns = (int) ( $field['columns'] ?? 1 );
		if ( $columns < 1 || $columns > 3 ) {
			$columns = 1;
		}

		return array(
			'id'                => sanitize_key( (string) ( $field['id'] ?? wp_generate_uuid4() ) ),
			'type'              => $type,
			'label'             => sanitize_text_field( (string) ( $field['label'] ?? 'Field' ) ),
			'name'              => $name,
			'placeholder'       => sanitize_text_field( (string) ( $field['placeholder'] ?? '' ) ),
			'help_text'         => sanitize_text_field( (string) ( $field['help_text'] ?? '' ) ),
			'required'          => ! empty( $field['required'] ),
			'default_value'     => sanitize_text_field( (string) ( $field['default_value'] ?? '' ) ),
			'columns'           => $columns,
			'choices'           => $choices,
			'accept'            => sanitize_text_field( (string) ( $field['accept'] ?? '' ) ),
			'max_file_size_kb'  => max( 0, (int) ( $field['max_file_size_kb'] ?? 0 ) ),
			'conditional_logic' => is_array( $field['conditional_logic'] ?? null ) ? $field['conditional_logic'] : array(),
			'html'              => wp_kses_post( (string) ( $field['html'] ?? '' ) ),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $fields
	 *
	 * @return array<string,string>
	 */
	public function validate_field_names( array $fields ): array {
		$errors = array();
		$seen   = array();

		foreach ( $fields as $index => $field ) {
			$name = sanitize_key( (string) ( $field['name'] ?? '' ) );
			if ( '' === $name ) {
				$errors[ 'field_' . $index ] = __( 'Field key cannot be empty.', 'nova-form-builder' );
				continue;
			}
			if ( isset( $seen[ $name ] ) ) {
				$errors[ $name ] = __( 'Field key must be unique.', 'nova-form-builder' );
			}
			$seen[ $name ] = true;
		}

		return $errors;
	}

	/**
	 * @param array<string,mixed> $form
	 * @param array<string,mixed> $payload
	 *
	 * @return array<string,string>
	 */
	public function validate_submission( array $form, array $payload ): array {
		$errors = array();
		$fields = (array) ( $form['fields'] ?? array() );

		foreach ( $fields as $field ) {
			if ( ! is_array( $field ) ) {
				continue;
			}
			$key      = sanitize_key( (string) ( $field['name'] ?? '' ) );
			$type     = sanitize_key( (string) ( $field['type'] ?? 'text' ) );
			$required = ! empty( $field['required'] );
			$label    = sanitize_text_field( (string) ( $field['label'] ?? $key ) );
			if ( '' === $key ) {
				continue;
			}

			$value = $payload[ $key ] ?? '';
			if ( is_array( $value ) ) {
				$values = array_filter( array_map( static fn ( $item ) => sanitize_text_field( (string) $item ), $value ) );
				$value  = implode( ',', $values );
			} else {
				$value = sanitize_textarea_field( (string) $value );
			}

			if ( $required && '' === $value && ! in_array( $type, array( 'html', 'section', 'hidden' ), true ) ) {
				$errors[ $key ] = sprintf( __( '%s is required.', 'nova-form-builder' ), $label );
				continue;
			}

			if ( '' === $value ) {
				continue;
			}

			if ( 'email' === $type && ! is_email( $value ) ) {
				$errors[ $key ] = __( 'Please enter a valid email address.', 'nova-form-builder' );
			}
			if ( 'url' === $type && ! wp_http_validate_url( $value ) ) {
				$errors[ $key ] = __( 'Please enter a valid URL.', 'nova-form-builder' );
			}
			if ( 'number' === $type && ! is_numeric( $value ) ) {
				$errors[ $key ] = __( 'Please enter a valid number.', 'nova-form-builder' );
			}
			if ( 'consent' === $type && ! in_array( strtolower( $value ), array( '1', 'true', 'yes', 'on' ), true ) ) {
				$errors[ $key ] = __( 'Consent is required.', 'nova-form-builder' );
			}
		}

		return $errors;
	}
}
