import React, { useEffect, useState } from 'react'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './App.css'
import Cookies from "universal-cookie";

import {
  Input,
  Button,
  Layout,
  Menu,
  Card,
  Row,
  Col,
  AutoComplete,
  Form,
  Skeleton
} from 'antd';

const { Header, Content, Footer } = Layout;

const cardShadow = { WebkitBoxShadow: '1px 1px 10px #eee', boxShadow: '1px 1px 10px #eee' };

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const cookies = new Cookies();
const baseUrl = process.env.REACT_APP_COURATOR_API_URL || '';


class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.message = message + ' (' + status.toString() + ')';
    this.status = status;
  }
}

async function apiResolve(r) {
  if (!r.ok) {
    let e;
    try {
      e = new ApiError((await r.json()).message, r.status)
    } catch(_) {
      e = new ApiError(await r.text(), r.status);
    }
    throw e;
  }
  return await r.json();
}

async function apiGet(route, args) {
  const r = await fetch(baseUrl + route, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    ...(args || {})
  });
  return await apiResolve(r);
}

async function apiPost(route, data, args) {
  const r = await fetch(baseUrl + route, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    ...(args || {})
  });
  return await apiResolve(r);
}

async function apiDelete(route, args) {
  const r = await fetch(baseUrl + route, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    ...(args || {})
  });
  return apiResolve(r);
}

async function apiPatch(route, data, args) {
  const r = await fetch(baseUrl + route, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    ...(args || {})
  });
  return await apiResolve(r);
}

const univChooserProps = universities => ({
  style: { width: 200 },
  placeholder: "Enter a university",
  filterOption: (inputValue, university) => {
    let a = university.name.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
    let b = university.shortName.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
    return a || b;
  },
  options: universities
});

const univChooserRule = (universities) => {
  return ({ getFieldValue }) => ({
    validator(rule, value) {
      const university = universities.find(x => x.shortName === value);
      if (university !== undefined) {
        return Promise.resolve();
      }
      return Promise.reject('Please select a university.');
    },
  });
}

function getUniversityOptions() {
  return apiGet('/university').then(d => d.map(v => ({ value: v.shortName, label: v.name, ...v })));
}

