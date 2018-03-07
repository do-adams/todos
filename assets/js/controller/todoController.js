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
	 * Returns a function that 
	 * executes an application in the context of this object
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

	initialize() {
		this._setViewEvents();
		this._fillView(this._store);
	}

	_fillView(store) {
		return this._updateViewAfterEvent(() => {
			const todos = store.getAllTodos();
			todos.forEach((t) => {
				const key = t.key;
				const todo = t.todo;
				const $todo = this._loadTodoElem(key, todo);
				this._view.$todoList.appendChild($todo);
			});
		})();
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
	 * 
	 * @returns True if the element is checked, false if unchecked.
	 */
_toggleCheckboxElem($todo, status) {
		// Toggle the checkbox element by changing the css classes (font-awesome)
		const $checkbox = $todo.querySelector('i');
		let cbValue;

		const uncheckBox = ($cb) => {
			$cb.classList.remove('fas');
			$cb.classList.remove('fa-check-circle');

			$cb.classList.add('far');
			$cb.classList.add('fa-circle');

			cbValue = false;
		};

		const checkBox = ($cb) => {
			$cb.classList.remove('far');
			$cb.classList.remove('fa-circle');

			$cb.classList.add('fas');
			$cb.classList.add('fa-check-circle');

			cbValue = true
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

		return cbValue;
	}

	/**
	 * Builds a generic unchecked and unindexed todo element.
	 */
	_buildTodoElem(text) {
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

	/**
	 * Creates an indexed todo element based on model data from the store.
	 */
	_loadTodoElem(key, model) {
		const $todo = this._buildTodoElem(model.text);
		$todo.setAttribute('data-index', key);
		const status = model.isCompleted ? 'completed' : 'uncompleted';
		this._toggleTodoStatus($todo, status);
		return $todo;
	}

	/**
	 * 
	 * Creates a new indexed todo element and saves it to the store
	 */
	_createNewTodo(text, isCompleted) {
		const $todo = this._buildTodoElem(text);

		const model = new TodoModel(text, isCompleted);
		const key = this._store.addTodo(model);
		$todo.setAttribute('data-index', key);

		const status = isCompleted ? 'completed' : 'uncompleted';
		this._toggleTodoStatus($todo, status);

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

	/**
	 * 
	 * Sets the visibility of the todo elements according to the specified
	 * filter.  
	 */
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

	/** An indexed todo element has one of two statuses: completed or uncompleted.
	 * Status is an optional argument to be used when explicitly 
	 * specifying a desired status for the checkbox.
	 * 
	 * Automatically updates the status of the indexed todo model in the store.
	 * 
	 * @returns True if the todo is completed, false if the todo is uncompleted
	 */
	_toggleTodoStatus($todo, status) {
		let isCompleted;

		// Set the completed status for the element
		if (status === undefined) {
			$todo.classList.toggle('completed');
			isCompleted = this._toggleCheckboxElem($todo);
		} else {
			if (status === 'completed') {
				$todo.classList.add('completed');
				isCompleted = this._toggleCheckboxElem($todo, 'checked');
			} else if (status === 'uncompleted') {
				$todo.classList.remove('completed');
				isCompleted = this._toggleCheckboxElem($todo, 'unchecked');
			} else {
				throw new Error('Invalid status argument');
			}
		}

		// Save the toggle changes to the store
		const key = $todo.dataset.index;
		if (key == undefined) {
			throw new Error('data-index property not found on todo element');
		}
		
		const todoModel = this._store.getTodo(key);
		todoModel.isCompleted = isCompleted;
		this._store.setTodo(key, todoModel);

		return isCompleted;
	}

	/**
	 * Removes an indexed todo element from the view and the store.
	 */
	_removeTodoElem($todo) {
		const key = $todo.dataset.index;
		if (key == undefined) {
			throw new Error('data-index property not found on todo element');
		}
		this._view.$todoList.removeChild($todo);
		this._store.removeTodo(key);
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
				this._toggleTodoStatus(elem, 'uncompleted');
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
			const $todo = this._createNewTodo(inputValue, false); 
			this._view.$todoList.appendChild($todo);
			e.target.value = '';
		}
	}

	_todoEventHandler(e) {
		const $target = e.target;
		const tagName = $target.tagName;
		let $todo;

		if (tagName.toLowerCase() === 'i') {
			$todo = $target.parentNode;
			this._toggleTodoStatus($todo);
		} else if (tagName.toLowerCase() === 'button') {
			$todo = $target.parentNode;
			this._removeTodoElem($todo);
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
		for(let $todo of index) {
			this._removeTodoElem($todo)
		}
	}
}