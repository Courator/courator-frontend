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

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
export function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}
