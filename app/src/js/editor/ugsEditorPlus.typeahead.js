/**
 * Search on the song list page for songs.
 * Dependencies: jQuery and Twitter Bootstrap's typeahead plugin
 * Based on tutorial:
 * http://tatiyants.com/how-to-use-json-objects-with-twitter-bootstrap-typeahead/
 * @class typeahead
 * @constructor
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.typeahead = function(){
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	// private
	// ---------------------------
	var _keysList = [];
	var _keysToDetailsDict = {};

	var _scrubbedQuery = '';
	var _regex;
	var _words = [];

  var _openInNewTab = false;

	var _re = {
		space: /\s{2,}/g,
		// everything except for alphanumeric gets nuked
		common: /([^a-z0-9]+)/gi,
		//treat quotes as invisible
		noise: /['`’-]/g
	};

	/**
	 * Scrapes HTML to build our list of
	 * keys, searchable text, and display text
	 * @method listFromHtml
	 */
	var listFromHtml = function(){

		$( '.SongListSong' ).each(function( index ) {
			var $this = $(this);
			var plainText = crushText($this.data('searchable'));
			var href = $this.parent('a').attr('href');
			var key = href.toLowerCase();

      var html = $this.data('searchable');

			_keysToDetailsDict[key] = {
				// content displayed in drop down list
				html : html,
				// what we'll match against
				searchText : plainText,
				// unique key/id
				code : key,
				// when a selection is made this is the location we'll launch
				href : href
			};
			_keysList.push(key);
		});

	};

	var crushText = function(value){
		return value
			.toLowerCase()
    	.replace(_re.noise, '')
    	.replace(_re.common, ' ')
    	.replace(_re.space, ' ')
    	.trim();
	};

	var _ta_source = function (query, process) {
		_scrubbedQuery = crushText(query);
		_words = _scrubbedQuery.split(' ');
		var regGroup = '';
		for (var i = 0; i < _words.length; i++) {
			_words[i] = _words[i].trim();
			if (_words[i].length > 0){
				regGroup += (regGroup.length > 0 ? '|' : '') + _words[i];
			}
		}
		_regex = new RegExp( '(' + regGroup + ')', 'gi');
		process(_keysList);
	};

	var _ta_updater = function (item) {
    if(_openInNewTab)
      window.open(_keysToDetailsDict[item].href, '_blank');
    else
      window.location = _keysToDetailsDict[item].href;

    // Do not return the searched text if we want the
    // input field empty after we redirect !
		//return _keysToDetailsDict[item].searchText;
    return '';
	};

	var _ta_matcher = function (item) {
		var detailed = _keysToDetailsDict[item];
		for (var i = 0; i < _words.length; i++) {
			if (detailed.searchText.indexOf(_words[i]) == -1) {
				return false;
			}
		}
		return true;
	};

	var _ta_sorter = function (items) {
		return items.sort(function(a, b) {
			return (_keysToDetailsDict[a].searchText > _keysToDetailsDict[b].searchText);
		});
	};

	var _ta_highligher = function (item) {
		var $temp = $('<div/>').html(_keysToDetailsDict[item].html);

		$('em, .bigger', $temp).each(function( index ){
			var $ele = $(this);
			var text = $ele.html();
			$ele.html(text.replace(_regex, "<strong>$1</strong>"));
		});
		return $temp.html();
	};

	_public.initialize = function(){
		listFromHtml();

		$('#quickSearch')
			.typeahead({
				source: _ta_source,
				updater: _ta_updater,
				matcher: _ta_matcher,
				sorter: _ta_sorter,
				highlighter: _ta_highligher,
				minLength: 2,
				items: 50
			})
			.val('')
			.focus();
	};

  _public.setOpenInNewTab = function(val) {
    _openInNewTab = val;
  };

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
};
