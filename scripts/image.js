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
  this.alt = params.alt;
  if (params.title !== undefined) {
    this.title = params.title;
  }
};

/**
 * Wipe out the content of the wrapper and put our HTML in it.
 * 
 * @param {jQuery} $wrapper
 * @returns {undefined}
 */
H5P.Image.prototype.attach = function ($wrapper) {
  var extraAttr = this.title === undefined ? '' : ' title="' + this.title + '"';
  $wrapper.html('<img width="100%" height="100%" src="' + this.file + '" alt="' + this.alt + '"' + extraAttr + '/>');
};