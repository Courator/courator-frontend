import React, { useState } from 'react';
import { Card, Input, Button, Tooltip, Form } from 'antd';
import { cardShadow, formatCourseName } from '../format';
import { useHistory } from 'react-router-dom';
import { apiPut, apiDelete, apiPost } from '../apiBase';

import { EditOutlined } from '@ant-design/icons';

function CourseDisplay({ title, code, description, website, universityCode, onEdit }) {
  const history = useHistory();
  return <Card
    style={cardShadow}
    title={<div style={{ display: 'flex', justifyContent: 'space-between', height: 40, lineHeight: '40px' }}>
      <Button type='dashed' size='large' onClick={() => history.push('/university/' + universityCode + '/course/' + code)}><p style={{ fontWeight: 500 }}>{formatCourseName(code, title)}</p></Button>
      <Tooltip title="Edit">
        <Button type="dashed" shape="circle" icon={<EditOutlined />} onClick={onEdit} />
      </Tooltip>
    </div>}
  >
    {description ?
      <p>{description}</p>
      : <></>}
    {website ?
      <p>Website: <a href={website}>{website}</a></p>
      : <></>}
  </Card>;
}

export function CourseCard({ initialData, code, universityCode, create, onModify }) {
  if (initialData && initialData.code) {
    delete initialData.code;
  }
  const [mode, setMode] = useState(create ? 'edit' : 'view');
  const [data, setData] = useState(initialData);
  const [lastData, setLastData] = useState(initialData);
  const [form] = Form.useForm();

  const onFinish = course => {
    if (create) {
      apiPost('/university/' + universityCode + '/course', course).then(() => {
        onModify();
      })
    } else {
      const url = '/university/' + universityCode + '/course/' + code;
      apiPut(url, course, {}).then(() => {
        setData(course);
        setLastData(course);
        setMode('view');
      });
    }
  };
  if (mode === 'view') {
    return <CourseDisplay {...data} code={code} universityCode={universityCode} onEdit={e => {
      setMode('edit');
    }} />;
  }

  const padding = { marginRight: '10px' };
  return <Card style={cardShadow} title={create ? 'Create Course' : `Edit Course ${code}`}>
    <Form form={form} onFinish={onFinish} initialValues={data}>
      {create ? <Form.Item label="Code" name="code" rules={[{ required: true }]}>
        <Input />
      </Form.Item> : <></>}

      <Form.Item label="Title" name="title" rules={[{ required: false }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Description" name="description" rules={[{ required: false }]}>
        <Input.TextArea />
      </Form.Item>

      <Form.Item label="Website" name="website" rules={[{ required: false }]}>
        <Input />
      </Form.Item>

      <Form.Item>
        {create ? <></> : <Button type="primary" danger style={padding} onClick={() => {
          const url = '/university/' + universityCode + '/course/' + code;
          apiDelete(url).then(() => onModify())
        }}>
          Delete
        </Button>}
        <Button type="primary" style={padding} htmlType="submit">
          {create ? 'Create' : 'Update'}
        </Button>
        <Button style={padding} onClick={() => {
          if (create) {
            onModify();
          } else {
            setData(lastData);
            setMode('view');
          }
        }}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  </Card>
}
