<?php
/**
 * REST form builder controller.
 *
 * @package NovaFormBuilder\REST
 */

declare(strict_types=1);

namespace NovaFormBuilder\REST;

use NovaFormBuilder\Contracts\FormRepositoryInterface;
use NovaFormBuilder\Repositories\SubmissionRepositoryInterface;
use NovaFormBuilder\Services\FormSchema;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class FormController {
	public function __construct( private FormRepositoryInterface $repository, private SubmissionRepositoryInterface $submission_repository, private ?FormSchema $schema = null ) {
		$this->schema = $this->schema ?? new FormSchema();
	}

	public function register_routes(): void {
		register_rest_route(
			'nova-form/v1',
			'/forms',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'index' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'store' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);

		register_rest_route(
			'nova-form/v1',
			'/forms/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'show' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'destroy' ),
					'permission_callback' => array( $this, 'can_manage' ),
				),
			)
		);

		register_rest_route(
			'nova-form/v1',
			'/forms/(?P<id>\d+)/duplicate',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'duplicate' ),
				'permission_callback' => array( $this, 'can_manage' ),
			)
		);
	}

	/**
	 * @return true|WP_Error
	 */
	public function can_manage() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 'forbidden', __( 'You are not allowed to manage forms.', 'nova-form-builder' ), array( 'status' => 403 ) );
		}
		return true;
	}

	public function index( WP_REST_Request $request ): WP_REST_Response {
		$forms = $this->repository->all();
		$forms = array_map( fn ( array $form ): array => $this->schema->normalize_form( $form ), $forms );
		$ids   = array_map( static fn ( array $form ): int => isset( $form['id'] ) ? (int) $form['id'] : 0, $forms );
		$counts = $this->submission_repository->count_by_form_ids( $ids );

		foreach ( $forms as &$form ) {
			$id                    = isset( $form['id'] ) ? (int) $form['id'] : 0;
			$form['entries_count'] = $counts[ $id ] ?? 0;
		}

		$page    = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = max( 1, min( 100, (int) $request->get_param( 'per_page' ) ?: 20 ) );
		$total   = count( $forms );
		$offset  = ( $page - 1 ) * $per_page;
		$paged   = array_slice( $forms, $offset, $per_page );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $paged,
				'meta'    => array(
					'total'    => $total,
					'page'     => $page,
					'per_page' => $per_page,
				),
			)
		);
	}

	public function show( WP_REST_Request $request ): WP_REST_Response {
		$id   = (int) $request['id'];
		$form = $this->repository->find( $id );
		if ( null === $form ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Form not found.', 'nova-form-builder' ) ), 404 );
		}
		return new WP_REST_Response( array( 'success' => true, 'data' => $this->schema->normalize_form( $form ) ) );
	}

	public function store( WP_REST_Request $request ): WP_REST_Response {
		$payload = $this->schema->normalize_form( (array) $request->get_json_params() );
		$name_errors = $this->schema->validate_field_names( (array) $payload['fields'] );
		if ( ! empty( $name_errors ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'code'    => 'invalid_field_names',
					'message' => __( 'Please fix field key conflicts before saving.', 'nova-form-builder' ),
					'errors'  => $name_errors,
				),
				422
			);
		}
		$id = $this->repository->save( $payload );
		return new WP_REST_Response( array( 'success' => true, 'data' => array( 'id' => $id ) ), 201 );
	}

	public function duplicate( WP_REST_Request $request ): WP_REST_Response {
		$id   = (int) $request['id'];
		$form = $this->repository->find( $id );
		if ( null === $form ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Form not found.', 'nova-form-builder' ) ), 404 );
		}
		$normalized         = $this->schema->normalize_form( $form );
		$normalized['id']   = 0;
		$normalized['name'] = sanitize_text_field( (string) $normalized['name'] . ' (Copy)' );
		$new_id             = $this->repository->save( $normalized );

		return new WP_REST_Response( array( 'success' => true, 'data' => array( 'id' => $new_id ) ), 201 );
	}

	public function destroy( WP_REST_Request $request ): WP_REST_Response {
		$id = (int) $request['id'];
		$this->repository->save( array( 'id' => $id, 'name' => '__deleted__', 'fields' => array(), 'settings' => array() ) );
		$forms = array_filter(
			$this->repository->all(),
			static fn ( array $form ): bool => isset( $form['id'] ) && (int) $form['id'] !== $id
		);
		update_option( 'nova_form_builder_forms', array_values( $forms ), false );
		return new WP_REST_Response( array( 'success' => true ) );
	}
}
