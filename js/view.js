'use strict';

class View {
	constructor() {
		this.$newTodo = document.querySelector('.new-todo');
		this.$todoList = document.querySelector('.todo-list');
		this.todoFooter = {
			$itemCounter: document.querySelector('.item-counter'),
			$allFilter: document.querySelector('.filter-all'),
			$activeFilter: document.querySelector('.filter-active'),
			$completedFilter: document.querySelector('.filter-completed'),
		};
	}
}