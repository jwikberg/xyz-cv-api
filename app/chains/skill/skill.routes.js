'use strict';

/**
 * Module dependencies.
 */
var skillController = require('./skill.controller');
var responseHandler = require('../../utils/response.handler');
var authentication = require('../../middleware/authentication.middleware');
var config = require('config');

module.exports = function(routes) {

    // create a skill
    routes.post('/', authentication.isAllowed('canViewSkill'), function(request, response) {
        skillController.createNewSkill(request.body)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get skills by query
    routes.get('/', authentication.isAllowed('canViewSkill'), function(request, response) {
        skillController.getSkills(request.query)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get a skill by the given id
    routes.get('/:id', authentication.isAllowed('canViewSkill'), function(request, response) {
        skillController.getSkillById(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // update a skill given an id and an object
    routes.put('/:id', authentication.isAllowedOrOwnConnector('canEditSkill', skillController.getSkillById), function(request, response) {
        skillController.updateSkill(request.params.id, request.body, request.headers['x-forwarded-email'])
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));

    });

    // delete a skill given an id
    routes.delete('/:id', authentication.isAllowed('canEditSkill'), function(request, response) {
        skillController.deleteSkillById(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // create an indice
    routes.post('/_indice', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        skillController.createIndex(request.body, request.query)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete all indices for skills
    routes.delete('/_indice', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        skillController.purgeIndices()
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
