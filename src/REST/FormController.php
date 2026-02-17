<?php
/**
 * REST form builder controller.
 *
 * @package NovaFormBuilder\REST
 */

declare(strict_types=1);

namespace NovaFormBuilder\REST;

use NovaFormBuilder\Contracts\FormRepositoryInterface;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class FormController {
	public function __construct( private FormRepositoryInterface $repository ) {}

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
				'methods'             => 'GET',
				'callback'            => array( $this, 'show' ),
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

	public function index(): WP_REST_Response {
		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $this->repository->all(),
			)
		);
	}

	public function show( WP_REST_Request $request ): WP_REST_Response {
		$id   = (int) $request['id'];
		$form = $this->repository->find( $id );

		if ( null === $form ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Form not found.', 'nova-form-builder' ),
				),
				404
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $form,
			)
		);
	}

	public function store( WP_REST_Request $request ): WP_REST_Response {
		$params = (array) $request->get_json_params();
		$id     = $this->repository->save( $this->sanitize_payload( $params ) );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => array(
					'id' => $id,
				),
			),
			201
		);
	}

	/**
	 * @param array<string,mixed> $payload Raw payload.
	 *
	 * @return array<string,mixed>
	 */
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
