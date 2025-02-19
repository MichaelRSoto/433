(function($) {  
	// (function($) { ... })(jQuery) is an Immediately Invoked Function Expression (IIFE).
	// It ensures that everything inside runs right away and isolates the $ alias for jQuery.
	// "$" is passed in so we can use it as a shorthand for jQuery without conflicting with other libraries.
  
	/**
	 * Generate an indented list of links from a nav. Meant for use with panel().
	 * 
	 * This function scans through every <a> (anchor) inside the selected element,
	 * creates an "indented" HTML structure based on the anchor's nesting depth,
	 * and returns the new HTML as a single string.
	 *
	 * Example usage:
	 *   var navHTML = $('#nav').navList();
	 *   console.log(navHTML); // the resulting <a> links with indentations
	 *
	 * @return {string} A single string containing the new set of <a> tags with indentation.
	 */
	$.fn.navList = function() {
  
	  // Store current jQuery selection in $this.
	  var $this = $(this),
		  // Find all <a> tags inside $this.
		  $a = $this.find('a'),
		  // We'll store the new HTML strings in array b.
		  b = [];
  
	  // Loop through each <a> tag found.
	  $a.each(function() {
  
		// $this inside .each() means the current <a> element we're looping over.
		var $this = $(this),
			// Determine how many parent <li> elements this <a> has.
			// That number minus one is used to figure out indentation level.
			indent = Math.max(0, $this.parents('li').length - 1),
			// Grab the href attribute of the current link.
			href = $this.attr('href'),
			// Grab the target attribute of the current link (e.g., "_blank").
			target = $this.attr('target');
  
		// Push onto array b a string containing:
		// 1) an <a> tag with classes and optional target/href attributes,
		// 2) an extra <span> that visually shows indentation,
		// 3) the actual text inside the link.
		b.push(
		  '<a ' +
			'class="link depth-' + indent + '"' +
			// If target is set, add target="..." to the <a> tag
			(
			  (typeof target !== 'undefined' && target != '')
			  ? ' target="' + target + '"'
			  : ''
			) +
			// If href is set, add href="..." to the <a> tag
			(
			  (typeof href !== 'undefined' && href != '')
			  ? ' href="' + href + '"'
			  : ''
			) +
		  '>' +
			'<span class="indent-' + indent + '"></span>' +
			// The visible link text is just the text content of the original <a>.
			$this.text() +
		  '</a>'
		);
  
	  });
  
	  // Join all elements in b into one continuous string, then return it.
	  return b.join('');
  
	};
  
	/**
	 * Panel-ify an element. This adds "panel" behavior to the selected element.
	 *
	 * It can, for example, create a hidden side panel that slides out on certain triggers.
	 * 
	 * @param {object} userConfig An object of configuration options.
	 * @return {jQuery} The jQuery object (for chaining).
	 */
	$.fn.panel = function(userConfig) {
  
	  // If there's no element selected, return $this (which would be empty).
	  if (this.length == 0)
		return this; // returning "this" means the empty jQuery set
  
	  // If multiple elements are selected, run .panel(userConfig) on each one.
	  // This ensures each element you selected is panel-ified.
	  if (this.length > 1) {
  
		for (var i = 0; i < this.length; i++)
		  $(this[i]).panel(userConfig);
  
		return this;
	  }
  
	  // Vars.
	  var $this = $(this),      // The single element we want to panel-ify
		  $body = $('body'),    // Body element
		  $window = $(window),  // The jQuery window object
		  id = $this.attr('id'),// The panel's HTML "id" attribute
		  config;               // We'll store final config options here
  
	  // Merge userConfig with default settings.
	  // $.extend() merges properties of the second object into the first.
	  config = $.extend({
  
		// Delay in milliseconds for certain show/hide actions.
		delay: 0,
  
		// If true, hide the panel when any link inside it is clicked.
		hideOnClick: false,
  
		// If true, hide the panel if the user presses the ESC key.
		hideOnEscape: false,
  
		// If true, hide the panel when the user swipes away from it.
		hideOnSwipe: false,
  
		// If true, reset panel scroll position to top when hidden.
		resetScroll: false,
  
		// If true, reset all form fields in the panel when hidden.
		resetForms: false,
  
		// Which side of the screen the panel appears on (e.g., 'left', 'right').
		side: null,
  
		// The DOM element to which we apply the "visibleClass" toggling.
		// This is typically the panel itself but can be something else.
		target: $this,
  
		// The CSS class that is toggled to show/hide the panel.
		visibleClass: 'visible'
  
	  }, userConfig);
  
	  // If config.target isn't already a jQuery object, turn it into one.
	  if (typeof config.target != 'jQuery')
		config.target = $(config.target);
  
	  // Define a helper function to hide the panel.
	  $this._hide = function(event) {
  
		// If the panel is already hidden, do nothing.
		if (!config.target.hasClass(config.visibleClass))
		  return;
  
		// If we got an event (like a click), prevent default browser behavior (e.g., following a link).
		if (event) {
		  event.preventDefault();
		  event.stopPropagation();
		}
  
		// Remove the visible class to hide the panel.
		config.target.removeClass(config.visibleClass);
  
		// After the specified delay, do any "reset" actions if enabled.
		window.setTimeout(function() {
  
		  // If resetScroll is true, scroll panel back to the top.
		  if (config.resetScroll)
			$this.scrollTop(0);
  
		  // If resetForms is true, find all forms in the panel and reset them.
		  if (config.resetForms)
			$this.find('form').each(function() {
			  this.reset();
			});
  
		}, config.delay);
  
	  };
  
	  // Vendor fixes: Make scrolling smoother on certain browsers.
	  $this
		// -ms-overflow-style: -ms-autohiding-scrollbar hides the scrollbars in older IE/Edge
		.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
		// -webkit-overflow-scrolling: touch gives smooth scrolling on iOS devices
		.css('-webkit-overflow-scrolling', 'touch');
  
	  // HIDE ON CLICK: If enabled, clicking a link inside the panel will hide it.
	  if (config.hideOnClick) {
  
		// Turn off the default tap highlight effect on mobile for these links.
		$this.find('a')
		  .css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
  
		// Listen for clicks on these links.
		$this.on('click', 'a', function(event) {
  
		  var $a = $(this),
			  href = $a.attr('href'),
			  target = $a.attr('target');
  
		  // If there's no meaningful href (or it's a hash link to this panel), ignore.
		  if (!href || href == '#' || href == '' || href == '#' + id)
			return;
  
		  // Otherwise, we want to hide the panel before navigating.
		  event.preventDefault();
		  event.stopPropagation();
  
		  // Hide the panel.
		  $this._hide();
  
		  // After the panel is hidden (plus a small offset), go to the link.
		  window.setTimeout(function() {
  
			if (target == '_blank')
			  window.open(href);      // Open in new tab/window
			else
			  window.location.href = href; // Open in the same window
  
		  }, config.delay + 10);
  
		});
  
	  }
  
	  // TOUCH EVENTS: We detect swipes so we can hide the panel if hideOnSwipe is true.
	  $this.on('touchstart', function(event) {
		// Record the finger's initial X and Y positions on touchstart.
		$this.touchPosX = event.originalEvent.touches[0].pageX;
		$this.touchPosY = event.originalEvent.touches[0].pageY;
	  });
  
	  $this.on('touchmove', function(event) {
  
		// If we didn't record a starting position, do nothing.
		if ($this.touchPosX === null || $this.touchPosY === null)
		  return;
  
		// Calculate how far we've swiped horizontally (diffX) and vertically (diffY).
		var diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
			diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
			// th = total outer height of the panel
			th = $this.outerHeight(),
			// ts = the maximum vertical scroll inside the panel minus current scroll
			// effectively how much more we can scroll within the panel
			ts = ($this.get(0).scrollHeight - $this.scrollTop());
  
		// If hideOnSwipe is true, check if the user swiped enough in the correct direction to hide the panel.
		if (config.hideOnSwipe) {
  
		  var result = false,
			  boundary = 20,  // small threshold to detect a fairly straight swipe
			  delta = 50;     // how far the swipe must travel
  
		  // Decide which direction would close the panel based on config.side.
		  switch (config.side) {
			case 'left':
			  // Swiping left means diffX > delta if the movement up/down is within 'boundary'.
			  result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
			  break;
  
			case 'right':
			  // Swiping right means diffX < (-1 * delta).
			  result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
			  break;
  
			case 'top':
			  // Swiping up means diffY > delta.
			  result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
			  break;
  
			case 'bottom':
			  // Swiping down means diffY < (-1 * delta).
			  result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
			  break;
  
			default:
			  break;
		  }
  
		  // If we got a correct swipe, hide the panel.
		  if (result) {
			$this.touchPosX = null;
			$this.touchPosY = null;
			$this._hide();
			return false; // Stop the event
		  }
  
		}
  
		// Prevent "rubber-band" scrolling or bouncing at the top/bottom of the panel.
		// If we're scrolled to the top and trying to scroll up further, or scrolled
		// to the bottom and trying to scroll down further, we stop it.
		if (
		  ($this.scrollTop() < 0 && diffY < 0) ||
		  (ts > (th - 2) && ts < (th + 2) && diffY > 0)
		) {
		  event.preventDefault();
		  event.stopPropagation();
		}
  
	  });
  
	  // Prevent clicks or touches INSIDE the panel from propagating outside.
	  // That way, clicking in the panel doesn’t hide it.
	  $this.on('click touchend touchstart touchmove', function(event) {
		event.stopPropagation();
	  });
  
	  // If the panel has a child link that points to "#id" of the panel itself, hide the panel when that link is clicked.
	  $this.on('click', 'a[href="#' + id + '"]', function(event) {
		event.preventDefault();
		event.stopPropagation();
		config.target.removeClass(config.visibleClass);
	  });
  
	  // Set up hide/show events on the BODY element.
	  // If we click or touch the BODY (outside the panel), hide the panel.
	  $body.on('click touchend', function(event) {
		$this._hide(event);
	  });
  
	  // If there's a link anywhere on the page that has href="#id", we toggle the panel's visibility when clicked.
	  $body.on('click', 'a[href="#' + id + '"]', function(event) {
		event.preventDefault();
		event.stopPropagation();
		config.target.toggleClass(config.visibleClass);
	  });
  
	  // If hideOnEscape is true, pressing ESC (keyCode 27) hides the panel.
	  if (config.hideOnEscape)
		$window.on('keydown', function(event) {
		  if (event.keyCode == 27)
			$this._hide(event);
		});
  
	  // Return $this to allow jQuery chaining.
	  return $this;
  
	};
  
	/**
	 * Apply "placeholder" attribute polyfill to one or more forms.
	 * 
	 * This means if the browser doesn't support the placeholder attribute,
	 * we manually show the placeholder text and remove it when user focuses the field, etc.
	 *
	 * @return {jQuery} jQuery object (for chaining).
	 */
	$.fn.placeholder = function() {
  
	  // If the current browser natively supports "placeholder", do nothing.
	  // 'undefined' means not supported, so if it's != 'undefined', it's supported.
	  if (typeof (document.createElement('input')).placeholder != 'undefined')
		return $(this);
  
	  // No elements?
	  if (this.length == 0)
		return this;
  
	  // Multiple elements? Apply .placeholder() to each.
	  if (this.length > 1) {
  
		for (var i = 0; i < this.length; i++)
		  $(this[i]).placeholder();
  
		return this;
	  }
  
	  // Vars.
	  var $this = $(this);
  
	  // For every text or textarea element:
	  $this.find('input[type=text],textarea')
		// .each() so we handle them individually.
		.each(function() {
  
		  var i = $(this);
  
		  // If the field is empty OR equals the placeholder text, we set the placeholder style (polyfill).
		  if (i.val() == '' || i.val() == i.attr('placeholder'))
			i
			  .addClass('polyfill-placeholder')  // a class to style it as placeholder
			  .val(i.attr('placeholder'));       // sets the placeholder text
  
		})
		// When the field loses focus, if it's empty, restore the placeholder text.
		.on('blur', function() {
  
		  var i = $(this);
  
		  // If the name ends with '-polyfill-field', skip it (it's a special hidden field for password).
		  if (i.attr('name').match(/-polyfill-field$/))
			return;
  
		  if (i.val() == '')
			i
			  .addClass('polyfill-placeholder')
			  .val(i.attr('placeholder'));
  
		})
		// When the field gains focus, if it currently has the placeholder text, clear it.
		.on('focus', function() {
  
		  var i = $(this);
  
		  if (i.attr('name').match(/-polyfill-field$/))
			return;
  
		  if (i.val() == i.attr('placeholder'))
			i
			  .removeClass('polyfill-placeholder')
			  .val('');
  
		});
  
	  // Special handling for password fields (since type="password" hides text).
	  $this.find('input[type=password]')
		.each(function() {
  
		  var i = $(this);
		  // Create a clone of the password input but as type="text".
		  // This is used to display the placeholder visually (because real password fields hide characters).
		  var x = $(
			$('<div>')
			  .append(i.clone())
			  .remove()
			  .html()
			  .replace(/type="password"/i, 'type="text"')
			  .replace(/type=password/i, 'type=text')
		  );
  
		  // If original has an ID, the clone gets a "-polyfill-field" ID.
		  if (i.attr('id') != '')
			x.attr('id', i.attr('id') + '-polyfill-field');
  
		  // Same for name attribute.
		  if (i.attr('name') != '')
			x.attr('name', i.attr('name') + '-polyfill-field');
  
		  // Give the clone the placeholder styling and insert it after the real password input.
		  x
			.addClass('polyfill-placeholder')
			.val(x.attr('placeholder'))
			.insertAfter(i);
  
		  // If the real password input is empty, hide it (show the clone).
		  if (i.val() == '')
			i.hide();
		  else
			x.hide();
  
		  // When the real password input loses focus:
		  i.on('blur', function(event) {
  
			event.preventDefault();
  
			// x is the text clone input next to it (with a matching name but -polyfill-field).
			var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');
  
			// If user left the password field empty, hide it and show the clone again.
			if (i.val() == '') {
			  i.hide();
			  x.show();
			}
  
		  });
  
		  // When the text clone is focused:
		  x.on('focus', function(event) {
  
			event.preventDefault();
  
			// The real password input has the same name minus the -polyfill-field suffix.
			var i = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');
  
			// Hide the clone, show the real password input, and focus it.
			x.hide();
			i
			  .show()
			  .focus();
  
		  })
		  // If user types in the clone, we just clear it so the placeholder text doesn't remain.
		  .on('keypress', function(event) {
			event.preventDefault();
			x.val('');
		  });
  
		});
  
	  // EVENTS: On form submit and reset, handle placeholders properly.
	  $this
		// On submit, remove placeholder text so it's not sent as actual value.
		.on('submit', function() {
  
		  $this.find('input[type=text],input[type=password],textarea')
			.each(function(event) {
  
			  var i = $(this);
  
			  // If it ends with -polyfill-field, clear its name so it won't submit.
			  if (i.attr('name').match(/-polyfill-field$/))
				i.attr('name', '');
  
			  // If the value equals the placeholder text, clear it out.
			  if (i.val() == i.attr('placeholder')) {
				i.removeClass('polyfill-placeholder');
				i.val('');
			  }
  
			});
  
		})
		// On form reset, we restore placeholders correctly.
		.on('reset', function(event) {
  
		  event.preventDefault();
  
		  // Reset selects to their first option.
		  $this.find('select')
			.val($('option:first').val());
  
		  // For all inputs and textareas:
		  $this.find('input,textarea')
			.each(function() {
  
			  var i = $(this),
				  x;
  
			  // Remove any placeholder class.
			  i.removeClass('polyfill-placeholder');
  
			  // Switch on element's type to handle differently.
			  switch (this.type) {
  
				case 'submit':
				case 'reset':
				  // Nothing special to do for submit/reset buttons.
				  break;
  
				case 'password':
				  // Revert to defaultValue. Then we handle the polyfill clone if empty.
				  i.val(i.attr('defaultValue'));
  
				  x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');
  
				  if (i.val() == '') {
					i.hide();
					x.show();
				  }
				  else {
					i.show();
					x.hide();
				  }
  
				  break;
  
				case 'checkbox':
				case 'radio':
				  // Reset to defaultValue which indicates whether it’s checked initially.
				  i.attr('checked', i.attr('defaultValue'));
				  break;
  
				case 'text':
				case 'textarea':
				  // For normal text fields, revert to defaultValue.
				  i.val(i.attr('defaultValue'));
  
				  // If empty, set placeholder text back.
				  if (i.val() == '') {
					i.addClass('polyfill-placeholder');
					i.val(i.attr('placeholder'));
				  }
  
				  break;
  
				default:
				  // Everything else just goes back to defaultValue.
				  i.val(i.attr('defaultValue'));
				  break;
  
			  }
			});
  
		});
  
	  // Return the jQuery element for chaining.
	  return $this;
  
	};
  
	/**
	 * Moves elements to/from the first positions of their respective parents.
	 * 
	 * This is a utility method to "prioritize" certain elements on smaller screens,
	 * for example moving a navigation bar to the top. 
	 * 
	 * @param {jQuery|string} $elements A jQuery object or string selector for elements to move.
	 * @param {boolean} condition If true, move them to the top. If false, move them back to original spot.
	 */
	$.prioritize = function($elements, condition) {
  
	  var key = '__prioritize';
  
	  // If $elements is just a selector string, convert it into a jQuery object.
	  if (typeof $elements != 'jQuery')
		$elements = $($elements);
  
	  // Go through each element in $elements.
	  $elements.each(function() {
  
		var $e = $(this), $p,
			$parent = $e.parent();
  
		// If element has no parent, we can't move it, so exit.
		if ($parent.length == 0)
		  return;
  
		// If this element was never moved before:
		if (!$e.data(key)) {
  
		  // If condition is false, do nothing (don't move it).
		  if (!condition)
			return;
  
		  // The placeholder is the element that was immediately before $e.
		  // We store it so we know where to move $e back later.
		  $p = $e.prev();
  
		  // If there's no previous sibling, that might mean $e is already at the top, so we bail.
		  if ($p.length == 0)
			return;
  
		  // Move element to the top (prependTo) of its parent.
		  $e.prependTo($parent);
  
		  // Store the placeholder info in the element's data for later use.
		  $e.data(key, $p);
  
		}
		else {
		  // If the element was already moved:
  
		  // If condition is still true, do nothing (let it stay).
		  if (condition)
			return;
  
		  // Otherwise, retrieve the placeholder (the element that used to be above it).
		  $p = $e.data(key);
  
		  // Insert $e after that placeholder, effectively restoring its old position.
		  $e.insertAfter($p);
  
		  // Clear out the data so we know it's no longer moved.
		  $e.removeData(key);
  
		}
  
	  });
  
	};
  


  })(jQuery);  
  // End of IIFE. All jQuery plugins and functions above are defined in this scope.
  