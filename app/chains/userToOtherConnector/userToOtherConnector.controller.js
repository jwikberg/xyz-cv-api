'use strict';

var Promise = require('bluebird');
var userToOtherConnectorDao = require('./userToOtherConnector.dao');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

function validateUserToOtherConnector(userToOtherConnector) {
    return new Promise(function(resolve, reject) {
        if (userToOtherConnector && userToOtherConnector.userId && userToOtherConnector.otherId) {
            userToOtherConnector = utils.extend(getUserToOtherConnectorTemplate(), userToOtherConnector);
            return resolve(userToOtherConnector);
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getUserToOtherConnectorTemplate() {
    return {
        userId: null,
        otherId: null,
        year: null
    };
}

function setUserToOtherConnectorProperties(body) {
    return function(userToOtherConnector) {
        return new Promise(function(resolve, reject) {
            userToOtherConnector = utils.extend(getUserToOtherConnectorTemplate(), userToOtherConnector);
            userToOtherConnector = utils.extend(userToOtherConnector, body);
            return resolve(userToOtherConnector);
        });
    };
}

exports.assignOthersToUser = function(others, userId) {
    var promises = [];
    others.forEach(function(otherId) {
        var userToOtherConnector = {
            userId: userId,
            otherId: otherId
        };
        promises.push(exports.createUserToOtherConnector(userToOtherConnector));
    });

    return Promise.all(promises);
};

exports.createUserToOtherConnector = function(userToOtherConnector) {
    return validateUserToOtherConnector(userToOtherConnector)
        .then(userToOtherConnectorDao.createUserToOtherConnector);
};

exports.getUserToOtherConnectorById = function(id) {
    return userToOtherConnectorDao.getUserToOtherConnectorById(id);
};

exports.getUserToOtherConnectorsByUserId = function(userId) {
    return userToOtherConnectorDao.getUserToOtherConnectorsByUserId(userId);
};

exports.getUserToOtherConnectorsByOtherId = function(otherId) {
    return userToOtherConnectorDao.getUserToOtherConnectorsByOtherId(otherId);
};

exports.getUserToOtherConnectors = function(query) {
    return userToOtherConnectorDao.getUserToOtherConnectors(query);
};

exports.updateUserToOtherConnector = function(id, body) {
    return exports.getUserToOtherConnectorById(id)
        .then(setUserToOtherConnectorProperties(body))
        .then(validateUserToOtherConnector)
        .then(utils.setIdOnBody(id))
        .then(userToOtherConnectorDao.updateUserToOtherConnector);
};

exports.deleteUserToOtherConnectorById = function(id) {
    return userToOtherConnectorDao.deleteUserToOtherConnector(id);
};

exports.deleteUserToOtherConnectors = function(userToOtherConnectors) {
    var promises = [];
    userToOtherConnectors.forEach(function(userToOtherConnector) {
        promises.push(exports.deleteUserToOtherConnectorById(userToOtherConnector._id));
    });

    return Promise.all(promises);
};

exports.deleteUserToOtherConnectorsByUserId = function(userId) {
    return exports.getUserToOtherConnectorsByUserId(userId)
        .then(exports.deleteUserToOtherConnectors);
};
