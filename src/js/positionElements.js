import * as d3 from 'd3';

import {
  getPointsMiddle,
  appendLine,
  createPointsLineDown,
  createPointsLineUp,
  appendTextBox,
} from 'src/js/createTree';

import { processData } from 'src/js/processData';

let lines = [];
let textBoxes = [];


const positionElements = (dimensions, svg, familyData, member) => {
  const data = processData(familyData, member);

  const { width } = dimensions;
  const boxWidth = 200;
  const middleX = width / 2;
  const middleY = 300;
  const spaceBetween = boxWidth + 100;
  const margin = 10;
  const unkownParent = 'Unknown';

  const props = { svg, dimensions, points: [], width: boxWidth };

  const mutateOffset = (array, depth, index, offset) => {
    let hasMutatedDepth = false;
    for (let i = index; i < array[depth].length; i++) {
      array[depth][i].offset += offset;
      const { childRef } = array[depth][i];
      if (!hasMutatedDepth && childRef) {
        const { start } = childRef;
        mutateOffset(array, depth + 1, start, offset);
        hasMutatedDepth = true;
      }
    }
  };


  const renderChildren = (children = [], originPoints) => {
    const childrenArray = [];
    const populateChildrenArray = (children, depth = 0) => {
      children.forEach((child) => {
        if (!childrenArray[depth]) {
          childrenArray[depth] = [];
        }
        if ((child.children || []).length) {
          const { children } = child;
          const start = (childrenArray[depth + 1] || []).length;
          const { length } = children;
          const end = start + length;
          child.childRef = { start, end };
          populateChildrenArray(children, depth + 1);
        }
        childrenArray[depth].push(child);
      });
    };
    populateChildrenArray(children);

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

    // In refactor consider using d3's enter
    childrenArray.forEach((array, depth) => {
      array.forEach(child => {
        const padding = boxWidth + margin;
        const x = originPoints[0];
        const position = x + (padding * child.offset) / 2;
        const y = originPoints[1] + (boxWidth * (depth + 1));
        child.point = [position, y];
        child.depth = depth + 1;
      });
    });

    const addToArrays = (children, originPoints) => {
      children.forEach((child) => {
        const { fullName, ids, point, depth } = child;
        lines.push({ ...props, points: createPointsLineDown(originPoints, point), delay: depth });
        textBoxes.push({ ...props, point, ids, textArray: [fullName], delay: depth });
        if ((child.children || []).length) {
          addToArrays(child.children, point);
        }
      });
    };

    addToArrays(children, originPoints);
  };

  const renderParents = (startingTargets) => {
    const parentsArray = [];
    const mockUp = [];

    const populateParentsArray = (parents, depth = 0) => {
      if (!parentsArray[depth]) {
        parentsArray[depth] = [];
      }
      for (let i = 0; i < 2; i++) {
        if (!parents[i]) {
          parents[i] = {
            fullName: unkownParent,
            unknown: true
          };
        }
        if ((parents[i].parents || []).length) {
          populateParentsArray(parents[i].parents, depth + 1);
        }
      }
      parentsArray[depth].push(parents);
    };

    startingTargets.forEach(origin => {
      const { parents = []} = origin;
      if (parents.length) {
        populateParentsArray(parents);
      }
    });

    const getMockChild = (curIndex, depth) => {
      const binary = curIndex.toString(2);
      const whichPartner = +binary.slice(-1);
      const childIndex = parseInt(+binary.slice(0, -1), 2);
      const position = mockUp[depth - 1][childIndex];

      return position && position[whichPartner];
    };

    for (let depth = 0, rowLength = startingTargets.length; depth < parentsArray.length; depth++) {
      const mockCopy = [...parentsArray[depth]];
      if (!mockUp[depth]) {
        mockUp[depth] = [];
      }
      for (let i = 0; i < rowLength; i++) {
        if (depth) {
          const mockChild = getMockChild(i, depth);
          if (mockChild && !mockChild.unknown) {
            mockUp[depth].push(mockCopy.pop());
          }
        } else {
          mockUp[depth].push(mockCopy.pop());
        }
      }
      rowLength *= 2;
    }

    const getPoint = (origin, position, depth) => {
      const depthOffset = parentsArray[depth].length * ((boxWidth + margin) / 2);
      const padding = boxWidth + margin;
      const positionX = (origin[0] + padding * position) - depthOffset;
      const positionY = origin[1] - boxWidth;
      return [positionX, positionY];
    };

    mockUp.forEach((depthArray, depth) => {
      depthArray.forEach((parents, i)=> {
        if (parents) {
          parents.forEach((parent, j) => {
            let startPoints;
            if (depth) {
              const child = getMockChild(i, depth);
              parent.point = getPoint(child.point, i + j, depth);
              startPoints = child.point;
            } else {
              const { points } = startingTargets[i];
              const parentPoint = getPoint(points, i + j, depth);
              if (startingTargets.length > 1) {
                const pointOffset = !i ? parentPoint[0] + boxWidth / 2 : parentPoint[0] - boxWidth / 2;
                parent.point = [pointOffset, parentPoint[1]];
              } else {
                parent.point = parentPoint;
              }
              startPoints = points;
            }
            const { fullName, ids, point } = parent;
            lines.push({ ...props, points: createPointsLineUp(startPoints, point)});
            textBoxes.push({ ...props, point, ids, textArray: [fullName]});
          });
        }
      });
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
      renderParents([target, targetPartner]);
    } else {
      target.points = [middleX, middleY];
      const middle = target.points;

      textBoxes.push({ ...props, point: target.points, textArray: [target.fullName] });

      renderChildren(target.children, middle);
      renderParents([target]);
    }
  };

  createTarget();

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
