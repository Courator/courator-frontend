import { apiGet } from '../apiBase';
import { fieldsFilterer } from '../util';

export function univChooserProps(universities) {
  return {
    style: { width: 200 },
    placeholder: "Enter a university",
    filterOption: fieldsFilterer(['name', 'code']),
    options: universities
  }
};

export function univChooserRule(universities) {
  return ({ getFieldValue }) => ({
    validator(rule, value) {
      const university = universities.find(x => x.code === value);
      if (university !== undefined) {
        return Promise.resolve();
      }
      return Promise.reject('Please select a university.');
    },
  });
}

export async function getUniversityOptions() {
  return (await apiGet('/university', { auth: false })).map(
    v => ({ value: v.code, label: v.name, ...v })
  );
}