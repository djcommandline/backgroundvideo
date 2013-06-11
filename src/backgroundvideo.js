// Smart Resize
(function($,sr){
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
    var timeout;
    return function debounced () {
      var obj = this, args = arguments;
      function delayed () {
        if (!execAsap) func.apply(obj, args);
        timeout = null;
      }
      if (timeout)        clearTimeout(timeout);
      else if (execAsap)  func.apply(obj, args);
      timeout = setTimeout(delayed, threshold || 50);
    };
  };
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
})(jQuery,'smartresize');



/**
 * BackVids
 *
 * @author    : BaoQuoc Doan
 * @date      : Jun 10, 2013 
 * @url       : http://mantone.github.com/backvideos
 * @liscence  :
 *
 * @basedOn   : 
 *
 */
;(function($) {

$.fn.backVids = function(options) {
  var $containers = this;
  // abort if container is unavailiable
  if (!$containers.length)
    return;

  var useImageFallback = false;

  // check if browser supports video
  if($.fn.backVids.supportsVideo()) {
    useImageFallback = false;
  } else {
    useImageFallback = true;
  }

  // grab the user settings
  var settings = {};
  settings = $.extend({}, $.fn.backVids.defaults, options );

  // plugin magic happens here 
  return $containers.each(function() {

    var $ele         = $(this), // this is the targeted element
        targetWidth   = $ele.width,
        targetHeight  = $ele.height,
        $wrap         = $.fn.backVids.buildVidWrapper(),
        $video        = $.fn.backVids.buildVideoEle(),
        ogWidth       = 0,
        ogHeight      = 0,
        newHeight     = 0,
        newWidth      = 0


    // check if we need to use the image fallback;
    if( settings.useImageFallback === true) {

      $.fn.backVids.applyImageFallback($ele);

    } else {

      // set container to be at least relative
      if ($ele.css('position') == 'static' || !container.css('position'))
        $ele.css('position','relative');      

      // set default positioning;
      $ele.css({
        'padding' : '0px',
        'overflow' : 'hidden'
      });

      // construct the video element
      $v = $.fn.backVids.buildVideoEle(settings);
      $video = $.fn.backVids.checkVideoType($ele, $v);

      // attach it to the wrapper
      $wrap.html($video);

      // use target to create overlay div from existing content
      $ele.wrapInner('<div class="overlay" />');
      $('.overlay').css({'position' : 'relative'});

      // prepend to target
      $ele.prepend($wrap);
    

      // make sure the video is ready before we do the magic
      $video.bind("loadedmetadata", function () {

          // grab original size of video
          ogWidth   = this.videoWidth;
          ogHeight  = this.videoHeight;

          // Check if we are attaching to the body...
          if ( $ele.is("body") ) {
            newWidth  = $(window).width();
            newHeight = $(window).height();
          } else {
            newWidth  = $ele.width();
            newHeight = $ele.height();
          }

          $newCSS = $.fn.backVids.getResizeDimensions( ogWidth, ogHeight, newWidth, newHeight );
          $video.css($newCSS);


          // play      
          $video[0].play();

          // reposition on element dimention changes
          $(window).smartresize(function(){

            if ( $ele.is("body") ) {
              newWidth  = $(window).width();
              newHeight = $(window).height();
            } else {
              newWidth  = $ele.width();
              newHeight = $ele.height();
            }

            $newCSS = $.fn.backVids.getResizeDimensions( ogWidth, ogHeight, newWidth, newHeight );
            $video.css($newCSS);

            console.log('w' + newWidth);
            console.log('h' + newHeight);

            console.log('resizing');
          });
      });
          
      // set replay
      if(settings.replayloop ) {
        remainingLoops = settings.replayloop;

        $video.bind('ended', function(){

        if (remainingLoops)
          $video[0].replay();

        if (remainingLoops !== true)
          remainingLoops--;

        });

      }

    }

  });


};

// our default settings
$.fn.backVids.defaults = {
  setResponsive    : false,
  setParrallax     : false,
  parrallaxRate    : '1.2',
  useImageFallback : false,
  wrapClass        : 'backvid',
  frontWrapClass   : 'overlay',
  mp4              : '',
  ogv              : '',
  webm             : '',
  poster           : '',
  autoplay         : true,
  replayloop       : true,
  scale            : false,
  position         : "relative",
  opacity          : 1,
  zIndex           : 0,
  width            : 0,
  height           : 0
};



$.fn.backVids.getResizeDimensions = function( ogWidth, ogHeight, cWidth, cHeight ) {

  // grab the ratios for the video and the container
  var $vh2wratio = ogHeight / ogWidth;
  var $ch2wratio = cHeight / cWidth;
  var adjWidth, adjHeight, property, diff, newDimensions;

  // when container wider then the video, base everything off of width
  if( $ch2wratio < $vh2wratio ) {
    adjWidth = cWidth;
    adjHeight = Math.ceil($vh2wratio * cWidth);
    diff = -(adjHeight - cHeight) / 2;
    newDimensions = {
      'width'  : adjWidth + 'px',
      'height' : adjHeight + 'px',
      'top' : diff + 'px',
      'left' : '0px'
    };

  } 
  else // base it off the container height             
  {          
    adjWidth = cHeight / $vh2wratio;
    adjHeight = cHeight;
    diff = -(adjWidth - cWidth) / 2;
    newDimensions = {
      'width'  : adjWidth + 'px',
      'height' : adjHeight + 'px',
      'left'   : diff + 'px',
      'top'    : '0px'
    };

  }


  return newDimensions;
}

// get the overlay wrapper
$.fn.backVids.buildVidWrapper = function(settings) {
  var $wrap = $('<div/>');
  $wrap.addClass($.fn.backVids.defaults.wrapClass)
  .css({
    'position' : 'relative',
    'top' : '0',
    'left' : '0',
  });
  return $wrap;
};

// creates the video elements
$.fn.backVids.buildVideoEle = function(options) {

  // video element
  var $video = $('<video/>');
  $video.css('position','absolute')
  .css('top',0)
  .css('left',0)
  .css('min-width','100%')
  .css('width', '100%');

  return $video;

};

// check for video type
$.fn.backVids.checkVideoType = function( srcEle, vidEle) {

  $webm = srcEle.data('webm');
  $mp4 = srcEle.data('mp4');
  $ogv = srcEle.data('ogv');

    // check for support and set video src
    if ($.fn.backVids.supportType('mp4')){
      console.log('mp4');
      return vidEle.attr('src',$mp4);
    }
    else if ($.fn.backVids.supportType('webm')) {     
      console.log('webm');
      return vidEle.attr('src',$webm);       
    }
    else {          
      console.log('ogv');
      return vidEle.attr('src',$ogv);
    }

    return false;
  };

// check which type video is supported
$.fn.backVids.supportType = function(str) {
  
  // abort if video is not supported
  if (!$.fn.backVids.supportsVideo())
    return false;
  
  // create video element to test against
  var v = document.createElement('video');
  
  // check which?
  switch (str) {
    case 'webm' :
      return (v.canPlayType('video/webm; codecs="vp8, vorbis"'));
      break;
    case 'mp4' :
      return (v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
      break;
    case 'ogv' :
      return (v.canPlayType('video/ogg; codecs="theora, vorbis"'));
      break;      
  }
  // nope
  return false; 
};

// check if video is supported at all
$.fn.backVids.supportsVideo = function() {
  return (document.createElement('video').canPlayType);
};

// centerpoint of targed div
$.fn.backVids.findCenterPoint = function( width, height ) {
  var centerX = width / 2;
  var centerY = width / 2;
  var ptObj = { 'x' : centerX, 'y' : centerY };

  return ptObj;
};


// animate video wrapper div to create parrallax effect
$.fn.backVids.animateParrallax = function () {
};

// play;
$.fn.backVids.play = function () {
};

// pause;
$.fn.backVids.pause = function () {
};

// check to see if we need use the ImageFallBack;
// @todo - create slideshow support
$.fn.backVids.applyImageFallback = function (ele) {

  var css3coverSupport = true; 

  if(css3coverSupport === false)
    return false;

  var fallbackSrc = ele.data('fallback-src');
  ele.css({
    'background' : 'url('+fallbackSrc+') no-repeat center center',
    '-webkit-background-size' : 'cover',
    '-moz-background-size' : 'cover',
    '-o-background-size' : 'cover',
    'background-size' : 'cover'

  });

  return false;
};

}(jQuery));