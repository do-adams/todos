'use strict';

class Controller {
	constructor(view) {
		this._ENTER_KEY = 13;

		this.view = view;
	}

	createTodoItem(text) {
		const item = document.createElement('li');
		item.textContent = text;
		return item;
	}

	setViewEventHandlers() {
		const self = this;

		this.view.$newTodo.addEventListener('keypress', function(e) {
			if (e.keyCode === self._ENTER_KEY) {
				const todoItem = self.createTodoItem(this.value); 
				self.view.$todoList.appendChild(todoItem);
				this.value = '';
			}
		});
	}
}