import * as d3 from 'd3';

import familyData from 'family-tree.json';
import processData from 'src/js/processData';

import {
  getPointsMiddle,
  appendLine,
  createPointsLine,
  appendTextBox,
} from 'src/js/createTree';

// Creating table
processData(familyData);

const dimensions = {
  width: 1200,
  height: 800,
  padding: 80
};

const mistySvg = d3.select('.john-misty')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height);


const parent1 = [0, 0];
const parent2 = [600, 0];


const child1 = [0, 400];
const child2 = [200, 400];
const child3 = [400, 400];
const child4 = [600, 400];

const gChild1 = [500, 600];
const gChild2 = [700, 600];

const props = { svg: mistySvg, dimensions, color: 'black', points: [] };

const middle = getPointsMiddle(parent1, parent2);


appendLine({ ...props, points: [parent1, parent2] });
appendLine({ ...props, points: createPointsLine(middle, child1) });
appendLine({ ...props, points: createPointsLine(middle, child2) });
appendLine({ ...props, points: createPointsLine(middle, child3) });
appendLine({ ...props, points: createPointsLine(middle, child4) });

appendLine({ ...props, points: createPointsLine(child4, gChild1) });
appendLine({ ...props, points: createPointsLine(child4, gChild2) });

const rectProp = { ...props, width: 150 };

appendTextBox({ ...rectProp, point: parent1, textArray: [
  'James William Keegan (William James)',
  'Born in US or Ireland ~ 1817',
  'Married Eliza Foster July 17, 1836',
  'Died prior to 1850 US census'
] });
appendTextBox({ ...rectProp, point: parent2, textArray: [
  'Eliza (Elizabeth) Foster (Brennan)',
  'Adopted by Foster family',
  'Married James/William Keegan before 1938',
  '4 or 5 children',
  'Died 11-18-1882',
  'Buried at Green-Wood Cemetery in Brooklyn'
] });
appendTextBox({ ...rectProp, point: child4, textArray: [
  'James William Keegan (William James)',
  'Something else'
] });
appendTextBox({ ...rectProp, point: child3, textArray: [
  'James William Keegan (William James)',
  'Something else'
] });
appendTextBox({ ...rectProp, point: gChild1, textArray: [
  'James William Keegan (William James)',
  'Something else'
] });
appendTextBox({ ...rectProp, point: gChild2, textArray: [
  'James William Keegan (William James)',
  'Something else'
] });
