'use strict';

/* add-dataset-modal
 *
 * This JavaScript module handles showing/hiding the add dataset modal.
 *
 */

this.ckan.module('add-dataset-modal', function($) {
  return {
    initialize: function() {
      $.proxyAll(this, /_on/)

      this.el.on('click', this._onAddDatasetClick)

      this.datasetModal = $('.add-dataset-modal')
      this.datasetModalBackdrop = $('.add-dataset-modal-backdrop')
      this.dismissButton = this.datasetModal.find('button[data-dismiss="modal"]')

      this.datasetModalBackdrop.on('click', this._onCloseModal)
      this.dismissButton.on('click', this._onCloseModal)
    },
    _onAddDatasetClick: function(event) {
      this.datasetModal.show()
      this.datasetModalBackdrop.show()
    },
    _onCloseModal(event) {
      this.datasetModal.hide()
      this.datasetModalBackdrop.hide()
    }
  }
})

(function() {
  var visibilitySelect = document.querySelector('#field-private')

  // Select the "Public" option
  visibilitySelect.selectedIndex = 1

  // For some reason, other script is reenabling the select, so we need to add
  // a timeout
  setTimeout(function() {
    visibilitySelect.setAttribute('disabled', 'disabled')
  }, 500)
})()

/* expand-dataset
 *
 * This JavaScript module handles toggling arrow icon for expand/contract 
 *
 */

this.ckan.module('expand-dataset', function($) {
  return {
    initialize: function() {
      $.proxyAll(this, /_on/)

      this.el.on('click', this._onArrowClick)
    },
    _onArrowClick: function(event) {
      var arrow = this.el.find('i')
      var iconRight = 'icon-chevron-right' 
      var iconDown = 'icon-chevron-down'
      var prefix = ''

      if (arrow.hasClass('glyphicon')) {
        prefix = 'glyph'
      }

      iconRight = prefix + iconRight
      iconDown = prefix + iconDown

      if (arrow.hasClass(iconRight)) {
        arrow.removeClass(iconRight)
        arrow.addClass(iconDown)
      } else if (arrow.hasClass(iconDown)) {
        arrow.removeClass(iconDown)
        arrow.addClass(iconRight)
      }
    }
  }
})


'use strict';

/* filter-requests
 *
 * This JavaScript module handles filtering requests.
 *
 */

this.ckan.module('filter-requests', function($) {

  return {
    initialize: function() {
      $.proxyAll(this, /_on/)

      this.checkboxes = this.el.find('input[type=checkbox]')
      this._populateCheckboxes()

      this.el.on('click', 'button[data-action]', this._onClick)
    },
    _onClick: function(event) {
      event.stopPropagation()
      event.preventDefault()

      var action = $(event.target).attr('data-action')
      var nextLocation = ''
      var param = ''
      var checked = false
      var params = null
      var paramFound = false

      if (action === 'apply') {
        if (window.location.search == '') {
          params = []
        } else {
          params = window.location.search.split('&')
        }

        if (this.options.type == 'maintainer') {
          param = 'filter_by_maintainers=org:' + this.options.org_name + '|maintainers:'

          this.checkboxes.each(function(i, el) {
            if (el.checked) {
              checked = true
              param += el.value + ','
            }
          })

          if (checked) {

            // Remove the comma at the end of the string
            param = param.slice(0, -1)
          } else {

            // If none of the checkboxes are clicked, show all requests
            param += '*all*'
          }

          params.forEach(function(item, i) {

            // If the current filter is already applied, just update it to
            // prevent duplication
            if (item.indexOf('filter_by_maintainers=org:' + this.options.org_name) > -1) {
              paramFound = true
              params[i] = param
            }
          }.bind(this))
        } else if (this.options.type == 'organization') {
          param = 'filter_by_organizations='

          this.checkboxes.each(function(i, el) {
            if (el.checked) {
              checked = true
              param += el.value + ','
            }
          })

          if (checked) {

            // Remove the comma at the end of the string
            param = param.slice(0, -1)
          } else {
            var copy_params = [].concat(params)

            copy_params.forEach(function(item, i) {
              if (item.indexOf('filter_by_organizations') > -1) {
                params.splice(i, 1)
              }
            })

            if (params[0] && params[0].indexOf('?') === -1) {
              params[0] = '?' + params[0]
            }

            params = params.join('&')

            location.href = location.origin + location.pathname + params
          }

          params.forEach(function(item, i) {

            // If the current filter is already applied, just update it to
            // prevent duplication
            if (item.indexOf('filter_by_organizations') > -1) {
              paramFound = true
              params[i] = param
            }
          }.bind(this))
        }

        // If this is a new param then push it to all params
        if (!paramFound) {
          params.push(param)
        }

        if (params[0].indexOf('?') === -1) {
          params[0] = '?' + params[0]
        }

        params = params.join('&')

        location.href = location.origin + location.pathname + params
      } else if (action === 'reset') {
        this.checkboxes.attr('checked', false)
      }
    },
    // Populate checkboxes for filters depending on the filters applied
    _populateCheckboxes: function() {
      var current_url = location.toString();
      var parameters = [];
      var parameter;
      var query;

      try {
        query = current_url.match(/\?(.+)$/)[1].split('&');

        for (var i = 0; i < query.length; i++) {
          parameter = query[i].split('=');

          if (parameter.length === 1) {
              parameter[1] = '';
          }

          var data = {}

          data[decodeURIComponent(parameter[0])] = decodeURIComponent(parameter[1])

          parameters.push(data)
        }
      } catch(error) {

      }

      parameters.forEach(function(param) {
        var filters;
        var org;
        var maintainers;

        if (param.filter_by_maintainers) {
          filters = param.filter_by_maintainers.split('|')
          org = filters[0].split(':')[1]
          maintainers = filters[1].split(':')[1].split(',')

          if (org === this.options.org_name && maintainers[0] !== '*all*') {
            this.checkboxes.each(function(i, checkbox) {
              if (maintainers.indexOf(checkbox.value) > -1) {
                $(checkbox).attr('checked', true)
              }
            })
          }
        } else if (param.filter_by_organizations) {
          var organizations = param.filter_by_organizations.split(',')

          this.checkboxes.each(function(i, checkbox) {
            if (organizations.indexOf(checkbox.value) > -1) {
              $(checkbox).attr('checked', true)
            }
          })
        }
      }.bind(this))
    }
  }
})

