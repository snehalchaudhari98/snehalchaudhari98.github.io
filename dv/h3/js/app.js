let globalDevData;
let regionData;
const margin = { top: 80, bottom: 80, right: 100, left: 100 };  // Margin around the line chart
var innerHeight;
var innerWidth;
let mergedData;
const text_weight = 550;
const circle_radius = 9;
const label_font_size = "18px";
var lineOpacityHover = 1;
var otherLinesOpacityHover = 0.2;
var lineStroke = "4px";
const axisLabelAnimationDur = 1000;
const countryFontSize = "16px"
const countryFontHoversize = "20px";
var dropdown_option_label_size = "1.1rem";
var countryRegionMap = new Map();
var flagCountryMap = new Map();
var lineOpacity;
const world_region = [{ reg: "Sub-Saharan Africa", color: "#76b7b2" }, { reg: "Europe & Central Asia", color: "#f28e2c" }, { reg: "South Asia", color: "#4e79a7" },
{ reg: "Middle East & North Africa", color: "#e15759" }, { reg: "Latin America & Caribbean", color: "#59a14f" }, { reg: "East Asia & Pacific", color: "#9c755f" },
{ reg: "North America", color: "#af7aa1" }];

/****** Change animation duration - start  *******/
var initLineDrawDuration = 200;
var initLineFadeInDuration = 400;
var flagcircleAnimationDuration = 100;
var playLineAnimationDuration = 3500;
var updateLineAnimationDur = 1000;
var updateLineAnimationWait = 500;
var deleteLineAnimDuration = 500;
var initialPlayTimelineVal;
/****** Change animation duration - end *******/
// ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]
// ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]
// ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]
// ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
// ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]

document.addEventListener('DOMContentLoaded', function () {
    console.log('Loading DOM....')
 
    Promise.all([d3.csv('data/countries_regions.csv'),  d3.csv('data/global_development.csv') , d3.json('data/country.json')])
         .then(function (values) {
             console.log('loaded global development data');             
             regionData = values[0];
             globalDevData = values[1];
             coutryFlagCollection = values[2];

             let selectedAttributes = selectRandomAttributes();
             

             createFlagStore(coutryFlagCollection);

              // perform data wrangling
              dataWrangling();
             mergedData = combineDatasets(regionData, globalDevData);
            
             // create a widgets in conrol panel for attributes
             addPlayButtonSelector();
             addAttributesInControlPanel(selectedAttributes);
             addMultiSelectPrompt();     
             addOpacityRangeSlider();
             addCustomTimeRange();
             addFlagSwitchInControlPanel();

             // adding tooltips
             addLineToolTip();
             addCircleandFlagTip();
            
             drawMultiLineChart( mergedData, false);

             let selected_attr = d3.select('#attribute_selection').property('value');
             addLabelsOnAxis("Year", selected_attr);
         });
 
 });


 function addFlagSwitchInControlPanel(){
    var toggleButtonSec = d3.select("#toggle");

    // Create the toggle switch elements
    var toggleLabel = toggleButtonSec.append("label")
      .attr("class", "toggle-switch");
      
    var toggleInput = toggleLabel.append("input")
      .attr("type", "checkbox")
      .attr("id","show_flag_toggle");
      
    var toggleSlider = toggleLabel.append("span")
      .attr("class", "slider round");
      
    // Add an event listener to toggle the switch
    toggleInput.on("click", function() {
      var showFlag = toggleInput.property("checked");
      toggleSlider.classed("active", showFlag);

      if(d3.select("#line-chart") != undefined){
        console.log("toggle flag changed");
            const allLineElem = d3.selectAll(".g-line");

            allLineElem.selectAll("#country_name")
                        .style('opacity', showFlag ? 0:1);

            allLineElem.selectAll("#country-flag")
                        .style('opacity', showFlag ? 1:0);
      }
      
    });
 }

 function addCustomTimeRange(){
  const controlPanelDiv = d3.select('#control-panel-part-3');
  var years = d3.range(1990, 2014);

   const startYearSelection = controlPanelDiv.select('#start_year');

   startYearSelection.selectAll("option")
      .data(years, year => year)
      .enter()
      .append("option")
      .text(function(d) { return d; })
      .property("value", (year) => year)
      .property('selected', function(d) {
        return d === 1990;
      });


    startYearSelection.on("change", (event) => {
          drawMultiLineChart(mergedData, true);
  });

  const endYearSelection = controlPanelDiv.select('#end_year');

    endYearSelection.selectAll("option")
                      .data(years, year => year)
                      .enter()
                      .append("option")
                      .text(function(d) { return d; })
                      .property("value", (year) => year)
                      .property('selected', function(d) {
                            return d === 2013;
                      });


    endYearSelection.on("change", (event) => {
          drawMultiLineChart(mergedData, true);
      });

 }


