'use strict';

/**
 * Module dependencies.
 */
var authentication = require('../../middleware/authentication.middleware');
var skillGroupController = require('./skillGroup.controller');
var responseHandler = require('../../utils/response.handler');

module.exports = function(routes) {

    // create a skillGroup
    routes.post('/', authentication.isAllowed('canEditSkillGroup'), function(request, response) {
        skillGroupController.createNewSkillGroup(request.body)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get skillGroups by query
    routes.get('/', function(request, response) {
        skillGroupController.getSkillGroups(request.query)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get a skillGroup by the given id
    routes.get('/:id', function(request, response) {
        skillGroupController.getSkillGroupById(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // update a skillGroup given an id and an object
    routes.put('/:id', authentication.isAllowedOrOwnConnector('canEditSkillGroup', skillGroupController.getSkillGroupById), function(request, response) {
        skillGroupController.updateSkillGroup(request.params.id, request.body, request.headers['x-forwarded-email'])
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete a skillGroup given an id
    routes.delete('/:id', authentication.isAllowed('canEditSkillGroup'), function(request, response) {
        skillGroupController.deleteSkillGroupById(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
