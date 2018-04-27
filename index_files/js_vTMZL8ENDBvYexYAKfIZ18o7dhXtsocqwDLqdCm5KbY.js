(function ($) {

 /**
   * UI Improvements for the Content Editing Form
   */
 Drupal.behaviors.panopolyAdmin = {
   attach: function (context, settings) {
     var width = $('#node-edit #edit-title').width() - $('#node-edit .form-item-path-alias label').width() - $('#node-edit .form-item-path-alias .field-prefix').width() - 10;
     $('#node-edit .form-item-path-alias input').css('width', width);

     if ($('#node-edit .form-item-body-und-0-value label').html() == 'Body <span class="form-required" title="This field is required.">*</span>') {
       $('#node-edit .form-item-body-und-0-value label').html('');
       $('#node-edit .form-item-body-und-0-value label').css('text-align', 'right');
     }

     if ($('#node-edit .form-item-field-featured-image-und-0-alt label')) {
       $('#node-edit .form-item-field-featured-image-und-0-alt label').html('Alt Text');
     }
   }
 }

 /**
   * Automatically Upload Files/Images Attached
   */
 Drupal.behaviors.panopolyAutoUpload = {
    attach: function (context, settings) {
      $('#node-edit input#edit-field-featured-image-und-0-upload').next('input[type="submit"]').hide();
      $('form', context).delegate('#node-edit input#edit-field-featured-image-und-0-upload', 'change', function() {  
        $(this).next('input[type="submit"]').mousedown();
      }); 
    }
  };

  /**
   * Automatically fill in a menu link title, if possible.
   *
   * NOTE: This behavior is a copy and paste from the Core Menu module's menu.js
   * script. It has been adapted to update proper targeting. This brings back
   * the core functionality.
   */
  Drupal.behaviors.panopolyLinkAutomaticTitle = {
    attach: function (context) {
      $('.pane-node-form-menu', context).each(function () {
        // Try to find menu settings widget elements as well as a 'title' field in
        // the form, but play nicely with user permissions and form alterations.
        var $checkbox = $('.form-item-menu-enabled input', this);
        var $link_title = $('.form-item-menu-link-title input', context);
        var $title = $(this).closest('form').find('.form-item-title input');
        // Bail out if we do not have all required fields.
        if (!($checkbox.length && $link_title.length && $title.length)) {
          return;
        }
        // If there is a link title already, mark it as overridden. The user expects
        // that toggling the checkbox twice will take over the node's title.
        if ($checkbox.is(':checked') && $link_title.val().length) {
          $link_title.data('menuLinkAutomaticTitleOveridden', true);
        }
        // Whenever the value is changed manually, disable this behavior.
        $link_title.keyup(function () {
          $link_title.data('menuLinkAutomaticTitleOveridden', true);
        });
        // Global trigger on checkbox (do not fill-in a value when disabled).
        $checkbox.change(function () {
          if ($checkbox.is(':checked')) {
            if (!$link_title.data('menuLinkAutomaticTitleOveridden')) {
              $link_title.val($title.val());
            }
          }
          else {
            $link_title.val('');
            $link_title.removeData('menuLinkAutomaticTitleOveridden');
          }
          $checkbox.closest('fieldset.vertical-tabs-pane').trigger('summaryUpdated');
          $checkbox.trigger('formUpdated');
        });
        // Take over any title change.
        $title.keyup(function () {
          if (!$link_title.data('menuLinkAutomaticTitleOveridden') && $checkbox.is(':checked')) {
            $link_title.val($title.val());
            $link_title.val($title.val()).trigger('formUpdated');
          }
        });
      });
    }
  };

})(jQuery);
;
(function ($) {

 Drupal.behaviors.panopolyMagic = {
   attach: function (context, settings) {

     /**
      * Title Hax for Panopoly
      *
      * Replaces the markup of a node title pane with
      * the h1.title page element
      */
     if ($.trim($('.pane-node-title .pane-content').html()) == $.trim($('h1.title').html())) {
       $('.pane-node-title .pane-content').html('');
       $('h1.title').hide().clone().prependTo('.pane-node-title .pane-content');
       $('.pane-node-title h1.title').show();
     }

   }
 }

})(jQuery);

