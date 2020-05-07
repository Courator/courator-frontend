import React, { useEffect, useState } from 'react'
import { Switch, Route, useLocation, Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './App.css'

import {
  Layout,
  Menu,
  Row,
  Col,
  message,
  Progress,
} from 'antd';

import { AccountCreator } from './AccountCreator';
import { UniversitiesPage } from './university/UniversitiesPage';
import { CoursesPage } from './course/CoursesPage';
import { cookies } from './util';
import { apiFetch, apiGet } from './apiBase';
import { isLoggedIn } from './api';
import { LoginModal } from './LoginModal';
import { CoursePage } from './course/CoursePage';

const { Header, Content, Footer } = Layout;


const CorrelationPage = () => {
  const [correlations, setCorrelations] = useState([]);
  const [attributes, setAttributes] = useState([]);
  useEffect(() => {
    apiFetch('/ratingCorrelation').then(c => setCorrelations(c));
    apiGet('/ratingAttribute', {auth: false}).then(v => setAttributes(v));
  }, [])
  const smallest = Math.min(...correlations.map(x => x.correlation));
  const largest = Math.max(...correlations.map(x => x.correlation));
  const range = largest - smallest;
  return <Row justify='center'><Col sm={12} xs={24} lg={8}>
    <h1>Estimated Rating Preferences</h1>
    <p>This tool attempts to estimate the types of courses you like by calculating the correlation between various attributes and your overall rating of each course. The numbers shown below are the correlation coefficients between each of these attributes.</p>
    {correlations.map(c => <>
  {(attributes.filter(x => x.id === c.attrID)[0] || {}).name}: <Progress size='small' percent={10 + 80 * (c.correlation - smallest) / range} format={() => c.correlation.toFixed(2)}/>
  <br/>
  </>)}</Col></Row>
};


function App() {
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  function updateAccountToken() {
    if (isLoggedIn()) {
      apiFetch('/account').catch(e => {
        if (e.status === 401) {
          cookies.remove('accountToken');
          if (loggedIn) {
            setLoggedIn(false);
          }
        } else {
          throw e;
        }
      }).then(() => {
        if (!loggedIn) {
          setLoggedIn(true);
        }
      });
    } else if (loggedIn) {
      setLoggedIn(false);
    }
  }
  useEffect(updateAccountToken, []);
  return <Layout>
    <Header>
      <Row style={{ flexFlow: 'row nowrap', height: 64 }}>
        <Col xs={24} sm={24} md={6} lg={6} xl={5} xxl={4}>
          <h1 style={{ height: 64 }}>
            <div style={{ height: 64, lineHeight: '64px' }}>
              <img src='logo192.png' style={{ height: 48, verticalAlign: 'middle', borderStyle: 'none', paddingLeft: 40, paddingRight: 16, overflow: 'hidden' }} alt='logo' />
              <a href='/' style={{ color: 'white' }}>
                Courator
            </a>
            </div>
          </h1>
        </Col>
        <Col xs={0} sm={0} md={18} lg={18} xl={19} xxl={20}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[{ '/': 'home' }[location.pathname]]}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item><Link to='/'>Courator</Link></Menu.Item>
            <Menu.Item key="home"><a href="/#">Home</a></Menu.Item>
            {!loggedIn ?
              <>
                <Menu.Item
                  key="login" style={{ float: 'right', cursor: 'pointer' }}
                  onClick={() => setLoginOpen(true)} onItemHover={() => { }}
                >Login</Menu.Item>
                <LoginModal
                  visible={loginOpen}
                  onLogin={updateAccountToken}
                  onCancel={() => {
                    setLoginOpen(false);
                  }}
                  setLoggedIn={setLoggedIn}
                />
              </> :
              <Menu.Item key="logout" style={{ float: 'right' }} onClick={() => {
                cookies.remove('accountToken');
                message.info('Successfully logged out');
                setLoginOpen(false);
                setLoggedIn(false);
              }}>Logout</Menu.Item>
            }
          </Menu>
        </Col>
      </Row>

    </Header>
    <div className='site-header-padder' />
    <Content className='site-content'>
      <div style={{ background: '#fff', padding: 24, minHeight: 280, height: '100%' }}>
        <Switch>
          <Route exact path='/' component={() => <UniversitiesPage />} />  {/* TODO: Replace with home page */}
          <Route exact path='/university' component={() => <UniversitiesPage />} />
          <Route exact path='/university/:university' component={({ match }) => <Redirect to={`/university/${match.params.university}/course`} />} />
          <Route exact path='/university/:university/course' component={({ match }) => {
            return <CoursesPage universityCode={match.params.university} />;
          }} />
          <Route exact path='/university/:university/course/:course' component={({ match }) => {
            return <CoursePage universityCode={match.params.university} courseCode={match.params.course} />;
          }} />
          <Route exact path='/account/correlation' component={() => {
            return <CorrelationPage />;
          }} />
          <Route exact path='/register' component={() => <AccountCreator />} />
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
