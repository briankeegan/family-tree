const processData = (
  { families },
  targetIds
) => {
  const getMember = ({ familyNameId, memberId }) => {
    const family = (families || []).find(family => family.familyNameId === familyNameId);
    const member = (family.members || []).find(member => member.memberId === memberId);
    return member || {};
  };

  const getExistingMembers = members => (
    members.filter(memberIds => getMember(memberIds).fullName)
  );

  const getDepth = (targetIds, type) => {
    const getDepthRecursively = (targetIds) => {
      const member = getMember(targetIds);
      if ((member[type] || []).length) {
        const existingMembers = getExistingMembers(member[type]);
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

  const depth = childrenDepth + parentDepth;
  console.log('depth', depth)
  const targetDepth = depth - parentDepth;
  console.log('targetDepth', targetDepth)

  const getParentsRecursively = (parentsIds) => {
    const { fullName, parents } = getMember(parentsIds);
    const parent = { fullName };
    if ((parents || []).length) {
      const existingParents = getExistingMembers(parents);
      if (existingParents.length) {
        parent.parents = existingParents.map(getParentsRecursively);
      }
    }
    return parent;
  };


  const getFamilyObj = () => {
    const existingPartner = getExistingMembers([targetIds, ...target.partners]);
    return existingPartner.map(partnerIds => {
      const { fullName, parents } = getMember(partnerIds);
      const partner = { fullName };
      if (parents) {
        partner.parents = parents.map(getParentsRecursively)
      }
      return partner;
    });
  };

  console.log('getFamilyObj(target)', getFamilyObj(target))
};

export default processData;
