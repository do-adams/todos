'use strict';

class TodoController {
	constructor(view, store) {
		this._ENTER_KEY = 13;
		this.view = view;
		this.store = store;
	}

	/* 
		Setup
	*/

	/**
	 * Executes an application (function) in the context of this object
	 * and updates the view screen.
	 */
	updateViewAfterEvent(func) {
		return (function(event) {
			func.call(this, event);
			this.updateFilteredTodos();
			this.updateTodosFooter();
		}).bind(this);
	}

	setView() {
		this.setViewEvents();
	}

	setViewEvents() {
		this.view.$checkAllIcon.addEventListener(
			'click', this.updateViewAfterEvent(this.checkAllHandler));
		this.view.$newTodo.addEventListener(
			'keypress', this.updateViewAfterEvent(this.newTodoHandler));
		this.view.$todoList.addEventListener(
			'click', this.updateViewAfterEvent(this.todoEventHandler));
		this.view.todoFooter.$allFilter.addEventListener(
			'click', this.todosDisplayFilterHandler.bind(this));
		this.view.todoFooter.$activeFilter.addEventListener(
			'click', this.todosDisplayFilterHandler.bind(this));
		this.view.todoFooter.$completedFilter.addEventListener(
			'click', this.todosDisplayFilterHandler.bind(this));
		this.view.todoFooter.$clearCompleted.addEventListener(
			'click', this.updateViewAfterEvent(this.clearCompletedHandler));
	}

	/* 
		Todo Creation and Management
	*/

	/** A checkbox has one of two statuses: checked or unchecked.
	 * Status is an optional argument to be used when explicitly 
	 * specifying a desired status for the checkbox.
	 */
	toggleCheckboxElem($todo, status) {
		// Toggle the checkbox element by changing the css classes (font-awesome)
		const $checkbox = $todo.querySelector('i');

		const uncheckBox = ($cb) => {
			$cb.classList.remove('fas');
			$cb.classList.remove('fa-check-circle');

			$cb.classList.add('far');
			$cb.classList.add('fa-circle');
		};

		const checkBox = ($cb) => {
			$cb.classList.remove('far');
			$cb.classList.remove('fa-circle');

			$cb.classList.add('fas');
			$cb.classList.add('fa-check-circle');
		};

		if (status === undefined) {
			// Toggle
			if ($checkbox.className.includes('fa-check-circle')) {
				uncheckBox($checkbox);
			} else if ($checkbox.className.includes('fa-circle')) {
				checkBox($checkbox);
			}
		} else {
			// Set
			if (status === 'checked') {
				checkBox($checkbox);
			} else if (status === 'unchecked') {
				uncheckBox($checkbox);
			} else {
				throw new Error('Invalid status argument');
			}
		}
	}

	createTodoElem(text) {
		const $todo = document.createElement('li');

		// Add unchecked checkbox
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
			this.view.todoFooter.$clearCompleted.classList.remove('hidden');
		} else {
			this.view.todoFooter.$clearCompleted.classList.add('hidden');
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

	updateFilteredTodos() {
		const $selectedFilter = this.getSelectedFilter();
		this.filterTodosBy($selectedFilter);
	}

	/** A todo element has one of two statuses: completed or incompleted.
	 * Status is an optional argument to be used when explicitly 
	 * specifying a desired status for the checkbox.
	 */
	toggleTodoStatus($todo, status) {
		if (status === undefined) {
			$todo.classList.toggle('completed');
			this.toggleCheckboxElem($todo);
		} else {
			if (status === 'completed') {
				$todo.classList.add('completed');
				this.toggleCheckboxElem($todo, 'checked');
			} else if (status === 'incompleted') {
				$todo.classList.remove('completed');
				this.toggleCheckboxElem($todo, 'unchecked');
			} else {
				throw new Error('Invalid status argument');
			}
		}
	}

	/*
		Event Handlers
	*/

	checkAllHandler(e) {
		// Toggle the completed status for all filtered (visible) todos
		const todos = this.view.$todoList.children;
		const completed = this.view.$todoList.querySelectorAll('.completed');
		const visibleTodos = [];

		for(let i = 0; i < todos.length; i++) {
			if (todos[i].className.includes('display-none')) continue;
			visibleTodos.push(todos[i]);
		}

		// If all todos are completed
		if (completed.length === visibleTodos.length) {
			visibleTodos.forEach((elem) => {
				this.toggleTodoStatus(elem, 'incompleted');
			});
		} else { // If some or none todos are completed
			visibleTodos.forEach((elem) => {
				this.toggleTodoStatus(elem, 'completed');
			});
		}
	}

	newTodoHandler(e) {
		const inputValue = e.target.value.trim();

		if (e.keyCode === this._ENTER_KEY && inputValue !== '') {
			const $todo = this.createTodoElem(inputValue); 
			this.view.$todoList.appendChild($todo);
			e.target.value = '';
		}
	}

	todoEventHandler(e) {
		const $target = e.target;
		const tagName = $target.tagName;
		const $todo = $target.parentNode;

		if (tagName.toLowerCase() === 'i') {
			this.toggleTodoStatus($todo);
		} else if (tagName.toLowerCase() === 'button') {
			this.view.$todoList.removeChild($todo);
		}
	}

	todosDisplayFilterHandler(e) {
		this.filterTodosBy(e.target);
	}

	clearCompletedHandler(e) {
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
	}
}