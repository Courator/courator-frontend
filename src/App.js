import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './App.css'
import { withRouter } from 'react-router-dom';
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
const baseUrl = process.env.COURATOR_API_URL || '';

async function apiGet(route, args) {
  const r = await fetch(baseUrl + route, {
    method: 'get',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    ...fetch(args || {})
  });
  return await r.json();
}

async function apiPost(route, data, args) {
  const r = await fetch(baseUrl + route, {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    ...fetch(args || {})
  });
  return r.json();
}

async function apiDelete(route, args) {
  const r = await fetch(baseUrl + route, {
    method: 'delete',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    ...fetch(args || {})
  });
  return r.json();
}

async function apiPatch(route, data, args) {
  const r = await fetch(baseUrl + route, {
    method: 'patch',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    ...fetch(args || {})
  });
  return r.json();
}

class UniversityChooser extends Component {
  state = { universities: [] };

  componentDidMount() {
    apiGet('/university').then(d => {
      this.setState({ universities: d.map(v => ({ value: v.shortName, label: v.name, ...v })) });
    });
  }

  render() {
    return <AutoComplete
      style={{ width: 200 }}
      options={this.state.universities}
      placeholder="Enter a university"
      filterOption={(inputValue, university) => {
        let a = university.name.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
        let b = university.shortName.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
        return a || b;
      }
      }
    />;
  }
}

class _UniversityCreator extends Component {
  onFinish = university => {
    apiPost('/university', university).then(t => {
      this.props.history.push('/')
    })
  }
  render() {
    return <Card style={cardShadow} title='Add a University'>
      <Form
        {...layout}
        onFinish={this.onFinish}
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
}

const UniversityCreator = withRouter(_UniversityCreator);

class _UniversityUpdator extends Component {
  onFinish = university => {
    apiPatch('/university/' + university.universityShortName, university, {}).then(t => {
      this.props.history.push('/')
    })
  }
  render() {
    return <Card style={cardShadow} title='Add a University'>
      <Form
        {...layout}
        onFinish={this.onFinish}
      >
        <Form.Item
          label="University Identifier (Short Name)"
          name="universityShortName"
          rules={[{ required: true }]}
        >
          <Input />
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
}

const UniversityUpdator = withRouter(_UniversityUpdator);

class _UniversityDeletor extends Component {
  onFinish = university => {
    apiDelete('/university/' + university.shortName).then(t => {
      this.props.history.push('/')
    })
  }
  render() {
    return <Card style={cardShadow} title='Add a University'>
      <Form
        {...layout}
        onFinish={this.onFinish}
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
}

const UniversityDeletor = withRouter(_UniversityDeletor);

class _AccountCreator extends Component {
  onFinish = account => {
    apiPost('/account', account).then(account => {
      cookies.set('accountID', account.id.toString(), { path: '/', maxAge: 60 * 60 * 24 * 7 });
      this.props.history.push('/');
    })
  }
  render() {
    return <Card style={cardShadow} title='Create an account'>
      <Form
        {...layout}
        onFinish={this.onFinish}
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
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter a short name (something like UIUC)' }]}
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
}

const AccountCreator = withRouter(_AccountCreator);

class MainPageRenderer extends Component {
  render() {
    return <>
      <Link to='/'><h1>Courator</h1></Link>
      <Row gutter={[20, 20]} type='flex' justify='center' align='top'>

        <Col sm={24} xs={24}>
          {cookies.get('accountID') === undefined ? <>
            <p>You don't have an account.</p>
            <Link to='/createAccount'><Button>Create an Account</Button></Link>
          </> : <>
              <h2>Choose a University</h2>
              <UniversityChooser />
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
    </>
  }
}

class App extends Component {
  render() {
    return (
      <Layout className="layout">
        <Header>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[{ '/': 'home' }[this.props.location.pathname]]}
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
      </Layout>
    );
  }
}

export default withRouter(App);
