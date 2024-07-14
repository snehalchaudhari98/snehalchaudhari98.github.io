let derivedDinosourData = [];
const margin = { top: 40, bottom: 20, right: 5, left: 40 };
const axismargin = { top: 5, bottom: 5, right: 10, left: 10 };
var innerHeight;
var innerWidth;
const circle_opacity = 0.71;
let first_selected_filter;
let filtered_dinosour_data;
let all_diet_filtered_dinosour_data;
let line_anim_duration = 400;
let axis_anim_duration = 300;
let first_circle_anim_dur = 1500;
let second_circle_anim_dur = 3500;
let conn_line_color = "#90CDC3 ";

let derived_diet_angles = [];
var custom_derived_species_country = [];
let y_axis_label = "Average Height";
const text_weight = 450;
let y_axis_buffer = 10;

const ring_colors = ["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f"];
const species_type = ["sauropod", "large theropod", "small theropod", "euornithopod", "armoured dinosaur"];

const attributeforselection = ["lived_in", "period"];

const circle_color = { herbivorous: "#37306B", carnivorous: "#D27685" }; // good

const diet = ["Herbivorous", "Carnivorous", "line : Average Height Gap"];
const diet_color = [circle_color.herbivorous, circle_color.carnivorous, conn_line_color];
// 

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {


    Promise.all([d3.csv('data/dinosour_data.csv')])
        .then(function (values) {
            console.log('loaded dinosour_data.csv ');
            dinosour_data = values[0];


            dinosour_data.forEach(entry => {
                Object.keys(entry).forEach(function (s) {
                    if (s == "length") {
                        entry[s] = +entry[s].slice(0, -1); // converting attribute value to numeric format
                    } else if (s == "period") {
                        if (entry[s] && typeof entry[s] === 'string') {

                            const words = entry[s].split(' ');
                            const trimOut = words.slice(0, 2).join(' '); // add length > 2 check here
                            entry[s] = trimOut;
                        }
                    }
                });

            });


              



            addFilterbyAttribute(attributeforselection);
            filtered_dinosour_data = dinosour_data.filter(function (d) {
                return d.diet == "herbivorous" || d.diet == "carnivorous";
            });


            // filterDataAndPlot(); // remove comment


            // PART 2
            let derived_data_diet_angles = deriveDataForRingPLot(dinosour_data);
            addPlayButtonSelector(derived_data_diet_angles);
            // drawGrid(derived_data_diet_angles); 


            // Create an IntersectionObserver instance
            const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
            if (entry.isIntersecting) {
                    if(entry.target.id == "section2"){
                        filterDataAndPlot(); // remove comment
                    }else  if(entry.target.id == "section3"){   
                        drawGrid(derived_data_diet_angles); 

                    }
                    }
                });
            }, { threshold: 0.5 });
            
            // Observe each section
            const sectionsList = document.querySelectorAll(".section1, .section2, .section3, .section4");
            sectionsList.forEach((section) => {
                sectionObserver.observe(section);
            });
    


        });

});



function filterDataAndPlot() {

    first_selected_filter = d3.select('#dn_attribute').property('value');



    groupMap = createGroupedData(filtered_dinosour_data, first_selected_filter);

    
    let derivedDinosourDataMap = createReqSpecDataSet(groupMap); 

    // drawBubbleChartForCountry(derivedDinosourDataMap);
    drawBubbleChart(derivedDinosourDataMap); // REMOVE COMMENT

}



function addFilterbyAttribute(selectedAttributes) {
    const controlPanelDiv = d3.select('#control-panel-1');

    const attributeSel = controlPanelDiv.select('#dn_attribute');

    attributeSel.selectAll("option")
        .data(selectedAttributes, opt => opt)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .property("value", (opt) => opt);


    attributeSel.on("change", (event) => {
        // on value change of selection draw the chart
        filterDataAndPlot();


    });
}


const y_lable_buffer = 5;

function addLabelsOnAxis(svg) {

    d3.select("#label_plot_bubble").remove();

    const label_plot = svg.append('g')
            .attr('id', 'label_plot_bubble')
            .attr('transform', `translate(${margin.left + y_lable_buffer}, ${margin.top})`);


    label_plot.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '-45')
        .attr('x', -innerHeight / 2)
        .style('text-anchor', 'middle')
        .attr('class', 'y_axis_label')
        .attr("font-weight", text_weight)
        // .attr('font-size',10)
        .text(y_axis_label);

    label_plot.append('text')
        .attr('transform',`translate(${innerWidth/2},0)`)
        .style('text-anchor','middle')
        .attr('class', 'x_axis_label')
        .attr("font-weight", text_weight)
        .text(function(d){
            if(first_selected_filter == 'lived_in'){
                return 'Country';
            }

            return first_selected_filter;
            
        });
}

