const processData = (
  { families },
  targetIds
) => {
  // console.log(families)
  const getMember = ({ familyNameId, memberId }) => {
    const family = (families || []).find(family => family.familyNameId === familyNameId);
    const member = (family.members || []).find(member => member.memberId === memberId);
    return member || {};
  };


  const getDepth = (targetIds, type) => {
    const getDepthRecursively = (targetIds) => {
      const member = getMember(targetIds);
      if ((member[type] || []).length) {
        // Filter out members that have indexes, but are not on the tree
        const existingMembers = member[type].filter(memberIds => {
          return getMember(memberIds).fullName;
        });
        return Math.max(...existingMembers.map(getDepthRecursively)) + 1;
      }
      return 0;
    };
    return getDepthRecursively(targetIds);
  };

  const target = getMember(targetIds);

  const childrenDepth = getDepth(targetIds, 'children');
  const parentDepth = Math.max(...[targetIds, ...target.partners]
    .map(ids => getDepth(ids, 'parents')));

  console.log('childrenDepth', childrenDepth)
  console.log('parentDepth', parentDepth)
  console.log('target', target)

};

export default processData;
