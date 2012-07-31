//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: A stack of block elements which can be revealed via slide transitions.
//>>label: Sliding Stack
//>>group: Widgets
//>>css.structure: ../css/structure/jquery.mobile.slidingstack.css
//>>css.theme: ../css/themes/default/jquery.mobile.theme.css
define( [ "jquery", "./jquery.mobile.widget" ], function( $ ) {

// keeping this here in case the name changes...
var widgetname = "slidingstack";

//>>excludeEnd("jqmBuildExclude");
(function( $, undefined ) {

$.widget( "mobile." + widgetname, $.mobile.widget, {

	options: {
		theme: null,
		initSelector: ":jqmData(role='" + widgetname + "')",
		carousel: true
	},

	_create: function() {
	  var self = this;

		var o = this.options;
		var layers;
		var layer;

    // this stores the initial offset for the child at position 0;
    // this can then be added to/subtracted from all offsets in future,
    // to ensure that children to the left or right don't overlap
    // position 0
		this.offset = 0;

		// this stores the width of the first child (assumes all child
		// elements have a uniform size)
		this.childWidth = 0;

		// the index of the largest available position (0 = the position
		// in view)
		this.largestPosition = 0;

		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( this.element, "c" );
		}

		this.element.addClass( "ui-" + widgetname );

		// set z-indexes for child elements dependent on their
		// child position
		layers = this.element.children();

		if ( layers.length < 1 ) {
		  // nothing to do
		  return;
		}

		for ( var i = 0; i < layers.length; i++ ) {
			layer = $( layers[i] );

			layer.addClass( "ui-" + widgetname + "-block" );

			// current position of the layer (all set to 0 initially)
			layer.jqmData( widgetname + "-position", 0 );

			// ID for the layer (used to look it up)
			layer.attr( "data-" + widgetname + "-layer-id", i );
		}

		// resize the height of the slidingstack layers after the page is drawn
	  var page = this.element.closest( ".ui-page" );

	  if ( page.is( ":visible" ) ) {
		  setTimeout( function () {
		    self._layoutLayers( true );
		  }, 0 );
	  }
	  else {
		  page.bind( "pageshow", function () {
		    setTimeout( function () {
  		    self._layoutLayers( true );
  		  }, 0 );
		  } );
	  }

	  page.bind( "updatelayout", function () {
	    setTimeout( function () {
		    self._layoutLayers();
		  }, 0 );
	  } );
	},

	// set size of layers and enclosing element,
	// and position layers wrt the current window
	_layoutLayers: function( create ) {
		var minHeight = 0;
		var layers = this.element.children();
		var layer;

		if ( create ) {
		  this.offset = $( layers[0] ).position()[ "left" ];
      this.childWidth = $( layers[0] ).width();
      this.largestPosition = layers.length - 1;
		}

		// find the tallest child
		for ( var i = 0; i < layers.length; i++ ) {
			layer = $( layers[i] );

			minHeight = Math.max( minHeight, layer.outerHeight() );

		  // in carousel mode, the layers are given a starting position
		  // where the first layer is visible (position = 0) and the
		  // succeeding layers are to its right
		  if ( this.options.carousel ) {
		    this._moveLayer( layer, i );
		  }
		}

		// set the enclosing element and all the children to the
		// height of the tallest child
		this.element.height( minHeight );
		layers.height( minHeight );
	},

  // get the offset for a layer, given some destination position
	_getOffset: function( destinationPosition ) {
		destinationPosition = ( typeof destinationPosition === "number" ? destinationPosition : 0 );

		// special case when we're sliding an element off to the left of the screen
		if ( destinationPosition < 0 ) {
      return 0 - this.childWidth - this.offset;
		}
		else {
      return this.offset + ( this.childWidth * destinationPosition );
    }
	},

	// positions go from -m (left) to 0 (centered) to n (right), where
	// m and n are integers representing offsets from the center, where
	// the units are equal to the widths of the layers
	_slideLayer: function( layer, endPosition, callback ) {
		var left = this._getOffset( endPosition );

		// position is different, so we need to do the animation
		var animationOptions = {
			easing: "linear",

			// TODO make this configurable
			duration: "medium",

			complete: function () {
				$(layer).jqmData( widgetname + '-position', endPosition );

				if ( callback ) {
					callback( layer );
				}

				layer.trigger( "animationComplete" );
			}
		};

		layer.stop();
		layer.clearQueue();
		layer.animate( { left: left }, animationOptions );
	},

	_moveLayer: function( layer, position ) {
		var left = this._getOffset( position );
		layer.css( "left", left );
		$(layer).jqmData( widgetname + "-position", position );
	},

	// the slideAll*() methods allow the slidingstack to be treated
	// as an infinite carousel
	slideAll: function( direction ) {
		var self = this;
		var layers = this.element.find( "[data-" + widgetname + "-layer-id]" );

		var moveLayerToRightmostPosition = function ( layer ) {
		  self._moveLayer( layer, self.largestPosition );
		};

		var newPosition;
		for ( var i = 0; i < layers.length; i++ ) {
			var layer = $( layers[i] );
			newPosition = layer.jqmData( widgetname + "-position" ) + direction;

			// sliding the visible layer out to the left requires a callback
			// which moves it to the right-hand end when the animation is done
			if ( newPosition < 0 ) {
				this._slideLayer( layer, -1, moveLayerToRightmostPosition );
			}
			else if ( newPosition > this.largestPosition ) {
				this._moveLayer( layer, -1 );
				this._slideLayer( layer, 0 );
			}
			else {
				this._slideLayer( layer, newPosition );
			}
		}
	},

	slideRight: function () {
		this.slideAll( 1 );
	},

	slideLeft: function () {
		this.slideAll( -1 );
	},

	refresh: function( ) {
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