function drawBubbleChart(derivedDinosourDataMap) {
    //Get a reference to the SVG and get its dimensions
    const svg = d3.select('#bubble_chart');

    const bubble_label = d3.select("#cp1-lable");

    drawBubbleLegendsOnPlot(bubble_label);



    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');


    innerWidth = width - margin.left - margin.right;
    innerHeight = height - margin["top"] - margin.bottom;

    let groupAttrKeys = [];
    let allCountriesAvgData = [];


    // we can sort based on increasing number of harbivour
    derivedDinosourDataMap.forEach((recordValues, key) => {

        groupAttrKeys.push(recordValues[0].group_key); 
        allCountriesAvgData.push(Array.from(recordValues.values()));
    });


    groupAttrKeys.sort();


    // d => Math.random() * width
    var xScale = d3.scaleBand()
        .range([0, innerWidth])
        .domain(groupAttrKeys);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(allCountriesAvgData, function (d) {
            return d3.max(d, function (k) {
                return k['avgLength'];
            })
        }) + 1]) // data space // add extra space
        .range([innerHeight, 0]); // pixel space

    let maxCount = d3.max(allCountriesAvgData, function (d) {
        return d3.max(d, function (k) {
            return k['count'];
        });
    });


    // define radius scale
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(allCountriesAvgData, function (d) {
            return d3.max(d, function (k) {
                return k['count'] * 2;
            });
        })])
        .range([0, 100]);


        // ADD TOOLTIP
    // add tooltip for bubble chart
    d3.select(".tooltip").remove();

    // check older tooltip removal afterwards
    d3.select("#dataplot_div")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        // .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "2px")
        .style("font-size", '10px')
        .style("position", "absolute")
        .style("border", "1px solid black");

    var Tooltip = d3.select(".tooltip")

    var mousemove = function (event, d) {
        Tooltip.style("top", (event.pageY - 40) + "px")
            .style("left", (event.pageX + 20) + "px");
    };

    var mouseleave = function (d) {
        Tooltip.style("opacity", 0);
    };

         // ADD TOOLTIP - END

         // remove previous plot
    d3.select('#bubbleplot_grp').remove();

    let bubble_plot = svg.append('g')
        .attr('id', 'bubbleplot_grp')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // plot graph
    const bubbles_node = bubble_plot.selectAll("circle")
        .data(allCountriesAvgData);


        // draw first circle
    let h_circle = bubbles_node.enter()
        .append("circle")
        .on("mouseover", function (event, d) {
            Tooltip.style("opacity", 1)
                .html("<i><b><p> Key (" + first_selected_filter + ") :" + d[0].group_key + "<br> Diet : " + d[0].diet + "<br> Average Height : " + d[0].avgLength.toFixed(2) + " <br></p></b></i>");

        })
        .on("mousemove", mousemove)
        .on("mouseout", mouseleave)
        .attr("cx", function (d) { return xScale(d[0].group_key) })
        .attr("cy", function (d) { return yScale(d[0].avgLength) }) // Position the circles based on the index of the radius in the array
        .transition()
        .duration(first_circle_anim_dur)
        .attr("r", (d => radiusScale(d[0].count)))// Set the radius of the circle based on the index of the radius in the array
        .style('opacity', circle_opacity)
        .attr('id', 'firstCircle')
        .attr("fill", function (d) {   
            return circle_color[d[0].diet];
        });

  // draw second circle
    let c_circle = bubbles_node.enter()
        .filter(function (d) {
            return d.length > 1;
        })
        .append("circle")
        .on("mouseover", function (event, d) {
            Tooltip.style("opacity", 1)
                .html("<i><b><p>  Key (" + first_selected_filter + ") :" + d[1].group_key + "<br> Diet : " + d[1].diet + "<br>  Average Height : " + d[1].avgLength.toFixed(2) + " </p></b></i>");
        })
        .on("mousemove", mousemove)
        .on("mouseout", mouseleave)
        .attr("cx", function (d) { return xScale(d[1].group_key) })
        .attr("cy", function (d) { return yScale(d[1].avgLength) }) // Position the circles based on the index of the radius in the array
        .transition()
        .duration(second_circle_anim_dur)
        .attr("r", (d => radiusScale(d[1].count)))// Set the radius of the circle based on the index of the radius in the array
        .style('opacity', circle_opacity)
        .attr('id', 'secondCircle')
        .attr("fill", function (d) {     
            return circle_color[d[1].diet];
        });


        // draw connection line
    let joining_line = bubbles_node.enter()
        .filter(function (d) {
            return d.length > 1;
        })
        .append("line")
        .attr("class", "center_conn")
        .style('opacity', 0)
        .attr("x1", function (d) { return xScale(d[0].group_key); })
        .attr("y1", function (d) { return yScale(d[0].avgLength); })
        .attr("x2", function (d) { return xScale(d[1].group_key); })
        .attr("y2", function (d) { return yScale(d[1].avgLength); })
        .style("stroke-width", 3)
        .on("mouseover", function (event, d) {
            Tooltip.style("opacity", 1)
                .html("<i><b><p>Country :" + d[0].group_key + " </p>Height Gap : " + Math.abs(d[0].avgLength - d[1].avgLength).toFixed(2) + "</p><b></i>");

        })
        .on("mousemove", mousemove)
        .on("mouseout", mouseleave)
        .transition()
        .delay(first_circle_anim_dur)
        .duration(100) 
        .attr("stroke", conn_line_color)
        .on("end", function () {
            d3.select(this)
                .transition()
                .delay(first_circle_anim_dur)
                .duration(800)
                .style('opacity', 0.8);

        });

    // Add axis to plot
    bubble_plot.append('g')
        .attr('transform', `translate(-10,0)`) // move to left as its overlapping
        .transition()
        .duration(axis_anim_duration)
        .call(d3.axisLeft(yScale));


    bubble_plot.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .transition()
        .duration(axis_anim_duration)
        .call(d3.axisBottom(xScale))
        .selectAll("text")                   // If you want to rotate the axis text,
        .style("text-anchor", "end")     // select it with the selectAll call and
        .attr("dx", "-10px")             // and slightly shift it (using dx, dy)
        .attr("dy", "0px")               // and then rotate it.
        .attr("transform", "rotate(-25)");;

    addLabelsOnAxis(svg);

}

