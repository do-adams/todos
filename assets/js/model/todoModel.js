'use strict';

class TodoModel {
	constructor(text, isCompleted) {
		this.index = -1;
		this.text = text;
		this.isCompleted = isCompleted;
	}
}