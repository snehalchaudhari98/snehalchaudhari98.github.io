// Hint: This is a good place to declare your global variables
const legend_keys = ["Female Literacy Rate", "Male Literacy Rate"];
// const color_key = ["#D198C5FF", "#41a6e0"]; // female and male color
const line_space = 5; // offset for male and female individual entity (in pixels)
const c_r = 5;
const stroke_width = 2;
const margin = { top: 80, bottom: 30, right: 30, left: 60 }; // // Margin around the lollipop chart
const text_weight = 450;
const x_axis_lable = "Regions";
const y_axis_label = "Average Literacy Rate";
const color = [ "#F2BAC9", "#B9D1E5" ];
// var innerHeight;
// var innerWidth;
const hover_size = 20;
const text_buffer_space= 20;
const tooltip_y_offset = 10;
const tooltip_x_offset = 20;

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener("DOMContentLoaded", function () {
  // Hint: create or set your svg element inside this function

  // This will load your two CSV files and store them into two arrays.
  Promise.all([d3.csv("data/Adult_Literacy_Rate.csv")]).then(function (values) {
    literacyData = values[0];


    literacyData.forEach((entry) => {
      Object.keys(entry).forEach(function (s) {
        if (
          s == "LITERACY_RT_FEMALE" ||
          s == "LITERACY_RT_MALE" ||
          s == "LITERACY_RT_TOTAL"
        ) {
          entry[s] = +entry[s]; // converting attribute value to numeric format
        }
      });
    });
 addToolTip();

    const derived_data = calculateWeightedAverage(literacyData);
    
    plotDualBarChart(derived_data);

    plotCircularBarGraph(literacyData, undefined);

    addClearButton();


   
  });
});


function addToolTip(){
  // add tooltip
  d3.select(".tooltip").remove();

  // check older tooltip removal afterwards
  d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("font-size", "0.6em")
    .style("padding", "5px")
    .style("position", "absolute");
}

function addClearButton(){
  //clear button
  const button = d3
    .select("#show_all")
    .on("click", function (_) {
       changeContentOfP("");
      plotCircularBarGraph(literacyData, undefined);
    });
}

function calculateWeightedAverage(data) {
  const groups = {};

  // Iterate over the data array and add each record to its corresponding group
  data.forEach(function (d) {
    const groupName = d.region_wb;
    if (!groups[groupName]) {
      groups[groupName] = {
        region_name:groupName,
        LITERACY_RT_TOTAL: 0,
        LITERACY_RT_FEMALE: 0,
        LITERACY_RT_MALE: 0,
        count: 0,
      };
    }
    groups[groupName].LITERACY_RT_TOTAL += +d.LITERACY_RT_TOTAL;
    groups[groupName].LITERACY_RT_FEMALE += +d.LITERACY_RT_FEMALE;
    groups[groupName].LITERACY_RT_MALE += +d.LITERACY_RT_MALE;
    groups[groupName].count++;
  });

  // Calculate the averages for each group
  Object.keys(groups).forEach(function (groupName) {
    const group = groups[groupName];
    group.LITERACY_RT_TOTAL /= group.count;
    group.LITERACY_RT_FEMALE /= group.count;
    group.LITERACY_RT_MALE /= group.count;
  });

  // Use the grouped and averaged data as needed

  const final_result = Object.values(groups);
  return final_result;
}


function changeContentOfP(text){
  d3.select("#selected_reg")
  .text(text =="" ? "":"Selected Region is "+text);
}

