import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Card, Skeleton, PageHeader } from 'antd';
import { getCourseOptions } from './course';

import { CourseCard } from './CourseCard';
import { isLoggedIn } from '../api';

import { PlusOutlined } from '@ant-design/icons';
import { cardShadow } from '../format';

export function CoursesPage({ universityCode }) {
  const [courses, setCourses] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const updateCourses = () => {
    getCourseOptions(universityCode).then(u => {
      setLoading(false);
      setCourses(u);
    });
  };
  useEffect(updateCourses, []);
  return <>
    <PageHeader title='Courses' breadcrumb={{
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
        }
      ]
    }}>
      <Row gutter={[20, 20]} type='flex' justify='center' align='top'>
        <Col sm={24} xs={24}>
          <Row gutter={[20, 20]} type='flex' justify='center' align='top'>
            {loading ? [1, 2, 3, 4].map(i => <Col key={i} sm={12} xs={24}>
              <Card style={cardShadow}>
                <Skeleton active />
              </Card>
            </Col>) : courses.map(u => (<Col key={u.code} sm={12} xs={24}>
              <CourseCard initialData={u} code={u.code} universityCode={universityCode} onModify={updateCourses} create={false} />
            </Col>))}
            {!loading && isLoggedIn() ? <Col key='_create' sm={12} xs={24}>
              {addOpen ?
                <CourseCard universityCode={universityCode} onModify={() => { setAddOpen(false); updateCourses(); }} create={true} /> :
                <Button type='dashed' block icon={<PlusOutlined />} onClick={() => setAddOpen(true)}></Button>}
            </Col> : <></>}
          </Row>
        </Col>
      </Row>
    </PageHeader>

  </>;
}
