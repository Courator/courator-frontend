import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Modal, Popover, Alert } from 'antd';
import { apiGetToken, saveToken } from './api';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
export const LoginModal = ({ visible, onLogin, onCancel, setLoggedIn }) => {
  const [form] = Form.useForm();
  const [forgotVisible, setForgotVisible] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  function attemptLogin() {
    form
      .validateFields()
      .then(formVals => {
        setLoading(true);
        apiGetToken(formVals.username, formVals.password).then(token => {
          saveToken(token);
          setLoggedIn(true);
        }).catch(e => {
          if (e.status === 401) {
            setLoginError('account');
          }
          else {
            throw e;
          }
        }).finally(() => {
          form.resetFields();
          setLoading(false);
        });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  }
  return (<Modal visible={visible} title="Login" footer={null} onCancel={onCancel}>
    <Form name="normal_login" className="login-form" id='login-form' form={form} initialValues={{
      remember: true,
    }}>
      {loginError === 'account' ? <><Alert message="Incorrect login credentials" type="error" showIcon /><br /></> : <></>}
      <Form.Item name="username" rules={[
        {
          required: true,
          message: 'Please input your Username!',
        },
      ]}>
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item name="password" rules={[
        {
          required: true,
          message: 'Please input your Password!',
        },
      ]}>
        <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Popover content={<>{"Well, too Bad. No seriously, we"}<br />{"can't do anything about it D:"}</>} trigger="click" visible={forgotVisible} onVisibleChange={v => setForgotVisible(v)}>
          <p className="login-form-forgot" style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => setForgotVisible(true)}>
            Forgot password
            </p>
        </Popover>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={attemptLogin} loading={loading}>
          Log in
          </Button>
          Or <Link to='/register' onClick={() => onCancel()}>register now!</Link>
      </Form.Item>
    </Form>
  </Modal>);
};
