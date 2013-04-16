var H5P = H5P || {};

/**
 * Constructor.
 * 
 * @param {object} params Options for this library.
 * @param {string} contentPath The path to our content folder.
 * @returns {undefined}
 */
H5P.Image = function (params, contentPath) {
  this.params = params;
  this.contentPath = contentPath;
};

/**
 * Wipe out the content of the wrapper and put our HTML in it.
 * 
 * @param {jQuery} $wrapper
 * @returns {undefined}
 */
H5P.Image.prototype.attach = function ($wrapper) {
  var file = this.contentPath + this.params.file.path;
  var extraAttr = this.params.title === undefined ? '' : ' title="' + this.params.title + '"';
  $wrapper.html('<img width="100%" height="100%" src="' + file + '" alt="' + this.params.alt + '"' + extraAttr + '/>');
};