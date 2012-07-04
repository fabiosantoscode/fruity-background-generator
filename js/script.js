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
            code_targets: $('#fsg-copy-code'),
            save_button: $('#fsg-save-button'),
            inputs:{
                angle:$('#fsg-angle'), // These are default selectors. They can be overridden.
                fg:$('#fsg-fg-color'),
                bg:$('#fsg-bg-color'),
                thickness:$('#fsg-thickness'),
                spacing:$('#fsg-spacing'),
            },
            event_namespace:'.fsg_event', //dot is there so we can remove namespacing
            update_cb: $.noop,
            update: function(){
                if (!self.validate_parameters()){
                    //return; // TODO: Add error message somewhere, user needs to know
                }
                var angle_deg = +self.inputs.angle.val();
                
                // Make the angle be between 0 and 179 where I can better work on it.
                while (angle_deg < 0) angle_deg += 180;
                while (angle_deg >= 180) angle_deg -=180;
                
                var spacing = +self.inputs.spacing.val(),
                    thickness = +self.inputs.thickness.val(),
                    required_thickness = spacing + thickness,
                    angle = (angle_deg * Math.PI) / 180;
                
                if (angle_deg == 0){
                    var png_width=required_thickness,
                        png_height=1;
                } else if (angle_deg == 90){
                    var png_width=1,
                        png_height=required_thickness;
                } else {
                    // Calculate required height and width for given angle:
                    var png_width = Math.abs(Math.round(required_thickness / Math.cos(angle))),
                        png_height = Math.abs(Math.round(png_width / Math.tan(angle)));
                }
                var png = new PNGlib(png_width,png_height,256);
                
                //alert([png_width,png_height,angle]);
                
                
                png.fill(png.getColorFromHex(self.inputs.bg.val()));
                
                png.drawStripe(png.getColorFromHex(self.inputs.fg.val()), self.inputs.thickness.val(), +self.inputs.angle.val());
                
                var dataurl = 'url('
                    + 'data:image/png;base64,'
                    + png.getBase64()
                    + ')';
                
                self.preview_targets
                    .css('background',dataurl);
                
                if (self.code_targets.length && self.code_targets.css('display') != 'none'){
                    self.code_targets
                        .val('    background-image: '+dataurl+';');
                }
                self.update_cb();
            },
            set_update_callback: function(cb){
                self.update_cb = cb;
            },
            bind_input_events: function(){
                $.each(self.inputs,function(){
                    update_self=function(){self.update();};
                    $(this).bind('input' + self.event_namespace, update_self);
                    $(this).bind('change' + self.event_namespace, update_self);
                });
            },
            unbind_input_events: function(){
                $.each(self.inputs,function(){
                    $(this).unbind('input' + self.event_namespace);
                    $(this).unbind('change' + self.event_namespace);
                });
            },
            set_inputs: function(inputs){
                unbind_input_events();
                
                self.inputs.angle=$(inputs.angle);
                self.inputs.thickness=$(inputs.thickness);
                self.inputs.spacing=$(inputs.spacing);
                self.inputs.fg=$(inputs.fg);
                self.inputs.bg=$(inputs.bg);
                
                bind_input_events();
            },
            set_preview_targets: function(target){
                self.preview_targets = $(target);
            },
            validate_parameters: function(){ // Return true if everything is valid
                ret = true;
                $('.fsg input')
                    .each(function(){
                        if (!this.checkValidity()){
                            ret = false;
                            return false;
                        }
                    });
                return ret;
            },
            init: function(){
                self.bind_input_events();
                self.save_button
                    .click(function(){
                        self.code_targets.toggle();
                    });
                self.code_targets
                    .focus(function(){
                        $(this).select();
                    });
                self.update();
            }
        };return self;
    })();
    
    
    stripe_creator.init();
    
    
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
        });
    
    $('.fsg .colors input.color')
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

