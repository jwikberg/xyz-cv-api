'use strict';

/**
 * Module dependencies.
 */
var courseController = require('./course.controller');
var responseHandler = require('../../utils/response.handler');
var authentication = require('../../middleware/authentication.middleware');
var config = require('config');

module.exports = function(routes) {

    // create a course
    routes.post('/', authentication.isAllowed('canViewCourse'), function(request, response) {
        courseController.createNewCourse(request.body)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get courses by query
    routes.get('/', authentication.isAllowed('canViewCourse'), function(request, response) {
        courseController.getCourses(request.query)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // get a course by the given id
    routes.get('/:id', authentication.isAllowed('canViewCourse'), function(request, response) {
        courseController.getCourseById(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete a course given an id
    routes.delete('/:id', authentication.isAllowed('canEditCourse'), function(request, response) {
        courseController.deleteCourseById(request.params.id)
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // create an indice
    routes.post('/_indice', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        courseController.createIndex(request.body, request.query)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    // delete all indices for courses
    routes.delete('/_indice', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        courseController.purgeIndices()
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
