import React, { useState } from 'react';
import { Card, Input, Button, Tooltip, Form } from 'antd';
import { cardShadow } from '../format';
import { useHistory } from 'react-router-dom';
import { apiPut, apiDelete, apiPost } from '../apiBase';

import { EditOutlined } from '@ant-design/icons';
import { isLoggedIn } from '../api';

function UniversityDisplay({ name, code, description, website, onEdit }) {
  const history = useHistory();
  return <Card
    style={cardShadow}
    title={<div style={{ display: 'flex', justifyContent: 'space-between', height: 40, lineHeight: '40px' }}>
      <Button type='dashed' size='large' onClick={() => history.push('/university/' + code + '/course')}><p style={{ fontWeight: 500 }}>{name}</p></Button>
      <p style={{ fontWeight: 300 }}>{code}</p>
      {isLoggedIn() ? <Tooltip title="Edit">
        <Button type="dashed" shape="circle" icon={<EditOutlined />} onClick={onEdit} style={{ marginTop: '4px' }} />
      </Tooltip> : <div/>}
    </div>}
  >
    {description ? <p>{description}</p> : <></>}
    {website ?
      <p>Website: <a href={website}>{website}</a></p>
      : <></>}
  </Card>;
}

export function UniversityCard({ initialData, create, onModify }) {
  const [mode, setMode] = useState(create ? 'edit' : 'view');
  const [data, setData] = useState(initialData);
  const [lastData, setLastData] = useState(initialData);
  const [form] = Form.useForm();

  const onFinish = university => {
    if (create) {
      apiPost('/university', university).then(() => {
        onModify();
      })
    } else {
      const url = '/university/' + lastData.code;
      apiPut(url, university, {}).then(() => {
        setData(university);
        setLastData(university);
        setMode('view');
      });
    }
  };
  if (mode === 'view') {
    return <UniversityDisplay {...data} onEdit={e => {
      setMode('edit');
    }} />;
  }

  const padding = { marginRight: '10px' };
  return <Card style={cardShadow} title={(create ? 'Create' : 'Edit') + ' University'}>
    <Form form={form} onFinish={onFinish} initialValues={data}>
      <Form.Item label="Code" name="code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
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
          const url = '/university/' + lastData.code;
          apiDelete(url).then(() => onModify());
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
