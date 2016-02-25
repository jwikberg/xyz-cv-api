'use strict';

/**
 * Module dependencies.
 */
var assignmentController = require('../chains/assignment/assignment.controller');
var attributeController = require('../chains/attribute/attribute.controller');
var officeController = require('../chains/office/office.controller');
var roleController = require('../chains/role/role.controller');
var customerController = require('../chains/customer/customer.controller');
var domainController = require('../chains/domain/domain.controller');
var roleToAttributeConnectorController = require('../chains/roleToAttributeConnector/roleToAttributeConnector.controller');
var skillController = require('../chains/skill/skill.controller');
var skillGroupController = require('../chains/skillGroup/skillGroup.controller');
var skillToSkillGroupConnectorController = require('../chains/skillToSkillGroupConnector/skillToSkillGroupConnector.controller');
var userController = require('../chains/user/user.controller');
var userToOfficeConnectorController = require('../chains/userToOfficeConnector/userToOfficeConnector.controller');
var userToSkillConnectorController = require('../chains/userToSkillConnector/userToSkillConnector.controller');
var userToAssignmentConnectorController = require('../chains/userToAssignmentConnector/userToAssignmentConnector.controller');

var responseHandler = require('../utils/response.handler');
var randomHandler = require('../utils/random.handler');
var errorHandler = require('../utils/error.handler');
var cacheHandler = require('../utils/cache.handler');
var authentication = require('../middleware/authentication.middleware');

var faker = require('faker');
var config = require('config');
var Promise = require('bluebird');
var userAttributes;

