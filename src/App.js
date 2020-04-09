import React, {Component} from 'react'
import {Switch, Route} from 'react-router-dom'
import {Link} from 'react-router-dom'
import './App.css'
import {withRouter} from 'react-router-dom';
import { Input,Button} from 'antd';

import { UserOutlined } from '@ant-design/icons';
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

const { Search } = Input;
class MainPageRenderer extends Component {
  render() {
    return <>
      <Link to='/'><h1>Courator</h1></Link>
      <Row gutter={[20, 20]} type='flex' justify='center' align='top'>
        
          <Col sm={24} xs={24}>
            <div className="example-input">
			    <h2>Add a Course</h2>
			    <Input size="large" placeholder="Course Title" prefix={<UserOutlined />} />
			    <Input size = "large" placeholder="Course Number" prefix={<UserOutlined />} />
			    <Input size="large" placeholder="Instructor" prefix={<UserOutlined />} />
			    <Button type="primary" htmlType="submit">
          			Submit
        		</Button>
			</div>
			<div className="example-input">
			    <h2>Update a Course</h2>
			    <Input size="large" placeholder="Course Title" prefix={<UserOutlined />} />
			    <Input size = "large" placeholder="Course Number" prefix={<UserOutlined />} />
			    <Input size="large" placeholder="Instructor" prefix={<UserOutlined />} />
			    <Button type="primary" htmlType="submit">
          			Submit
        		</Button>
			</div>
			<div>
			    <h2>Search a Course using Course Title</h2>
			    <Search
			      placeholder="Search a Course Title"
			      onSearch={value => console.log(value)}
			      style={{ width: 200 }}
			    />
			    <Card title="Course title" bordered={false} style={{ width: 300 }}>
			      <p>Course Number</p>
			      <p>Instructor</p>
			    </Card>
			    <h2>Search a Course using Course number</h2>
			    <Search
			      placeholder="Search a Course Number"
			      onSearch={value => console.log(value)}
			      style={{ width: 200 }}
			    />
			    <Card title="Course Number" bordered={false} style={{ width: 300 }}>
			      <p>Course Title</p>
			      <p>Instructor</p>
			    </Card>
			</div>
			<div className="example-input">
				<h2>Delete a course</h2>
				<Input size="large" placeholder="Course Number" prefix={<UserOutlined />} />
				<Button type="primary" htmlType="submit">
          			Submit
        		</Button>
			</div>
			
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
