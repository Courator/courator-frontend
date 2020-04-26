import React, { useEffect, useState } from 'react';
import { Button, PageHeader, Tag } from 'antd';
import { apiGet } from '../apiBase';
import { formatCourseName } from '../format';


export function CoursePage({ universityCode, courseCode }) {
  const [course, setCourse] = useState({});
  useEffect(() => {
    apiGet(`/university/${universityCode}/course/${courseCode}`, { auth: false }).then(c => setCourse(c));
  }, [courseCode, universityCode]);
  return <>
    <PageHeader title={formatCourseName(courseCode, course.title)} className="site-page-header" tags={<Tag color="blue">Fall 2020</Tag>} extra={[
      <Button key="3">Website</Button>,
      <Button key="2">Info</Button>,
      <Button key="1" type="primary">
        Rate
      </Button>,
    ]} avatar={{ src: 'https://avatars1.githubusercontent.com/u/8186664?s=460&v=4' }} breadcrumb={{
      routes: [
        {
          path: '/university',
          breadcrumbName: 'Universities',
        },
        {
          path: '/' + universityCode,
          breadcrumbName: universityCode,
        },
        {
          path: '/course',
          breadcrumbName: 'Courses',
        },
        {
          path: '/' + courseCode,
          breadcrumbName: courseCode,
        }
      ]
    }}>
      {course.description}
    </PageHeader>
  </>;
}
