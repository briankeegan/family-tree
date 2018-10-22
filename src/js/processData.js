const getMember = ({ familyNameId, memberId }, families) => {
  const family = families.find(family => family.familyNameId === familyNameId);
  const member = (family.members || []).find(member => member.memberId === memberId);
  return member || {};
};

const getExistingMembers = (members, families) => (
  members.filter(memberIds => getMember(memberIds, families).fullName)
);

const getDepthObj = (
  { families },
  targetIds
) => {

  const getDepth = (targetIds, type) => {
    const getDepthRecursively = (targetIds) => {
      const member = getMember(targetIds, families);
      if ((member[type] || []).length) {
        const existingMembers = getExistingMembers(member[type], families);
        return Math.max(...existingMembers.map(getDepthRecursively)) + 1;
      }
      return 0;
    };
    return getDepthRecursively(targetIds);
  };

  const target = getMember(targetIds, families);
  const childrenDepth = getDepth(targetIds, 'children');
  const parentDepth = Math.max(...[targetIds, ...target.partners]
    .map(ids => getDepth(ids, 'parents')));
    return { childrenDepth, parentDepth };
};

const processData = (
  { families },
  targetIds
) => {

  const getParentsRecursively = (parentsIds) => {
    const { fullName, parents, memberId } = getMember(parentsIds, families);
    const parent = { fullName, memberId };
    if ((parents || []).length) {
      const existingParents = getExistingMembers(parents, families);
      if (existingParents.length) {
        parent.parents = existingParents.map(getParentsRecursively);
      }
    }
    return parent;
  };

  const getChildrenRecursively = (childIds) => {
    const { fullName, children, memberId } = getMember(childIds, families);
    const child = { fullName, memberId };
    if ((children || []).length) {
      const existingChildren = getExistingMembers(children, families);
      if (existingChildren.length) {
        child.children = existingChildren.map(getParentsRecursively);
      }
    }
    return child;
  };

  const getFamilyObj = () => {
    const target = getMember(targetIds, families);
    const { fullName, parents, children, memberId } = target;
    const targetMember = { fullName, memberId };
    if (parents && parents.length) {
      targetMember.parents = parents.map(getParentsRecursively);
    }
    if (children && children.length) {
      targetMember.children = children.map(getChildrenRecursively);
    }
    const partners = getExistingMembers(target.partners, families).map(partnerIds => {
      const { fullName, parents, children, memberId } = getMember(partnerIds, families);
      const partner = { fullName, memberId };
      if (parents) {
        partner.parents = parents.map(getParentsRecursively);
      }
      if (children && children.length) {
        partner.children = children.map(child => {
          const { memberId, fullName } = getMember(child, families);
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
const isPartnerOfChildren = (member, partner) => {
  return member.children.every((child, i) => {
    return child.memberId === partner.children[i].memberId;
  });
};

export { processData, getDepthObj, isPartnerOfChildren };
