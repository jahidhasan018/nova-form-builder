<?php
/**
 * Admin dashboard settings page.
 *
 * @package NovaFormBuilder\Admin
 */

declare(strict_types=1);

namespace NovaFormBuilder\Admin;

use NovaFormBuilder\Contracts\SettingsRepositoryInterface;

class SettingsPage {
	private const MENU_SLUG = 'nova-form-builder';

	private const OPTION_GROUP = 'nova_form_builder_settings_group';

	private const OPTION_NAME = 'nova_form_builder_settings';

	public function __construct( private SettingsRepositoryInterface $settings_repository ) {}

	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	public function register_menu(): void {
		add_menu_page(
			__( 'NovaForm Builder', 'nova-form-builder' ),
			__( 'NovaForm Builder', 'nova-form-builder' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render' ),
			'dashicons-feedback',
			58
		);
	}

	public function register_settings(): void {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_NAME,
			array(
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
				'default'           => $this->default_settings(),
			)
		);

		add_settings_section(
			'nova_form_builder_general',
			__( 'General Features', 'nova-form-builder' ),
			static function (): void {
				echo '<p>' . esc_html__( 'Control NovaForm Builder plugin features.', 'nova-form-builder' ) . '</p>';
			},
			self::MENU_SLUG
		);

		add_settings_field(
			'enable_webhook',
			__( 'Enable Webhook Integration', 'nova-form-builder' ),
			array( $this, 'render_enable_webhook_field' ),
			self::MENU_SLUG,
			'nova_form_builder_general'
		);

		add_settings_field(
			'webhook_url',
			__( 'Webhook URL', 'nova-form-builder' ),
			array( $this, 'render_webhook_url_field' ),
			self::MENU_SLUG,
			'nova_form_builder_general'
		);

		add_settings_field(
			'enable_email_notifications',
			__( 'Enable Email Notifications', 'nova-form-builder' ),
			array( $this, 'render_enable_email_notifications_field' ),
			self::MENU_SLUG,
			'nova_form_builder_general'
		);
	}

	/**
	 * @param array<string,mixed> $settings Raw settings.
	 *
	 * @return array<string,mixed>
	 */
	public function sanitize_settings( array $settings ): array {
		return array(
			'enable_webhook'             => ! empty( $settings['enable_webhook'] ),
			'webhook_url'                => esc_url_raw( (string) ( $settings['webhook_url'] ?? '' ) ),
			'enable_email_notifications' => ! empty( $settings['enable_email_notifications'] ),
		);
	}

	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to access this page.', 'nova-form-builder' ) );
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'NovaForm Builder Dashboard', 'nova-form-builder' ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::OPTION_GROUP );
				do_settings_sections( self::MENU_SLUG );
				submit_button( __( 'Save Settings', 'nova-form-builder' ) );
				?>
			</form>
		</div>
		<?php
	}

	public function render_enable_webhook_field(): void {
		$enabled = (bool) $this->settings_repository->get( 'enable_webhook', false );
		?>
		<label>
			<input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[enable_webhook]" value="1" <?php checked( $enabled ); ?> />
			<?php esc_html_e( 'Allow outbound webhook delivery after each submission.', 'nova-form-builder' ); ?>
		</label>
		<?php
	}

	public function render_webhook_url_field(): void {
		$webhook_url = (string) $this->settings_repository->get( 'webhook_url', '' );
		?>
		<input
			type="url"
			class="regular-text"
			name="<?php echo esc_attr( self::OPTION_NAME ); ?>[webhook_url]"
			value="<?php echo esc_attr( $webhook_url ); ?>"
			placeholder="https://example.com/webhook"
		/>
		<?php
	}

	public function render_enable_email_notifications_field(): void {
		$enabled = (bool) $this->settings_repository->get( 'enable_email_notifications', true );
		?>
		<label>
			<input type="checkbox" name="<?php echo esc_attr( self::OPTION_NAME ); ?>[enable_email_notifications]" value="1" <?php checked( $enabled ); ?> />
			<?php esc_html_e( 'Send email notifications to the site admin after submission.', 'nova-form-builder' ); ?>
		</label>
		<?php
	}

	/**
	 * @return array<string,mixed>
	 */
	private function default_settings(): array {
		return array(
			'enable_webhook'             => false,
			'webhook_url'                => '',
			'enable_email_notifications' => true,
		);
	}
}
