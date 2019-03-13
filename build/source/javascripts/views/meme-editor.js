/*
* MemeEditorView
* Manages form capture, model updates, and selection state of the editor form.
*/
MEME.MemeEditorView = Backbone.View.extend({

  initialize: function() {
    _.bindAll(this, 'detectScroll');
    $(window).scroll(this.detectScroll);

    this.buildForms();
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  detectScroll: function(e) {
    var top = $(document).scrollTop();
    if(top >= 90) {
      $('.m-canvas').addClass('fixed');
    } else {
      $('.m-canvas').removeClass('fixed');
    }
  },

  // Builds all form options based on model option arrays:
  buildForms: function() {
    var d = this.model.toJSON();

    function buildOptions(opts) {
      return _.reduce(opts, function(memo, opt) {
        return memo += ['<option value="', opt.hasOwnProperty('value') ? opt.value : opt, '">', opt.hasOwnProperty('text') ? opt.text : opt, '</option>'].join('');
      }, '');
    }

    if (d.textShadowEdit) {
      $('#text-shadow').parent().show();
    }

    // Build text alignment options:
    if (d.textAlignOpts && d.textAlignOpts.length) {
      $('#text-align').append(buildOptions(d.textAlignOpts)).show();
    }

    // Build font size options:
    if (d.fontSizeOpts && d.fontSizeOpts.length) {
      $('#font-size').append(buildOptions(d.fontSizeOpts)).show();
    }

    // Build font family options:
    if (d.fontFamilyOpts && d.fontFamilyOpts.length) {
      $('#font-family').append(buildOptions(d.fontFamilyOpts)).show();
    }

    // Build color options:
    if (d.themeOpts && d.themeOpts.length) {
      $('#theme').append(buildOptions(d.themeOpts)).show();
    }

    // Build watermark options:
    if (d.watermarkOpts && d.watermarkOpts.length) {
      $('#watermark').append(buildOptions(d.watermarkOpts)).show();
    }

    // Build overlay color options:
    if (d.overlayColorOpts && d.overlayColorOpts.length) {
      var overlayOpts = _.reduce(d.overlayColorOpts, function(memo, opt) {
        var color = opt.hasOwnProperty('value') ? opt.value : opt;
        return memo += '<li><label><input class="m-editor__swatch" style="background-color:'+color+'" type="radio" name="overlay" value="'+color+'"></label></li>';
      }, '');

      $('#overlay').show().find('ul').append(overlayOpts);
    }

    // Build background color options:
    if (d.backgroundColorOpts && d.backgroundColorOpts.length) {
      var backgroundOpts = _.reduce(d.backgroundColorOpts, function(memo, opt) {
        var color = opt.hasOwnProperty('value') ? opt.value : opt;
        return memo += '<li><label><input class="m-editor__swatch" style="background-color:'+color+'" type="radio" name="background" value="'+color+'"></label></li>';
      }, '');

      $('#background').show().find('ul').append(backgroundOpts);
    }
  },

  render: function() {
    var d = this.model.toJSON();
    this.$('#headline').val(d.headlineText);
    this.$('#name').val(d.nameText);
    this.$('[name="dragging"][value="' + d.dragging + '"]').prop('checked', true);
    this.$('[name="roundel"]').prop('checked', d.roundel);
    this.$('#credit').val(d.creditText);
    this.$('#watermark').val(d.watermarkSrc);
    this.$('#image-scale').val(d.imageScale);
    this.$('#font-size').val(d.fontSize);
    this.$('#font-family').val(d.fontFamily);
    this.$('#theme').val(d.theme);
    this.$('#text-align').val(d.textAlign);
    this.$('#text-shadow').prop('checked', d.textShadow);
    this.$('#overlay').find('[value="'+d.overlayColor+'"]').prop('checked', true);
    this.$('#background').find('[value="'+d.backgroundColor+'"]').prop('checked', true);
  },

  events: {
    'input #headline': 'onHeadline',
    'input #credit': 'onCredit',
    'input #name': 'onName',
    'input #image-scale': 'onScale',
    'change #font-size': 'onFontSize',
    'change #font-family': 'onFontFamily',
    'change #theme': 'onTheme',
    'change #watermark': 'onWatermark',
    'change #text-align': 'onTextAlign',
    'change #text-shadow': 'onTextShadow',
    'change [name="overlay"]': 'onOverlayColor',
    'change [name="background"]': 'onBackgroundColor',
    'change [name="dragging"]': 'onDragging',
    'change [name="roundel"]': 'onRoundel',
    'dragover #dropzone': 'onZoneOver',
    'dragleave #dropzone': 'onZoneOut',
    'drop #dropzone': 'onZoneDrop',
    'click #doubleOpenQuote': 'onDoubleOpenQuote',
    'click #doubleCloseQuote': 'onDoubleCloseQuote',
    'click #singleOpenQuote': 'onSingleOpenQuote',
    'click #singleCloseQuote': 'onSingleCloseQuote',
    'click #emdash': 'onEmdash'
  },

  onRoundel: function() {
    this.model.set('roundel', this.$('[name="roundel"]:checked').val());
    if(this.$('[name="roundel"]:checked').val()) {
      this.model.set('dragging', 'roundel');
    }
  },

  onDragging: function() {
    this.model.set('dragging', this.$('[name="dragging"]:checked').val());
  },

  onDoubleOpenQuote: function() {
    var cursor = this.$('#headline')[0].selectionStart;
    var cursorEnd = this.$('#headline')[0].selectionEnd;
    var value = this.$('#headline').val();
    
    if(cursorEnd > cursor) {
      this.$('#headline').val(value.substring(0, cursorEnd) + '”' + value.substring(cursorEnd));
      value = this.$('#headline').val();
    }
    
    this.$('#headline').val(value.substring(0, cursor) + '“' + value.substring(cursor));

    this.onHeadline();
    return false;
  },

  onDoubleCloseQuote: function() {
    var cursor = this.$('#headline')[0].selectionStart;
    var value = this.$('#headline').val();
    this.$('#headline').val(value.substring(0, cursor) + '”' + value.substring(cursor));
    this.onHeadline();
    return false;
  },

  onSingleOpenQuote: function() {
    var cursor = this.$('#headline')[0].selectionStart;
    var cursorEnd = this.$('#headline')[0].selectionEnd;
    var value = this.$('#headline').val();
    
    if(cursorEnd > cursor) {
      this.$('#headline').val(value.substring(0, cursorEnd) + '’' + value.substring(cursorEnd));
      value = this.$('#headline').val();
    }
    
    this.$('#headline').val(value.substring(0, cursor) + '‘' + value.substring(cursor));
    this.onHeadline();
    return false;
  },

  onSingleCloseQuote: function() {
    var cursor = this.$('#headline')[0].selectionStart;
    var value = this.$('#headline').val();
    this.$('#headline').val(value.substring(0, cursor) + '’' + value.substring(cursor));
    this.onHeadline();
    return false;
  },

  onEmdash: function() {
    var cursor = this.$('#headline')[0].selectionStart;
    var value = this.$('#headline').val();
    this.$('#headline').val(value.substring(0, cursor) + '—' + value.substring(cursor));
    this.onHeadline();
    return false;
  },

  onName: function() {
    this.model.set('nameText', this.$('#name').val());
  },

  onCredit: function() {
    this.model.set('creditText', this.$('#credit').val());
  },

  onHeadline: function() {
    this.model.set('headlineText', this.$('#headline').val());
  },

  onTextAlign: function() {
    this.model.set('textAlign', this.$('#text-align').val());
  },

  onTextShadow: function() {
    this.model.set('textShadow', this.$('#text-shadow').prop('checked'));
  },

  onFontSize: function() {
    this.model.set('fontSize', this.$('#font-size').val());
  },

  onFontFamily: function() {
    this.model.set('fontFamily', this.$('#font-family').val());
  },

  onTheme: function() {
    this.model.set('theme', this.$('#theme').val());
  },

  onWatermark: function() {
    this.model.set('watermarkSrc', this.$('#watermark').val());
    if (localStorage) localStorage.setItem('meme_watermark', this.$('#watermark').val());
  },

  onScale: function() {
    this.model.set('imageScale', this.$('#image-scale').val());
  },

  onOverlayColor: function(evt) {
    this.model.set('overlayColor', this.$(evt.target).val());
  },

  onBackgroundColor: function(evt) {
    this.model.set('backgroundColor', this.$(evt.target).val());
  },

  getDataTransfer: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    return evt.originalEvent.dataTransfer || null;
  },

  onZoneOver: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      dataTransfer.dropEffect = 'copy';
      this.$('#dropzone').addClass('pulse');
    }
  },

  onZoneOut: function(evt) {
    this.$('#dropzone').removeClass('pulse');
  },

  onZoneDrop: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      this.model.loadBackground(dataTransfer.files[0]);
      this.$('#dropzone').removeClass('pulse');
    }

    this.model.set('dragging', 'background');
  }
});