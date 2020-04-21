import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Input, Button, Card, AutoComplete, Form } from 'antd';
import { apiPatch } from '../api';
import { getUniversityOptions, univChooserRule, univChooserProps } from './university';
import { cardShadow, layout, tailLayout } from "../format";

export function UniversityUpdator() {
  const [universities, setUniversities] = useState([]);
  const history = useHistory();
  useEffect(() => {
    getUniversityOptions().then(u => setUniversities(u));
  }, []);
  const onFinish = university => {
    const url = '/university/' + university.universityShortName;
    delete university.universityShortName;
    apiPatch(url, university, {}).then(t => {
      history.push('/');
    });
  };
  const [form] = Form.useForm();
  return <Card style={cardShadow} title='Add a University'>
    <Form {...layout} form={form} onFinish={onFinish}>
      <Form.Item label="University Identifier (Short Name)" name="universityShortName" rules={[{ required: true }, univChooserRule(universities)]}>
        <AutoComplete {...univChooserProps(universities)} onChange={shortName => {
          const match = universities.find(u => u.shortName === shortName);
          if (match !== undefined) {
            form.setFieldsValue({ name: match.name, shortName: match.shortName, website: match.website || '' });
          }
        }} />
      </Form.Item>

      <Form.Item label="Full Name" name="name" rules={[{ required: false }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Short Name" name="shortName" rules={[{ required: false }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Website" name="website" rules={[{ required: false }]}>
        <Input />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Update University
          </Button>
      </Form.Item>
    </Form>
  </Card>;
}
