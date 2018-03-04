'use strict';

class Controller {
	constructor(view) {
		this._ENTER_KEY = 13;

		this.view = view;
	}

	setViewEventHandlers() {
		const self = this;

		this.view.$newTodo.addEventListener('keypress', function(e) {
			if (e.keyCode === self._ENTER_KEY) {
				const todoItem = self.createTodoItem(this.value); 
				self.view.$todoList.appendChild(todoItem);
				this.value = '';
				self.updateViewItemCount();
			}
		});
	}

	createTodoItem(text) {
		const todo = document.createElement('li');

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		todo.appendChild(checkbox);

		const label = document.createElement('label');
		label.textContent = text + ' ';
		todo.appendChild(label);

		const button = document.createElement('button');
		button.textContent = '×';
		todo.appendChild(button);

		return todo;
	}

	updateViewItemCount() {
		this.view.todoFooter.$itemCounter.textContent = 
		this.view.$todoList.childElementCount;
	}
}