function UniversityCreator() {
  const history = useHistory();
  function onFinish(university) {
    apiPost('/university', university).then(t => {
      history.push('/')
    })
  }
  return <Card style={cardShadow} title='Add a University'>
    <Form
      {...layout}
      onFinish={onFinish}
    >
      <Form.Item
        label="Full Name"
        name="name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Short Name"
        name="shortName"
        rules={[{ required: true, message: 'Please enter a short name (something like UIUC)' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Website"
        name="website"
        rules={[{ required: false }]}
      >
        <Input />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Add University
          </Button>
      </Form.Item>
    </Form>
  </Card>;
}

function UniversityUpdator() {
  const [universities, setUniversities] = useState([]);
  const history = useHistory();

  useEffect(() => {
    getUniversityOptions().then(u => setUniversities(u));
  }, [])
  const onFinish = university => {
    const url = '/university/' + university.universityShortName;
    delete university.universityShortName;
    apiPatch(url, university, {}).then(t => {
      history.push('/')
    });
  };
  const [form] = Form.useForm();
  return <Card style={cardShadow} title='Add a University'>
    <Form
      {...layout}
      form={form}
      onFinish={onFinish}
    >
      <Form.Item
        label="University Identifier (Short Name)"
        name="universityShortName"
        rules={[{ required: true }, univChooserRule(universities)]}
      >
        <AutoComplete
          {...univChooserProps(universities)}
          onChange={shortName => {
            const match = universities.find(u => u.shortName === shortName);
            if (match !== undefined) {
              form.setFieldsValue({ name: match.name, shortName: match.shortName, website: match.website || '' });
            }
          }}
        />
      </Form.Item>

      <Form.Item
        label="Full Name"
        name="name"
        rules={[{ required: false }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Short Name"
        name="shortName"
        rules={[{ required: false }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Website"
        name="website"
        rules={[{ required: false }]}
      >
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

function UniversityDeletor() {
  const history = useHistory();
  const onFinish = university => {
    apiDelete('/university/' + university.shortName).then(t => {
      history.push('/');
    })
  };
  return <Card style={cardShadow} title='Add a University'>
    <Form
      {...layout}
      onFinish={onFinish}
    >
      <Form.Item
        label="University Identifier (Short Name)"
        name="shortName"
        rules={[{ required: true }]}
      >
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

function AccountCreator() {
  const history = useHistory();
  const [error, setError] = useState('');
  const [emailErrorState, setEmailErrorState] = useState('');
  const [form] = Form.useForm();
  function onFinish(account) {
    const entry = Object.fromEntries(
      Object.entries(account).filter(
        ([key, _]) => !key.startsWith('_')
      )
    );
    apiPost('/account', entry).then(account => {
      cookies.set('accountID', account.id.toString(), { path: '/', maxAge: 60 * 60 * 24 * 7 });
      history.push('/');
    }).catch(e => {
      if (e.status === 409) {
        setError({field: 'email', value: entry.email});
        setEmailErrorState(true);
      }
    })
  };
  return <Card style={cardShadow} title='Create an account'>
    <Form
      {...layout}
      onFinish={onFinish}
      form={form}
    >
      <Form.Item
        label="Full Name"
        name="name"
        rules={[{ required: false }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        validateStatus={emailErrorState ? 'error' : 'success'}
        help={emailErrorState ? 'Email already taken.' : undefined}
        rules={[{ type: 'email', required: true }]}
      >
        <Input onChange={e => {
          setEmailErrorState(error.field === 'email' && error.value === e.target.value);
        }}/>
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please enter a short name (something like UIUC)' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="_confirm"
        label="Confirm Password"
        dependencies={['password']}
        hasFeedback
        rules={[
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
        ]}
      >
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

function MainPageRenderer() {
  const [universities, setUniversities] = useState([]);
  useEffect(() => {
    getUniversityOptions().then(u => setUniversities(u));
  }, []);
  return <>
    <Link to='/'><h1>Courator</h1></Link>
    <Row gutter={[20, 20]} type='flex' justify='center' align='top'>

      <Col sm={24} xs={24}>
        {cookies.get('accountID') === undefined ? <>
          <p>You don't have an account.</p>
          <Link to='/createAccount'><Button>Create an Account</Button></Link>
        </> : <>
            <h2>Choose a University</h2>
            <AutoComplete {...univChooserProps(universities)} />
            <br />
            <br />
            <Link to='/addUniversity'><Button>Add a New University</Button></Link>&nbsp;&nbsp;&nbsp;&nbsp;
              <Link to='/deleteUniversity'><Button>Delete a University</Button></Link>&nbsp;&nbsp;&nbsp;&nbsp;
              <Link to='/updateUniversity'><Button>Update a University</Button></Link>
            <br />
            <br />
            <Row gutter={[20, 20]} type='flex' justify='center' align='top'>
              {['ABC', 'XYZ', 'JKL', 'OMN', 'TUV', 'DEF', 'GHI'].map(name => (
                <Col sm={12} xs={24}>
                  <Card style={cardShadow} title={'Course ' + name}>
                    <Skeleton />
                  </Card>
                </Col>
              ))}
            </Row>
          </>}
      </Col>
    </Row>
  </>;
}

function App() {
  const location = useLocation();
  return <Layout className="layout">
    <Header>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[{ '/': 'home' }[location.pathname]]}
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item><Link to='/'><img src='logo192.png' style={{ height: 48 }} alt='logo' /></Link></Menu.Item>
        <Menu.Item><Link to='/'>Courator</Link></Menu.Item>
        <Menu.Item key="home"><a href="/#">Home</a></Menu.Item>
      </Menu>
    </Header>
    <div className='site-header-padder' />
    <Content className='site-content'>
      <div style={{ background: '#fff', padding: 24, minHeight: 280, height: '100%' }}>
        <Switch>
          <Route exact path='/' component={() => <MainPageRenderer />} />
          <Route exact path='/addUniversity' component={() => <UniversityCreator />} />
          <Route exact path='/deleteUniversity' component={() => <UniversityDeletor />} />
          <Route exact path='/updateUniversity' component={() => <UniversityUpdator />} />
          <Route exact path='/createAccount' component={() => <AccountCreator />} />
        </Switch>
      </div>
    </Content>

    <div className='site-footer-padder' />
    <Footer style={{ textAlign: 'center' }}>
      Copyright © 2020 Courator
    </Footer>
  </Layout>;
}

export default App;
