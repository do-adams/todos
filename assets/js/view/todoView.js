'use strict';

class TodoView {
	constructor() {
		this.$checkAllIcon = document.querySelector('.check-all');
		this.$newTodo = document.querySelector('.new-todo');
		this.$todoList = document.querySelector('.todo-list');
		this.todoFooter = {
			$todoFooter: document.querySelector('.todo-footer'),
			$todoCounter: document.querySelector('.todo-counter'),
			$allFilter: document.querySelector('.filter-all'),
			$activeFilter: document.querySelector('.filter-active'),
			$completedFilter: document.querySelector('.filter-completed'),
			$clearCompleted: document.querySelector('.clear-completed')
		};
	}
}