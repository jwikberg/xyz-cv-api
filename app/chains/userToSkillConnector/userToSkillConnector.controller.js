'use strict';

var Promise = require('bluebird');
var userToSkillConnectorDao = require('./userToSkillConnector.dao');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

function validateUserToSkillConnector(userToSkillConnector) {
    return new Promise(function(resolve, reject) {
        if (userToSkillConnector && userToSkillConnector.userId && userToSkillConnector.skillId && userToSkillConnector.level && userToSkillConnector.years) {
            if ((userToSkillConnector.level >= 1) && (userToSkillConnector.level <= 5) && (userToSkillConnector.years > 0) && (userToSkillConnector.futureLevel <= 5 && userToSkillConnector.futureLevel >= 0) || !userToSkillConnector.futureLevel) {
                userToSkillConnector = utils.extend(getUserToSkillConnectorTemplate(), userToSkillConnector);
                return resolve(userToSkillConnector);
            }
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getUserToSkillConnectorTemplate() {
    return {
        userId: null,
        skillId: null,
        level: null,
        years: null,
        futureLevel: null,
        expertise: null
    };
}

function setUserToSkillConnectorProperties(body) {
    return function(userToSkillConnector) {
        return new Promise(function(resolve, reject) {
            userToSkillConnector = utils.extend(getUserToSkillConnectorTemplate(), userToSkillConnector);
            userToSkillConnector = utils.extend(userToSkillConnector, body);
            return resolve(userToSkillConnector);
        });
    };
}

exports.assignSkillsToUser = function(skills, userId) {
    var promises = [];
    skills.forEach(function(skillId) {
        var userToSkillConnector = {
            userId: userId,
            skillId: skillId
        };
        promises.push(exports.createUserToSkillConnector(userToSkillConnector));
    });

    return Promise.all(promises);
};

exports.createUserToSkillConnector = function(userToSkillConnector) {
    return validateUserToSkillConnector(userToSkillConnector)
        .then(userToSkillConnectorDao.createUserToSkillConnector);
};

exports.getUserToSkillConnectorById = function(id) {
    return userToSkillConnectorDao.getUserToSkillConnectorById(id);
};

exports.getUserToSkillConnectorsByUserId = function(userId) {
    return userToSkillConnectorDao.getUserToSkillConnectorsByUserId(userId);
};

exports.getUserToSkillConnectorsBySkillId = function(skillId) {
    return userToSkillConnectorDao.getUserToSkillConnectorsBySkillId(skillId);
};

exports.getUserToSkillConnectors = function(query) {
    return userToSkillConnectorDao.getUserToSkillConnectors(query);
};

exports.updateUserToSkillConnector = function(id, body) {
    return exports.getUserToSkillConnectorById(id)
        .then(setUserToSkillConnectorProperties(body))
        .then(validateUserToSkillConnector)
        .then(utils.setIdOnBody(id))
        .then(userToSkillConnectorDao.updateUserToSkillConnector);
};

exports.deleteUserToSkillConnectorById = function(id) {
    return userToSkillConnectorDao.deleteUserToSkillConnector(id);
};

exports.deleteUserToSkillConnectors = function(userToSkillConnectors) {
    var promises = [];
    userToSkillConnectors.forEach(function(userToSkillConnector) {
        promises.push(exports.deleteUserToSkillConnectorById(userToSkillConnector._id));
    });

    return Promise.all(promises);
};

exports.deleteUserToSkillConnectorsByUserId = function(userId) {
    return exports.getUserToSkillConnectorsByUserId(userId)
        .then(exports.deleteUserToSkillConnectors);
};
