'use strict';

class Controller {
	constructor(view) {
		this._ENTER_KEY = 13;
		this.view = view;
	}

	setView() {
		this.setViewEvents();
	}

	setViewEvents() {
		this.view.$newTodo.addEventListener('keypress', this.newTodoHandler.bind(this));
		this.view.$todoList.addEventListener('click', this.todoEventHandler.bind(this));
		this.view.todoFooter.$allFilter.addEventListener('click', this.todosDisplayFilterHandler.bind(this));
		this.view.todoFooter.$activeFilter.addEventListener('click', this.todosDisplayFilterHandler.bind(this));
		this.view.todoFooter.$completedFilter.addEventListener('click', this.todosDisplayFilterHandler.bind(this));
		this.view.todoFooter.$clearCompletedBtn.addEventListener('click', this.clearCompletedBtnHandler.bind(this));
	}

	toggleCheckboxElem($checkboxElem) {
		// Toggle the checkbox element by changing the css classes (font-awesome)
		if ($checkboxElem.className.includes('far')) {
			$checkboxElem.className = '';
			$checkboxElem.classList.add('fas');
			$checkboxElem.classList.add('fa-check-circle');
		} else if ($checkboxElem.className.includes('fas')) {
			$checkboxElem.className = '';
			$checkboxElem.classList.add('far');
			$checkboxElem.classList.add('fa-circle');
		}
	}

	createTodoElem(text) {
		const $todo = document.createElement('li');

		const $checkbox = document.createElement('i');
		$checkbox.classList.add('far');
		$checkbox.classList.add('fa-circle');
		$todo.appendChild($checkbox);

		const $label = document.createElement('label');
		$label.textContent = text;
		$todo.appendChild($label);

		const $button = document.createElement('button');
		$button.textContent = '×';
		$button.classList.add('hidden');
		$todo.appendChild($button);

		return $todo;
	}

	updateTodosFooter() {
		// Set visibility of todo footer
		const todos = this.view.$todoList.querySelectorAll('li');
		if (todos.length > 0) {
			this.view.todoFooter.$todoFooter.classList.remove('display-none');
		} else {
			this.view.todoFooter.$todoFooter.classList.add('display-none');
		}

		// Update todo footer counter
		const activeTodos = 
		this.view.$todoList.querySelectorAll('li:not(.completed)');
		this.view.todoFooter.$todoCounter.textContent = activeTodos.length;

		// Set visibility of the 'Clear completed' footer button
		const completedTodos = this.view.$todoList.querySelectorAll('.completed');
		if (completedTodos.length > 0) {
			this.view.todoFooter.$clearCompletedBtn.classList.remove('hidden');
		} else {
			this.view.todoFooter.$clearCompletedBtn.classList.add('hidden');
		}
	}

	getSelectedFilter() {
		return document.querySelector('.todo-footer .selected');
	}

	filterTodosBy($filter) {
		// Update the todo display with the specified filter
		const $selectedFilter = this.getSelectedFilter();
		$selectedFilter.classList.remove('selected');
		$filter.classList.add('selected');

		const todos = this.view.$todoList.children;

		if ($filter === this.view.todoFooter.$allFilter) {
			for(let i = 0; i < todos.length; i++) {
				todos[i].classList.remove('display-none');
			}
		} else if ($filter === this.view.todoFooter.$activeFilter) {
			for(let i = 0; i < todos.length; i++) {
				if (todos[i].className.includes('completed')) {
					todos[i].classList.add('display-none');
				} else {
					todos[i].classList.remove('display-none');
				}
			}
		} else if ($filter === this.view.todoFooter.$completedFilter) {
			for(let i = 0; i < todos.length; i++) {
				if (!todos[i].className.includes('completed')) {
					todos[i].classList.add('display-none');
				} else {
					todos[i].classList.remove('display-none');
				}
			}
		}
	}

	refreshTodosFilter() {
		const $selectedFilter = this.getSelectedFilter();
		this.filterTodosBy($selectedFilter);
	}

	newTodoHandler(e) {
		const inputValue = e.target.value.trim();

		if (e.keyCode === this._ENTER_KEY && inputValue !== '') {
			const $todo = this.createTodoElem(inputValue); 
			this.view.$todoList.appendChild($todo);
			e.target.value = '';
		}
		this.refreshTodosFilter();
		this.updateTodosFooter();
	}

	todoEventHandler(e) {
		const $target = e.target;
		const tagName = $target.tagName;
		const $todo = $target.parentNode;

		if (tagName === 'I') {
			this.toggleCheckboxElem($target);
			$todo.classList.toggle('completed');
			this.refreshTodosFilter();
		} else if (tagName === 'BUTTON') {
			this.view.$todoList.removeChild($todo);
		}
		this.updateTodosFooter();
	}

	todosDisplayFilterHandler(e) {
		this.filterTodosBy(e.target);
	}

	clearCompletedBtnHandler(e) {
		const todos = this.view.$todoList.children;
		let index = [];
		for(let i = 0; i < todos.length; i++) {
			if (todos[i].className.includes('completed')) {
				index.push(todos[i]);
			}
		}
		for(let todo of index) {
			this.view.$todoList.removeChild(todo);
		}
		this.updateTodosFooter();
	}
}