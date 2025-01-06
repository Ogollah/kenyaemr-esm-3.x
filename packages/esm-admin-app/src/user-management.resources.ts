import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import { Provider, Role, User } from './config-schema';

export const useUser = () => {
  const url = `${restBaseUrl}/user?v=custom:(uuid,username,display,systemId,retired,person:(uuid,display,gender,names:(givenName,familyName,middleName),attributes:(uuid,display)),roles:(uuid,description,display,name))`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<User> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    users: data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const postUser = async (user: Partial<User>, url: string) => {
  const response = await openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const createProvider = async (uuid: string, identifier: string) => {
  const providerUrl = `${restBaseUrl}/provider`;
  const providerBody = {
    person: uuid,
    identifier: identifier,
    attributes: [],
    retired: false,
  };

  return await openmrsFetch(providerUrl, {
    method: 'POST',
    body: JSON.stringify(providerBody),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createUser = async (user: Partial<User>, setProvider: boolean, uuid?: string) => {
  const url = uuid ? `${restBaseUrl}/user/${uuid}` : `${restBaseUrl}/user`;

  const response = await postUser(user, url);

  if (setProvider && response.person && response.person.uuid) {
    const personUUID = response.person.uuid;
    const identifier = response.systemId;
    return await createProvider(personUUID, identifier);
  }

  return response;
};

export const handleMutation = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
};

export const useRoles = () => {
  const url = `${restBaseUrl}/role?v=custom:(uuid,description,display,name)`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<Role> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    roles: data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const usePersonAttribute = () => {
  const url = `${restBaseUrl}/personattributetype?v=custom:(name,uuid)`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<Role> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    attributeTypes: data?.data?.results,
    isLoading,
    error,
  };
};

export const useProvider = (systemId: string) => {
  const url = `${restBaseUrl}/provider?q=${systemId}&v=custom:(uuid,identifier,retired)`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<Provider> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    provider: data?.data?.results,
    isLoading,
    error,
  };
};