function createFlagStore(coutryFlagCollection){
  
    coutryFlagCollection.forEach(function(record) {
        flagCountryMap.set(record.name, record.flag_1x1);
    });
    
}

 function combineDatasets(regionData, globalDevData){

    // 1990-2013
    const staticTimeRange = [new Date(1990, 0, 1), new Date(2013, 0, 1)];    

    var data = globalDevData.map((globalDataR) => {
        const recordB = regionData.find((recordB) => recordB.name === globalDataR.Country);
        if (recordB) {
          
          if(countryRegionMap.has(recordB["World bank region"])){
            if(!countryRegionMap.get(recordB["World bank region"]).includes(globalDataR.Country)){
              countryRegionMap.get(recordB["World bank region"]).push(globalDataR.Country);
            }
          }else{
            countryRegionMap.set(recordB["World bank region"], [globalDataR.Country]);
          }
          
          // If a match is found, combine the records
          return Object.assign({}, globalDataR, {
            "World bank region": recordB["World bank region"],
          });
        }else{
            return;
        }
        
      }).filter(Boolean);

      const filterData = data.filter((record) => {
        return  record.Year >= staticTimeRange[0] && record.Year <= staticTimeRange[1];
      });

      const groupedC = d3.group(filterData, d=>d["World bank region"],  d => d.Country);
    
      return groupedC;
 }

 function dataWrangling(){
    //Perform data wrangling
    globalDevData.forEach(entry => {
        Object.keys(entry).forEach( function(k){
            if(k == 'Year'){
                entry[k] = new Date(+entry[k], 0, 1); // converting year value as a Date object
            }else if(k != 'Country'){
                entry[k] = +entry[k]; // converting attribute value to numeric format
            }                   
        });
        
    });
 }


function addPlayButtonSelector() {
  var button =
    d3.select("#play-button")
      .style("display", "inline-block")
      .style("cursor", "pointer")
      .on("click", function (d) {
        drawMultiLineChart(mergedData, true);
      });
}

function addAttributesInControlPanel(selectedAttributes) {
  const controlPanelDiv = d3.select('#control-panel-part-2');

  const attributeSel = controlPanelDiv.select('#attribute_selection');

  attributeSel.selectAll("option")
    .data(selectedAttributes, opt => opt)
    .enter()
    .append("option")
    .text(function (d) { return d; })
    .property("value", (opt) => opt);


  attributeSel.on("change", (event) => {
    // on value change of selection draw the chart
    drawMultiLineChart(mergedData, false);
  });
}


function addOpacityRangeSlider() {
  var defaultValue = 0.5;
  var sliderStep = 0.1;
  var opacityMin = 0.3;
  var opacityMax = 1;

  const opacityControl = d3.select('#opacity_range');

  var opacityInputSlider =
    opacityControl.select('#opacity-slider')
      .attr('min', opacityMin)
      .attr('max', opacityMax)
      .attr('step', sliderStep)
      .on("mousemove", function (d) {
        selectedValue = this.value;

        lineOpacity = selectedValue; //IMP~
        // Update the range value text label and tooltip
        rangeLabel.text(selectedValue*100 +" %");
        // Just change the opacity of the graph
        updateAllLineOpacity(selectedValue);

      }).on("mouseout", function () {
        selectedValue = this.value;
        rangeLabel.text(selectedValue*100+" %");
      }).on("click", function () {
        selectedValue = this.value;
        rangeLabel.text(selectedValue*100+" %");
        updateAllLineOpacity(selectedValue);
      });

var rangeLabel = d3.select("#opacity-slider-text")
  .attr("class", "range-value")
  .style("font-size", label_font_size)
  .style("margin-right", "8px")
  .style("margin-left", "8px")
  .style("font-weight", "bold")
  .style("color", "white")
  .text(defaultValue*100+" %");

  // set to default value
opacityControl.select('#opacity-slider')
  .property('value', defaultValue);

}

