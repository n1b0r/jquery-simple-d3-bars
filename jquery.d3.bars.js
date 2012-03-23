(function( $ ) {
    $.fn.d3bars = function(settings) {

        // get the parameters
        settings = jQuery.extend({
            data      : [],              // data to be displayed : [ { "value" : 12, "label"; "X" }, { "value" : 3, "label"; "Y" }]
            width     : null,            // default 300
            height    : null,            // default 200
            color     : null,            // color of the bars, default is d3.scale.category20() more info at https://github.com/mbostock/d3/wiki/Ordinal-Scales
            text_size : null,
            enable_tooltip : false,       // enable tooltip
            tooltip_text_generator: function(d, i) { return d['value']; },

            y_label : null,
            x_label : null,
            label_size : null,



            title : null,
            title_size : null,
             
        }, settings);
        
        return this.each(function() {
            var $this = $(this);
            var w = settings.width === null ? 300 : settings.width;
            var h = settings.height === null ? 200 : settings.height;
            var text_size = settings.text_size === null ? 10 : settings.text_size;
            var title_size = settings.title_size === null ? 16 : settings.title_size;
            var label_size = settings.label_size === null ? settings.text_size : settings.label_size;
            
            // default color func
            func_color = d3.scale.category20();           

            // define the left padding
            max_val = d3.max(settings.data, function(d) { return d.value; }).toString();
            var left_padding = Math.max(max_val.substring(0,max_val.indexOf(".",0)).length * 11, 20);


            // usefull internal variable
            if (settings.title == null) { title_height = 5; }
            else {title_height = 50;}

            var graph_y_min = (settings.y_label != null) ? h - text_size * 1.5 - label_size : h - text_size * 1.5;
            var graph_y_max = graph_y_min - title_height;
            

            $this.width(settings.width)
            $this.height(settings.height)

            var x = d3.scale.linear()
                .domain([0, settings.data.length])
                .range([left_padding, w]);
            
            var y = d3.scale.linear()
                .domain([0, d3.max(settings.data, function(d) { return d.value; })])
                .range([0, graph_y_max]);
            
            var chart = d3.select(this).append("svg:svg")
                .attr("class", "chart")
                .attr("width", w)
                .attr("height", h );               
            
            // x axis numbers
            chart.selectAll("text")
                .data(settings.data)
                .enter().append("svg:text")
                    .attr("x", function(d, i) {  return x(i) + (w / settings.data.length - 1)/2; })
                    .attr("y", graph_y_min + text_size + 2)
                    .attr("width", w / settings.data.length - 1)
                    .attr("text-anchor", function(d) { return "middle"; })
                    .attr("font-size", text_size)
                    .text(function(d) { return (d['label'].length > 5) ? d['label'].substring(0,5)+"." : d['label'] });
            
          
            // y axis numbers
            chart.selectAll(".yLabel")
                .data(y.ticks(5))
                .enter().append("svg:text")
                .attr("class", "yLabel")
                //.text(function(d) { return (d.toString().match("000"+"$")) ? d.toString().substring(d.length-3,d.length)+"k" : d })
                .text(String)
                .attr("x", 0)
                .attr("y", function(d) { return graph_y_min + (-1 * y(d)); })
                .attr("text-align", "right")
                .attr("font-size", text_size)
                .attr("dy", 0)

            chart.selectAll(".reference")
                .data(y.ticks(5))
                .enter().append("svg:line")
                    .attr("class", "reference")
                    .attr("x1", left_padding)
                    .attr("x2", w)
                    .attr("y1", function(d) { return graph_y_min + (-1 * y(d)); })
                    .attr("y2", function(d) { return graph_y_min + (-1 * y(d)); })
            
             chart.selectAll("rect")
                .data(settings.data)
                .enter().append("svg:rect")
                .attr("x", function(d, i) {  return x(i); })
                
                .attr("width", (w - left_padding) / (settings.data.length))
                
                .attr("y", function(d) { return graph_y_min; })
                .attr("height", function(d) { return 0; })
                
                .attr("fill", function(d, i) { if (settings.color == null) { return func_color(i); } else { return settings.color; } } )
                
                .transition()
                    .duration(750)
                    .attr("y", function(d) { return graph_y_min - y(d.value); })
                    .attr("height", function(d) { return y(d.value); });
            
            // the title
            chart.append("svg:text")
                .attr("class", "chart_title")
                //.text(function(d) { return (d.toString().match("000"+"$")) ? d.toString().substring(d.length-3,d.length)+"k" : d })
                .text(settings.title)
                .attr("x", w/2)
                .attr("y", 10 + title_size)
                .attr("text-anchor", "middle")
                .attr("font-size", title_size)
                .attr("dy", 0)
            // x label title
            chart.append("svg:text")
                .attr("class", "chart_axis_title")
                //.text(function(d) { return (d.toString().match("000"+"$")) ? d.toString().substring(d.length-3,d.length)+"k" : d })
                .text(settings.x_label)
                .attr("x", 5)
                .attr("y", title_height- 2)
                
                .attr("font-size", label_size)
                .attr("dy", 0)
            //y label title
            chart.append("svg:text")
                .attr("class", "chart_axis_title")
                //.text(function(d) { return (d.toString().match("000"+"$")) ? d.toString().substring(d.length-3,d.length)+"k" : d })
                .text(settings.y_label)
                .attr("x", 0.9*w)
                .attr("y", graph_y_min + label_size * 1.5)
                .attr("text-anchor", "middle")
                .attr("font-size", label_size)
                .attr("dy", 0)
            
            if (settings.enable_tooltip) {
                // create tooltip divs
                $(settings.data).each(function(i, d) {
                    $('body').append(generate_tooltip_div(d['label'], settings.tooltip_text_generator(d,i)))
                });

                //make events
                chart.selectAll("rect")
                    .on("mouseover", function(ref) { get_tooltip(ref).style("visibility", "visible");})
                    .on("mousemove", function(ref) { get_tooltip(ref).style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                    .on("mouseout", function(ref) { get_tooltip(ref).style("visibility", "hidden");})
            }    
            
            // x BAR
            chart.append("svg:line")
                .attr("x1", left_padding)
                .attr("x2", w)
                .attr("y1", graph_y_min)
                .attr("y2", graph_y_min)     
                .attr("class", "axis");
            
            // y BAR
            chart.append("svg:line")
                .attr("x1", left_padding)
                .attr("x2", left_padding)
                .attr("y1", title_height)
                .attr("y2", graph_y_min)
                .attr("class", "axis");        
            });
        };
    })
( jQuery );

function generate_tooltip_div(id, content) {
    return "<div class='tooltip' id='"+ id +"'>"+content+"</div>"
}
function get_tooltip(ref) {
    return d3.selectAll(".tooltip").filter(function(d) { return $(this).attr('id') === ref['label'].toString(); })
}