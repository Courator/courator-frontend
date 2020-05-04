import React, { useEffect, useState } from 'react';
import { Button, Row, Col, PageHeader } from 'antd';
import { getUniversityOptions } from './university';

import { UniversityCard } from './UniversityCard';
import { isLoggedIn } from '../api';

import { PlusOutlined } from '@ant-design/icons';

export function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const updateUniversities = () => { getUniversityOptions().then(u => setUniversities(u)); };
  useEffect(updateUniversities, []);
  return <>
    <PageHeader title='Universities'>
      <Row gutter={[20, 20]} type='flex' justify='center' align='top'>

        <Col sm={24} xs={24}>
          <Row gutter={[20, 20]} type='flex' justify='center' align='top'>
            {universities.map(u => (<Col key={u.code} sm={12} xs={24}>
              <UniversityCard initialData={u} onModify={updateUniversities} create={false} />
            </Col>))}
            {isLoggedIn() ? <Col key='_create' sm={12} xs={24}>
              {addOpen ?
                <UniversityCard initialData={undefined} onModify={() => { setAddOpen(false); updateUniversities(); }} create={true} /> :
                <Button type='dashed' block icon={<PlusOutlined />} onClick={() => setAddOpen(true)}></Button>}
            </Col> : <></>}
          </Row>
        </Col>
      </Row>
    </PageHeader>
  </>;
}
