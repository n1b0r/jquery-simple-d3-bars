(function( $ ) {
    $.fn.d3bars = function(settings) {

        settings = jQuery.extend({
            data      : [],
            width     : null, // uses the width of the containing element
            height    : null, // uses the height of the containing element
            color     : null,
            enableTooltip : null,
        }, settings);
        
        return this.each(function() {
            var $this = $(this);
            var w = settings.width === null ? $this.width() : settings.width;
            var h = settings.height === null ? $this.height() : settings.height;
            
            var left_padding = 30;

            func_color = d3.scale.category20();


            // create tooltip divs
            $(settings.data).each(function(i) {
                $('body').append("<div class='tooltip' id='"+ settings.data[i]['label'] +"'>"+settings.data[i]['label'] + " : "+settings.data[i]['value']+"</div>")
            });



            var x = d3.scale.linear()
                .domain([0, settings.data.length])
                .range([left_padding, w]);
            
            var y = d3.scale.linear()
                .domain([0, d3.max(settings.data, function(d) { return d.value; })])
                .range([0, h]);
            
            var chart = d3.select(this).append("svg:svg")
                .attr("class", "chart")
                .attr("width", w)
                .attr("height", h + 30);               
            
            // x axis numbers
            chart.selectAll("text")
                .data(settings.data)
                .enter().append("svg:text")
                    .attr("x", function(d, i) {  return x(i) + (w / settings.data.length - 1)/2; })
                    .attr("y", h + 10)
                    .attr("width", w / settings.data.length - 1)
                    .attr("text-anchor", function(d) { return "middle"; })
                    .attr("font-size", 10)
                    .text(function(d) { return (d['label'].length > 5) ? d['label'].substring(0,5)+"." : d['label'] });
            
          
            // y axis numbers
            chart.selectAll(".yLabel")
                .data(y.ticks(5))
                .enter().append("svg:text")
                .attr("class", "yLabel")
                .text(String)
                .attr("x", 0)
                .attr("y", function(d) { return h + (-1 * y(d)); })
                .attr("text-align", "right")
                .attr("font-size", 8)
                .attr("dy", 0)

            chart.selectAll(".reference")
                .data(y.ticks(5))
                .enter().append("svg:line")
                    .attr("class", "reference")
                    .attr("x1", left_padding)
                    .attr("x2", w)
                    .attr("y1", function(d) { return h + (-1 * y(d)); })
                    .attr("y2", function(d) { return h + (-1 * y(d)); })
            
             chart.selectAll("rect")
                .data(settings.data)
                .enter().append("svg:rect")
                .attr("x", function(d, i) {  return x(i); })
                
                .attr("width", (w - left_padding) / (settings.data.length))
                
                .attr("y", function(d) { return h; })
                .attr("height", function(d) { return 0; })
                
                .attr("fill", function(d, i) { if (settings.color == null) { return func_color(i); } else { return settings.color; } } )
                
                .on("mouseover", function(ref) { return d3.selectAll(".tooltip").filter(function(d) { return $(this).attr('id') == ref['label']; }).style("visibility", "visible");})
                .on("mousemove", function(ref) { return d3.selectAll(".tooltip").filter(function(d) { return $(this).attr('id') == ref['label']; }).style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                .on("mouseout", function(ref) { return d3.selectAll(".tooltip").filter(function(d) { return $(this).attr('id') == ref['label']; }).style("visibility", "hidden");})

                .transition()
                    .duration(750)
                    .attr("y", function(d) { return h - y(d.value); })
                    .attr("height", function(d) { return y(d.value); });

              // x BAR
            chart.append("svg:line")
                .attr("x1", left_padding)
                .attr("x2", w)
                .attr("y1", h)
                .attr("y2", h)     
                .attr("class", "axis");
            
            // y BAR
            chart.append("svg:line")
                .attr("x1", left_padding)
                .attr("x2", left_padding)
                .attr("y1", 0)
                .attr("y2", h)
                .attr("class", "axis");        
            });
        };
    })
( jQuery );