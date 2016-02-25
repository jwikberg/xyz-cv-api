'use strict';

var skillDao = require('./skill.dao');
var Promise = require('bluebird');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

// TODO: Make the validation more covering
function validateSkill(skill) {
    return new Promise(function(resolve, reject) {
        if (skill && skill.name) {
            skill = utils.extend(getSkillTemplate(), skill);
            return resolve(skill);
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getSkillTemplate() {
    return {
        name: null,
        icon: 'fa fa-flask',
        skillGroupId: null
    };
}

function setSkillProperties(body) {
    return function(skill) {
        return new Promise(function(resolve, reject) {
            skill = utils.extend(getSkillTemplate(), skill);
            skill = utils.extend(skill, body);
            return resolve(skill);
        });
    };
}

exports.createNewSkill = function(skillObject) {
    return validateSkill(skillObject)
        .then(skillDao.createNewSkill);
};

exports.getSkillById = function(id) {
    return skillDao.getSkillById(id);
};

exports.getSkills = function(query) {
    return skillDao.getSkills(query);
};

exports.updateSkill = function(id, body) {
    return exports.getSkillById(id)
        .then(setSkillProperties(body))
        .then(validateSkill)
        .then(utils.setIdOnBody(id))
        .then(skillDao.updateSkill);
};

exports.deleteSkillById = function(id) {
    return skillDao.deleteSkillById(id);
};

exports.purgeIndices = function() {
    return skillDao.purgeIndices();
};

exports.createIndex = function(fields, options) {
    return skillDao.createIndex(fields, options);
};
