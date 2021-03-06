import * as d3 from 'd3'

const animationSpeed = 500

const getTranslateString = (x, y) => {
  return 'translate(' + x + ',' + y + ')'
}

const appendLine = ({ svg, dimensions, points, delay = 0 }) => {
  const { paddingLeft, paddingTop } = dimensions
  const curveLineGenerator = d3.line().curve(d3.curveBundle)

  const pathData = curveLineGenerator(points)

  const path = svg
    .append('path')
    .attr('d', pathData)
    .attr('fill', 'none')
    .attr('transform', getTranslateString(paddingLeft, paddingTop))
    .attr('class', 'connecting-line')

  var totalLength = path.node().getTotalLength()

  path
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength)
    .attr('opacity', 0)
    .transition()
    .duration(animationSpeed)
    .delay(delay * animationSpeed)
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0)
    .attr('opacity', 1)
}

const appendText = ({
  svg,
  point,
  width,
  dimensions,
  text,
  padding = 0,
  onClick
}) => {
  const x = point[0] - width / 2 + 10
  const y = point[1] + padding
  const { paddingLeft, paddingTop } = dimensions
  const textElement = svg
    .append('text')
    .text(text)
    .attr('x', x)
    .attr('y', y)
    .attr('transform', getTranslateString(paddingLeft, paddingTop))
    .attr('class', 'text')

  if (onClick) {
    textElement.on('click', onClick)
  }

  return textElement
}

const appendTextWrap = props => {
  const { text, lineNumber, width } = props
  const words = text.split(/\s/g)
  let phrase = words.shift()
  let textWrap = appendText({
    ...props,
    text: phrase,
    padding: lineNumber.increment() * 20
  })

  const { delay = 0 } = props

  textWrap.attr('opacity', 0)

  textWrap
    .transition()
    .duration(animationSpeed)
    .delay(delay * (animationSpeed + animationSpeed / 4))
    .ease(d3.easeLinear)
    .attr('opacity', 1)

  while (words.length > 0) {
    let word = words.shift()
    textWrap.node().textContent = `${phrase} ${word}`
    if (textWrap.node().getComputedTextLength() > width - 20) {
      textWrap.node().textContent = phrase
      return appendTextWrap({
        ...props,
        text: [word, ...words].join(' '),
        lineNumber
      })
    } else {
      phrase += ` ${word}`
    }
  }
}

const appendTextArray = props => {
  const { textArray, lineNumber } = props
  let increment = { count: 0 }
  textArray.forEach(text => {
    appendTextWrap({
      ...props,
      text,
      lineNumber
    })
  })
  return increment
}

const appendTextBox = ({
  svg,
  point,
  dimensions,
  textArray,
  width,
  delay = 0,
  onClick
}) => {
  const lineNumber = {
    current: 0,
    increment: function() {
      return this.current++
    }
  }
  const container = appendRect({
    svg,
    point,
    dimensions,
    width
  })
  appendTextArray({
    svg,
    point,
    dimensions,
    width,
    textArray,
    lineNumber,
    delay,
    onClick
  })
  const height = lineNumber.current * 20 + 10
  container.attr('height', height)

  container.attr('opacity', 0)

  container
    .transition()
    .duration(animationSpeed / 4)
    .delay(delay * (animationSpeed + animationSpeed / 4))
    .ease(d3.easeLinear)
    .attr('opacity', 1)

  if (onClick) {
    container.on('click', onClick)
  }
  return container
}

const appendRect = ({ svg, point, height = 0, width, dimensions }) => {
  const { paddingLeft, paddingTop } = dimensions
  const x = point[0] - width / 2
  const y = point[1] - 20

  return svg
    .append('rect')
    .attr('rx', 6)
    .attr('ry', 6)
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height)
    .attr('transform', getTranslateString(paddingLeft, paddingTop))
    .attr('class', 'text-container')
} // appendRect

const getPointsMiddle = (point1, point2) => [
  (point1[0] + point2[0]) / 2,
  (point1[1] + point2[1]) / 2
]

const createPointsLineDown = (start, end) => [
  start,
  [start[0], start[1] + 50],
  [end[0], (start[1] + end[1] + 50) / 2],
  end
]

const createPointsLineUp = (end, start) =>
  createPointsLineDown(start, end).reverse()

export {
  getPointsMiddle,
  appendLine,
  createPointsLineDown,
  createPointsLineUp,
  appendTextBox
}
