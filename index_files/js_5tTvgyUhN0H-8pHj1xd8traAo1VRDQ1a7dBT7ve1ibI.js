Drupal.settings.spotlight_settings = Drupal.settings.spotlight_settings || {};

(function ($) {

 /**
  * Get the total displacement of given region.
  *
  * @param region
  *   Region name. Either "top" or "bottom".
  *
  * @return
  *   The total displacement of given region in pixels.
  */
  if (Drupal.overlay) {
    Drupal.overlay.getDisplacement = function (region) {
      var displacement = 0;
      var lastDisplaced = $('.overlay-displace-' + region + ':last');
      if (lastDisplaced.length) {
        displacement = lastDisplaced.offset().top + lastDisplaced.outerHeight();

        // In modern browsers (including IE9), when box-shadow is defined, use the
        // normal height.
        var cssBoxShadowValue = lastDisplaced.css('box-shadow');
        var boxShadow = (typeof cssBoxShadowValue !== 'undefined' && cssBoxShadowValue !== 'none');
        // In IE8 and below, we use the shadow filter to apply box-shadow styles to
        // the toolbar. It adds some extra height that we need to remove.
        if (!boxShadow && /DXImageTransform\.Microsoft\.Shadow/.test(lastDisplaced.css('filter'))) {
          displacement -= lastDisplaced[0].filters.item('DXImageTransform.Microsoft.Shadow').strength;
          displacement = Math.max(0, displacement);
        }
      }
      return displacement;
    };
  };

 /**
  * Form behavior for Spotlight
  */
 Drupal.behaviors.panopolySpotlight = {
   attach: function (context, settings) {
     if ($('.field-name-field-basic-spotlight-items').length) {
       $('.field-name-field-basic-spotlight-items').each(function() {
         var rotation_time = $(this).find('.panopoly-spotlight-buttons-wrapper').data('rotation-time');
         var $slides = $(this);
         $slides.tabs().tabs("rotate", rotation_time, true);
         // $('.field-name-field-basic-spotlight-items').css('height', $('.field-name-field-basic-spotlight-items').height());
         // $('.field-name-field-basic-spotlight-items').css('overflow', 'hidden');

         // Navigation is hidden by default, display it if JavaScript is enabled.
         $slides.find('.panopoly-spotlight-buttons-wrapper').css('display', 'block');

         $slides.find('.panopoly-spotlight-pause-play').bind('click', function(event) {
           event.preventDefault();
           if ($(this).hasClass('paused')) {
             $slides.tabs().tabs("rotate", rotation_time, true);
             $(this).text(Drupal.t('Pause'));
             $(this).removeClass('paused');
           }
           else {
             $slides.tabs().tabs("rotate", 0, false);
             $slides.find('.ui-tabs-nav li a').attr('tabindex', 0);
             $(this).text(Drupal.t('Play'));
             $(this).addClass('paused');
           }
         });
       });
     }
   }
 }

 /**
  * Create responsive magic for Table Widget
  */
 Drupal.behaviors.panopolyWidgetTables = {
   attach: function (context, settings) {

     $('table.tablefield', context).each(function() {
       var table = $(this); // cache table object.
       var head = table.find('thead th');
       var rows = table.find('tbody tr').clone(); // appending afterwards does not break original table.

       // create new table
       var newtable = $(
         '<table class="mobile-table">' +
         '  <tbody>' +
         '  </tbody>' +
         '</table>'
       );

       // cache tbody where we'll be adding data.
       var newtable_tbody = newtable.find('tbody');

       rows.each(function(i) {
         var cols = $(this).find('td');
         var classname = i % 2 ? 'even' : 'odd';
         cols.each(function(k) {
           var new_tr = $('<tr class="' + classname + '"></tr>').appendTo(newtable_tbody);
           new_tr.append(head.clone().get(k));
           new_tr.append($(this));
         });
       });

       $(this).after(newtable);
     });

   }
 }
})(jQuery);
;
;(function($){
	$.extend( $.ui.tabs.prototype, {
		rotation: null,
		rotationDelay: null,
		continuing: null,
		rotate: function( ms, continuing ) {
			var self = this,
				o = this.options;

			if((ms > 1 || self.rotationDelay === null) && ms !== undefined){//only set rotationDelay if this is the first time through or if not immediately moving on from an unpause
				self.rotationDelay = ms;
			}

			if(continuing !== undefined){
				self.continuing = continuing;
			}

			var rotate = self._rotate || ( self._rotate = function( e ) {
				clearTimeout( self.rotation );
				self.rotation = setTimeout(function() {
					var t = o.active;
					self.option( "active",  ++t < self.anchors.length ? t : 0 );
				}, ms );

				if ( e ) {
					e.stopPropagation();
				}
			});

			var stop = self._unrotate || ( self._unrotate = !continuing
				? function(e) {
					if (e.clientX) { // in case of a true click
						self.rotate(null);
					}
				}
				: function( e ) {
					t = o.active;
					rotate();
				});

			// start rotation
			if ( ms ) {
				this.element.bind( "tabsactivate", rotate );
				this.anchors.bind( o.event + ".tabs", self.pause );
				rotate();
			// stop rotation
			} else {
				clearTimeout( self.rotation );
				this.element.unbind( "tabsactivate", rotate );
				this.anchors.unbind( o.event + ".tabs", self.pause );
				delete this._rotate;
				delete this._unrotate;
			}

			//rotate immediately and then have normal rotation delay
			if(ms === 1){
				//set ms back to what it was originally set to
				ms = self.rotationDelay;
			}

			return this;
		},
		pause: function() {
			var self = this,
				o = this.options;

			self.rotate(0);
		},
		unpause: function(){
			var self = this,
				o = this.options;

			self.rotate(1, self.continuing);
		}
	});
})(jQuery);
;
