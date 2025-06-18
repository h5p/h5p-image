var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {Object} params Options for this library.
 * @param {Number} id Content identifier
 * @returns {undefined}
 */
(function ($) {
  const placeholderImg = `
    <svg class="h5p-image-placeholder-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 903 459" preserveAspectRatio="xMidYMid slice">
      <defs>
        <style>
          .cls-1 {fill: var(--h5p-theme-alternative-darker);}
          .cls-2 {fill: var(--h5p-theme-alternative-dark);}
          .cls-3 {fill: var(--h5p-theme-alternative-base);}
        </style>
      </defs>
      <g>
        <g id="Layer_1">
          <rect class="cls-3" x="1" y="0" width="903.1" height="459.1"/>
          <polygon class="cls-2" points="527.5 459.5 527.5 334.1 364.8 234 48.1 459.5 527.5 459.5"/>
          <polygon class="cls-2" points="904.2 246 732.2 142.6 287.1 459.8 904.2 459.8 904.2 246"/>
          <polygon class="cls-2" points="394.7 459.5 106.3 254 .1 332.4 .1 459.5 394.7 459.5"/>
          <polygon class="cls-1" points="-.3 366.9 133.8 274.2 105.1 255.7 -.3 332.9 -.3 366.9"/>
          <polygon class="cls-1" points="370.5 459.2 771.6 168.7 732.2 142.6 292 459.2 370.5 459.2"/>
          <polygon class="cls-1" points="102.8 459.5 392.8 252.6 365.3 233.5 43.6 459.5 102.8 459.5"/>
          <path class="cls-1" d="M43.3.4c30.1,78,105.7,133.3,194.3,133.3S401.8,78.3,431.8.4H43.3Z"/>
          <path class="cls-2" d="M267.4.4L126.7,101.6c32.1,20.3,70.1,32,110.9,32,88.6,0,164.2-55.3,194.3-133.3h-164.5Z"/>
        </g>
      </g>
    </svg>
  `;

  H5P.Image = function (params, id, extras) {
    H5P.EventDispatcher.call(this);
    this.extras = extras;

    if (params.file === undefined || !(params.file instanceof Object)) {
      this.placeholder = true;
    }
    else {
      this.source = H5P.getPath(params.file.path, id);
      this.width = params.file.width;
      this.height = params.file.height;
    }

    this.alt = (!params.decorative && params.alt !== undefined) ?
      this.stripHTML(this.htmlDecode(params.alt)) :
      '';

    if (params.title !== undefined) {
      this.title = this.stripHTML(this.htmlDecode(params.title));
    }
  };

  H5P.Image.prototype = Object.create(H5P.EventDispatcher.prototype);
  H5P.Image.prototype.constructor = H5P.Image;

  /**
   * Wipe out the content of the wrapper and put our HTML in it.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  H5P.Image.prototype.attach = function ($wrapper) {
    var self = this;
    var source = this.source;

    if (self.$img === undefined) {
      if(self.placeholder) {
        self.$img = $(H5P.Components.PlaceholderImg(placeholderImg));
        self.trigger('loaded');
      } else {
        self.$img = $('<img>', {
          width: '100%',
          height: '100%',
          src: source,
          alt: this.alt,
          title: this.title === undefined ? '' : this.title,
          on: {
            load: function () {
              self.trigger('loaded');
            }
          }
        });
      }
    }

    $wrapper.addClass('h5p-image').html(self.$img);
  };

  /**
   * Retrieve decoded HTML encoded string.
   *
   * @param {string} input HTML encoded string.
   * @returns {string} Decoded string.
   */
  H5P.Image.prototype.htmlDecode = function (input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  };

  /**
   * Retrieve string without HTML tags.
   *
   * @param {string} input Input string.
   * @returns {string} Output string.
   */
  H5P.Image.prototype.stripHTML = function (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return H5P.Image;
}(H5P.jQuery));
