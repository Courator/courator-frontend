export const cardShadow = { WebkitBoxShadow: '1px 1px 10px #eee', boxShadow: '1px 1px 10px #eee' };
export const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
export const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export function formatCourseCode(code) {
  const [, department, number] = code.match(/([A-Z]+)([0-9]+)/);
  return `${department} ${number}`;
}

export function formatCourseName(code, title) {
  return `${formatCourseCode(code)}: ${title}`;
}
