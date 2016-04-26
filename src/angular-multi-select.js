var angular_multi_select = angular.module('angular-multi-select', [
	'angular-multi-select-utils',
	'angular-multi-select-engine',
	'angular-multi-select-constants',
	'angular-multi-select-styles-helper',
	'angular-multi-select-data-converter'
]);

angular_multi_select.directive('angularMultiSelect', [
	'$http',
	'$compile',
	'$timeout',
	'$rootScope',
	'$templateCache',
	'angularMultiSelectUtils',
	'angularMultiSelectEngine',
	'angularMultiSelectConstants',
	'angularMultiSelectStylesHelper',
	'angularMultiSelectDataConverter',
	function ($http, $compile, $timeout, $rootScope, $templateCache, angularMultiSelectUtils, angularMultiSelectEngine, angularMultiSelectConstants, angularMultiSelectStylesHelper, angularMultiSelectDataConverter) {
		'use strict';
		return {
			restrict: 'AE',

			scope: {
				inputModel: '=',
				outputModel: '=?'
			},

			link: function ($scope, element, attrs) {
				var template = $templateCache.get('angular-multi-select.tpl');
				var content = $compile(template)($scope);
				element.append(content);

				var self = {};
				$scope.self = self; //We need to access 'self' from the template
				//TODO. Replace all the $scope pollution with calls to 'self' from the template

				self.react_to_data_changes = false;
				self.react_to_visual_changes = true;

				var amsu = new angularMultiSelectUtils();

				/*
				 █████  ████████ ████████ ██████  ██ ██████  ██    ██ ████████ ███████ ███████
				██   ██    ██       ██    ██   ██ ██ ██   ██ ██    ██    ██    ██      ██
				███████    ██       ██    ██████  ██ ██████  ██    ██    ██    █████   ███████
				██   ██    ██       ██    ██   ██ ██ ██   ██ ██    ██    ██    ██           ██
				██   ██    ██       ██    ██   ██ ██ ██████   ██████     ██    ███████ ███████
				*/
				/*
				* Find out what are the properties names of the important bits
				* of the input data.
				*/
				$scope.ops = {
					DEBUG             : attrs.debug === "true" ? true : false,
					NAME              : attrs.name,
					MAX_CHECKED_LEAFS : parseInt(attrs.maxCheckedLeafs),

					ID_PROPERTY       : attrs.idProperty,
					OPEN_PROPERTY     : attrs.openProperty,
					CHECKED_PROPERTY  : attrs.checkedProperty,
					CHILDREN_PROPERTY : attrs.childrenProperty
				};
				$scope.ops = amsu.sanitize_ops($scope.ops);

				/*
				 * Set the directive's name as attribute. If it exists, it will be overriten with
				 * the same value, else, it will be set with the autogenerated value. This is required
				 * for the visibility code.
				 */
				element.attr("name", $scope.ops.NAME);

				/*
				 * Find out if the input data should be threated in some special way.
				 */
				self.do_not_check_data   = attrs.doNotCheckData   === "true" ? true : false;
				self.do_not_convert_data = attrs.doNotConvertData === "true" ? true : false;

				/*
				 * Find out if the output data should be converted in some special way.
				 */
				self.output_keys   = amsu.array_from_attr(attrs.outputKeys);
				self.output_type   = attrs.outputType   === undefined ? 'objects' : attrs.outputType;
				self.output_filter = attrs.outputFilter === undefined ? angularMultiSelectConstants.FIND_LEAFS : attrs.outputFilter;

				/*
				 * Find out which field to use for the 'search' functionality.
				 */
				$scope.search_field = attrs.searchField === undefined ? null : attrs.searchField;

				/*
				 * Find out if something should be preselected.
				 */
				self.preselect = amsu.array_from_attr(attrs.preselect);
				amsu.parse_pairs(self.preselect);

				/*
				 * Find out if some of the helpers should be hidden.
				 */
				$scope.hide_helpers = amsu.array_from_attr(attrs.hideHelpers);

				/*
				 █████  ███    ███ ███████      ██████  ██████       ██ ███████  ██████ ████████ ███████
				██   ██ ████  ████ ██          ██    ██ ██   ██      ██ ██      ██         ██    ██
				███████ ██ ████ ██ ███████     ██    ██ ██████       ██ █████   ██         ██    ███████
				██   ██ ██  ██  ██      ██     ██    ██ ██   ██ ██   ██ ██      ██         ██         ██
				██   ██ ██      ██ ███████      ██████  ██████   █████  ███████  ██████    ██    ███████
				*/
				$scope.amsc = angularMultiSelectConstants;
				var amse = new angularMultiSelectEngine($scope.ops);
				var amssh = new angularMultiSelectStylesHelper($scope.ops, attrs);
				var amsdc = new angularMultiSelectDataConverter($scope.ops);
				$scope.amse = amse;
				$scope.amssh = amssh;

				/*
				██████  ██████   ██████   █████  ██████   ██████  █████  ███████ ████████
				██   ██ ██   ██ ██    ██ ██   ██ ██   ██ ██      ██   ██ ██         ██
				██████  ██████  ██    ██ ███████ ██   ██ ██      ███████ ███████    ██
				██   ██ ██   ██ ██    ██ ██   ██ ██   ██ ██      ██   ██      ██    ██
				██████  ██   ██  ██████  ██   ██ ██████   ██████ ██   ██ ███████    ██
				*/
				$scope.toggle_open_node = function (item) {
					$rootScope.$broadcast('ams_toggle_open_node', {
						name: $scope.ops.NAME,
						item: JSON.parse(JSON.stringify(
							amsdc.to_external([item])[0]
						))
					});
					amse.toggle_open_node(item);
				};

				$scope.toggle_check_node = function (item) {
					$rootScope.$broadcast('ams_toggle_check_node', {
						name: $scope.ops.NAME,
						item: JSON.parse(JSON.stringify(
							amsdc.to_external([item])[0]
						))
					});
					amse.toggle_check_node(item);
				};

				/*
				 ██████  ███    ██     ███████ ██    ██ ███████ ███    ██ ████████ ███████
				██    ██ ████   ██     ██      ██    ██ ██      ████   ██    ██    ██
				██    ██ ██ ██  ██     █████   ██    ██ █████   ██ ██  ██    ██    ███████
				██    ██ ██  ██ ██     ██       ██  ██  ██      ██  ██ ██    ██         ██
				 ██████  ██   ████     ███████   ████   ███████ ██   ████    ██    ███████
				*/
				$rootScope.$on('ams_do_check_all', function(event, args) {
					if (args.name === $scope.ops.NAME || args.name === '*') amse.check_all();
				});

				$rootScope.$on('ams_do_uncheck_all', function(event, args) {
					if (args.name === $scope.ops.NAME || args.name === '*') amse.uncheck_all();
				});

				$rootScope.$on('ams_do_reset', function(event, args) {
					if (args.name === $scope.ops.NAME || args.name === '*') $scope.reset();
				});

				$rootScope.$on('ams_do_toggle_open_node', function(event, args) {
					if (args.name === $scope.ops.NAME || args.name === '*') amse.toggle_open_node(amse.get_item(args.item));
				});

				$rootScope.$on('ams_do_toggle_check_node', function(event, args) {
					if (args.name === $scope.ops.NAME || args.name === '*') amse.toggle_check_node(amse.get_item(args.item));
				});

				/*
				██    ██ ██ ███████ ██ ██████  ██ ██      ██ ████████ ██    ██
				██    ██ ██ ██      ██ ██   ██ ██ ██      ██    ██     ██  ██
				██    ██ ██ ███████ ██ ██████  ██ ██      ██    ██      ████
				 ██  ██  ██      ██ ██ ██   ██ ██ ██      ██    ██       ██
				  ████   ██ ███████ ██ ██████  ██ ███████ ██    ██       ██
				*/
				$scope.open = false;
				$scope.onclick_listener = function (event) {
					if (!event.target) {
						return;
					}

					if (!amsu.element_belongs_to_directive(event.target, $scope.ops.NAME)) {
						$scope.open = false;
						$scope.$apply();
					}
				};
				document.addEventListener('click', $scope.onclick_listener);

				/*
				 * Show the directive to the left/right and at the top/bottom
				 * of the button itself, depending on the available space.
				 */
				$scope.$watch('open', function (_new, _old) {
					if (_new !== true) {
						return;
					}

					$timeout(function () {
						amssh.transform_position(element);
					});
				});

				/*
				████████ ██     ██ ███████  █████  ██   ██ ███████
				   ██    ██     ██ ██      ██   ██ ██  ██  ██
				   ██    ██  █  ██ █████   ███████ █████   ███████
				   ██    ██ ███ ██ ██      ██   ██ ██  ██       ██
				   ██     ███ ███  ███████ ██   ██ ██   ██ ███████
				*/

				/*
				 * Prevent the scroll event bubbling to the parents on the DOM.
				 */
				amsu.prevent_scroll_bubbling(element[0].getElementsByClassName('ams-items')[0]);

				/*
				 * Make keyboard navigation possible.
				 */
				$scope.focused_index = -1;
				$scope.onkeypress_listener = function (event) {
					if ($scope.open === false) {
						return;
					}

					amsu.process_kb_input(event, $scope, element);
				};
				document.addEventListener('keydown', $scope.onkeypress_listener);

				/*
				██   ██ ███████ ██      ██████  ███████ ██████  ███████
				██   ██ ██      ██      ██   ██ ██      ██   ██ ██
				███████ █████   ██      ██████  █████   ██████  ███████
				██   ██ ██      ██      ██      ██      ██   ██      ██
				██   ██ ███████ ███████ ██      ███████ ██   ██ ███████
				*/
				/*
				 * The 'reset_model' will be filled in with the first available
				 * data from the input model and will be used when the 'reset'
				 * function is triggered.
				 */
				$scope.reset_model = null;
				$scope.reset       = function () {
					self.init($scope.reset_model);
				};

				/*
				███████ ███████  █████  ██████   ██████ ██   ██
				██      ██      ██   ██ ██   ██ ██      ██   ██
				███████ █████   ███████ ██████  ██      ███████
				     ██ ██      ██   ██ ██   ██ ██      ██   ██
				███████ ███████ ██   ██ ██   ██  ██████ ██   ██
				*/
				$scope.search = "";
				self.search_promise = null;
				$scope.search_spinner_visible = false;
				$scope.$watch('search', function (_new, _old) {
					if (_new === _old && _new === "") {
						return;
					}

					if($scope.search_field === null) {
						return;
					}

					/*
					 * This means that there was a search, but it was deleted
					 * and now the normal tree should be repainted.
					 */
					if (_new === "") {
						if (self.search_promise !== null) {
							$timeout.cancel(self.search_promise);
						}
						$scope.items = amse.get_visible_tree();
						$scope.search_spinner_visible = false;

						$timeout(function () {
							amssh.transform_position(element);
						});
						return;
					}

					/*
					 * If the code execution gets here, it means that there is
					 * a search that should be performed
					 */
					if (self.search_promise !== null) {
						$timeout.cancel(self.search_promise);
					}

					$scope.search_spinner_visible = true;
					var _search_fn = function (query) {
						self.search_promise = $timeout(function () {
							//TODO: this needs a lot of improving. Maybe use lunar.js?
							var filter = [];
							filter.push({
								field: $scope.search_field,
								query: query
							});

							$scope.items = amse.get_filtered_tree(filter);
							$scope.search_spinner_visible = false;

							$timeout(function () {
								amssh.transform_position(element);
							});
						}, 1500, true);
					};
					_search_fn(_new); // Hack for Angular <1.4 support
				});

				/*
				 ██████  ███    ██     ██████   █████  ████████  █████       ██████ ██   ██  █████  ███    ██  ██████  ███████
				██    ██ ████   ██     ██   ██ ██   ██    ██    ██   ██     ██      ██   ██ ██   ██ ████   ██ ██       ██
				██    ██ ██ ██  ██     ██   ██ ███████    ██    ███████     ██      ███████ ███████ ██ ██  ██ ██   ███ █████
				██    ██ ██  ██ ██     ██   ██ ██   ██    ██    ██   ██     ██      ██   ██ ██   ██ ██  ██ ██ ██    ██ ██
				 ██████  ██   ████     ██████  ██   ██    ██    ██   ██      ██████ ██   ██ ██   ██ ██   ████  ██████  ███████
				*/
				amse.on_data_change_fn = function () {
					if (self.react_to_data_changes === false) {
						return;
					}

					/*
					 * Will be triggered every time the internal model data is changed.
					 * That could happen on check/uncheck, for example.
					 */

					$scope.stats = amse.get_stats();
					/*
					 * Get the visible tree only once. Consecutive calls on un/check
					 * will automatically propagate to the rendered tree.
					 */
					$scope.items = amse.get_visible_tree();

					var checked_tree = amse.get_checked_tree(self.output_filter);

					/*
					 * Remove internal (undeeded) data.
					 */
					var res = amsdc.to_external(checked_tree);

					/*
					 * This is used to create the dropdown label.
					 */
					if (typeof(attrs.dropdownLabel) === "string" && attrs.dropdownLabel.indexOf("outputModelIterator" > -1)) {
						$scope.outputModelNotFormatted = JSON.parse(JSON.stringify(res));
					}

					/*
					 * Convert the data to the desired output.
					 */
					res = amsdc.to_format(res, self.output_type, self.output_keys);

					/*
					 * Don't do anything else if the output model hasn't changed.
					 */
					if (angular.equals($scope.outputModel, res)) {
						return;
					}

					$scope.outputModel = res;
					$timeout(function () {
						$rootScope.$broadcast('ams_output_model_change', {
							name: $scope.ops.NAME
						});
					});
				};

				/*
				 ██████  ███    ██     ██    ██ ██ ███████ ██    ██  █████  ██           ██████ ██   ██  █████  ███    ██  ██████  ███████
				██    ██ ████   ██     ██    ██ ██ ██      ██    ██ ██   ██ ██          ██      ██   ██ ██   ██ ████   ██ ██       ██
				██    ██ ██ ██  ██     ██    ██ ██ ███████ ██    ██ ███████ ██          ██      ███████ ███████ ██ ██  ██ ██   ███ █████
				██    ██ ██  ██ ██      ██  ██  ██      ██ ██    ██ ██   ██ ██          ██      ██   ██ ██   ██ ██  ██ ██ ██    ██ ██
				 ██████  ██   ████       ████   ██ ███████  ██████  ██   ██ ███████      ██████ ██   ██ ██   ██ ██   ████  ██████  ███████
				*/
				amse.on_visual_change_fn = function () {
					/*
					 * Will be triggered when a change that requires a visual change happende.
					 * This is normaly on open/close actions.
					 */
					$scope.items = amse.get_visible_tree();

					/*
					 * This is required to avoid weird gaps appearing between the items
					 * container and the button if the amount of shown items changes.
					 */
					$timeout(function () {
						amssh.transform_position(element);
					});
				};

				/*
				███    ███  █████  ██ ███    ██
				████  ████ ██   ██ ██ ████   ██
				██ ████ ██ ███████ ██ ██ ██  ██
				██  ██  ██ ██   ██ ██ ██  ██ ██
				██      ██ ██   ██ ██ ██   ████
				*/
				self.prepare_data = function (data) {
					if (!Array.isArray(data)) {
						return [];
					}

					var checked_data  = self.do_not_check_data   ? data         : amsdc.check_prerequisites(data);
					var internal_data = self.do_not_convert_data ? checked_data : amsdc.to_internal(checked_data);

					return internal_data;
				};

				self.init = function (data) {
					$scope.reset_model = JSON.parse(JSON.stringify(data));

					amse.insert(data);

					for (var i = 0; i < self.preselect.length; i += 2) {
						amse.check_node_by([self.preselect[i], self.preselect[i + 1]]);
					}

					$timeout(function () {
						$rootScope.$broadcast('ams_input_model_change', {
							name: $scope.ops.NAME
						});
					});
				};

				$scope.$watch('inputModel', function (_new, _old) {
					self.react_to_data_changes = false;
					/*
					* The entry point of the directive. This monitors the input data and
					* decides when to populate the internal data model and how to do it.
					*/
					var data;
					if (typeof(_new) === "string") {
						try {
							data = self.prepare_data(JSON.parse(_new));
							self.init(data);
							self.react_to_data_changes = true;
							amse.on_data_change();
						} catch (e) {
							$http.get(_new).then(function (response) {
								data = self.prepare_data(response.data);
								self.init(data);
								self.react_to_data_changes = true;
								amse.on_data_change();
							});
						}
					} else {
						data = self.prepare_data(_new);
						self.init(data);
						self.react_to_data_changes = true;
						amse.on_data_change();
					}
				});

				$scope.$on('$destroy', function () {
					amse.remove_collection($scope.ops.NAME);
					document.removeEventListener('click', $scope.onclick_listener);
					document.removeEventListener('keydown', $scope.onkeypress_listener);
				});
			}
		};
	}
]);