function updateAllLineOpacity(newOpacity) {
  const multilineChart = d3.select('#line_chart');

  multilineChart.selectAll(".line")
    .style("opacity", newOpacity);

  multilineChart.selectAll("#circle")
    .style("opacity", newOpacity);


  if (isShowFlag()) {
    multilineChart.selectAll("#country-flag")
      .style("opacity", newOpacity);
  } else {
    multilineChart.selectAll("#country_name")
      .style("opacity", newOpacity);
  }

}

function getAllSelectedGeoLocCheckBox(){
  var selectedOptions = getSelectedCountriesCheckBox();
  return selectedOptions;
}

function getCombinedDataForSelected(data, selectionOption, startYear, endYear) {

  let combinedData = [];
  const startDate = new Date(+startYear, 0, 1);
  const endDate = new Date(+endYear, 0, 1);

  data.forEach((mapValues, keys) => {
    if (selectionOption.includes(keys)) {
      let region_array = Array.from(mapValues.values());


      region_array.forEach(country => {
        let filter_country_rec = country.filter((d) => {
          return d.Year >= startDate && d.Year <= endDate;
        });

        if (filter_country_rec.length != 0) {
          combinedData.push(filter_country_rec);
        }

      });

    }
  });

  return combinedData;
}

function getLineColor(selected_data){
    let selected_world_region_rec = world_region.find((d) => d.reg === selected_data[0]['World bank region']);
    return selected_world_region_rec.color;
}

 function drawMultiLineChart(allData, isPlayAnime){
   const selected_attr = d3.select('#attribute_selection').property('value');
   lineOpacity = d3.select('#opacity-slider').property('value');
   var allSelectedRegions = getAllSelectedGeoLocCheckBox();
   const start_year = d3.select('#start_year').property('value');
   const end_year = d3.select('#end_year').property('value');
   var customCombinedData = getCombinedDataForSelected(allData, allSelectedRegions, start_year, end_year);
   let isExistingPlot = false;


   if (start_year >= end_year) {
     window.alert("Please select valid date range.");
   }

   if (allData != undefined) {
     const svg = d3.select('#gd_svg');

     // if it's update for delete action no need to delete previous plot.
     var graph_plot;
     if (isPlayAnime) {
       svg.selectAll("#line_chart").remove();  // comment me for animation
       graph_plot = svg.append('g').attr('id', 'line_chart');
     } else {
       // need to check if this is the first time we are drawing the graph, as initial line delay for update and delete depends on this
       if (svg.selectAll("#line_chart").empty()) {
         // so add line chart to it
         d3.select('#gd_svg').append('g').attr('id', 'line_chart');
       } else {
         isExistingPlot = true;
       }
       graph_plot = svg.selectAll("#line_chart");
     }

     const width = +svg.style('width').replace('px', '');
     const height = +svg.style('height').replace('px', '');
     innerWidth = width - margin.left - margin.right;
     innerHeight = height - margin.top - margin.bottom;

      let xScale = d3.scaleTime()
        .domain([new Date(start_year, 0, 1), new Date(end_year, 0, 1)])
        .range([0, innerWidth]);

      // get all maximum value in an array to find overall max
      let attribute_y_range = [];
      customCombinedData.forEach((values) => {
        attribute_y_range.push(d3.max(values, function (d) { return d[selected_attr]; }));
      });

      // Yscale from 0 to Max
      let yScaleMinMax = [0, d3.max(attribute_y_range, function (d) { return d; })];

      // Add Y axis
      let yScale = d3.scaleLinear()
        .domain(yScaleMinMax)
        .range([innerHeight, 0]);

     const singleLine = d3.line()
       .x(function (d) { return xScale(d.Year) })
       .y(function (d) {
         if (d[selected_attr] >= 0) {
           return yScale(d[selected_attr]);
         }
         return yScale(0);
       });

     /************* Tooltips *********/
            var mouseoverLineTooltip = function (event, d) {
              d3.select(".line-tooltip").style("opacity", 1);
            }

            var mousemoveLineTooltip = function (event, d) {
              const [dx, dy] = d3.pointer(event, this);
              const actualX = xScale.invert(dx);
              const actualY = yScale.invert(dy);

              d3.select(".line-tooltip")
                // .html("<h6> Country : "+d[d.length - 1].Country+" <br> Region : "+d[d.length - 1]["World bank region"]+" <br> Value : "+actualY.toFixed(2)+" ("+actualX.getFullYear()+" )"+"</h6>")
                .html("<h6> Country : " + d[d.length - 1].Country + " <br> Region : " + d[d.length - 1]["World bank region"] + " <br>  Year : " + actualX.getFullYear() + " " + "</h6>")
                .style("opacity", 1)
                .style("padding", "5px")
                .style("top", (event.pageY - 40) + "px")
                .style("left", (event.pageX + 20) + "px");
            };

            var mouseleaveLineTooltip = function (d) {
              d3.select(".line-tooltip").style("opacity", 0);
            };

            // for circle and flag

            var mouseoverCircleFlagTip = function (event, d) {
              d3.select(".circleFlg-tooltip").style("opacity", 1);
            }

            var mousemoveCircleFlagtip = function (event, d) {
              d3.select(".circleFlg-tooltip")
                .html("<h6> Country: " + d[d.length - 1].Country + "</h6>") // can add avg here
                .style("opacity", 1)
                .style("top", (event.pageY - 40) + "px")
                .style("left", (event.pageX + 20) + "px");
            };

            var mouseleaveCircleFlagtip = function (d) {
              d3.select(".circleFlg-tooltip").style("opacity", 0);
            };  
     /************ Tooltips End*****************/
            

            const flagImage = { width : "40px", height: "30px",hoverWidth :"50px", hoverHeight:"40px", xShift : 15, yShift : 15};
            const country_name_margin = {left: 15, top: 2};
            const country_Flag_margin = {left: 15, top: 10};
            let negativeDuration = 300;
  
            
            graph_plot.selectAll('g')
            .data(customCombinedData, function(d,i) { 
              if(d != undefined && Array.isArray(d) && d.length > 0){ 
                  return d[0].Country; // adding unique key for mapping date+gender
               }
             })
            .join(
              enter => {
                const line_plot = enter.append('g')
                  .attr("class", "g-line");
                    
                // Add line in chart for each newly added country
                line_plot.append("path")
                  .attr("class", "line")
                  .attr('id', 'chart-line')
                  .attr('stroke', function (d) { return getLineColor(d) })
                  .attr('transform', `translate(${margin.left}, ${margin.top})`)
                  .style('fill', 'none')
                  .attr("stroke-width", lineStroke)
                  .style('opacity', isPlayAnime ? lineOpacity : 0)
                  .attr('d', function (d) {
                    return singleLine(d);
                  })
                  .on("mouseover", function (d) {
                    d3.selectAll('.g-line *')
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id != "country_name";
                        } else {
                          return this.id != "country-flag";
                        }
                      })
                      .style('opacity', otherLinesOpacityHover);

                    d3.select(this.parentNode)
                      .selectAll("*")
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id !== "country_name";
                        } else {
                          return this.id !== "country-flag";
                        }
                      })
                      .style('opacity', lineOpacityHover)
                      .style("cursor", "pointer");

                    mouseoverLineTooltip();
                  })
                  .on("mouseout", function (d) {
                    d3.selectAll(".g-line *")
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id != "country_name";
                        } else {
                          return this.id != "country-flag";
                        }
                      })
                      .style('opacity', lineOpacity);

                    d3.select(this.parentNode)
                      .selectAll("*")
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id !== "country_name";
                        } else {
                          return this.id !== "country-flag";
                        }
                      })
                      .style("cursor", "none");

                    mouseleaveLineTooltip();
                  })
                  .on("mousemove", mousemoveLineTooltip)
                  .transition()
                  .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                  .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                  .attrTween("stroke-dasharray", function () {
                    var totalLength = this.getTotalLength();

                    return function (t) {
                      return d3.interpolateString("0," + totalLength, totalLength + ",0")(t);
                    }
                  })
                  .on("interrupt", function () {
                    var totalLength = this.getTotalLength();
                    var dashGap = this.getAttribute("stroke-dasharray").split(",");
                    var dashLength = parseFloat(dashGap[0]);

                    d3.select(this)
                      .transition()
                      .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                      .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                      .attrTween("stroke-dasharray", function () {
                        return function (t) {
                          return d3.interpolateString(dashLength + "," + totalLength, totalLength + ",0")(t);
                        }
                      });
                  })
                  .on("end", function () {
                    if (!isPlayAnime) {
                      d3.select(this)
                        .transition()
                        .duration(initLineFadeInDuration)
                        .style('opacity', lineOpacity);
                    }

                  });

                     
                      
                // add circle in chart
                line_plot.append("circle")
                  .attr('transform', `translate(${margin.left}, ${margin.top})`)
                  .style('opacity', isPlayAnime ? lineOpacity : 0)
                  .attr("id", "circle")
                  .on("mouseover", function (d) {

                    d3.selectAll('.g-line *')
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id != "country_name";
                        } else {
                          return this.id != "country-flag";
                        }
                      })
                      .style('opacity', otherLinesOpacityHover);

                    d3.select(this.parentNode)
                      .selectAll("*")
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id !== "country_name";
                        } else {
                          return this.id !== "country-flag";
                        }
                      })
                      .style('opacity', lineOpacityHover)
                      .style("cursor", "pointer");


                    mouseoverCircleFlagTip();

                  })
                  .on("mouseout", function (d) {

                    d3.selectAll(".g-line *")
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id != "country_name";
                        } else {
                          return this.id != "country-flag";
                        }
                      })
                      .style('opacity', lineOpacity);

                    d3.select(this.parentNode)
                      .selectAll("*")
                      .filter(function () {
                        if (isShowFlag()) {
                          return this.id !== "country_name";
                        } else {
                          return this.id !== "country-flag";
                        }
                      })
                      .style("cursor", "none");

                    mouseleaveCircleFlagtip();

                  })
                  .on("mousemove", mousemoveCircleFlagtip)
                  .attr("r", circle_radius)
                  .style("fill", function (d) { return getLineColor(d) })
                  .attr("cx", 0)
                  .attr("cy", 0)
                  .attr("stroke-width", 2)
                  .attr("stroke", "black")
                  .transition()
                  .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait  : 0)
                  .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                  .attrTween("transform", function () {
                    var lineNode = d3.select(this.parentNode).select("path").node();
                    var pathLen = lineNode.getTotalLength();

                    return function (time) {
                      var circle_position = lineNode.getPointAtLength(time * pathLen);
                      return "translate(" + (circle_position.x + margin.left) + ',' + (circle_position.y + margin.top) + ")";
                    }
                  })
                  .on("interrupt", function () {

                    d3.select(this)
                      .transition()
                      .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                      .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                      .attrTween("transform", function () {
                        var lineNode = d3.select(this.parentNode).select("path").node();
                        var dashGap = lineNode.getAttribute("stroke-dasharray").split(",");
                        var gapLength = parseFloat(dashGap[1]);
                        var pathLen = gapLength;

                        return function (time) {
                          var circle_position = lineNode.getPointAtLength(time * pathLen);
                          return "translate(" + (circle_position.x + margin.left) + ',' + (circle_position.y + margin.top) + ")";
                        }
                      });
                  })
                  .on("end", function () {
                    if (!isPlayAnime) {
                      d3.select(this)
                        .transition()
                        .duration(initLineFadeInDuration)
                        .style('opacity', lineOpacity);
                    }
                  }); 
                       
                          
                          
                          
                // add text at the end of each line
                line_plot.append("text")
                  .attr('transform', `translate(${margin.left}, ${margin.top})`)
                  .attr("opacity", isShowFlag() || !isPlayAnime ? 0 : 1)
                  .attr("id", "country_name")
                  .style('font-size', countryFontSize)
                  .on("mousemove", function (d) {
                    if (!isShowFlag()) {
                      d3.selectAll('#country_name')
                        .style('opacity', otherLinesOpacityHover);

                      d3.select(this)
                        .style('opacity', lineOpacityHover)
                        .style('font-size', countryFontHoversize)
                        .style("cursor", "pointer");
                    }
                  })
                  .on("mouseout", function (d) {
                    if (!isShowFlag()) {
                      d3.selectAll("#country_name")
                        .style('opacity',lineOpacity );
                      d3.select(this)
                        .style('font-size', countryFontSize)
                        .style("cursor", "none");
                    }

                  })
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr('stroke', function (d) { return getLineColor(d) })
                  .text(function (d) { return d[d.length - 1].Country; })
                  .transition()
                  .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                  .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                  .attrTween("transform", function () {
                    var lineNode = d3.select(this.parentNode).select("path").node();
                    var pathLen = lineNode.getTotalLength();

                    return function (time) {
                      var text_position = lineNode.getPointAtLength(time * pathLen);
                      return "translate(" + (text_position.x + margin.left + country_name_margin.left) + ',' + (text_position.y + margin.top + country_name_margin.top) + ")";
                    }
                  })
                  .on("interrupt", function () {
                    if (!isShowFlag()) {
                      d3.select(this)
                        .transition()
                        .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                        .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                        .attrTween("transform", function () {
                          var lineNode = d3.select(this.parentNode).select("path").node();
                          var dashGap = lineNode.getAttribute("stroke-dasharray").split(",");
                          var gapLength = parseFloat(dashGap[1]);
                          var pathLen = gapLength;

                          return function (time) {
                            var circle_position = lineNode.getPointAtLength(time * pathLen);
                            return "translate(" + (circle_position.x + margin.left + country_name_margin.left) + ',' + (circle_position.y + margin.top + country_name_margin.top) + ")";
                          }
                        });
                    }
                  })
                  .on("end", function () {
                    if (!isPlayAnime && !isShowFlag()) {
                      d3.select(this)
                        .transition()
                        .duration(initLineFadeInDuration)
                        .style('opacity', 1);
                    }
                  }); 

                //adding flag-images                    
                line_plot.append('image')
                  .attr('transform', `translate(${margin.left}, ${margin.top})`)
                  .attr("id", "country-flag")
                  .attr("opacity", isShowFlag() && isPlayAnime ? 1 : 0)
                  .on("mouseover", function (d) {
                    if (isShowFlag()) {
                      d3.selectAll('#country-flag')
                        .style('opacity', otherLinesOpacityHover);

                      d3.select(this)
                        .style('opacity', lineOpacityHover)
                        .attr('width', flagImage.hoverWidth)
                        .attr('height', flagImage.hoverHeight)
                        .style("cursor", "pointer");

                      mouseoverCircleFlagTip();
                    }

                  })
                  .on("mouseout", function (d) {

                    if (isShowFlag()) {
                      d3.selectAll("#country-flag")
                        .style('opacity', lineOpacity);
                      d3.select(this)
                        .attr('width', flagImage.width)
                        .attr('height', flagImage.height)
                        .style("cursor", "none");

                      mouseleaveCircleFlagtip();
                    }

                  })
                  .on("mousemove", function (event, d) {
                    if (isShowFlag()) {
                      d3.select(".circleFlg-tooltip")
                        .html("<h6> Country: " + d[d.length - 1].Country + "</h6>")
                        .style("opacity", 1)
                        .style("top", (event.pageY - 45) + "px")
                        .style("left", (event.pageX + 20) + "px");
                    }
                  })
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr('width', flagImage.width)
                  .attr('height', flagImage.height)
                  .attr('xlink:href', function (d) {
                    if (flagCountryMap.has(d[d.length - 1].Country)) {
                      return flagCountryMap.get(d[d.length - 1].Country);
                    }
                  })
                  .transition()
                  .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                  .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                  .attrTween("transform", function () {
                    var lineNode = d3.select(this.parentNode).select("path").node();
                    var pathLen = lineNode.getTotalLength();

                    return function (time) {
                      var text_position = lineNode.getPointAtLength(time * pathLen);
                      return "translate(" + (text_position.x + margin.left + country_Flag_margin.left) + ',' + (text_position.y + margin.top - country_Flag_margin.top) + ")";
                    }
                  })
                  .on("interrupt", function () {

                    if (isShowFlag()) {
                      d3.select(this)
                        .transition()
                        .delay(isExistingPlot ? updateLineAnimationDur + updateLineAnimationWait : 0)
                        .duration(isPlayAnime ? playLineAnimationDuration : initLineDrawDuration)
                        .attrTween("transform", function () {
                          var lineNode = d3.select(this.parentNode).select("path").node();
                          var dashGap = lineNode.getAttribute("stroke-dasharray").split(",");
                          var gapLength = parseFloat(dashGap[1]);
                          var pathLen = gapLength;

                          return function (time) {
                            var circle_position = lineNode.getPointAtLength(time * pathLen);
                            return "translate(" + (circle_position.x + margin.left + country_Flag_margin.left) + ',' + (circle_position.y + margin.top - country_Flag_margin.top) + ")";
                          }
                        });
                    }
                  })
                  .on("end", function () {
                    // change opacity in the end
                    if (!isPlayAnime && isShowFlag()) {
                      d3.select(this)
                        .transition()
                        .duration(initLineFadeInDuration)
                        .style('opacity', lineOpacity); // or the normal opacity
                    }
                  });
                                         

              },
              update => {
                  update.selectAll(".line")
                    .on("mousemove", mousemoveLineTooltip)
                    .transition()
                    .delay(updateLineAnimationWait)
                    .duration(updateLineAnimationDur)
                    .attr('d', function (d) {
                      return singleLine(d);
                    });

                  update.select('#circle')
                    .transition()
                    .delay(updateLineAnimationWait)
                    .duration(updateLineAnimationDur)
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("cx", function (d) { return xScale(d[d.length - 1].Year); })
                    .attr("cy", function (d) {
                      if (d[d.length - 1][selected_attr] >= 0) {
                        return yScale(d[d.length - 1][selected_attr]);
                      }
                      return yScale(0);
                    });

                  update.select('#country_name')
                    .transition()
                    .delay(updateLineAnimationWait)
                    .duration(updateLineAnimationDur)
                    .attr('transform', `translate(${margin.left + country_name_margin.left}, ${margin.top + country_name_margin.top})`)
                    .attr("x", function (d) { return xScale(d[d.length - 1].Year); })
                    .attr("y", function (d) {
                      if (d[d.length - 1][selected_attr] >= 0) {
                        return yScale(d[d.length - 1][selected_attr]);
                      }
                      return yScale(0);
                    });

                  update.select('#country-flag')
                    .transition()
                    .delay(updateLineAnimationWait)
                    .duration(updateLineAnimationDur)
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("x", function (d) { return xScale(d[d.length - 1].Year) + flagImage.xShift; })
                    .attr("y", function (d) {
                      if (d[d.length - 1][selected_attr] >= 0) {
                        return yScale(d[d.length - 1][selected_attr]) - flagImage.yShift;
                      }
                      return yScale(0) - flagImage.yShift;
                    });
              },
              exit => {

                exit.call(exit => {
                  exit.selectAll('.g-line *') // remove all element in chart: line , circle, text, flag
                    .transition()
                    .duration(deleteLineAnimDuration)
                    .ease(d3.easeLinear)
                    .style('opacity', 0)
                    .end()                  // after the transition ends,
                    .then(() => {           // remove the elements in the
                      exit.remove();      // exit selection
                    });
                });

              }

            );
            
       
        // draw both axis
        drawAxis(graph_plot, xScale, yScale);
        // change y-axis label for update
        changeYaxisLabel(selected_attr);
        
    }else{
        console.log('drawMultiLineChart() :: golbal dev. data is undefined ');
    }// data unidefined check

   
 }


