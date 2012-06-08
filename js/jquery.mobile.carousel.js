//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: An (optionally) infinitely circling carousel.
//>>label: Carousel
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.carousel.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css
define( [ "jquery", "./jquery.mobile.widget" ], function( $ ) {

// keeping this here in case the name changes...
var widgetname = "carousel";

//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

$.widget( "mobile." + widgetname, $.mobile.widget, {

	options: {
		theme: null,
		initSelector: ":jqmData(role='" + widgetname + "')"
	},

	_create: function() {
	  this.currentPane = 0;
	  this.positioning = [];
		this.refresh( true );
	},

	// apply the stop positions to child elements; NB this just changes
	// the "left" setting of each child so it can be scrolled to
	// correctly when elements are shifted around
	_positionPanes: function() {
    var left;
    var panes = this.element.children();

    for ( var i = 0; i < this.positioning.length; i++ ) {
      left = this.positioning[i].left;
      $( panes[i] ).css( "left", left + "px" );
    }
	},

	// set initial height of panes and enclosing element
	_configurePanes: function() {
		var panes = this.element.children();
		var minHeight = this.element.outerHeight();
		var pane;
		var lastPaneRightEdge = 0;
		var startPosition;

		for ( var i = 0; i < panes.length; i++ ) {
			pane = $( panes[i] );

			// position the pane to the right of its sibling
			if ( lastPaneRightEdge > 0 ) {
			  left = lastPaneRightEdge + pane.offset()[ "left" ];
      }
      else {
        left = pane.offset()[ "left" ];
      }

			// find the tallest child
			minHeight = Math.max( minHeight, pane.outerHeight() );

			// set the pane to vertically fill its parent
			pane.css( "height", "100%" );

      // record the pane's stop position
      this.positioning.push( {
        index: i,
        left: left,
        stop: lastPaneRightEdge
      } );

      // add the width of this pane, ready to position the next pane
			lastPaneRightEdge += pane.outerWidth( true ) + pane.offset()[ "left" ];
		}

		this._positionPanes();

		// set the enclosing element and all the children to the
		// height of the tallest child
		this.element.height( minHeight );
		this.element.css( "min-width", lastPaneRightEdge + "px" );
	},

	slide: function( direction ) {
	  var self = this;
	  var children = this.element.children();
	  var numberOfPanes = children.length;

	  // get the pane we want to scroll to
    var targetPaneNumber = this.currentPane + ( direction === "left" ? 1 : -1 );

    // if we're outside the bounds of the list of panes, shift panes
    // in the DOM and refresh
    if ( targetPaneNumber < 0 ) {
      targetPaneNumber = 0;

      // move the last pane in the DOM in front of the first
      var lastPane = children.last();
      $( lastPane ).insertBefore( children.first() );
      this._positionPanes();
    }
    else if ( targetPaneNumber > (numberOfPanes - 1) ) {
      targetPaneNumber = numberOfPanes - 1;

      // move the first pane in the DOM after the last
      var firstPane = children.first();
      $( lastPane ).insertAfter( children.last() );
      this._positionPanes();
    }

	  // set destination to its stop position
    var left = 0 - this.positioning[ targetPaneNumber ].stop;

		var animationOptions = {
			easing: "linear",

			// TODO make this configurable
			duration: 500,

			complete: function () {
				self.currentPane = targetPaneNumber;
			}
		};

		this.element.stop();
		this.element.clearQueue();
		this.element.animate( { left: left }, animationOptions );
	},

	refresh: function( create ) {
		var self = this;
		var o = this.options;
		var panes;
		var pane;
		var paneTheme;

		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( this.element, "c" );
		}

		this.element.addClass( "ui-" + widgetname );

		// set z-indexes for child elements dependent on their
		// child position
		panes = this.element.children();

		for ( var i = 0; i < panes.length; i++ ) {
			pane = $( panes[i] );

			paneTheme = pane.jqmData( "theme" ) || o.theme;
			pane.addClass( "ui-body-" + paneTheme );

			pane.addClass( "ui-" + widgetname + "-block" );
		}

		// resize the height of the slidingstack panes after the page is drawn
		if ( this.element.closest( ".ui-page" ).is( ":visible" ) ) {
			this._configurePanes();
		}
		else {
			this.element.closest( ".ui-page" ).bind( "pageshow", function() {
				self._configurePanes();
			} );
		}
	}

});

// auto self-init widgets
$( document ).bind( "pagecreate create", function( e ){
	$.mobile[widgetname].prototype.enhanceWithin( e.target );
});

})( jQuery );
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
});
//>>excludeEnd("jqmBuildExclude");