function addPlayButtonSelector(derived_data_diet_angles) {
    var button =
        d3.select("#play-button")
            .style("display", "inline-block")
            .style("cursor", "pointer")
            .on("click", function (d) {
                drawGrid(derived_data_diet_angles); // remove comment
            });
}



function createReqSpecDataSet(dinosourMap) {
    // clear previous part
    derivedDinosourData = [];

    dinosourMap.forEach((mapValues, keys_group_attr) => {
        let mapOnDiet = d3.group(mapValues, d => d.diet);

        let valueMap = Array.from(mapOnDiet.values());

        valueMap.forEach((diet_group) => {
          
            const totalLength = diet_group.reduce((sum, dinosaur) => sum + dinosaur.length, 0);
            const averageLength = totalLength / diet_group.length;

            derivedDinosourData.push({
                group_key: keys_group_attr,
                diet: diet_group[0].diet,// diet based distribution
                avgLength: averageLength,
                count: diet_group.length
            });
        });

    });// country map



    derivedDinosourDataMap = d3.group(derivedDinosourData, d => d.group_key);

    return derivedDinosourDataMap; 
}



function createGroupedData(dinosour_data, group_attr) {
    var groupMap;
    if (dinosour_data != undefined) {

        groupMap = d3.group(dinosour_data, d => d[group_attr]);
    }
    return groupMap;
}

function categorizePeriodFurther(dinosour_data) {
    const pattern = '/^\D+\s-\s/'; // matches non-digit characters followed by a hyphen and a space

    const updateLineAnimationDur = dinosour_data.map(function (d) {


        if (d.period && typeof d.period === 'string') {

            const words = d.period.split(' ');
            const trimOut = words.slice(0, 2).join(' '); // add length > 2 check here
            // console.log('trimOut : ',trimOut);
            return trimOut;
        }
        return '';
    });

}


