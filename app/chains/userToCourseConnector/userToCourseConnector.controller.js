'use strict';

var Promise = require('bluebird');
var userToCourseConnectorDao = require('./userToCourseConnector.dao');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

function validateUserToCourseConnector(userToCourseConnector) {
    return new Promise(function(resolve, reject) {
        if (userToCourseConnector && userToCourseConnector.userId && userToCourseConnector.courseId && userToCourseConnector.dateFrom && userToCourseConnector.dateTo) {
            if ((userToCourseConnector.dateFrom !== null && userToCourseConnector.dateTo !== null)) {
                userToCourseConnector = utils.extend(getUserToCourseConnectorTemplate(), userToCourseConnector);
                return resolve(userToCourseConnector);
            }
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getUserToCourseConnectorTemplate() {
    return {
        userId: null,
        courseId: null,
        dateFrom: null,
        dateTo: null,
        description: null
    };
}

function setUserToCourseConnectorProperties(body) {
    return function(userToCourseConnector) {
        return new Promise(function(resolve, reject) {
            userToCourseConnector = utils.extend(getUserToCourseConnectorTemplate(), userToCourseConnector);
            userToCourseConnector = utils.extend(userToCourseConnector, body);
            return resolve(userToCourseConnector);
        });
    };
}

exports.assignCoursesToUser = function(courses, userId) {
    var promises = [];
    courses.forEach(function(courseId) {
        var userToCourseConnector = {
            userId: userId,
            courseId: courseId
        };
        promises.push(exports.createUserToCourseConnector(userToCourseConnector));
    });

    return Promise.all(promises);
};

exports.createUserToCourseConnector = function(userToCourseConnector) {
    return validateUserToCourseConnector(userToCourseConnector)
        .then(userToCourseConnectorDao.createUserToCourseConnector);
};

exports.getUserToCourseConnectorById = function(id) {
    return userToCourseConnectorDao.getUserToCourseConnectorById(id);
};

exports.getUserToCourseConnectorsByUserId = function(userId) {
    return userToCourseConnectorDao.getUserToCourseConnectorsByUserId(userId);
};

exports.getUserToCourseConnectorsByCourseId = function(courseId) {
    return userToCourseConnectorDao.getUserToCourseConnectorsByCourseId(courseId);
};

exports.getUserToCourseConnectors = function(query) {
    return userToCourseConnectorDao.getUserToCourseConnectors(query);
};

exports.updateUserToCourseConnector = function(id, body) {
    return exports.getUserToCourseConnectorById(id)
        .then(setUserToCourseConnectorProperties(body))
        .then(validateUserToCourseConnector)
        .then(utils.setIdOnBody(id))
        .then(userToCourseConnectorDao.updateUserToCourseConnector);
};

exports.deleteUserToCourseConnectorById = function(id) {
    return userToCourseConnectorDao.deleteUserToCourseConnector(id);
};

exports.deleteUserToCourseConnectors = function(userToCourseConnectors) {
    var promises = [];
    userToCourseConnectors.forEach(function(userToCourseConnector) {
        promises.push(exports.deleteUserToCourseConnectorById(userToCourseConnector._id));
    });

    return Promise.all(promises);
};

exports.deleteUserToCourseConnectorsByUserId = function(userId) {
    return exports.getUserToCourseConnectorsByUserId(userId)
        .then(exports.deleteUserToCourseConnectors);
};
