'use strict';

class TodoModelStore {
    constructor() {
        // A numeric value denoting the index (key) of the last todo item in the store
        this._lastKey = Object.keys(window.localStorage).length - 1;

        this.localStorage = window.localStorage;
    }

    isValidKey(key) {
        return key >= 0 && key <= this._lastKey;
    }

    addTodo(todo) {
        this.localStorage.setItem(++this._lastKey, JSON.stringify(todo));
        return this._lastKey;
    }

    setTodo(key, todo) {
        if (!this.isValidKey(key)) throw new Error('Invalid key argument value');
        this.localStorage.setItem(key, JSON.stringify(todo));
    }

    getTodo(key) {
        if (!this.isValidKey(key)) throw new Error('Invalid key argument value');
        return JSON.parse(this.localStorage.getItem(key));
    }

    getAllTodos() {
        const todos = [];
        const keys = Object.keys(this.localStorage);
        for(let key in keys) {
            const todo = JSON.parse(this.localStorage.getItem(key));
            this.todos.push({
                [key]: todo
            });
        }
        return this.todos;
    }

    removeTodo(key) {
        if (!this.isValidKey(key)) throw new Error('Invalid key argument value');
        this.localStorage.removeItem(key);
    }

    clearAllTodos() {
        this.localStorage.clear();
    }
}