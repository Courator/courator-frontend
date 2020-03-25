import React, {Component} from 'react'
import {Switch, Route} from 'react-router-dom'
import {Link} from 'react-router-dom'
import './App.css'
import {withRouter} from 'react-router-dom';

import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Skeleton,
} from 'antd';

const {Header, Content, Footer} = Layout;

const cardShadow = {WebkitBoxShadow: '1px 1px 10px #eee', boxShadow: '1px 1px 10px #eee'};

class MainPageRenderer extends Component {
  render() {
    return <>
      <Link to='/'><h1>Courator</h1></Link>
      <Row gutter={[20, 20]} type='flex' justify='center' align='top'>
        {['ABC', 'XYZ', 'JKL', 'OMN', 'TUV', 'DEF', 'GHI'].map(name => (
          <Col sm={12} xs={24}>
            <Card style={cardShadow} title={'Course ' + name}>
              <Skeleton/>
            </Card>
          </Col>
        ))}
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
            selectedKeys={[{'/': 'home'}[this.props.location.pathname]]}
            style={{lineHeight: '64px'}}
          >
            <Menu.Item><img src='logo192.png' style={{height: 48}} alt='logo'/></Menu.Item>
            <Menu.Item>Courator</Menu.Item>
            <Menu.Item key="home"><a href="/#">Home</a></Menu.Item>
          </Menu>
        </Header>
        <div className='site-header-padder'/>
        <Content className='site-content'>
          <div style={{background: '#fff', padding: 24, minHeight: 280, height: '100%'}}>
            <Switch>
              <Route exact path='/' component={() => <MainPageRenderer/>}/>
            </Switch>
          </div>
        </Content>
        <div className='site-footer-padder'/>
        <Footer style={{textAlign: 'center'}}>
          Copyright © 2020 Courator
        </Footer>
      </Layout>
    );
  }
}

export default withRouter(App);