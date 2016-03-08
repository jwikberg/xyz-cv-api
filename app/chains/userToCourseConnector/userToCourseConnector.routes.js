'use strict';

/**
 * Module dependencies.
 */
var userToCourseConnectorController = require('./userToCourseConnector.controller');
var responseHandler = require('../../utils/response.handler');
var authentication = require('../../middleware/authentication.middleware');

module.exports = function(routes) {

    // create an userToCourseConnector
    routes.post('/', authentication.isAllowedOrSelf('canEditUser', 'body', 'userId'), function(request, response) {
        userToCourseConnectorController.createUserToCourseConnector(request.body)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get all userToCourseConnectors by query
    routes.get('/', authentication.isAllowed('canViewUser'), function(request, response) {
        userToCourseConnectorController.getUserToCourseConnectors(request.query)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    //get userToCourseConnector by id
    routes.get('/:id', authentication.isAllowed('canViewUser'), function(request, response) {
        userToCourseConnectorController.getUserToCourseConnectorById(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));

    });

    // update a userToCourseConnector given an id and an object
    routes.put('/:id', authentication.isAllowedOrOwnConnector('canEditUser', userToCourseConnectorController.getUserToCourseConnectorById), function(request, response) {
        userToCourseConnectorController.updateUserToCourseConnector(request.params.id, request.body, request.headers['x-forwarded-email'])
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));

    });

    // delete the userToCourseConnector with the given id
    routes.delete('/:id', authentication.isAllowedOrOwnConnector('canEditUser', userToCourseConnectorController.getUserToCourseConnectorById), function(request, response) {
        userToCourseConnectorController.deleteUserToCourseConnectorById(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete userToCourseConnectors containing the given user id
    routes.delete('/user/:id', authentication.isAllowedOrSelf('canEditUser', 'params', 'id'), function(request, response) {
        userToCourseConnectorController.deleteUserToCourseConnectorsByUserId(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete userToCourseConnectors containing the given course id
    routes.delete('/course/:id', authentication.isAllowed('canEditUser'), function(request, response) {
        userToCourseConnectorController.deleteUserToCourseConnectorsByCourseId(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
