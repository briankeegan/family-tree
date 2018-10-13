const getTranslateString = (x, y = x) => {
  return "translate(" + x + "," + y + ")"
}
// John Misty
const dimensions = {
  width: 800,
  height: 800,
  padding: 80
};

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

appendLine({ ...props, points: [parent1, parent2] })
appendLine({ ...props, points: createPointsLine(middle, child1) })
appendLine({ ...props, points: createPointsLine(middle, child2) })
appendLine({ ...props, points: createPointsLine(middle, child3) })
appendLine({ ...props, points: createPointsLine(middle, child4) })

const appendCircle = ({
  svg,
  point,
  radius = 13,
  dimensions
}) => {
  const x = point[0];
  const y = point[1];
  var circle = svg.append("circle")
     .attr("cx", x)
     .attr("cy", y)
     .attr("r", radius)
     .attr('transform', getTranslateString(dimensions.padding))
     .attr('class', 'circle')
}


// appendCircle({ ...props, point: parent1 })
// appendCircle({ ...props, point: parent2 })
// appendCircle({ ...props, point: child1 })
// appendCircle({ ...props, point: child2 })
// appendCircle({ ...props, point: child3 })
// appendCircle({ ...props, point: child4 })

const appendRect = ({
  svg,
  point,
  height,
  width,
  dimensions,
}) => {
  const x = point[0] - width / 2;
  const y = point[1] - height / 2;

  return svg.append("rect")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .attr("transform", getTranslateString(dimensions.padding))
      .attr('class', 'text-container')
}

const rectProp = { ...props, point: [0, 0], width: 100, height: 90 }

appendRect({ ...rectProp, point: parent1 })
appendRect({ ...rectProp, point: parent2 })
appendRect({ ...rectProp, point: child1 })
appendRect({ ...rectProp, point: child2 })
appendRect({ ...rectProp, point: child3 })
appendRect({ ...rectProp, point: child4 })


// const drawText = mistySvg.append('text')
//   .text('click me!')
//   .attr("x", 150)
//   .attr("y", 150)
