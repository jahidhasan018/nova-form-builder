<?php
/**
 * Contact form Gutenberg block.
 *
 * @package NovaFormBuilder\Blocks
 */

declare(strict_types=1);

namespace NovaFormBuilder\Blocks;

class ContactFormBlock extends AbstractBlock {
	protected function name(): string {
		return 'nova-form-builder/contact-form';
	}

	protected function block_json_path(): string {
		return $this->plugin_path . 'assets/blocks/contact-form';
	}

	/**
	 * Renders frontend markup.
	 *
	 * @param array<string,mixed> $attributes Block attributes.
	 *
	 * @return string
	 */
	public function render( array $attributes = array() ): string {
		$form_title   = isset( $attributes['formTitle'] ) ? sanitize_text_field( (string) $attributes['formTitle'] ) : __( 'Contact Us', 'nova-form-builder' );
		$submit_label = isset( $attributes['submitLabel'] ) ? sanitize_text_field( (string) $attributes['submitLabel'] ) : __( 'Send Message', 'nova-form-builder' );
		$form_id      = 'nova-form-' . wp_generate_uuid4();

		ob_start();
		?>
		<form id="<?php echo esc_attr( $form_id ); ?>" class="nova-form-builder__contact-form" method="post">
			<h3><?php echo esc_html( $form_title ); ?></h3>
			<input type="hidden" name="nonce" value="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>" />
			<input type="hidden" name="form_type" value="contact" />

			<p>
				<label for="<?php echo esc_attr( $form_id . '-name' ); ?>"><?php esc_html_e( 'Name', 'nova-form-builder' ); ?></label>
				<input id="<?php echo esc_attr( $form_id . '-name' ); ?>" name="name" type="text" required />
			</p>
			<p>
				<label for="<?php echo esc_attr( $form_id . '-email' ); ?>"><?php esc_html_e( 'Email', 'nova-form-builder' ); ?></label>
				<input id="<?php echo esc_attr( $form_id . '-email' ); ?>" name="email" type="email" required />
			</p>
			<p>
				<label for="<?php echo esc_attr( $form_id . '-message' ); ?>"><?php esc_html_e( 'Message', 'nova-form-builder' ); ?></label>
				<textarea id="<?php echo esc_attr( $form_id . '-message' ); ?>" name="message" rows="5" required></textarea>
			</p>
			<button type="submit"><?php echo esc_html( $submit_label ); ?></button>
		</form>
		<?php

		return (string) ob_get_clean();
	}
}
