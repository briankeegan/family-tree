import * as d3 from 'd3';

import {
  getPointsMiddle,
  appendLine,
  createPointsLine,
  appendTextBox,
} from 'src/js/createTree';

import { processData, getChildrenOffset } from 'src/js/processData';

let lines = [];
let textBoxes = [];


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
    return getChildrenOffset(familyData, { familyNameId, memberId });
  };


  const renderChildren = (children, parentsPoint = 'preachy') => {
    let rowOffset = (children || []).reduce((tot, child) => {
      return tot + _getChildrenOffset(child.memberId);
    }, 0);
    let curOffset = 0;
    const points = (children || []).map((child, i) => {
      const padding = boxWidth + childrenPadding;
      const x = parentsPoint[0];
      let offset = x - padding * (children.length - 1 + rowOffset + curOffset) / 2;
      const y = parentsPoint[1];
      const childrenOffset = _getChildrenOffset(child.memberId);
      if (childrenOffset) {
        curOffset -= childrenOffset * 2;
        offset += padding * childrenOffset / 2;
      }
      return [offset + i * padding, y + 200];
    });
    (children || []).forEach((child, i) => {
      const { fullName, ids } = child;
      lines.push({ ...props, points: createPointsLine(parentsPoint, points[i]) });
      textBoxes.push({ ...props, point: points[i], ids, textArray: [fullName]});
      if (child.children) {
        renderChildren(child.children, points[i]);
      }
    });
  };

//  coupldOffset is quickfix. Should be refactored
  const renderParents = (parents, originPoints, depth = 0, coupleOffset = 0) => {
    let duplicateOffset = 0;
    const points = (parents || []).map((parent, i) => {
      const padding = boxWidth + childrenPadding;
      const x = originPoints[0];
      const offset = x - padding * (parents.length - 1  + duplicateOffset + (Math.pow(2, depth) - 1) - coupleOffset) / 2;
      const y = originPoints[1];

      let point = [offset + i * padding, y - 200];

      const checkForDuplicates = (p) => {
        if (textBoxes.some(box => box.point[0] === p[0] && box.point[1] === p[1])) {
          duplicateOffset -= 2;
          point[0] += padding;
          checkForDuplicates(point);
        }
      };

      checkForDuplicates(point);
      return point;
    });
    (parents || []).forEach((parent, i) => {
      const { fullName, ids } = parent;
      lines.push({ ...props, points: createPointsLine(points[i], originPoints)});
      textBoxes.push({ ...props, point: points[i], ids, textArray: [fullName]});
      if (parent.parents) {
        renderParents(parent.parents, points[i], depth + 1);
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
      textBoxes.push({ ...props, ids: targetPartner.ids, point: targetPartner.points, textArray: [targetPartner.fullName] });

      renderChildren(target.children, middle);
      renderParents(target.parents, target.points, 1, 1);
      renderParents(targetPartner.parents, targetPartner.points, 1, 1);
    } else {
      target.points = [middleX, middleY];
      const middle = target.points;

      textBoxes.push({ ...props, point: target.points, textArray: [target.fullName] });

      renderChildren(target.children, middle);
      renderParents(target.parents, target.points);
    }
  };

  console.log(data)
  createTarget();

  lines.forEach(line => appendLine(line));
  textBoxes.forEach(textBox => {
    const box = appendTextBox(textBox);
    box
      .on('click', function() {
        if (textBox.ids) {
          svg.selectAll('*').remove();
          // quickfix, arrays not clearing

          lines = [];
          textBoxes = [];
          positionElements(dimensions, svg, familyData, textBox.ids);
        }
      });
  });

};

export default positionElements;
