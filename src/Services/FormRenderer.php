<?php
/**
 * Form rendering service.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

use NovaFormBuilder\Forms\Form;

class FormRenderer {
	public function render( Form $form ): string {
		$output = sprintf( '<form class="nova-form" data-form-id="%s">', esc_attr( $form->id() ) );
		$output .= sprintf( '<h3>%s</h3>', esc_html( $form->title() ) );

		foreach ( $form->fields() as $field ) {
			$output .= sprintf(
				'<label>%s<input name="%s" type="%s" %s /></label>',
				esc_html( $field->label() ),
				esc_attr( $field->name() ),
				esc_attr( $field->type() ),
				$field->required() ? 'required' : ''
			);
		}

		$output .= '</form>';

		return $output;
	}
}
