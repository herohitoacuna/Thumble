export type CountData<T> = {
  total: number;
  page: number;
  limit: number;
  data: T;
};
