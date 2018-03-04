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
				const todo = self.createTodo(this.value); 
				self.view.$todoList.appendChild(todo);
				this.value = '';
				self.updateViewTodosCount();
			}
		});

		this.view.$todoList.addEventListener('click', function(e) {
			const target = e.target;
			const tagName = target.tagName;

			if (tagName === 'INPUT') {
				const label = target.parentNode.querySelector('label');
				label.classList.toggle('completed');
			} else if (tagName === 'BUTTON') {
				const todo = target.parentNode;
				self.view.$todoList.removeChild(todo);
			}
			self.updateViewTodosCount();
		});
	}

	createTodo(text) {
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

	updateViewTodosCount() {
		const activeTodos = 
		this.view.$todoList.querySelectorAll('li label:not(.completed)');

		this.view.todoFooter.$itemCounter.textContent = activeTodos.length;
	}
}