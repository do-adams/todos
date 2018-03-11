'use strict';

class TodoToggleUtility {
	constructor() {}

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
		}

		function checkBox($cb) {
			$cb.classList.remove('far');
			$cb.classList.remove('fa-circle');

			$cb.classList.add('fas');
			$cb.classList.add('fa-check-circle');

			cbValue = true;
		}

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
	 * Sets the completed status of an indexed todo element
	 * and saves the changes in the store.
	 * 
	 * @param {boolean} [completed] - Optional parameter when the completed status
	 * of the todo element is to be explicitly set by the caller 
	 * to completed or uncompleted.
	 * @returns True if the todo is completed, false if the todo is uncompleted
	 */
	toggleTodoStatus($todo, completed) {
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
		return completed;
	}

	toggleEditMode($todo, edit) {
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
    
}