'use strict';

class TodoModelStore {
    constructor() {
        this._storeKey = 'todo-store';
        this._store = [];
        this._localStorage = window.localStorage;
    }

    /** 
     * Loads the store data from local storage.
    */
    initialize() {
        const data = JSON.parse(this._localStorage.getItem(this._storeKey));
        this._store = data == null ? [] : data;
    }

    get _lastIndex() {
        return this._store.length - 1;
    }

    isValidKey(key) {
        return key >= 0 && key <= this._lastIndex;
    }

    /**
     * Executes an action in the context of this object
     * and saves the changes in the store
     * to the local storage.
     * 
     * Not the most performant solution, but it sure is comfy.
     */
    _saveToLocalStorage(func) {
        const result = func.call(this);
        this._localStorage.setItem(this._storeKey, JSON.stringify(this._store));
        return result;
    }

    /**
     * 
     * @returns  A key value for the newly added todo.
     */
    addTodo(todo) {
        return this._saveToLocalStorage(() => {
            this._store.push(todo);
            return this._lastIndex;
        });
    }

    /**
     * Modifies an existing todo in the store.
     */
    setTodo(key, todo) {
        return this._saveToLocalStorage(() => {
            if (!this.isValidKey(key)) throw new Error('Invalid key argument value');
            this._store.splice(key, 1, todo);
        });
    }

    getTodo(key) {
        if (!this.isValidKey(key)) throw new Error('Invalid key argument value');
        return this._store[key];
    }

    /** 
     * @returns An ordered array of all todos.
    */
    getAllTodos() {
        return this._store;
    }

    removeTodo(key) {
        return this._saveToLocalStorage(() => {
            if (!this.isValidKey(key)) throw new Error('Invalid key argument value');
            this._store.splice(key, 1);
        });
    }

    clearAllTodos() {
        return this._saveToLocalStorage(() => {
            this._store = [];
        });
    }
}