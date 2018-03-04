'use strict';

class Controller {
	constructor(view) {
		this._ENTER_KEY = 13;

		this.view = view;
	}

	setViewEventHandlers() {
		const self = this;

		this.view.$newTodo.addEventListener('keypress', function(e) {
			const inputValue = this.value.trim();

			if (e.keyCode === self._ENTER_KEY && inputValue !== '') {
				const todo = self.createTodo(inputValue); 
				self.view.$todoList.appendChild(todo);
				this.value = '';
				self.updateTodosFooter();
			}
		});

		this.view.$todoList.addEventListener('click', function(e) {
			const target = e.target;
			const tagName = target.tagName;

			if (tagName === 'INPUT') {
				const todo = target.parentNode;
				todo.classList.toggle('completed');
			} else if (tagName === 'BUTTON') {
				const todo = target.parentNode;
				self.view.$todoList.removeChild(todo);
			}
			self.updateTodosFooter();
		});

		this.view.todoFooter.$allFilter.addEventListener('click', function() {
			const todos = self.view.$todoList.children;
			for(let i = 0; i < todos.length; i++) {
				todos[i].style.display = 'list-item';
			}
		});

		this.view.todoFooter.$activeFilter.addEventListener('click', function() {
			const todos = self.view.$todoList.children;
			for(let i = 0; i < todos.length; i++) {
				if (todos[i].className.includes('completed')) {
					todos[i].style.display = 'none';
				} else {
					todos[i].style.display = 'list-item';
				}
			}
		});

		this.view.todoFooter.$completedFilter.addEventListener('click', function() {
			const todos = self.view.$todoList.children;
			for(let i = 0; i < todos.length; i++) {
				if (!todos[i].className.includes('completed')) {
					todos[i].style.display = 'none';
				} else {
					todos[i].style.display = 'list-item';
				}
			}
		});

		this.view.todoFooter.$clearCompletedBtn.addEventListener('click', function() {
			const todos = self.view.$todoList.children;
			let index = [];
			for(let i = 0; i < todos.length; i++) {
				if (todos[i].className.includes('completed')) {
					index.push(todos[i]);
				}
			}
			for(let todo of index) {
				self.view.$todoList.removeChild(todo);
			}
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

	updateTodosFooter() {
		const activeTodos = 
		this.view.$todoList.querySelectorAll('li:not(.completed)');
		this.view.todoFooter.$todoCounter.textContent = activeTodos.length;

		const completedTodos = this.view.$todoList.querySelectorAll('.completed');
		if (completedTodos.length > 0) {
			this.view.todoFooter.$clearCompletedBtn.style.display = 'inline-block';
		} else {
			this.view.todoFooter.$clearCompletedBtn.style.display = 'none';
		}
	}
}