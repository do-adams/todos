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
		
		this._view.$todoList.addEventListener(
			'dblclick', (e) => {
				const $target = e.target;
				const tagName = $target.tagName;
				const $todo = $target.parentNode;

				if (tagName.toLowerCase() === 'label' && 
				!this._isTodoElemInEditMode($todo)) {
					this._toggleEditMode($todo, true);
				}
			});

		this._view.$todoList.addEventListener(
			'focusout', this._updateViewAfterEvent((e) => {
				const $target = e.target;
				const tagName = $target.tagName;
				const $todo = $target.parentNode;

				if (tagName.toLowerCase() === 'label') {
					this._toggleEditMode($todo, false);
					if ($target.innerText.trim() === '') {
						this._removeTodoElem($todo);
					} else {
						this._saveTodoElemChanges($todo);
					}
				}
			}));

		this._view.$todoList.addEventListener(
			'keypress', this._updateViewAfterEvent((e) => {
				const $target = e.target;
				const tagName = $target.tagName;
				const $todo = $target.parentNode;

				if (tagName.toLowerCase() === 'label' && 
				e.keyCode === this._ENTER_KEY) {
					this._toggleEditMode($todo, false);
					if ($target.innerText.trim() === '') {
						this._removeTodoElem($todo);
					} else {
						this._saveTodoElemChanges($todo);
					}
				}
			}));

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

	/** 
	 * Toggles the checkbox element in a todo element.
	 * @param {boolean} [checked] - Optional parameter when the checked status 
	 * is to be explicitly set by the caller to either checked or unchecked.
	 * @returns True if the element is checked, false if unchecked.
	 */
_toggleCheckboxElem($todo, checked) {
		// Toggle the checkbox element by changing the css classes (font-awesome)
		const $checkbox = $todo.querySelector('i');
		let cbValue;

		function uncheckBox($cb) {
			$cb.classList.remove('fas');
			$cb.classList.remove('fa-check-circle');

			$cb.classList.add('far');
			$cb.classList.add('fa-circle');

			cbValue = false;
		};

		function checkBox($cb) {
			$cb.classList.remove('far');
			$cb.classList.remove('fa-circle');

			$cb.classList.add('fas');
			$cb.classList.add('fa-check-circle');

			cbValue = true
		};

		if (checked === undefined) {
			// Toggle
			if ($checkbox.className.includes('fa-check-circle')) {
				uncheckBox($checkbox);
			} else if ($checkbox.className.includes('fa-circle')) {
				checkBox($checkbox);
			}
		} else {
			// Set
			if (checked) {
				checkBox($checkbox);
			} else {
				uncheckBox($checkbox);
			}
		}

		return cbValue;
	}

	/**
	 * Builds a generic unchecked and unindexed todo element.
	 * A todo element consists of a checkbox icon, a text label, 
	 * and a delete button.
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
		$todo.setAttribute('data-key', key);
		this._toggleTodoStatus($todo, model.isCompleted);
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
		$todo.setAttribute('data-key', key);

		this._toggleTodoStatus($todo, isCompleted);

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

	/** 
	 * Sets the completed status of an indexed todo element
	 * and saves the changes in the store.
	 * 
	 * @param {boolean} [completed] - Optional parameter when the completed status
	 * of the todo element is to be explicitly set by the caller 
	 * to completed or uncompleted.
	 * @returns True if the todo is completed, false if the todo is uncompleted
	 */
	_toggleTodoStatus($todo, completed) {
		if (completed === undefined) {
			$todo.classList.toggle('completed');
			completed = this._toggleCheckboxElem($todo);
		} else {
			if (completed) {
				$todo.classList.add('completed');
				this._toggleCheckboxElem($todo, true);
			} else {
				$todo.classList.remove('completed');
				this._toggleCheckboxElem($todo, false);
			}
		}

		// Save the toggle changes to the store
		const key = $todo.dataset.key;
		if (key == undefined) {
			throw new Error('data-key property not found on todo element');
		}
		const todoModel = this._store.getTodo(key);
		todoModel.isCompleted = completed;
		this._store.setTodo(key, todoModel);

		return completed;
	}

	_isTodoElemInEditMode($todo) {
		const $label = $todo.querySelector('label');
		const contentEditableValue = $label.getAttribute('contenteditable');
		return (contentEditableValue === null || contentEditableValue === '' 
			|| contentEditableValue === 'false')  ? false : true;
	}

	_toggleEditMode($todo, edit) {
		if (edit === undefined) {
			edit = $todo.classList.contains('edit-mode');
		} 

		// Nifty solution for setting the cursor to the end of the line
		// as discussed in: https://stackoverflow.com/a/3866442
		function setEndOfContentEditable(contentEditableElement) {
			let range, selection;
			if(document.createRange)// Firefox, Chrome, Opera, Safari, IE 9+
			{
				range = document.createRange(); // Create a range (a range is a like the selection but invisible)
				range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
				range.collapse(false); // Collapse the range to the end point. false means collapse to end rather than the start
				selection = window.getSelection(); // Get the selection object (allows you to change selection)
				selection.removeAllRanges(); // Remove any selections already made
				selection.addRange(range); // Make the range you have just created the visible selection
			}
			else if(document.selection)// IE 8 and lower
			{ 
				range = document.body.createTextRange(); // Create a range (a range is a like the selection but invisible)
				range.moveToElementText(contentEditableElement); // Select the entire contents of the element with the range
				range.collapse(false); // Collapse the range to the end point; false means collapse to end rather than the start
				range.select(); // Select the range (make it the visible selection)
			}
		}

		const $checkBox = $todo.querySelector('i');
		const $label = $todo.querySelector('label');

		if (edit) {
			$checkBox.classList.add('hidden');
			
			$todo.classList.add('edit-mode');
			$label.setAttribute('contenteditable', 'true');
			$label.focus();
			setEndOfContentEditable($label);
		} else {
			$checkBox.classList.remove('hidden');

			$todo.classList.remove('edit-mode');
			$label.setAttribute('contenteditable', 'false');
		}

		return edit;
	}

	_saveTodoElemChanges($todo) {
		const key = $todo.dataset.key;
		const model = this._store.getTodo(key);
		model.text = $todo.querySelector('label').innerText.trim();
		model.isCompleted = $todo.classList.contains('completed');
		this._store.setTodo(key, model);
	}

	/**
	 * Removes an indexed todo element from the view and the store.
	 */
	_removeTodoElem($todo) {
		const key = $todo.dataset.key;
		if (key == undefined) {
			throw new Error('data-key property not found on todo element');
		} 
		if ($todo.parentNode === this._view.$todoList) {
			this._view.$todoList.removeChild($todo);
		}
		this._store.removeTodo(key);
	}

	/*
		Event Handlers
	*/

	_checkAllHandler(e) {
		// Toggle the completed status for all filtered (visible) todos
		const todos = this._view.$todoList.children;
		
		const visibleTodos = [];
		for(let i = 0; i < todos.length; i++) {
			if (todos[i].className.includes('display-none')) continue;
			visibleTodos.push(todos[i]);
		}

		const completedVisibleTodos = visibleTodos.filter(($t) => 
		$t.className.includes('completed'));

		// If all todos are completed
		if (completedVisibleTodos.length === visibleTodos.length) {
			visibleTodos.forEach((elem) => {
				this._toggleTodoStatus(elem, false);
			});
		} else { // If some or none todos are completed
			visibleTodos.forEach((elem) => {
				this._toggleTodoStatus(elem, true);
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