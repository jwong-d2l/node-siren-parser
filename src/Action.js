'use strict';

const
	assert = require('./assert'),
	Field = require('./Field');

function Action(action) {
	if (action instanceof Action) {
		return action;
	}
	if (!(this instanceof Action)) {
		return new Action(action);
	}

	assert('object' === typeof action, 'action must be an object');
	assert('string' === typeof action.name, 'action.name must be a string');
	assert('string' === typeof action.href, 'action.href must be a string');
	assert('undefined' === typeof action.class || Array.isArray(action.class),
		'action.class must be an array or undefined');
	assert('undefined' === typeof action.method || 'string' === typeof action.method,
		'action.method must be a string or undefined');
	assert('undefined' === typeof action.title || 'string' === typeof action.title,
		'action.title must be a string or undefined');
	assert('undefined' === typeof action.type || 'string' === typeof action.type,
		'action.type must be a string or undefined');
	assert('undefined' === typeof action.fields || Array.isArray(action.fields),
		'action.fields must be an array or undefined');

	this.name = action.name;
	this.href = action.href;

	if (action.class) {
		this.class = action.class;
	}

	this.method = action.method || 'GET';

	if (action.title) {
		this.title = action.title;
	}

	this.type = action.type || 'application/x-www-form-urlencoded';

	this._fieldsByName = {};
	this._fieldsByClass = {};
	this._fieldsByType = {};
	if (action.fields) {
		this.fields = [];

		action.fields.forEach(field => {
			const fieldInstance = new Field(field);
			this.fields.push(fieldInstance);

			this._fieldsByName[field.name] = fieldInstance;

			if (fieldInstance.type) {
				this._fieldsByType[fieldInstance.type] = this._fieldsByType[fieldInstance.type] || [];
				this._fieldsByType[fieldInstance.type].push(fieldInstance);
			}

			if (fieldInstance.class) {
				fieldInstance.class.forEach(cls => {
					this._fieldsByClass[cls] = this._fieldsByClass[cls] || [];
					this._fieldsByClass[cls].push(fieldInstance);
				});
			}
		});

		this.fields = action.fields;
	}
}

Action.prototype.hasClass = function(cls) {
	return this.class instanceof Array && this.class.indexOf(cls) > -1;
};

Action.prototype.hasField = function(fieldName) {
	return this.hasFieldByName(fieldName);
};

Action.prototype.hasFieldByName = function(fieldName) {
	return this._fieldsByName.hasOwnProperty(fieldName);
};

Action.prototype.hasFieldByClass = function(fieldClass) {
	return this._fieldsByClass.hasOwnProperty(fieldClass);
};

Action.prototype.hasFieldByType = function(fieldType) {
	return this._fieldsByType.hasOwnProperty(fieldType);
};

Action.prototype.getField = function(fieldName) {
	return this.getFieldByName(fieldName);
};

Action.prototype.getFieldByName = function(fieldName) {
	return this._fieldsByName[fieldName];
};

Action.prototype.getFieldByClass = function(fieldClass) {
	return this._getFirstOrUndefined('_fieldsByClass', fieldClass);
};

Action.prototype.getFieldsByClass = function(fieldClass) {
	return this._getSetOrEmpty('_fieldsByClass', fieldClass);
};

Action.prototype.getFieldByType = function(fieldType) {
	return this._getFirstOrUndefined('_fieldsByType', fieldType);
};

Action.prototype.getFieldsByType = function(fieldType) {
	return this._getSetOrEmpty('_fieldsByType', fieldType);
};

Action.prototype._getFirstOrUndefined = function(set, key) {
	const vals = this[set][key];

	return vals ? vals[0] : undefined;
};

Action.prototype._getSetOrEmpty = function(set, key) {
	const vals = this[set][key];

	return vals ? vals.slice() : [];
};

module.exports = Action;
