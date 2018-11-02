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

  const _getChildrenOffset = (ids) => {
    return getChildrenOffset(familyData, ids);
  };

  const mutateOffset = (array, depth, index, offset) => {
    let hasMutatedDepth = false;
    for (let i = index; i < array[depth].length; i++) {
      array[depth][i].offset += offset;
      const { childRef } = array[depth][i];
      if (!hasMutatedDepth && childRef) {
        const { start } = childRef;
        console.log('here!', depth + 1, start, offset)
        mutateOffset(childrenArray, depth + 1, start, offset);
        hasMutatedDepth = true;
      }
    }
  };

  const childrenArray = [];

  const renderChildren = (children, parentsPoint = 'preachy') => {
    const createChildrenArray = (children, depth = 0) => {
      (children || []).forEach((child, i) => {
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
      childrenArray[depth].forEach((child, i) => {
        let initialOffset = i * 2;
        if (depth === childrenArray.length -1) {
          child.offset = initialOffset;
        } else {
          if ((child.children || []).length) {
            const { childRef, children } = child;
            const { start, end } = childRef;
            const childAdjustedPosition = childrenArray[depth + 1]
              .slice(start, end)
              .reduce((num, grandChild) => {
                // try refactoring to `return num += grandChild.offset;`
                num += grandChild.offset;
                return num;
              }, 0) / children.length;
            if (!i && childAdjustedPosition) {
              mutateOffset(childrenArray, depth + 1, start, -childAdjustedPosition);
            } else if (childAdjustedPosition < initialOffset) {
              mutateOffset(childrenArray, depth + 1, start, initialOffset - childAdjustedPosition);
            } else if (childAdjustedPosition > initialOffset) {
              initialOffset = childAdjustedPosition;
            }
          }
          child.offset = initialOffset;
        }
      });
    }
  };

  const renderChildren321 = (children, parentsPoint = 'preachy') => {
    const renderChildrenRecursively = (children, depth = 0) => {
      (children || []).forEach((child, i) => {
        let initialOffset = i * 2;
        if (!childrenArray[depth]) {
          childrenArray[depth] = [];
        }
        if ((child.children || []).length) {
          const { children } = child;
          const childDepth = depth + 1;
          const start = (childrenArray[depth + 1] || []).length;
          const { length } = children;
          const end = start + length;
          child.startChildRef = start;
          renderChildrenRecursively(children, childDepth);
          const childAdjustedPosition = childrenArray[childDepth]
            .slice(start, end)
            .reduce((num, grandChild) => {
              // try refactoring to `return num += grandChild.offset;`
              num += grandChild.offset;
              return num;
            }, 0) / length;
          if (i && childAdjustedPosition) {
            mutateOffset(childrenArray[childDepth], start, -childAdjustedPosition);
          } else if (childAdjustedPosition < initialOffset) {
            mutateOffset(childrenArray[childDepth], start, childAdjustedPosition - initialOffset);
          }
        }
        const offset = childrenArray[depth].length ?
          childrenArray[depth][childrenArray[depth].length -1].offset + 2 :
          0;
        child.offset = offset;
        childrenArray[depth].push(child);
      });
    };
    renderChildrenRecursively(children);
  };

  const renderChildren123 = (children, parentsPoint = 'preachy', depth = 0 ) => {
    const points = (children || []).map((child, i) => {
      const padding = boxWidth + childrenPadding;
      const x = parentsPoint[0];
      let offset = x - padding * (children.length - 1 + curOffset) / 2;
      const y = parentsPoint[1];
      let childrenOffset = _getChildrenOffset(child.ids);
      if (childrenOffset) {``
        curOffset -= childrenOffset * 2;
        offset += padding * childrenOffset / 2;
      }
      return [offset + i * padding, y + 200];
    });
    (children || []).forEach((child, i) => {
      const { fullName, ids } = child;
      lines.push({ ...props, points: createPointsLine(parentsPoint, points[i]) });
      textBoxes.push({ ...props, point: points[i], ids, textArray: [fullName] });
      if (child.children) {
        renderChildren(child.children, points[i]);
      }
    });
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

          lines = [];
          textBoxes = [];
          positionElements(dimensions, svg, familyData, textBox.ids);
        }
      });
  });

};

export default positionElements;
