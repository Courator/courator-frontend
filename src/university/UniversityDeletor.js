import React from 'react';
import { useHistory } from 'react-router-dom';
import { Input, Button, Card, Form } from 'antd';
import { apiDelete } from '../api';
import { cardShadow, layout, tailLayout } from "../format";
export function UniversityDeletor() {
  const history = useHistory();
  const onFinish = university => {
    apiDelete('/university/' + university.shortName).then(t => {
      history.push('/');
    });
  };
  return <Card style={cardShadow} title='Add a University'>
    <Form {...layout} onFinish={onFinish}>
      <Form.Item label="University Identifier (Short Name)" name="shortName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Delete University
        </Button>
      </Form.Item>
    </Form>
  </Card>;
}