module.exports = function(routes) {

    // setup demo data
    routes.post('/demo-data', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        purgeAll()
            .then(addAll)
            .then(addConnectors)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.delete('/purge', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        purgeAll()
            .then(responseHandler.sendSuccessfulDeleteJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.post('/default', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        purgeAll()
            .then(addAllDefault)
            .then(addConnectorsDefault)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.post('/indices', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        purgeIndices()
            .then(setIndices)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.post('/moveUserToSkill/:from/:to', authentication.hasAllowedEmail(config.SUPER_USERS), function(request, response) {
        moveSkillConnectors(request.params.from, request.params.to, request.query.remove)
            .then(responseHandler.sendSuccessfulPutJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};

// QUERY DATA
// ============================================================================

function moveSkillConnectors(from, to) {
    var fromSkill = skillController.getSkills({name: from});
    var toSkill = skillController.getSkills({name: to});
    return Promise.all([fromSkill, toSkill])
        .then(function() {
            return new Promise(function(resolve, reject) {
                fromSkill = fromSkill.value();
                toSkill = toSkill.value();
                if (!fromSkill.length || !toSkill.length) {
                    return errorHandler.getHttpError(404)
                        .then(reject);
                } else {
                    fromSkill = fromSkill[0];
                    toSkill = toSkill[0];
                    return userToSkillConnectorController.getUserToSkillConnectors({skillId: fromSkill._id})
                        .then(function(connectors) {
                            return Promise.all(Promise.map(connectors, function(connector) {
                                connector.skillId = toSkill._id;
                                return userToSkillConnectorController.updateUserToSkillConnector(connector._id, connector);
                            })).then(function() {
                                return removeSkill(from)
                                    .then(resolve);
                            });
                        });
                }
            });
        });
}

function removeSkill(skillName) {
    return skillController.getSkills({name: skillName})
        .then(function(skills) {
            return new Promise(function(resolve, reject) {
                if (!skills.length) {
                    return errorHandler.getHttpError(404)
                        .then(reject);
                } else {
                    var skill = skills[0];
                    return skillController.deleteSkillById(skill._id)
                        .then(resolve);
                }
            });
        });
}

// INDICES
// ============================================================================

function purgeIndices() {
    var purge = [];
    purge.push(userController.purgeIndices());
    purge.push(skillController.purgeIndices());
    purge.push(assignmentController.purgeIndices());
    purge.push(customerController.purgeIndices());
    purge.push(domainController.purgeIndices());
    return Promise.all(purge);
}

function setIndices() {
    var set = [];
    set.push(userController.createIndex({ email: 1 }, { unique: true }));
    set.push(skillController.createIndex({ name: 1 }, { unique: true }));
    set.push(assignmentController.createIndex({ name: 1}, { unique: true }));
    set.push(customerController.createIndex({ name: 1}, { unique: true }));
    set.push(domainController.createIndex({ name: 1}, { unique: true }));
    return Promise.all(set);
}

// PURGE
// ============================================================================

function purgeAll() {
    var purge = [];
    purge.push(purgeUsers());
    purge.push(purgeRoles());
    purge.push(purgeAttributes());
    purge.push(purgeSkills());
    purge.push(purgeOffices());
    purge.push(purgeSkillGroups());
    purge.push(purgeAssignments());
    purge.push(purgeCustomers());
    purge.push(purgeDomains());

    purge.push(purgeUserToSkillConnectors());
    purge.push(purgeRoleToAttributeConnectors());
    purge.push(purgeSkillToSkillGroupConnectors());
    purge.push(purgeUserToOfficeConnectors());
    purge.push(purgeUserToAssignmentConnectors());
    purge.push(purgeCache());
    return Promise.all(purge);
}

function purgeUsers() {
    return new Promise(function(resolve) {
        userController.getUsers()
            .then(function(users) {
                return Promise.all(applyDeleteOnItemRec(users, 0, userController.deleteUserById))
                    .then(resolve);
            });
    });
}

function purgeRoles() {
    return new Promise(function(resolve) {
        roleController.getRoles()
            .then(function(roles) {
                return Promise.all(applyDeleteOnItemRec(roles, 0, roleController.deleteRoleById))
                    .then(resolve);
            });
    });
}

function purgeCustomers() {
    return new Promise(function(resolve) {
        customerController.getCustomers()
            .then(function(customers) {
                return Promise.all(applyDeleteOnItemRec(customers, 0, customerController.deleteCustomerById))
                    .then(resolve);
            });
    });
}

function purgeDomains() {
    return new Promise(function(resolve) {
        domainController.getDomains()
            .then(function(domains) {
                return Promise.all(applyDeleteOnItemRec(domains, 0, domainController.deleteDomainById))
                    .then(resolve);
            });
    });
}

function purgeAttributes() {
    return new Promise(function(resolve) {
        attributeController.getAttributes()
            .then(function(attributes) {
                return Promise.all(applyDeleteOnItemRec(attributes, 0, attributeController.deleteAttributeById))
                    .then(resolve);
            });
    });
}

function purgeSkills() {
    return new Promise(function(resolve) {
        skillController.getSkills()
            .then(function(skills) {
                return Promise.all(applyDeleteOnItemRec(skills, 0, skillController.deleteSkillById))
                    .then(resolve);
            });
    });
}

function purgeOffices() {
    return new Promise(function(resolve) {
        officeController.getOffices()
            .then(function(offices) {
                return Promise.all(applyDeleteOnItemRec(offices, 0, officeController.deleteOfficeById))
                    .then(resolve);
            });
    });
}

function purgeSkillGroups() {
    return new Promise(function(resolve) {
        skillGroupController.getSkillGroups()
            .then(function(skillGroups) {
                return Promise.all(applyDeleteOnItemRec(skillGroups, 0, skillGroupController.deleteSkillGroupById))
                    .then(resolve);
            });
    });
}

function purgeAssignments() {
    return new Promise(function(resolve) {
        assignmentController.getAssignments()
            .then(function(assignments) {
                return Promise.all(applyDeleteOnItemRec(assignments, 0, assignmentController.deleteAssignmentById))
                    .then(resolve);
            });
    });
}

function purgeUserToSkillConnectors() {
    return new Promise(function(resolve) {
        userToSkillConnectorController.getUserToSkillConnectors()
            .then(function(userToSkillConnectors) {
                return Promise.all(applyDeleteOnItemRec(userToSkillConnectors, 0, userToSkillConnectorController.deleteUserToSkillConnectorById))
                    .then(resolve);
            });
    });
}

function purgeRoleToAttributeConnectors() {
    return new Promise(function(resolve) {
        roleToAttributeConnectorController.getRoleToAttributeConnectors()
            .then(function(roleToAttributeConnectors) {
                return Promise.all(applyDeleteOnItemRec(roleToAttributeConnectors, 0, roleToAttributeConnectorController.deleteRoleToAttributeConnectorById))
                    .then(resolve);
            });
    });
}

function purgeSkillToSkillGroupConnectors() {
    return new Promise(function(resolve) {
        skillToSkillGroupConnectorController.getSkillToSkillGroupConnectors()
            .then(function(skillToSkillGroupConnectors) {
                return Promise.all(applyDeleteOnItemRec(skillToSkillGroupConnectors, 0, skillToSkillGroupConnectorController.deleteSkillToSkillGroupConnectorById))
                    .then(resolve);
            });
    });
}

function purgeUserToOfficeConnectors() {
    return new Promise(function(resolve) {
        userToOfficeConnectorController.getUserToOfficeConnectors()
            .then(function(userToOfficeConnectors) {
                return Promise.all(applyDeleteOnItemRec(userToOfficeConnectors, 0, userToOfficeConnectorController.deleteUserToOfficeConnectorById))
                    .then(resolve);
            });
    });
}

function purgeUserToAssignmentConnectors() {
    return new Promise(function(resolve) {
        userToAssignmentConnectorController.getUserToAssignmentConnectors()
            .then(function(userToAssignmentConnectors) {
                return Promise.all(applyDeleteOnItemRec(userToAssignmentConnectors, 0, userToAssignmentConnectorController.deleteUserToAssignmentConnectorById))
                    .then(resolve);
            });
    });
}

function purgeCache() {
    return new Promise(function(resolve) {
        cacheHandler.clearUserRoleCache();
        cacheHandler.clearRoleAttributesCache();
        cacheHandler.clearEmailIdCache();
        return resolve();
    });
}

// ADD ENTITIES
// ============================================================================

function addAll() {
    var added = [];
    added.push(addUsers());
    added.push(addAdmin());
    added.push(addRoles());
    added.push(addAttributes());
    added.push(addSkills());
    added.push(addOffices());
    added.push(addSkillGroups());
    added.push(addAssignments());
    added.push(addCustomers());
    added.push(addDomains());
    return Promise.all(added);
}

function addAllDefault() {
    var added = [];
    added.push(addRoles());
    added.push(addAdmin());
    added.push(addAttributes());
    added.push(addSkillsDefault());
    added.push(addOffices());
    added.push(addSkillGroups());
    return Promise.all(added);
}

function addUsers() {
    var users = [];
    for (var i = 0; i < config.DEMO.USER_LIMIT; i++) {
        var firstName = faker.name.firstName();
        var lastName = faker.name.lastName();
        var fullName = firstName + ' ' + lastName;
        var email = firstName + '.' + lastName + '@softhouse.se';
        email = email.toLowerCase();
        var position = faker.name.title();

        var user = {
            name: fullName,
            email: email,
            role: 'user',

            phoneNumber: faker.phone.phoneNumberFormat(),
            employeeNumber: faker.random.number(2000),
            position: position,
            closestSuperior: faker.name.firstName() + ' ' + faker.name.lastName(),
            startDateOfEmployment: faker.date.past(),
            endDateOfEmployment: null,

            certificates: randomHandler.getCertificates(),

            ICEName: faker.name.firstName() + ' ' + faker.name.lastName(),
            ICEPhone: faker.phone.phoneNumberFormat(),

            profileImage: null,
            personalIdNumber: randomHandler.getIdNumber(),
            sex: randomHandler.generateSex(),
            description: faker.lorem.sentence(),
            personalInterests: randomHandler.getPersonalInterests(),
            foodPreferences: faker.lorem.sentence(),
            shirtSize: randomHandler.getShirtSize(),
            customHeaders: randomHandler.getCustomHeaders(),

            linkedin: 'https://www.linkedin.com/in/williamhgates',
            facebook: 'https://www.facebook.com/BillGates',
            twitter: 'https://twitter.com/billgates',
            country: faker.address.country(),
            address: faker.address.streetAddress(),
            city: faker.address.city(),
            ZIP: faker.address.zipCode()
        };
        users.push(user);
    }

    return Promise.all(applyAddOnItemsRec(users, 0, userController.createNewUser));

}

function addAdmin() {
    var user = [{
        name: 'Anton Lundin',
        email: 'anton.lundin@softhouse.se',
        role: 'admin'
    },
    {
        name: 'Rasmus Letterkrantz',
        email: 'rasmus.xx.letterkrantz@softhouse.se',
        role: 'admin'
    },
    {
        name: 'Young Fogelström',
        email: 'young.fogelstrom@softhouse.se',
        role: 'admin'
    }];

    return Promise.all(applyAddOnItemsRec(user, 0, userController.createNewUser));

}

function addCustomers() {
    var customers = randomHandler.getListOfCustomers();
    return Promise.all(applyAddOnItemsRec(customers, 0, customerController.createNewCustomer));
}

function addDomains() {
    var domains = randomHandler.getListOfDomains();
    return Promise.all(applyAddOnItemsRec(domains, 0, domainController.createNewDomain));
}

function addSkills() {
    var skills = randomHandler.getSkillAbbreviations(config.DEMO.NUMBER_OF_SKILLS);
    return Promise.all(applyAddOnItemsRec(skills, 0, skillController.createNewSkill));
}

function addSkillsDefault() {
    var skills = randomHandler.getListOfDefaultSkillAbbreviations();
    return Promise.all(applyAddOnItemsRec(skills, 0, skillController.createNewSkill));

}

function addAssignments() {
    var assignments = [];
    var usedDomainNames = {};
    for (var i = 0; i < config.DEMO.NUMBER_OF_ASSIGNMENTS; i++) {
        var object = {};
        var domainName = faker.internet.domainName();
        while (usedDomainNames[domainName]) {
            domainName = faker.internet.domainName();
        }

        usedDomainNames[domainName] = 1;
        object.name = domainName;
        assignments.push(object);
    }

    return Promise.all(applyAddOnItemsRec(assignments, 0, assignmentController.createNewAssignment));

}

function addOffices() {
    var offices = [
        {
            name: 'Karlskrona'
        },
        {
            name: 'Växjö'
        },
        {
            name: 'Stockholm'
        },
        {
            name: 'Malmö'
        },
        {
            name: 'Göteborg'
        },
        {
            name: 'Sarajevo'
        }
    ];
    return Promise.all(applyAddOnItemsRec(offices, 0, officeController.createNewOffice));

}

function addAttributes() {
    var allAttributes = [
        {
            name: 'canViewOffice'
        },
        {
            name: 'canEditOffice'
        },
        {
            name: 'canViewUser',
            hiddenFields: [
                'personalIdNumber',
                'foodPreferences',
                'shirtSize',
                'ICEName',
                'ICEPhone',
                'address',
                'city',
                'ZIP',
                'endDateOfEmployment',
                'startDateOfEmployment'
            ]
        },
        {
            name: 'canEditUser'
        },
        {
            name: 'canViewAssignment'
        },
        {
            name: 'canEditAssignment'
        },
        {
            name: 'canEditAttribute'
        },
        {
            name: 'canViewFile'
        },
        {
            name: 'canEditFile'
        },
        {
            name: 'canEditRole'
        },
        {
            name: 'canViewSkill'
        },
        {
            name: 'canEditSkill'
        },
        {
            name: 'canEditSkillGroup'
        },
        {
            name: 'canViewDashboard'
        },
        {
            name: 'canEditCustomer'
        },
        {
            name: 'canEditDomain'
        },
        {
            name: 'canViewAdmin'
        }
    ];

    userAttributes = [
        'canViewOffice',
        'canViewUser',
        'canViewAssignment',
        'canViewFile',
        'canViewSkill'
    ];

    return Promise.all(applyAddOnItemsRec(allAttributes, 0, attributeController.createNewAttribute));

}

function addRoles() {
    var roles = [
        {
            name: 'user'
        },
        {
            name: 'admin'
        }
    ];
    return Promise.all(applyAddOnItemsRec(roles, 0, roleController.createNewRole));

}

function addSkillGroups() {
    var skillGroups = [
        {
            name: 'Project methods & standards'
        },
        {
            name: 'Roles'
        },
        {
            name: 'Technologies'
        }
    ];
    return Promise.all(applyAddOnItemsRec(skillGroups, 0, skillGroupController.createNewSkillGroup));

}

// ADD CONNECTORS
// ============================================================================

function addConnectors() {
    var promises = [];
    promises.push(roleController.getRoles({name: 'admin'})
        .then(connectAdminAndAttributes));

    promises.push(roleController.getRoles({name: 'user'})
        .then(connectUserAndAttributes));

    promises.push(userController.getUsers()
        .then(connectUsersAndRandomOffice));

    promises.push(userController.getUsers()
        .then(connectUsersAndRandomSkills));

    promises.push(skillGroupController.getSkillGroups({name: 'technologies'})
        .then(connectSkillGroupAndSkills));

    promises.push(userController.getUsers()
        .then(connectUsersAndRandomAssignments));

    promises.push(connectAssignmentFields());

    return Promise.all(promises);
}

function addConnectorsDefault() {
    var promises = [];
    promises.push(roleController.getRoles({name: 'admin'})
        .then(connectAdminAndAttributes));

    promises.push(roleController.getRoles({name: 'user'})
        .then(connectUserAndAttributes));

    promises.push(skillGroupController.getSkillGroups({name: 'technologies'})
        .then(connectSkillGroupAndSkills));

    return Promise.all(promises);
}

function connectUsersAndRandomSkills(users) {
    var extraFields = {
        level: randomHandler.getSkillLevel,
        years: randomHandler.getYears
    };

    return skillController.getSkills()
        .then(function(skills) {
            return connectItemsToRandomItems(users, skills, 'userId', 'skillId', 0, userToSkillConnectorController.createUserToSkillConnector, config.DEMO.SKILL_ON_USER_PROBABILITY, extraFields);
        });
}

function connectUsersAndRandomAssignments(users) {
    return skillController.getSkills()
        .then(function(skills) {
            var extraFields = {
                skills: randomHandler.getBinomailUniqueSkillIds(skills, config.DEMO.SKILL_ON_ASSIGNMENT_PROBABILITY),
                dateFrom: faker.date.past,
                dateTo: faker.date.future,
                description: faker.lorem.sentence
            };

            return assignmentController.getAssignments()
                .then(function(assignments) {
                    return connectItemsToRandomItems(users, assignments, 'userId', 'assignmentId', 0, userToAssignmentConnectorController.createUserToAssignmentConnector, config.DEMO.USER_ON_ASSIGNMENT_PROBABILITY, extraFields);
                });
        });
}

function connectAssignmentFields() {
    var customers = customerController.getCustomers();
    var assignments = assignmentController.getAssignments();
    var domains = domainController.getDomains();
    return Promise.all([customers, assignments])
        .then(function() {
            return new Promise(function(resolve) {
                var extraFields = {
                };
                assignments = assignments.value();
                customers = customers.value();
                domains = domains.value();
                return Promise.map(assignments, function(assignment) {
                    assignment.customer = customers[randomHandler.randomInt(customers.length - 1)]._id;
                    assignment.domain = domains[randomHandler.randomInt(domains.length - 1)]._id;
                    return assignmentController.updateAssignment(assignment._id, assignment);
                }).then(resolve);
            });
        });
}

function connectUsersAndRandomOffice(users) {
    return officeController.getOffices()
        .then(function(offices) {
            return connectItemsToRandomItem(users, offices, 'userId', 'officeId', 0, userToOfficeConnectorController.createUserToOfficeConnector);
        });
}

function connectAdminAndAttributes(role) {
    return attributeController.getAttributes()
        .then(function(attributes) {
            return new Promise(function(resolve) {
                var promises = [];
                attributes.forEach(function(attribute) {
                    promises.push(roleToAttributeConnectorController.createRoleToAttributeConnector({roleId: role[0]._id, attributeId: attribute._id}));
                });

                return Promise.all(promises)
                    .then(resolve);
            });
        });
}

function connectUserAndAttributes(role) {
    return attributeController.getAttributes()
        .then(function(attributes) {
            return new Promise(function(resolve) {
                var promises = [];
                attributes.forEach(function(attribute) {
                    if (isUserAttribute(attribute)) {
                        promises.push(roleToAttributeConnectorController.createRoleToAttributeConnector({roleId: role[0]._id, attributeId: attribute._id}));
                    }
                });

                return Promise.all(promises)
                    .then(resolve);
            });
        });
}

function connectSkillGroupAndSkills(skillGroup) {
    return skillController.getSkills()
        .then(function(skills) {
            return new Promise(function(resolve) {
                var promises = [];
                skills.forEach(function(skill) {
                    promises.push(skillToSkillGroupConnectorController.createSkillToSkillGroupConnector({skillId: skill._id, skillGroupId: skillGroup[0]._id}));
                });

                return Promise.all(promises)
                    .then(resolve);
            });
        });
}

// UTIL
// ============================================================================

function applyDeleteOnItems(items, applyFunction) {
    var promises = [];
    items.forEach(function(item) {
        promises.push(applyFunction(item._id));
    });

    return promises;
}

function applyDeleteOnItemRec(items, index, applyFunction) {
    return new Promise(function(resolve) {
        if (index >= items.length) {
            return resolve(items);
        }

        return applyFunction(items[index]._id)
            .then(function() {
                index++;
                return applyDeleteOnItemRec(items, index, applyFunction)
                    .then(resolve);
            });
    });
}

function applyAddOnItems(items, applyFunction) {
    var promises = [];
    items.forEach(function(item) {
        promises.push(applyFunction(item));
    });

    return promises;
}

function applyAddOnItemsRec(items, index, applyFunction) {
    return new Promise(function(resolve) {
        if (index >= items.length) {
            return resolve(items);
        }

        return applyFunction(items[index])
            .then(function() {
                index++;
                return applyAddOnItemsRec(items, index, applyFunction)
                    .then(resolve);
            });
    });
}

function connectOneToAll(item, connectToItems, itemsProp, connectToItemsProp, index, applyFunction, extraFields) {
    return new Promise(function(resolve) {
        if (index >= connectToItems.length) {
            return resolve(item);
        }

        //create the connector
        var connector = {};
        connector[itemsProp] = item._id;
        connector[connectToItemsProp] = connectToItems[index]._id;

        for (var extraField in extraFields) {
            if (extraFields.hasOwnProperty(extraField)) {
                connector[extraField] = extraFields[extraField].apply();
            }
        }

        //post the connector
        return applyFunction(connector)
            .then(function() {
                index++;
                return connectOneToAll(item, connectToItems, itemsProp, connectToItemsProp, index, applyFunction, extraFields)
                    .then(resolve);
            });
    });
}

function connectItemsToRandomItems(items, connectToItems, itemsProp, connectToItemsProp, index, applyFunction, p, extraFields) {
    return new Promise(function(resolve) {
        if (index >= items.length) {
            return resolve(items);
        }

        var uniqueConnectToItems = randomHandler.getBinomialUniqueList(connectToItems, p);

        return connectOneToAll(items[index], uniqueConnectToItems, itemsProp, connectToItemsProp, 0, applyFunction, extraFields)
            .then(function() {
                index++;
                return connectItemsToRandomItems(items, connectToItems, itemsProp, connectToItemsProp, index, applyFunction, p, extraFields)
                    .then(resolve);
            });
    });

}

function connectItemsToRandomItem(items, connectToItems, itemsProp, connectToItemsProp, index, applyFunction) {
    return new Promise(function(resolve) {
        if (index >= items.length) {
            return resolve(items);
        }

        var connector = {};
        connector[itemsProp] = items[index]._id;
        connector[connectToItemsProp] = connectToItems[faker.random.number(connectToItems.length - 1)]._id;
        return applyFunction(connector)
            .then(function() {
                index++;
                return connectItemsToRandomItem(items, connectToItems, itemsProp, connectToItemsProp, index, applyFunction)
                    .then(resolve);
            });
    });

}

function isUserAttribute(attribute) {
    if (userAttributes.indexOf(attribute.name) >= 0) {
        return true;
    }

    return false;
}
