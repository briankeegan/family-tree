import * as d3 from 'd3';

import familyData from 'family-tree.json';

import positionElements from 'src/js/positionElements';
import { processData, getDepthObj, isPartnerOfChildren } from 'src/js/processData';
import { getTranslateString } from 'src/js/createTree';

// Creating table
const data = processData(familyData, { familyNameId: 0, memberId: 0 });
console.log('data', data)
console.log(isPartnerOfChildren(data[0], data[1]))
console.log('getDepthObj', getDepthObj(familyData, { familyNameId: 0, memberId: 0 }))

const dimensions = {
  width: 1600,
  height: 800,
  paddingTop: 50,
  paddingLeft: 90,
  paddingRight: 90 * 2
};

const zoom = d3.zoom();

const svg = d3.select('.john-misty')
  .call(zoom2)
  .append('g');

function zoom2(selection) {
  selection.call(d3.zoom()
    .scaleExtent([0.2, 2])
    .on('zoom', zoomed));
}

// function zoom() {
//   return d3.zoom()
//     .scaleExtent([0.2, 2])
//     .on('zoom', zoomed);
// }



function zoomed() {
  svg.attr('transform', d3.event.transform);
}

const resetSvgPosition = () => {
  //   .scaleTo(1);
  console.log(zoom.transform)
  console.log(d3.zoomIdentity)
  // svg.call(zoom.transform, d3.zoomIdentity);
};

d3.select('.reset')
  .on('click', resetSvgPosition);

positionElements(dimensions, svg);
