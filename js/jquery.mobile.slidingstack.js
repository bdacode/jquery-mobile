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
		this.refresh( true );
	},

	// set initial size of layers and enclosing element,
	// and store positioning data for each layer
	_configureLayers: function() {
		var minHeight = 0;
		var layers = this.element.children();
		var layer;
		var layerWidth;
		var layerLeft;

		for ( var i = 0; i < layers.length; i++ ) {
			layer = $( layers[i] );

			// find the tallest child
			minHeight = Math.max( minHeight, layer.outerHeight() );

			// store the initial offsets of the child, so when
			// transitioning the layer, we can reposition it correctly
			layer.jqmData( widgetname + "-positioning", {
				"center": layer.position()[ "left" ],
				"currentPosition": 0
			} );
		}

		// set the enclosing element and all the children to the
		// height of the tallest child
		this.element.height( minHeight );
		layers.height( minHeight );

		// in carousel mode, the layers are given a starting position
		// where the first layer is centered (position = 0) and the
		// succeeding layers are to its right
		if ( this.options.carousel ) {
			var startingPositions = this.getPositions();
			var layers = [];

			for ( var i = 0; i < startingPositions.length; i++ ) {
				// the layer number is just its index + 1
				layers.push(i + 1);

				// the first layer is at position 0; subsequent layers
				// are at positions 1, 2, 3 etc.; the last layer is at
				// position -1, so it can slide in if the carousel is slid right
				startingPositions[i] = startingPositions[i] + i;
			}

			this.moveLayers( layers, startingPositions );
		}
	},

	_getOffset: function( layer, endPosition ) {
		var positioning = layer.jqmData( widgetname + "-positioning" );
		endPosition = ( typeof endPosition === "number" ? endPosition : 0 );

		var currentPosition = positioning.currentPosition;

		// this is going to be used to set a CSS "left" value
		var left;

		if ( currentPosition === endPosition ) {
			return;
		}

 		// this relies on the positions data added to the layer when
		// initial sizing and positioning was completed (see _configureLayers())
		left = ( layer.width() * endPosition );

		if ( endPosition === 0 ) {
			left += positioning.center;
		}
		else if ( endPosition < 0 ) {
			left -= positioning.center;
		}

		return left;
	},

	// positions go from -m (left) to 0 (centered) to n (right), where
	// m and n are integers representing offsets from the center, where
	// the units are equal to the widths of the layers
	_slideLayer: function( layer, endPosition, callback ) {
		var positioning = layer.jqmData( widgetname + "-positioning" );
		var left = this._getOffset( layer, endPosition );

		// position is different, so we need to do the animation
		var animationOptions = {
			easing: "linear",

			// TODO make this configurable
			duration: "medium",

			complete: function () {
				positioning.currentPosition = endPosition;
				layer.trigger( "animationComplete" );
				if ( callback ) {
					callback( layer );
				}
			}
		};

		layer.stop();
		layer.clearQueue();
		layer.animate( { left: left }, animationOptions );
	},

	_moveLayer: function( layer, position ) {
		var positioning = layer.jqmData( widgetname + "-positioning" );
		var left = this._getOffset( layer, position );
		layer.css( "left", left );
		positioning.currentPosition = position;
	},

	_findLayers: function( layerFinder ) {
		layerFinder = layerFinder || ".ui-" + widgetname + "-block";

		var layers = [];
		var selector;

		if ( typeof layerFinder === "number" ) {
			selector = "> :nth-child(" + layerFinder + ")";
		}
		else if ( typeof layerFinder === "string" ) {
			selector = layerFinder;
		}
		else if ( layerFinder.length > 0 ) {
			selector = "> :nth-child(" + layerFinder.join( "), > :nth-child(" ) + ")";
		}

		if ( selector ) {
			layers = this.element.find( selector );
		}

		return layers;
	},

	// returns the positions of all the layers
	getPositions: function() {
		var layers = this._findLayers();

		var positions = [];
		var layer;
		for ( var i = 0; i < layers.length; i++ ) {
			layer = $( layers[i] );
			positions.push( layer.jqmData( widgetname + "-positioning" ).currentPosition );
		}

		return positions;
	},

	// layerFinder = integer index of the layer to move,
	// array of integer indices, or a selector to find the layer;
	// note that the indices start at 1 for the first child
	//
	// endPosition = left, center, right: the desired final position of
	// the layers, in relation to the page
	slideLayers: function( layerFinder, positions, callback ) {
		if ( typeof positions === "number" ) {
			positions = [ positions ];
		}
		else if ( !positions ) {
			positions = [ 0 ];
		}

		var layers = this._findLayers( layerFinder );
		var position;

		for ( var i = 0; i < layers.length; i++ ) {
			if ( typeof positions[i] !== "undefined" ) {
				position = positions[i];
			}

			this._slideLayer( $( layers[i] ), position, callback );
		}
	},

	// Move a set of layers to a specified array of positions.
	//
	// positions is either a single integer or an array of integers;
	// the layers are mapped onto the positions array to determine
	// their new position, or all assigned the same position; where
	// positions is an array but is shorter than the number of layers
	// returned by layerFinder, the last position in the array is used
	// to specify the position of any layers not assigned a position
	moveLayers: function( layerFinder, positions ) {
		if ( typeof positions === "number" ) {
			positions = [ positions ];
		}
		else if ( !positions ) {
			positions = [ 0 ];
		}

		var layers = this._findLayers( layerFinder );
		var position;

		for ( var i = 0; i < layers.length; i++ ) {
			if ( typeof positions[i] !== "undefined" ) {
				position = positions[i];
			}

			this._moveLayer( $( layers[i] ), position );
		}
	},

	// the slideAll*() methods allow the slidingstack to be treated
	// as an infinite carousel
	slideAll: function( direction ) {
		var self = this;
		var positions = this.getPositions();
		var layers = this._findLayers();

		var largestPosition = positions.length - 1;

		var newPosition;
		var action;

		for ( var i = 0; i < positions.length; i++ ) {
			var layer = $( layers[i] );
			var layerIndex = i + 1;
			newPosition = positions[i] + direction;


			// sliding the visible layer out to the left requires a callback
			// which moves it to the right-hand end when the animation is done
			if ( newPosition < 0 ) {
				newPosition = largestPosition;

				this.slideLayers( layerIndex, -1, function ( layerDone ) {
					self._moveLayer( layerDone, newPosition );
				} );
			}
			else if ( newPosition > largestPosition ) {
				newPosition = 0;

				// move to -1, then slide it into position 0
				this.moveLayers( layerIndex, -1 );
				this.slideLayers( layerIndex, newPosition );
			}
			else {
				this.slideLayers( layerIndex, newPosition );
			}

			if ( newPosition === 0 ) {

			}
			else {

			}
		}
	},

	slideRight: function () {
		this.slideAll( 1 );
	},

	slideLeft: function () {
		this.slideAll( -1 );
	},

	refresh: function( create ) {
		var self = this;
		var o = this.options;
		var layers;
		var layer;
		var layerTheme;

		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( this.element, "c" );
		}

		this.element.addClass( "ui-" + widgetname );

		// set z-indexes for child elements dependent on their
		// child position
		layers = this.element.children();

		for ( var i = 0; i < layers.length; i++ ) {
			layer = $( layers[i] );

			layerTheme = layer.jqmData( "theme" ) || o.theme;
			layer.addClass( "ui-body-" + layerTheme );

			layer.addClass( "ui-" + widgetname + "-block" );
		}

		// resize the height of the slidingstack layers after the page is drawn
		if ( create ) {
			if ( this.element.closest( ".ui-page" ).is( ":visible" ) ) {
				this._configureLayers();
			}
			else {
				this.element.closest( ".ui-page" ).bind( "pageshow", function() {
					self._configureLayers();
				} );
			}
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
