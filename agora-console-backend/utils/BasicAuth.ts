export interface BasicAuthConfig {
  urlBase: string;
  username: string;
  password: string;
}

function utf8ToBase64(content: string) {
  return Buffer.from(content).toString('base64');
}

export class BasicAuth {
  public static makeAuth(username: string, password: string) {
    const userpwd = `${username}:${password}`;
    return `Basic ${utf8ToBase64(userpwd)}`;
  }
}
