'use strict';

var skillGroupDao = require('./skillGroup.dao');
var Promise = require('bluebird');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

// TODO: Make the validation more covering
function validateSkillGroup(skillGroup) {
    return new Promise(function(resolve, reject) {
        if (skillGroup && skillGroup.name) {
            skillGroup = utils.extend(getSkillGroupTemplate(), skillGroup);
            return resolve(skillGroup);
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getSkillGroupTemplate() {
    return {
        name: null,
        order: null
    };
}

function setSkillGroupProperties(body) {
    return function(skillGroup) {
        return new Promise(function(resolve, reject) {
            skillGroup = utils.extend(getSkillGroupTemplate(), skillGroup);
            skillGroup = utils.extend(skillGroup, body);
            return resolve(skillGroup);
        });
    };
}

exports.createNewSkillGroup = function(skillGroupObject) {
    return validateSkillGroup(skillGroupObject)
        .then(skillGroupDao.createNewSkillGroup);
};

exports.getSkillGroupById = function(id) {
    return skillGroupDao.getSkillGroupById(id);
};

exports.getSkillGroups = function(query) {
    return skillGroupDao.getSkillGroups(query);
};

exports.updateSkillGroup = function(id, body) {
    return exports.getSkillGroupById(id)
        .then(setSkillGroupProperties(body))
        .then(validateSkillGroup)
        .then(utils.setIdOnBody(id))
        .then(skillGroupDao.updateSkillGroup);
};

exports.deleteSkillGroupById = function(id) {
    return skillGroupDao.deleteSkillGroupById(id);
};
