( function () {
	'use strict';

	var forms = document.querySelectorAll( '.nova-form-builder__contact-form[data-endpoint]' );

	forms.forEach( function ( form ) {
		var responseNode = form.querySelector( '.nova-form-builder__response' );

		form.addEventListener( 'submit', function ( event ) {
			event.preventDefault();

			var website = form.querySelector( 'input[name="website"]' );
			if ( website && website.value.trim() !== '' ) {
				return;
			}

			var endpoint = form.getAttribute( 'data-endpoint' ) || '';
			var nonceNode = form.querySelector( 'input[name="nonce"]' );
			var submitButton = form.querySelector( 'button[type="submit"]' );
			var formData = new FormData( form );

			if ( ! endpoint || ! nonceNode ) {
				if ( responseNode ) {
					responseNode.textContent = 'Form configuration error.';
				}
				return;
			}

			if ( submitButton ) {
				submitButton.disabled = true;
			}

			if ( responseNode ) {
				responseNode.textContent = 'Sending...';
			}

			var payload = {
				form_type: String( formData.get( 'form_type' ) || 'contact' ),
				name: String( formData.get( 'name' ) || '' ),
				email: String( formData.get( 'email' ) || '' ),
				message: String( formData.get( 'message' ) || '' ),
			};

			fetch( endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': String( nonceNode.value || '' ),
				},
				body: JSON.stringify( payload ),
			} )
				.then( function ( response ) {
					return response.json();
				} )
				.then( function ( data ) {
					if ( data && data.success ) {
						if ( responseNode ) {
							responseNode.textContent = data.data && data.data.message ? data.data.message : 'Submission successful.';
						}
						form.reset();
						return;
					}

					if ( responseNode ) {
						if ( data && data.errors ) {
							var firstKey = Object.keys( data.errors )[ 0 ];
							responseNode.textContent = data.errors[ firstKey ] || 'Submission failed.';
						} else {
							responseNode.textContent = data && data.message ? data.message : 'Submission failed.';
						}
					}
				} )
				.catch( function () {
					if ( responseNode ) {
						responseNode.textContent = 'A network error occurred. Please try again.';
					}
				} )
				.finally( function () {
					if ( submitButton ) {
						submitButton.disabled = false;
					}
				} );
		} );
	} );
} )();