function deriveDataForRingPLot(dinosour_data) {
    var dietBaedGroupMap;

    if (dinosour_data != undefined) {
        dietBaedGroupMap = d3.group(dinosour_data, d => d.lived_in, d => d.type);


        var derived_data_info = {};


        dietBaedGroupMap.forEach((countryValues, countryKey) => {

            derived_data_info = {};
            if (countryKey != "") {
                let individualCountryStats = Array(5).fill(null).map((_, i) => 0);
                derived_data_info['country'] = countryKey;

                countryValues.forEach((dietValues, key) => {
                    let keyLen = dietValues.length;
                  

                    if (key == "sauropod") {
                        individualCountryStats[0] = keyLen;
                        derived_data_info[key] = keyLen;
                    } else if (key == "large theropod") {
                        individualCountryStats[1] = keyLen;
                        derived_data_info[key] = keyLen;
                    } else if (key == "small theropod") {
                        individualCountryStats[2] = keyLen;
                        derived_data_info[key] = keyLen;
                    } else if (key == "euornithopod") {
                        individualCountryStats[3] = keyLen;
                        derived_data_info[key] = keyLen;
                    } else if (key == "armoured dinosaur") {
                        individualCountryStats[4] = keyLen;
                        derived_data_info[key] = keyLen;
                    }

                });

                let pie = d3.pie()
                    .startAngle(-Math.PI / 6)
                    .endAngle((5 / 3) * Math.PI) // 300 degree
                    .value(d => d);

                // Generate the angles for each part of the arc
                let angles = pie(individualCountryStats);


                custom_derived_species_country.push(derived_data_info);
                derived_diet_angles.push(angles);
            }


        });
    }

    // get 30 entires only
    custom_derived_species_country = custom_derived_species_country.slice(0, 30);

    return { 'derived_diet_angles': derived_diet_angles };
}


function drawLegendsOnPlot(svg) {
    const legendX = 100,
        legendY = 10;

    // Add legends on new 'g' element
    const label_g = svg.append('g');
    // .attr('transform', `translate(${innerWidth-legendX}, ${legendY})`);

    // create a legends items from list            
    label_g.selectAll("mydots")
        .data(ring_colors)
        .enter()
        .append("circle")
        .attr('y', function (d, i) { return 25 + i * 25 })
        .attr('r', 10)
        .attr('transform', (d, i) => `translate(25,${i * 25 + 20})`)
        .attr('fill', function (d, i) { return ring_colors[i] });

    label_g.selectAll("mylabels")
        .data(species_type)
        .enter()
        .append("text")
        .attr("y", function (d, i) { return 25 + i * 25 }) // 25 is the distance between two ledgend
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .attr("font-weight", 500)
        .attr('transform', `translate(40, 0)`)
        .style("alignment-baseline", "middle");
}


function drawBubbleLegendsOnPlot(svg) {

    // Add legends on new 'g' element
    const label_g = svg.append('g');

    // create a legends items from list            
    label_g.selectAll("mydots")
        .data(diet_color, d => d)
        .enter()
        .append("rect")
        .attr('y', function (d, i) { return i * 30 })
        .attr('width', 20)
        .attr('height', 20)
        .attr('transform', `translate(10, 10)`)
        .attr('fill', function (d, i) {  return d; });

    label_g.selectAll("mylabels")
        .data(diet, d => d)
        .enter()
        .append("text")
        .attr("y", function (d, i) { return 25 + i * 30 }) // 25 is the distance between two ledgend
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .attr("font-weight", 500)
        .attr('transform', `translate(40, 0)`)
        .style("alignment-baseline", "middle");
}


