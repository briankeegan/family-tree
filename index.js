const getTranslateString = (x, y = x) => {
  return "translate(" + x + "," + y + ")"
}
// John Misty
const dimensions = {
  width: 1200,
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
const parent2 = [600, 0];


child1 = [0, 400];
child2 = [200, 400];
child3 = [400, 400];
child4 = [600, 400];

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

const appendRect = ({
  svg,
  point,
  height = 0,
  width,
  dimensions,
}) => {
  const x = point[0] - width / 2;
  const y = point[1] - 20;

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



// Text
const appendText = ({
  svg,
  point,
  width,
  dimensions,
  text,
  padding = 0
}) => {
  const x = point[0] - width / 2 + 10;
  const y = point[1] + padding
  return svg.append('text')
    .text(text)
    .attr("x", x)
    .attr("y", y)
    .attr("transform", getTranslateString(dimensions.padding))
    .attr('class', 'text')
}
// Text-wrap
const appendTextWrap = (props) => {
  const { text, lineNumber, width } = props;
  const words = text.split(/\s/g);
  let phrase = words.shift();
  let textWrap = appendText({
    ...props,
    text: phrase,
    padding: lineNumber.increment() * 20
  });
  while (words.length > 0) {
    let word = words.shift();
    // console.log(`${phrase} ${word}`)
    // console.log(textWrap.node().getComputedTextLength() - 20 > width)
    textWrap.node().textContent = `${phrase} ${word}`;
    if (textWrap.node().getComputedTextLength() > width - 20) {
      console.log(phrase)
      textWrap.node().textContent = phrase;
      return appendTextWrap({
        ...props,
        text: [ word, ...words ].join(' '),
        lineNumber
      })
    } else {
      phrase += ` ${word}`
    }
  }
}

const appendTextArray = (props) => {
  const { textArray, lineNumber } =  props;
  let increment = { count: 0};
  textArray.forEach((text) => {
    appendTextWrap({
      ...props,
      text,
      lineNumber
    });
  })
  return increment;
}

const textArray = [
  'asdfasdf',
  'fdsafdsa',
  '3',
  '4',
  '5'
]


const appendTextBox = ({
  svg,
  point,
  dimensions,
  textArray,
  width
}) => {
  const lineNumber = {
  	current: 0,
  	increment: function() {
  	   return this.current++;
    }
  }
  const container = appendRect({
    svg,
    point,
    dimensions,
    width
  });
  appendTextArray({
    svg,
    point,
    dimensions,
    width,
    textArray,
    lineNumber
  });
  const height = lineNumber.current * 20 + 10;
  container.attr("height", height)

};
const rectProp = { ...props, point: [0, 0], width: 150 }

appendTextBox({ ...rectProp, point: parent1, textArray: [
  'James William Keegan (William James)',
  'Born in US or Ireland ~ 1817',
  'Married Eliza Foster July 17, 1836',
  'Died prior to 1850 US census'
] })
appendTextBox({ ...rectProp, point: parent2, textArray: [
  'Eliza (Elizabeth) Foster (Brennan)',
'Adopted by Foster family',
'Married James/William Keegan before 1938',
'4 or 5 children',
'Died 11-18-1882',
'Buried at Green-Wood Cemetery in Brooklyn'
] })
appendTextBox({ ...rectProp, point: child4, textArray: [
  'James William Keegan (William James)',
  'asf  asdf (William James)',
] })
appendTextBox({ ...rectProp, point: child3, textArray: [
  'James William Keegan (William James)',
  'asf  asdf (William James)',
] })
