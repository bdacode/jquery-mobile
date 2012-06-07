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
		initSelector: ":jqmData(role='" + widgetname + "')"
	},

	_create: function() {
		this.refresh( true );
	},

	_animateLayer: function( layer, left ) {
		var animationOptions = {
			easing: 'linear',
			duration: 'medium',
			queue: true,
			complete: function () {
				layer.trigger( 'animationComplete' );
			}
		};

		layer.stop();
		layer.clearQueue();
		layer.animate( { left: left }, animationOptions );
	},

	// set initial size of layers and enclosing element,
	// and store positioning data for each layer
	_configureLayers: function() {
		var minHeight = 0;
		var layers = this.element.children();
		var layer;
		var layerWidth;

		for ( var i = 0; i < layers.length; i++ ) {
			layer = $( layers[i] );

			// find the tallest child
			minHeight = Math.max( minHeight, layer.outerHeight() );

			// store the initial offsets of the child, so when
			// transitioning the layer, we can reposition it correctly
			layerWidth = layer.width();

			layer.data( "positions", {
				"center": layer.position()[ "left" ],
				"left": -layerWidth,
				"right": layerWidth
			} );
		}

		// set the enclosing element and all the children to the
		// height of the tallest child
		this.element.height( minHeight );
		layers.height( minHeight );
	},

	// position = left, center, right: the desired final position of
	// the layer, in relation to the screen
	slideLayer: function( indexOrSelector, endPosition ) {
		endPosition = endPosition || "center";

		var layer;
		var endLeft;

		if ( typeof indexOrSelector === "number" ) {
			layer = this.element.children()[ indexOrSelector ];
		}
		else {
			layer = this.element.find( indexOrSelector );
		}

		// this relies on the "positions" data added to the layer when
		// initial sizing and positioning was completed (see _configureLayers())
		endLeft = $( layer ).data( "positions" )[ endPosition ];

		this._animateLayer( $( layer ), endLeft );
	},

	refresh: function( create ) {
		var self = this;
		var o = this.options;
		var layers;
		var layer;
		var layerTheme;

		// z-index of the first child; the subsequent children
		// are placed on layers underneath the first, with the last
		// child being lowest down
		var z = 1000;

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

			layer.css( "z-index", z );
			z = z - 1;
		}

		// resize the height of the slidingstack after the page is drawn
		if ( this.element.closest( ".ui-page" ).is( ":visible" ) ) {
			this._configureLayers();
		}
		else {
			this.element.closest( ".ui-page" ).bind( "pageshow", function() {
				self._configureLayers();
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
