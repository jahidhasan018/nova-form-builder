<?php
/**
 * Frontend shortcode rendering service.
 *
 * @package NovaFormBuilder\Services
 */

declare(strict_types=1);

namespace NovaFormBuilder\Services;

use NovaFormBuilder\Contracts\FormRepositoryInterface;
use NovaFormBuilder\Contracts\SettingsRepositoryInterface;

class ShortcodeService {
	public function __construct( private FormRepositoryInterface $repository, private SettingsRepositoryInterface $settings ) {}

	public function register(): void {
		add_shortcode( 'nova_form', array( $this, 'render_shortcode' ) );
	}

	/** @param array<string,mixed> $atts */
	public function render_shortcode( array $atts = array() ): string {
		$form_id = isset( $atts['id'] ) ? (int) $atts['id'] : 0;
		$form    = $this->repository->find( $form_id );
		if ( null === $form ) {
			return '<p>' . esc_html__( 'Form not found.', 'nova-form-builder' ) . '</p>';
		}

		$schema   = new FormSchema();
		$form     = $schema->normalize_form( $form );
		$settings = (array) ( $form['settings'] ?? array() );

		$preset       = sanitize_key( (string) ( $settings['style_preset'] ?? $this->settings->get( 'style_preset', 'modern' ) ) );
		$endpoint     = rest_url( 'nova-form/v1/submit' );
		$form_dom     = 'nova-form-shortcode-' . $form_id . '-' . wp_generate_uuid4();
		$submit_label = sanitize_text_field( (string) ( $settings['submit_label'] ?? $this->settings->get( 'submit_button_label', __( 'Submit', 'nova-form-builder' ) ) ) );
		$success_msg  = sanitize_text_field( (string) ( $settings['success_message'] ?? $this->settings->get( 'success_message', __( 'Thanks for submitting the form.', 'nova-form-builder' ) ) ) );
		$error_msg    = sanitize_text_field( (string) ( $settings['error_message'] ?? __( 'Please fix the highlighted fields.', 'nova-form-builder' ) ) );
		$redirect_url = esc_url_raw( (string) ( $settings['redirect_url'] ?? '' ) );
		$honeypot     = ! isset( $settings['spam_honeypot'] ) || ! empty( $settings['spam_honeypot'] );

		$rows = (array) ( $form['rows'] ?? array() );

		ob_start();
		?>
		<form class="nova-form-builder__contact-form nova-style-<?php echo esc_attr( $preset ); ?>" id="<?php echo esc_attr( $form_dom ); ?>" data-endpoint="<?php echo esc_url( $endpoint ); ?>" data-success-message="<?php echo esc_attr( $success_msg ); ?>" data-error-message="<?php echo esc_attr( $error_msg ); ?>" data-redirect-url="<?php echo esc_url( $redirect_url ); ?>" method="post" novalidate>
			<h3 class="nova-form-builder__title"><?php echo esc_html( (string) ( $form['name'] ?? 'Form' ) ); ?></h3>
			<div class="nova-form-builder__response" role="status" aria-live="polite"></div>
			<div class="nova-form-builder__error-summary" aria-live="polite" hidden></div>
			<input type="hidden" name="nonce" value="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>" />
			<input type="hidden" name="form_type" value="custom" />
			<input type="hidden" name="form_id" value="<?php echo esc_attr( (string) $form_id ); ?>" />
			<div class="nova-form-builder__rows">
				<?php foreach ( $rows as $row ) : ?>
					<?php $this->render_row( is_array( $row ) ? $row : array() ); ?>
				<?php endforeach; ?>
			</div>
			<?php if ( $honeypot ) : ?>
				<div class="nova-form-builder__honeypot" aria-hidden="true">
					<label for="website-<?php echo esc_attr( $form_dom ); ?>"><?php esc_html_e( 'Website', 'nova-form-builder' ); ?></label>
					<input id="website-<?php echo esc_attr( $form_dom ); ?>" name="website" type="text" tabindex="-1" autocomplete="off" />
				</div>
			<?php endif; ?>
			<button type="submit" class="nova-form-builder__submit"><?php echo esc_html( $submit_label ); ?></button>
		</form>
		<?php
		return (string) ob_get_clean();
	}

	/** @param array<string,mixed> $row */
	private function render_row( array $row ): void {
		$columns = (array) ( $row['columns'] ?? array() );
		if ( empty( $columns ) ) {
			return;
		}

		echo '<div class="nova-form-builder__row">';
		foreach ( $columns as $col ) {
			if ( ! is_array( $col ) ) {
				continue;
			}
			$width  = isset( $col['width'] ) ? (float) $col['width'] : 100;
			$fields = (array) ( $col['fields'] ?? array() );
			echo '<div class="nova-form-builder__column" style="width:' . esc_attr( $width . '%' ) . ';flex:0 0 ' . esc_attr( $width . '%' ) . ';">';
			foreach ( $fields as $field ) {
				if ( is_array( $field ) ) {
					$this->render_field( $field );
				}
			}
			echo '</div>';
		}
		echo '</div>';
	}

