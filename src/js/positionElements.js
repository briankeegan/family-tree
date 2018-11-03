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

  const { width } = dimensions;
  const boxWidth = 200;
  const middleX = width / 2;
  const middleY = 300;
  const spaceBetween = boxWidth + 100;
  const childrenPadding = 10;

  const props = { svg, dimensions, points: [], width: boxWidth };

  const mutateOffset = (array, depth, index, offset) => {
    let hasMutatedDepth = false;
    for (let i = index; i < array[depth].length; i++) {
      array[depth][i].offset += offset;
      const { childRef } = array[depth][i];
      if (!hasMutatedDepth && childRef) {
        const { start } = childRef;
        mutateOffset(childrenArray, depth + 1, start, offset);
        hasMutatedDepth = true;
      }
    }
  };

  const childrenArray = [];

  const renderChildren = (children = [], originPoints) => {
    const createChildrenArray = (children, depth = 0) => {
      children.forEach((child) => {
        if (!childrenArray[depth]) {
          childrenArray[depth] = [];
        }
        if ((child.children || []).length) {
          const { children } = child;
          const childDepth = depth + 1;
          const start = (childrenArray[depth + 1] || []).length;
          const { length } = children;
          const end = start + length;
          child.childRef = { start, end };
          createChildrenArray(children, childDepth);
        }
        childrenArray[depth].push(child);
      });
    };
    createChildrenArray(children);

    for (let depth = childrenArray.length - 1; depth >= 0; depth--) {
      let lastOffset = 0;
      childrenArray[depth].forEach((child, i) => {
        let initialOffset = lastOffset;
        if ((child.children || []).length) {
          const { childRef, children } = child;
          const { start, end } = childRef;
          const childAdjustedPosition = childrenArray[depth + 1]
            .slice(start, end)
            .reduce((num, grandChild) => num += grandChild.offset, 0) / children.length;
          if (!i && childAdjustedPosition !== initialOffset) {
            mutateOffset(childrenArray, depth + 1, start, -childAdjustedPosition);
          } else if (childAdjustedPosition < initialOffset) {
            mutateOffset(childrenArray, depth + 1, start, initialOffset - childAdjustedPosition);
          } else if (childAdjustedPosition > initialOffset) {
            initialOffset = childAdjustedPosition;
          }
        }
        child.offset = initialOffset;
        lastOffset = initialOffset + 2;
      });

      if (!depth) {
        const topLevelOffset = childrenArray[0].reduce((num, child) => num += child.offset, 0) / children.length;
        mutateOffset(childrenArray, 0, 0, -topLevelOffset);
      }
    }

    // In refactor consider using d3's enter / or multiple arrays, so can animated down...
    childrenArray.forEach((array, depth) => {
      array.forEach(child => {
        const padding = boxWidth + childrenPadding;
        const x = originPoints[0];
        const offset = x + (padding * child.offset) / 2;
        const y = originPoints[1] + (200 * (depth + 1));
        child.point = [offset, y];
      });
    });

    const addToArrays = (children, originPoints) => {
      children.forEach((child) => {
        const { fullName, ids, point } = child;
        lines.push({ ...props, points: createPointsLine(originPoints, point)});
        textBoxes.push({ ...props, point, ids, textArray: [fullName]});
        if ((child.children || []).length) {
          addToArrays(child.children, point);
        }
      });
    };

    addToArrays(children, originPoints);
  };

  //  coupleOffset is quickfix. Should be refactored
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
      // renderParents(target.parents, target.points, 1, 1);
      // renderParents(targetPartner.parents, targetPartner.points, 1, 1);
    } else {
      target.points = [middleX, middleY];
      const middle = target.points;

      textBoxes.push({ ...props, point: target.points, textArray: [target.fullName] });

      renderChildren(target.children, middle);
      // renderParents(target.parents, target.points);
    }
  };

  createTarget();

  console.log(childrenArray);


  lines.forEach(line => appendLine(line));
  textBoxes.forEach(textBox => {
    const box = appendTextBox(textBox);
    box
      .on('click', function() {
        if (textBox.ids) {
          svg.selectAll('*').remove();
          // quickfix, arrays not clearing
          // reset positions as well
          lines = [];
          textBoxes = [];
          positionElements(dimensions, svg, familyData, textBox.ids);
        }
      });
  });

};

export default positionElements;
