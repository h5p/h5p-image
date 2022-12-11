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

    if (params.file === undefined || !(params.file instanceof Object)) {
      this.placeholder = true;
    }
    else {
        this.imageSet = []
        for(let i = 0;i<params.file.length;i++){
            const image = {
                source: H5P.getPath(params.file[i].path, id),
                width: params.file[i].width,
                height: params.file[i].height,
                alt: (!params.decorative[i] && params.alt[i] !== undefined) ? params.alt[i] : '',
                title: params.title[i] ? '' : params.title[i]
            }
            this.imageSet.append(image);
        }
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
    var imageSet = this.imageSet;

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
        self.$img = $('<div>', {
            class: 'h5p-placeholder',
          });
          for(let i = 0;i<imageSet.length;i++){
            self.$img.append($('<img>', {
                width: '100%',
                height: '100%',
                src: imageSet[i].source,
                alt: imageSet[i].alt,
                title: imageSet[i].title,
                on: {
                    load: function () {
                    self.trigger('loaded');
                    }
                }
              }));
          }
      }
    }

    $wrapper.addClass('h5p-image').html(self.$img);
  };

  return H5P.Image;
}(H5P.jQuery));
