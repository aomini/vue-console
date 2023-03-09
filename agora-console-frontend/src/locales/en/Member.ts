const en = {
  MemberModuleName: 'Member & Role',
  MemberMenus: [
    { to: 'member.Member', title: 'Member Management' },
    { to: 'member.Role', title: 'Role Management' },
  ],
  RoleTitle: 'Role Management',
  'Role Management': 'Role Management',
  RoleMessage:
    'Here you can create and manage all roles with varying levels of access to information in the account. We have provided 5 pre-set roles to start with (not editable).',
  AddRole: 'Add a Role',
  RoleName: 'Role Name',
  Data: 'Data',
  FailedLoadData: 'Failed to load role information',
  ProjectsPlaceholder: 'Please select projects',
  ProjectAmount: '%{amount} Project',
  ProjectsAmount: '%{amount} Projects',
  RemoveRole: 'Delete Role',
  RemoveRoleConfirm: 'Are you sure delete this user?',
  SelectAllProjects: 'All Projects',
  DeleteWarning: 'Please reassign members in this role to other roles before deleting this one',
  FailedCreateRole: 'Failed to create role',
  FailedUpdateRole: 'Failed to update role',
  RoleNameEmpty: 'Role name is required',
  RoleNameExist: 'Role name exists already',
  RoleLinkedMember: 'Please reassign members in this role to other roles before deleting this one',
  SuccessDeleteRole: 'This role is deleted successfully',
  FinanceHint: 'Enable finance access will allow users to receive relavant finance messages',
  DataHint: 'If the role can edit projects, its members can manage projects created by them.',
  NoMember: 'No member',
  ShowVendorCreator: 'Show Project Creator',
}

const MemberI18nEn = Object.assign({}, en)
export default MemberI18nEn
