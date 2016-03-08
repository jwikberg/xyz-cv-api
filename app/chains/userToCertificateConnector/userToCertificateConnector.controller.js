'use strict';

var Promise = require('bluebird');
var userToCertificateConnectorDao = require('./userToCertificateConnector.dao');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

function validateUserToCertificateConnector(userToCertificateConnector) {
    return new Promise(function(resolve, reject) {
        if (userToCertificateConnector && userToCertificateConnector.userId && userToCertificateConnector.certificateId) {
            userToCertificateConnector = utils.extend(getUserToCertificateConnectorTemplate(), userToCertificateConnector);
            return resolve(userToCertificateConnector);
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function setUserToCertificateConnectorProperties(body) {
    function extend(userToCertificateConnector, props) {
        for (var prop in userToCertificateConnector) {
            if (userToCertificateConnector.hasOwnProperty(prop) && props.hasOwnProperty(prop)) {
                userToCertificateConnector[prop] = props[prop];
            }
        }
    }

    return function(userToCertificateConnector) {
        extend(userToCertificateConnector, body);
        return userToCertificateConnector;
    };
}

function getUserToCertificateConnectorTemplate() {
    return {
        userId: null,
        certificateId: null,
        skills: [],
        dateFrom: null,
        dateTo: null,
        description: null
    };
}

exports.assignCertificatesToUser = function(certificates, userId) {
    var promises = [];
    certificates.forEach(function(certificateId) {
        var userToCertificateConnector = {
            userId: userId,
            certificateId: certificateId
        };
        promises.push(exports.createUserToCertificateConnector(userToCertificateConnector));
    });

    return Promise.all(promises);
};

exports.createUserToCertificateConnector = function(userToCertificateConnector) {
    return validateUserToCertificateConnector(userToCertificateConnector)
        .then(userToCertificateConnectorDao.createUserToCertificateConnector);
};

exports.getUserToCertificateConnectorById = function(id) {
    return userToCertificateConnectorDao.getUserToCertificateConnectorById(id);
};

exports.getUserToCertificateConnectors = function(query) {
    return userToCertificateConnectorDao.getUserToCertificateConnectors(query);
};

exports.updateUserToCertificateConnector = function(id, body, email) {
    return exports.getUserToCertificateConnectorById(id)
        .then(setUserToCertificateConnectorProperties(body))
        .then(validateUserToCertificateConnector)
        .then(utils.setIdOnBody(id))
        .then(userToCertificateConnectorDao.updateUserToCertificateConnector);
};

exports.deleteUserToCertificateConnectorById = function(id) {
    return userToCertificateConnectorDao.deleteUserToCertificateConnector(id);
};

exports.deleteUserToCertificateConnectors = function(userToCertificateConnectors) {
    var promises = [];
    userToCertificateConnectors.forEach(function(userToCertificateConnector) {
        promises.push(exports.deleteUserToCertificateConnectorById(userToCertificateConnector._id));
    });

    return Promise.all(promises);
};

exports.deleteUserToCertificateConnectorsByUserId = function(userId) {
    return exports.getUserToCertificateConnectorsByUserId(userId)
        .then(exports.deleteUserToCertificateConnectors);
};