(function ($) {

  /**
   * Improves the Auto Submit Experience for CTools Modals
   */
  Drupal.behaviors.panopolyMagicAutosubmit = {
    attach: function (context, settings) {
      // Replaces click with mousedown for submit so both normal and ajax work.
      $('.ctools-auto-submit-click', context)
      // Exclude the 'Style' type form because then you have to press the
      // "Next" button multiple times.
      // @todo: Should we include the places this works rather than excluding?
      .filter(function () { return $(this).closest('form').attr('id').indexOf('panels-edit-style-type-form') !== 0; })
      .click(function(event) {
        if ($(this).hasClass('ajax-processed')) {
          event.stopImmediatePropagation();
          $(this).trigger('mousedown');
          return false;
        }
      });

      // 'this' references the form element
      function triggerSubmit (e) {
        var $this = $(this), preview_widget = $('.widget-preview', context);
        if (!preview_widget.hasClass('panopoly-magic-loading')) {
          preview_widget.addClass('panopoly-magic-loading');
          $this.find('.ctools-auto-submit-click').click();
        }
      }

      // e.keyCode: key
      var discardKeyCode = [
        16, // shift
        17, // ctrl
        18, // alt
        20, // caps lock
        33, // page up
        34, // page down
        35, // end
        36, // home
        37, // left arrow
        38, // up arrow
        39, // right arrow
        40, // down arrow
         9, // tab
        13, // enter
        27  // esc
      ];

      // Special handling for link field widgets. This ensures content which is ahah'd in still properly autosubmits.
      $('.field-widget-link-field input:text', context).addClass('panopoly-textfield-autosubmit').addClass('ctools-auto-submit-exclude');

      // Handle text fields and textareas.
      var timer;
      $('.panopoly-textfield-autosubmit, .panopoly-textarea-autosubmit', context)
      .once('ctools-auto-submit')
      .bind('keyup blur', function (e) {
        var $element;
        $element = $('.widget-preview .pane-title', context);

        clearTimeout(timer);

        // Filter out discarded keys.
        if (e.type !== 'blur' && $.inArray(e.keyCode, discardKeyCode) > 0) {
          return;
        }

        // Special handling for title elements.
        if ($element.length && $(e.target).parent('.form-item-title,.form-item-widget-title').length) {

          // If all text was removed, remove the existing title markup from the dom.
          if (!$(e.target).val().length) {
            $('.widget-preview .pane-title', context).remove();
          }
          // Insert as link title text if the title is a link.
          else if ($('a', $element).length) {
            $('a', $element).html($(e.target).val());
          }
          // Otherwise just insert the form value as-is.
          else {
            $element.html($(e.target).val());
          }
        } 
        // Automatically submit the field on blur. This won't happen if title markup is already present.
        else if (e.type == 'blur') {
          triggerSubmit.call(e.target.form)
        }
        // If all else fails, just trigger a timer to submit the form a second after the last activity.
        else {
          timer = setTimeout(function () { triggerSubmit.call(e.target.form); }, 1000);
        }
      });
  
      // Handle autocomplete fields.
      $('.panopoly-autocomplete-autosubmit', context)
      .once('ctools-auto-submit')
      .bind('keyup blur', function (e) {
        // Detect when a value is selected via TAB or ENTER.
        if (e.type === 'blur' || e.keyCode === 13) {
          // We defer the submit call so that it happens after autocomplete has
          // had a chance to fill the input with the selected value.
          setTimeout(function () {
            triggerSubmit.call(e.target.form);
          }, 0);
        }
      });

      // Prevent ctools auto-submit from firing when changing text formats.
      $(':input.filter-list').addClass('ctools-auto-submit-exclude');

    }
  }
})(jQuery);
;
(function ($) {

 Drupal.behaviors.PanelsAccordionStyle = {
   attach: function (context, settings) {
     for ( region_id in Drupal.settings.accordion ) {
    		var accordion = Drupal.settings.accordion[region_id] ;
		    jQuery('#'+region_id).accordion(accordion.options);
  	 }
   }
  }

})(jQuery);
;
/**
 * @file
 * JavaScript integrations between the Caption Filter module and particular
 * WYSIWYG editors. This file also implements Insert module hooks to respond
 * to the insertion of content into a WYSIWYG or textarea.
 */
