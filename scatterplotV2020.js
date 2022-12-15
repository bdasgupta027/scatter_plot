//Define Margin
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
    width = 960 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

//Define Color
colors = d3.scaleOrdinal(d3.schemeCategory10);

//Define SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Define Scales   
var xScale = d3.scaleLinear()
    .domain([-1, width + 1])
    .range([0, width]);


var yScale = d3.scaleLinear()
    .domain([-1, height + 1])
    .range([height, 0]);

//Define Tooltip here
var toolTip = d3.select("body")
                .append("div")
                .attr("id", "toolTip")
                .attr("class", "toolTip");
      
//Define Axis
var xAxis = d3.axisBottom(xScale).tickPadding(2);
var yAxis = d3.axisLeft(yScale).tickPadding(2);

//Get Data
d3.csv("scatterdata.csv").then(function(data){
    data.forEach(function(d){
        d.gdp = +d.gdp;
        d.population = +d.population;
        d.epc = +d.ecc;
        d.ec = +d.ec;
    });
    // Define domain for xScale and yScale
    xScale.domain([0,d3.max(data, function(d){ return d.gdp; })]);
    yScale.domain([0,d3.max(data, function(d){ return d.epc; })]);

    //Redefine radius scale 
    var rScale = d3.scaleSqrt()
                    .domain([0, d3.max(data, function(d){ return d.ec; })])
                    .range([0, 50]);

    //Redefine colors
    colors.domain(data.map(function(d){return d.country;}));
    
    //Draw Scatterplot
    svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", function (d) {return Math.sqrt(d.ec) / 0.2; })
    .attr("cx", function(d) {return xScale(d.gdp);})
    .attr("cy", function(d) {return yScale(d.epc);})
    .style("fill", function (d) { return colors(d.country); })
    //Add .on("mouseover", .....
    //Add Tooltip.html with transition and style
    //Then Add .on("mouseout", ....
    .on("mouseover", function(d) { //on mouseover, show tooltip
        toolTip.transition()		
                .duration(200)		
                .style("opacity", .9);		
        toolTip	.html("<p class=\"countryField\">" + d.country + "</p>"          +  
                    "<div class=\"line1\">" +
                   "<p class=\"label\"> Population</p>"+ "<p class=\"colon\"> :</p>" + 
                   "<p class=\"units\">" + `${d.population} Million` + "</p>" +
                 "</div>" + 
                 "<div class=\"line2\">" +
                   "<p class=\"label\"> GDP</p>"+ "<p class=\"colon\"> :</p>" + 
                   "<p class=\"units\">" + `${d.gdp} Trillion` + "</p>" +
                 "</div>" + 
                     "<div class=\"line3\">" +
                   "<p class=\"label\"> EPC</p>"+ "<p class=\"colon\"> :</p>" + 
                   "<p class=\"units\">" + `${d.epc}` + " Million BTUs</p>" +
                 "</div>" + 
                     "<div class=\"line4\">" +
                   "<p class=\"label\"> Total</p>"+ "<p class=\"colon\"> :</p>" + 
                   "<p class=\"units\">" + `${d.ec}` + " Trillion BTUs</p>" +
                 "</div>")	
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
                .style("margin-bottom", "0px")
                .style("margin-top", "0px")
                .style("padding-top", "0px")
                .style("line-height", "0px");
        	
    })
    //on mouseout, reduce opacity to 0
    .on("mouseout", function (d) {
            toolTip.transition()
                .duration(500)
                .style("opacity", 0);
    });
    
    const gGrid = svg.append("g");

  
    

    //Draw Country Names
    svg.selectAll(".text")
        .data(data)
        .enter().append("text")
        .attr("class","text")
        .style("text-anchor", "start")
        .attr("x", function(d) {return xScale(d.gdp);})
        .attr("y", function(d) {return yScale(d.epc);})
        .style("fill", "black")
        .text(function (d) {return d.country; });
    
    var view = svg.append("rect")
    .attr("class", "view")
    .attr("x", 0.5)
    .attr("y", 0.5)
    .attr("width", width)
    .attr("height", height);
//    .style("pointer-events", "all");
//    .attr('transform', d3.event.transform)
//    .call(zoom);

    //x-axis
    var gX = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", 50)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .attr("font-size", "12px")
        .text("GDP (in Trillion US Dollars) in 2010");


    //Y-axis
    var gY = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .style("fill", "black")
        .text("Energy Consumption per Capita (in Million BTUs per person)");
    
    //Scale Changes as we Zoom
    // Call the function d3.behavior.zoom to Add zoom
    var x2 = xScale.copy();
    var y2 = yScale.copy();
    const handleZoom = () => {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        console.log(d3.event.transform);
//        view.attr("transform", d3.event.transform);
        
         //rescales x by creating a copy of the scale & calling rescale with the new scale domain
        xScale.domain(d3.event.transform.rescaleX(x2).domain());
        xAxis.scale(xScale)
        gX.call(xScale);
        
       //rescales y by creating a copy of the scale & calling rescale with the new scale domain
        yScale.domain(d3.event.transform.rescaleY(y2).domain());
        gY.call(yScale);
        
        //selects circles and changes size and position
        svg.selectAll(".dot")
            .attr('transform', d3.event.transform)
            .attr("r", function (d) {return Math.sqrt(d.ec) / 0.2; })
            .attr("cx", function(d) {return xScale(d.gdp);})
            .attr("cy", function(d) {return yScale(d.epc);});
        //selects country names and changes position
        svg.selectAll(".text")
            .attr('transform', d3.event.transform)
            .attr("x", function(d) {return xScale(d.gdp);})
            .attr("y", function(d) {return yScale(d.epc);});
       
        
        
    }
   
    
   var zoom = d3.zoom()
    .scaleExtent([.5, 20]) //scale for zoom
//    .translateExtent([[0,0],[width, height]])
    .on("zoom", handleZoom); //calls handleZoom function


    d3.select('svg').call(zoom); //calls zoom function on svg
     
    
    
    //sets dimensions for legend
    //ties the positiion of the legend to the width & height of the graph so that it stays comstant when using zoom and pan+drag functionality
    var dimensions = {w: 3 * margin.right, h: 4 * margin.bottom}
      //set the top left x and y coordinate for the legend
      var legend_position = {x: width - dimensions.w - 10, y: height - dimensions.h - 10}
      var legend = svg.append("rect")
                      .attr("transform", "translate(" + legend_position.x +
                                          ", " + legend_position.y + ")")
                      .attr("width", + dimensions.w + "px")
                      .attr("height", dimensions.h + "px")
                      .style("fill", "lightgrey");

      //Add lagest circle to the legend
      svg.append("circle")
         .attr("r", rScale(100))
         .attr("cx", legend_position.x + 175)
         .attr("cy", legend_position.y + 125)
         .style("fill", "white");

      //Add largest circle label
      svg.append("text")
         .attr("x", legend_position.x + 20)
         .attr("y", legend_position.y + 125)
         .attr("font-size", "12px")
         .style("fill", "black")
         .text("100 Trillion BTUs");

      //Add medium circle
      svg.append("circle")
         .attr("r", rScale(10))
         .attr("cx", legend_position.x + 175)
         .attr("cy", legend_position.y + 53)
         .style("fill", "white");
      
      //Add label for medium circle
      svg.append("text")
         .attr("x", legend_position.x + 20)
         .attr("y", legend_position.y + 53)
         .attr("font-size", "12px")
         .style("fill", "black")
         .text("10 Trillion BTUs");

      //add smallest circle 
      svg.append("circle")
         .attr("r", rScale(1))
         .attr("cx", legend_position.x + 175)
         .attr("cy", legend_position.y + 22)
         .style("fill", "white");

      //label for smallest circle
      svg.append("text")
         .attr("x", legend_position.x + 20)
         .attr("y", legend_position.y + 22)
         .attr("font-size", "12px")
         .style("fill", "black")
         .text("1 Trillion BTUs");

      //Add legend title (in green)
      svg.append("text")
         .attr("x", legend_position.x + 50)
         .attr("y", legend_position.y + 190)
         .attr("font-size", "12px")
         .style("fill", "Green")
         .text("Total Energy Consumption");

    
    
    

});