function plotDualBarChart(derived_country_data) {
  const bar_svg = d3.select("#bar_plot");

  const width = +bar_svg.style("width").replace("px", "");
  const height = +bar_svg.style("height").replace("px", "");

  const local_margin = { top: 10, bottom: 50, right: 30, left: 60 };

  let innerWidth = width - local_margin.left - local_margin.right;
  let innerHeight = height - local_margin.top - local_margin.bottom;



  var xBarScale = d3
    .scaleBand()
    .range([0, innerWidth])
    .domain(
      derived_country_data.map(function (d) {
        return d["region_name"];
      })
    )
    .padding(0.7);

  const yBarScale = d3
    .scaleLinear()
    .domain([
      30,
      100
      // d3.max(derived_country_data, function (d) {
      //   return d["LITERACY_RT_FEMALE"];
      // }),
    ]) // data space // add extra space
    .range([innerHeight, 0]); // pixel space


    var Tooltip = d3.select(".tooltip");

    var mouseover = function (event, d) {
      Tooltip.style("opacity", 1);
    };

    var mouseleave = function (d) {
      Tooltip.style("opacity", 0);
    };   



  

  // Add the bars
  const dual_bar_plot = bar_svg
    .append("g")
    .attr("id", "dual_bar")
    .attr("transform", `translate(${local_margin.left}, ${local_margin.top})`);

  dual_bar_plot
    .append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xBarScale))
    .selectAll("text")
    // .style("margin-top", "10px")
    .attr("transform", `translate(-20,10)rotate(-15)`)
    .style("text-anchor", "right");

  dual_bar_plot.append("g").call(d3.axisLeft(yBarScale));

      // dual_bar_plot
      dual_bar_plot
        .selectAll(".maleavg_bar")
        .data(derived_country_data, (r) => r)
        .enter()
        .append("rect")
        // .attr(
        //   "transform",
        //   `translate(${local_margin.left}, ${local_margin.top})`
        // )
        .attr("class", "maleavg_bar")
        .attr("x", function (d) {
          return xBarScale(d["region_name"]) - xBarScale.bandwidth()/2;
        })
        .attr("width", xBarScale.bandwidth())
        .attr("y", (d) => yBarScale(d["LITERACY_RT_MALE"]))
        .attr("height", (d) => innerHeight - yBarScale(d["LITERACY_RT_MALE"]))
        .attr("fill", color[1])
        .on("click", function (event, d) {
          changeContentOfP(d["region_name"]);
          plotCircularBarGraph(literacyData, d);
        })
        .on("mouseover", mouseover)
        .on("mousemove", function(event, d) {
              Tooltip.html(
                "Region: " +
                  d.region_name +
                  "<br>Average Male Literacy Rate: " +
                  d["LITERACY_RT_MALE"].toFixed(2)
              )
                .style("opacity", 1)
                .style("top", event.pageY - tooltip_y_offset + "px")
                .style("left", event.pageX + tooltip_x_offset + "px");
      })
        .on("mouseout", mouseleave);


    // dual_bar_plot
      dual_bar_plot
        .selectAll(".femaleavg_bar")
        .data(derived_country_data, (r) => r)
        .enter()
        .append("rect")
        // .attr(
        //   "transform",
        //   `translate(${local_margin.left}, ${local_margin.top})`
        // )
        .attr("class", "femaleavg_bar")
        .attr("x", function (d) {
          return xBarScale(d["region_name"]) + xBarScale.bandwidth() / 2;
        })
        .attr("width", xBarScale.bandwidth())
        .attr("y", (d) => yBarScale(d["LITERACY_RT_FEMALE"]))
        .attr("height", (d) => innerHeight - yBarScale(d["LITERACY_RT_FEMALE"]))
        .attr("fill", color[0])
        .on("click", function (event, d) {
          changeContentOfP(d["region_name"]);
          plotCircularBarGraph(literacyData, d);
        })
        .on("mouseover", mouseover)
        .on("mousemove", function (event, d) {
          Tooltip.html(
            "Region: " +
              d.region_name +
              "<br>Average Female Literacy Rate: " +
              d["LITERACY_RT_FEMALE"].toFixed(2)
          )
            .style("opacity", 1)
            .style("top", event.pageY - tooltip_y_offset + "px")
            .style("left", event.pageX + tooltip_x_offset + "px");
        }).on("mouseout", mouseleave);

        addLabelsOnAxis(dual_bar_plot, innerWidth, innerHeight);
}
  

/*Use this function for drawing axis labels on the chart*/
function addLabelsOnAxis(svg, innerWidth, innerHeight) {
  const label_plot = svg
    .append("g")
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);
  label_plot
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-40")
    .attr("x", -innerHeight / 2)
    .style("text-anchor", "middle")
    .attr("class", "y_axis_label")
    .attr("font-weight", text_weight)
    .text(y_axis_label);

  label_plot
    .append("text")
    .attr("transform", `translate(${innerWidth / 2},${innerHeight + 52})`)
    .style("text-anchor", "middle")
    .attr("class", "x_axis_label")
    .attr("font-weight", text_weight)
    .text(x_axis_lable);
}

