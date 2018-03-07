'use strict';

class TodoController {
	constructor(view, store) {
		this._ENTER_KEY = 13;
		this._view = view;
		this._store = store;
	}

	/* 
		Setup
	*/

	/**
	 * Executes an application (function) in the context of this object
	 * and updates the view screen.
	 */
	_updateViewAfterEvent(func) {
		return (function(event) {
			const result = func.call(this, event);
			this._updateFilteredTodos();
			this._updateTodosFooter();
			return result;
		}).bind(this);
	}

	setView() {
		this._setViewEvents();
	}

	_setViewEvents() {
		this._view.$checkAllIcon.addEventListener(
			'click', this._updateViewAfterEvent(this._checkAllHandler));
		this._view.$newTodo.addEventListener(
			'keypress', this._updateViewAfterEvent(this._newTodoHandler));
		this._view.$todoList.addEventListener(
			'click', this._updateViewAfterEvent(this._todoEventHandler));
		this._view.todoFooter.$allFilter.addEventListener(
			'click', this._todosDisplayFilterHandler.bind(this));
		this._view.todoFooter.$activeFilter.addEventListener(
			'click', this._todosDisplayFilterHandler.bind(this));
		this._view.todoFooter.$completedFilter.addEventListener(
			'click', this._todosDisplayFilterHandler.bind(this));
		this._view.todoFooter.$clearCompleted.addEventListener(
			'click', this._updateViewAfterEvent(this._clearCompletedHandler));
	}

	/* 
		Todo Creation and Management
	*/

	/** A checkbox has one of two statuses: checked or unchecked.
	 * Status is an optional argument to be used when explicitly 
	 * specifying a desired status for the checkbox.
	 */
	_toggleCheckboxElem($todo, status) {
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

	_createTodoElem(text) {
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

	_updateTodosFooter() {
		// Set visibility of todo footer
		const todos = this._view.$todoList.querySelectorAll('li');
		if (todos.length > 0) {
			this._view.todoFooter.$todoFooter.classList.remove('display-none');
		} else {
			this._view.todoFooter.$todoFooter.classList.add('display-none');
		}

		// Update todo footer counter
		const activeTodos = 
		this._view.$todoList.querySelectorAll('li:not(.completed)');
		this._view.todoFooter.$todoCounter.textContent = activeTodos.length;

		// Set visibility of the 'Clear completed' footer button
		const completedTodos = this._view.$todoList.querySelectorAll('.completed');
		if (completedTodos.length > 0) {
			this._view.todoFooter.$clearCompleted.classList.remove('hidden');
		} else {
			this._view.todoFooter.$clearCompleted.classList.add('hidden');
		}
	}

	_getSelectedFilter() {
		return document.querySelector('.todo-footer .selected');
	}

	_filterTodosBy($filter) {
		// Update the todo display with the specified filter
		const $selectedFilter = this._getSelectedFilter();
		$selectedFilter.classList.remove('selected');
		$filter.classList.add('selected');

		const todos = this._view.$todoList.children;

		if ($filter === this._view.todoFooter.$allFilter) {
			for(let i = 0; i < todos.length; i++) {
				todos[i].classList.remove('display-none');
			}
		} else if ($filter === this._view.todoFooter.$activeFilter) {
			for(let i = 0; i < todos.length; i++) {
				if (todos[i].className.includes('completed')) {
					todos[i].classList.add('display-none');
				} else {
					todos[i].classList.remove('display-none');
				}
			}
		} else if ($filter === this._view.todoFooter.$completedFilter) {
			for(let i = 0; i < todos.length; i++) {
				if (!todos[i].className.includes('completed')) {
					todos[i].classList.add('display-none');
				} else {
					todos[i].classList.remove('display-none');
				}
			}
		}
	}

	_updateFilteredTodos() {
		const $selectedFilter = this._getSelectedFilter();
		this._filterTodosBy($selectedFilter);
	}

	/** A todo element has one of two statuses: completed or incompleted.
	 * Status is an optional argument to be used when explicitly 
	 * specifying a desired status for the checkbox.
	 */
	_toggleTodoStatus($todo, status) {
		if (status === undefined) {
			$todo.classList.toggle('completed');
			this._toggleCheckboxElem($todo);
		} else {
			if (status === 'completed') {
				$todo.classList.add('completed');
				this._toggleCheckboxElem($todo, 'checked');
			} else if (status === 'incompleted') {
				$todo.classList.remove('completed');
				this._toggleCheckboxElem($todo, 'unchecked');
			} else {
				throw new Error('Invalid status argument');
			}
		}
	}

	/*
		Event Handlers
	*/

	_checkAllHandler(e) {
		// Toggle the completed status for all filtered (visible) todos
		const todos = this._view.$todoList.children;
		const completed = this._view.$todoList.querySelectorAll('.completed');
		const visibleTodos = [];

		for(let i = 0; i < todos.length; i++) {
			if (todos[i].className.includes('display-none')) continue;
			visibleTodos.push(todos[i]);
		}

		// If all todos are completed
		if (completed.length === visibleTodos.length) {
			visibleTodos.forEach((elem) => {
				this._toggleTodoStatus(elem, 'incompleted');
			});
		} else { // If some or none todos are completed
			visibleTodos.forEach((elem) => {
				this._toggleTodoStatus(elem, 'completed');
			});
		}
	}

	_newTodoHandler(e) {
		const inputValue = e.target.value.trim();

		if (e.keyCode === this._ENTER_KEY && inputValue !== '') {
			const $todo = this._createTodoElem(inputValue); 
			this._view.$todoList.appendChild($todo);
			e.target.value = '';
		}
	}

	_todoEventHandler(e) {
		const $target = e.target;
		const tagName = $target.tagName;
		const $todo = $target.parentNode;

		if (tagName.toLowerCase() === 'i') {
			this._toggleTodoStatus($todo);
		} else if (tagName.toLowerCase() === 'button') {
			this._view.$todoList.removeChild($todo);
		}
	}

	_todosDisplayFilterHandler(e) {
		this._filterTodosBy(e.target);
	}

	_clearCompletedHandler(e) {
		const todos = this._view.$todoList.children;
		let index = [];
		for(let i = 0; i < todos.length; i++) {
			if (todos[i].className.includes('completed')) {
				index.push(todos[i]);
			}
		}
		for(let todo of index) {
			this._view.$todoList.removeChild(todo);
		}
	}
}