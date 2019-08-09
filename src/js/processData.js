const getMember = ({ familyNameId, memberId }, families) => {
  const family = families.find(family => family.familyNameId === familyNameId)
  const member = (family.members || []).find(
    member => member.memberId === memberId
  )
  return member || {}
}

const getExistingMembers = (members, families) =>
  members.filter(memberIds => getMember(memberIds, families).fullName)

const getParentsRecursively = (parentsIds, families) => {
  const { fullName, parents } = getMember(parentsIds, families)
  const parent = { fullName, ids: parentsIds }
  if ((parents || []).length) {
    const existingParents = getExistingMembers(parents, families)
    if (existingParents.length) {
      parent.parents = existingParents.map(parentIds =>
        getParentsRecursively(parentIds, families)
      )
    }
  }
  return parent
}

const getChildrenRecursively = (childIds, families) => {
  const { fullName, children, memberId } = getMember(childIds, families)
  const child = { fullName, memberId, ids: childIds }
  if ((children || []).length) {
    const existingChildren = getExistingMembers(children, families)
    if (existingChildren.length) {
      child.children = existingChildren.map(childIds =>
        getChildrenRecursively(childIds, families)
      )
    }
  }
  return child
}

const processData = ({ families }, targetIds) => {
  const target = getMember(targetIds, families)
  const { fullName, parents, children, memberId } = target
  const targetMember = { fullName, memberId }
  if (parents && parents.length) {
    targetMember.parents = parents.map(parentIds =>
      getParentsRecursively(parentIds, families)
    )
  }
  if (children && children.length) {
    targetMember.children = children.map(childIds =>
      getChildrenRecursively(childIds, families)
    )
  }
  const partners = getExistingMembers(target.partners, families).map(
    partnerIds => {
      const { fullName, parents, children, memberId } = getMember(
        partnerIds,
        families
      )
      const partner = { fullName, memberId, ids: partnerIds }
      if (parents) {
        partner.parents = parents.map(parentIds =>
          getParentsRecursively(parentIds, families)
        )
      }
      if (children && children.length) {
        partner.children = children.map(child => {
          const { memberId, fullName } = getMember(child, families)
          return { memberId, fullName, ids: child }
        })
      }
      return partner
    }
  )
  return [targetMember, ...partners]
}

// long term, should determine which children are shared... from which partners
// const isPartnerOfChildren = (member, partner) => {
//   return member.children.every((child, i) => {
//     return child.memberId === partner.children[i].memberId
//   })
// }

export { processData }
