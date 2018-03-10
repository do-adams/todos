'use strict';

const store = new TodoModelStore();
const toggleUtility = new TodoToggleUtility();
const view = new TodoView();
const controller = new TodoController(view, store, toggleUtility);
controller.initialize();