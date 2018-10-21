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


  const getParentsRecursively = (parentsIds) => {
    const { fullName, parents, memberId } = getMember(parentsIds);
    const parent = { fullName, memberId };
    if ((parents || []).length) {
      const existingParents = getExistingMembers(parents);
      if (existingParents.length) {
        parent.parents = existingParents.map(getParentsRecursively);
      }
    }
    return parent;
  };

  const getChildrenRecursively = (childIds) => {
    const { fullName, children, memberId } = getMember(childIds);
    const child = { fullName, memberId };
    if ((children || []).length) {
      const existingChildren = getExistingMembers(children);
      if (existingChildren.length) {
        child.children = existingChildren.map(getParentsRecursively);
      }
    }
    return child;
  };

  const getFamilyObj = () => {
    const target = getMember(targetIds);
    const { fullName, parents, children, memberId } = target;
    const targetMember = { fullName, memberId };
    if (parents && parents.length) {
      targetMember.parents = parents.map(getParentsRecursively);
    }
    if (children && children.length) {
      targetMember.children = children.map(getChildrenRecursively);
    }
    const partners = getExistingMembers(target.partners).map(partnerIds => {
      const { fullName, parents, children, memberId } = getMember(partnerIds);
      const partner = { fullName, memberId };
      if (parents) {
        partner.parents = parents.map(getParentsRecursively);
      }
      if (children && children.length) {
        partner.children = children.map(child => {
          const { memberId, fullName } = getMember(child);
          return { memberId, fullName  };
        });
      }
      return partner;
    });
    return [ targetMember, ...partners ];
  };

  return getFamilyObj();
};

// long term, should determine which childre are shared... from which partners
export const isPartnerOfChildren = (member, partner) => {
  return member.children.every((child, i) => {
    return child.memberId === partner.children[i].memberId;
  });
};

export default processData;
