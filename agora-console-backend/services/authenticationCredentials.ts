import { getManager } from 'typeorm';
import { AuthenticationCredentials, CredentialsIsDownloaded, CredentialsStatus } from '../models/authenticationCredentials';

export const getAuthenticationCredentials = async (companyId: number, limit: number, offset: number): Promise<AuthenticationCredentials[]> => {
  const credentialDB = getManager().getRepository(AuthenticationCredentials);
  const credentialDBQuery = credentialDB.createQueryBuilder('credentials')
    .select(['credentials.downloaded', 'credentials.name', 'credentials.id'])
    .where('companyId = :companyId and status = :status', { companyId, status: CredentialsStatus.ENABLED })
    .offset(offset)
    .limit(limit);
  const authenticationCredentials: AuthenticationCredentials[] = await credentialDBQuery.getMany();
  return authenticationCredentials;
};

export const getAuthenticationCredentialsCount = async (companyId: number): Promise<number> => {
  const credentialDB = getManager().getRepository(AuthenticationCredentials);
  const credentialDBQuery = credentialDB.createQueryBuilder('credentials').where('companyId = :companyId and status = :status', { companyId, status: CredentialsStatus.ENABLED });
  const authenticationCredentialsCount: number = await credentialDBQuery.getCount();
  return authenticationCredentialsCount;
};

export const getCurrentCredential = async (companyId: number, key: string): Promise<AuthenticationCredentials> => {

  const authenticationCredentialsDB = getManager().getRepository(AuthenticationCredentials);
  const authenticationCredential: AuthenticationCredentials = await authenticationCredentialsDB.createQueryBuilder('credentials')
    .addSelect('credentials.pass')
    .where('companyId = :companyId and name = :key and status = :status', { companyId, key, status: CredentialsStatus.ENABLED })
    .getOne();
  return authenticationCredential;
};

export const createAuthenticationCredential = async (companyId: number, key: string, secret: string) => {
  const authenticationCredentialDB = getManager().getRepository(AuthenticationCredentials);

  const authenticationCredential = new AuthenticationCredentials();
  authenticationCredential.companyId = companyId;
  authenticationCredential.name = key;
  authenticationCredential.pass = secret;

  await authenticationCredentialDB.save(authenticationCredential);
};

export const setKeyToDownloaded = async (companyId: number, key: string) => {
  const authenticationCredentialDB = getManager().getRepository(AuthenticationCredentials);
  const authenticationCredential: AuthenticationCredentials = await authenticationCredentialDB.createQueryBuilder('credentials')
    .where('companyId = :companyId and name = :key', { companyId, key })
    .getOne();

  if (!authenticationCredential) return;

  authenticationCredential.downloaded = CredentialsIsDownloaded.DOWNLOADED;
  await authenticationCredentialDB.save(authenticationCredential);
};

export const deleteCurrentCredential = async (companyId: number, key: string) => {
  const authenticationCredentialDB = getManager().getRepository(AuthenticationCredentials);
  const authenticationCredential: AuthenticationCredentials = await authenticationCredentialDB.createQueryBuilder('credentials')
    .where('companyId = :companyId and name = :key', { companyId, key })
    .getOne();

  if (!authenticationCredential) return;
  authenticationCredential.status = CredentialsStatus.DISABLED;
  authenticationCredential.deletedAt = new Date();

  await authenticationCredentialDB.save(authenticationCredential);
};