function isShowFlag() {
  let toggleInputControl = d3.select("#show_flag_toggle");
  return toggleInputControl.property("checked");
}

function addLineToolTip() {
  // remove older tooltip
  d3.select('.line-tooltip').remove();

  d3.select("#globalDev_div")
    .append("div")
    .style("opacity", 0)
    .attr("class", "line-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .attr('width', "100px")
    .attr('height', "100px")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");
}

function addCircleandFlagTip() {
  // remove older tooltip before adding new
  d3.select('.circleFlg-tooltip').remove();

  d3.select("#globalDev_div")
    .append("div")
    .style("opacity", 0)
    .attr("class", "circleFlg-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .attr('width', "100px")
    .attr('height', "100px")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");
}


 /*Use this function for drawing axis on the chart*/
function drawAxis(plot, xScale, yScale) {
  plot.select(".y-axis").remove();
  plot.select(".x-axis").remove();

  // Draw x and y axis using given scale
  plot.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .transition()
    .duration(updateLineAnimationDur)
    .call(d3.axisLeft(yScale));

  plot.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${margin.left},${margin.top + innerHeight})`)
    .call(d3.axisBottom(xScale));

}

function changeYaxisLabel(y_axis_label){
  const axis_label_plt = d3.select('#axis-labels');
  axis_label_plt.select('.y_axis_label')                  
                  .text(y_axis_label);
}

function addLabelsOnAxis(x_axis_label, y_axis_label) {

  // remove previous labels as well
  const label_plot = d3.select('#gd_svg')
    .append('g')
    .attr('transform', `translate(${margin.left / 1.5}, ${margin.top})`)
    .attr('id', 'axis-labels');


  label_plot.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dy', '-45')
    .attr('x', -innerHeight / 2)
    .style('text-anchor', 'middle')
    .attr('class', 'y_axis_label')
    .attr("font-weight", text_weight)
    .style("font-size", label_font_size)
    .text(y_axis_label);

  label_plot.append('text')
    .attr('transform', `translate(${innerWidth / 2},${innerHeight + 45})`)
    .style('text-anchor', 'middle')
    .attr('class', 'x_axis_label')
    .attr("font-weight", text_weight)
    .style("font-size", label_font_size)
    .text(x_axis_label);
}

function selectRandomAttributes() {
  // select static first 10 attribute (make it random)
    const gd_attribute = [];
    let exceptAttr = ['Country', 'Year']
    if (globalDevData != undefined) {
      const num_attribute = 10;
      const n_attribute = globalDevData['columns'].length;
      do {
        const randomNumber = Math.floor(Math.random() * n_attribute); // as year and country columns are present at 0th and 1st index to we are adding +1
        if (!gd_attribute.includes(globalDevData['columns'][randomNumber]) && !exceptAttr.includes(globalDevData['columns'][randomNumber])) {
          gd_attribute.push(globalDevData['columns'][randomNumber]);
        }

      } while (gd_attribute.length < num_attribute);
    } else {
      console.log('Global development data is not available to select random attributes.')
    }
    return gd_attribute;
}

 function addMultiSelectPrompt(){      
      addGroupClassesForSelection('region-selector');
     
      addOptions("groupregion-selector", world_region);

      // Initialize the dropdown
      initDropdown();

      // Initialize the select all options in each group
      initSelectAllOptions();

      addIndividualSelectionHandler();

      d3.select("#option-Sub-Saharan\\ Africa")
            .property("checked", true);
 }

function addGroupClassesForSelection(groupId) {
    const dropdown = d3.select('#region-dropdown');
    // Create header with select all checkbox for Group 1
    var group1Header = dropdown.append("div")
      .attr("class", "dropdown-header");

    group1Header.append("input")
      .attr("type", "checkbox")
      .attr("class", "group-check-all")
      .attr("data-group", "group" + groupId)
      .style("width", "1.5rem")
      .style("height", "1.3rem")
      .attr("id", "group" + groupId + "check-all");

    group1Header.append("label")
      .attr("for", "group" + groupId + "check-all")
      .text("Select / Deselect All")
      .style("font-size", "20px")

    // Create divider between Group 1 and other groups
    dropdown.append("div")
      .attr("class", "dropdown-divider");

    // Create container for Group 1 options
    var group1Container = dropdown.append("div")
      .attr("class", "dropdown-group")
      .attr("id", "group" + groupId);
}


function addOptions(group, options) {
  d3.select("#" + group)
    .selectAll("label")
    .data(options)
    .enter()
    .append("label")
    .style("font-size", dropdown_option_label_size)
    .style("font-weight", "bold")
    .style("color",  function (d) { return  d.color;})
    .attr("class", group + "-option dropdown-item")
    .html(function (d) {
      return '<input id="option-' + d.reg + '" type="checkbox" style="margin-right:10px; width: 1.5rem;height: 1.3rem;" value="' + d.reg + '"> ' + d.reg;
    });

}

// Initialize the dropdown
function initDropdown() {
  d3.selectAll(".dropdown-menu a").on("click", function() {
    d3.event.stopPropagation();
  });
}

// Initialize the select all options in each group
function initSelectAllOptions() {

  d3.selectAll(".dropdown-header input[type='checkbox']").on("click", function () {
    var dropdown_header = d3.select('.dropdown-header');
    var group = d3.select(this).attr("data-group");
    console.log('group:: initSelectAllOptions() onChnage');
    if (this.checked) {
      selectAllInGroup(group);
      dropdown_header.select('label')
        .text("Deselect All");
      //call transition here;

    } else {
      deselectAllInGroup(group);
      dropdown_header.select('label')
        .text("Select All");
      // remove on de-select all
    }

    //call drawMultiline()
    drawMultiLineChart(mergedData, false);

  });
}

function selectAllInGroup(group) {
  d3.selectAll("#" + group + " input[type='checkbox']").property("checked", true);
}

// Deselect all options in a group
function deselectAllInGroup(group) {
  d3.selectAll("#" + group + " input[type='checkbox']").property("checked", false);
}

function addIndividualSelectionHandler(){
  d3.select('#groupregion-selector')
  .on('change', function() {
    // call animation
    d3.select('.dropdown-header label')
      .text("Select / Deselect All");

    d3.select('.group-check-all')
      .property("checked", false);
    
    drawMultiLineChart(mergedData, false);
  });
}

function getSelectedCountriesCheckBox(){
  return checkedValues = d3.selectAll('#groupregion-selector input[type=checkbox]:checked')
                          .nodes()
                          .map(function(n) { return n.value; });
}
