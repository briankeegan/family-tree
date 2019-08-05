import * as d3 from 'd3'

import familyData from 'family-tree.json'

import positionElements from 'src/js/positionElements'

const dimensions = {
  width: 1200,
  height: 800,
  paddingTop: 50,
  paddingLeft: 90,
  paddingRight: 90 * 2
}

var zoomListener = d3
  .zoom()
  .scaleExtent([0.2, 2])
  .on('zoom', zoomHandler)

const svg = d3.select('.john-misty').call(zoomListener)

const content = svg.append('g').attr('transform', 'translate(0, 0) scale(1)')

function zoomHandler() {
  const { x, y, k } = d3.event.transform
  d3.select(this)
    .select('g')
    .attr('transform', `translate(${x},${y}) scale(${k})`)
}

const resetPosition = () => {
  svg.call(zoomListener.transform, d3.zoomIdentity)
}

d3.select('.reset').on('click', resetPosition)

positionElements(dimensions, content, familyData, {
  familyNameId: 0,
  memberId: 1
})

export { resetPosition }