	/** @param array<string,mixed> $field */
	private function render_field( array $field ): void {
		$type        = sanitize_key( (string) ( $field['type'] ?? 'text' ) );
		$name        = sanitize_key( (string) ( $field['name'] ?? 'field_' . wp_generate_uuid4() ) );
		$label       = sanitize_text_field( (string) ( $field['label'] ?? 'Field' ) );
		$required    = ! empty( $field['required'] );
		$placeholder = sanitize_text_field( (string) ( $field['placeholder'] ?? '' ) );
		$help_text   = sanitize_text_field( (string) ( $field['help_text'] ?? '' ) );
		$default     = sanitize_text_field( (string) ( $field['default_value'] ?? '' ) );
		$choices     = (array) ( $field['choices'] ?? array() );
		$field_id    = 'nova-field-' . esc_attr( $name ) . '-' . wp_rand( 100, 99999 );

		if ( in_array( $type, array( 'html', 'section' ), true ) ) {
			echo '<div class="nova-form-builder__field-block"><div class="nova-form-builder__static">' . wp_kses_post( (string) ( $field['html'] ?? $label ) ) . '</div></div>';
			return;
		}
		?>
		<div class="nova-form-builder__field-block" data-field-key="<?php echo esc_attr( $name ); ?>">
			<div class="nova-form-builder__field-wrap">
				<?php if ( 'hidden' !== $type ) : ?>
					<label for="<?php echo esc_attr( $field_id ); ?>" class="nova-form-builder__label"><?php echo esc_html( $label ); ?><?php echo $required ? ' <span class="nova-form-builder__required">*</span>' : ''; ?></label>
				<?php endif; ?>
				<?php $this->render_input_by_type( $type, $name, $field_id, $required, $placeholder, $default, $choices, $field ); ?>
				<?php if ( '' !== $help_text ) : ?>
					<small class="nova-form-builder__help"><?php echo esc_html( $help_text ); ?></small>
				<?php endif; ?>
				<div class="nova-form-builder__field-error" aria-live="polite"></div>
			</div>
		</div>
		<?php
	}

	/**
	 * @param array<int,array<string,string>> $choices
	 * @param array<string,mixed> $field
	 */
	private function render_input_by_type( string $type, string $name, string $field_id, bool $required, string $placeholder, string $default, array $choices, array $field ): void {
		$required_attr = $required ? 'required' : '';
		if ( 'textarea' === $type ) {
			echo '<textarea id="' . esc_attr( $field_id ) . '" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $placeholder ) . '" ' . $required_attr . '>' . esc_textarea( $default ) . '</textarea>';
			return;
		}
		if ( in_array( $type, array( 'select', 'radio', 'checkbox-group' ), true ) ) {
			if ( 'select' === $type ) {
				echo '<select id="' . esc_attr( $field_id ) . '" name="' . esc_attr( $name ) . '" ' . $required_attr . '>';
				$ph = $placeholder ?: esc_html__( 'Select an option', 'nova-form-builder' );
				echo '<option value="">' . esc_html( $ph ) . '</option>';
				foreach ( $choices as $choice ) {
					$ch_label = is_array( $choice ) ? (string) ( $choice['label'] ?? '' ) : (string) $choice;
					$ch_value = is_array( $choice ) ? (string) ( $choice['value'] ?? $ch_label ) : $ch_label;
					$selected = ( $default === $ch_value ) ? ' selected' : '';
					echo '<option value="' . esc_attr( $ch_value ) . '"' . $selected . '>' . esc_html( $ch_label ) . '</option>';
				}
				echo '</select>';
				return;
			}
			echo '<div class="nova-form-builder__choices">';
			foreach ( $choices as $index => $choice ) {
				$ch_label = is_array( $choice ) ? (string) ( $choice['label'] ?? '' ) : (string) $choice;
				$ch_value = is_array( $choice ) ? (string) ( $choice['value'] ?? $ch_label ) : $ch_label;
				$id = $field_id . '-' . $index;
				if ( 'radio' === $type ) {
					echo '<label><input type="radio" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $ch_value ) . '" ' . $required_attr . ' /> ' . esc_html( $ch_label ) . '</label>';
				} else {
					echo '<label><input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '[]" value="' . esc_attr( $ch_value ) . '" /> ' . esc_html( $ch_label ) . '</label>';
				}
			}
			echo '</div>';
			return;
		}
		if ( 'checkbox' === $type || 'consent' === $type ) {
			echo '<label><input type="checkbox" id="' . esc_attr( $field_id ) . '" name="' . esc_attr( $name ) . '" value="1" ' . $required_attr . ' /> ' . esc_html( $placeholder ?: $default ?: __( 'Yes', 'nova-form-builder' ) ) . '</label>';
			return;
		}
		if ( 'file' === $type ) {
			$accept = sanitize_text_field( (string) ( $field['accept'] ?? '' ) );
			echo '<input type="file" id="' . esc_attr( $field_id ) . '" name="' . esc_attr( $name ) . '" accept="' . esc_attr( $accept ) . '" ' . $required_attr . ' />';
			return;
		}

		$input_type = in_array( $type, array( 'text', 'email', 'number', 'tel', 'url', 'date', 'time', 'hidden' ), true ) ? $type : 'text';
		echo '<input type="' . esc_attr( $input_type ) . '" id="' . esc_attr( $field_id ) . '" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $placeholder ) . '" value="' . esc_attr( $default ) . '" ' . $required_attr . ' />';
	}
}
