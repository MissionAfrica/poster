/*
* MemeCanvasView
* Manages the creation, rendering, and download of the Meme image.
*/
var headlineBase = 0;
var nameBase = 0;

MEME.MemeCanvasView = Backbone.View.extend({

  initialize: function() {
    var canvas = document.createElement('canvas');
    var $container = MEME.$('#meme-canvas');

    // Display canvas, if enabled:
    if (canvas && canvas.getContext) {
      $container.html(canvas);
      this.canvas = canvas;
      this.setDownload();
      this.render();
    } else {
      $container.html(this.$('noscript').html());
    }

    // Listen to model for changes, and re-render in response:
    this.listenTo(this.model, 'change', this.render);
  },

  setDownload: function() {
    var a = document.createElement('a');
    if (typeof a.download == 'undefined') {
      this.$el.append('<p class="m-canvas__download-note">Right-click button and select "Download Linked File..." to save image.</p>');
    }
  },

  render: function() {
    // Return early if there is no valid canvas to render:
    if (!this.canvas) return;

    // Collect model data:
    var m = this.model;
    var d = this.model.toJSON();
    var ctx = this.canvas.getContext('2d');
    var padding = Math.round(d.width * d.paddingRatio);

    // Reset canvas display:
    this.canvas.width = d.width;
    this.canvas.height = d.height;
    ctx.clearRect(0, 0, d.width, d.height);

    function renderBackground(ctx) {
      // Base height and width:
      var bh = m.background.height;
      var bw = m.background.width;

      if (bh && bw) {
        // Transformed height and width:
        // Set the base position if null
        var th = bh * d.imageScale;
        var tw = bw * d.imageScale;
        var cx = d.backgroundPosition.x || d.width / 2;
        var cy = d.backgroundPosition.y || d.height / 2;

        ctx.drawImage(m.background, 0, 0, bw, bh, cx-(tw/2), cy-(th/2), tw, th);
      }
    }

    function renderBackgroundColor(ctx) {
      if (d.overlayColor) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = d.themeData[d.theme].background;
        ctx.fillRect(0, 0, d.width, d.height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function renderOverlay(ctx) {
      if (d.overlayColor) {
        ctx.save();
        ctx.globalAlpha = d.overlayAlpha;
        ctx.fillStyle = d.overlayColor;
        ctx.fillRect(0, 0, d.width, d.height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function renderHeadline(ctx) {
      var maxWidth = d.width-padding;
      var x = padding;
      var y = d.height/2;

      ctx.font = d.fontSize +'pt '+ d.themeData[d.theme].headlineFont;
      ctx.fillStyle = d.themeData[d.theme].headline;
      ctx.textBaseline = 'top';

      // Text shadow:
      if (d.textShadow) {
        ctx.shadowColor = "#666";
        ctx.shadowOffsetX = -2;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 10;
      }


      ctx.textAlign = 'left';

      var lines = d.headlineText.split("\n");
      for (var m = 0; m < lines.length; m++) {
        var words = lines[m].split(' ');
        var line  = '';

        if(m > 0) {
          y += Math.round(d.fontSize * 1.55);
        }

        for (var n = 0; n < words.length; n++) {
          var testLine  = line + words[n] + ' ';
          var metrics   = ctx.measureText( testLine );
          var testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y-10);
            line = words[n] + ' ';
            y += Math.round(d.fontSize * 1.55);
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y-10);
      }
      headlineBase = y+Math.round(d.fontSize * 1.55)-10;
    }

    function renderWatermark(ctx) {
        ctx.globalAlpha = d.watermarkAlpha;
        ctx.drawImage(m.watermark, 0, 0, 595, 377);
        ctx.globalAlpha = 1;
    }

    function renderName(ctx) {
      ctx.fillStyle = d.themeData[d.theme].name;
      ctx.font = 'normal '+ Math.round(d.fontSize*0.6) +'pt '+ d.themeData[d.theme].nameFont;
      nameBase = headlineBase + Math.round(d.nameSize * 2.2);

      var x = padding;
      var y = headlineBase+4;
      var maxWidth = d.width-padding;

      var lines = d.nameText.split("\n");
      for (var m = 0; m < lines.length; m++) {
        var words = lines[m].split(' ');
        var line  = '';

        if(m > 0) {
          y += Math.round(d.nameSize * 1.55);
        }

        for (var n = 0; n < words.length; n++) {
          var testLine  = line + words[n] + ' ';
          var metrics   = ctx.measureText( testLine );
          var testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y-10);
            line = words[n] + ' ';
            y += Math.round(d.fontSize);
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y-10);
      }
    }

    function renderRoundel(ctx) {
      if(d.roundelText.length === 0) return;
      if(!d.roundel) return;

      var x = d.roundelPosition.x || d.width / 2;
      var y = d.roundelPosition.y || d.height / 2;
      var w = 100;
      ctx.fillStyle = d.themeData[d.theme].roundelBackground;
      ctx.arc(x, y, w/2, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    function renderRoundelText(ctx) {
      if(d.roundelText.length === 0) return;
      if(!d.roundel || typeof d.roundel === 'undefined') return;

      var fontSize = 16;
      var offset = -17;

      var x = d.roundelPosition.x || d.width / 2;
      var y = d.roundelPosition.y || d.height / 2;
      ctx.font = 'normal ' + fontSize + 'pt '+ d.themeData[d.theme].font;
      ctx.fillStyle = d.themeData[d.theme].roundelColor;
      ctx.textAlign = 'center';
      var maxWidth = 60;

      var words = d.roundelText.split(' ');
      var line  = '';
      var lineCount = 0;

      for (var n = 0; n < words.length; n++) {
        var testLine  = line + words[n] + ' ';
        var metrics   = ctx.measureText( testLine );
        var testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y+offset);
          line = words[n] + ' ';
          y += Math.round(fontSize * 1.45);
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y+offset);
    }

    function renderFooter(ctx) {
        ctx.drawImage(m.footer, 30, 746, 403, 66);
    }

    renderBackgroundColor(ctx);
    renderRoundel(ctx);
    renderRoundelText(ctx);
    renderBackground(ctx);
    //renderOverlay(ctx);
    renderHeadline(ctx);
    //renderCredit(ctx);
    renderWatermark(ctx);
    //renderQuotemark(ctx);
    renderName(ctx);
    //renderCredit(ctx);
    renderFooter(ctx);

    var data = this.canvas.toDataURL(); //.replace('image/png', 'image/octet-stream');
    this.$('#meme-download').attr({
      'href': data,
      'download': (d.downloadName || 'share') + '.png'
    });

    // Enable drag cursor while canvas has artwork or roundel enabled:
    this.canvas.style.cursor = d.roundel || this.model.background.width ? 'move' : 'default';
  },

  events: {
    'mousedown canvas': 'onDrag'
  },

  // Performs drag-and-drop on the background image placement:
  onDrag: function(evt) {
    evt.preventDefault();

    // Return early if there is no background image and no roundel:
    if (!this.model.hasBackground() && !this.model.hasRoundel()) return;

    // Configure drag settings:
    var model = this.model;
    var d = model.toJSON();

    switch(d.dragging) {
      case 'background':
        var toDrag = 'backgroundPosition';
        var origin = {x: evt.clientX, y: evt.clientY};
        var start = d.backgroundPosition;
        start.x = start.x || d.width / 2;
        start.y = start.y || d.height / 2;
        break;
      case 'roundel':
        if(!this.model.hasRoundel()) return;
        var toDrag = 'roundelPosition';
        var origin = {x: evt.clientX, y: evt.clientY};
        var start = d.roundelPosition;
        start.x = start.x || d.width / 2;
        start.y = start.y || d.height / 2;
        break;
    }

    // Create update function with draggable constraints:
    function update(evt) {
      evt.preventDefault();

      model.set(toDrag, {
        x: start.x - (origin.x - evt.clientX),
        y: start.y - (origin.y - evt.clientY)
      });
    }

    // Perform drag sequence:
    var $doc = MEME.$(document)
      .on('mousemove.drag', update)
      .on('mouseup.drag', function(evt) {
        $doc.off('mouseup.drag mousemove.drag');
        update(evt);
      });
  }
});
