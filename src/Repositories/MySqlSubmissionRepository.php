<?php
/**
 * MySQL submission repository implementation.
 *
 * @package NovaFormBuilder\Repositories
 */

declare(strict_types=1);

namespace NovaFormBuilder\Repositories;

class MySqlSubmissionRepository implements SubmissionRepositoryInterface {
	private string $table_name;

	public function __construct() {
		global $wpdb;
		$this->table_name = $wpdb->prefix . 'nova_form_builder_submissions';
	}

	public function create_table(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$sql             = "CREATE TABLE {$this->table_name} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			form_type VARCHAR(64) NOT NULL,
			payload LONGTEXT NOT NULL,
			ip_address VARCHAR(45) NOT NULL,
			created_at DATETIME NOT NULL,
			PRIMARY KEY (id),
			KEY form_type (form_type)
		) {$charset_collate};";

		dbDelta( $sql );
	}

	public function insert( array $payload ): int {
		global $wpdb;

		$form_type = sanitize_key( (string) ( $payload['form_type'] ?? 'general' ) );
		$encoded   = wp_json_encode( $payload );
		$ip        = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';

		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO {$this->table_name} (form_type, payload, ip_address, created_at) VALUES (%s, %s, %s, %s)",
				$form_type,
				false === $encoded ? '{}' : $encoded,
				$ip,
				current_time( 'mysql', true )
			)
		);

		return (int) $wpdb->insert_id;
	}
}
