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
  const unkownParent = 'Unkonwn';

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
        const y = originPoints[1] + (200 * (depth + 1));
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

  //  coupleOffset is quickfix. Should be refactored

  const renderParents = (parents = [], originPoints) => {
    const parentsArray = [];
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
    populateParentsArray(parents);

    const mockUp = [];
    const getMockChild = (curIndex, depth) => {
      const binary = curIndex.toString(2);
      const whichPartner = +binary.slice(-1);
      const childIndex = parseInt(+binary.slice(0, -1), 2);

      const position = mockUp[depth - 1][childIndex];
      return position && position[whichPartner];
    };

    for (let depth = 0, rowLength = 1; depth < parentsArray.length; depth++) {
      const mockCopy = [...parentsArray[depth]];
      if (!mockUp[depth]) {
        mockUp[depth] = [];
      }
      for (let i = 0; i < rowLength; i++) {
        if (i) {
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

    console.log(mockUp)

    mockUp.forEach((depthArray, depth) => {
      depthArray.forEach((parents, i)=> {
        if (parents) {
          parents.forEach((parent, j) => {

            if (depth) {
              const child = getMockChild(i, depth);

              const padding = boxWidth + margin;
              const positionX = child.point[0] + (padding * (i + j));
              const positionY = (child.point[1] - 200);
              parent.point = [positionX, positionY];

              const { fullName, ids, point } = parent;
              // debugger
              lines.push({ ...props, points: createPointsLineUp(child.point, point)});
              textBoxes.push({ ...props, point, ids, textArray: [fullName]});
            } else {
              const padding = boxWidth + margin;
              const positionX = originPoints[0] + (padding * (i + j));
              const positionY = (originPoints[1] - 200);
              parent.point = [positionX, positionY];

              const { fullName, ids, point } = parent;
              // originPoints
              lines.push({ ...props, points: createPointsLineUp(originPoints, point)});
              textBoxes.push({ ...props, point, ids, textArray: [fullName]});
            }
          });
        }
      });
    });
    // const padding = boxWidth + margin;
    // const x = originPoints[0];
    // const position = x + (padding * child.offset) / 2;
    // const y = originPoints[1] + (200 * (depth + 1));
    // child.point = [position, y];
    // child.depth = depth + 1;
    // (parents || []).forEach((parent, i) => {
    //   const { fullName, ids } = parent;
    //   lines.push({ ...props, points: createPointsLineUp(originPoints, points[i])});
    //   textBoxes.push({ ...props, point: points[i], ids, textArray: [fullName]});
    //   if (parent.parents) {
    //     renderParents123(parent.parents, points[i], depth + 1);
    //   }
    // });
  };

  const renderParents123 = (parents, originPoints, depth = 0, coupleOffset = 0) => {
    let duplicateOffset = 0;
    const points = (parents || []).map((parent, i) => {
      const padding = boxWidth + margin;
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
      lines.push({ ...props, points: createPointsLineUp(originPoints, points[i])});
      textBoxes.push({ ...props, point: points[i], ids, textArray: [fullName]});
      if (parent.parents) {
        renderParents123(parent.parents, points[i], depth + 1);
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
      renderParents(target.parents, target.points);
      // renderParents123(target.parents, target.points, 1, 1);
      renderParents(targetPartner.parents, targetPartner.points);
      // renderParents123(targetPartner.parents, targetPartner.points, 1, 1);
    } else {
      target.points = [middleX, middleY];
      const middle = target.points;

      textBoxes.push({ ...props, point: target.points, textArray: [target.fullName] });

      renderChildren(target.children, middle);
      renderParents(target.parents, target.points);
      // renderParents123(target.parents, target.points);
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
