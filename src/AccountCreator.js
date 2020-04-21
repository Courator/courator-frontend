import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Input, Button, Card, Form } from 'antd';
import { apiPost } from './api';
import { cookies } from "./util";
import { cardShadow, layout, tailLayout } from "./format";

export function AccountCreator() {
  const history = useHistory();
  const [error, setError] = useState('');
  const [emailErrorState, setEmailErrorState] = useState('');
  const [form] = Form.useForm();
  function onFinish(account) {
    const entry = Object.fromEntries(Object.entries(account).filter(([key, _]) => !key.startsWith('_')));
    apiPost('/account', entry).then(account => {
      cookies.set('accountID', account.id.toString(), { path: '/', maxAge: 60 * 60 * 24 * 7 });
      history.push('/');
    }).catch(e => {
      if (e.status === 409) {
        setError({ field: 'email', value: entry.email });
        setEmailErrorState(true);
      }
    });
  }
  ;
  return <Card style={cardShadow} title='Create an account'>
    <Form {...layout} onFinish={onFinish} form={form}>
      <Form.Item label="Full Name" name="name" rules={[{ required: false }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Email" name="email" validateStatus={emailErrorState ? 'error' : 'success'} help={emailErrorState ? 'Email already taken.' : undefined} rules={[{ type: 'email', required: true }]}>
        <Input onChange={e => {
          setEmailErrorState(error.field === 'email' && error.value === e.target.value);
        }} />
      </Form.Item>

      <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter a short name (something like UIUC)' }]}>
        <Input.Password />
      </Form.Item>

      <Form.Item name="_confirm" label="Confirm Password" dependencies={['password']} hasFeedback rules={[
        {
          required: true,
          message: 'Please confirm your password!',
        },
        ({ getFieldValue }) => ({
          validator(rule, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject('The two passwords that you entered do not match!');
          },
        }),
      ]}>
        <Input.Password />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Create Account
          </Button>
      </Form.Item>
    </Form>
  </Card>;
}
