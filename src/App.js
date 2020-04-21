import React from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './App.css'

import {
  Layout,
  Menu
} from 'antd';

import { UniversityCreator } from './university/UniversityCreator';
import { UniversityUpdator } from './university/UniversityUpdator';
import { UniversityDeletor } from './university/UniversityDeletor';
import { AccountCreator } from './AccountCreator';
import { MainPageRenderer } from './MainPageRenderer';

const { Header, Content, Footer } = Layout;

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
