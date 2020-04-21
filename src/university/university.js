import { apiGet } from '../api';

export function univChooserProps(universities) {
    return {
        style: { width: 200 },
        placeholder: "Enter a university",
        filterOption: (inputValue, university) => {
            let a = university.name.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
            let b = university.shortName.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
            return a || b;
        },
        options: universities
    }
};

export function univChooserRule(universities) {
    return ({ getFieldValue }) => ({
        validator(rule, value) {
            const university = universities.find(x => x.shortName === value);
            if (university !== undefined) {
                return Promise.resolve();
            }
            return Promise.reject('Please select a university.');
        },
    });
}

export async function getUniversityOptions() {
    return (await apiGet('/university')).map(
        v => ({ value: v.shortName, label: v.name, ...v })
    );
}