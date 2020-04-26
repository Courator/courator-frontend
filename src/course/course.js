import { apiGet } from "../apiBase";

export async function getCourseOptions(universityCode) {
  return (await apiGet('/university/' + universityCode + '/course', { auth: false })).map(
    v => ({ value: v.code, label: v.code + ': ' + v.name, ...v })
  );
}
