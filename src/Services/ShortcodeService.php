<?php
/**
 * Frontend shortcode rendering service.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

use NovaFormBuilder\Contracts\FormRepositoryInterface;

class ShortcodeService {
	public function __construct( private FormRepositoryInterface $repository ) {}

	public function register(): void {
		add_shortcode( 'nova_form', array( $this, 'render_shortcode' ) );
	}

	/**
	 * @param array<string,mixed> $atts Shortcode attributes.
	 */
	public function render_shortcode( array $atts = array() ): string {
		$form_id = isset( $atts['id'] ) ? (int) $atts['id'] : 0;
		$form    = $this->repository->find( $form_id );
		if ( null === $form ) {
			return '<p>' . esc_html__( 'Form not found.', 'nova-form-builder' ) . '</p>';
		}

		$endpoint = rest_url( 'nova-form/v1/submit' );
		$form_dom = 'nova-form-shortcode-' . $form_id . '-' . wp_generate_uuid4();
		ob_start();
		?>
		<form class="nova-form-builder__contact-form" id="<?php echo esc_attr( $form_dom ); ?>" data-endpoint="<?php echo esc_url( $endpoint ); ?>" method="post">
			<h3><?php echo esc_html( (string) ( $form['name'] ?? 'Form' ) ); ?></h3>
			<div class="nova-form-builder__response" role="status" aria-live="polite"></div>
			<input type="hidden" name="nonce" value="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>" />
			<input type="hidden" name="form_type" value="custom" />
			<input type="hidden" name="form_id" value="<?php echo esc_attr( (string) $form_id ); ?>" />
			<?php foreach ( (array) ( $form['fields'] ?? array() ) as $field ) : ?>
				<?php $this->render_field( is_array( $field ) ? $field : array() ); ?>
			<?php endforeach; ?>
			<button type="submit"><?php esc_html_e( 'Submit', 'nova-form-builder' ); ?></button>
		</form>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * @param array<string,mixed> $field Field config.
	 */
	private function render_field( array $field ): void {
		$type     = sanitize_key( (string) ( $field['type'] ?? 'text' ) );
		$name     = sanitize_key( (string) ( $field['name'] ?? 'field_' . wp_generate_uuid4() ) );
		$label    = sanitize_text_field( (string) ( $field['label'] ?? 'Field' ) );
		$required = ! empty( $field['required'] );
		$width    = in_array( (string) ( $field['width'] ?? '100' ), array( '50', '100' ), true ) ? (string) $field['width'] : '100';
		?>
		<p style="width:<?php echo esc_attr( $width ); ?>%;padding-right:8px;box-sizing:border-box;float:left;">
			<label><?php echo esc_html( $label ); ?></label>
			<?php if ( 'textarea' === $type ) : ?>
				<textarea name="<?php echo esc_attr( $name ); ?>" <?php echo $required ? 'required' : ''; ?>></textarea>
			<?php else : ?>
				<input type="<?php echo esc_attr( in_array( $type, array( 'text', 'email', 'number', 'tel' ), true ) ? $type : 'text' ); ?>" name="<?php echo esc_attr( $name ); ?>" <?php echo $required ? 'required' : ''; ?> />
			<?php endif; ?>
		</p>
		<?php
	}
}