function drawLegendsOnPlot(svg, innerWidth) {
  const legendX = 100,
    legendY = 10;

  // Add legends on new 'g' element
  const label_g = svg
    .append("g")
    .attr("transform", `translate(${innerWidth - legendX}, ${legendY})`);

  // create a legends items from list
  label_g
    .selectAll("mydots")
    .data(color)
    .enter()
    .append("rect")
    .attr("y", function (d, i) {
      return i * 25;
    })
    .attr("width", 20)
    .attr("height", 20)
    .attr("transform", `translate(10, 10)`)
    .attr("fill", function (d, i) {
      return color[i];
    });

  label_g
    .selectAll("mylabels")
    .data(legend_keys)
    .enter()
    .append("text")
    .attr("transform", `translate(40, 0)`)
    .attr("y", function (d, i) {
      return 25 + i * 25;
    }) // 25 is the distance between two ledgend
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "right")
    .attr("font-weight", text_weight)
    .style("alignment-baseline", "middle")
    .style("font-size", "0.9em");
}

function plotCircularBarGraph(all_data, selected_region) {
  const svg = d3.select("#circular_bar_plot");

  const width = +svg.style("width").replace("px", "");
  const height = +svg.style("height").replace("px", "");

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin["top"] - margin.bottom;

  const innerRadius = Math.min(innerWidth, innerHeight) / 3;
  const outerRadius = Math.max(innerWidth, innerHeight) / 3;


  drawLegendsOnPlot(svg, innerWidth);

    var Tooltip = d3.select(".tooltip");

    var mouseover = function (event, d) {
      Tooltip.style("opacity", 1);
    };

    var mouseleave = function (d) {
      Tooltip.style("opacity", 0);
    };   


    
    // const filteredData = data.filter((item) => item.age >= 30);

    let data;
    if(selected_region != undefined){
    data= all_data.filter((d) => {
          return d.region_wb == selected_region.region_name;
        });
    }else{
        data = all_data;
    }
    
  // X scale: common for 2 data series
  var x = d3
    .scaleBand()
    .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
    .align(0) // This does nothing
    .domain(
      data.map(function (d) {
        return d.name;
      })
    ); // The domain of the X axis is the list of states.

  // Y scale outer variable
  var y = d3
    .scaleRadial()
    .range([innerRadius, outerRadius]) // Domain will be define later.
    // .domain([0, 250]); // Domain of Y is from 0 to the max seen in the data
    .domain([0,125]); // Domain of Y is from 0 to the max seen in the data

  // Second barplot Scales
  var ybis = d3
    .scaleRadial()
    .range([innerRadius, 5]) // Domain will be defined later.
    .domain([0, 125]);

  d3.select("#combined_circular_bar_plot").remove();

  const circular_plt = svg
    .append("g")
    .attr("id", "combined_circular_bar_plot")
    .attr("transform", `translate(${innerWidth / 2}, ${2*innerHeight / 3})`);
  // Add the bars
 circular_plt
   .selectAll(".male_bars")
   .data(data)
   .enter()
   .append("path")
   .attr("fill", color[1])
   .attr("class", "male_bars")
   .attr(
     "d",
     d3
       .arc() // imagine your doing a part of a donut plot
       .innerRadius(innerRadius)
       .outerRadius(function (d) {
         return y(d["LITERACY_RT_MALE"]);
       })
       .startAngle(function (d) {
         return x(d.name);
       })
       .endAngle(function (d) {
         return x(d.name) + x.bandwidth();
       })
       .padAngle(0.01)
       .padRadius(innerRadius)
   )
   .on("mouseover", function (event, d) {
     d3.select(this)
       .transition()
       .duration(200)
       .attr(
         "d",
         d3
           .arc()
           .innerRadius(innerRadius)
           .outerRadius(function (d) {
             return y(d["LITERACY_RT_MALE"]) + hover_size;
           })
           .startAngle(function (d) {
             return x(d.name);
           })
           .endAngle(function (d) {
             return x(d.name) + x.bandwidth();
           })
           .padAngle(0.01)
           .padRadius(innerRadius)
       );

     // add tooltip as well
     // tooltip
     Tooltip.style("opacity", 1);

      d3.selectAll(".circle_text").style("opacity", 0.5);

      d3.select('#text_' + d.name).style("opacity", 1);
   })
   .on("mouseout", function (event, d) {
     // tooltip
     Tooltip.style("opacity", 0);
     d3.selectAll(".circle_text").style("opacity", 1);

     d3.select(this)
       .transition()
       .duration(200)
       .attr(
         "d",
         d3
           .arc()
           .innerRadius(innerRadius)
           .outerRadius(function (d) {
             return y(d["LITERACY_RT_MALE"]);
           })
           .startAngle(function (d) {
             return x(d.name);
           })
           .endAngle(function (d) {
             return x(d.name) + x.bandwidth();
           })
           .padAngle(0.01)
           .padRadius(innerRadius)
       );
   })
   .on("mousemove", function (event, d) {
     Tooltip.html(
       "Region: " +
         d.region_wb +
         "<br>" +
         "County: " +
         d.name +
         "<br>Male Literacy Rate: " +
         d["LITERACY_RT_FEMALE"].toFixed(2)
     )
       .style("opacity", 1)
       .style("top", event.pageY - tooltip_y_offset + "px")
       .style("left", event.pageX + tooltip_x_offset + "px");
   });

  // Add the labels
 circular_plt
   .selectAll("g")
   .data(data)
   .enter()
   .append("g")
   .attr("class","circle_text")
   .attr("id",function(d){
    return 'text_' + d.name;
   })
   .attr("text-anchor", function (d) {
     return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
       ? "end"
       : "start";
   })
   .attr("transform", function (d) {
     return (
       "rotate(" +
       (((x(d.name) + x.bandwidth() / 2) * 180) / Math.PI - 90) +
       ")" +
       "translate(" +
       (y(d["LITERACY_RT_MALE"]) + text_buffer_space) +
       ",0)"
     );
   })
   .append("text")
   .text(function (d) {
     return d.name;
   })
   .attr("transform", function (d) {
     return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
       ? "rotate(180)"
       : "rotate(0)";
   })
  //  .style("font-size", "7px")
   .attr("alignment-baseline", "middle")
   .style("font-size", "0.5em");

  // Add the second series
 circular_plt
   .selectAll(".female_bars")
   .data(data)
   .enter()
   .append("path")
   .attr("fill", color[0])
   .attr("class", "female_bars")
   .attr(
     "d",
     d3
       .arc() // imagine your doing a part of a donut plot
       .innerRadius(function (d) {
         return ybis(0);
       })
       .outerRadius(function (d) {
         return ybis(d["LITERACY_RT_FEMALE"]);
       })
       .startAngle(function (d) {
         return x(d.name);
       })
       .endAngle(function (d) {
         return x(d.name) + x.bandwidth();
       })
       .padAngle(0.01)
       .padRadius(innerRadius)
   )
   .on("mouseover", function (evnt, d) {
    //tooltip 
     Tooltip.style("opacity", 1);

     d3.select(this)
       .transition()
       .duration(200)
       .attr(
         "d",
         d3
           .arc()
           .innerRadius(function (d) {
             return ybis(0);
           })
           .outerRadius(function (d) {
             return ybis(d["LITERACY_RT_FEMALE"]) - hover_size;
           })
           .startAngle(function (d) {
             return x(d.name);
           })
           .endAngle(function (d) {
             return x(d.name) + x.bandwidth();
           })
           .padAngle(0.01)
           .padRadius(innerRadius)
       );

       d3.selectAll(".circle_text")
       .style("opacity", 0.5);

       d3.select("#text_" + d.name).style("opacity", 1);
   })
   .on("mouseout", function (event, d) {
     //tooltip
     Tooltip.style("opacity", 0);
     d3.selectAll(".circle_text")
       .style("opacity", 1);

     d3.select(this)
       .transition()
       .duration(200)
       .attr(
         "d",
         d3
           .arc()
           .innerRadius(function (d) {
             return ybis(0);
           })
           .outerRadius(function (d) {
             return ybis(d["LITERACY_RT_FEMALE"]);
           })
           .startAngle(function (d) {
             return x(d.name);
           })
           .endAngle(function (d) {
             return x(d.name) + x.bandwidth();
           })
           .padAngle(0.01)
           .padRadius(innerRadius)
       );
   })
   .on("mousemove", function (event, d) {
     Tooltip.html(
       "Region: " +
         d.region_wb +
         "<br>" +
         "County: " +
         d.name +
         "<br>Female Literacy Rate: " +
         d["LITERACY_RT_FEMALE"].toFixed(2)
     )
       .style("opacity", 1)
       .style("top", event.pageY - tooltip_y_offset + "px")
       .style("left", event.pageX + tooltip_x_offset + "px");
   });



  
}