'use strict';

/* handle-open-request
 *
 * This JavaScript module handles actions to an open request.
 *
 */

this.ckan.module('handle-open-request', function($) {
  var api = {
    get: function(action, params) {
        var base_url = ckan.sandbox().client.endpoint
        params = $.param(params)
        var url = base_url + '/api/action/' + action + '?' + params

        return $.getJSON(url)
    },
    post: function(action, data) {
      var base_url = ckan.sandbox().client.endpoint
      var url = base_url + '/api/action/' + action

      return $.post(url, JSON.stringify(data), 'json')
    }
  }

  function _showAlert(message, className, duration) {
    var alert = $('.request-message-alert');

    alert.find('.alert-text').html(message);
    alert.addClass(className);
    alert.show();

    setTimeout(function() {
      alert.hide();
      alert.removeClass(className);
    }, duration);
  }

  return {
    initialize: function() {
      $.proxyAll(this, /_on/)

      this.buttonClicked = false

      this.el.on('click', this._onClick)
    },
    _onClick: function(event) {
      if (this.buttonClicked) return

      var base_url = ckan.sandbox().client.endpoint
      var url = base_url + this.options.action || ''
      var payload = this.options.post_data || {}

      this.el.attr('disabled', 'disabled')

      this.buttonClicked = true;

      $.post(url, payload, 'json')
        .done(function(data) {
          var className = ''
          var message = ''

          data = JSON.parse(data)

          if (data.success) {
            if (payload.data_shared === true) {
              className = 'icon-thumbs-up'
            } else {
              className = 'icon-thumbs-down'
            }

            this._disableActionButtons(payload.data_shared)

            if (this.options.refresh_on_success) {
              location.reload();
            }
          } else if (data.error && data.error.fields) {
            for (var key in data.error.fields) {
              message += key + ': ' + data.error.fields[key] + '<br>'
            }

            _showAlert(message, 'alert-danger', 4000)

            this.el.removeAttr('disabled')
          }
        }.bind(this))
        .error(function(error) {
          this.el.removeAttr('disabled')
        }.bind(this))
    },
    _disableActionButtons: function(data_shared) {
      this.el.attr('disabled', 'disabled')
      this.el.siblings('.btn').attr('disabled', 'disabled')
    }
  }
})

'use strict';

/* modal-form
 *
 * This JavaScript module creates a modal and responds to actions
 *
 */

