/**
 * @ngdoc service
 * @name  core.service:WsApi
 * @requires ng.$q
 * @requires core.service:RestApi
 * @requires core.service:WsService
 *
 * @description
 *  A service wrapper for the webservices api.
 *
 */
core.service("WsApi", function ($q, RestApi, WsService) {

    var WsApi = this;

    var listenCount = 0;

    /**
     * @ngdoc method
     * @name  core.service:WsApi#WsApi.listen
     * @methodOf core.service:WsApi
     * @param {object} apiReq
     *  An apireq which containes the channel, controller and method
     *  which should be listened to.
     * @returns {Promsie} A promise from a websocket subscription subscription
     *
     * @description
     *  This method gives a promise which is notified upon
     *  websocket communication on the desired channel
     *
     */
    WsApi.listen = function (apiReq) {
        var request = '/ws/' + apiReq.controller + '/' + apiReq.method;
        var channel = apiReq.endpoint + "/" + apiReq.controller;

        if (apiReq.method) {
            channel += "/" + apiReq.method;
        }

        return WsService.subscribe(channel, listenCount++, true).defer.promise;
    };

    WsApi.clearSubscriptions = function () {
        WsService.unsubscribeAll();
        listenCount = 0;
    };

    /**
     * @ngdoc method
     * @name  core.service:WsApi#WsApi.fetch
     * @methodOf core.service:WsApi
     * @param {object} apiReq
     *  An apireq which containes the channel, controller and method
     *  which should be listened to.
     * @returns {Promsie} A promise from the WsService send method
     *
     * @description
     *  This method gives a promise which is resolved by id upon
     *  websocket communication on the desired channel
     *
     */
    WsApi.fetch = function (initialReq, manifest) {

        var apiReq = angular.copy(initialReq);

        if (manifest && manifest.pathValues) {
            for (var key in manifest.pathValues) {
                var value = manifest.pathValues[key];
                apiReq.method = apiReq.method.replace(new RegExp(':' + key, 'g'), value);
            }
        }

        if (manifest && manifest.data) {
            apiReq.data = manifest.data;
        }

        var restSend = (apiReq.data !== undefined && apiReq.data !== null) ? RestApi.post : RestApi.get;

        if (apiReq.useWebSockets) {
            var request = '/ws/' + apiReq.controller + '/' + apiReq.method;
            var channel = apiReq.endpoint + "/" + apiReq.controller + "/" + apiReq.method;

            var headers = {
                'jwt': sessionStorage.token
            };

            var payload = apiReq.data !== undefined && apiReq.data !== null ? JSON.stringify(apiReq.data) : JSON.stringify({});

            return WsService.send(request, headers, payload, channel);
        }

        return $q(function (resolve, reject) {
            restSend(apiReq).then(function (res) {
                console.log(res);
                resolve({
                    body: angular.toJson(res)
                });
            });
        });
    };

    return WsApi;

});
