import React, { useEffect, useState, useRef } from 'react';
import { Button, PageHeader, Tag, Modal, Rate, AutoComplete, Tooltip, Form, InputNumber, Input } from 'antd';
import { apiGet } from '../apiBase';
import { formatCourseName } from '../format';
import { xbr2x, xbr3x } from 'xbr-js';

import { GlobalOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';

function convertUriToImageData(URI) {
  return new Promise(function (resolve, reject) {
    if (URI == null) return reject();
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      image = new Image();
    image.addEventListener('load', function () {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    }, false);
    image.src = URI;
  });
}

function imageDataToDataUrl(imagedata) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);
  return canvas.toDataURL();
}

async function upscaledImageUrl(imageUrl) {
  const d = await convertUriToImageData(imageUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let scale = 1;
  let scaler = undefined;
  const minDim = Math.min(d.width, d.height);
  if (minDim <= 12) {
    scale = 3;
    scaler = xbr3x;
  } else if (minDim <= 16) {
    scale = 2;
    scaler = xbr2x;
  }
  if (scaler === undefined) {
    throw Error('Already upscaled');
  }

  canvas.width = d.width * scale;
  canvas.height = d.height * scale;
  const originalPixelView = new Uint32Array(d.data.buffer);
  const scaledPixelView = scaler(originalPixelView, d.width, d.height);
  const scaledImageData = context.createImageData(canvas.width, canvas.height);
  scaledImageData.data.set(new Uint8ClampedArray(scaledPixelView.buffer));
  const dataUrl = imageDataToDataUrl(scaledImageData);
  return dataUrl;
}

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({ form, visible }) => {
  const prevVisibleRef = useRef();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;
  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible, prevVisible, form]);
};

