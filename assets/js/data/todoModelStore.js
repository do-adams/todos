'use strict';

class TodoModelStore {
	constructor() {
		// Used for relative ordering of todos
		this._TODO_COUNT_KEY = 'todo-count';

		this._localStorage = window.localStorage;
	}

	/**
	 * 
	 * @returns An array of only the relevant todo item keys.
	 */
	_getTodoKeys(store) {
		return Object.keys(store).filter((k) => k !== this._TODO_COUNT_KEY);
	}

	/** 
	 * Generates a GUID(ish) value for storing todos
	 * See: https://stackoverflow.com/a/2117523
	*/
	_createGuid() {
		function uuidv4() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
		return uuidv4();
	}

	_doesKeyExist(key) {
		const keys = this._getTodoKeys(this._localStorage);
		return keys.indexOf(key) >= 0 ? true : false;
	}

	/**
	 * 
	 * @returns  A key value for the newly added todo.
	 */
	addTodo(todo) {
		const key = this._createGuid();
		let index = this._localStorage.getItem(this._TODO_COUNT_KEY);
		if (index === null) index = 0;
		else index = parseInt(index);
		todo.index = index++;

		this._localStorage.setItem(key, JSON.stringify(todo));
		this._localStorage.setItem(this._TODO_COUNT_KEY, index.toString());

		return key;
	}

	/**
	 * Modifies an existing todo in the store.
	 * Cannot be used for adding new todos to the store.
	 */
	setTodo(key, todo) {
		if (!this._doesKeyExist(key)) throw new Error('Key not found in the store');
		this._localStorage.setItem(key, JSON.stringify(todo));
	}

	getTodo(key) {
		return JSON.parse(this._localStorage.getItem(key));
	}

	/** 
	 * @returns An ordered array of all keys and todos.
	*/
	getAllTodos() {
		const keys = this._getTodoKeys(this._localStorage);
		const todos = [];
		for(let key of keys) {
			todos.push({
				key: key,
				todo: JSON.parse(this._localStorage[key])
			});
		}
		return todos.sort((a, b) => a.todo.index - b.todo.index);
	}

	removeTodo(key) {
		this._localStorage.removeItem(key);
	}

	clearAllTodos() {
		this._localStorage.clear();
	}
}