jQuery(function($){
    
    var stripe_creator = (function(){
        PNGlib.prototype.drawStripe = function(color, thickness, angle){
            // Draws a image-center-centered stripe of specified thickness
            // Does this by drawing several slanted rectangles
            
            // High value for rectangle height
            var rect_height = this.height + this.width;
            var h=this.height,w=this.width;
            
            this.drawRectangle(color, {x:0, y:0}, rect_height, thickness, angle);
            this.drawRectangle(color, {x:0, y:h}, rect_height, thickness, angle);
            this.drawRectangle(color, {x:w, y:0}, rect_height, thickness, angle);
            this.drawRectangle(color, {x:w, y:h}, rect_height, thickness, angle);
        }
        
        var self = {
            preview_targets: $('#fsg-preview-img'), 
            inputs:{
                angle:$(), // Empty selector
                fg:$(),
                bg:$(),
                thickness:$(),
                spacing:$(),
            },
            update_cb: $.noop,
            update: function(){
                
                var spacing = +self.inputs.spacing.val(),
                    thickness = +self.inputs.thickness.val(),
                    required_thickness = spacing + thickness,
                    angle = Math.abs(+self.inputs.angle.val() * Math.PI) / 180;
                
                
                // Calculate required height and width for given angle:
                var png_width = required_thickness / Math.cos(angle),
                    png_height = png_width / Math.tan(angle);
                
                png_width = Math.round(png_width);
                png_height = Math.round(png_height);
                
                var png = new PNGlib(png_width,png_height,256);
                
                //alert([png_width,png_height,angle]);
                
                
                png.fill(png.getColorFromHex(self.inputs.bg.val()));
                
                //png.drawRectangle(png.getColorFromHex(self.inputs.fg.val()), png.getCenter(), 900, 10, +self.inputs.angle.val());
                
                png.drawStripe(png.getColorFromHex(self.inputs.fg.val()), self.inputs.thickness.val(), +self.inputs.angle.val());
                
                var dataurl = 'url('
                    + 'data:image/png;base64,'
                    + png.getBase64()
                    + ')';
                
                self.preview_targets
                    .css('background',dataurl);
                
                self.update_cb();
            },
            set_update_callback: function(cb){
                self.update_cb = cb;
            },
            set_inputs: function(inputs){
                self.inputs.angle=$(inputs.angle);
                self.inputs.thickness=$(inputs.thickness);
                self.inputs.spacing=$(inputs.spacing);
                self.inputs.fg=$(inputs.fg);
                self.inputs.bg=$(inputs.bg);
            },
            set_preview_targets: function(target){
                self.preview_targets = $(target);
            },
        };return self;
    })();
    
    
    stripe_creator.set_update_callback(function(){
        //$('body').css('background','yellow');
    });
    
    stripe_creator.set_inputs({
        angle:'#fsg-angle',
        fg:'#fsg-fg-color',
        bg:'#fsg-bg-color',
        thickness:'#fsg-thickness',
        spacing:'#fsg-spacing'
    });
    
    $('.apply')
        .click(stripe_creator.update);
    

    $('#change-bg')
        .change(function(b){
            $(stripe_creator.preview_targets).attr('style','');
            
            if($(this).is(':checked')){
                stripe_creator.set_preview_targets('body');
                $('#fsg-preview-img').slideUp('slow');
            } else {    
                stripe_creator.set_preview_targets('#fsg-preview-img');
                $('#fsg-preview-img').slideDown('slow');
            }
            
            stripe_creator.update();
        }).change();
    
    $('.fsg .colors input[type="color"]')
        .change(function(){
            var color_hex = $(this).val();
            
            color_hex = color_hex.replace('#','');
                        
            var r=parseInt(color_hex.substr(0,2),16),
                g=parseInt(color_hex.substr(2,2),16),
                b=parseInt(color_hex.substr(4,2),16),
                a=1
                is_dark = r + g + b < 0x1ff;
                
            
            if (color_hex.length == 8){
                a = parseInt(color_hex.substr(6,2),16) / 0xff; // get alpha from #rrggbbaa
            }
            
            
            
            $(this)
                .css('background', 'RGBA('+[r,g,b,a]+')')
                .css('color',is_dark?'white':'');
            
            var wrapper = '.color-no-alpha[data-fsg-id="'+this.id+'"]';
            if(!$(wrapper).length){
                $(this).wrap($('<div />')
                    .addClass('color-no-alpha')
                    .attr('data-fsg-id',this.id)
                    .html('&nbsp;'));
                $(this).parent().wrap('<div class="color-no-alpha-wrapper"></div>');
            }
            
            $(wrapper)
                .css('background-color','RGB('+[r,g,b]+')')
            
            a=1;
        })
        .change();
});

