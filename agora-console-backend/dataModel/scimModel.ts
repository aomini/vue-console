// tslint:disable-next-line:no-null-keyword
const NULL = null;

export function createSCIMUserList(
  rows: any[],
  startIndex: number,
  count: number,
  total: number,
  reqUrl: string
) {
  const scimResource = {
    'Resources': [],
    'itemsPerPage': 0,
    'schemas': ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    'startIndex': 0,
    'totalResults': 0
  };

  const resources = [];
  rows.forEach(row => {
    resources.push(parseSCIMUser(row, `${ reqUrl }/${ row['id'] }`));
  });

  scimResource['Resources'] = resources;
  scimResource['startIndex'] = startIndex;
  scimResource['itemsPerPage'] = count;
  scimResource['totalResults'] = total;

  return scimResource;
}

export function createSCIMGroupList(
  rows: any[],
  startIndex: number,
  count: number,
  total: number,
  reqUrl: string
) {
  const scimResource = {
    'Resources': [],
    'itemsPerPage': 0,
    'schemas': ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    'startIndex': 0,
    'totalResults': 0
  };

  const resources = [];
  rows.forEach(row => {
    resources.push(parseSCIMGroup(row, `${ reqUrl }/${ row['id'] }`));
  });

  scimResource['Resources'] = resources;
  scimResource['startIndex'] = startIndex;
  scimResource['itemsPerPage'] = count;
  scimResource['totalResults'] = total;

  return scimResource;
}

export function parseSCIMUser(
  row: object,
  reqUrl: string
) {
  return createSCIMUser(
    row['id'],
    row['active'],
    row['userName'],
    row['givenName'],
    row['familyName'],
    row['email'],
    row['groups'],
    reqUrl
  );
}

export function createSCIMUser(
  userId: string | number,
  active: boolean,
  userName: string,
  givenName: string,
  familyName: string,
  email: string,
  groups: string[] | number[],
  reqUrl: string
) {
  const scimUser = {
    'schemas': ['urn:ietf:params:scim:schemas:core:2.0:User'],
    'id': NULL,
    'userName': NULL,
    'name': {
      'givenName': NULL,
      'middleName': '',
      'familyName': NULL
    },
    'emails': [{
      'primary': true,
      'value': NULL,
      'type': 'work',
      'display': NULL
    }],
    'active': false,
    'groups': [],
    'meta': {
      'resourceType': 'User',
      'location': NULL
    }
  };

  scimUser['meta']['location'] = reqUrl;
  scimUser['id'] = userId;
  scimUser['active'] = active;
  scimUser['userName'] = userName;
  scimUser['name']['givenName'] = givenName;
  scimUser['name']['familyName'] = familyName;
  scimUser['emails'][0]['value'] = email;
  scimUser['emails'][0]['display'] = email;
  scimUser['groups'] = groups;

  return scimUser;
}

export function parseSCIMGroup(
  row: object,
  reqUrl: string
) {
  return createSCIMGroup(row['id'], row['displayName'], row['members'], reqUrl);
}

export function createSCIMGroup(
  groupId: string | number,
  displayName: string,
  members: string[] | number[],
  reqUrl: string
) {
  const scimGroup = {
    'schemas': ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    'id': NULL,
    'displayName': NULL,
    'members': [],
    'meta': {
      'resourceType': 'Group',
      'location': NULL
    }
  };

  scimGroup['id'] = groupId;
  scimGroup['displayName'] = displayName;
  scimGroup['members'] = members;
  scimGroup['meta']['location'] = reqUrl;

  return scimGroup;
}

export function createSCIMError(
  errorMessage: string,
  statusCode: number
) {
  const scimError = {
    'schemas': ['urn:ietf:params:scim:api:messages:2.0:Error'],
    'detail': NULL,
    'status': NULL
  };

  scimError['detail'] = errorMessage;
  scimError['status'] = statusCode;

  return scimError;
}

export function createMembership(groupId, userId, groupDisplay, userDisplay) {
  const membership = {
    'groupId': NULL,
    'userId': NULL,
    'groupDisplay': NULL,
    'userDisplay': NULL
  };

  membership['groupId'] = groupId;
  membership['userId'] = userId;
  membership['groupDisplay'] = groupDisplay;
  membership['userDisplay'] = userDisplay;

  return membership;
}

export function createSchemaGroup(groupId, displayName) {
  const group = {
    'value': NULL,
    '$ref': NULL,
    'display': NULL
  };

  group['value'] = groupId;
  group['$ref'] = `../Groups/${ groupId }`;
  group['display'] = displayName;

  return group;
}

export function createSchemaUser(userId, displayName) {
  const user = {
    'value': NULL,
    '$ref': NULL,
    'display': NULL
  };

  user['value'] = userId;
  user['$ref'] = `../Users/${ userId }`;
  user['display'] = displayName;

  return user;
}

export const UserParse = {
  parseFromSCIMResource: (payload) => {
    const user = {
      'active': false,
      'userName': '',
      'givenName': '',
      'familyName': '',
      'email': '',
      'groups': []
    };

    user['active'] = payload['active'];
    user['userName'] = payload['userName'];
    user['givenName'] = payload['name']['givenName'];
    user['familyName'] = payload['name']['familyName'];
    user['email'] = payload['emails'][0]['value'];

    const groups = [];

    for (let i = 0; i < payload['groups'].length; i++) {
      groups.push(UserParse.parseGroups(payload['groups'][i]));
    }

    user['groups'] = groups;

    return user;
  },

  parseGroups: (payload) => {
    const group = {
      'value': NULL,
      'ref': NULL,
      'display': NULL
    };

    group['value'] = payload['value'];
    group['ref'] = payload['$ref'];
    group['display'] = payload['display'];

    return group;
  }
};

export const GroupParse = {
  parseFromSCIMResource: (payload) => {
    const group = {
      'id': NULL,
      'displayName': NULL,
      'members': []
    };

    group['id'] = payload['id'];
    group['displayName'] = payload['displayName'];

    const members = [];

    for (let i = 0; i < payload['members'].length; i++) {
      members.push(GroupParse.parseMemberships(payload['members'][i]));
    }

    group['members'] = members;

    return group;
  },

  parseMemberships: (payload) => {
    const member = {
      'value': NULL,
      'ref': NULL,
      'display': NULL
    };

    member['value'] = payload['value'];
    member['ref'] = payload['$ref'];
    member['display'] = payload['display'];

    return member;
  }
};
