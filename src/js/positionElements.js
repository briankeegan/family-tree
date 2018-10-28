import * as d3 from 'd3';

import {
  getPointsMiddle,
  appendLine,
  createPointsLine,
  appendTextBox,
} from 'src/js/createTree';

import { processData, getChildrenOffset } from 'src/js/processData';

const lines = [];
const textBoxes = [];


const positionElements = (dimensions, svg, familyData, member) => {
  const data = processData(familyData, member);
  const  { familyNameId } = member;

  const { width } = dimensions;
  const boxWidth = 200;
  const middleX = width / 2;
  const middleY = 300;
  const spaceBetween = boxWidth + 100;
  const childrenPadding = 10;

  const props = { svg, dimensions, points: [], width: boxWidth };

  const _getChildrenOffset = (memberId) => {
    return getChildrenOffset(familyData, { familyNameId, memberId })
  }


// lines.push({ ...props, points: createPointsLine(parentsPoint, childPoints) });
// textBoxes.push({ ...props, point: childPoints, textArray: [child.fullName] });

  const renderChildren = (children, parentsPoint = 'preachy') => {
    let rowOffset = (children || []).reduce((tot, child) => {
      return tot + _getChildrenOffset(child.memberId);
    }, 0);
    let curOffset = 0;
    const points = (children || []).map((child, i) => {
      const padding = boxWidth + childrenPadding;
      const x = parentsPoint[0];
      let offset = x - padding * ((children.length - 1 + rowOffset + curOffset)) / 2;
      if (child.memberId === 7 || child.memberId === 8) {
        console.log(child.fullName, curOffset);
        let offset2 = x - padding * ((children.length - 1 + rowOffset + curOffset)) / 2;
        console.log(offset2)
      }
      // let offset = x - padding * ((children.length - 1) + rowOffset + curOffset) / 2;
      const y = parentsPoint[1];
      const childrenOffset = _getChildrenOffset(child.memberId);
      if (childrenOffset) {
        curOffset -= childrenOffset * 2;
        offset += padding * childrenOffset / 2;
        // console.log(child.fullName, offset);
      }
      return [offset + i * padding, y + 200];
    });
    (children || []).forEach((child, i) => {
      lines.push({ ...props, points: createPointsLine(parentsPoint, points[i]) });
      textBoxes.push({ ...props, point: points[i], textArray: [child.fullName]});
      if (child.children) {
        renderChildren(child.children, points[i]);
      }
    });
  };

  const createTarget = () => {
    // To do: allow for more than one partner || allow different combos.
    const target = { ...data[0] };
    if (data.length > 1) {
      const targetPartner = { ...data[1] };
      target.points = [middleX - spaceBetween, middleY];
      targetPartner.points = [middleX + spaceBetween - dimensions.paddingRight, middleY];
      const middle = getPointsMiddle(target.points, targetPartner.points);

      lines.push({ ...props, points: [target.points, targetPartner.points] });
      textBoxes.push({ ...props, point: target.points, textArray: [target.fullName] });
      textBoxes.push({ ...props, point: targetPartner.points, textArray: [targetPartner.fullName] });

      renderChildren(target.children, middle);
    } else {
      target.points = [middleX, middleY];
      const middle = target.points;

      textBoxes.push({ ...props, point: target.points, textArray: [target.fullName] });

      renderChildren(target.children, middle);
    }
  };

  createTarget();


  // let i = 0;
  // function timeout() {
  //   setTimeout(function () {
  //     appendLine(lines[i]);
  //     appendTextBox(textBoxes[i]);
  //     if (++i < lines.length) {
  //       timeout();
  //     }
  //   }, 200);
  // }
  // timeout();

  lines.forEach(line => appendLine(line));
  textBoxes.forEach(textBox => appendTextBox(textBox));

  console.log(data)

  // const parent1 = [middleX - spaceBetween, middleY];
  // const parent2 = [middleX + spaceBetween - dimensions.paddingRight, middleY];


  // const child1 = [0, 400];
  // const child2 = [200, 400];
  // const child3 = [400, 400];
  // const child4 = [600, 400];
  //
  // const gChild1 = [500, 600];
  // const gChild2 = [700, 600];

  // const middle = getPointsMiddle(parent1, parent2);


  // appendLine({ ...props, points: createPointsLine(middle, child1) });
  // appendLine({ ...props, points: createPointsLine(middle, child2) });
  // appendLine({ ...props, points: createPointsLine(middle, child3) });
  // appendLine({ ...props, points: createPointsLine(middle, child4) });
  //
  // appendLine({ ...props, points: createPointsLine(child4, gChild1) });
  // appendLine({ ...props, points: createPointsLine(child4, gChild2) });

  // appendLine({ ...props, points: [parent1, parent2] });
  //
  // appendTextBox({ ...props, point: parent1, textArray: [
  //   'James William Keegan (William James)',
  //   'Born in US or Ireland ~ 1817',
  //   'Married Eliza Foster July 17, 1836',
  //   'Died prior to 1850 US census'
  // ] });
  // appendTextBox({ ...props, point: parent2, textArray: [
  //   'Eliza (Elizabeth) Foster (Brennan)',
  //   'Adopted by Foster family',
  //   'Married James/William Keegan before 1938',
  //   '4 or 5 children',
  //   'Died 11-18-1882',
  //   'Buried at Green-Wood Cemetery in Brooklyn'
  // ] });



  // appendTextBox({ ...rectProp, point: child4, textArray: [
  //   'James William Keegan (William James)',
  //   'Something else'
  // ] });
  // appendTextBox({ ...rectProp, point: child3, textArray: [
  //   'James William Keegan (William James)',
  //   'Something else'
  // ] });
  // appendTextBox({ ...rectProp, point: gChild1, textArray: [
  //   'James William Keegan (William James)',
  //   'Something else'
  // ] });
  // appendTextBox({ ...rectProp, point: gChild2, textArray: [
  //   'James William Keegan (William James)',
  //   'Something else'
  // ] });
};

export default positionElements;
