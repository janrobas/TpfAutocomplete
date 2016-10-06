/*! @license ©2015 Ruben Verborgh - Multimedia Lab / iMinds / Ghent University */
// jQuery widget for Triple Pattern Fragments query execution

(function ($) {
  // Query UI main entry point, which mimics the jQuery UI widget interface:
  // - $(element).queryui(options) initializes the widget
  // - $(element).queryui('option', [key], [value]) gets or sets one or all options
  $.fn.queryui = function (operation, option, value) {
    // Shift parameters if no operation given
    if (typeof operation !== 'string')
      value = option, option = operation, operation = 'init';

    // Apply the operation to all elements; if one element yields a value, stop and return it
    var result = this;
    for (var i = 0; i < this.length && result === this; i++) {
      var $element = $(this[i]), queryui = $element.data('queryui');
      switch (operation) {
        // initialize the element as a Query UI
        case 'init':
          if (!queryui) {
            $element.data('queryui', queryui = new LdfQueryUI($element, option));
            queryui._create();
          }
          break;
        // set an option of a Query UI
        case 'option':
          if (!queryui) throw new Error('Query UI not activated on this element');
          // retrieve all options
          if (option === undefined)     result = queryui.options;
          // retrieve a specific option
          else if (value === undefined) result = queryui.options[value];
          // set a specific option
          else queryui._setOption(option, value);
          break;
      }
    }
    return result;
  };

  // Creates a new Query UI interface for the given element
  function LdfQueryUI($element, options) {
    this.element = $element;
    this.options = $.extend({}, this.options, options);
  }

  $.extend(LdfQueryUI.prototype, {
    // Default widget options
    options: {
      datasources: [],
      queries: [],
      prefixes: [],
    },

    // Initializes the widget
    _create: function () {
      var self = this,
          options = this.options,
          $element = this.element,
          $log = this.$log = $('#log', $element),
          $stop = this.$stop = $('#stop', $element),
          $start = this.$start = $('#start', $element),
          $query = this.$query = $('#poizvedba', $element),
          $results = this.$results = $('#rezultati', $element),
          $zacniIskanje = this.$zacniIskanje = $("[data-zacni-iskanje]", $element),
          $koncajIskanje = this.$koncajIskanje = $("[data-koncaj-iskanje]", $element);

      // Set up starting and stopping
      $start.click(this._execute.bind(this));
      $stop.click(this._stopExecution.bind(this));

      // Add log lines to the log element
      var logger = this._logger = new ldf.Logger();
      ldf.Logger.setLevel('info');

      logger._print = function (items) {
        if(items[3] == "Requesting") {
          $results.trigger("novZahtevek");
        }

        if(!options.nonverbose) {
          appendText($log, items.slice(2).join(' ').trim() + '\n');
        }
      };

      // Apply all options
      for (var key in options)
        this._setOption(key, options[key], true);

    },
    // Sets a specific widget option
    _setOption: function (key, value, initialize) {
      var options = this.options;
      if (!initialize && options[key] === value) return;
      options[key] = value;

      // Apply the chosen option
      var self = this; //, $datasources = this.$datasources, $queries = this.$queries;
      switch (key) {
      case 'settings':
        $.getJSON(value, function (settings) {
          for (var key in settings)
            self._setOption(key, settings[key]);
        });
        break;
      }
    },

    // Starts query execution
    _execute: function () {
      var datasources = this.options.datasources.filter(x=>x.selected).map(x=>x.url);
      // Clear results and log, and scroll page to the results
      var $results = this.$results, $log = this.$log;
      $('html,body').animate({ scrollTop: this.$start.offset().top });
      this.$koncajIskanje.show();
      this.$zacniIskanje.hide();
      $log.empty();
      $results.empty();

      // Create a client to fetch the fragments through HTTP
      var config = { prefixes: this.options.prefixes, logger: this._logger };
      config.fragmentsClient = new ldf.FragmentsClient(datasources, config);

      // Create the iterator to solve the query
      var resultsIterator;
      try { resultsIterator = new ldf.SparqlIterator(this.$query.val(), config); }
      catch (error) { return this._stopExecution(error); }
      this._resultsIterator = resultsIterator;
      resultsIterator.on('end', $.proxy(this._stopExecution, this));
      resultsIterator.on('error', $.proxy(this._stopExecution, this));

      // Read the iterator's results, and write them depending on the query type
      switch (resultsIterator.queryType) {
        // For SELECT queries, write a JSON array representation of the rows
        case 'SELECT':
          var resultCount = 0;
          resultsIterator.on('data', function (row) {
            resultCount++;
            var lines = [];
            $.each(row, function (k, v) { if (v !== undefined) lines.push( { "key":k, "value":v } ); });
            //appendText($results, lines.join('\n'), '\n\n');
            $results.trigger("novRezultat", [lines]);
          });
          resultsIterator.on('end', function () {
            if(!resultCount) {
              // appendText($results, '(ni rezultatov)');
              $results.trigger("niRezultatov");
            }
          });
          break;
        // For CONSTRUCT and DESCRIBE queries, write a Turtle representation of all results
        case 'CONSTRUCT':
        case 'DESCRIBE':
          var writer = new N3.Writer({ write: function (chunk, encoding, done) {
            appendText($results, chunk), done && done();
          }}, config);
          resultsIterator.on('data', function (triple) { writer.addTriple(triple); })
                         .on('end',  function () { writer.end(); });
          break;
        // For ASK queries, write whether an answer exists
        case 'ASK':
          resultsIterator.on('data', function (exists) { appendText($results, exists); });
          break;
        default:
          appendText($log, 'Unsupported query type: ' + resultsIterator.queryType);
      }
    },

    // Stops query execution
    _stopExecution: function (error) {
      this.$koncajIskanje.hide();
      this.$zacniIskanje.show();
      this._resultsIterator && this._resultsIterator.removeAllListeners();
      ldf.HttpClient.abortAll && ldf.HttpClient.abortAll();
      error && error.message && this.$results.text(error.message);
      this.$results.trigger("konec");
    },
  });

  // Appends text to the given element
  function appendText($element) {
    for (var i = 1, l = arguments.length; i < l; i++)
      $element.append((arguments[i] + '').replace(/(<)|(>)|(&)|(https?:\/\/[^\s<>]+)/g, escape));
    $element.scrollTop(1E10);
  }

  // Escapes special HTML characters and convert URLs into links
  function escape(match, lt, gt, amp, url) {
    return lt && '&lt;' || gt && '&gt;' || amp && '&amp;' ||
           $('<a>', { href: url, target: '_blank', text: url })[0].outerHTML;
  }

  // Converts the array to a hash with the elements as keys
  function toHash(array) {
    var hash = {}, length = array ? array.length : 0;
    for (var i = 0; i < length; i++)
      hash[array[i]] = false;
    return hash;
  }
})(jQuery);
