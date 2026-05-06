import type { $Fetch, NitroFetchRequest } from "nitropack";

export abstract class BaseApiService {
  constructor(protected readonly $http: $Fetch<unknown, NitroFetchRequest>) {}
}
