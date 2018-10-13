const deepSpace9Characters = [
  'Kira',
  'O\'Brien',
  'Cisco',
  'Dax',
  'Bashir'
];

d3.select('ul')
  .selectAll('li')
  .data(deepSpace9Characters)
  .enter()
  .append('li')
  .text(function(d) { return d; });


  // Pie chart

var dataset = [80, 100, 56, 120, 180, 30, 40, 120, 160];

var svgBarWidth = 700;
var svgBarHeight = 300
var barPadding = 20;
var barWidth = (svgBarWidth / dataset.length);

const barYScale = d3.scaleLinear()
  .domain([0, d3.max(dataset)])
  .range([0, svgBarHeight-15]);


var barSvg = d3.select('.bar-chart')
   .attr("width", svgBarWidth)
   .attr("height", svgBarHeight);

var barChart = barSvg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("y", function(d) {
        return svgBarHeight - barYScale(d)
   })
   .attr("height", function(d) {
       return barYScale(d);
   })
   .attr("width", barWidth - barPadding)
   .attr("transform", function (d, i) {
       var translate = [barWidth * i, 0];
       return "translate("+ translate +")";
   })
   .on('click', function(value, i, container) {
     console.log(container[i]);
     console.log(value)
     container[i].height = value + 20;
   });

const barText = barSvg.selectAll('text')
    .data(dataset)
    .enter()
    .append('text')
    .text(function(d) {
      return d
    })
    .attr('y', function(d) {
      return svgBarHeight - barYScale(d) - 2
    })
    .attr('x', function(d, i) {
      return barWidth * i;
    })
    .attr("fill", "#A64C38");

// axis charst

const svgAxisHeight = 500;
const svgAxisWidth = 800;

const axisSvg = d3.select('.axis-chart')
  .attr('width', svgAxisWidth + 100)
  .attr('height', svgAxisHeight + 40)

var xScale = d3.scaleLinear()
    .domain([0, d3.max(dataset)])
    .range([0, svgAxisWidth]);

var axisBarScale = d3.scaleLinear()
    .domain([0, d3.max(dataset)])
    .range([svgAxisHeight, 0]);

var x_axis = d3.axisBottom()
    .scale(xScale);

var y_axis = d3.axisLeft()
    .scale(axisBarScale);

axisSvg.append("g")
    .attr("transform", "translate(50, 10)")
    .call(y_axis);

var xAxisTranslate = svgAxisHeight + 10;

axisSvg.append("g")
    .attr("transform", "translate(50, " + xAxisTranslate  +")")
    .call(x_axis);

// draw

var svgDrawWidth = 600;
var svgDrawHeight = 500;

var drawSvg = d3.select(".draw")
   .attr("width", svgDrawWidth)
   .attr("height", svgDrawHeight)
   .attr("class", "svg-container");

var line = drawSvg.append("line")
   .attr("x1", 50)
   .attr("x2", 400)
   .attr("y1", 20)
   .attr("y2", 50)
   .attr("stroke", "red")
   .attr("stroke-width", 5)

var rect = drawSvg.append("rect")
   .attr("x", 100)
   .attr("y", 100)
   .attr("width", 200)
   .attr("height", 100)
   .attr("fill", "#9B95FF")
   .on('click', function(e, i, nodeList) {
     rect.attr('width', 100)
     drawText.text('')
   })

const drawText = drawSvg.append('text')
  .text('click me!')
  .attr("x", 150)
  .attr("y", 150)


var circle = drawSvg.append("circle")
   .attr("cx", 200)
   .attr("cy", 300)
   .attr("r", 80)
   .attr("fill", "#7CE8D5");

// Pie chart

var data = [
    {"platform": "Android", "percentage": 40.11},
    {"platform": "Windows", "percentage": 36.69},
    {"platform": "iOS", "percentage": 13.06}
];

var svgWidth = 400;
var svgHeight = 400;
var padding = 40;
var radius =  Math.min(svgWidth - padding, svgHeight - padding) / 2;

var pieSvg = d3.select('.pie-chart')
    .attr("width", svgWidth)
    .attr("height", svgHeight);

function getTranslateString(x, y) {
  if (y === undefined){
    y = x;
  }
  return "translate(" + x + "," + y + ")"
}

//Create group element to hold pie chart
var g = pieSvg.append("g")
    .attr("transform", getTranslateString(radius + padding/2)) ;


