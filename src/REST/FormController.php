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
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class FormController {
	public function __construct( private FormRepositoryInterface $repository, private SubmissionRepositoryInterface $submission_repository ) {}

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

	public function index(): WP_REST_Response {
		$forms  = $this->repository->all();
		$ids    = array_map( static fn ( array $form ): int => isset( $form['id'] ) ? (int) $form['id'] : 0, $forms );
		$counts = $this->submission_repository->count_by_form_ids( $ids );

		foreach ( $forms as &$form ) {
			$id                    = isset( $form['id'] ) ? (int) $form['id'] : 0;
			$form['entries_count'] = $counts[ $id ] ?? 0;
		}

		return new WP_REST_Response( array( 'success' => true, 'data' => $forms ) );
	}

	public function show( WP_REST_Request $request ): WP_REST_Response {
		$id   = (int) $request['id'];
		$form = $this->repository->find( $id );
		if ( null === $form ) {
			return new WP_REST_Response( array( 'success' => false, 'message' => __( 'Form not found.', 'nova-form-builder' ) ), 404 );
		}
		return new WP_REST_Response( array( 'success' => true, 'data' => $form ) );
	}

	public function store( WP_REST_Request $request ): WP_REST_Response {
		$id = $this->repository->save( $this->sanitize_payload( (array) $request->get_json_params() ) );
		return new WP_REST_Response( array( 'success' => true, 'data' => array( 'id' => $id ) ), 201 );
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

	/** @param array<string,mixed> $payload */
	private function sanitize_payload( array $payload ): array {
		$fields = array();
		if ( isset( $payload['fields'] ) && is_array( $payload['fields'] ) ) {
			foreach ( $payload['fields'] as $field ) {
				if ( ! is_array( $field ) ) {
					continue;
				}
				$fields[] = array(
					'id'       => sanitize_key( (string) ( $field['id'] ?? wp_generate_uuid4() ) ),
					'type'     => sanitize_key( (string) ( $field['type'] ?? 'text' ) ),
					'label'    => sanitize_text_field( (string) ( $field['label'] ?? 'Field' ) ),
					'name'     => sanitize_key( (string) ( $field['name'] ?? 'field_' . wp_generate_uuid4() ) ),
					'required' => ! empty( $field['required'] ),
					'width'    => in_array( (string) ( $field['width'] ?? '100' ), array( '50', '100' ), true ) ? (string) $field['width'] : '100',
				);
			}
		}
		return array(
			'id'       => isset( $payload['id'] ) ? (int) $payload['id'] : 0,
			'name'     => sanitize_text_field( (string) ( $payload['name'] ?? 'Untitled Form' ) ),
			'settings' => isset( $payload['settings'] ) && is_array( $payload['settings'] ) ? $payload['settings'] : array(),
			'fields'   => $fields,
		);
	}
}
