var H5P = H5P || {};

/**
 * Constructor.
 * 
 * @param {object} params Options for this library.
 * @param {string} contentPath The path to our content folder.
 * @returns {undefined}
 */
H5P.Image = function (params, contentPath) {
  this.file = contentPath + params.file.path;
};

/**
 * Wipe out the content of the wrapper and put our HTML in it.
 * 
 * @param {jQuery} $wrapper
 * @returns {undefined}
 */
H5P.Image.prototype.attach = function ($wrapper) {
  $wrapper.html('<img width="100%" height="100%" src="' + this.file + '" alt=""/>');
};