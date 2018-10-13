const getTranslateString = (x, y = x) => {
  return "translate(" + x + "," + y + ")"
}
// John Misty
const dimensions = {
  width: 500,
  height: 500,
  padding: 50
};
const width = 500;
const height = 500;
const padding = 50;


const mistySvg = d3.select('.john-misty')
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

const appendLine = ({ svg, dimensions, color = '#000', points }) => {
  const curveLineGenerator = d3.line().curve(d3.curveBundle);

  const pathData = curveLineGenerator(points)

  svg.append('path')
    .attr('d', pathData)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 4)
    .attr('transform', getTranslateString(dimensions.padding))
};

const parent1 = [0, 0];
const parent2 = [400, 0];


child1 = [0, 400];
child2 = [133.34, 400];
child3 = [266.67, 400];
child4 = [400, 400];

const props = { svg: mistySvg, dimensions, color: 'black', points: [] };

appendLine({ ...props, points: [parent1, parent2] })
// fint middle
const getPointsMiddle = (point1, point2) => (
  [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
);
const middle = getPointsMiddle(parent1, parent2)

const getCurve = (start, end) => (
  [end[0], (start[1] + end[1]) / 2]
)

createPointsLine = (middle, end) => (
 [middle, getCurve(middle, end), end]
)

appendLine({ ...props, points: createPointsLine(middle, child1) })
appendLine({ ...props, points: createPointsLine(middle, child2) })
appendLine({ ...props, points: createPointsLine(middle, child3) })
appendLine({ ...props, points: createPointsLine(middle, child4) })

// const appendCircle = (svg, x, y) => {
//   return svg.append("circle")
//      .attr("cx", x)
//      .attr("cy", y)
//      .attr("r", 80)
//      .attr("fill", "#7CE8D5");
// }
//
// appendCircle({ svg: mistySvg, x: 0, y: 0})

// var rect = mistySvg.append("rect")
//    .attr("x", 100)
//    .attr("y", 100)
//    .attr("width", 200)
//    .attr("height", 100)
//    .attr("fill", "#9B95FF")
//    .on('click', function(e, i, nodeList) {
//      rect.attr('width', 100)
//      drawText.text('')
//    })

// const drawText = mistySvg.append('text')
//   .text('click me!')
//   .attr("x", 150)
//   .attr("y", 150)


var circle = mistySvg.append("circle")
   .attr("cx", 200)
   .attr("cy", 300)
   .attr("r", 80)
   .attr("fill", "#7CE8D5");
