core.directive("validationmessage", function () {
    return {
        template: '<span ng-include src="view"></span>',
        restrict: 'E',
        scope: {
            "type": "@",
            "property": "@",
            "form": "=",
            "validations": "=",
            "results": "="
        },
        link: function ($scope, element, attr) {
            $scope.view = attr.view ? attr.view : "bower_components/core/app/views/directives/validationMessage.html";
        }
    };
});
