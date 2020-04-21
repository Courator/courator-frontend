import React from 'react';
import { useHistory } from 'react-router-dom';
import { Input, Button, Card, Form } from 'antd';
import { apiPost } from '../api';
import { cardShadow, layout, tailLayout } from "../format";

export function UniversityCreator() {
    const history = useHistory();
    function onFinish(university) {
        apiPost('/university', university).then(t => {
            history.push('/');
        });
    }
    return <Card style={cardShadow} title='Add a University'>
        <Form {...layout} onFinish={onFinish}>
            <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Short Name" name="shortName" rules={[{ required: true, message: 'Please enter a short name (something like UIUC)' }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Website" name="website" rules={[{ required: false }]}>
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
