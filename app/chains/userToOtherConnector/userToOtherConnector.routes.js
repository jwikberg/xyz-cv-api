'use strict';

/**
 * Module dependencies.
 */
var userToOtherConnectorController = require('./userToOtherConnector.controller');
var responseHandler = require('../../utils/response.handler');
var authentication = require('../../middleware/authentication.middleware');

module.exports = function(routes) {

    // create an userToOtherConnector
    routes.post('/', authentication.isAllowedOrSelf('canEditUser', 'body', 'userId'), function(request, response) {
        userToOtherConnectorController.createUserToOtherConnector(request.body)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get all userToOtherConnectors by query
    routes.get('/', authentication.isAllowed('canViewUser'), function(request, response) {
        userToOtherConnectorController.getUserToOtherConnectors(request.query)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    //get userToOtherConnector by id
    routes.get('/:id', authentication.isAllowed('canViewUser'), function(request, response) {
        userToOtherConnectorController.getUserToOtherConnectorById(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));

    });

    // update a userToOtherConnector given an id and an object
    routes.put('/:id', authentication.isAllowedOrOwnConnector('canEditUser', userToOtherConnectorController.getUserToOtherConnectorById), function(request, response) {
        userToOtherConnectorController.updateUserToOtherConnector(request.params.id, request.body, request.headers['x-forwarded-email'])
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));

    });

    // delete the userToOtherConnector with the given id
    routes.delete('/:id', authentication.isAllowedOrOwnConnector('canEditUser', userToOtherConnectorController.getUserToOtherConnectorById), function(request, response) {
        userToOtherConnectorController.deleteUserToOtherConnectorById(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete userToOtherConnectors containing the given user id
    routes.delete('/user/:id', authentication.isAllowedOrSelf('canEditUser', 'params', 'id'), function(request, response) {
        userToOtherConnectorController.deleteUserToOtherConnectorsByUserId(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete userToOtherConnectors containing the given other id
    routes.delete('/other/:id', authentication.isAllowed('canEditUser'), function(request, response) {
        userToOtherConnectorController.deleteUserToOtherConnectorsByOtherId(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
