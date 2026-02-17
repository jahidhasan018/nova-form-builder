<?php
/**
 * Main application bootstrap.
 *
 * @package NovaFormBuilder\Core
 */

declare(strict_types=1);

namespace NovaFormBuilder\Core;

use NovaFormBuilder\Blocks\ContactFormBlock;
use NovaFormBuilder\Contracts\ServiceProviderInterface;
use NovaFormBuilder\Integrations\EmailIntegrationService;
use NovaFormBuilder\Integrations\WebhookIntegrationService;
use NovaFormBuilder\Repositories\MySqlSubmissionRepository;
use NovaFormBuilder\Repositories\SubmissionRepositoryInterface;
use NovaFormBuilder\REST\SubmissionController;
use NovaFormBuilder\Services\FormValidator;

/**
 * Bootstraps plugin services and lifecycle hooks.
 */
class Application {
	private Container $container;

	private string $plugin_file;

	public function __construct( string $plugin_file ) {
		$this->plugin_file = $plugin_file;
		$this->container   = new Container();
	}

	/**
	 * Boot plugin.
	 *
	 * @return void
	 */
	public function boot(): void {
		$this->register_services();
		$this->register_hooks();
	}

	/**
	 * Registers all service definitions.
	 *
	 * @return void
	 */
	private function register_services(): void {
		$this->container->set(
			'validator',
			static fn (): FormValidator => new FormValidator()
		);

		$this->container->set(
			'repository',
			static fn (): SubmissionRepositoryInterface => new MySqlSubmissionRepository()
		);

		$this->container->set(
			'email_integration',
			static fn (): EmailIntegrationService => new EmailIntegrationService()
		);

		$this->container->set(
			'webhook_integration',
			static fn (): WebhookIntegrationService => new WebhookIntegrationService()
		);

		$this->container->set(
			'submission_controller',
			function ( Container $container ): SubmissionController {
				return new SubmissionController(
					$container->get( 'validator' ),
					$container->get( 'repository' ),
					$container->get( 'email_integration' ),
					$container->get( 'webhook_integration' )
				);
			}
		);

		$this->container->set(
			'contact_form_block',
			function (): ContactFormBlock {
				return new ContactFormBlock(
					$this->plugin_url(),
					$this->plugin_path()
				);
			}
		);
	}

	/**
	 * Registers runtime hooks with delegated services.
	 *
	 * @return void
	 */
	private function register_hooks(): void {
		add_action(
			'init',
			function (): void {
				$this->container->get( 'contact_form_block' )->register();
			}
		);

		add_action(
			'rest_api_init',
			function (): void {
				$this->container->get( 'submission_controller' )->register_routes();
			}
		);

		register_activation_hook( $this->plugin_file, array( $this, 'on_activate' ) );
	}

	/**
	 * Create custom tables on activation.
	 *
	 * @return void
	 */
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
