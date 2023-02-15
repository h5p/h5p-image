var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {Object} params Options for this library.
 * @param {Number} id Content identifier
 * @returns {undefined}
 */
(function ($) {
  H5P.Image = function (params, id, extras) {
    H5P.EventDispatcher.call(this);
    this.extras = extras;
    this.params = params;
    this.params.startImageAnimation = 'Start image animation';
    this.params.stopImageAnimation = 'Stop image animation';

    if (params.file === undefined || !(params.file instanceof Object)) {
      this.placeholder = true;
    }
    else {
      this.source = H5P.getPath(params.file.path, id);
      this.width = params.file.width;
      this.height = params.file.height;
      this.mime = params.file.mime || '';
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
    self.$wrapper = $wrapper;

    if (self.$img === undefined) {
      if(self.placeholder) {
        self.$img = $('<div>', {
          width: '100%',
          height: '100%',
          class: 'h5p-placeholder',
          title: this.title === undefined ? '' : this.title,
          on: {
            load: function () {
              self.trigger('loaded');
            }
          }
        });
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

    /*
     * Only handle if image is gif, animation is essential and user requested
     * reduced motion
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
     */
    if (
      this.mime === 'image/gif' &&
      !this.params.isAnimationEssential &&
      window.matchMedia('(prefers-reduced-motion: reduce)')?.matches
    ) {
      self.on('loaded', function () {
        const image = self.$img.get(0);

        // Promise resolving with true if src is animated gif
        self.isGIFAnimated(image.src).then(function (isAnimated) {
          if (!isAnimated) {
            return; // GIF is not animated
          }

          self.staticImage = self.buildStaticReplacement(image);

          // Add button to toggle gif animation on/off
          self.playButton = document.createElement('button');
          self.playButton.classList.add('h5p-image-button-play');
          self.playButton.setAttribute('type', 'button');
          self.playButton.addEventListener('click', function () {
            self.swapImage();
          });
          $wrapper.get(0).append(self.playButton);

          self.showsStaticImage = true;
          self.swapImage();
        }, function () {
          return; // Error
        });
      });
    }
  };

  /**
   * Swap image. Used to switch between animated image and static image.
   */
  H5P.Image.prototype.swapImage = function() {
    this.showsStaticImage = !this.showsStaticImage;

    this.playButton.classList.toggle('pause', this.showsStaticImage);
    if (this.showsStaticImage) {
      this.$wrapper.get(0).replaceChild(this.$img.get(0), this.staticImage);
      this.playButton.setAttribute(
        'aria-label', this.params.stopImageAnimation
      );
    }
    else {
      this.$wrapper.get(0).replaceChild(this.staticImage, this.$img.get(0));
      this.playButton.setAttribute(
        'aria-label', this.params.startImageAnimation
      );
    }

    this.trigger('resize');
  };

  /**
   * Build static replacement of image.
   *
   * @param {HTMLImageElement} image Image to get static replacement for.
   * @returns {HTMLImageElement|HTMLCanvasElement} Static replacement.
   */
  H5P.Image.prototype.buildStaticReplacement = function (image) {
    if (!image) {
      return;
    }

    // Image size is likely float, but canvas size cannot.
    const style = window.getComputedStyle(image);
    const imageSize = {
      height: Math.round(parseFloat(style.getPropertyValue('height'))),
      width: Math.round(parseFloat(style.getPropertyValue('width')))
    }

    // Copy image to canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;
    canvas
      .getContext('2d')
      .drawImage(image, 0, 0, imageSize.width, imageSize.height);

    // Try to retrieve encoded image URL
    let newSrc;
    let replacement;
    try {
      newSrc = canvas.toDataURL('image/gif');
      replacement = document.createElement('img');
    }
    catch (error) {
      // Fallback. e.g. cross-origin issues
      replacement = canvas;
    }

    /*
     * toDataURL requires images on iOS to have a maximum size of 3 megapixels
     * for devices with less than 256 MB RAM and 5 megapixels for devices with
     * greater or equal than 256 MB RAM.
     * https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/CreatingContentforSafarioniPhone/CreatingContentforSafarioniPhone.html#//apple_ref/doc/uid/TP40006482-SW15
     */
    if (newSrc.length < 7) {
      replacement = canvas;
    }

    // Copy attributes of old source
    for (let i = 0; i < image.attributes.length; i++) {
      const attribute = image.attributes[i];
      replacement.setAttribute(attribute.name, attribute.value);
    }

    if (newSrc) {
      replacement.src = newSrc;
    }
    else {
      // Common practice to make canvas behave like image to screen readers
      replacement.setAttribute('role', 'img');
      if (image.getAttribute('alt')) {
        replacement.setAttribute('aria-label', image.getAttribute('alt'));
      }
    }

    return replacement;
  };

  /**
   * Determine whether a GIF file is animated.
   *
   * @param {string} url URL of GIF to be checked.
   * @returns {Promise} Promise resolving with boolean, rejecting with xhr object extract.
   */
  H5P.Image.prototype.isGIFAnimated = function (url) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';

      // Reject Promise if file could not be loaded
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status !== 200) {
          reject({ status: xhr.status, statusText: xhr.statusText });
        }
      }

      /*
       * Determine GIF delay time as indicator for animation
       * @see https://gist.github.com/zakirt/faa4a58cec5a7505b10e3686a226f285
       */
      xhr.onload = function() {
        const buffer = xhr.response;

        // Offset bytes for the header section
        const HEADER_LEN = 6;

        // Offset bytes for logical screen description section
        const LOGICAL_SCREEN_DESC_LEN = 7;

        // Start from last 4 bytes of Logical Screen Descriptor
        const dv = new DataView(buffer, HEADER_LEN + LOGICAL_SCREEN_DESC_LEN - 3);
        const globalColorTable = dv.getUint8(0); // aka packet byte
        let globalColorTableSize = 0;
        let offset = 0;

        // Check first bit, if 0, then we don't have Global Color Table
        if (globalColorTable & 0x80) {
          /*
           * Grab last 3 bits to compute global color table
           * size -> RGB * 2^(N+1). N is value in last 3 bits.
           */
          globalColorTableSize = 3 * Math.pow(2, (globalColorTable & 0x7) + 1);
        }

        // Move on to Graphics Control Extension
        offset = 3 + globalColorTableSize;

        const extensionIntroducer = dv.getUint8(offset);
        const graphicsConrolLabel = dv.getUint8(offset + 1);
        let delayTime = 0;

        // Graphics Control Extension section is where GIF animation data is
        // First 2 bytes must be 0x21 and 0xF9
        if (extensionIntroducer & 0x21 && graphicsConrolLabel & 0xf9) {
          // Skip to 2 bytes with delay time
          delayTime = dv.getUint16(offset + 4);
        }

        resolve(Boolean(delayTime));
      };

      xhr.send();
    });
  }

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