const myColors = ['green', 'blue', 'orange', 'yellow', 'silver'];
console.log(d3.schemeCategory10)
console.log(d3.schemeAccent)



var color = d3.scaleOrdinal(myColors)

// Different starting points...
var color2 = d3.scaleOrdinal()
  .domain(data)
  .range(myColors)


var pie = d3.pie()
  .value(function(d) {
     return d.percentage;
   });

var path = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius / 2);

var path2 = d3.arc()
    .outerRadius(radius/2)
    .innerRadius(0);

var arc = g.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g");

arc.append("path")
    .attr("d", path)
    .attr("fill", function(d) {
      return color(d.data.percentage);
    })
    .style('stroke', 'white')

arc.append('path')
  .attr('d', path2)
  .attr("fill", function(d) {
    return color2(d.data.percentage);
  })
  .style('stroke', 'white')


var label = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius / 2.5);

arc.append("text")
    .attr("transform", function(d) {
        return "translate(" + label.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d) { return d.data.platform+":"+d.data.percentage+"%"; });

// curve cardinal

var points = [
  [0, 0],
  [20, 60],
  [100, 100],
  [50, 50],
  [40, 200],
  [55, 245]
];



var pieSvg = d3.select('.curve-cardinal')
    .attr("width", svgWidth)
    .attr("height", svgWidth);

var curveLineGenerator = d3.line().curve(d3.curveCardinal);

var pathData = curveLineGenerator(points)

pieSvg.append('path')
  .attr('d', pathData)
  // attr can be replaced for style...
  .style('fill', 'none')
  .style('stroke', 'blue')
  .style('stroke-width', 4)
  .attr('transform', getTranslateString(50, 50))


// Tree ***
var treeData =
  {
    "name": "Top Level",
    "children": [
      {
		"name": "Level 2: A",
        "children": [
          { "name": "Son of A",
          children: [
            { name: "level 3: A" },
            { name: "level 3: B" },
            { name: "level 3: C" },
            { name: "level 3: d" },
            { name: "level 3: e " },
          ]
         },
          { "name": "Daughter of A",
            children: [
              {name: 'FMLs'}
            ]
         },
          { "name": "Daughter of B"},
        ]
      },
      { "name": "Level 2: B" },
      { "name": "Level 2: C" }
    ]
  };

// set the dimensions and margins of the diagram
var margin = {top: 40, right: 90, bottom: 50, left: 90},
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// declares a tree layout and assigns the size
var treemap = d3.tree()
    .size([width, height]);

//  assigns the data to a hierarchy using parent-child relationships
var nodes = d3.hierarchy(treeData);

// maps the node data to the tree layout
nodes = treemap(nodes);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".tree")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom),
    g = svg.append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// adds the links between the nodes
var link = g.selectAll(".link")
    .data( nodes.descendants().slice(1))
  .enter().append("path")
    .attr("class", "link")
    .attr("d", function(d) {
       return "M" + d.x + "," + d.y
         + "C" + d.x + "," + (d.y + d.parent.y) / 2
         + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
         + " " + d.parent.x + "," + d.parent.y;
       });

// adds each node as a group
var node = g.selectAll(".node")
    .data(nodes.descendants())
  .enter().append("g")
    .attr("class", function(d) {
      return "node" +
        (d.children ? " node--internal" : " node--leaf"); })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"; });

// adds the circle to the node
node.append("circle")
  .attr("r", 10);

// adds the text to the node
node.append("text")
  .attr("dy", ".35em")
  .attr("y", function(d) { return d.children ? -20 : 20; })
  .style("text-anchor", "middle")
  .text(function(d) { return d.data.name; });

// John Misty
const svgMisty = d3.select('.john-misty')
.attr('width', svgBarWidth)
.attr('height', svgBarHeight);


var points = [
  [0, 0],
  [20, 60],
  [100, 100],
];



var mistySvg = d3.select('.john-misty')
    .attr("width", svgWidth)
    .attr("height", svgWidth);

const appendLine = (svg, points, color) => {
  const curveLineGenerator = d3.line().curve(d3.curveCardinal);

  const path = curveLineGenerator(points)

  svg.append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 4)
    .attr('transform', getTranslateString(50, 50))
};

appendLine(mistySvg, points, 'blue')
appendLine(mistySvg, [[105, 105], [ 200, 200], [205, 205]], 'red')
appendLine(mistySvg, [
  [ 0, 0 ],
  [300, 0],
  [300, 100]
], 'green')
