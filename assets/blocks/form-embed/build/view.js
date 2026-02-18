(function () {
	'use strict';

	function clearErrors(form) {
		form.querySelectorAll('.nova-form-builder__field-wrap').forEach(function (wrap) {
			wrap.classList.remove('has-error');
			var errorNode = wrap.querySelector('.nova-form-builder__field-error');
			if (errorNode) {
				errorNode.textContent = '';
			}
		});

		var summary = form.querySelector('.nova-form-builder__error-summary');
		if (summary) {
			summary.textContent = '';
			summary.hidden = true;
		}
	}

	function setFieldErrors(form, errors) {
		if (!errors || typeof errors !== 'object') {
			return;
		}

		var summary = form.querySelector('.nova-form-builder__error-summary');
		var messages = [];

		Object.keys(errors).forEach(function (key) {
			var msg = String(errors[key] || '');
			if (!msg) {
				return;
			}
			messages.push(msg);
			var fieldWrap = form.querySelector('[data-field-key="' + key + '"] .nova-form-builder__field-wrap');
			if (fieldWrap) {
				fieldWrap.classList.add('has-error');
				var errorNode = fieldWrap.querySelector('.nova-form-builder__field-error');
				if (errorNode) {
					errorNode.textContent = msg;
				}
			}
		});

		if (summary && messages.length) {
			summary.textContent = messages.join(' ');
			summary.hidden = false;
		}
	}

	function serializeForm(form) {
		var formData = new FormData(form);
		var payload = {};
		formData.forEach(function (value, key) {
			if (key === 'website' || key === 'nonce') {
				return;
			}

			if (key.endsWith('[]')) {
				var arrayKey = key.slice(0, -2);
				if (!Array.isArray(payload[arrayKey])) {
					payload[arrayKey] = [];
				}
				payload[arrayKey].push(String(value));
				return;
			}

			if (value instanceof File) {
				if (value && value.name) {
					payload[key] = value.name;
				}
				return;
			}

			if (Object.prototype.hasOwnProperty.call(payload, key)) {
				if (!Array.isArray(payload[key])) {
					payload[key] = [payload[key]];
				}
				payload[key].push(String(value));
				return;
			}

			payload[key] = String(value);
		});

		return payload;
	}

	var forms = document.querySelectorAll('.nova-form-builder__contact-form[data-endpoint]');

	forms.forEach(function (form) {
		var responseNode = form.querySelector('.nova-form-builder__response');

		form.addEventListener('submit', function (event) {
			event.preventDefault();
			clearErrors(form);

			var website = form.querySelector('input[name="website"]');
			if (website && website.value.trim() !== '') {
				return;
			}

			var endpoint = form.getAttribute('data-endpoint') || '';
			var nonceNode = form.querySelector('input[name="nonce"]');
			var submitButton = form.querySelector('button[type="submit"]');
			var payload = serializeForm(form);

			if (!endpoint || !nonceNode) {
				if (responseNode) {
					responseNode.textContent = 'Form configuration error.';
				}
				return;
			}

			if (submitButton) {
				submitButton.disabled = true;
				form.classList.add('is-loading');
			}

			if (responseNode) {
				responseNode.textContent = 'Sending...';
				responseNode.classList.remove('is-error');
			}

			fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': String(nonceNode.value || '')
				},
				body: JSON.stringify(payload)
			})
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
					if (data && data.success) {
						if (responseNode) {
							var defaultMessage = form.getAttribute('data-success-message') || 'Submission successful.';
							responseNode.textContent = (data.data && data.data.message) ? data.data.message : defaultMessage;
						}
						if (data.data && data.data.redirect_url) {
							window.location.href = data.data.redirect_url;
							return;
						}
						form.reset();
						return;
					}

					setFieldErrors(form, data && data.errors ? data.errors : {});
					if (responseNode) {
						responseNode.classList.add('is-error');
						responseNode.textContent = (data && data.message) ? data.message : (form.getAttribute('data-error-message') || 'Submission failed.');
					}
				})
				.catch(function () {
					if (responseNode) {
						responseNode.classList.add('is-error');
						responseNode.textContent = 'A network error occurred. Please try again.';
					}
				})
				.finally(function () {
					if (submitButton) {
						submitButton.disabled = false;
						form.classList.remove('is-loading');
					}
				});
		});
	});
}());
