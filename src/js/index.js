import * as d3 from 'd3'

import familyData from 'family-tree.json'

import positionElements from 'src/js/positionElements'

const width = 1200
const height = 800

const dimensions = {
  width,
  height,
  paddingTop: 50,
  paddingLeft: 90,
  paddingRight: 90 * 2
}

var zoomListener = d3
  .zoom()
  .scaleExtent([0.2, 2])
  .on('zoom', zoomHandler)

// Set height / width hear, so it's consistent with centering of items
document.querySelector(
  'svg'
).style.cssText = `height: ${height}px; width: ${width}px;`

const johnMisty = d3.select('.john-misty').call(zoomListener)

const content = johnMisty
  .append('g')
  .attr('transform', 'translate(0, 0) scale(1)')

function zoomHandler() {
  const { x, y, k } = d3.event.transform
  d3.select(this)
    .select('g')
    .attr('transform', `translate(${x},${y}) scale(${k})`)
}

const resetPosition = () => {
  johnMisty.call(zoomListener.transform, d3.zoomIdentity)
}

d3.select('.reset').on('click', resetPosition)

positionElements(dimensions, content, familyData, {
  familyNameId: 0,
  memberId: 1
})

export { resetPosition }
