'use strict';

/**
 * Module dependencies.
 */
var otherController = require('./other.controller');
var responseHandler = require('../../utils/response.handler');
var authentication = require('../../middleware/authentication.middleware');
var config = require('config');

module.exports = function(routes) {

    // create a other
    routes.post('/', authentication.isAllowed('canViewOther'), function(request, response) {
        otherController.createNewOther(request.body)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get others by query
    routes.get('/', authentication.isAllowed('canViewOther'), function(request, response) {
        otherController.getOthers(request.query)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get a other by the given id
    routes.get('/:id', authentication.isAllowed('canViewOther'), function(request, response) {
        otherController.getOtherById(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete a other given an id
    routes.delete('/:id', authentication.isAllowed('canEditOther'), function(request, response) {
        otherController.deleteOtherById(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // create an indice
    routes.post('/_indice', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        otherController.createIndex(request.body, request.query)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete all indices for others
    routes.delete('/_indice', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        otherController.purgeIndices()
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