this.ckan.module('modal-form', function($) {
    var api = {
        get: function(action, params, api_ver = 3) {
            var base_url = ckan.sandbox().client.endpoint;
            params = $.param(params);
            var url = base_url + '/api/' + api_ver + '/action/' + action + '?' + params;
            return $.getJSON(url);
        },
        post: function(action, data, api_ver = 3) {
            var base_url = ckan.sandbox().client.endpoint;
            var url = base_url + '/api/' + api_ver + '/action/' + action;
            return $.post(url, JSON.stringify(data), "json");
        }
    };

    return {
        initialize: function() {
            $.proxyAll(this, /_on/);

            this.el.on('click', this._onClick);
        },
        // Whether or not the rendered snippet has already been received from CKAN.
        _snippetReceived: false,
        _onClick: function(event) {
            var is_current_user_a_maintainer = this.options.is_current_user_a_maintainer
            var dialogResult = true

            if (is_current_user_a_maintainer === 'True') {
                var dialogResult = window.confirm('Request own dataset\n\nWARNING: You are a maintainer of the dataset you are requesting. Do you wish to continue making this request?')
            }

            if (dialogResult) {
                var base_url = ckan.sandbox().client.endpoint;

                if (!this.options.is_logged_in) {
                    if(this.options.is_hdx == 'True'){
                        showOnboardingWidget('#loginPopup');
                        return;
                     }
                  location.href = base_url + this.options.redirect_url
                  return;
                }
                var payload = {
                    message_content: this.options.message_content,
                    package_name: this.options.post_data.package_name,
                    package_title: this.options.post_data.package_title,
                    maintainers: JSON.stringify(this.options.post_data.maintainers),
                    requested_by: this.options.post_data.requested_by,
                    sender_id: this.options.post_data.sender_id
                }
                if (!this._snippetReceived) {
                    this.sandbox.client.getTemplate(this.options.template_file, payload, this._onReceiveSnippet);
                    this._snippetReceived = true;
                } else if (this.modal) {
                    this.modal.modal('show');
                }

                var success_msg = document.querySelector('#request-success-container');

                if (success_msg) {
                    success_msg.parentElement.removeChild(success_msg);
                }
            }
        },
        _onReceiveSnippet: function(html) {
            this.sandbox.body.append(this.createModal(html));
            this.modal.modal('show');

            var backdrop = $('.modal-backdrop');

            if (backdrop) {
                backdrop.on('click', this._onCancel);
            }
        },
        createModal: function(html) {
            if (!this.modal) {
                var element = this.modal = jQuery(html);
                element.on('click', '.btn-primary', this._onSubmit);
                element.on('click', '.btn-cancel', this._onCancel);
                element.modal({
                    show: false
                });
                this.modalFormError = this.modal.find('.alert-error')
            }
            return this.modal;
        },
        _onSubmit: function(event) {
            var base_url = ckan.sandbox().client.endpoint;
            var url = base_url + this.options.submit_action || '';
            var data = this.options.post_data || '';
            var form = this.modal.find('form')
            var formElements = $(form[0].elements)
            var submit = true
            var formData = new FormData();

            // Clear form errors before submitting the form.
            this._clearFormErrors(form)

            for (var item in data) {
              formData.append(item, data[item])
            }

            // Add field data to payload data
            $.each(formElements, function(i, element) {
                var value = element.value.trim()

                if (element.required && value === '') {
                    var hasError = element.parentElement.querySelector('.error-block')

                    if (!hasError) {
                        this._showInputError(element, 'Missing value')
                    }

                    submit = false
                } else {
                    if (element.type == 'file') {
                       if (element.files.length > 0) {
                             formData.append(element.name, element.files[0], element.value)

                             // If a file has been attached, than move the request to archive
                            // and mark it that data has been shared

                             formData.append('state', 'archive')
                             formData.append('data_shared', true)
                      }
                    } else {
                      formData.append(element.name, element.value)
                    }
                }
            }.bind(this))

            if (submit) {
              $.ajax({
                url: url,
                data: formData,
                processData: false,
                contentType: false,
                type: 'POST'
              })
                .done(function(data) {
                    data = JSON.parse(data)
                    if (data.error && data.error.fields) {
                        for(var key in data.error.fields){
                            this._showFormError(data.error.fields[key]);
                        }
                    } else if (data.success) {
                        this._showSuccessMsg(data.message);

                        if (this.options.disable_action_buttons) {
                          this._disableActionButtons();
                        }

                        if (this.options.refresh_on_success) {
                          location.reload();
                        }
                    }
                }.bind(this))
                .error(function(error) {
                    this._showFormError(error.statusText)
                }.bind(this))
            }
        },
        _onCancel: function(event) {
            this._snippetReceived = false;
            this._clearFormErrors()
            this._resetModalForm();
        },
        _showInputError: function(element, message) {
            var div = document.createElement('div');
            div.className = 'error-block';
            div.textContent = message;

            element.parentElement.appendChild(div);
        },
        _clearFormErrors: function() {
            var errors = this.modal.find('.error-block')

            $.each(errors, function(i, error) {
                error.parentElement.removeChild(error)
            })

            this.modalFormError.addClass('hide')
            this.modalFormError.text('')
        },
        _showFormError: function(message) {
            this.modalFormError.removeClass('hide')
            this.modalFormError.text(message)
        },
        _showSuccessMsg: function(msg) {
            var div = document.createElement('div');
            div.className = "alert alert-success alert-dismissable fade in";
            div.id = 'request-success-container'
            div.textContent = msg;
            div.style.marginTop = '25px';
            var currentDiv = $('.requested-data-message')

            if (currentDiv.length > 1) {
                currentDiv = this.el.next('.requested-data-message');
            }
            currentDiv.css('display', 'block');
            currentDiv.append(div)
            this._resetModalForm();
        },
        _resetModalForm: function(){
            this.modal.modal('hide');
            // Clear form fields
            this.modal.find('form')[0].reset();
        },
        _disableActionButtons: function() {
            this.el.attr('disabled', 'disabled');
            this.el.siblings('.btn').attr('disabled', 'disabled');
        }
    };
});
