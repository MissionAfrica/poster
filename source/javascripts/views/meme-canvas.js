/*
* MemeCanvasView
* Manages the creation, rendering, and download of the Meme image.
*/
MEME.MemeCanvasView = Backbone.View.extend({

  initialize: function() {
    var canvas = document.createElement('canvas');
    var $container = MEME.$('#meme-canvas');
    // Display canvas, if enabled:
    if (canvas && canvas.getContext) {
      $container.html(canvas);
      this.canvas = canvas;
      //this.setDownload();
      this.render();
    } else {
      $container.html(this.$('noscript').html());
    }

    // Listen to model for changes, and re-render in response:
    this.listenTo(this.model, 'change', this.render);
  },

  setDownload: function() {

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

      function renderTitle(ctx) {
        var maxWidth = Math.round(d.width * 0.75);
        var x = padding;
        var y = d.height/2;

        ctx.font = d.fontSize +'pt '+ d.fontFamily;
        ctx.fillStyle = d.fontColor;
        ctx.textBaseline = 'top';

        // Text alignment:
        ctx.textAlign = 'left';

        var words = d.titleText.split(' ');
        var line  = '';

        for (var n = 0; n < words.length; n++) {
          var testLine  = line + words[n] + ' ';
          var metrics   = ctx.measureText( testLine );
          var testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += Math.round(d.fontSize * 1.5);
          } else {
            line = testLine;
          }
        }

        ctx.fillText(line, x, y);
        ctx.shadowColor = 'transparent';
      }

      function renderSubtitle(ctx) {
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillStyle = d.fontColor;
        ctx.font = 'normal '+ d.subtitleSize +'pt '+ d.subFontFamily;
        ctx.fillText(d.subtitleText, padding, d.height*0.7);
      }

      function renderDescription(ctx) {
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        ctx.fillStyle = d.fontColor;
        ctx.font = 'normal '+ d.subtitleSize +'pt '+ d.subFontFamily;
        var x = padding
        var y = d.height*0.7
        var maxWidth = Math.round(d.width * 0.75);
        var words = d.descriptionText.split(' ');
        var line  = '';

        for (var n = 0; n < words.length; n++) {
          var testLine  = line + words[n] + ' ';
          var metrics   = ctx.measureText( testLine );
          var testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += Math.round(d.subtitleSize * 1.5);
          } else {
            line = testLine;
          }
        }

        ctx.fillText(line, x, y);
      }

      function renderWatermark(ctx) {
        // Base & transformed height and width:
        var bw, bh, tw, th;
        bh = th = m.watermark.height;
        bw = tw = m.watermark.width;

        if (bh && bw) {
          // Calculate watermark maximum width:
          var mw = d.width * d.watermarkMaxWidthRatio;

          // Constrain transformed height based on maximum allowed width:
          if (mw < bw) {
            th = bh * (mw / bw);
            tw = mw;
          }

          ctx.globalAlpha = d.watermarkAlpha;
          ctx.drawImage(m.watermark, 0, 0, d.width, d.height);
          ctx.globalAlpha = 1;
        }
      }
      renderWatermark(ctx);
      renderTitle(ctx);
      renderDescription(ctx);

      var data = this.canvas.toDataURL();
      this.$('#meme-download').attr({
        'href': data,
        'download': 'poster.png'
      });
    }




});