(function ($) {

$(document).bind('insertIntoActiveEditor', function(event, options) {
  if (options['fields']['title'] && Drupal.settings.captionFilter.widgets[options['widgetType']]) {
    options['content'] = '[caption caption="' + options['fields']['title'].replace(/"/g, '\\"') + '"]' + options['content'] + '[/caption]';
  }
});

Drupal.captionFilter = Drupal.captionFilter || {};

Drupal.captionFilter.toHTML = function(co, editor) {
  return co.replace(/(?:<p>)?\[caption([^\]]*)\]([\s\S]+?)\[\/caption\](?:<\/p>)?[\s\u00a0]*/g, function(a,b,c){
    var id, cls, w, tempClass;

    b = b.replace(/\\'|\\&#39;|\\&#039;/g, '&#39;').replace(/\\"|\\&quot;/g, '&quot;');
    c = c.replace(/\\&#39;|\\&#039;/g, '&#39;').replace(/\\&quot;/g, '&quot;');
    id = b.match(/id=['"]([^'"]+)/i);
    cls = b.match(/align=['"]([^'"]+)/i);
    ct = b.match(/caption=['"]([^'"]+)/i);
    w = c.match(/width=['"]([0-9]+)/);

    id = ( id && id[1] ) ? id[1] : '';
    cls = ( cls && cls[1] ) ? 'caption-' + cls[1] : '';
    ct = ( ct && ct[1] ) ? ct[1].replace(/\\\\"/,'"') : '';
    w = ( w && w[1] ) ? parseInt(w[1])+'px' : 'auto';

    if (editor == 'tinymce')
      tempClass = (cls == 'caption-center') ? 'mceTemp mceIEcenter' : 'mceTemp';
    else if (editor == 'ckeditor')
      tempClass = (cls == 'caption-center') ? 'mceTemp mceIEcenter' : 'mceTemp';
    else
      tempClass = '';

    if (ct) {
      return '<div class="caption ' + cls + ' ' + tempClass + ' draggable"><div class="caption-width-container" style="width: ' + w + '"><div class="caption-inner">' + c + '<p class="caption-text">' + ct + '</p></div></div></div>';
    }
    else {
      return '<div class="caption ' + cls + ' ' + tempClass + ' draggable"><div class="caption-width-container" style="width: ' + w + '"><div class="caption-inner">' + c + '</div></div></div>';
    }
  });
};

Drupal.captionFilter.toTag = function(co) {
  return co.replace(/(<div class="caption [^"]*">)\s*<div[^>]+>\s*<div[^>]+>(.+?)<\/div>\s*<\/div>\s*<\/div>\s*/gi, function(match, captionWrapper, contents) {
    var align;
    align = captionWrapper.match(/class=.*?caption-(left|center|right)/i);
    align = (align && align[1]) ? align[1] : '';
    caption = contents.match(/\<p class=\"caption-text\"\>(.*)\<\/p\>/);
    caption_html = (caption && caption[0]) ? caption[0] : '';
    caption = (caption && caption[1]) ? caption[1].replace(/"/g, '\\"') : '';
    contents = contents.replace(caption_html, '');

    return '[caption' + (caption ? (' caption="' + caption + '"') : '') + (align ? (' align="' + align + '"') : '') + ']' + contents + '[/caption]';
  });
};

})(jQuery);
;