function drawGrid(derived_data) {

    let derived_data_diet_angles = derived_data.derived_diet_angles;
    let num_country = 30;


    // Define the SVG element
    const svg = d3.select("#ring_plot");
    const lable_sec = d3.select("#cp2-lable");
    const ringplot_div = d3.select("#ringplot_div");

    drawLegendsOnPlot(lable_sec);

    // Define the width and height of the SVG element
    const width = +svg.style('width').replace('px', '');
    const height = +svg.style('height').replace('px', '');
    // Define the number of columns and rows in the grid
    const numCols = 6;
    const numRows = 5;

    const height_sqr = height / numRows;
    const width_sqr = width / numCols;

    // Define the data for the arc
    // define radius
    const radius = Math.min(height_sqr / 2, height_sqr / 2) - 10;
    const dinosaur_img = { height: radius / 1.2, width: radius / 2 };

    // Define the x and y scales for the grid lines
    let xgridScale = d3.scaleLinear()
        .domain([0, numCols])
        .range([0, width]);

    let ygridScale = d3.scaleLinear()
        .domain([0, numRows])
        .range([0, height]);

    // Define the arc generator
    const diskArc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius)
        .padAngle(0.03)
        .cornerRadius(10);


    // add tooltip
    d3.select(".rings_tooltip").remove();

    // check older tooltip removal afterwards
    ringplot_div.append("div")
        .style("opacity", 0)
        .attr("class", "rings_tooltip")
        .style("background-color", "#f2f2f2")
        // .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "2px")
        .style("position", "absolute")
        .style("border", "1px solid black");


    var RingTooltip = d3.select(".rings_tooltip");



    d3.select('#disk_plot').remove();
    let disk_plot = svg.append('g')
        .attr('id', 'disk_plot');


    let x_buffer = 30;

    let divident = Math.max(numCols, numRows);
    let ringtext = '13px';

    // add text i middle of each ring
    disk_plot.selectAll(".ring-circle-text")
        .data(custom_derived_species_country)
        .enter()
        .append('text')
        .attr("class", "ring-circle")
        .attr("transform", function (d, i) {
            let top_x = xgridScale((i % divident));
            let top_y = ygridScale(parseInt(i / divident));
            return `translate(${top_x + width_sqr / 2 - x_buffer}, ${top_y + height_sqr / 2})`;
        })
        .attr("id", "ceramic_circle")
        .attr("font-weight", 550)
        .style("font-size", ringtext)
        .transition()
        .duration(1500)
        // .delay((d, j) => j*1000)
        .delay((d, j) => parseInt(j / numCols) * 1000)
        .text(function (d) {
            return d.country;
        });



    // loop over to plot 30 countries rings
    for (let i = 0; i < num_country; i++) {
        let ring = disk_plot.append('g').attr('id', 'color-rings');

        // first draw ring arcs
                let dinosaurRings = ring.selectAll('.ring-color')
                    .data(derived_data_diet_angles[i])
                    .join("path")
                    .attr("class", (d, j) => "color-arc" + j)
                    .attr("d", diskArc)
                    .style('opacity', 0)
                    .attr("fill", function (d, j) {
                        // console.log('color arc ', d, ' idx ', i);
                        return ring_colors[j];
                    })
                    .transition()
                    .duration(1000)
                    .delay((d, j) => parseInt(i / numCols) * 1000)
                    // .delay((d, j) =>i*1000)
                    .style('opacity', 1)
                    .attrTween("d", function (d) {
                        const start = { startAngle: d.startAngle, endAngle: d.startAngle };
                        const interpolator = d3.interpolate(start, d);
                        return function (t) {
                            return diskArc(interpolator(t));
                        };
                    });




                    // add dinosaur image
                    ring.append("image")
                        .attr('id', 'dinosaur_img')
                        .attr("xlink:href", 'img/center_dn.png')
                        .style('opacity', 0)
                        .attr("x", function (d, j) {
                            return xgridScale((j % divident)) - width_sqr / 3;
                        })
                        .attr("y", function (d, j) { return ygridScale(parseInt(j / divident)) - height_sqr / 2; })
                        .attr("width", dinosaur_img.width)
                        .attr("height", dinosaur_img.height)
                        .on("mouseover", function (event, d) {
                            let htmlData = getHtmlStringFromObj(custom_derived_species_country[i]);
                            RingTooltip.style("opacity", 1)
                                .style("font-size", '10px')
                                .html(htmlData);
                        })
                        .on("mousemove", function (event, d) {
                            RingTooltip.style("top", (event.pageY - 40) + "px")
                                .style("left", (event.pageX + 20) + "px");
                        })
                        .on("mouseout", function (d) {
                            RingTooltip.style("opacity", 0);
                        })
                        .transition()
                        .duration(1200)
                        // .delay((d, j) => i*1000*1.03)
                        .delay((d, j) => parseInt(i / numCols) * 1000)
                        .style('opacity', 1);

                    // shift the whole rings
                    ring.attr("transform", function (k) {
                        let top_x = xgridScale((i % divident));
                        let top_y = ygridScale(parseInt(i / divident));
                        return `translate(${top_x + width_sqr / 2}, ${top_y + height_sqr / 2})`;
                    });

    }

}


function getHtmlStringFromObj(obj) {
    let htmlData = "<p><i>";
    for (let key in obj) {
        htmlData += "" + key + " : " + obj[key] + "<br>";
    }

    htmlData += "</i></p>";
    return htmlData;
}

