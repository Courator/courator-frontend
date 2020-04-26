import Cookies from "universal-cookie";

export const cookies = new Cookies();
export const CLIENT_ID = 'ZmI3ZjA1ZTZhZGViM2QzNDlhMDYxMTI1';


export function formatUrlForm(fields) {
  return Object.keys(fields).map(
    key => encodeURIComponent(key) + '=' + encodeURIComponent(fields[key])
  ).join('&');
}


export function fieldsFilterer(fields) {
  return (inputValue, option) => {
    return fields.some(f => option[f].toUpperCase().indexOf(inputValue.toUpperCase()) !== -1);
  }
}
