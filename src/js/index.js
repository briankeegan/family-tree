import * as d3 from 'd3';

import familyData from 'family-tree.json';

import positionElements from 'src/js/positionElements';
import { processData, getDepthObj, isPartnerOfChildren } from 'src/js/processData';
//
// // Creating table
// const data = processData(familyData, { familyNameId: 0, memberId: 0 });
// console.log('data', data)
// console.log(isPartnerOfChildren(data[0], data[1]))
// console.log('getDepthObj', getDepthObj(familyData, { familyNameId: 0, memberId: 1 }))

const dimensions = {
  width: 1600,
  height: 800,
  paddingTop: 50,
  paddingLeft: 90,
  paddingRight: 90 * 2
};


var zoomListener = d3.zoom()
  .scaleExtent([0.2, 2])
  .on('zoom', zoomHandler);


const svg = d3.select('.john-misty')
  .call(zoomListener);

const content = svg.append('g')
  .attr('transform', 'translate(0, 0) scale(1)');

function zoomHandler() {
  const {x, y, k} = d3.event.transform;
  d3.select(this).select('g').attr('transform', `translate(${x},${y}) scale(${k})`);
}

function reset() {
  svg.call(zoomListener.transform, d3.zoomIdentity);
}

d3.select('.reset')
  .on('click', reset);

positionElements(dimensions, content, familyData, { familyNameId: 0, memberId: 0 });