const ModalForm = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  useResetFormOnCloseModal({
    form,
    visible,
  });

  return (
    <Modal
      title='Add rating attribute'
      visible={visible}
      maskClosable={false}
      onOk={() => form.submit()}
      onCancel={onCancel}
      width={400}
      style={{ textAlign: 'center', top: 184 }}
    >
      <Form form={form} layout="vertical" name="userForm">
        <Form.Item
          name="name"
          label="User Name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="age"
          label="User Age"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export function CoursePage({ universityCode, courseCode }) {
  const [course, setCourse] = useState({});
  const [metadata, setMetadata] = useState({});
  const [rateVisible, setRateVisible] = useState(false);
  const [rateAddAttrVisible, setRateAddAttrVisible] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([
    { name: 'Difficulty', description: 'How hard you found the course', id: 1 },
    { name: 'Curriculum', description: 'How well the course was layed out', id: 2 },
    { name: 'Usefulness', description: 'How applicable the course is to the real world', id: 3 }
  ]);
  const [availableAttributes, setAvailableAttributes] = useState([
    { name: 'Fun', description: 'How fun the class was', id: 15 },
    { name: 'Tedious', description: 'How tedious the class was', id: 16 },
    { name: 'Time Consuming', description: 'Amount of time required for class', id: 17 },
    { name: 'Rewarding', description: 'How rewarding the class was', id: 18 },
  ])
  const [searchVal, setSearchVal] = useState('');
  const [form] = Form.useForm();
  useEffect(() => {
    apiGet(`/university/${universityCode}/course/${courseCode}`, { auth: false }).then(c => setCourse(c));
    apiGet(`/university/${universityCode}/course/${courseCode}/metadata`, { auth: false }).then(({ catalogUrl, websiteUrl, iconUrl }) => {
      setMetadata({ catalogUrl, websiteUrl, iconUrl })
      upscaledImageUrl(iconUrl).then(iconUrl => {
        setMetadata(m => ({ ...m, iconUrl }));
      }).catch(() => { });
    })
  }, [courseCode, universityCode]);
  const extra = [];
  if (metadata.websiteUrl) {
    extra.push(<Button key="website"><a target='_blank' rel="noopener noreferrer" href={metadata.websiteUrl}>Website</a></Button>)
  }
  if (metadata.catalogUrl) {
    extra.push(<Button key="info"><a target='_blank' rel="noopener noreferrer" href={metadata.catalogUrl}>More Info</a></Button>)
  }
  extra.push(<div key="extra" style={{ display: 'inline-block' }}>
    <Button key="rate" type="primary" onClick={() => setRateVisible(true)}>Rate</Button>
    <Modal
      title={null}
      visible={rateVisible}
      maskClosable={false}
      onOk={() => form.submit()}
      onCancel={() => setRateVisible(false)}
      style={{ textAlign: 'center' }}
    >
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === 'userForm') {
            const { basicForm } = forms;
            const users = basicForm.getFieldValue('users') || [];
            basicForm.setFieldsValue({
              users: [...users, values],
            });
            setRateVisible(false);
          }
        }}
      >
        <Form form={form} name="basicForm" onFinish={x => { console.log('FORM A:', x); }}>
          <h1>{`Rate ${formatCourseName(courseCode, course.title)}`}</h1>
          <div style={{ fontSize: 35, display: 'inline-block', paddingBottom: 10 }}>
            <Form.Item
              name="overall"
              label={null}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Rate style={{ fontSize: 35 }} />
            </Form.Item>
          </div>
          <table style={{ textAlign: 'right', margin: '0 auto' }}>
            <tbody>
              <Form.Item
                label="User List"
                shouldUpdate={(prevValues, curValues) => prevValues.attributes !== curValues.attributes}
              >
                {({ getFieldValue, setFieldsValue }) => {
                  const attributes = getFieldValue('attributes') || [];
                  return <>
                    {attributes.map(ratingAttribute => {
                      return <Tooltip placement='left' title={ratingAttribute.description} key={ratingAttribute.id} ><tr style={{ height: '35px' }}>
                        <td style={{ paddingRight: '5px' }}>{ratingAttribute.name}:</td>
                        <td style={{ height: '35px' }}><Rate style={{ height: '35px' }} /></td>
                        <td style={{ display: 'inline-flex', paddingLeft: 10, justifyContent: 'center', alignItems: 'center', height: '35px' }}>
                          <Button type='dashed' icon={<CloseOutlined />} onClick={() => {
                            setFieldsValue({attributes: attributes.filter(x => x.id !== ratingAttribute.id)})
                            setAvailableAttributes(attrs => [...attrs, ratingAttribute]);
                          }} />
                        </td></tr></Tooltip>
                    })}
                    <tr>
                      <td colSpan={3}>
                        <ModalForm visible={rateAddAttrVisible} onCancel={() => setRateAddAttrVisible(false)} />
                        <Button type='dashed' block icon={<PlusOutlined />} onClick={() => setRateAddAttrVisible(true)} />
                      </td>
                    </tr>
                  </>;
                }}
              </Form.Item>
            </tbody>
          </table><br />
          <div style={{ margin: '0 auto', width: 200 }}>
            <AutoComplete placeholder='Find rating attribute' style={{
              width: 200
            }} value={searchVal} options={availableAttributes.map(x => ({ value: x.name, ...x }))} onSelect={(value, option) => {
              setAvailableAttributes(attributes => attributes.filter(x => x.id !== option.id));
              form.setFieldsValue({attributes: [...form.getFieldValue('attributes'), { name: option.value, id: option.id }]});
              setSearchVal('');
            }} onChange={v => {
              setSearchVal(v);
            }} />
          </div>
        </Form>
      </Form.Provider>
    </Modal>
  </div>);
  return <>
    <PageHeader title={formatCourseName(courseCode, course.title)} className="site-page-header" tags={<Tag color="blue">Fall 2020</Tag>} extra={extra}
      avatar={{ shape: 'square', ...(metadata.iconUrl ? { src: metadata.iconUrl } : { icon: <GlobalOutlined /> }) }} breadcrumb={{
        routes: [
          {
            path: '/university',
            breadcrumbName: 'Universities',
          },
          {
            path: '/' + universityCode,
            breadcrumbName: universityCode,
          },
          {
            path: '/course',
            breadcrumbName: 'Courses',
          },
          {
            path: '/' + courseCode,
            breadcrumbName: courseCode,
          }
        ]
      }}>
      {course.description}
    </PageHeader>
  </>;
}
