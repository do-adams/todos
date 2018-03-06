'use strict';

const view = new TodoView();
const controller = new TodoController(view);
controller.setView();