import {
  getPointsMiddle,
  appendLine,
  createPointsLine,
  appendTextBox,
} from 'src/js/createTree';

import { processData } from 'src/js/processData';


const positionElements = (dimensions, svg, familyData) => {
  const data = processData(familyData, { familyNameId: 0, memberId: 1 });

  console.log('data', data)

  const { width } = dimensions;
  const boxWidth = 200;
  const middleX = width / 2;
  const middleY = 300;
  const spaceBetween = boxWidth + 100;
  const childrenPadding = 10;

  const props = { svg, dimensions, color: 'black', points: [], width: boxWidth };

  const isEven = (number) => {
    return !(number % 2);
  };

  const getMiddleIndex = (number) => {
    return Math.floor(number.length / 2);
  };

  const renderChildren = (children, parentsPoint = 'preachy') => {
    const len = children.length;
    (children || []).forEach((child, i) => {
      const padding = boxWidth + childrenPadding;
      const x = parentsPoint[0];
      const offset = x - padding * (len - 1) / 2;
      const y = parentsPoint[1];
      const childPoints = [offset + i * padding, y + 200];

      appendLine({ ...props, points: createPointsLine(parentsPoint, childPoints) });
      appendTextBox({ ...props, point: childPoints, textArray: [child.fullName] });
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

      appendLine({ ...props, points: [target.points, targetPartner.points] });
      appendTextBox({ ...props, point: target.points, textArray: [target.fullName] });
      appendTextBox({ ...props, point: targetPartner.points, textArray: [targetPartner.fullName] });

      renderChildren(target.children, middle);
    } else {
      target.points = [middleX, middleY];
      const middle = target.points;

      appendTextBox({ ...props, point: target.points, textArray: [target.fullName] });

      renderChildren(target.children, middle);
    }
  };

  createTarget();

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
