'use strict';

const store = new TodoModelStore();
const view = new TodoView();
const controller = new TodoController(view, store);
controller.initialize();