<?php
/**
 * Main application bootstrap.
 *
 * @package NovaFormBuilder\Core
 */

declare(strict_types=1);

namespace NovaFormBuilder\Core;

use NovaFormBuilder\Admin\FormListPage;
use NovaFormBuilder\Admin\SettingsPage;
use NovaFormBuilder\Blocks\ContactFormBlock;
use NovaFormBuilder\Blocks\FormEmbedBlock;
use NovaFormBuilder\Contracts\FormRepositoryInterface;
use NovaFormBuilder\Integrations\EmailIntegrationService;
use NovaFormBuilder\Integrations\WebhookIntegrationService;
use NovaFormBuilder\Repositories\MySqlSubmissionRepository;
use NovaFormBuilder\Repositories\SubmissionRepositoryInterface;
use NovaFormBuilder\Repositories\WordPressFormRepository;
use NovaFormBuilder\Repositories\WordPressSettingsRepository;
use NovaFormBuilder\REST\FormController;
use NovaFormBuilder\REST\SettingsController;
use NovaFormBuilder\REST\SubmissionController;
use NovaFormBuilder\Services\FormSchema;
use NovaFormBuilder\Services\ShortcodeService;

class Application {
	private Container $container;

	private string $plugin_file;

	public function __construct( string $plugin_file ) {
		$this->plugin_file = $plugin_file;
		$this->container   = new Container();
	}

	public function boot(): void {
		$this->register_services();
		$this->register_hooks();
	}

	private function register_services(): void {
		$this->container->set( 'settings_repository', static fn (): WordPressSettingsRepository => new WordPressSettingsRepository() );
		$this->container->set( 'form_repository', static fn (): FormRepositoryInterface => new WordPressFormRepository() );
		$this->container->set( 'repository', static fn (): SubmissionRepositoryInterface => new MySqlSubmissionRepository() );

		$this->container->set( 'email_integration', fn ( Container $c ): EmailIntegrationService => new EmailIntegrationService( $c->get( 'settings_repository' ) ) );
		$this->container->set( 'webhook_integration', fn ( Container $c ): WebhookIntegrationService => new WebhookIntegrationService( $c->get( 'settings_repository' ) ) );
		$this->container->set( 'shortcode_service', fn ( Container $c ): ShortcodeService => new ShortcodeService( $c->get( 'form_repository' ), $c->get( 'settings_repository' ) ) );
		$this->container->set( 'form_schema', static fn (): FormSchema => new FormSchema() );

		$this->container->set(
			'submission_controller',
			fn ( Container $c ): SubmissionController => new SubmissionController( $c->get( 'repository' ), $c->get( 'form_repository' ), $c->get( 'email_integration' ), $c->get( 'webhook_integration' ), null, $c->get( 'form_schema' ) )
		);
		$this->container->set( 'form_controller', fn ( Container $c ): FormController => new FormController( $c->get( 'form_repository' ), $c->get( 'repository' ), $c->get( 'form_schema' ) ) );
		$this->container->set( 'settings_controller', fn ( Container $c ): SettingsController => new SettingsController( $c->get( 'settings_repository' ) ) );

		$this->container->set( 'contact_form_block', fn ( Container $c ): ContactFormBlock => new ContactFormBlock( $this->plugin_url(), $this->plugin_path(), $c->get( 'settings_repository' ) ) );
		$this->container->set( 'form_embed_block', fn ( Container $c ): FormEmbedBlock => new FormEmbedBlock( $this->plugin_url(), $this->plugin_path(), $c->get( 'shortcode_service' ) ) );

		$this->container->set( 'admin_settings_page', fn (): SettingsPage => new SettingsPage( $this->plugin_url() ) );
		$this->container->set( 'admin_form_list_page', fn (): FormListPage => new FormListPage( $this->plugin_url() ) );
	}

	private function register_hooks(): void {
		add_action( 'init', function (): void {
			$this->container->get( 'contact_form_block' )->register();
			$this->container->get( 'form_embed_block' )->register();
			$this->container->get( 'shortcode_service' )->register();
		} );

		add_action( 'rest_api_init', function (): void {
			$this->container->get( 'submission_controller' )->register_routes();
			$this->container->get( 'form_controller' )->register_routes();
			$this->container->get( 'settings_controller' )->register_routes();
		} );

		add_action( 'wp_enqueue_scripts', function (): void {
			wp_enqueue_style( 'nova-form-builder-frontend', $this->plugin_url() . 'assets/frontend/forms.css', array(), '1.0.0' );
		} );

		if ( is_admin() ) {
			$this->container->get( 'admin_form_list_page' )->register_hooks();
			$this->container->get( 'admin_settings_page' )->register_hooks();
		}

		register_activation_hook( $this->plugin_file, array( $this, 'on_activate' ) );
	}

	public function on_activate(): void {
		/** @var MySqlSubmissionRepository $repository */
		$repository = $this->container->get( 'repository' );
		$repository->create_table();
	}

	private function plugin_url(): string {
		return plugin_dir_url( $this->plugin_file );
	}

	private function plugin_path(): string {
		return plugin_dir_path( $this->plugin_file );
	}
}
