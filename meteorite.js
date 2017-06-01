
    var url = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

    var width = "100%",// "100%",
        height = 1050;//"100%";

    var centered;//for zoom

    var projection = d3.geoMercator()
                       .translate([625,410])
                       .scale(200);

    var path = d3.geoPath()
        .projection(projection);

    var map_style = {"fill":'#BFCBC2', "stroke": '#F3FFE0'};
    var dateformat = d3.timeFormat("%Y");

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Set background color
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', map_style.fill)
      .on("click", clicked);
      //.call(zoom)

    var map = svg.append('g');

    //earth map
    d3.json('https://d3js.org/world-110m.v1.json', function(data) {
          map.selectAll('path')
            .data(topojson.feature(data, data.objects.countries).features)
            .enter()
            .append('path')
            .attr('fill', map_style.fill)
            .attr('stroke', map_style.stroke)
            .attr('d', path)
            .on("click", clicked);
    });

    //adding lat/long lines to map
    var graticule = d3.geoGraticule()
                      .step([5, 5]);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .attr("stroke", "#cad4cc");

    var radiusScale = d3.scaleSqrt()
                        .range([2,50]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var meteorites;
    var recclass;

    d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json', function(data) {

      radiusScale.domain(d3.extent(data.features.map(function(d) {return Number(d.properties.mass)})));

      var masses = [];
      meteorites = svg.append('g')
         .selectAll('path')
         .data(data.features)
         .enter()
         .append('circle')
         .attr('cx', function(d) { return projection([d.properties.reclong,d.properties.reclat])[0]; })
         .attr('cy', function(d) { return projection([d.properties.reclong,d.properties.reclat])[1]; })
         .attr('r', function(d) {  return radiusScale(d.properties.mass); })
         .attr('stroke', "black")
         .attr('fill', function(d){
           return color(d.properties.recclass);
         })

         .on("mouseover", function(d){
              $(".tooltip").html("<p>Name: "+d.properties.name+" <br> Year: "+dateformat(Date.parse(d.properties.year))+" <br> Meteorite Class:"+d.properties.recclass+" </p>");
              $(".tooltip").addClass("lit");
              // console.log("mouseover");
              $(".tooltip").css({"top": d3.event.pageY, "left": d3.event.pageX+5});
              $(this).addClass("selected");

            })//on mouseover
         .on("mouseout", function(d){
             $(".tooltip").empty().removeClass("lit");
             $(this).removeClass("selected");

           })
           .on("click", clicked);

    });//d3.json

    function clicked(d) {
      var x, y, k;

      if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
      } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
      }

      map.selectAll("path")
          .classed("active", centered && function(d) { return d === centered; });
    console.log(width, height);
      map.transition()
          // .duration(500)
          .attr("transform", "translate(" + $(window).width() / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
          .style("stroke-width", 1.5 / k + "px");

          meteorites.transition()
                    // .delay(250)
                    .attr("transform", "translate(" + $(window).width() / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

    }
