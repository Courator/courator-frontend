import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Row, Col, AutoComplete, Skeleton } from 'antd';
import { getUniversityOptions, univChooserProps } from './university/university';
import { cookies } from "./util";
import { cardShadow } from "./format";

export function MainPageRenderer() {
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
              {['ABC', 'XYZ', 'JKL', 'OMN', 'TUV', 'DEF', 'GHI'].map(name => (<Col sm={12} xs={24}>
                <Card style={cardShadow} title={'Course ' + name}>
                  <Skeleton />
                </Card>
              </Col>))}
            </Row>
          </>}
      </Col>
    </Row>
  </>;
}
